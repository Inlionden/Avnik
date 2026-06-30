// Agent registration — imports all agents and registers them with the registry.
// Import this once at app startup (API route cold start).
import { registerAgent } from "./registry";
import type { Agent, AgentContext } from "./registry";
import type { HelmContext } from "./state";
import { DEFAULT_STATE } from "./state";
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

  registerAgent(adapt("tone-selector", "MoE tone router", ctx => toneSelector(ctx as HelmContext)));
  registerAgent(adapt("north-star",    "Task prioritization + TMT planning", ctx => northStar(ctx as HelmContext)));
  registerAgent(adapt("quartermaster", "Productivity technique selector", ctx => quartermaster(ctx as HelmContext)));
  registerAgent(adapt("promptsmith",   "Meta-agent for prompt improvement", ctx => promptsmith(ctx as HelmContext)));
  registerAgent(adapt("oracle",        "User signal synthesizer", ctx => oracle(ctx as HelmContext)));
  registerAgent(adapt("chronicler",    "Agent history tracker", ctx => chronicler(ctx as HelmContext)));
  registerAgent(adapt("archivist",     "Memory storage agent", ctx => archivist(ctx as HelmContext)));
  registerAgent(adapt("courier",       "Context packager for handoffs", ctx => courier(ctx as HelmContext)));
  registerAgent(adapt("regulator",     "Current state monitor", ctx => regulator(ctx as HelmContext)));
  registerAgent(adapt("auditor",       "User evaluation + Reflection", ctx => auditor(ctx as HelmContext)));
}

export { helmsmanRun } from "./helmsman";
export type { HelmRequest } from "./helmsman";
