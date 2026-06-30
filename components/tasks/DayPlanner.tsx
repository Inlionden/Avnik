"use client";

import { useState, useEffect } from "react";
import * as memory from "@/lib/memory";
import type { Task } from "@/lib/types";

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7 am – 9 pm

function fmtHour(h: number) {
  if (h === 12) return "12 pm";
  return h < 12 ? `${h} am` : `${h - 12} pm`;
}

function getWeekDays() {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Slot = Record<number, string[]>; // hour → taskId[]

const planKey = () => "dayplan:" + new Date().toISOString().slice(0, 10);

export default function DayPlanner() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [slots, setSlots] = useState<Slot>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [pickingFor, setPickingFor] = useState<string | null>(null); // taskId for mobile assign

  const today = new Date();
  const todayStr = today.toDateString();
  const days = getWeekDays();
  const currentHour = today.getHours();

  useEffect(() => {
    setTasks(memory.get<Task[]>(memory.KEYS.tasks, []));
    setSlots(memory.get<Slot>(planKey(), {}));
  }, []);

  const persist = (next: Slot) => {
    setSlots(next);
    memory.set(planKey(), next);
  };

  const assign = (taskId: string, hour: number) => {
    const next: Slot = {};
    Object.keys(slots).forEach((h) => {
      next[+h] = (slots[+h] || []).filter((id) => id !== taskId);
    });
    next[hour] = [...(next[hour] || []), taskId];
    persist(next);
  };

  const unassign = (taskId: string, hour: number) => {
    const next: Slot = {
      ...slots,
      [hour]: (slots[hour] || []).filter((id) => id !== taskId),
    };
    persist(next);
  };

  const getTask = (id: string) => tasks.find((t) => t.id === id);

  const allScheduledIds = Object.values(slots).flat();
  const unscheduled = tasks.filter(
    (t) => t.status !== "done" && !allScheduledIds.includes(t.id)
  );

  return (
    <div className="space-y-4">
      {/* Week mini-calendar */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const isToday = d.toDateString() === todayStr;
          return (
            <div
              key={i}
              className={`rounded-xl p-2 text-center text-xs transition ${
                isToday
                  ? "bg-brand text-white font-bold shadow-sm"
                  : "bg-surface border border-line text-muted"
              }`}
            >
              <div>{DAY_LABELS[i]}</div>
              <div className="text-sm font-semibold">{d.getDate()}</div>
            </div>
          );
        })}
      </div>

      {/* Unscheduled pool */}
      {unscheduled.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
            Unscheduled — drag or tap to place
          </p>
          <div className="flex flex-wrap gap-2">
            {unscheduled.map((t) => (
              <div
                key={t.id}
                draggable
                onDragStart={() => setDragging(t.id)}
                onDragEnd={() => setDragging(null)}
                onClick={() => setPickingFor(pickingFor === t.id ? null : t.id)}
                className={`px-3 py-1.5 rounded-full border text-sm text-ink cursor-grab select-none transition ${
                  pickingFor === t.id
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-line bg-surface hover:border-brand/40 hover:bg-brand/5"
                }`}
              >
                {t.title}
              </div>
            ))}
          </div>
          {pickingFor && (
            <p className="text-xs text-brand mt-1.5 animate-pulse">
              Tap a time slot below to schedule this task ↓
            </p>
          )}
        </div>
      )}

      {/* Time grid */}
      <div className="space-y-1">
        {HOURS.map((h) => {
          const isCurrent = h === currentHour;
          const slotTasks = (slots[h] || []).map(getTask).filter(Boolean) as Task[];
          const canDrop = dragging !== null;
          const canPick = pickingFor !== null;

          return (
            <div
              key={h}
              className={`flex gap-3 items-start rounded-xl transition ${
                isCurrent ? "bg-brand/5 ring-1 ring-brand/30" : ""
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragging) {
                  assign(dragging, h);
                  setDragging(null);
                }
              }}
              onClick={() => {
                if (pickingFor) {
                  assign(pickingFor, h);
                  setPickingFor(null);
                }
              }}
            >
              {/* Hour label */}
              <div
                className={`w-14 flex-shrink-0 text-right text-xs pt-2.5 font-medium ${
                  isCurrent ? "text-brand" : "text-muted"
                }`}
              >
                {fmtHour(h)}
              </div>

              {/* Drop zone */}
              <div
                className={`flex-1 min-h-[40px] rounded-xl border border-dashed p-1.5 flex flex-wrap gap-1.5 transition ${
                  canDrop || canPick
                    ? "border-brand/40 bg-brand/5 cursor-pointer"
                    : "border-line"
                }`}
              >
                {slotTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand text-white text-xs font-medium"
                  >
                    <span className="truncate max-w-[120px]">{t.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        unassign(t.id, h);
                      }}
                      className="hover:opacity-70 ml-1 flex-shrink-0"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {slotTasks.length === 0 && (
                  <span className="text-[11px] text-muted/40 pl-1 self-center">
                    {canDrop || canPick ? "drop here" : ""}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
