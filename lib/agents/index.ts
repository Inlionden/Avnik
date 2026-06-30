// Agent registration — imports all agents and registers them with the registry.
// Import this once at app startup (API route cold start).
import { registerAgent } from "./registry";
import type { Agent, AgentContext } from "./registry";
import type { HelmContext } from "./state";
import { DEFAULT_STATE } from "./state";

// ── Lead agents ─────────────────────────────────────────────────────────────
import { toneSelector } from "./tone/selector";
import { northStar } from "./north-star";
import { quartermaster } from "./quartermaster";
import { promptsmith } from "./promptsmith";
import { oracle } from "./oracle";
import { chronicler } from "./chronicler";
import { archivist } from "./archivist";
import { courier } from "./courier";
import { regulator } from "./regulator";
import { auditor } from "./auditor";
import { sentinel } from "./sentinel";

// ── Sub-agents ──────────────────────────────────────────────────────────────
// Tone
import { sage } from "./tone/sage";
import { spark } from "./tone/spark";
import { sensei } from "./tone/sensei";
// North Star
import { goalKeeper } from "./north-star/goal-keeper";
import { meaningWeaver } from "./north-star/meaning-weaver";
// Quartermaster
import { contractor } from "./quartermaster/contractor";
import { triage } from "./quartermaster/triage";
import { starter } from "./quartermaster/starter";
import { pacer } from "./quartermaster/pacer";
// Oracle
import { rootCause as rootCauseAgent } from "./oracle/root-cause";
import { socratic } from "./oracle/socratic";
// Sentinel
import { sleepEstimator as sleepEstimatorAgent } from "./sentinel/sleep-estimator";
import { contextReader } from "./sentinel/context-reader";
import { silenceWatcher } from "./sentinel/silence-watcher";
// Auditor
import { selfCritic } from "./auditor/self-critic";
import { questionDesigner } from "./auditor/question-designer";
// Chronicler
import { anchor } from "./chronicler/anchor";
import { futureSelf } from "./chronicler/future-self";
import { runBoardMeeting } from "./chronicler/board-meeting";

// Adapter: wraps a HelmContext fn so it satisfies the Agent interface
function adapt(name: string, describe: string, fn: (ctx: HelmContext) => Promise<unknown>): Agent {
  return {
    name,
    describe,
    async run(ctx: AgentContext) {
      return fn({ ...ctx, state: DEFAULT_STATE, events: [] }) as ReturnType<Agent["run"]>;
    },
  };
}

let registered = false;
export function registerAllAgents() {
  if (registered) return;
  registered = true;

  // Lead agents
  registerAgent(adapt("tone-selector",  "MoE tone router",                     ctx => toneSelector(ctx as HelmContext)));
  registerAgent(adapt("north-star",     "Task prioritization + TMT planning",   ctx => northStar(ctx as HelmContext)));
  registerAgent(adapt("quartermaster",  "Productivity technique selector",      ctx => quartermaster(ctx as HelmContext)));
  registerAgent(adapt("promptsmith",    "Meta-agent for prompt improvement",    ctx => promptsmith(ctx as HelmContext)));
  registerAgent(adapt("oracle",         "User signal synthesizer",              ctx => oracle(ctx as HelmContext)));
  registerAgent(adapt("chronicler",     "Agent history tracker",                ctx => chronicler(ctx as HelmContext)));
  registerAgent(adapt("archivist",      "Memory storage agent",                 ctx => archivist(ctx as HelmContext)));
  registerAgent(adapt("courier",        "Context packager for handoffs",        ctx => courier(ctx as HelmContext)));
  registerAgent(adapt("regulator",      "Current state monitor",                ctx => regulator(ctx as HelmContext)));
  registerAgent(adapt("auditor",        "User evaluation + Reflection",         ctx => auditor(ctx as HelmContext)));
  registerAgent(adapt("sentinel",       "Passive observer: sleep/place/silence", ctx => sentinel(ctx as HelmContext)));

  // Tone sub-agents
  registerAgent(adapt("sage",     "Gentle, wise tone",     ctx => sage(ctx as HelmContext)));
  registerAgent(adapt("spark",    "Energetic tone",         ctx => spark(ctx as HelmContext)));
  registerAgent(adapt("sensei",   "Stoic discipline tone",  ctx => sensei(ctx as HelmContext)));

  // North Star sub-agents
  registerAgent(adapt("goal-keeper",    "Red Book: life goals manager",           ctx => goalKeeper(ctx as HelmContext)));
  registerAgent(adapt("meaning-weaver", "Connect tasks to North Star identity",   ctx => meaningWeaver(ctx as HelmContext)));

  // Quartermaster sub-agents
  registerAgent(adapt("contractor",  "Ulysses Contract: pre-commitment",          ctx => contractor(ctx as HelmContext)));
  registerAgent(adapt("triage",      "Eisenhower Matrix: do-now vs drop",         ctx => triage(ctx as HelmContext)));
  registerAgent(adapt("starter",     "Just Start It: auto first step",            ctx => starter(ctx as HelmContext)));
  registerAgent(adapt("pacer",       "Technique Factory: Pomodoro/custom timers", ctx => pacer(ctx as HelmContext)));

  // Oracle sub-agents
  registerAgent(adapt("root-cause",  "Bayesian belief engine",     ctx => rootCauseAgent(ctx as HelmContext)));
  registerAgent(adapt("socratic",    "Socratic question ladders",  ctx => socratic(ctx as HelmContext)));

  // Sentinel sub-agents
  registerAgent(adapt("sleep-estimator", "Infer sleep from app gap",    ctx => sleepEstimatorAgent(ctx as HelmContext)));
  registerAgent(adapt("context-reader",  "Zone inference from location", ctx => contextReader(ctx as HelmContext)));
  registerAgent(adapt("silence-watcher", "Gap detection + gentle nudge", ctx => silenceWatcher(ctx as HelmContext)));

  // Auditor sub-agents
  registerAgent(adapt("self-critic",       "Evaluate past interventions",     ctx => selfCritic(ctx as HelmContext)));
  registerAgent(adapt("question-designer", "Pick the one right question",     ctx => questionDesigner(ctx as HelmContext)));

  // Chronicler sub-agents
  registerAgent(adapt("anchor",       "Daily anchor + philosophy notebook",   ctx => anchor(ctx as HelmContext)));
  registerAgent(adapt("future-self",  "Future/Present/Past self dialogue",    ctx => futureSelf(ctx as HelmContext)));
  registerAgent(adapt("board-meeting","Weekly multi-agent board review",      ctx => runBoardMeeting(ctx as HelmContext)));
}

export { helmsmanRun } from "./helmsman";
export type { HelmRequest } from "./helmsman";
