// 🪔 Daily Anchor — Philosophy Notebook. One AI-written page per day matched to user's state.
// Sources: Bhagavad Gita (fear/attachment), Stoics (distraction/delay), Nietzsche (purpose), Frankl (meaning)
import type { HelmContext } from "../state";
import type { AgentResult } from "@/lib/types";
import { chat } from "@/lib/ai";

const PHILOSOPHY_SOURCES: Record<string, { quote: string; source: string; theme: string }[]> = {
  fear: [
    { quote: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions.", source: "Bhagavad Gita 2.47", theme: "Act without attachment to outcome" },
    { quote: "It is not death that a man should fear, but he should fear never beginning to live.", source: "Marcus Aurelius", theme: "Fear of beginning" },
  ],
  perfectionism: [
    { quote: "Have no fear of perfection — you'll never reach it.", source: "Salvador Dali", theme: "Good enough ships" },
    { quote: "Done is better than perfect.", source: "Sheryl Sandberg", theme: "Completion beats perfection" },
  ],
  burnout: [
    { quote: "It is not that we have a short time to live, but that we waste a good deal of it.", source: "Seneca, On the Shortness of Life", theme: "Time is the only real resource" },
    { quote: "Rest is not idleness.", source: "John Lubbock", theme: "Recovery is productive" },
  ],
  clarity: [
    { quote: "He who has a why to live can bear almost any how.", source: "Friedrich Nietzsche", theme: "Purpose creates energy" },
    { quote: "Begin, to begin is half the work.", source: "Ausonius", theme: "Starting creates clarity" },
  ],
  distraction: [
    { quote: "Concentrate all your thoughts upon the work at hand.", source: "Alexander Graham Bell", theme: "Single focus" },
    { quote: "All of humanity's problems stem from man's inability to sit quietly in a room alone.", source: "Blaise Pascal", theme: "The restless mind" },
  ],
  default: [
    { quote: "The secret of getting ahead is getting started.", source: "Mark Twain", theme: "Action" },
    { quote: "He who is not contented with what he has, would not be contented with what he would like to have.", source: "Socrates", theme: "Contentment" },
  ],
};

export async function anchor(ctx: HelmContext): Promise<AgentResult> {
  const topCause = Object.entries(ctx.beliefs?.rootCauses ?? {})
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "default";

  const sources = PHILOSOPHY_SOURCES[topCause] ?? PHILOSOPHY_SOURCES.default;
  const chosen = sources[Math.floor(Math.random() * sources.length)];

  const SYSTEM = `You are the Daily Anchor — you write one philosophy page per day for the user.
Today's context: mood=${ctx.state.mood}, energy=${(ctx.state.energy*100).toFixed(0)}%, root cause=${topCause}

Selected philosophy:
"${chosen.quote}" — ${chosen.source}
Theme: ${chosen.theme}

Write a short Daily Anchor page (3 paragraphs max):
1. Today's resistance (what the user is facing, 1 sentence)
2. The philosophy (connect the quote to their specific situation — make it personal)
3. Tomorrow's 5-min start (one concrete action for when they wake up)

Tone: reflective, wise, personal. Not generic. Not preachy.`;

  const text = await chat(ctx.messages, { system: SYSTEM, temperature: 0.82 });
  return {
    text,
    agent: "anchor",
    sideEffects: [{ ts: Date.now(), type: "daily_anchor", source: "active" as const, value: { quote: chosen.quote, source: chosen.source } }],
  };
}
