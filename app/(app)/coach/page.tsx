"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Zap, BookOpen, Target, BarChart3, MessageCircle, ChevronDown } from "lucide-react";
import { get, set, append, KEYS } from "@/lib/memory";
import type { Message, Profile, BeliefState, Task, Event } from "@/lib/types";
import type { CurrentState } from "@/lib/agents/state";

type ChatMode = "chat" | "plan" | "vent" | "focus" | "review";

const MODES: { id: ChatMode; icon: typeof MessageCircle; label: string; placeholder: string; color: string }[] = [
  { id: "chat",   icon: MessageCircle, label: "Chat",   placeholder: "What's on your mind?",           color: "text-brand" },
  { id: "plan",   icon: Target,        label: "Plan",   placeholder: "What should I prioritize?",       color: "text-indigo-600" },
  { id: "vent",   icon: Zap,           label: "Vent",   placeholder: "I just need to say this…",        color: "text-alert" },
  { id: "focus",  icon: Target,        label: "Focus",  placeholder: "Help me start a focus session…",  color: "text-success" },
  { id: "review", icon: BarChart3,     label: "Review", placeholder: "How am I doing? Be honest.",      color: "text-amber-600" },
];

const AGENT_META: Record<string, { label: string; emoji: string; bg: string; text: string; border: string }> = {
  sage:          { label: "Sage",         emoji: "🌿", bg: "bg-emerald-50",  text: "text-emerald-700",  border: "border-emerald-200" },
  spark:         { label: "Spark",        emoji: "⚡", bg: "bg-amber-50",    text: "text-amber-700",    border: "border-amber-200" },
  sensei:        { label: "Sensei",       emoji: "🎋", bg: "bg-slate-50",    text: "text-slate-700",    border: "border-slate-200" },
  "north-star":  { label: "North Star",   emoji: "⭐", bg: "bg-indigo-50",   text: "text-indigo-700",   border: "border-indigo-200" },
  quartermaster: { label: "Quartermaster",emoji: "⚔️", bg: "bg-purple-50",   text: "text-purple-700",   border: "border-purple-200" },
  oracle:        { label: "Oracle",       emoji: "🔮", bg: "bg-teal-50",     text: "text-teal-700",     border: "border-teal-200" },
  auditor:       { label: "Auditor",      emoji: "🪞", bg: "bg-red-50",      text: "text-red-700",      border: "border-red-200" },
  chronicler:    { label: "Chronicler",   emoji: "📜", bg: "bg-blue-50",     text: "text-blue-700",     border: "border-blue-200" },
  "goal-keeper": { label: "Goal Keeper",  emoji: "📖", bg: "bg-violet-50",   text: "text-violet-700",   border: "border-violet-200" },
  contractor:    { label: "Contractor",   emoji: "📋", bg: "bg-orange-50",   text: "text-orange-700",   border: "border-orange-200" },
  sentinel:      { label: "Sentinel",     emoji: "👁️", bg: "bg-cyan-50",     text: "text-cyan-700",     border: "border-cyan-200" },
  helmsman:      { label: "Helmsman",     emoji: "🧭", bg: "bg-indigo-50",   text: "text-indigo-700",   border: "border-indigo-200" },
};

const MOOD_EMOJI: Record<string, string> = {
  neutral: "😐", anxious: "😰", "burnt-out": "😮‍💨", avoidant: "🙈", energized: "⚡", focused: "🎯",
};

const MODE_PREFIXES: Record<ChatMode, string> = {
  chat: "", plan: "[ROUTE_TO:north-star] ", vent: "[ROUTE_TO:tone] ",
  focus: "[ROUTE_TO:quartermaster] ", review: "[ROUTE_TO:auditor] ",
};

type AssistantMsg = Message & { agent?: string };

function CoachInner() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<AssistantMsg[]>([]);
  const [input, setInput] = useState(searchParams?.get("q") ?? "");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<ChatMode>((searchParams?.get("mode") as ChatMode) ?? "chat");
  const [currentState, setCurrentState] = useState<Partial<CurrentState>>({});
  const [showTrail, setShowTrail] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    // Auto-send if ?q= param provided
    const q = searchParams?.get("q");
    if (q && messages.length === 0) {
      setTimeout(() => send(q), 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send(override?: string) {
    const text = (override ?? input).trim();
    if (!text || loading) return;

    const prefix = MODE_PREFIXES[mode];
    const userMsg: AssistantMsg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const profile = get<Profile | undefined>(KEYS.profile, undefined);
      const beliefs = get<BeliefState | undefined>(KEYS.beliefs, undefined);
      const tasks   = get<Task[]>(KEYS.tasks, []);
      const events  = get<Event[]>(KEYS.events, []).slice(-30);

      const apiMessages: Message[] = next.map((m, i) =>
        i === next.length - 1
          ? { role: m.role, content: prefix + m.content }
          : { role: m.role, content: m.content }
      );

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, chatMode: mode, profile, beliefs, tasks, events, currentState }),
      });

      const data = await res.json();
      if (data.error) {
        setMessages([...next, { role: "assistant", content: `⚠️ ${data.error}`, agent: "helmsman" }]);
        return;
      }

      if (data.sideEffects?.length) {
        for (const effect of data.sideEffects as Event[]) append<Event>(KEYS.events, effect);
      }
      if (data.state) setCurrentState(data.state);

      setMessages([...next, { role: "assistant", content: data.reply ?? "…", agent: data.agent }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Network error — is the dev server running?", agent: "helmsman" }]);
    } finally {
      setLoading(false);
    }
  }

  const mood = (currentState as CurrentState)?.mood ?? "neutral";
  const trail = (currentState as CurrentState)?.agentTrail ?? [];
  const activePlaceholder = MODES.find(m => m.id === mode)?.placeholder ?? "What's on your mind?";

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] md:h-[calc(100dvh-2rem)] max-w-2xl mx-auto gap-3">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-ink">Avnik</h1>
          <span className="text-xs text-muted font-medium">· {trail.length > 0 ? `${trail.length} agents active` : "30 agents ready"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span title={`Mood: ${mood}`} className="text-xl">{MOOD_EMOJI[mood] ?? "😐"}</span>
          {trail.length > 0 && (
            <button
              onClick={() => setShowTrail(v => !v)}
              className="text-xs text-brand flex items-center gap-1 hover:underline"
            >
              Trail <ChevronDown className={`size-3 transition-transform ${showTrail ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* ── Input at top ── */}
      <div className="shrink-0 bg-surface rounded-2xl border border-line shadow-sm overflow-hidden">
        {/* Mode pills */}
        <div className="flex gap-1 px-3 pt-3 pb-1">
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                mode === m.id
                  ? "bg-brand text-white shadow-sm"
                  : "text-muted hover:text-ink hover:bg-black/5"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Textarea + send */}
        <div className="flex items-end gap-2 px-3 pb-3 pt-1">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            placeholder={activePlaceholder}
            rows={2}
            className="flex-1 resize-none bg-transparent text-sm text-ink placeholder:text-muted outline-none leading-relaxed"
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="shrink-0 w-9 h-9 rounded-xl bg-brand flex items-center justify-center shadow-sm hover:bg-brand/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Send className="size-4 text-white" />
          </button>
        </div>
      </div>

      {/* ── Agent trail (collapsible) ── */}
      {showTrail && trail.length > 0 && (
        <div className="shrink-0 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {trail.slice(-6).map((t, i) => {
            const meta = AGENT_META[t.agent] ?? AGENT_META.helmsman;
            return (
              <div key={i} className={`shrink-0 rounded-xl border px-3 py-1.5 text-[10px] font-medium flex items-center gap-1.5 ${meta.bg} ${meta.text} ${meta.border}`}>
                <span>{meta.emoji}</span>
                <span>{meta.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-accent flex items-center justify-center shadow-lg">
              <span className="text-2xl">🧭</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">30 agents, one goal.</p>
              <p className="text-xs text-muted mt-1">Type above or choose a mode to begin.</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-xs">
              {["What should I work on?", "I'm feeling stuck.", "Start a Pomodoro", "Board meeting"].map(s => (
                <button
                  key={s}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="px-3 py-1.5 rounded-xl bg-surface border border-line text-xs text-ink hover:border-brand/40 hover:bg-brand/5 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => {
          const isUser = m.role === "user";
          const meta = m.agent ? (AGENT_META[m.agent] ?? AGENT_META.helmsman) : null;

          return (
            <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className={`flex flex-col gap-1 max-w-[82%] ${isUser ? "items-end" : "items-start"}`}>
                {/* Agent badge */}
                {!isUser && meta && (
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${meta.bg} ${meta.text} ${meta.border}`}>
                    <span>{meta.emoji}</span>
                    <span>{meta.label}</span>
                  </div>
                )}
                {/* Bubble */}
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? "bg-brand text-white rounded-tr-sm"
                    : "bg-surface border border-line text-ink rounded-tl-sm shadow-sm"
                }`}>
                  {m.content}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="flex flex-col gap-1 items-start">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-indigo-50 text-indigo-700 border-indigo-200">
                <span>🧭</span><span>Thinking</span>
              </div>
              <div className="bg-surface border border-line rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default function CoachPage() {
  return (
    <Suspense>
      <CoachInner />
    </Suspense>
  );
}
