// 👁️ Perceive tools — passive data extraction from events + profile
import type { Event } from "@/lib/types";

export type SleepEstimate = {
  estimatedHours: number;
  bedtime: string;       // ISO string
  wakeTime: string;      // ISO string
  quality: "poor" | "fair" | "good";
  confidence: "inferred";
};

export type PlaceInference = {
  zoneType: "eat" | "sleep" | "bath" | "study" | "office" | "shop" | "other";
  activity: string;
  note: string;
};

// ── Sleep ──────────────────────────────────────────────────────────────────
export function estimateSleepFromGap(events: Event[]): SleepEstimate | null {
  const opens  = events.filter(e => e.type === "app_open").map(e => e.ts);
  const closes = events.filter(e => e.type === "app_close").map(e => e.ts);
  if (!opens.length || !closes.length) return null;

  const latestOpen = Math.max(...opens);
  const closesBefore = closes.filter(c => c < latestOpen);
  if (!closesBefore.length) return null;

  const lastClose = Math.max(...closesBefore);
  const bedHour = new Date(lastClose).getHours();
  const wakeHour = new Date(latestOpen).getHours();

  const isNightGap = bedHour >= 21 || bedHour <= 7 || wakeHour <= 10;
  if (!isNightGap) return null;

  const gapMs = latestOpen - lastClose;
  const gapH  = gapMs / 3_600_000;
  if (gapH < 3 || gapH > 12) return null;

  return {
    estimatedHours: parseFloat(gapH.toFixed(1)),
    bedtime:  new Date(lastClose).toISOString(),
    wakeTime: new Date(latestOpen).toISOString(),
    quality: gapH >= 7 ? "good" : gapH >= 5.5 ? "fair" : "poor",
    confidence: "inferred",
  };
}

// ── Place ──────────────────────────────────────────────────────────────────
const ZONE_INFERENCE: Record<string, { activity: string; note: string }> = {
  eat:    { activity: "eating",    note: "Post-meal energy dip coming in ~30 min. Light work or a 10-min walk." },
  sleep:  { activity: "resting",   note: "You're in a rest zone. Nap if you need it — 20 min resets focus." },
  bath:   { activity: "personal",  note: "Great time to replay a mental problem. Insights happen in the shower." },
  study:  { activity: "studying",  note: "Optimal focus environment. Start your hardest task now." },
  office: { activity: "working",   note: "Work context active. Block distractions and protect your deep work." },
  shop:   { activity: "shopping",  note: "Errand mode. Good time to handle quick admin tasks mentally." },
  other:  { activity: "elsewhere", note: "" },
};

export function inferActivityFromPlace(zoneType: string, durationMin: number, hour: number): PlaceInference {
  const z = ZONE_INFERENCE[zoneType] ?? ZONE_INFERENCE.other;
  let note = z.note;

  if (zoneType === "eat" && hour >= 12 && hour <= 14 && durationMin >= 15) {
    note = "Looks like you ate lunch. Post-lunch dip expected ~1:30 PM. Perfect time for a 20-min review, not deep work.";
  }
  return { zoneType: zoneType as PlaceInference["zoneType"], activity: z.activity, note };
}

// ── Mood ───────────────────────────────────────────────────────────────────
export function getMood(events: Event[]): string {
  const recent = events.filter(e => e.type === "mood_checkin").slice(-1)[0];
  return (recent?.value as { mood?: string })?.mood ?? "neutral";
}

// ── Sitting Duration ───────────────────────────────────────────────────────
export function getSittingDuration(events: Event[]): number {
  const lastMove = events.filter(e => e.type === "movement" || e.type === "place_enter")
    .map(e => e.ts).sort().reverse()[0];
  if (!lastMove) return 0;
  return Math.round((Date.now() - lastMove) / 60_000); // minutes
}

// ── Calendar Load ──────────────────────────────────────────────────────────
export function getCalendarLoad(events: Event[]): "light" | "moderate" | "heavy" {
  const today = new Date().toDateString();
  const todayMeetings = events.filter(
    e => e.type === "calendar_event" && new Date(e.ts).toDateString() === today
  ).length;
  return todayMeetings >= 4 ? "heavy" : todayMeetings >= 2 ? "moderate" : "light";
}
