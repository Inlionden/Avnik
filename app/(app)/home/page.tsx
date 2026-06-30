"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Zap, Star, BookOpen, BarChart3 } from "lucide-react";
import { get, KEYS } from "@/lib/memory";
import type { Task, Event } from "@/lib/types";

const QUOTES = [
  { text: "You have a right to perform your duties, but not to the fruits of your actions.", author: "Bhagavad Gita 2.47" },
  { text: "It is not death that a man should fear, but he should fear never beginning to live.", author: "Marcus Aurelius" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "It is not that we have a short time to live, but that we waste a good deal of it.", author: "Seneca" },
  { text: "Begin — to begin is half the work.", author: "Ausonius" },
  { text: "Concentrate all your thoughts upon the work at hand.", author: "Alexander Graham Bell" },
];

const GREETINGS = [
  { range: [5, 11],  text: "Good morning" },
  { range: [11, 14], text: "Good afternoon" },
  { range: [14, 18], text: "Good afternoon" },
  { range: [18, 21], text: "Good evening" },
  { range: [21, 24], text: "Good night" },
  { range: [0, 5],   text: "Still up?" },
];

function getGreeting() {
  const h = new Date().getHours();
  return GREETINGS.find(g => h >= g.range[0] && h < g.range[1])?.text ?? "Hello";
}

export default function HomePage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [quote, setQuote] = useState(QUOTES[0]);
  const [taskCount, setTaskCount] = useState(0);
  const [doneToday, setDoneToday] = useState(0);

  useEffect(() => {
    // Rotate quote daily (by day-of-year index)
    const day = Math.floor(Date.now() / 86_400_000);
    setQuote(QUOTES[day % QUOTES.length]);

    // Load task stats
    const tasks = get<Task[]>(KEYS.tasks, []);
    setTaskCount(tasks.filter(t => t.status !== "done").length);
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const events = get<Event[]>(KEYS.events, []);
    setDoneToday(events.filter(e => e.type === "task_done" && e.ts > todayStart).length);
  }, []);

  function handleSubmit() {
    if (!input.trim()) return;
    router.push(`/coach?q=${encodeURIComponent(input.trim())}`);
  }

  const greeting = getGreeting();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* Greeting */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-widest">{greeting}</p>
          <h1 className="text-2xl font-bold text-ink mt-0.5">What&apos;s alive in you today?</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-accent flex items-center justify-center shadow-md">
          <Star className="size-5 text-white" />
        </div>
      </div>

      {/* Quick input — goes to coach */}
      <div className="relative">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="Tell Avnik what's on your mind…"
          className="w-full rounded-2xl border-2 border-line bg-surface px-5 py-4 pr-14 text-sm text-ink placeholder:text-muted outline-none focus:border-brand transition-all shadow-sm"
        />
        <button
          onClick={handleSubmit}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-brand flex items-center justify-center shadow-sm hover:bg-brand/90 transition"
        >
          <ArrowRight className="size-4 text-white" />
        </button>
      </div>

      {/* Daily Quote card */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] p-6 shadow-xl">
        {/* subtle pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }} />
        <p className="text-[11px] font-semibold tracking-[0.2em] text-indigo-300 uppercase mb-3">Daily Anchor</p>
        <blockquote className="relative z-10">
          <p className="text-white/95 text-base font-medium leading-relaxed italic">&ldquo;{quote.text}&rdquo;</p>
          <footer className="mt-3 text-indigo-300 text-xs font-medium">— {quote.author}</footer>
        </blockquote>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-surface border border-line p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-ink">{taskCount}</p>
          <p className="text-[11px] text-muted mt-1">Open tasks</p>
        </div>
        <div className="rounded-2xl bg-success/10 border border-success/20 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-success">{doneToday}</p>
          <p className="text-[11px] text-muted mt-1">Done today</p>
        </div>
        <Link href="/coach?mode=review" className="rounded-2xl bg-brand/10 border border-brand/20 p-4 text-center shadow-sm hover:bg-brand/20 transition">
          <p className="text-2xl font-bold text-brand">↑</p>
          <p className="text-[11px] text-muted mt-1">Review</p>
        </Link>
      </div>

      {/* Quick actions */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted uppercase tracking-widest">Quick actions</p>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/coach?mode=plan"
            className="flex items-center gap-3 rounded-2xl bg-surface border border-line px-4 py-3 hover:border-brand/40 hover:bg-brand/5 transition shadow-sm group">
            <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center group-hover:bg-brand/20 transition">
              <Zap className="size-4 text-brand" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">What now?</p>
              <p className="text-[11px] text-muted">AI prioritizes</p>
            </div>
          </Link>

          <Link href="/journal"
            className="flex items-center gap-3 rounded-2xl bg-surface border border-line px-4 py-3 hover:border-amber-400/40 hover:bg-amber-50 transition shadow-sm group">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition">
              <BookOpen className="size-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Journal</p>
              <p className="text-[11px] text-muted">Write it out</p>
            </div>
          </Link>

          <Link href="/coach?mode=focus"
            className="flex items-center gap-3 rounded-2xl bg-surface border border-line px-4 py-3 hover:border-emerald-400/40 hover:bg-emerald-50 transition shadow-sm group">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition">
              <Star className="size-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Focus mode</p>
              <p className="text-[11px] text-muted">Start a session</p>
            </div>
          </Link>

          <Link href="/insights"
            className="flex items-center gap-3 rounded-2xl bg-surface border border-line px-4 py-3 hover:border-purple-400/40 hover:bg-purple-50 transition shadow-sm group">
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition">
              <BarChart3 className="size-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Insights</p>
              <p className="text-[11px] text-muted">See your patterns</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
