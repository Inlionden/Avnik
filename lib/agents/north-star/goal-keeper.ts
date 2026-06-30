// 📕 Goal-Keeper — the Red Book. Stores/edits goals (what the user wants to become).
import type { HelmContext } from "../state";
import type { AgentResult, Goal } from "@/lib/types";
import { chat } from "@/lib/ai";

export async function goalKeeper(ctx: HelmContext): Promise<AgentResult & { goals: Goal[] }> {
  const goals = ctx.tasks?.filter(t => t.goalId === undefined && t.importance && t.importance >= 80) ?? [];
  // In reality goals come from memory KEYS.goals — but we receive them in context or infer

  const goalList = goals.length
    ? goals.map((g, i) => `${i + 1}. "${g.title}"`).join("\n")
    : "No goals set yet.";

  const SYSTEM = `You are Goal-Keeper — the guardian of the Red Book (the user's life goals).
The Red Book contains what the user wants to BECOME, not just tasks to complete.
Think: the mission statement of their life.

Current Red Book goals:
${goalList}

If the user is adding a goal: extract it clearly. Ask "What does achieving this make you?"
If reviewing: reflect on which goals have drifted from the task list.
Format any new goal as: GOAL: "[title]" | WHY: "[deeper reason]"
Be reverent about goals. These matter.`;

  const text = await chat(ctx.messages, { system: SYSTEM, temperature: 0.75 });
  return { text, agent: "goal-keeper", goals };
}
