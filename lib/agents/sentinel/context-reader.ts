// 📍 Context-Reader — infers activity from place + time + app behavior.
// "Phone stationary in Dining zone ~20 min at 1PM → infers ate → expects post-lunch dip."
import type { HelmContext } from "../state";
import type { AgentResult, Place, Event } from "@/lib/types";

type PlaceInference = {
  place: string;
  zoneType: Place["zoneType"];
  inference: string;
  nextSuggestion: string;
  energy: "high" | "medium" | "low";
};

const ZONE_INFERENCE: Record<Place["zoneType"], (hour: number, durationMin: number) => PlaceInference | null> = {
  eat: (hour, min) => min < 5 ? null : ({
    place: "dining area",
    zoneType: "eat",
    inference: `Looks like you ate (~${min} min at dining area around ${hour}:00)`,
    nextSuggestion: hour < 14
      ? "Post-meal energy dip coming in ~30 min — schedule your easiest tasks next, save deep work for 3pm."
      : "Good dinner break. Wind down with a review session, not new hard tasks.",
    energy: hour < 14 ? "medium" : "low",
  }),
  sleep: (hour) => ({
    place: "bedroom",
    zoneType: "sleep",
    inference: `You're in the sleep zone ${hour < 9 ? "(morning)" : "(night)"}`,
    nextSuggestion: hour < 9
      ? "Morning in bed — gentle start. Review today's top 3 tasks before getting up."
      : "Winding down. Log today's progress and set tomorrow's first task before sleep.",
    energy: hour < 9 ? "low" : "low",
  }),
  bath: () => ({
    place: "bathroom",
    zoneType: "bath",
    inference: "Bathroom break",
    nextSuggestion: "Good micro-break. Resume with a 2-min review of where you left off.",
    energy: "medium",
  }),
  study: (hour) => ({
    place: "study/desk",
    zoneType: "study",
    inference: `At your study spot ${hour < 12 ? "(morning focus)" : hour < 17 ? "(afternoon)" : "(evening session)"}`,
    nextSuggestion: "Optimal focus environment. Start your hardest task now.",
    energy: "high",
  }),
  office: (hour) => ({
    place: "office",
    zoneType: "office",
    inference: "At the office",
    nextSuggestion: hour < 12 ? "Deep work window — block distractions." : "Post-lunch: good for meetings and reviews.",
    energy: hour < 14 ? "high" : "medium",
  }),
  shop: () => ({
    place: "shop/store",
    zoneType: "shop",
    inference: "Running errands",
    nextSuggestion: "Errands done. Schedule your re-entry: 5 min review then pick up from where you stopped.",
    energy: "medium",
  }),
  other: () => null,
};

export async function contextReader(ctx: HelmContext): Promise<AgentResult & { placeInference?: PlaceInference }> {
  // Find most recent place event from events log
  const events = ctx.events ?? [];
  const recentPlaceEvent = [...events]
    .reverse()
    .find(e => e.type === "place_enter" || e.type === "place_stay");

  if (!recentPlaceEvent?.value) {
    return {
      text: "No location context yet. Define your places in Settings → Places to enable context awareness.",
      agent: "context-reader",
    };
  }

  const placeData = recentPlaceEvent.value as { zoneType: Place["zoneType"]; durationMin?: number; label?: string; hour?: number };
  // Use the hour the place event actually happened (from its timestamp), not the wall clock —
  // otherwise a lunch signal read at 4pm gets mislabeled as "dinner".
  const hour = placeData.hour ?? new Date(recentPlaceEvent.ts).getHours();
  const durationMin = placeData.durationMin ?? 0;

  const inferFn = ZONE_INFERENCE[placeData.zoneType] ?? ZONE_INFERENCE.other;
  const inference = inferFn(hour, durationMin);

  if (!inference) {
    return { text: "Context noted.", agent: "context-reader" };
  }

  return {
    text: `📍 ${inference.inference}. ${inference.nextSuggestion}`,
    agent: "context-reader",
    placeInference: inference,
    sideEffects: [{
      ts: Date.now(),
      type: "context_inferred",
      source: "passive" as const,
      value: inference,
    }],
  };
}
