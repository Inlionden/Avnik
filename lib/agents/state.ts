// CurrentState — shared "nervous system" of the agent network.
// Pure functions only (server-safe). No localStorage access here.
import type { Event } from "@/lib/types";

export type Mood = "anxious" | "energized" | "avoidant" | "focused" | "burnt-out" | "neutral";
export type ToneMode = "gentle" | "energetic" | "stoic";
export type SessionPhase = "idle" | "working" | "break" | "planning";

export type AgentTrailEntry = { agent: string; ts: number; summary: string };

export type CurrentState = {
  mood: Mood;
  energy: number; // 0-1
  toneMode: ToneMode;
  activeTaskId?: string;
  sessionStart: number;
  phase: SessionPhase;
  urgencyTop3: string[]; // task IDs by TMT score
  agentTrail: AgentTrailEntry[];
  lastUpdated: number;
};

// Extended context that all internal agents receive (superset of AgentContext)
import type { Message, Profile, BeliefState, Task } from "@/lib/types";

export type HelmContext = {
  input: string;
  messages: Message[];
  profile?: Profile;
  beliefs?: BeliefState;
  tasks?: Task[];
  events?: Event[];
  state: CurrentState;
};

export const DEFAULT_STATE: CurrentState = {
  mood: "neutral",
  energy: 0.7,
  toneMode: "gentle",
  sessionStart: Date.now(),
  phase: "idle",
  urgencyTop3: [],
  agentTrail: [],
  lastUpdated: Date.now(),
};

export function createState(patch?: Partial<CurrentState>): CurrentState {
  return { ...DEFAULT_STATE, ...patch, lastUpdated: Date.now() };
}

export function patchState(state: CurrentState, patch: Partial<CurrentState>): CurrentState {
  return { ...state, ...patch, lastUpdated: Date.now() };
}

export function addToTrail(state: CurrentState, entry: AgentTrailEntry): CurrentState {
  const trail = [...state.agentTrail.slice(-19), entry];
  return { ...state, agentTrail: trail, lastUpdated: Date.now() };
}

export function moodToTone(mood: Mood): ToneMode {
  if (mood === "anxious" || mood === "burnt-out") return "gentle";
  if (mood === "avoidant" || mood === "focused") return "stoic";
  return "energetic";
}

// Fast keyword-based mood inference (no LLM cost)
export function inferMoodFromText(text: string): Mood {
  const t = text.toLowerCase();
  if (/tired|exhaust|drain|can't|cannot|overwhelm|stuck|lost|burnout|burnt/.test(t)) return "burnt-out";
  if (/anxious|worried|scared|nervous|panic|stress|pressure|deadline/.test(t)) return "anxious";
  if (/avoid|procrastinat|delay|later|don't feel|not feel|can't start|can't begin/.test(t)) return "avoidant";
  if (/ready|let's go|pump|excit|fire|grind|crush|let me|going to/.test(t)) return "energized";
  if (/focus|working|in flow|deep work|concentrat|on it/.test(t)) return "focused";
  return "neutral";
}

export function inferEnergyFromText(text: string): number {
  const t = text.toLowerCase();
  if (/tired|exhaust|drain|burnt|can't|overwhelm|stuck/.test(t)) return 0.2;
  if (/energiz|ready|pump|excit|flow|crush/.test(t)) return 0.9;
  if (/okay|fine|alright|so-so|meh/.test(t)) return 0.5;
  return 0.65;
}
