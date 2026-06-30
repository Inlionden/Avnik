// ToneSelector — Mixture-of-Experts router for the 3 tone agents.
// Scores Sage / Spark / Sensei based on mood + Big Five + energy, then runs the winner.
import type { HelmContext } from "../state";
import type { AgentResult } from "@/lib/types";
import { sage } from "./sage";
import { spark } from "./spark";
import { sensei } from "./sensei";

type ToneName = "sage" | "spark" | "sensei";

function scoreTones(ctx: HelmContext): Record<ToneName, number> {
  const { state, profile } = ctx;
  const neuroticism = profile?.ocean?.neuroticism ?? 50;
  const conscientiousness = profile?.ocean?.conscientiousness ?? 50;
  const scores: Record<ToneName, number> = { sage: 0, spark: 0, sensei: 0 };

  // Mood weights
  const moodWeights: Record<string, Partial<Record<ToneName, number>>> = {
    anxious:    { sage: 45 },
    "burnt-out": { sage: 50 },
    avoidant:   { spark: 30, sensei: 20 },
    energized:  { spark: 45 },
    focused:    { sensei: 40 },
    neutral:    { spark: 20, sage: 15 },
  };
  const mw = moodWeights[state.mood] ?? {};
  for (const [k, v] of Object.entries(mw)) scores[k as ToneName] += v as number;

  // Big Five adjustments
  if (neuroticism > 65)        scores.sage    += 20;
  if (neuroticism < 35)        scores.sensei  += 10;
  if (conscientiousness < 40)  scores.spark   += 15;
  if (conscientiousness > 65)  scores.sensei  += 15;

  // Energy adjustments
  if (state.energy < 0.3)      scores.sage    += 15;
  if (state.energy > 0.75)     { scores.spark += 10; scores.sensei += 10; }

  return scores;
}

export async function toneSelector(ctx: HelmContext): Promise<AgentResult> {
  const scores = scoreTones(ctx);
  const winner = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]) as ToneName;
  const runners = { sage, spark, sensei };
  const result = await runners[winner](ctx);
  return { ...result, agent: winner }; // surface the actual tone agent name
}
