"use client";

import { useState } from "react";
import TaskList from "@/components/tasks/TaskList";
import Timer from "@/components/tasks/Timer";
import DayPlanner from "@/components/tasks/DayPlanner";
import { Card } from "@/components/ui/card";

type Tab = "tasks" | "timer" | "plan";

const TABS: { id: Tab; label: string }[] = [
  { id: "tasks", label: "✅ Tasks" },
  { id: "timer", label: "⏱️ Timer" },
  { id: "plan", label: "📅 Day Plan" },
];

export default function TasksPage() {
  const [tab, setTab] = useState<Tab>("tasks");
  const [focusTaskId, setFocusTaskId] = useState<string | undefined>();

  const handleFocus = (taskId: string) => {
    setFocusTaskId(taskId);
    setTab("timer");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/10 via-white to-amber-50 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">Action Center</p>
            <h1 className="text-2xl font-black text-ink mt-1">Turn intention into motion.</h1>
            <p className="text-sm text-muted mt-2 max-w-xl">Capture the next step, start the timer, and keep your day from dissolving into vague plans.</p>
          </div>
          <div className="rounded-2xl border border-brand/20 bg-white/80 px-3 py-2 text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Momentum</p>
            <p className="text-lg font-black text-brand">Focus</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-canvas rounded-2xl p-1 border border-line shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
              tab === t.id
                ? "bg-brand text-white shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden border border-line/80 shadow-sm">
        {tab === "tasks" && <TaskList onFocus={handleFocus} />}
        {tab === "timer" && <Timer activeTaskId={focusTaskId} />}
        {tab === "plan" && <DayPlanner />}
      </Card>
    </div>
  );
}
