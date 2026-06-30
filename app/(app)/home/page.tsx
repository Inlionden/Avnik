"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Zap, BookOpen, Target, BarChart3, CheckCircle2, Quote, MessageSquare, CalendarDays, Play } from "lucide-react";
import { get, KEYS } from "@/lib/memory";
import AgentFlow from "@/components/AgentFlow";
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

const HOW_TO = [
  { n: "01", icon: MessageSquare, title: "Talk to it", desc: "Tell Avnik what you're avoiding, stuck on, or need to get done. No forms — just type." },
  { n: "02", icon: CalendarDays, title: "Plan your day", desc: "Ask it to plan your day. It breaks work into tasks and drops them straight into your Day Plan." },
  { n: "03", icon: Play, title: "Execute & focus", desc: "Start a real focus timer, finish tasks, and watch Avnik learn your patterns over time." },
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
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const day = Math.floor(Date.now() / 86_400_000);
    setQuote(QUOTES[day % QUOTES.length]);
    const tasks = get<Task[]>(KEYS.tasks, []);
    setOpenTasks(tasks.filter(t => t.status !== "done").length);
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const events = get<Event[]>(KEYS.events, []);
    setDoneToday(events.filter(e => e.type === "task_done" && e.ts > todayStart).length);
    const days = new Set(events.filter(e => e.source === "active").map(e => Math.floor(e.ts / 86_400_000)));
    setStreak(days.size);
    setHydrated(true);
  }, []);

  function submit() {
    if (!input.trim()) return;
    router.push(`/coach?q=${encodeURIComponent(input.trim())}`);
  }

  const QUICK = [
    { href: "/coach?mode=plan",  icon: Zap,       title: "What now?",  desc: "AI prioritizes" },
    { href: "/tasks",            icon: CalendarDays, title: "Day plan", desc: "Schedule work" },
    { href: "/journal",          icon: BookOpen,  title: "Sanctuary",  desc: "Write it out" },
    { href: "/insights",         icon: BarChart3, title: "Patterns",   desc: "See yourself" },
  ];

  return (
    <div className="space-y-10">

      {/* ── Hero (full width) ── */}
      <section className="relative anim-fade-up">
        <div className="inline-flex items-center gap-2 border border-border rounded-full px-3.5 py-1.5 mb-6 bg-surface">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[11px] font-semibold text-muted uppercase tracking-widest">30 agents · ready</span>
        </div>

        <p className="text-sm font-medium text-muted mb-2">{hydrated ? getGreeting() : "Hello"}.</p>
        <h1 className="text-[44px] sm:text-[60px] lg:text-[68px] font-black text-ink leading-[0.95] tracking-tight text-balance mb-7 max-w-4xl">
          What&apos;s the one thing{" "}
          <span className="relative inline-block">
            you&apos;re avoiding
            <svg className="absolute -bottom-1 left-0 w-full" height="7" viewBox="0 0 400 7" preserveAspectRatio="none">
              <path d="M0 5 Q200 1 400 5" stroke="#f59e0b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            </svg>
          </span>
          ?
        </h1>

        <div className="relative max-w-2xl">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="Tell Avnik what's on your mind…"
            className="w-full rounded-full border border-border bg-surface pl-6 pr-16 py-4.5 text-[15px] text-ink placeholder:text-muted outline-none focus:border-ink transition-colors shadow-sm"
            style={{ paddingTop: "1.1rem", paddingBottom: "1.1rem" }}
          />
          <button
            onClick={submit}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-ink flex items-center justify-center hover:bg-brand-600 transition active:scale-95"
          >
            <ArrowRight className="size-4 text-white" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 text-[12px] text-muted">
          {["No sign-up", "Private by default", "Works offline"].map((b, i) => (
            <span key={b} className="flex items-center gap-1.5 anim-fade-up" style={{ animationDelay: `${200 + i * 60}ms` }}>
              <CheckCircle2 size={13} className="text-ink/50" /> {b}
            </span>
          ))}
        </div>
      </section>

      {/* ── Bento row: quote (wide) + stats + agent flow ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 anim-fade-up delay-100">
        {/* Daily Anchor — spans 2 */}
        <div className="lg:col-span-2 relative rounded-2xl bg-ink text-white p-8 overflow-hidden flex flex-col justify-center min-h-[260px]">
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
          <Quote size={26} className="text-amber-400 mb-4 relative z-10" />
          <p className="relative z-10 text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase mb-3">Daily Anchor</p>
          <blockquote className="relative z-10">
            <p className="text-[24px] sm:text-[30px] font-black leading-[1.15] text-balance">&ldquo;{quote.text}&rdquo;</p>
            <footer className="mt-5 text-[14px] text-white/50 font-medium">— {quote.author}</footer>
          </blockquote>
        </div>

        {/* Stats stacked */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
          {[
            { value: openTasks, label: "Open tasks", accent: "text-ink" },
            { value: doneToday, label: "Done today", accent: "text-success" },
            { value: streak,    label: "Active days", accent: "text-accent" },
          ].map(s => (
            <div key={s.label} className="flex-1 rounded-2xl border border-border bg-surface flex items-center justify-between px-5 py-4">
              <span className="text-[13px] font-medium text-muted">{s.label}</span>
              <span className={`text-[34px] font-black tabular-nums leading-none ${s.accent}`}>{s.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── How to use Avnik ── */}
      <section className="anim-fade-up delay-150">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted mb-2">Getting started</p>
            <h2 className="text-[26px] sm:text-[32px] font-black text-ink leading-tight">How to use Avnik</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {HOW_TO.map((s, i) => (
            <div key={s.n} className="relative rounded-2xl border border-border bg-surface p-6 anim-fade-up" style={{ animationDelay: `${200 + i * 80}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-ink flex items-center justify-center">
                  <s.icon className="size-5 text-white" />
                </div>
                <span className="text-[28px] font-black text-border tabular-nums">{s.n}</span>
              </div>
              <h3 className="text-[17px] font-bold text-ink mb-2">{s.title}</h3>
              <p className="text-[13.5px] text-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Agent flow + quick actions ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 anim-fade-up delay-200">
        <AgentFlow />

        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted mb-4">Quick actions</p>
          <div className="grid grid-cols-2 gap-3">
            {QUICK.map((q, i) => (
              <Link
                key={q.href}
                href={q.href}
                className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 hover:border-ink/25 hover:shadow-md transition-all anim-fade-up"
                style={{ animationDelay: `${250 + i * 50}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-ink flex items-center justify-center transition-transform group-hover:rotate-6 group-hover:scale-110">
                  <q.icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-ink flex items-center gap-1">
                    {q.title}
                    <ArrowRight size={14} className="text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </p>
                  <p className="text-[12.5px] text-muted">{q.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
