// 📜 Chronicler — Agent info collector. Tracks what agents did and how well.
import { chat } from "@/lib/ai";
import type { HelmContext } from "./state";
import type { AgentResult } from "@/lib/types";

export async function chronicler(ctx: HelmContext): Promise<AgentResult> {
  const { state } = ctx;
  const trail = state.agentTrail;

  const trailText = trail.length
    ? trail.map(e =>
        `[${new Date(e.ts).toLocaleTimeString()}] ${e.agent}: "${e.summary}"`
      ).join("\n")
    : "No agents have run yet this session.";

  const SYSTEM = `You are Chronicler — Avnik's agent historian and quality tracker.
You track what each agent has done, what worked, what gaps exist in the agent collaboration.

Agent trail this session:
${trailText}

Produce a 3-part internal memo:
1. COVERAGE: Which agents collaborated? What was the flow?
2. GAPS: Any handoff problems? Missing agent for a user need? Redundancy?
3. QUALITY: Which response was strongest? Which agent could have done better and how?

This memo is used by Helmsman to improve future routing. Be direct.`;

  const text = await chat(ctx.messages, { system: SYSTEM, temperature: 0.6 });
  return { text, agent: "chronicler" };
}
