// 🔒 SHARED CONTRACT — agent interface + Helmsman (Manager) skeleton. Owned by Session 1.
// Session 2 implements the real agents and routing; everyone registers here.
import type { Message, AgentResult, Profile, BeliefState, Task } from "../types";

export type AgentContext = {
  input: string;
  messages: Message[];
  profile?: Profile;
  beliefs?: BeliefState;
  tasks?: Task[];
};

export interface Agent {
  name: string;
  describe?: string;
  run(ctx: AgentContext): Promise<AgentResult>;
}

const registry = new Map<string, Agent>();

export function registerAgent(agent: Agent): void {
  registry.set(agent.name, agent);
}
export function getAgent(name: string): Agent | undefined {
  return registry.get(name);
}
export function listAgents(): string[] {
  return [...registry.keys()];
}

/**
 * 🧭 The Helmsman (Manager) — routes to the right agent.
 * Foundation = a stub: defaults to the 'coach' agent once Session 2 registers it.
 */
export async function helmsman(ctx: AgentContext): Promise<AgentResult> {
  const coach = registry.get("coach");
  if (coach) return coach.run(ctx);
  return {
    text: "🧭 Helmsman online — agents will register here (Session 2). You said: " + ctx.input,
    agent: "helmsman",
  };
}
