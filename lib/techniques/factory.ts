import type { TechniquePreset } from "./presets";
import { PRESETS } from "./presets";

const custom: TechniquePreset[] = [];

export function createTechnique(cfg: Omit<TechniquePreset, "slug">): TechniquePreset {
  const t: TechniquePreset = {
    ...cfg,
    slug: "custom-" + cfg.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
  };
  if (!custom.find((c) => c.slug === t.slug)) custom.push(t);
  return t;
}

export function listTechniques(): TechniquePreset[] {
  return [...PRESETS, ...custom];
}

export type UserState = {
  distraction?: number; // 0–100
  overwhelm?: number;
  energy?: number;
  inFlow?: boolean;
  fatigue?: number;
  taskCount?: number;
};

export function suggestTechnique(state: UserState): TechniquePreset & { reason: string } {
  const find = (slug: string) => PRESETS.find((p) => p.slug === slug)!;

  if (state.inFlow || (state.energy ?? 50) > 75)
    return { ...find("ultradian"), reason: "You're in flow — ride the 90-min wave." };
  if ((state.overwhelm ?? 0) > 60 || (state.distraction ?? 0) > 70)
    return { ...find("two-minute"), reason: "Just 2 minutes — momentum takes over." };
  if ((state.fatigue ?? 0) > 60)
    return { ...find("pomodoro"), reason: "Short cycles protect your energy." };
  if ((state.taskCount ?? 1) > 5)
    return { ...find("timebox"), reason: "Many tasks — timebox each one to stay on track." };
  if ((state.energy ?? 50) > 60)
    return { ...find("desktime"), reason: "High energy — 52/17 maximises sustained output." };
  return { ...find("pomodoro"), reason: "Classic Pomodoro — reliable default for any day." };
}
