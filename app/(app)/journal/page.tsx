"use client";
import { useState, useEffect } from "react";
import { Flame, PenLine, CheckCircle2, Clock } from "lucide-react";
import { get, set, append, KEYS } from "@/lib/memory";
import type { Event } from "@/lib/types";

const MOODS = [
  { id: "energized",  emoji: "⚡", label: "Energized" },
  { id: "focused",    emoji: "🎯", label: "Focused" },
  { id: "neutral",    emoji: "😐", label: "Neutral" },
  { id: "anxious",    emoji: "😰", label: "Anxious" },
  { id: "avoidant",   emoji: "🙈", label: "Avoidant" },
  { id: "burnt-out",  emoji: "😮‍💨", label: "Burnt out" },
];

const PROMPTS = [
  "What's the one thing making everything else easier or irrelevant?",
  "What are you avoiding right now, and why?",
  "What would your future self thank you for doing today?",
  "What's the smallest possible version of your biggest fear?",
  "If today were your last ordinary day, what would matter most?",
];

export default function JournalPage() {
  const [text, setText] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [entries, setEntries] = useState<{ date: string; text: string; mood: string }[]>([]);
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);

  useEffect(() => {
    const stored = get<typeof entries>(KEYS.journal, []);
    setEntries(stored.slice(-5).reverse());
  }, []);

  function save() {
    if (!text.trim()) return;
    const entry = {
      date: new Date().toLocaleString(),
      text: text.trim(),
      mood: mood ?? "neutral",
    };
    const key = KEYS.journal;
    const all = get<typeof entries>(key, []);
    const updated = [...all, entry];
    set(key, updated);
    setEntries(updated.slice(-5).reverse());

    // Log event
    append<Event>(KEYS.events, {
      ts: Date.now(),
      type: "journal",
      source: "active" as const,
      value: { mood, length: text.trim().length },
    });
    if (mood) {
      append<Event>(KEYS.events, {
        ts: Date.now(),
        type: "mood_checkin",
        source: "active" as const,
        value: { mood },
      });
    }

    setText("");
    setMood(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Sanctuary</h1>
          <p className="text-xs text-muted mt-0.5">Write it. Own it. Let it go.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Clock className="size-3.5" />
          <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
        </div>
      </div>

      {/* RED Notebook card */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-red-200">
        {/* Red spine */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-b from-red-600 to-red-800 flex flex-col items-center justify-center gap-1">
          <div className="w-1 h-1 rounded-full bg-red-300/60" />
          <div className="w-1 h-1 rounded-full bg-red-300/60" />
          <div className="w-1 h-1 rounded-full bg-red-300/60" />
        </div>

        {/* Notebook body */}
        <div className="ml-8 bg-[#fffef7]">
          {/* Top header strip */}
          <div className="bg-red-600 px-5 py-3 flex items-center gap-2">
            <Flame className="size-4 text-red-100" />
            <p className="text-red-100 text-xs font-bold tracking-widest uppercase">Red Book · Private</p>
          </div>

          {/* Ruled lines background */}
          <div className="relative px-5 py-4" style={{
            backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, #e8e0d0 27px, #e8e0d0 28px)",
            backgroundPosition: "0 32px",
          }}>
            {/* Prompt */}
            <p className="text-xs italic text-red-800/70 mb-3 font-medium">✦ {prompt}</p>

            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Start writing…"
              rows={7}
              className="w-full bg-transparent resize-none outline-none text-sm text-ink leading-7 placeholder:text-muted/50 font-serif"
            />
          </div>

          {/* Mood + Save */}
          <div className="px-5 pb-4 border-t border-red-100">
            <p className="text-[11px] text-muted uppercase tracking-widest mt-3 mb-2 font-semibold">How are you feeling?</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {MOODS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMood(mood === m.id ? null : m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                    mood === m.id
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-white border-red-200 text-ink hover:border-red-400"
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={save}
              disabled={!text.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-700 transition shadow-sm"
            >
              {saved ? (
                <><CheckCircle2 className="size-4" /> Saved!</>
              ) : (
                <><PenLine className="size-4" /> Save entry</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Recent entries */}
      {entries.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest">Recent entries</p>
          {entries.map((e, i) => (
            <div key={i} className="rounded-xl border border-line bg-surface px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-muted">{e.date}</span>
                <span className="text-xs">{MOODS.find(m => m.id === e.mood)?.emoji ?? "😐"}</span>
              </div>
              <p className="text-sm text-ink line-clamp-2 font-serif italic">&ldquo;{e.text}&rdquo;</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
