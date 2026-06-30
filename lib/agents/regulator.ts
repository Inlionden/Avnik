// ⚙️ Regulator — Current state agent. Monitors + updates CurrentState every turn.
// The nervous system that connects agents. Always runs first in the Helmsman loop.
import type { HelmContext, CurrentState } from "./state";
import {
  inferMoodFromText,
  inferEnergyFromText,
  moodToTone,
  patchState,
} from "./state";
import type { AgentResult } from "@/lib/types";

function inferPhase(ctx: HelmContext): CurrentState["phase"] {
  const t = ctx.input.toLowerCase();
  if (/break|pause|rest|lunch|walk/.test(t)) return "break";
  if (/plan|what should|priorit|what next|review/.test(t)) return "planning";
  if (/working|focusing|doing|started|in flow/.test(t)) return "working";
  return ctx.state.phase ?? "idle";
}

export function runRegulator(ctx: HelmContext): { state: CurrentState; changed: boolean } {
  const prevState = ctx.state;
  const mood = inferMoodFromText(ctx.input);
  const energy = inferEnergyFromText(ctx.input);
  const toneMode = moodToTone(mood);
  const phase = inferPhase(ctx);

  const newState = patchState(prevState, { mood, energy, toneMode, phase });

  const changed =
    mood !== prevState.mood ||
    Math.abs(energy - prevState.energy) > 0.2 ||
    phase !== prevState.phase;

  return { state: newState, changed };
}

// Registry-compatible wrapper (used by Helmsman before routing)
export async function regulator(ctx: HelmContext): Promise<AgentResult & { newState: CurrentState }> {
  const { state, changed } = runRegulator(ctx);

  const prev = ctx.state;
  const text = changed
    ? `State: ${prev.mood} → ${state.mood} | energy ${(prev.energy * 100).toFixed(0)}% → ${(state.energy * 100).toFixed(0)}% | tone → ${state.toneMode}`
    : `State stable: ${state.mood} | energy ${(state.energy * 100).toFixed(0)}% | tone ${state.toneMode}`;

  return {
    text,
    agent: "regulator",
    newState: state,
    sideEffects: [{
      ts: Date.now(),
      type: "state_update",
      source: "passive" as const,
      value: state,
    }],
  };
}
