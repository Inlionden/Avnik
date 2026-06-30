// 🤝 Contractor — The Ulysses Contract. Pre-commitment + renegotiation + blameless post-mortem.
// Named after Ulysses who had himself tied to the mast to resist the Sirens.
import type { HelmContext } from "../state";
import type { AgentResult, Event } from "@/lib/types";
import { chat } from "@/lib/ai";

export type Contract = {
  id: string;
  taskId?: string;
  taskTitle: string;
  promisedAt: number;
  deadline: number; // absolute timestamp
  scope: string; // what they committed to
  status: "active" | "honored" | "missed" | "renegotiated";
  renegotiatedScope?: string;
};

export async function contractor(ctx: HelmContext): Promise<AgentResult> {
  const now = Date.now();
  const input = ctx.input.toLowerCase();

  const isMissed = /miss|didn't|did not|failed|couldn't|couldn\'t/.test(input);
  const isRenegotiate = /renegotiate|can't|change|scale.?down|less/.test(input);
  const isNewContract = /commit|promise|by|ulysses|contract|pledge|done by/.test(input);

  if (isMissed) {
    const SYSTEM = `You are Contractor — the Ulysses Contract agent. A commitment was missed.
Your job: run a BLAMELESS post-mortem. Not "you failed" but "what prevented success?"

3-part response:
1. WHAT HAPPENED: Neutral description of the gap (what was committed, what occurred)
2. ROOT CAUSE: What actually got in the way? (time? energy? clarity? fear?) 1 sentence.
3. LEARNING: One specific change for the next contract. Add to Failure Library.

Then offer: "Ready to make a new smaller commitment right now?"
Tone: warm, not punishing. Failure is data.`;
    const text = await chat(ctx.messages, { system: SYSTEM, temperature: 0.72 });
    return { text, agent: "contractor", sideEffects: [{ ts: now, type: "contract_missed", source: "active" as const, value: { input: ctx.input } }] };
  }

  if (isRenegotiate) {
    const SYSTEM = `You are Contractor — negotiating a scope reduction.
The user's motivation has dropped mid-commitment. This is normal. Renegotiate, don't abandon.
Respond with: "Okay. New commitment: [smaller scope]. Can you do that in the next [shorter time]?"
Make it feel like a fresh start, not a defeat. Ulysses renegotiates when the wind changes.`;
    const text = await chat(ctx.messages, { system: SYSTEM, temperature: 0.75 });
    return { text, agent: "contractor" };
  }

  // New contract
  const SYSTEM = `You are Contractor — the Ulysses Contract keeper.
The user wants to make a pre-commitment (named after Ulysses who resisted Sirens by committing ahead).

Help them make a SPECIFIC, ACHIEVABLE contract:
- Task: [exact task name]
- Scope: [minimum acceptable version — what counts as done]
- Deadline: [specific time today or tomorrow]
- Stakes (optional): [what they'll do if they miss — just report back here]

Output the contract as:
📜 ULYSSES CONTRACT
Task: ___
Scope: ___
Deadline: ___
Stakes: ___

Then say: "Contract sealed. I'll check in at [deadline]. You can always renegotiate if needed."`;

  const text = await chat(ctx.messages, { system: SYSTEM, temperature: 0.7 });
  return {
    text,
    agent: "contractor",
    sideEffects: [{ ts: now, type: "contract_created", source: "active" as const, value: { input: ctx.input } }],
  };
}
