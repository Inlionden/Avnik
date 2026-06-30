// 🔍 Self-Critic — evaluates whether an intervention actually worked.
import type { HelmContext } from "../state";
import type { AgentResult, Event } from "@/lib/types";

export type InterventionRecord = {
  agent: string;
  intervention: string;
  taskId?: string;
  ts: number;
  outcome?: "acted" | "completed" | "abandoned" | "ignored";
  observedAt?: number;
};

export function evaluateIntervention(
  record: InterventionRecord,
  events: Event[]
): { score: number; outcome: string; note: string } {
  const afterEvents = events.filter(e =>
    e.ts > record.ts && e.ts < record.ts + 3_600_000 // within 1 hour
  );

  const taskStarted = afterEvents.some(e =>
    e.type === "task_start" || e.type === "focus_start" || e.type === "pomodoro_start"
  );
  const taskDone = afterEvents.some(e =>
    e.taskId === record.taskId && e.type === "task_done"
  );
  const abandoned = afterEvents.some(e => e.type === "task_abandoned" || e.type === "app_close");

  if (taskDone) return { score: 1.0, outcome: "completed", note: "Full success — task completed." };
  if (taskStarted) return { score: 0.7, outcome: "acted", note: "User started — partial success." };
  if (abandoned) return { score: 0.1, outcome: "abandoned", note: "User closed app after intervention." };
  return { score: 0.3, outcome: "ignored", note: "No activity detected after intervention." };
}

export async function selfCritic(ctx: HelmContext): Promise<AgentResult> {
  const trail = ctx.state.agentTrail;
  const events = ctx.events ?? [];

  if (trail.length < 2) {
    return { text: "Not enough data yet to evaluate interventions.", agent: "self-critic" };
  }

  // Evaluate last 3 interventions
  const evaluations = trail.slice(-3).map(entry => {
    const record: InterventionRecord = {
      agent: entry.agent,
      intervention: entry.summary,
      ts: entry.ts,
    };
    const result = evaluateIntervention(record, events);
    return `${entry.agent}: ${result.outcome} (score ${(result.score*100).toFixed(0)}%) — ${result.note}`;
  }).join("\n");

  return {
    text: `🔍 Intervention evaluation:\n${evaluations}\n\nPattern: ${trail.slice(-3).map(e=>e.agent).join(" → ")}`,
    agent: "self-critic",
    sideEffects: [{
      ts: Date.now(),
      type: "self_critique",
      source: "passive" as const,
      value: { evaluations },
    }],
  };
}
