// 🔮 Future Self — Talk to Present / Future (1yr) / Past self. Collapses temporal discounting.
import type { HelmContext } from "../state";
import type { AgentResult } from "@/lib/types";
import { chat } from "@/lib/ai";

type SelfPerspective = "present" | "future" | "past";

const PERSONA_SYSTEMS: Record<SelfPerspective, string> = {
  present: `You are the user's PRESENT SELF. Speak in first person from where they are right now.
You feel the resistance, the doubt, the fatigue. But you also know what you're capable of.
Be honest about the struggle but grounded in capability.`,
  future: `You are the user's FUTURE SELF — one year from now. You succeeded.
Speak to your past self (today's user) with warmth and specific wisdom.
Tell them: what you did that mattered. What you wish you'd known. What you should start RIGHT NOW.
Say: "I succeeded because I started before I felt ready."
Reference their specific goals if you know them.`,
  past: `You are the user's PAST SELF — one year ago. Speak to their current self.
Remind them of a time they overcame something hard. What did past-you believe then?
Help them see that they've grown — and that the current challenge is within their capability.`,
};

function detectPerspective(input: string): SelfPerspective {
  const t = input.toLowerCase();
  if (/future|1 year|one year|letter from|future self/.test(t)) return "future";
  if (/past|before|last year|who i was|younger/.test(t)) return "past";
  return "present";
}

export async function futureSelf(ctx: HelmContext): Promise<AgentResult> {
  const perspective = detectPerspective(ctx.input);
  const system = PERSONA_SYSTEMS[perspective];
  const goalContext = ctx.tasks?.filter(t => (t.importance ?? 0) >= 80)
    .map(t => `"${t.title}"`).join(", ");

  const fullSystem = system + (goalContext ? `\nUser's goals: ${goalContext}` : "");

  const text = await chat(ctx.messages, { system: fullSystem, temperature: 0.88 });
  return {
    text,
    agent: "future-self",
    sideEffects: [{
      ts: Date.now(),
      type: "future_self_dialogue",
      source: "active" as const,
      value: { perspective },
    }],
  };
}
