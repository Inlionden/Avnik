// 🪞 Auditor — User evaluation agent. Reflection pattern. Intent vs action. A-F grade.
import { chat } from "@/lib/ai";
import type { HelmContext } from "./state";
import type { AgentResult, Event } from "@/lib/types";

export async function auditor(ctx: HelmContext): Promise<AgentResult> {
  const tasks = ctx.tasks ?? [];
  const events = (ctx.events ?? []) as Event[];

  const doneTasks   = tasks.filter(t => t.status === "done").length;
  const todoTasks   = tasks.filter(t => t.status === "todo").length;
  const blocked     = tasks.filter(t => t.status === "blocked").length;
  const overdue     = tasks.filter(t => {
    if (!t.deadline || t.status === "done") return false;
    return new Date(t.deadline).getTime() < Date.now();
  }).length;

  // Frequency map of event types
  const freq = events.slice(-50).reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});

  // Derive a simple consistency score from event density
  const actionEvents = (freq.task_done ?? 0) + (freq.focus_start ?? 0) + (freq.journal ?? 0);
  const grade =
    actionEvents >= 15 ? "A" :
    actionEvents >= 10 ? "B" :
    actionEvents >= 6  ? "C" :
    actionEvents >= 3  ? "D" : "F";

  const SYSTEM = `You are Auditor — Avnik's honest self-evaluation agent.
You are the user's internal board of directors chair. Honest, kind, precise.

User stats this week:
- Tasks: ${doneTasks} done · ${todoTasks} todo · ${blocked} blocked · ${overdue} overdue
- Action events (last 50): ${JSON.stringify(freq)}
- Root cause beliefs: ${JSON.stringify(ctx.beliefs?.rootCauses ?? {})}
- Computed consistency grade: ${grade}

Give a 3-part evaluation:
1. **PATTERN**: What recurring behavior are you seeing? (1-2 sentences, specific)
2. **GAP**: Where does intent diverge from actual behavior? Name the specific task or habit.
3. **GRADE**: ${grade} — explain in one honest sentence why.

Then one forward-looking line: "This week, the one thing that would change your grade is ___"

You are the friend who tells the truth. Not harsh, not soft. True.`;

  const text = await chat(ctx.messages, { system: SYSTEM, temperature: 0.7 });
  return {
    text,
    agent: "auditor",
    sideEffects: [{ ts: Date.now(), type: "audit", source: "active", value: { grade, overdue } }],
  };
}
