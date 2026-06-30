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
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold text-ink">Action Center</h1>

      {/* Tab bar */}
      <div className="flex gap-1 bg-canvas rounded-2xl p-1 border border-line">
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

      <Card>
        {tab === "tasks" && <TaskList onFocus={handleFocus} />}
        {tab === "timer" && <Timer activeTaskId={focusTaskId} />}
        {tab === "plan" && <DayPlanner />}
      </Card>
    </div>
  );
}
