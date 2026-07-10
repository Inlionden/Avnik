"""🧭 Helmsman — the ReAct orchestrator. Route -> Act -> Chain -> Mentor -> Observe."""
import re
from typing import Optional
from .llm import chat
from .models import HelmContext, AgentResult, CurrentState, now_ms
from .state import regulate, add_to_trail
from .mentor import apply_mentor, sanitize_reply
from .agents.tone import tone_selector
from .agents.north_star import north_star
from .agents.quartermaster import pacer
from .agents.oracle import root_cause
from .agents.simple import (
    auditor, chronicler, sentinel, archivist, courier, promptsmith,
)

ROUTES = ["tone", "north-star", "quartermaster", "oracle", "auditor",
          "chronicler", "sentinel", "archivist", "courier", "promptsmith"]

AGENT_MAP = {
    "tone": tone_selector,
    "north-star": north_star,
    "quartermaster": pacer,
    "oracle": root_cause,
    "auditor": auditor,
    "chronicler": chronicler,
    "sentinel": sentinel,
    "archivist": archivist,
    "courier": courier,
    "promptsmith": promptsmith,
}

# Agents that are plain (sync) functions, not coroutines.
_SYNC = {"archivist", "courier"}

ROUTING_SYSTEM = """You are Helmsman, the orchestrator of Avnik's agent network.
Classify the user's message into exactly one agent name.

- tone: emotional support, venting, "I feel...", mood-based conversation
- north-star: prioritization, planning, "what should I do?", "plan my day", life goals
- quartermaster: work technique, timer, Pomodoro, "how long should I work?", focus
- oracle: "what patterns", "why do I keep...", root cause of being stuck
- auditor: "how am I doing?", weekly review, honest feedback, "grade me"
- chronicler: recap, "what have you done?", board meeting, daily anchor
- sentinel: sleep, location, silence, "I just woke up", wellness
- archivist: "remember this", "store", "save"
- courier: "what's my current state?", "give context"
- promptsmith: "that was wrong", meta-feedback on agent behavior

Output ONLY the agent name. No explanation. Just the word."""


async def _route(ctx: HelmContext) -> str:
    # explicit override hint
    m = re.match(r"^\[ROUTE_TO:([a-z-]+)\]", ctx.input, re.IGNORECASE)
    if m and m.group(1).lower() in ROUTES:
        return m.group(1).lower()
    try:
        msg = f'User message: "{ctx.input}"\nMood: {ctx.state.mood} | Phase: {ctx.state.phase}'
        result = await chat([{"role": "user", "content": msg}], system=ROUTING_SYSTEM, temperature=0.2, raw=True)
        name = result.strip().lower()
        return name if name in ROUTES else "tone"
    except Exception:
        return "tone"


async def _run_agent(name: str, ctx: HelmContext) -> AgentResult:
    fn = AGENT_MAP[name]
    if name in _SYNC:
        return fn(ctx)
    return await fn(ctx)


async def _run_chain(route_name: str, primary: AgentResult, ctx: HelmContext) -> Optional[AgentResult]:
    """A second specialist finishes what the first started (mirrors helmsman.ts)."""
    try:
        se_types = {e.get("type") for e in primary.sideEffects}
        if route_name == "north-star" and "task_created" in se_types:
            follow = await pacer(ctx)
            follow.text = sanitize_reply(follow.text)
            return follow
        if route_name == "oracle" and re.search(r"fear|perfection|clarity|distract|burnout|confidence", primary.text, re.IGNORECASE):
            from .agents.simple import sentinel  # noqa
            # Oracle -> Starter equivalent: ask Pacer for the smallest starting ritual
            follow = await pacer(HelmContext(**{**ctx.model_dump(), "input": "give me a 2-minute starting technique"}))
            follow.text = sanitize_reply(follow.text)
            return follow
    except Exception:
        return None
    return None


async def run_helmsman(req) -> dict:
    """req: ChatRequest. Returns the ChatResponse dict."""
    user_input = req.messages[-1].content if req.messages else ""

    # Build state from what the client sent.
    state = CurrentState(**(req.currentState or {}))
    state.lastUpdated = now_ms()

    ctx = HelmContext(
        input=user_input,
        messages=[m.model_dump() for m in req.messages],
        profile=req.profile,
        beliefs=req.beliefs,
        tasks=req.tasks,
        events=req.events,
        state=state,
    )

    # Step 1 — Regulate
    ctx.state = regulate(ctx.state, user_input)

    # Step 2 — Route
    route_name = await _route(ctx)
    ctx.input = re.sub(r"^\[ROUTE_TO:[a-z-]+\]\s*", "", ctx.input, flags=re.IGNORECASE)

    # Step 3 — Act
    raw_result = await _run_agent(route_name, ctx)

    # Step 3.5 — Mentor
    fitted = await apply_mentor(raw_result.text, raw_result.agent, req.chatMode or "chat")
    result = AgentResult(text=fitted, agent=raw_result.agent,
                         sideEffects=list(raw_result.sideEffects), beliefs=raw_result.beliefs)

    # Step 3.6 — Chain
    chained = await _run_chain(route_name, result, ctx)

    # Step 4 — Observe
    ctx.state = add_to_trail(ctx.state, result.agent, result.text)
    if chained:
        ctx.state = add_to_trail(ctx.state, chained.agent, chained.text)

    side_effects = list(result.sideEffects) + (list(chained.sideEffects) if chained else [])
    text = f"{result.text}\n\n↳ {chained.text}" if chained else result.text
    route = f"{route_name}+{chained.agent}" if chained else route_name

    return {
        "reply": text,
        "agent": result.agent,
        "route": route,
        "state": ctx.state.model_dump(),
        "sideEffects": side_effects,
        "beliefs": result.beliefs,
    }
