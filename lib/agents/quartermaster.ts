// ⚔️ Quartermaster — Tactics agent. Picks the right technique from 12 options.
import { chat } from "@/lib/ai";
import type { HelmContext } from "./state";
import type { AgentResult } from "@/lib/types";
import { PRESETS } from "@/lib/techniques/presets";

const EXTRA_TACTICS = [
  {
    name: "WOOP",
    bestFor: "Motivation crisis / stuck on WHY",
    desc: "Wish → Outcome → Obstacle → Plan. Mental contrasting that actually works.",
  },
  {
    name: "Temptation Bundling",
    bestFor: "Resistance to a specific recurring task",
    desc: "Pair the dreaded task with something you enjoy (music, coffee, a show).",
  },
  {
    name: "Anti-Perfection Mode",
    bestFor: "Perfectionism paralysis",
    desc: "Deliberately aim for 70% quality. Ship the ugly draft. Refine later.",
  },
  {
    name: "5-Minute Bargain",
    bestFor: "Starting resistance / can't begin",
    desc: "Commit to just 5 minutes. No commitment beyond that. (Usually continues.)",
  },
  {
    name: "Daily Anchor",
    bestFor: "Inconsistency / habit building",
    desc: "Same time + same place + same ritual every session. Removes decision cost.",
  },
];

export async function quartermaster(ctx: HelmContext): Promise<AgentResult> {
  const { state } = ctx;

  const allTactics = [
    ...PRESETS.map(p => `${p.emoji} **${p.name}** (${p.workMin > 0 ? `${p.workMin}/${p.breakMin}min` : "flexible"}): ${p.description} | Best for: ${p.bestFor}`),
    ...EXTRA_TACTICS.map(t => `🎯 **${t.name}**: ${t.desc} | Best for: ${t.bestFor}`),
  ].join("\n");

  const SYSTEM = `You are Quartermaster — Avnik's tactics agent.
You pick the RIGHT technique for right NOW. Not a list of options — a decision.

Current state:
- Mood: ${state.mood} | Energy: ${(state.energy * 100).toFixed(0)}% | Phase: ${state.phase}
- Active tasks: ${ctx.tasks?.filter(t => t.status !== "done").length ?? 0}

Available techniques:
${allTactics}

Pick 1 technique (2 if genuinely complementary). Output:
1. **[Technique Name]** — Why this fits RIGHT NOW (1 sentence)
2. Exact setup: timer duration, what to do in first 60 seconds
3. Optional: one sentence on what to do if it breaks down

Be decisive. One right choice beats three maybes.`;

  const text = await chat(ctx.messages, { system: SYSTEM, temperature: 0.7 });
  return { text, agent: "quartermaster" };
}
