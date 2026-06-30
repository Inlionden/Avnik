// 💤 Sleep-Estimator — infers sleep from app gap (closed 1:50AM, opened 9:05AM → ~5h sleep)
import type { HelmContext } from "../state";
import type { AgentResult, Event } from "@/lib/types";

export type SleepEstimate = {
  estimatedHours: number;
  bedtime: string;
  wakeTime: string;
  quality: "poor" | "fair" | "good";
  confidence: "inferred" | "self-reported";
};

export function estimateSleepFromGap(events: Event[]): SleepEstimate | null {
  // Find the last "app_open" event and the "app_close" before it
  const sorted = [...events].sort((a, b) => b.ts - a.ts);
  const lastOpen = sorted.find(e => e.type === "app_open");
  if (!lastOpen) return null;

  // Find app_close before the last open
  const closesBefore = sorted.filter(e => e.type === "app_close" && e.ts < lastOpen.ts);
  const lastClose = closesBefore[0];
  if (!lastClose) return null;

  const gapMs = lastOpen.ts - lastClose.ts;
  const gapHours = gapMs / 3_600_000;

  // Only count as sleep if gap is 3–12 hours and occurred during night/early morning
  const closeHour = new Date(lastClose.ts).getHours();
  const isNightGap = closeHour >= 21 || closeHour <= 7;
  if (!isNightGap || gapHours < 3 || gapHours > 13) return null;

  const estimatedHours = Math.round(gapHours * 10) / 10;
  const quality = estimatedHours >= 7 ? "good" : estimatedHours >= 5.5 ? "fair" : "poor";

  return {
    estimatedHours,
    bedtime: new Date(lastClose.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    wakeTime: new Date(lastOpen.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    quality,
    confidence: "inferred",
  };
}

export async function sleepEstimator(ctx: HelmContext): Promise<AgentResult & { sleep?: SleepEstimate }> {
  const sleep = estimateSleepFromGap(ctx.events ?? []);

  if (!sleep) {
    return { text: "No sleep data yet — I track when you close and reopen the app overnight.", agent: "sleep-estimator" };
  }

  const qualityText = {
    poor: `⚠️ Only ${sleep.estimatedHours}h — that's below the 7h minimum. Today's plan should be lighter.`,
    fair: `${sleep.estimatedHours}h. Okay but not great. Energy will likely dip around 3pm.`,
    good: `✅ ${sleep.estimatedHours}h — well rested. Good day to tackle your hardest task first.`,
  }[sleep.quality];

  return {
    text: `🌙 Sleep inferred: you closed the app at ${sleep.bedtime}, reopened at ${sleep.wakeTime}. ${qualityText}`,
    agent: "sleep-estimator",
    sleep,
    sideEffects: [{
      ts: Date.now(),
      type: "sleep_inferred",
      source: "passive" as const,
      value: sleep,
    }],
  };
}
