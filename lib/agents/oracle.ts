// 🔮 Oracle — User info collector. Synthesizes signals about the USER.
import { chat } from "@/lib/ai";
import type { HelmContext } from "./state";
import type { AgentResult, Event } from "@/lib/types";

export async function oracle(ctx: HelmContext): Promise<AgentResult> {
  const events = (ctx.events ?? []) as Event[];
  const recentEvents = events
    .slice(-25)
    .map(e => `[${new Date(e.ts).toLocaleDateString()} ${new Date(e.ts).toLocaleTimeString()}] ${e.type}${e.taskId ? ` (task:${e.taskId})` : ""}: ${JSON.stringify(e.value ?? "")}`)
    .join("\n");

  const taskSummary = (ctx.tasks ?? [])
    .map(t => `"${t.title}" [${t.status}]${t.deadline ? ` due ${t.deadline}` : ""}${t.blockers?.length ? ` BLOCKED` : ""}`)
    .join("\n");

  const SYSTEM = `You are Oracle — Avnik's user intelligence agent.
You observe patterns across the user's events, tasks, and behavior to build understanding.
You synthesize signals — not for the user to read, but to inform other agents.

Recent user signals (last 25 events):
${recentEvents || "No events logged yet."}

Current tasks:
${taskSummary || "No tasks yet."}

Beliefs about root causes: ${JSON.stringify(ctx.beliefs?.rootCauses ?? {})}
Profile traits: ${JSON.stringify(ctx.profile?.workStyle ?? {})}

Produce a 3-part intelligence brief:
1. WHAT'S HAPPENING: What is the user struggling with RIGHT NOW? (1-2 sentences)
2. PATTERN: What recurring behavior do you see? (1 sentence)
3. FOR OTHER AGENTS: What's the most useful context to pass to the next agent? (1 sentence)

Be analytical. Cold-read. Don't be therapeutic — leave that to the tone agents.`;

  const text = await chat(ctx.messages, { system: SYSTEM, temperature: 0.6 });

  return {
    text,
    agent: "oracle",
    sideEffects: [{ ts: Date.now(), type: "oracle_brief", source: "passive", value: text.slice(0, 300) }],
  };
}
