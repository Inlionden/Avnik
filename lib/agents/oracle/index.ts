// 🔮 Oracle Lead — Reasoning engine. Root-Cause (Bayesian), Socratic Interviewer, Pattern-Miner.
import type { HelmContext } from "../state";
import type { AgentResult } from "@/lib/types";
import { oracle as oracleCore } from "./core";
import { rootCause } from "./root-cause";
import { socratic } from "./socratic";

type OracleMode = "root-cause" | "socratic" | "pattern" | "core";

function detectMode(input: string, ctx: HelmContext): OracleMode {
  const t = input.toLowerCase();
  if (/why am i|why do i|root cause|what's wrong|diagnose|belief/.test(t)) return "root-cause";
  if (/ask me|question|interview|dig deeper|help me think/.test(t)) return "socratic";
  if (/pattern|analyze|what do you see|my behavior|my history/.test(t)) return "core";
  // If we have beliefs already and user is procrastinating, run root-cause update
  if (ctx.beliefs?.confidence && ctx.beliefs.confidence < 0.6) return "root-cause";
  return "core";
}

export async function oracle(ctx: HelmContext): Promise<AgentResult> {
  const mode = detectMode(ctx.input, ctx);
  if (mode === "root-cause") return rootCause(ctx);
  if (mode === "socratic")   return socratic(ctx);
  return oracleCore(ctx);
}

export { rootCause, socratic };
