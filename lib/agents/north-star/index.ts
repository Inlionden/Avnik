// ⭐ North Star Lead — Goals & Meaning. Red Book + TMT prioritization + Meaning-Weaver.
// Sub-agents: Goal-Keeper (Red Book), Meaning-Weaver (task→goal), core.ts (TMT math)
import type { HelmContext } from "../state";
import type { AgentResult } from "@/lib/types";
import { northStar as northStarCore } from "./core";
import { goalKeeper } from "./goal-keeper";
import { meaningWeaver } from "./meaning-weaver";
import { dayPlanner } from "./day-planner";

type NSMode = "goals" | "meaning" | "priority" | "plan" | "all";

function detectMode(input: string): NSMode {
  const t = input.toLowerCase();
  // Day-plan intent = an explicit planning verb NEAR a day/time/task reference.
  // (Avoids catching vague chat like "not sure what to do today".)
  const planVerb = /\b(plan|schedule|map out|lay out|organi[sz]e|block ?out|time ?box)\b/;
  const dayRef   = /\b(day|today|tomorrow|morning|afternoon|evening|week|tasks?|schedule|to-?dos?)\b/;
  if (/plan my day|plan out my|schedule my day/.test(t) || (planVerb.test(t) && dayRef.test(t))) return "plan";
  if (/goal|red book|become|want to be|life|mission|vision/.test(t)) return "goals";
  if (/meaning|why|purpose|connect|matter|motivation/.test(t)) return "meaning";
  if (/what (should|do) i|priority|prioriti|urgent|what now|next|rank/.test(t)) return "priority";
  return "priority"; // default to TMT prioritization
}

export async function northStar(ctx: HelmContext): Promise<AgentResult> {
  const mode = detectMode(ctx.input);
  if (mode === "plan") return dayPlanner(ctx);
  if (mode === "goals") return goalKeeper(ctx);
  if (mode === "meaning") return meaningWeaver(ctx);

  // Priority mode: run TMT core
  const result = await northStarCore(ctx);

  // Update urgencyTop3 in state (passed back via sideEffects)
  const urgencyTop3 = (result as AgentResult & { urgencyTop3?: string[] }).urgencyTop3 ?? [];

  return { ...result, agent: "north-star" };
}

export { northStarCore, goalKeeper, meaningWeaver, dayPlanner };
