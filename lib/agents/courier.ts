// 📦 Courier — Info passer. Packages context for cross-agent handoffs.
import type { HelmContext, CurrentState, AgentTrailEntry } from "./state";
import type { AgentResult, Event } from "@/lib/types";

export type AgentPacket = {
  input: string;
  state: CurrentState;
  taskCount: number;
  eventCount: number;
  topTask?: string;
  recentTrail: AgentTrailEntry[];
  beliefs?: Record<string, number>;
  profileSummary?: string;
};

export function buildPacket(ctx: HelmContext): AgentPacket {
  const activeTasks = ctx.tasks?.filter(t => t.status !== "done") ?? [];
  const topTask = activeTasks[0]?.title;
  const profileSummary = ctx.profile
    ? `${ctx.profile.name ?? "User"} · onboarded=${ctx.profile.onboarded} · ${JSON.stringify(ctx.profile.workStyle).slice(0, 80)}`
    : undefined;

  return {
    input: ctx.input,
    state: ctx.state,
    taskCount: activeTasks.length,
    eventCount: ctx.events?.length ?? 0,
    topTask,
    recentTrail: ctx.state.agentTrail.slice(-5),
    beliefs: ctx.beliefs?.rootCauses,
    profileSummary,
  };
}

export async function courier(ctx: HelmContext): Promise<AgentResult> {
  const packet = buildPacket(ctx);
  const summary = [
    `mood=${packet.state.mood}`,
    `energy=${(packet.state.energy * 100).toFixed(0)}%`,
    `phase=${packet.state.phase}`,
    `tasks=${packet.taskCount}`,
    `events=${packet.eventCount}`,
    packet.topTask ? `top="${packet.topTask}"` : null,
  ].filter(Boolean).join(" | ");

  return {
    text: `📦 Context packaged: ${summary}`,
    agent: "courier",
    sideEffects: [{
      ts: Date.now(),
      type: "context_packaged",
      source: "passive" as const,
      value: packet,
    }],
  };
}
