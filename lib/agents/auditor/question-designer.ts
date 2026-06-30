// ❓ Question-Designer — picks the ONE right follow-up question at the right moment.
// Never a survey. One question, only when it adds signal.
import type { HelmContext } from "../state";
import type { AgentResult } from "@/lib/types";
import { chat } from "@/lib/ai";

type QuestionContext = "after_win" | "after_miss" | "low_confidence" | "pattern_change" | "general";

function detectQuestionContext(ctx: HelmContext): QuestionContext {
  const recentEvents = (ctx.events ?? []).slice(-5);
  const hasWin = recentEvents.some(e => e.type === "task_done" || e.type === "contract_honored");
  const hasMiss = recentEvents.some(e => e.type === "task_abandoned" || e.type === "contract_missed");
  const lowConf = (ctx.beliefs?.confidence ?? 1) < 0.4;

  if (hasWin) return "after_win";
  if (hasMiss) return "after_miss";
  if (lowConf) return "low_confidence";
  return "general";
}

const QUESTION_SEEDS: Record<QuestionContext, string> = {
  after_win:       "after a success: ask what actually helped (not assumptions)",
  after_miss:      "after a miss: ask what got in the way (blameless, 1 sentence max)",
  low_confidence:  "when beliefs are uncertain: ask for clarification on their actual blocker",
  pattern_change:  "when behavior changed: ask what shifted",
  general:         "general check-in: one question that opens up their current state",
};

export async function questionDesigner(ctx: HelmContext): Promise<AgentResult> {
  const context = detectQuestionContext(ctx);
  const seed = QUESTION_SEEDS[context];

  const SYSTEM = `You are Question-Designer — you generate ONE perfect follow-up question.
Context: ${seed}

Rules:
- One question only. Not two. Not a preamble. Just the question.
- Open-ended, not yes/no
- After a win: "Did the 5-minute start help, or was it something else?"
- After a miss: "What actually got in the way?"
- Never a survey. Never more than one question.
- Should feel like a curious, caring friend asking

Output: Just the question.`;

  const text = await chat(ctx.messages, { system: SYSTEM, temperature: 0.75 });
  return { text: text.trim(), agent: "question-designer" };
}
