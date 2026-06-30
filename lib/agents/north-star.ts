// ⭐ North Star — Future planning + task prioritization via Temporal Motivation Theory.
// M = (Expectancy × Value) / (Impulsiveness × Delay)
import { chat } from "@/lib/ai";
import type { HelmContext, CurrentState } from "./state";
import type { AgentResult, Task } from "@/lib/types";

// TMT score for a single task (higher = more urgent to do NOW)
function tmtScore(task: Task, nowMs: number, impulsiveness: number): number {
  const E = 0.7; // default expectancy; S3 will personalize via profile
  const V = task.importance ?? 50;
  const I = impulsiveness; // from Ocean.conscientiousness inversion (1–10)
  const deadlineMs = task.deadline
    ? new Date(task.deadline).getTime()
    : nowMs + 7 * 86_400_000; // default 7 days if no deadline
  const D = Math.max(0.5, (deadlineMs - nowMs) / 86_400_000); // days remaining
  return (E * V) / (I * D);
}

export async function northStar(ctx: HelmContext): Promise<AgentResult & { urgencyTop3: string[] }> {
  const now = Date.now();
  const tasks = (ctx.tasks ?? []).filter(t => t.status !== "done");

  // Derive impulsiveness from conscientiousness (inverse: low C = high I)
  const conscientiousness = ctx.profile?.ocean?.conscientiousness ?? 50;
  const impulsiveness = Math.max(1, 10 - conscientiousness / 10);

  const ranked = tasks
    .map(t => ({ task: t, score: tmtScore(t, now, impulsiveness) }))
    .sort((a, b) => b.score - a.score);

  const urgencyTop3 = ranked.slice(0, 3).map(r => r.task.id);

  const rankedSummary = ranked.slice(0, 6).map((r, i) => {
    const daysLeft = r.task.deadline
      ? Math.ceil((new Date(r.task.deadline).getTime() - now) / 86_400_000)
      : null;
    return (
      `${i + 1}. "${r.task.title}"` +
      ` | urgency ${r.score.toFixed(2)}` +
      (daysLeft !== null ? ` | ${daysLeft}d left` : " | no deadline") +
      (r.task.blockers?.length ? ` | BLOCKED: ${r.task.blockers.join(", ")}` : "")
    );
  }).join("\n");

  const SYSTEM = `You are North Star — Avnik's future planning agent.
You use Temporal Motivation Theory: M = (Expectancy × Value) / (Impulsiveness × Delay).
You have just scored the user's tasks. Your job:
1. Name the #1 task they should work on RIGHT NOW and exactly why (1 sentence)
2. Give a 3-step micro-plan for the next 90 minutes
3. Flag any blocked tasks or looming deadlines

Task ranking (by TMT urgency score):
${rankedSummary || "No tasks yet — ask the user to add their first task."}

Be specific. Use task names. Be concise. No generic productivity advice.`;

  const text = await chat(ctx.messages, { system: SYSTEM, temperature: 0.65 });

  return {
    text,
    agent: "north-star",
    urgencyTop3,
    sideEffects: urgencyTop3.map(id => ({
      ts: now,
      type: "priority_update",
      source: "active" as const,
      taskId: id,
    })),
  };
}
