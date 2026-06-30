// 🔬 Root-Cause — Bayesian belief engine with 10 causes. The diagnostic heart of Avnik.
import type { HelmContext } from "../state";
import type { AgentResult, BeliefState } from "@/lib/types";
import { chat } from "@/lib/ai";

// Bayesian likelihood table P(evidence | cause) from bayesian-belief.md
const LIKELIHOODS: Record<string, Record<string, number>> = {
  delays_important_tasks:        { fear: 0.85, perfectionism: 0.40, burnout: 0.20, clarity: 0.30, distraction: 0.15 },
  asks_what_if_not_good_enough:  { fear: 0.80, perfectionism: 0.70, burnout: 0.10, clarity: 0.20, distraction: 0.10 },
  rewrites_same_work:            { fear: 0.30, perfectionism: 0.90, burnout: 0.10, clarity: 0.15, distraction: 0.10 },
  finishes_small_tasks:          { fear: 0.20, perfectionism: 0.55, burnout: 0.10, clarity: 0.20, distraction: 0.30 },
  energy_drops_all_tasks:        { fear: 0.15, perfectionism: 0.10, burnout: 0.90, clarity: 0.15, distraction: 0.20 },
  rapid_task_switching:          { fear: 0.10, perfectionism: 0.10, burnout: 0.25, clarity: 0.20, distraction: 0.90 },
  doesnt_know_first_step:        { fear: 0.25, perfectionism: 0.20, burnout: 0.15, clarity: 0.90, distraction: 0.15 },
  avoids_hard_tasks:             { fear: 0.85, perfectionism: 0.40, burnout: 0.40, clarity: 0.30, confidence: 0.70 },
  overplans_underexecutes:       { overplanning: 0.90, fear: 0.50, perfectionism: 0.40, distraction: 0.20 },
  starts_enthusiastic_quits_fast:{ boredom: 0.85, distraction: 0.60, burnout: 0.30, clarity: 0.25 },
};

const PRIORS: Record<string, number> = {
  fear: 0.15, perfectionism: 0.15, burnout: 0.15, clarity: 0.15,
  distraction: 0.15, confidence: 0.10, overplanning: 0.10, boredom: 0.05,
};

export function runBayesUpdate(
  priors: Record<string, number>,
  evidenceKey: string
): Record<string, number> {
  const likelihoods = LIKELIHOODS[evidenceKey];
  if (!likelihoods) return priors;

  const raw: Record<string, number> = {};
  for (const cause of Object.keys(priors)) {
    raw[cause] = (likelihoods[cause] ?? 0.1) * priors[cause];
  }

  const total = Object.values(raw).reduce((s, v) => s + v, 0);
  const posterior: Record<string, number> = {};
  for (const cause of Object.keys(raw)) {
    posterior[cause] = total > 0 ? raw[cause] / total : 1 / Object.keys(raw).length;
  }
  return posterior;
}

// Infer evidence signals from user input
function inferEvidenceFromText(input: string): string[] {
  const t = input.toLowerCase();
  const signals: string[] = [];
  if (/avoid|procrastinat|important|big task/.test(t)) signals.push("delays_important_tasks");
  if (/what if|not good enough|not ready|not perfect/.test(t)) signals.push("asks_what_if_not_good_enough");
  if (/rewrite|again|keep editing|can't finish/.test(t)) signals.push("rewrites_same_work");
  if (/don't know where|first step|unclear|confus/.test(t)) signals.push("doesnt_know_first_step");
  if (/tired|exhausted|burnout|everything|all tasks/.test(t)) signals.push("energy_drops_all_tasks");
  if (/switch|distract|focus|attention/.test(t)) signals.push("rapid_task_switching");
  if (/plan|list|organize.*but|planning too much/.test(t)) signals.push("overplans_underexecutes");
  if (/excited.*but|start.*then|interesting.*then quit/.test(t)) signals.push("starts_enthusiastic_quits_fast");
  if (/confidence|can i|am i capable|imposter/.test(t)) signals.push("avoids_hard_tasks");
  return signals;
}

export async function rootCause(ctx: HelmContext): Promise<AgentResult & { beliefs: BeliefState }> {
  const current = ctx.beliefs?.rootCauses ?? PRIORS;
  const signals = inferEvidenceFromText(ctx.input);

  // Apply Bayes for each signal
  let updated = { ...current };
  for (const signal of signals) {
    updated = runBayesUpdate(updated, signal);
  }

  // Confidence: inverse of entropy
  const values = Object.values(updated);
  const entropy = -values.reduce((s, p) => s + (p > 0 ? p * Math.log(p) : 0), 0);
  const maxEntropy = Math.log(values.length);
  const confidence = Math.max(0, 1 - entropy / maxEntropy);

  const beliefs: BeliefState = {
    rootCauses: updated,
    confidence,
    traits: ctx.beliefs?.traits ?? {},
    updatedAt: Date.now(),
  };

  // Format for display
  const top3 = Object.entries(updated)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cause, prob]) => `${cause.replace(/_/g," ")}: ${(prob*100).toFixed(0)}%`)
    .join(" · ");

  const SYSTEM = `You are Root-Cause — Avnik's Bayesian diagnostic agent.
Current belief update: ${top3}
Confidence: ${(confidence*100).toFixed(0)}%

Translate this into a 2-sentence human insight. Never say "you have X disorder."
Say "It looks like ${top3.split("·")[0].trim()} is the most likely driver right now."
Then name ONE intervention matched to the top cause.`;

  const text = await chat(ctx.messages, { system: SYSTEM, temperature: 0.65 });

  return {
    text,
    agent: "root-cause",
    beliefs,
    sideEffects: [{
      ts: Date.now(),
      type: "belief_updated",
      source: "active" as const,
      value: beliefs,
    }],
  };
}
