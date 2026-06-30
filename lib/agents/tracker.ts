// 🧮 Tracker (the Actuary) — the always-on Bayesian belief engine.
// Runs every turn inside the Helmsman BEFORE routing, so every agent downstream
// receives a fresh BeliefState. This is the "agent that always watches the user":
// it turns natural-language evidence into a probability distribution over root causes.
// Pure + deterministic (no LLM) → testable; the LLM only narrates the numbers later.
import type { HelmContext } from "./state";
import type { BeliefState } from "@/lib/types";
import { runBayesUpdate, inferEvidenceFromText, PRIORS } from "./oracle/root-cause";

/** 1 − normalized entropy: how peaked (confident) the distribution is. */
export function beliefConfidence(rootCauses: Record<string, number>): number {
  const v = Object.values(rootCauses);
  if (!v.length) return 0;
  const entropy = -v.reduce((s, p) => s + (p > 0 ? p * Math.log(p) : 0), 0);
  const maxEntropy = Math.log(v.length);
  return maxEntropy > 0 ? Math.max(0, 1 - entropy / maxEntropy) : 0;
}

/**
 * Passively update beliefs from this turn's text.
 * Returns the new BeliefState + which evidence signals fired, or null if no signal.
 */
export function passiveBeliefUpdate(
  ctx: Pick<HelmContext, "input" | "beliefs">
): { beliefs: BeliefState; evidence: string[] } | null {
  const signals = inferEvidenceFromText(ctx.input);
  if (!signals.length) return null;

  let rootCauses = { ...(ctx.beliefs?.rootCauses ?? PRIORS) };
  for (const s of signals) rootCauses = runBayesUpdate(rootCauses, s);

  return {
    beliefs: {
      rootCauses,
      confidence: beliefConfidence(rootCauses),
      traits: ctx.beliefs?.traits ?? {},
      updatedAt: Date.now(),
    },
    evidence: signals,
  };
}
