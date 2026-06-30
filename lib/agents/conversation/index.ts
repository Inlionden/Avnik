// 🎙️ Mentor Lead — Conversation quality layer. Mood-reading + style-tuning + fit-checking.
// Post-processes every agent response to ensure it fits the chat mode and user's emotional state.
import type { HelmContext } from "../state";
import type { AgentResult } from "@/lib/types";
import { fitChecker } from "./fit-checker";
import { checkInterruptibility } from "./interruptibility";

export { fitChecker, checkInterruptibility };

export type ChatMode = "chat" | "vent" | "plan" | "focus" | "review";

// Mood-Reader: infers what tone adaptation the current mood needs
export function moodReader(mood: string): { style: string; avoid: string } {
  const map: Record<string, { style: string; avoid: string }> = {
    anxious:    { style: "calm, grounding, short sentences", avoid: "long lists, urgency language, should/must" },
    energized:  { style: "match the energy, action-forward, upbeat", avoid: "slowing down, over-explaining" },
    avoidant:   { style: "gentle, curiosity-led, no pressure", avoid: "directives, judgment, 'why haven't you'" },
    focused:    { style: "minimal, direct, zero fluff", avoid: "check-ins, long preambles, emotional content" },
    "burnt-out":{ style: "compassionate, human, slow down", avoid: "more tasks, cheerleading, toxic positivity" },
    neutral:    { style: "balanced, clear, warm", avoid: "extremes in either direction" },
  };
  return map[mood] ?? map.neutral;
}

// Style-Tuner: adapts message based on Big Five profile
export function styleTuner(profile: HelmContext["profile"]): string {
  if (!profile?.ocean) return "";
  const { openness = 50, conscientiousness = 50, agreeableness = 50 } = profile.ocean;
  const hints: string[] = [];
  if (openness > 70) hints.push("use metaphors and conceptual framing");
  if (conscientiousness > 70) hints.push("be structured, use numbered steps");
  if (agreeableness > 70) hints.push("be warm and collaborative in tone");
  if (conscientiousness < 30) hints.push("keep it casual and low-pressure");
  return hints.join("; ");
}

// Mentor wraps another agent's result with fit-checking.
// Used by the API route as a post-processor, not a standalone router.
export async function applyMentor(
  result: AgentResult,
  ctx: HelmContext,
  chatMode: ChatMode = "chat"
): Promise<AgentResult> {
  const moodHints = moodReader(ctx.state.mood);
  const styleHints = styleTuner(ctx.profile);

  const annotatedCtx = {
    ...ctx,
    moodStyle: moodHints.style,
    moodAvoid: moodHints.avoid,
    styleHints,
  } as HelmContext;

  const fitted = await fitChecker(result.text, result.agent, annotatedCtx, chatMode);
  return { ...result, text: fitted };
}
