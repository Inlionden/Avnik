// ⭐ North Star Lead — Goals & Meaning. Red Book + TMT prioritization + Meaning-Weaver.
// Sub-agents: Goal-Keeper (Red Book), Meaning-Weaver (task→goal), core.ts (TMT math)
import type { HelmContext } from "../state";
import type { AgentResult } from "@/lib/types";
import { northStar as northStarCore } from "./core";
import { goalKeeper } from "./goal-keeper";
import { meaningWeaver } from "./meaning-weaver";

type NSMode = "goals" | "meaning" | "priority" | "all";

function detectMode(input: string): NSMode {
  const t = input.toLowerCase();
  if (/goal|red book|become|want to be|life|mission|vision/.test(t)) return "goals";
  if (/meaning|why|purpose|connect|matter|motivation/.test(t)) return "meaning";
  if (/what (should|do) i|priority|prioriti|urgent|what now|next|rank/.test(t)) return "priority";
  return "priority"; // default to TMT prioritization
}

export async function northStar(ctx: HelmContext): Promise<AgentResult> {
  const mode = detectMode(ctx.input);
  if (mode === "goals") return goalKeeper(ctx);
  if (mode === "meaning") return meaningWeaver(ctx);

  // Priority mode: run TMT core
  const result = await northStarCore(ctx);

  // Update urgencyTop3 in state (passed back via sideEffects)
  const urgencyTop3 = (result as AgentResult & { urgencyTop3?: string[] }).urgencyTop3 ?? [];

  return { ...result, agent: "north-star" };
}

export { northStarCore, goalKeeper, meaningWeaver };
