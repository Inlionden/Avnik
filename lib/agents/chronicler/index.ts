// 📜 Chronicler Lead — Memory, Reflection, Philosophy, Future Self.
// Sub-agents: core (trail memo), anchor (daily philosophy), future-self, board-meeting
import type { HelmContext } from "../state";
import type { AgentResult } from "@/lib/types";
import { chronicler as core } from "./core";
import { anchor } from "./anchor";
import { futureSelf } from "./future-self";
import { runBoardMeeting } from "./board-meeting";

type ChroniclerMode = "trail" | "anchor" | "future-self" | "board" | "core";

function detectMode(input: string): ChroniclerMode {
  const t = input.toLowerCase();
  if (/board meeting|weekly review|week in review|this week|weekly report/.test(t)) return "board";
  if (/future self|letter from|1 year|one year|past self|who i was/.test(t)) return "future-self";
  if (/daily anchor|philosophy|quote|wisdom|today's anchor/.test(t)) return "anchor";
  if (/history|trail|log|what have i|what did i|recap|summary/.test(t)) return "trail";
  return "core";
}

export async function chronicler(ctx: HelmContext): Promise<AgentResult> {
  const mode = detectMode(ctx.input);
  if (mode === "board") return runBoardMeeting(ctx);
  if (mode === "future-self") return futureSelf(ctx);
  if (mode === "anchor") return anchor(ctx);
  if (mode === "trail") return core(ctx);
  return core(ctx);
}

export { core, anchor, futureSelf, runBoardMeeting };
