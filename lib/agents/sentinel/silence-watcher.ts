// 🤫 Silence-Watcher — detects when user goes quiet vs their own baseline. "Silence Speaks."
import type { HelmContext } from "../state";
import type { AgentResult, Event } from "@/lib/types";

function getJournalingBaseline(events: Event[]): { avgGapHours: number; count: number } {
  const journalEvents = events.filter(e =>
    e.type === "journal" || e.type === "mood_checkin" || e.type === "app_open"
  ).sort((a, b) => a.ts - b.ts);

  if (journalEvents.length < 3) return { avgGapHours: 24, count: journalEvents.length };

  const gaps: number[] = [];
  for (let i = 1; i < Math.min(journalEvents.length, 10); i++) {
    const gap = (journalEvents[i].ts - journalEvents[i - 1].ts) / 3_600_000;
    if (gap < 48) gaps.push(gap); // ignore gaps > 2 days (vacations etc)
  }

  const avg = gaps.length ? gaps.reduce((s, g) => s + g, 0) / gaps.length : 24;
  return { avgGapHours: avg, count: journalEvents.length };
}

export async function silenceWatcher(ctx: HelmContext): Promise<AgentResult & { silentHours?: number }> {
  const events = ctx.events ?? [];
  const baseline = getJournalingBaseline(events);

  const lastActivity = events.length ? Math.max(...events.map(e => e.ts)) : null;
  if (!lastActivity) return { text: "No activity logged yet.", agent: "silence-watcher" };

  const hoursSinceLast = (Date.now() - lastActivity) / 3_600_000;
  const threshold = baseline.avgGapHours * 2; // 2× their normal gap = meaningful silence

  if (hoursSinceLast < threshold) {
    return {
      text: `Activity normal. Last seen ${hoursSinceLast.toFixed(1)}h ago (baseline ${baseline.avgGapHours.toFixed(1)}h).`,
      agent: "silence-watcher",
    };
  }

  // Silence detected — gentle, non-pressuring outreach
  const silentHours = Math.round(hoursSinceLast);
  return {
    text: `I've noticed you've been quieter than usual (${silentHours}h vs your typical ${baseline.avgGapHours.toFixed(0)}h). You don't have to write anything. If you'd like, just tap one word: 😄 Great · 😐 Okay · 😔 Stressed · 😴 Tired · 😟 Anxious — or simply skip.`,
    agent: "silence-watcher",
    silentHours,
    sideEffects: [{
      ts: Date.now(),
      type: "silence_detected",
      source: "passive" as const,
      value: { silentHours, baseline: baseline.avgGapHours },
    }],
  };
}
