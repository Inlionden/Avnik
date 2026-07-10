"""🧭 Helmsman as a real LangGraph StateGraph.

The ReAct loop becomes an explicit graph:

  regulate → track → route ─(conditional)→ [10 lead agent nodes] → chain ─(conditional)→ mentor → observe → END

Every agent is a node; routing and chaining are conditional edges. This is the
same behavior as the hand-rolled orchestrator, but now inspectable/visualizable
as a graph (graph.get_graph().draw_mermaid()).
"""
import re
from typing import TypedDict, Optional, List, Dict, Any

# Compatibility shim: LangGraph 0.2.x + langchain-core read `langchain.debug`,
# an attribute removed in langchain v1. If a newer langchain is installed
# machine-wide (for other projects), provide the missing flags so we don't have
# to downgrade the user's global install. Non-destructive — only sets if absent.
try:  # pragma: no cover
    import langchain as _lc
    for _attr in ("debug", "verbose"):
        if not hasattr(_lc, _attr):
            setattr(_lc, _attr, False)
    if not hasattr(_lc, "llm_cache"):
        _lc.llm_cache = None
except Exception:
    pass

from langgraph.graph import StateGraph, START, END

from .llm import chat
from .models import CurrentState, now_ms
from .regulator import run_regulator
from .tracker import passive_belief_update
from .state import add_to_trail
from .mentor import apply_mentor, sanitize_reply
from .agents.tone import tone_selector
from .agents.north_star import north_star
from .agents.quartermaster import quartermaster, pacer
from .agents.oracle import oracle, root_cause
from .agents.simple import auditor, chronicler, archivist, courier, promptsmith
from .agents.sentinel import sentinel

ROUTES = ["tone", "north-star", "quartermaster", "oracle", "auditor",
          "chronicler", "sentinel", "archivist", "courier", "promptsmith"]

# Node name (graph-safe, no hyphens) → agent coroutine/callable
LEAD_AGENTS = {
    "tone": tone_selector,
    "north_star": north_star,
    "quartermaster": quartermaster,
    "oracle": oracle,
    "auditor": auditor,
    "chronicler": chronicler,
    "sentinel": sentinel,
    "archivist": archivist,
    "courier": courier,
    "promptsmith": promptsmith,
}
_SYNC = {"archivist", "courier"}


def _node(route: str) -> str:
    return route.replace("-", "_")


ROUTING_SYSTEM = """You are Helmsman, the orchestrator of Avnik's agent network.
Classify the user's message into exactly one agent name.
- tone: emotional support, venting, mood-based conversation
- north-star: prioritization, planning, "plan my day", life goals
- quartermaster: work technique, timer, Pomodoro, triage, contracts, "just start it"
- oracle: "why do I keep...", root cause, patterns
- auditor: "how am I doing?", review, honest feedback
- chronicler: recap, board meeting, daily anchor, future self
- sentinel: sleep, location, silence, "I just woke up"
- archivist: "remember this", "save"
- courier: "what's my current state?"
- promptsmith: "that was wrong", meta-feedback
Output ONLY the agent name. Just the word."""


class GraphState(TypedDict, total=False):
    # inputs
    input: str
    messages: List[Dict[str, Any]]
    profile: Any
    beliefs: Any
    tasks: List[Any]
    events: List[Any]
    state: CurrentState
    mode: str
    # working
    route: str
    primary_text: str
    primary_agent: str
    primary_side_effects: List[Dict[str, Any]]
    chained_text: Optional[str]
    chained_agent: Optional[str]
    chained_side_effects: List[Dict[str, Any]]
    # outputs
    reply: str
    final_agent: str
    final_route: str
    side_effects: List[Dict[str, Any]]
    out_beliefs: Optional[Dict[str, Any]]


# ── Nodes ────────────────────────────────────────────────────────────────────
def regulate_node(s: GraphState) -> GraphState:
    s["state"] = run_regulator(s["state"], s["input"])
    return s


def track_node(s: GraphState) -> GraphState:
    prior = s["beliefs"].model_dump() if s.get("beliefs") else None
    tracked = passive_belief_update(s["input"], prior)
    if tracked:
        beliefs, _ = tracked
        from .models import BeliefState
        s["beliefs"] = BeliefState(**beliefs)
        s["out_beliefs"] = beliefs
    return s


async def route_node(s: GraphState) -> GraphState:
    text = s["input"]
    m = re.match(r"^\[ROUTE_TO:([a-z-]+)\]", text, re.IGNORECASE)
    if m and m.group(1).lower() in ROUTES:
        s["route"] = m.group(1).lower()
    else:
        try:
            msg = f'User message: "{text}"\nMood: {s["state"].mood} | Phase: {s["state"].phase}'
            r = await chat([{"role": "user", "content": msg}], system=ROUTING_SYSTEM, temperature=0.2, raw=True)
            name = r.strip().lower()
            s["route"] = name if name in ROUTES else "tone"
        except Exception:
            s["route"] = "tone"
    # strip the hint so it never reaches the agent
    s["input"] = re.sub(r"^\[ROUTE_TO:[a-z-]+\]\s*", "", text, flags=re.IGNORECASE)
    return s


def _make_ctx(s: GraphState):
    from .models import HelmContext
    return HelmContext(
        input=s["input"], messages=s["messages"], profile=s.get("profile"),
        beliefs=s.get("beliefs"), tasks=s.get("tasks", []), events=s.get("events", []),
        state=s["state"],
    )


def _make_agent_node(node_name: str):
    fn = LEAD_AGENTS[node_name]

    async def agent_node(s: GraphState) -> GraphState:
        ctx = _make_ctx(s)
        result = fn(ctx) if node_name in _SYNC else await fn(ctx)
        # Mentor quality layer
        fitted = await apply_mentor(result.text, result.agent, s.get("mode", "chat"))
        s["primary_text"] = fitted
        s["primary_agent"] = result.agent
        s["primary_side_effects"] = list(result.sideEffects)
        if result.beliefs:
            s["out_beliefs"] = result.beliefs
        return s

    return agent_node


async def chain_node(s: GraphState) -> GraphState:
    """A second specialist finishes what the first started."""
    s["chained_text"] = None
    s["chained_agent"] = None
    s["chained_side_effects"] = []
    ctx = _make_ctx(s)
    route = s["route"]
    se_types = {e.get("type") for e in s.get("primary_side_effects", [])}
    try:
        if route == "north-star" and "task_created" in se_types:
            follow = await pacer(ctx)
            s["chained_text"] = sanitize_reply(follow.text)
            s["chained_agent"] = follow.agent
            s["chained_side_effects"] = list(follow.sideEffects)
        elif route == "oracle" and re.search(r"fear|perfection|clarity|distract|burnout|confidence", s["primary_text"], re.I):
            from .agents.quartermaster import starter
            follow = await starter(ctx)
            s["chained_text"] = sanitize_reply(follow.text)
            s["chained_agent"] = follow.agent
            s["chained_side_effects"] = list(follow.sideEffects)
    except Exception:
        pass
    return s


def observe_node(s: GraphState) -> GraphState:
    s["state"] = add_to_trail(s["state"], s["primary_agent"], s["primary_text"])
    if s.get("chained_agent"):
        s["state"] = add_to_trail(s["state"], s["chained_agent"], s["chained_text"] or "")
    if s.get("chained_text"):
        s["reply"] = f'{s["primary_text"]}\n\n↳ {s["chained_text"]}'
        s["final_route"] = f'{s["route"]}+{s["chained_agent"]}'
    else:
        s["reply"] = s["primary_text"]
        s["final_route"] = s["route"]
    s["final_agent"] = s["primary_agent"]
    s["side_effects"] = list(s.get("primary_side_effects", [])) + list(s.get("chained_side_effects", []))
    return s


# ── Build the graph ──────────────────────────────────────────────────────────
def _build():
    g = StateGraph(GraphState)
    g.add_node("regulate", regulate_node)
    g.add_node("track", track_node)
    g.add_node("router", route_node)
    for node_name in LEAD_AGENTS:
        g.add_node(node_name, _make_agent_node(node_name))
    g.add_node("chain", chain_node)
    g.add_node("observe", observe_node)

    g.add_edge(START, "regulate")
    g.add_edge("regulate", "track")
    g.add_edge("track", "router")
    # conditional: router → the chosen lead agent node
    g.add_conditional_edges("router", lambda s: _node(s["route"]), {n: n for n in LEAD_AGENTS})
    # every lead agent → chain
    for node_name in LEAD_AGENTS:
        g.add_edge(node_name, "chain")
    g.add_edge("chain", "observe")
    g.add_edge("observe", END)
    return g.compile()


GRAPH = _build()


async def run_graph(req) -> dict:
    state = CurrentState(**(req.currentState or {}))
    state.lastUpdated = now_ms()
    init: GraphState = {
        "input": req.messages[-1].content if req.messages else "",
        "messages": [m.model_dump() for m in req.messages],
        "profile": req.profile,
        "beliefs": req.beliefs,
        "tasks": req.tasks,
        "events": req.events,
        "state": state,
        "mode": req.chatMode or "chat",
    }
    out = await GRAPH.ainvoke(init)
    return {
        "reply": out["reply"],
        "agent": out["final_agent"],
        "route": out["final_route"],
        "state": out["state"].model_dump(),
        "sideEffects": out.get("side_effects", []),
        "beliefs": out.get("out_beliefs"),
    }
