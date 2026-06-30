export type TechniquePreset = {
  name: string;
  slug: string;
  description: string;
  bestFor: string;
  workMin: number;
  breakMin: number;
  cycles?: number;
  longBreakMin?: number;
  flowtime?: boolean;
  twoMinute?: boolean;
  emoji: string;
};

export const PRESETS: TechniquePreset[] = [
  {
    name: "Classic Pomodoro",
    slug: "pomodoro",
    description: "25 min work · 5 min break · long break after 4 cycles",
    bestFor: "General focus",
    workMin: 25,
    breakMin: 5,
    cycles: 4,
    longBreakMin: 15,
    emoji: "🍅",
  },
  {
    name: "DeskTime 52/17",
    slug: "desktime",
    description: "52 min work · 17 min break — derived from real productivity data",
    bestFor: "Sustained knowledge work",
    workMin: 52,
    breakMin: 17,
    emoji: "⏱️",
  },
  {
    name: "Sprint 50/10",
    slug: "sprint",
    description: "50 min deep sprint · 10 min real break",
    bestFor: "Longer deep blocks",
    workMin: 50,
    breakMin: 10,
    emoji: "🏃",
  },
  {
    name: "Ultradian 90",
    slug: "ultradian",
    description: "90 min flow block · 20 min full recovery (follows ultradian rhythm)",
    bestFor: "Deep flow, big creative tasks",
    workMin: 90,
    breakMin: 20,
    emoji: "🌊",
  },
  {
    name: "Flowtime",
    slug: "flowtime",
    description: "Work until a natural stopping point · break = ⅕ of worked time",
    bestFor: "In flow / hates fixed interruptions",
    workMin: 0,
    breakMin: 0,
    flowtime: true,
    emoji: "🌀",
  },
  {
    name: "2-Minute Rule",
    slug: "two-minute",
    description: "Just commit to 2 minutes — momentum takes over",
    bestFor: "Severe avoidance / can't start",
    workMin: 2,
    breakMin: 5,
    twoMinute: true,
    emoji: "⚡",
  },
  {
    name: "Eat the Frog",
    slug: "frog",
    description: "Hardest task first · single unbroken 60-min block",
    bestFor: "Overwhelm + one clear priority",
    workMin: 60,
    breakMin: 15,
    emoji: "🐸",
  },
  {
    name: "Timeboxing",
    slug: "timebox",
    description: "Fixed 30-min box per task from your day plan",
    bestFor: "Many small tasks / scattered day",
    workMin: 30,
    breakMin: 5,
    emoji: "📦",
  },
];
