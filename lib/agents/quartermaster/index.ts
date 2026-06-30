// ⚔️ Quartermaster Lead — Action engine. Routes to Triage, Contractor, Starter, Pacer, or core.
import type { HelmContext } from "../state";
import type { AgentResult } from "@/lib/types";
import { quartermaster as core } from "./core";
import { triage } from "./triage";
import { contractor } from "./contractor";
import { starter } from "./starter";
import { pacer } from "./pacer";

type QMode = "triage" | "contract" | "start" | "technique" | "core";

function detectMode(input: string): QMode {
  const t = input.toLowerCase();
  if (/prioriti|triage|rank|order|most important|what first/.test(t)) return "triage";
  if (/ulysses|contract|commit|promise|by \d|done by|pledge/.test(t)) return "contract";
  if (/just start|do it for me|begin|first step|blank page|draft|outline/.test(t)) return "start";
  if (/pomodoro|timer|technique|focus session|work for|min|custom|create technique/.test(t)) return "technique";
  return "core"; // tactics advice without a specific mode
}

export async function quartermaster(ctx: HelmContext): Promise<AgentResult> {
  const mode = detectMode(ctx.input);
  if (mode === "triage")    return triage(ctx);
  if (mode === "contract")  return contractor(ctx);
  if (mode === "start")     return starter(ctx);
  if (mode === "technique") return pacer(ctx);
  return core(ctx);
}

export { triage, contractor, starter, pacer };
