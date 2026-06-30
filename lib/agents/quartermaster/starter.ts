// 🚀 Starter — "Just Start It For Me." Does the first real step autonomously.
import type { HelmContext } from "../state";
import type { AgentResult } from "@/lib/types";
import { chat } from "@/lib/ai";

export async function starter(ctx: HelmContext): Promise<AgentResult> {
  const topTask = ctx.tasks?.find(t => t.status !== "done");
  const taskName = topTask?.title ?? "your current task";

  const SYSTEM = `You are Starter — Avnik's autonomous execution agent. Your one job: BREAK THE BLANK PAGE.
You don't suggest starting. You START for them.

Task: "${taskName}"
User's state: mood=${ctx.state.mood}, energy=${(ctx.state.energy*100).toFixed(0)}%

Do ONE of these (pick the most fitting):
1. If it's writing: draft the opening 3 sentences
2. If it's coding: write the function signature + first 3 lines of logic
3. If it's a big project: break it into 5 sub-tasks (numbered, time-estimated)
4. If it's an email: write the entire first draft
5. If it's studying: generate 5 key questions to answer from the topic

Then say: "There. You're already 10% done. Keep going for just 5 more minutes."

Never give instructions for how to start. Just START.`;

  const text = await chat(ctx.messages, { system: SYSTEM, temperature: 0.8 });
  return {
    text,
    agent: "starter",
    sideEffects: [{
      ts: Date.now(),
      type: "just_start_triggered",
      source: "active" as const,
      taskId: topTask?.id,
    }],
  };
}
