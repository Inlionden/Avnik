// 🔒 SHARED CONTRACTS — frozen. Every session imports from here.
// Owned by Session 1. Do not edit in other sessions; add module-local types instead.

export type Provider = "gemini" | "groq";

export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  agent?: string; // which agent produced an assistant message
};

// ── Tasks & goals ──────────────────────────────────────────
export type TaskStatus = "todo" | "doing" | "done" | "blocked";
export type Task = {
  id: string;
  title: string;
  deadline?: string; // ISO
  effortMin?: number;
  importance?: number; // 0–100
  status: TaskStatus;
  blockers?: string[];
  goalId?: string;
  createdAt: number;
};

export type Goal = {
  id: string;
  title: string; // the Red Book entry — what they want to become
  why?: string;
  createdAt: number;
};

// ── The user model ─────────────────────────────────────────
export type Ocean = {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}; // 0–100

export type Profile = {
  name?: string;
  ocean: Ocean;
  workStyle: Record<string, string>; // chronotype, focus, planning, social, drive
  motivation: Record<string, number>; // achievement, curiosity, ... 0–100
  commProfile: Record<string, number>; // directness, examples, brevity, ... 0–100
  onboarded: boolean;
};

// Root-cause probability vector (sums ~1) — see features/math/bayesian-belief.md
export type RootCauses = Record<string, number>;
export type BeliefState = {
  rootCauses: RootCauses;
  confidence: number; // 0–1
  traits: Record<string, number>; // confidence, stress, discipline, focus, consistency (0–100)
  updatedAt: number;
};

// ── Events (the passive+active signal log) ─────────────────
export type Event = {
  ts: number;
  type: string; // 'task_done' | 'mood' | 'journal' | 'focus' | 'delay' | ...
  source: "active" | "passive";
  taskId?: string;
  value?: unknown;
};

// ── Agent contract ─────────────────────────────────────────
export type AgentResult = {
  text: string;
  agent: string;
  sideEffects?: Event[];
};

// ── Places (LifeOS, opt-in) ────────────────────────────────
export type Place = {
  id: string;
  label: string;
  zoneType: "sleep" | "eat" | "bath" | "study" | "office" | "shop" | "other";
  geo?: { lat: number; lng: number; radius: number };
};
