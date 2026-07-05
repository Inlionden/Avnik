// 📏 Fit-Checker — quality gate on every response. Right size, right tone, right words.
// Wraps any agent's draft and checks: too long? wrong tone for mode? wording off?
import type { HelmContext } from "../state";
import type { AgentResult } from "@/lib/types";
import { chat } from "@/lib/ai";

const LENGTH_TARGETS: Record<string, number> = {
  vent: 60,    // just listen, short
  plan: 150,   // structured but not a novel
  focus: 40,   // one-liners only
  review: 200, // detailed is fine
  chat: 120,   // default
};

const TONE_RULES: Record<string, string> = {
  vent: "validate feelings only. No advice unless user explicitly asks.",
  plan: "structured, numbered, specific tasks. No emotional language.",
  focus: "one short sentence max. Action only.",
  review: "honest, warm, specific. A-F grade or clear feedback.",
  chat: "conversational, warm, helpful. Match the user's energy.",
};

export async function fitChecker(
  draft: string,
  agentName: string,
  ctx: HelmContext,
  chatMode: string = "chat"
): Promise<string> {
  const wordCount = draft.split(/\s+/).length;
  const targetWords = LENGTH_TARGETS[chatMode] ?? 120;
  const toneRule = TONE_RULES[chatMode] ?? TONE_RULES.chat;

  const tooLong = wordCount > targetWords * 1.5;
  const tooShort = wordCount < 10 && chatMode !== "focus";

  if (!tooLong && !tooShort) return draft; // draft is fine

  const SYSTEM = `You are Fit-Checker — a response quality editor.
Current mode: ${chatMode} | Target: ~${targetWords} words | Tone rule: ${toneRule}
This draft from ${agentName} is ${tooLong ? "too long" : "too short"} (${wordCount} words).

DRAFT:
${draft}

Rewrite it to hit the target length while keeping all key information.
Output ONLY the rewritten response. Nothing else.`;

  try {
    return await chat([{ role: "user", content: "fix this" }], { system: SYSTEM, temperature: 0.4, raw: true });
  } catch {
    return draft; // on error, return original
  }
}

export async function fitCheckerAgent(ctx: HelmContext, draft: AgentResult, mode: string): Promise<AgentResult> {
  const fittedText = await fitChecker(draft.text, draft.agent, ctx, mode);
  return { ...draft, text: fittedText };
}
