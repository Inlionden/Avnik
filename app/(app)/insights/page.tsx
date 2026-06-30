"use client";
import { useState, useEffect } from "react";
import { get, KEYS } from "@/lib/memory";
import type { BeliefState, Task, Event } from "@/lib/types";

const CAUSE_META: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  fear:         { label: "Fear of failure",   emoji: "😨", color: "text-red-600",     bg: "bg-red-500" },
  perfectionism:{ label: "Perfectionism",     emoji: "🔍", color: "text-amber-600",   bg: "bg-amber-500" },
  burnout:      { label: "Burnout",           emoji: "🔥", color: "text-orange-600",  bg: "bg-orange-500" },
  clarity:      { label: "Unclear next step", emoji: "🌫️", color: "text-blue-600",    bg: "bg-blue-500" },
  distraction:  { label: "Distraction",       emoji: "📱", color: "text-purple-600",  bg: "bg-purple-500" },
  confidence:   { label: "Low confidence",    emoji: "💭", color: "text-pink-600",    bg: "bg-pink-500" },
  overplanning: { label: "Over-planning",     emoji: "🗺️", color: "text-teal-600",    bg: "bg-teal-500" },
  boredom:      { label: "Boredom",           emoji: "😴", color: "text-slate-600",   bg: "bg-slate-400" },
};

export default function InsightsPage() {
  const [beliefs, setBeliefs] = useState<BeliefState | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    setBeliefs(get<BeliefState | null>(KEYS.beliefs, null));
    setTasks(get<Task[]>(KEYS.tasks, []));
    setEvents(get<Event[]>(KEYS.events, []));
  }, []);

  const done    = tasks.filter(t => t.status === "done").length;
  const overdue = tasks.filter(t => t.deadline && new Date(t.deadline).getTime() < Date.now() && t.status !== "done").length;
  const focusSessions = events.filter(e => e.type === "focus_session_end" || e.type === "focus_session_start").length;
  const journalCount  = events.filter(e => e.type === "journal").length;

  const sortedCauses = beliefs
    ? Object.entries(beliefs.rootCauses).sort((a, b) => b[1] - a[1])
    : [];

  const topCause = sortedCauses[0];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-600">Patterns</p>
            <h1 className="text-2xl font-black text-ink mt-1">Your habits are becoming legible.</h1>
            <p className="text-sm text-muted mt-2">A calm view of what tends to slow you down, what helps you start, and what keeps moving.</p>
          </div>
          <div className="rounded-2xl border border-indigo-200 bg-white/80 px-3 py-2 text-right shrink-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Signal</p>
            <p className="text-sm font-semibold text-indigo-700">Growing</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Tasks done",      value: done,          icon: "✅", color: "border-emerald-200 bg-emerald-50" },
          { label: "Overdue",         value: overdue,       icon: "⏰", color: "border-red-200 bg-red-50" },
          { label: "Focus sessions",  value: focusSessions, icon: "🎯", color: "border-indigo-200 bg-indigo-50" },
          { label: "Journal entries", value: journalCount,  icon: "📝", color: "border-amber-200 bg-amber-50" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 shadow-sm ${s.color}`}>
            <p className="text-2xl font-bold text-ink">{s.value}</p>
            <p className="text-xs text-muted mt-1">{s.icon} {s.label}</p>
          </div>
        ))}
      </div>

      {/* Root cause Bayesian radar */}
      <div className="rounded-2xl bg-surface border border-line p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-ink">Why you&apos;re stuck (Oracle)</h2>
          {beliefs && (
            <span className="text-[11px] text-muted bg-canvas px-2 py-0.5 rounded-full border border-line">
              {(beliefs.confidence * 100).toFixed(0)}% confidence
            </span>
          )}
        </div>

        {sortedCauses.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-2xl mb-2">🔮</p>
            <p className="text-sm text-muted">Chat with Avnik to build your belief profile.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCauses.slice(0, 5).map(([cause, pct]) => {
              const meta = CAUSE_META[cause] ?? { label: cause, emoji: "•", color: "text-ink", bg: "bg-ink" };
              const pctInt = Math.round(pct * 100);
              return (
                <div key={cause}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-ink">
                      <span>{meta.emoji}</span>
                      <span>{meta.label}</span>
                    </span>
                    <span className={`text-xs font-bold ${meta.color}`}>{pctInt}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-black/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${meta.bg} transition-all duration-700`}
                      style={{ width: `${pctInt}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {topCause && (
          <div className="mt-4 rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-3">
            <p className="text-[11px] text-indigo-500 font-semibold uppercase tracking-wider mb-1">Top pattern</p>
            <p className="text-sm text-indigo-900 font-medium">
              {CAUSE_META[topCause[0]]?.emoji} {CAUSE_META[topCause[0]]?.label} at {Math.round(topCause[1] * 100)}% probability.
              {topCause[0] === "fear" && " You know what to do — you're afraid of getting it wrong."}
              {topCause[0] === "clarity" && " You haven't decided what 'done' looks like yet."}
              {topCause[0] === "burnout" && " Your system is asking for rest, not more hustle."}
              {topCause[0] === "perfectionism" && " Done ships. Perfect doesn't."}
              {topCause[0] === "distraction" && " Your environment is working against you."}
            </p>
          </div>
        )}
      </div>

      {/* Recent agent trail */}
      {events.filter(e => e.type === "agent_trail" || e.source === "active").length > 0 && (
        <div className="rounded-2xl bg-surface border border-line p-5 shadow-sm">
          <h2 className="text-sm font-bold text-ink mb-3">Recent interventions</h2>
          <div className="space-y-2">
            {events.filter(e => e.source === "active").slice(-5).reverse().map((e, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="text-muted shrink-0">{new Date(e.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <span className="flex-1 text-ink truncate font-medium">{e.type.replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
