"use client";

import { useState, useEffect } from "react";
import * as memory from "@/lib/memory";
import type { Task } from "@/lib/types";
import { Card } from "@/components/ui/card";

function newTask(title: string): Task {
  return {
    id: crypto.randomUUID(),
    title,
    status: "todo",
    createdAt: Date.now(),
  };
}

export default function TaskList({ onFocus }: { onFocus?: (taskId: string) => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    setTasks(memory.get<Task[]>(memory.KEYS.tasks, []));
  }, []);

  const persist = (updated: Task[]) => {
    setTasks(updated);
    memory.set(memory.KEYS.tasks, updated);
  };

  const add = () => {
    const t = input.trim();
    if (!t) return;
    persist([...tasks, newTask(t)]);
    setInput("");
  };

  const toggle = (id: string) =>
    persist(
      tasks.map((t) =>
        t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t
      )
    );

  const remove = (id: string) => persist(tasks.filter((t) => t.id !== id));

  const saveEdit = () => {
    if (!editId) return;
    const trimmed = editTitle.trim();
    persist(tasks.map((t) => (t.id === editId && trimmed ? { ...t, title: trimmed } : t)));
    setEditId(null);
  };

  const todo = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="space-y-4">
      {/* Add task */}
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl border border-line px-3 py-2 text-sm bg-surface text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/40"
          placeholder="Add a task… (Enter to save)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button
          onClick={add}
          className="px-4 py-2 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-600 transition"
        >
          +
        </button>
      </div>

      {/* Todo tasks */}
      {todo.length === 0 && (
        <p className="text-sm text-muted text-center py-6">
          No tasks yet — add one above!
        </p>
      )}

      <div className="space-y-2">
        {todo.map((t) => (
          <Card key={t.id} className="p-3 flex items-center gap-3">
            <input
              type="checkbox"
              checked={false}
              onChange={() => toggle(t.id)}
              className="w-4 h-4 accent-brand flex-shrink-0 cursor-pointer"
            />

            {editId === t.id ? (
              <input
                className="flex-1 border-b border-brand text-sm text-ink bg-transparent focus:outline-none"
                value={editTitle}
                autoFocus
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit();
                  if (e.key === "Escape") setEditId(null);
                }}
                onBlur={saveEdit}
              />
            ) : (
              <span
                className="flex-1 text-sm text-ink cursor-pointer select-none"
                onDoubleClick={() => {
                  setEditId(t.id);
                  setEditTitle(t.title);
                }}
                title="Double-click to edit"
              >
                {t.title}
              </span>
            )}

            <div className="flex gap-1.5 flex-shrink-0">
              {onFocus && (
                <button
                  onClick={() => onFocus(t.id)}
                  title="Start a timer on this task"
                  className="text-xs px-2 py-1 rounded-lg bg-brand/10 text-brand hover:bg-brand/20 transition"
                >
                  ⏱️
                </button>
              )}
              <button
                onClick={() => remove(t.id)}
                title="Delete task"
                className="text-xs px-2 py-1 rounded-lg text-muted hover:text-alert hover:bg-alert/10 transition"
              >
                ✕
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Done section */}
      {done.length > 0 && (
        <details>
          <summary className="cursor-pointer text-xs text-muted uppercase tracking-wide font-semibold py-2 select-none">
            ✅ Done ({done.length})
          </summary>
          <div className="space-y-2 mt-2">
            {done.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-canvas text-muted text-sm"
              >
                <input
                  type="checkbox"
                  checked
                  onChange={() => toggle(t.id)}
                  className="w-4 h-4 accent-success flex-shrink-0 cursor-pointer"
                />
                <span className="flex-1 line-through">{t.title}</span>
                <button
                  onClick={() => remove(t.id)}
                  className="text-xs hover:text-alert transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
