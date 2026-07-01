"use client";

import { useState, useEffect, useRef } from "react";
import { listTechniques } from "@/lib/techniques/factory";
import type { TechniquePreset } from "@/lib/techniques/presets";
import * as memory from "@/lib/memory";
import type { Event, Task } from "@/lib/types";

type Phase = "idle" | "work" | "break" | "long-break";

export default function Timer({ activeTaskId }: { activeTaskId?: string }) {
  const techniques = listTechniques();
  const [technique, setTechnique] = useState<TechniquePreset>(techniques[0]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [secsLeft, setSecsLeft] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [activeTitle, setActiveTitle] = useState<string | null>(null);

  // Refs to avoid stale closures in effects
  const techniqueRef = useRef(technique);
  const phaseRef = useRef<Phase>("idle");
  const cyclesRef = useRef(0);
  const totalRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flowtimeRef = useRef<number | null>(null);

  useEffect(() => { techniqueRef.current = technique; }, [technique]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { cyclesRef.current = cycles; }, [cycles]);

  useEffect(() => {
    if (!activeTaskId) return;
    const tasks = memory.get<Task[]>(memory.KEYS.tasks, []);
    setActiveTitle(tasks.find((t) => t.id === activeTaskId)?.title ?? null);
  }, [activeTaskId]);

  const clearTick = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const notify = (body: string) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("Avnik ⏱️", { body });
    }
  };

  const logEvent = (completed: boolean, extra?: Record<string, unknown>) => {
    const ev: Event = {
      ts: Date.now(),
      type: "technique_session",
      source: "active",
      taskId: activeTaskId,
      value: {
        technique: techniqueRef.current.slug,
        completed,
        phase: phaseRef.current,
        cycles: cyclesRef.current,
        ...extra,
      },
    };
    memory.append(memory.KEYS.events, ev);
  };

  const beginPhase = (ph: Phase, mins: number) => {
    clearTick();
    const secs = mins * 60;
    totalRef.current = secs;
    setPhase(ph);
    setSecsLeft(secs);
  };

  const startWork = (t: TechniquePreset = techniqueRef.current) => {
    if (t.flowtime) {
      flowtimeRef.current = Date.now();
      clearTick();
      totalRef.current = 0;
      setPhase("work");
      setSecsLeft(0);
    } else {
      beginPhase("work", t.workMin);
    }
  };

  const reset = () => {
    clearTick();
    flowtimeRef.current = null;
    totalRef.current = 0;
    setPhase("idle");
    setSecsLeft(0);
    setCycles(0);
    cyclesRef.current = 0;
  };

  // Tick
  useEffect(() => {
    if (phase === "idle") return;

    if (techniqueRef.current.flowtime && phase === "work") {
      intervalRef.current = setInterval(() => setSecsLeft((s) => s + 1), 1000);
      return clearTick;
    }

    intervalRef.current = setInterval(() => {
      setSecsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    return clearTick;
  }, [phase]);

  // Detect completion
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (secsLeft !== 0 || totalRef.current === 0 || phase === "idle") return;
    clearTick();
    const t = techniqueRef.current;
    const c = cyclesRef.current;

    if (phase === "work") {
      logEvent(true);
      const nextC = c + 1;
      cyclesRef.current = nextC;
      setCycles(nextC);
      const isLong = t.cycles && nextC % t.cycles === 0 && t.longBreakMin;
      if (isLong) {
        notify("Excellent! Long break earned 🎉");
        beginPhase("long-break", t.longBreakMin!);
      } else {
        notify("Work session done! Take a break 🌿");
        beginPhase("break", t.breakMin);
      }
    } else {
      notify("Break over! Back to work 🚀");
      startWork(t);
    }
  }, [secsLeft]); // intentionally narrow — reads current values via refs

  const handleStart = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission();
    }
    startWork(technique);
  };

  const handleStop = () => {
    clearTick();
    if (techniqueRef.current.flowtime && flowtimeRef.current) {
      const workedMin = Math.round((Date.now() - flowtimeRef.current) / 60000);
      logEvent(true, { workedMin });
      const breakMin = Math.max(1, Math.round(workedMin / 5));
      flowtimeRef.current = null;
      cyclesRef.current += 1;
      setCycles((c) => c + 1);
      notify(`Flowtime done! ${breakMin} min break earned.`);
      beginPhase("break", breakMin);
    } else {
      logEvent(false);
      reset();
    }
  };

  // Ring math
  const RADIUS = 78;
  const CIRC = 2 * Math.PI * RADIUS;
  const progress =
    technique.flowtime || totalRef.current === 0 ? 0 : 1 - secsLeft / totalRef.current;
  const dashOffset = CIRC * (1 - progress);

  const ringColor =
    phase === "work" ? "#141414"
    : phase === "break" ? "#10b981"
    : phase === "long-break" ? "#f59e0b"
    : "#e8e8e8";

  const m = Math.floor(secsLeft / 60);
  const s = secsLeft % 60;
  const timeStr = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  const idleStr = technique.flowtime ? "∞" : `${String(technique.workMin).padStart(2, "0")}:00`;

  const phaseLabel: Record<Phase, string> = {
    idle: "Ready",
    work: technique.twoMinute ? "Just Start" : "Focus",
    break: "Break",
    "long-break": "Long Break",
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Active task banner */}
      {activeTitle && (
        <div className="w-full text-center py-2 px-4 rounded-xl bg-brand/5 border border-brand/20">
          <span className="text-[10px] text-muted uppercase tracking-wide">Focusing on</span>
          <p className="text-sm font-semibold text-brand truncate">{activeTitle}</p>
        </div>
      )}

      {/* Technique grid */}
      <div className="w-full">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Technique</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {techniques.map((t) => (
            <button
              key={t.slug}
              disabled={phase !== "idle"}
              onClick={() => {
                techniqueRef.current = t;
                setTechnique(t);
                reset();
              }}
              className={`rounded-xl border p-2.5 text-left text-xs transition ${
                technique.slug === t.slug
                  ? "border-brand bg-brand/10 text-brand font-semibold"
                  : "border-line bg-surface text-muted hover:border-brand/40"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="text-base">{t.emoji}</span>
              <div className="font-medium mt-0.5 leading-tight">{t.name}</div>
              <div className="text-[10px] opacity-70 mt-0.5">
                {t.flowtime ? "Flowtime" : t.twoMinute ? "2 min" : `${t.workMin}/${t.breakMin} min`}
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-center text-muted mt-2 italic">{technique.description}</p>
      </div>

      {/* SVG ring */}
      <div className="relative select-none">
        <svg width="200" height="200">
          <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="#e8e8e8" strokeWidth="12" />
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke={ringColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={technique.flowtime ? CIRC : dashOffset}
            transform="rotate(-90 100 100)"
            style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="text-3xl font-mono font-bold text-ink">
            {phase === "idle" ? idleStr : timeStr}
          </span>
          <span className="text-xs text-muted">{phaseLabel[phase]}</span>
          {cycles > 0 && (
            <span className="text-sm leading-none mt-0.5">
              {"🍅".repeat(Math.min(cycles, 8))}
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {phase === "idle" ? (
          <button
            onClick={handleStart}
            className="px-8 py-2.5 rounded-full bg-brand text-white font-semibold text-sm hover:bg-brand-600 transition shadow-sm"
          >
            {technique.twoMinute ? "Just Start ⚡" : "▶ Start"}
          </button>
        ) : (
          <>
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-full border border-line text-sm text-muted hover:bg-canvas transition"
            >
              ↺ Reset
            </button>
            <button
              onClick={handleStop}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition shadow-sm ${
                technique.flowtime && phase === "work"
                  ? "bg-success text-white hover:bg-emerald-600"
                  : "bg-alert text-white hover:bg-rose-500"
              }`}
            >
              {technique.flowtime && phase === "work" ? "Done → Break" : "■ Stop"}
            </button>
          </>
        )}
      </div>

      {technique.flowtime && phase === "work" && (
        <p className="text-xs text-center text-muted max-w-xs">
          Work freely — stop at a natural pause point.
          <br />
          Your break will be <strong>⅕ of your worked time</strong>.
        </p>
      )}
    </div>
  );
}
