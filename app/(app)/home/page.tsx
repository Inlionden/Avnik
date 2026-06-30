"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Zap, BookOpen, Target, BarChart3, CheckCircle2, Quote } from "lucide-react";
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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return "Still up?";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

export default function HomePage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [quote, setQuote] = useState(QUOTES[0]);
  const [openTasks, setOpenTasks] = useState(0);
  const [doneToday, setDoneToday] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const day = Math.floor(Date.now() / 86_400_000);
    setQuote(QUOTES[day % QUOTES.length]);

    const tasks = get<Task[]>(KEYS.tasks, []);
    setOpenTasks(tasks.filter(t => t.status !== "done").length);

    const todayStart = new Date().setHours(0, 0, 0, 0);
    const events = get<Event[]>(KEYS.events, []);
    setDoneToday(events.filter(e => e.type === "task_done" && e.ts > todayStart).length);

    // crude streak: distinct days with any active event
    const days = new Set(events.filter(e => e.source === "active").map(e => Math.floor(e.ts / 86_400_000)));
    setStreak(days.size);
  }, []);

  function submit() {
    if (!input.trim()) return;
    router.push(`/coach?q=${encodeURIComponent(input.trim())}`);
  }

  const QUICK = [
    { href: "/coach?mode=plan",  icon: Zap,       title: "What now?",   desc: "AI prioritizes" },
    { href: "/journal",          icon: BookOpen,  title: "Sanctuary",   desc: "Write it out" },
    { href: "/coach?mode=focus", icon: Target,    title: "Focus mode",  desc: "Start a session" },
    { href: "/insights",         icon: BarChart3, title: "Patterns",    desc: "See yourself" },
  ];

  return (
    <div className="max-w-3xl mx-auto">

      {/* ── Hero ── */}
      <section className="relative pt-6 pb-10 anim-fade-up">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 border border-border rounded-full px-3.5 py-1.5 mb-6 bg-surface">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[11px] font-semibold text-muted uppercase tracking-widest">30 agents · ready</span>
        </div>

        {/* Greeting + headline */}
        <p className="text-sm font-medium text-muted mb-2">{getGreeting()}.</p>
        <h1 className="text-[40px] sm:text-[52px] font-black text-ink leading-[0.96] tracking-tight text-balance mb-6">
          What&apos;s the one thing<br />
          <span className="relative inline-block">
            you&apos;re avoiding
            <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 400 6" preserveAspectRatio="none">
              <path d="M0 5 Q200 0 400 5" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </span>
          ?
        </h1>

        {/* Top input — "upper sign where you can type" */}
        <div className="relative max-w-xl">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="Tell Avnik what's on your mind…"
            className="w-full rounded-full border border-border bg-surface pl-5 pr-14 py-4 text-[15px] text-ink placeholder:text-muted outline-none focus:border-ink transition-colors shadow-sm"
          />
          <button
            onClick={submit}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ink flex items-center justify-center hover:bg-brand-600 transition active:scale-95"
          >
            <ArrowRight className="size-4 text-white" />
          </button>
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 text-[12px] text-muted">
          {["No sign-up", "Private by default", "Works offline"].map((b, i) => (
            <span key={b} className="flex items-center gap-1.5 anim-fade-up" style={{ animationDelay: `${200 + i * 60}ms` }}>
              <CheckCircle2 size={13} className="text-ink/50" /> {b}
            </span>
          ))}
        </div>
      </section>

      {/* ── Daily Anchor quote (inverted block, template style) ── */}
      <section className="mb-8 anim-fade-up delay-100">
        <div className="relative rounded-2xl bg-ink text-white p-7 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
          <Quote size={22} className="text-amber-400 mb-4 relative z-10" />
          <p className="relative z-10 text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase mb-3">Daily Anchor</p>
          <blockquote className="relative z-10">
            <p className="text-[19px] sm:text-[22px] font-bold leading-snug text-balance">&ldquo;{quote.text}&rdquo;</p>
            <footer className="mt-4 text-[13px] text-white/50 font-medium">— {quote.author}</footer>
          </blockquote>
        </div>
      </section>

      {/* ── Stats (monochrome grid, template style) ── */}
      <section className="mb-8 anim-fade-up delay-150">
        <div className="grid grid-cols-3 gap-px bg-border border border-border rounded-2xl overflow-hidden">
          {[
            { value: openTasks, label: "Open tasks" },
            { value: doneToday, label: "Done today" },
            { value: streak,    label: "Active days" },
          ].map(s => (
            <div key={s.label} className="bg-surface flex flex-col items-center justify-center py-7 px-3 text-center">
              <div className="text-[32px] font-black text-ink leading-none tabular-nums">{s.value}</div>
              <div className="text-[12px] text-muted mt-2 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quick actions ── */}
      <section className="mb-8 anim-fade-up delay-200">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted mb-4">Quick actions</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK.map((q, i) => (
            <Link
              key={q.href}
              href={q.href}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4 hover:border-ink/25 hover:shadow-md transition-all anim-fade-up"
              style={{ animationDelay: `${250 + i * 50}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-ink flex items-center justify-center shrink-0 transition-transform group-hover:rotate-6 group-hover:scale-110">
                <q.icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-ink">{q.title}</p>
                <p className="text-[12.5px] text-muted">{q.desc}</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
