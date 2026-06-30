// 🔗 Meaning-Weaver — connects every task to a North Star goal. "This moves you toward X."
import type { HelmContext } from "../state";
import type { AgentResult, Task, Goal } from "@/lib/types";
import { chat } from "@/lib/ai";

export async function meaningWeaver(ctx: HelmContext): Promise<AgentResult> {
  const tasks = (ctx.tasks ?? []).filter(t => t.status !== "done").slice(0, 5);
  const taskList = tasks.map(t => `- "${t.title}"${t.goalId ? ` [linked to goal ${t.goalId}]` : " [UNLINKED]"}`).join("\n");

  const SYSTEM = `You are Meaning-Weaver — your job is to connect tasks to what the user actually cares about.
Every task without meaning is just friction. Every task WITH meaning becomes fuel.

Based on Temporal Motivation Theory: low VALUE is fixed by connecting to a North Star.

Current unlinked tasks:
${taskList || "No tasks yet."}

For each unlinked task:
1. Suggest which goal it serves (or create one if needed)
2. Write one sentence that makes the connection visceral: "Finishing [task] means you're one step closer to [identity goal]."

Use the user's own language. Make it feel true, not forced.`;

  const text = await chat(ctx.messages, { system: SYSTEM, temperature: 0.8 });
  return { text, agent: "meaning-weaver" };
}
