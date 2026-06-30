// ⏱️ Pacer — Selects + creates techniques as MCP-style timer tools.
// The "Technique Factory" — creates tools at runtime and registers them.
import type { HelmContext } from "../state";
import type { AgentResult } from "@/lib/types";
import { PRESETS } from "@/lib/techniques/presets";
import { registerTool } from "@/lib/tools/registry";
import { z } from "zod";
import { chat } from "@/lib/ai";

type TimerSession = {
  name: string;
  workMin: number;
  breakMin: number;
  startedAt: number;
  cyclesTotal: number;
  cyclesDone: number;
};

// Active sessions (in-memory for the request — client keeps state via sideEffects)
const activeSessions = new Map<string, TimerSession>();

export function createTechniqueTool(name: string, workMin: number, breakMin: number, cycles = 1) {
  registerTool({
    name: `startTechnique:${name}`,
    description: `Start a ${name} session: ${workMin}min work / ${breakMin}min break`,
    params: z.object({ taskId: z.string().optional() }),
    availability: "web",
    run: (args: unknown) => {
      const { taskId } = (args ?? {}) as { taskId?: string };
      const session: TimerSession = {
        name,
        workMin,
        breakMin,
        startedAt: Date.now(),
        cyclesTotal: cycles,
        cyclesDone: 0,
      };
      activeSessions.set(taskId ?? "default", session);
      return { started: true, session, message: `${name} started: ${workMin}min work → ${breakMin}min break` };
    },
  });
}

// Register all presets as tools on module load
for (const preset of PRESETS) {
  createTechniqueTool(preset.slug, preset.workMin || 25, preset.breakMin || 5, preset.cycles ?? 1);
}

export async function pacer(ctx: HelmContext): Promise<AgentResult> {
  const { state } = ctx;

  // Match technique to state
  function suggestTechnique() {
    if (state.energy < 0.25) return PRESETS.find(p => p.slug === "two-minute")!;
    if (state.mood === "burnt-out") return PRESETS.find(p => p.slug === "two-minute")!;
    if (state.mood === "avoidant") return PRESETS.find(p => p.slug === "frog")!;
    if (state.energy > 0.8) return PRESETS.find(p => p.slug === "ultradian")!;
    if (state.mood === "focused") return PRESETS.find(p => p.slug === "desktime")!;
    return PRESETS.find(p => p.slug === "pomodoro")!;
  }

  const best = suggestTechnique() ?? PRESETS[0];

  // Check if user wants a custom technique
  const wantsCustom = /custom|create|my own|[\d]+ min|minutes/.test(ctx.input.toLowerCase());

  if (wantsCustom) {
    const SYSTEM = `You are Pacer — the technique factory. Extract a custom timer from the user's message.
Output ONLY JSON: { "name": "...", "workMin": N, "breakMin": N, "reason": "..." }
Example: { "name": "Arjun Focus", "workMin": 40, "breakMin": 8, "reason": "40-min blocks fit your attention pattern" }`;
    try {
      const raw = await chat(ctx.messages, { system: SYSTEM, temperature: 0.3 });
      const parsed = JSON.parse(raw.trim());
      createTechniqueTool(parsed.name, parsed.workMin, parsed.breakMin);
      return {
        text: `⚙️ Created **${parsed.name}** (${parsed.workMin}/${parsed.breakMin}min) and registered it as a tool. ${parsed.reason} Ready to start?`,
        agent: "pacer",
        sideEffects: [{
          ts: Date.now(),
          type: "technique_created",
          source: "active" as const,
          value: parsed,
        }],
      };
    } catch { /* fall through to suggestion */ }
  }

  return {
    text: `${best.emoji} Recommending **${best.name}** (${best.workMin}/${best.breakMin}min) — ${best.description}. Best for: ${best.bestFor}. Ready to start?`,
    agent: "pacer",
    sideEffects: [{
      ts: Date.now(),
      type: "technique_suggested",
      source: "active" as const,
      value: { name: best.slug, workMin: best.workMin, breakMin: best.breakMin },
    }],
  };
}
