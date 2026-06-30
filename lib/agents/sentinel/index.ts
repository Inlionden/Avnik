// 👁️ Sentinel Lead — Perception agent. Gathers signals: sleep, place, silence, movement.
// Sub-agents: Sleep-Estimator, Context-Reader, Silence-Watcher
import type { HelmContext } from "../state";
import type { AgentResult } from "@/lib/types";
import { sleepEstimator } from "./sleep-estimator";
import { contextReader } from "./context-reader";
import { silenceWatcher } from "./silence-watcher";
import { inferMoodFromText } from "../state";

type SentinelMode = "sleep" | "context" | "silence" | "fuse";

function detectMode(input: string): SentinelMode {
  const t = input.toLowerCase();
  if (/sleep|tired|woke|slept|rest|night/.test(t)) return "sleep";
  if (/where|place|dining|eating|office|home|gym|library/.test(t)) return "context";
  if (/quiet|silent|not been|miss|check.?in/.test(t)) return "silence";
  return "fuse";
}

export async function sentinel(ctx: HelmContext): Promise<AgentResult> {
  const mode = detectMode(ctx.input);

  if (mode === "sleep") return sleepEstimator(ctx);
  if (mode === "context") return contextReader(ctx);
  if (mode === "silence") return silenceWatcher(ctx);

  // Fuse mode: run all sub-agents, combine the most informative result
  const results = await Promise.all([
    sleepEstimator(ctx),
    contextReader(ctx),
    silenceWatcher(ctx),
  ]);

  // Pick the most interesting non-default result
  const meaningful = results.find(r =>
    !r.text.includes("No") && !r.text.includes("yet") && !r.text.includes("normal")
  ) ?? results[0];

  return { ...meaningful, agent: "sentinel" };
}
