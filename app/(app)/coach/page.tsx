"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { get, set, append, KEYS } from "@/lib/memory";
import type { Message, Profile, BeliefState, Task, Event } from "@/lib/types";
import type { CurrentState } from "@/lib/agents/state";

type ChatMode = "chat" | "plan" | "vent" | "focus" | "review";

const MODES: { id: ChatMode; emoji: string; label: string; placeholder: string }[] = [
  { id: "chat",   emoji: "💬", label: "Chat",   placeholder: "Tell me what's on your mind…" },
  { id: "plan",   emoji: "📋", label: "Plan",   placeholder: "What do I need to do? Prioritize for me…" },
  { id: "vent",   emoji: "😤", label: "Vent",   placeholder: "I just need to say this…" },
  { id: "focus",  emoji: "🎯", label: "Focus",  placeholder: "Help me pick a technique for this session…" },
  { id: "review", emoji: "🪞", label: "Review", placeholder: "How am I doing? Be honest." },
];

const AGENT_LABELS: Record<string, { label: string; color: string }> = {
  sage:          { label: "🌿 Sage",         color: "bg-success/15 text-success border-success/30" },
  spark:         { label: "⚡ Spark",         color: "bg-accent/15 text-amber-700 border-accent/30" },
  sensei:        { label: "🎋 Sensei",        color: "bg-ink/10 text-ink border-line" },
  "north-star":  { label: "⭐ North Star",   color: "bg-brand/10 text-brand border-brand/30" },
  quartermaster: { label: "⚔️ Quartermaster", color: "bg-purple-50 text-purple-700 border-purple-200" },
  oracle:        { label: "🔮 Oracle",        color: "bg-teal-50 text-teal-700 border-teal-200" },
  auditor:       { label: "🪞 Auditor",       color: "bg-alert/10 text-alert border-alert/30" },
  chronicler:    { label: "📜 Chronicler",    color: "bg-blue-50 text-blue-700 border-blue-200" },
  archivist:     { label: "🗄️ Archivist",     color: "bg-gray-50 text-gray-600 border-gray-200" },
  courier:       { label: "📦 Courier",       color: "bg-orange-50 text-orange-700 border-orange-200" },
  promptsmith:   { label: "✍️ Promptsmith",   color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  helmsman:      { label: "🧭 Helmsman",      color: "bg-brand/10 text-brand border-brand/30" },
};

const MOOD_EMOJI: Record<string, string> = {
  neutral: "😐", anxious: "😰", "burnt-out": "😮‍💨",
  avoidant: "🙈", energized: "⚡", focused: "🎯",
};

type AssistantMessage = Message & { agent?: string };

const MODE_PREFIXES: Record<ChatMode, string> = {
  chat:   "",
  plan:   "[ROUTE_TO:north-star] ",
  vent:   "[ROUTE_TO:tone] ",
  focus:  "[ROUTE_TO:quartermaster] ",
  review: "[ROUTE_TO:auditor] ",
};

export default function CoachPage() {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [mode, setMode]         = useState<ChatMode>("chat");
  const [currentState, setCurrentState] = useState<Partial<CurrentState>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(override?: string) {
    const text = (override ?? input).trim();
    if (!text || loading) return;

    const prefix = MODE_PREFIXES[mode];
    const userMsg: AssistantMessage = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      // Read context from localStorage to send to server
      const profile = get<Profile | undefined>(KEYS.profile, undefined);
      const beliefs = get<BeliefState | undefined>(KEYS.beliefs, undefined);
      const tasks   = get<Task[]>(KEYS.tasks, []);
      const events  = get<Event[]>(KEYS.events, []).slice(-30);

      const messagesForApi: Message[] = next.map((m, i) =>
        i === next.length - 1
          ? { role: m.role, content: prefix + m.content }
          : { role: m.role, content: m.content }
      );

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesForApi, profile, beliefs, tasks, events, currentState }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages([...next, { role: "assistant", content: `⚠️ ${data.error}`, agent: "helmsman" }]);
        return;
      }

      // Apply side effects to localStorage
      if (data.sideEffects?.length) {
        for (const effect of data.sideEffects as Event[]) {
          append<Event>(KEYS.events, effect);
        }
      }

      // Update currentState for next turn
      if (data.state) setCurrentState(data.state);

      setMessages([...next, { role: "assistant", content: data.reply ?? "…", agent: data.agent }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Network error — is the dev server running?", agent: "helmsman" }]);
    } finally {
      setLoading(false);
    }
  }

  const mood = (currentState as CurrentState)?.mood ?? "neutral";
  const activePlaceholder = MODES.find(m => m.id === mode)?.placeholder ?? "…";

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-ink">Coach</h1>
        <span className="text-lg" title={`Mood: ${mood}`}>{MOOD_EMOJI[mood] ?? "😐"}</span>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 bg-canvas rounded-2xl p-1 border border-line mb-3">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition ${
              mode === m.id
                ? "bg-brand text-white shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto pb-3">
        {messages.length === 0 && (
          <div className="pt-10 text-center text-sm text-muted space-y-2">
            <p className="text-2xl">🧭</p>
            <p>11 agents ready. Tell me what&apos;s going on.</p>
            {mode === "vent" && (
              <button
                onClick={() => send("I just need to vent for a moment. Don't try to fix anything yet.")}
                className="mt-2 px-4 py-2 rounded-xl bg-alert/10 text-alert text-xs font-medium border border-alert/20 hover:bg-alert/20 transition"
              >
                😤 Start venting
              </button>
            )}
            {mode === "plan" && (
              <button
                onClick={() => send("Show me what I should work on right now, ranked by priority.")}
                className="mt-2 px-4 py-2 rounded-xl bg-brand/10 text-brand text-xs font-medium border border-brand/20 hover:bg-brand/20 transition"
              >
                ⭐ Prioritize my tasks
              </button>
            )}
          </div>
        )}

        {messages.map((m, i) => {
          const agentMeta = m.agent ? AGENT_LABELS[m.agent] : null;
          return (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              {m.role === "assistant" && agentMeta && (
                <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border mb-1 ml-1 ${agentMeta.color}`}>
                  {agentMeta.label}
                </span>
              )}
              <div className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <span
                  className={`inline-block max-w-[82%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-brand text-white"
                      : "border border-line bg-surface text-ink"
                  }`}
                >
                  {m.content}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="text-left">
            <span className="inline-block border border-line bg-surface rounded-2xl px-4 py-2.5 text-sm text-muted">
              <span className="animate-pulse">thinking…</span>
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 border-t border-line pt-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder={activePlaceholder}
          className="flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
        {mode === "vent" && (
          <button
            onClick={() => send("I just need to vent — please listen first, don't fix.")}
            className="px-3 py-2.5 rounded-xl bg-alert/10 text-alert border border-alert/20 text-xs font-medium hover:bg-alert/20 transition"
            title="Vent button — Sage will listen first"
          >
            😤
          </button>
        )}
        <Button onClick={() => send()} disabled={loading}>Send</Button>
      </div>
    </div>
  );
}
