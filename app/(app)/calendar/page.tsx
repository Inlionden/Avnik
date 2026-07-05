"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, Compass, CalendarDays } from "lucide-react";
import { get, set, KEYS } from "@/lib/memory";
import type { CalendarEntry } from "@/lib/types";

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7am–9pm
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmtHour(h: number) {
  if (h === 12) return "12 pm";
  return h < 12 ? `${h} am` : `${h - 12} pm`;
}
function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function CalendarPage() {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [selected, setSelected] = useState<string>(toDateStr(new Date()));
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newHour, setNewHour] = useState(9);
  const [days, setDays] = useState<Date[]>([]);
  const [todayStr, setTodayStr] = useState("");

  useEffect(() => {
    setEntries(get<CalendarEntry[]>(KEYS.calendar, []));
    const today = new Date();
    setTodayStr(toDateStr(today));
    setSelected(toDateStr(today));
    // 14-day strip starting today
    setDays(Array.from({ length: 14 }, (_, i) => new Date(today.getTime() + i * 86_400_000)));
  }, []);

  const persist = (next: CalendarEntry[]) => {
    setEntries(next);
    set(KEYS.calendar, next);
  };

  function addEntry() {
    if (!newTitle.trim()) return;
    const entry: CalendarEntry = {
      id: `cal_${Date.now()}`,
      date: selected,
      hour: newHour,
      durationMin: 60,
      title: newTitle.trim(),
      source: "user",
      createdAt: Date.now(),
    };
    persist([...entries, entry]);
    setNewTitle("");
    setAdding(false);
  }

  function remove(id: string) {
    persist(entries.filter(e => e.id !== id));
  }

  const dayEntries = entries.filter(e => e.date === selected).sort((a, b) => a.hour - b.hour);
  const agentCount = entries.filter(e => e.source === "agent").length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink">Calendar</h1>
          <p className="text-sm text-muted mt-1">
            Agent-planned blocks live here permanently.
            {agentCount > 0 && <span className="text-ink font-semibold"> {agentCount} planned by Avnik.</span>}
          </p>
        </div>
        <Link
          href="/coach?mode=plan&q=Plan my day"
          className="hidden sm:flex items-center gap-2 rounded-full bg-ink text-white px-4 py-2.5 text-[13px] font-bold hover:bg-brand-600 transition"
        >
          <Compass className="size-3.5" /> Ask Avnik to plan
        </Link>
      </header>

      {/* 14-day strip */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {days.map(d => {
          const ds = toDateStr(d);
          const isSel = ds === selected;
          const isToday = ds === todayStr;
          const count = entries.filter(e => e.date === ds).length;
          return (
            <button
              key={ds}
              onClick={() => setSelected(ds)}
              className={`shrink-0 w-14 rounded-2xl border px-2 py-2.5 text-center transition ${
                isSel ? "border-ink bg-ink text-white" : "border-border bg-surface text-ink hover:border-ink/30"
              }`}
            >
              <p className={`text-[10px] font-bold uppercase ${isSel ? "text-white/60" : "text-muted"}`}>
                {DAY_LABELS[d.getDay()]}
              </p>
              <p className="text-[17px] font-black leading-tight">{d.getDate()}</p>
              <div className="h-1.5 flex items-center justify-center gap-0.5">
                {count > 0 && Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                  <span key={i} className={`w-1 h-1 rounded-full ${isSel ? "bg-amber-400" : "bg-ink/40"}`} />
                ))}
              </div>
              {isToday && !isSel && <p className="text-[8px] font-bold text-accent uppercase">today</p>}
            </button>
          );
        })}
      </div>

      {/* Day timeline */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-ink flex items-center gap-2">
            <CalendarDays className="size-4" />
            {selected === todayStr ? "Today" : new Date(selected + "T00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </h2>
          <button
            onClick={() => setAdding(a => !a)}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-ink transition"
          >
            <Plus className="size-3.5" /> Add block
          </button>
        </div>

        {adding && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-canvas p-3 anim-fade-up">
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addEntry()}
              placeholder="What are you doing?"
              autoFocus
              className="flex-1 min-w-[160px] bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
            <select
              value={newHour}
              onChange={e => setNewHour(Number(e.target.value))}
              className="rounded-lg border border-border bg-surface px-2 py-1.5 text-[12px] text-ink outline-none"
            >
              {HOURS.map(h => <option key={h} value={h}>{fmtHour(h)}</option>)}
            </select>
            <button onClick={addEntry} className="rounded-full bg-ink text-white px-4 py-1.5 text-[12px] font-bold hover:bg-brand-600 transition">
              Add
            </button>
          </div>
        )}

        {dayEntries.length === 0 && !adding ? (
          <div className="text-center py-10">
            <p className="text-2xl mb-2">🗓️</p>
            <p className="text-sm text-muted mb-4">Nothing scheduled. Ask Avnik to plan this day.</p>
            <Link
              href={`/coach?mode=plan&q=${encodeURIComponent(`Plan my ${selected === todayStr ? "day" : "day for " + selected}: `)}`}
              className="inline-flex items-center gap-2 rounded-full bg-ink text-white px-5 py-2.5 text-[13px] font-bold hover:bg-brand-600 transition"
            >
              <Compass className="size-3.5" /> Plan it for me
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {HOURS.map(h => {
              const slot = dayEntries.filter(e => e.hour === h);
              if (slot.length === 0) return (
                <div key={h} className="flex items-center gap-3 h-7">
                  <span className="w-12 text-right text-[10px] text-muted/50 font-medium shrink-0">{fmtHour(h)}</span>
                  <div className="flex-1 border-t border-dashed border-border/60" />
                </div>
              );
              return (
                <div key={h} className="flex items-start gap-3">
                  <span className="w-12 text-right text-[11px] text-ink font-bold pt-2.5 shrink-0">{fmtHour(h)}</span>
                  <div className="flex-1 space-y-1.5">
                    {slot.map(e => (
                      <div key={e.id} className="group flex items-center gap-3 rounded-xl bg-ink text-white px-4 py-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-[13.5px] font-bold truncate">{e.title}</p>
                          <p className="text-[10.5px] text-white/50">
                            {e.durationMin} min {e.source === "agent" && "· 🧭 planned by Avnik"}
                          </p>
                        </div>
                        <button
                          onClick={() => remove(e.id)}
                          className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-white transition shrink-0"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
