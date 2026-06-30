// 🧠 Reason tools — inference, scoring, pattern mining
import type { Event, Task } from "@/lib/types";
import type { SleepEstimate } from "./sensing";

// ── Slip Risk ──────────────────────────────────────────────────────────────
export type SlipRisk = "low" | "medium" | "high";

export function predictSlipRisk(task: Task, sleep: SleepEstimate | null, mood: string): SlipRisk {
  let score = 0;

  // Low importance proxy for low expectancy
  if ((task.importance ?? 50) < 40) score += 2;
  if (task.deadline) {
    const daysLeft = (new Date(task.deadline).getTime() - Date.now()) / 86_400_000;
    if (daysLeft > 7) score += 1; // far deadline = high temporal discounting
  }

  // Sleep: poor sleep → more likely to slip
  if (sleep?.quality === "poor") score += 2;
  if (sleep?.quality === "fair") score += 1;

  // Mood
  if (["avoidant", "burnt-out", "anxious"].includes(mood)) score += 2;

  return score >= 5 ? "high" : score >= 3 ? "medium" : "low";
}

// ── Insights ───────────────────────────────────────────────────────────────
export type Insight = { label: string; value: string };

export function getInsights(events: Event[], tasks: Task[]): Insight[] {
  const insights: Insight[] = [];

  const done = tasks.filter(t => t.status === "done").length;
  const total = tasks.length;
  if (total > 0) {
    insights.push({ label: "Completion rate", value: `${Math.round((done / total) * 100)}%` });
  }

  const focusSessions = events.filter(e => e.type === "focus_session_end").length;
  if (focusSessions > 0) {
    insights.push({ label: "Focus sessions", value: `${focusSessions} completed` });
  }

  const moodCheckins = events.filter(e => e.type === "mood_checkin");
  if (moodCheckins.length >= 3) {
    const moods = moodCheckins.map(e => (e.value as { mood?: string })?.mood ?? "neutral");
    const topMood = moods.sort((a, b) =>
      moods.filter(m => m === b).length - moods.filter(m => m === a).length
    )[0];
    insights.push({ label: "Dominant mood", value: topMood });
  }

  return insights;
}

// ── Evaluate Intervention ──────────────────────────────────────────────────
export type InterventionResult = "success" | "partial" | "no_signal";

export function evaluateIntervention(
  interventionTs: number,
  agentName: string,
  events: Event[]
): InterventionResult {
  const windowMs = 3_600_000; // 1 hour
  const after = events.filter(e => e.ts > interventionTs && e.ts < interventionTs + windowMs);

  const acted = after.some(
    e => e.type === "task_done" || e.type === "focus_session_end" || e.type === "contract_honored"
  );
  const partial = after.some(
    e => e.type === "focus_session_start" || e.type === "task_started"
  );

  if (acted) return "success";
  if (partial) return "partial";
  return "no_signal";
}

// ── Self-Score ─────────────────────────────────────────────────────────────
export function scoreSelf(tasks: Task[], events: Event[]): { grade: string; score: number } {
  const done = tasks.filter(t => t.status === "done").length;
  const overdue = tasks.filter(
    t => t.deadline && new Date(t.deadline).getTime() < Date.now() && t.status !== "done"
  ).length;
  const focusSessions = events.filter(e => e.type === "focus_session_end").length;

  let score = done * 10 + focusSessions * 5 - overdue * 8;
  score = Math.max(0, Math.min(100, score));
  const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";
  return { grade, score };
}

// ── Bayesian Update (re-export from oracle) ───────────────────────────────
export { runBayesUpdate } from "../agents/oracle/root-cause";
