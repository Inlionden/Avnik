// 🧭 Helmsman — the ReAct orchestrator. Routes to the right agent every turn.
// Pattern: Reason (LLM classifies intent) → Act (run agent) → Observe (log trail)
import { chat } from "@/lib/ai";
import type { AgentContext } from "./registry";
import type { HelmContext, CurrentState } from "./state";
import { DEFAULT_STATE, addToTrail, patchState } from "./state";
import { runRegulator } from "./regulator";
import { passiveBeliefUpdate } from "./tracker";
import { applyMentor, type ChatMode } from "./conversation";
import { toneSelector } from "./tone/selector";
import { northStar } from "./north-star";
import { quartermaster } from "./quartermaster";
import { oracle } from "./oracle";
import { auditor } from "./auditor";
import { chronicler } from "./chronicler";
import { sentinel } from "./sentinel";
import { archivist } from "./archivist";
import { courier } from "./courier";
import { promptsmith } from "./promptsmith";
import type { AgentResult, Message, Profile, BeliefState, Task, Event } from "@/lib/types";

type RouteName =
  | "tone" | "north-star" | "quartermaster"
  | "oracle" | "auditor" | "chronicler" | "sentinel"
  | "archivist" | "courier" | "promptsmith";

const ROUTING_SYSTEM = `You are Helmsman, the orchestrator of Avnik's agent network.
Classify the user's message into exactly one agent name.

Agents and when to use them:
- tone: emotional support, motivation, general chat, venting, "I feel...", mood-based conversation
- north-star: task prioritization, future planning, "what should I do?", scheduling, "what's most important?", life goals, Red Book
- quartermaster: picking a work technique, timer setup, "how long should I work?", Pomodoro, triage, contracts, just start it
- oracle: "what patterns do you see?", deep analysis of user behavior, "why do I keep doing this?", root cause
- auditor: "how am I doing?", weekly review, self-evaluation, "give me honest feedback", "grade me"
- chronicler: session recap, "what have you done?", reviewing agent history, board meeting, daily anchor, future self
- sentinel: sleep, location, silence, "I just woke up", "I'm at the dining table", passive observation, wellness
- archivist: "remember this", "store", "save", memory consolidation
- courier: "pass this to", "give context", "what's my current state?"
- promptsmith: "improve your response", "that was wrong", meta-feedback on agent behavior

Output ONLY the agent name. No explanation. No JSON. Just the word.`;

const ALL_ROUTES: RouteName[] = ["tone", "north-star", "quartermaster", "oracle", "auditor", "chronicler", "sentinel", "archivist", "courier", "promptsmith"];

async function route(ctx: HelmContext): Promise<RouteName> {
  // Honor an explicit [ROUTE_TO:name] hint (direct-agent endpoint) — deterministic, no LLM call.
  const hint = ctx.input.match(/^\[ROUTE_TO:([a-z-]+)\]/i);
  if (hint) {
    const wanted = hint[1].toLowerCase() as RouteName;
    if (ALL_ROUTES.includes(wanted)) return wanted;
  }
  try {
    const routingMsg: Message = {
      role: "user",
      content: `User message: "${ctx.input}"\nMood: ${ctx.state.mood} | Phase: ${ctx.state.phase}`,
    };
    const result = await chat([routingMsg], { system: ROUTING_SYSTEM, temperature: 0.2 });
    const name = result.trim().toLowerCase() as RouteName;
    return ALL_ROUTES.includes(name) ? name : "tone";
  } catch {
    return "tone";
  }
}

const AGENT_MAP: Record<RouteName, (ctx: HelmContext) => Promise<AgentResult>> = {
  "tone":          toneSelector,
  "north-star":    northStar,
  "quartermaster": quartermaster,
  "oracle":        oracle,
  "auditor":       auditor,
  "chronicler":    chronicler,
  "sentinel":      sentinel,
  "archivist":     archivist,
  "courier":       courier,
  "promptsmith":   promptsmith,
};

export type HelmRequest = {
  input: string;
  messages: Message[];
  profile?: Profile;
  beliefs?: BeliefState;
  tasks?: Task[];
  events?: Event[];
  currentState?: Partial<CurrentState>;
  mode?: ChatMode; // chat | vent | plan | focus | review — controls Mentor length/tone
};

export async function helmsmanRun(req: HelmRequest): Promise<AgentResult & { state: CurrentState; route: string; beliefs?: BeliefState }> {
  // Build initial HelmContext with whatever state client sent (or default)
  let state: CurrentState = { ...DEFAULT_STATE, ...req.currentState, lastUpdated: Date.now() };

  const ctx: HelmContext = {
    input: req.input,
    messages: req.messages,
    profile: req.profile,
    beliefs: req.beliefs,
    tasks: req.tasks,
    events: req.events,
    state,
  };

  // Step 1 — Regulate (infer mood/energy, update state)
  const { state: regulatedState } = runRegulator(ctx);
  state = regulatedState;
  ctx.state = state;

  // Step 1.5 — Track (always-on Bayesian belief update from this turn's text).
  // Output (beliefs) becomes input to every downstream agent — the user's "always watching" agent.
  const tracked = passiveBeliefUpdate(ctx);
  if (tracked) ctx.beliefs = tracked.beliefs;

  // Step 2 — Route (ReAct: Reason)
  const routeName = await route(ctx);

  // Strip any [ROUTE_TO:name] hint so it never leaks into the agent's text analysis.
  const cleanInput = ctx.input.replace(/^\[ROUTE_TO:[a-z-]+\]\s*/i, "");

  // Step 3 — Act (run the chosen agent)
  const agentFn = AGENT_MAP[routeName];
  const rawResult = await agentFn({ ...ctx, input: cleanInput, state });

  // Step 3.5 — Mentor (quality layer): sanitize artifacts + fit length/tone to the mode.
  const result = await applyMentor(rawResult, { ...ctx, state }, req.mode ?? "chat");

  // Step 4 — Observe (log to trail)
  const finalState = addToTrail(state, {
    agent: result.agent,
    ts: Date.now(),
    summary: result.text.slice(0, 120),
  });

  // Persist the passive belief update (unless the agent already emitted one) so the
  // dashboard + next turn read the evolving belief state.
  const sideEffects = [...(result.sideEffects ?? [])];
  if (tracked && !sideEffects.some((e) => e.type === "belief_updated")) {
    sideEffects.push({
      ts: Date.now(),
      type: "belief_updated",
      source: "passive",
      value: tracked.beliefs,
    });
  }

  return {
    ...result,
    sideEffects,
    beliefs: ctx.beliefs,
    state: finalState,
    route: routeName,
  };
}
