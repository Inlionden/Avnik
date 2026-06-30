// 🪞 Auditor Lead — Self-Evaluation. Self-Critic, Question-Designer, core evaluator.
import type { HelmContext } from "../state";
import type { AgentResult } from "@/lib/types";
import { auditor as core } from "./core";
import { selfCritic } from "./self-critic";
import { questionDesigner } from "./question-designer";

type AuditorMode = "evaluate" | "question" | "grade" | "core";

function detectMode(input: string): AuditorMode {
  const t = input.toLowerCase();
  if (/evaluate|did.*work|what happened|intervention|last time/.test(t)) return "evaluate";
  if (/ask me|question|what should i|help me reflect/.test(t)) return "question";
  if (/grade|how am i|honest|score|rating|weekly review/.test(t)) return "grade";
  return "core";
}

export async function auditor(ctx: HelmContext): Promise<AgentResult> {
  const mode = detectMode(ctx.input);
  if (mode === "evaluate") return selfCritic(ctx);
  if (mode === "question") return questionDesigner(ctx);
  return core(ctx); // default = full A-F grade + pattern/gap analysis
}

export { selfCritic, questionDesigner };
