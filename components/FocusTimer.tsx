"use client";
import { useState, useEffect, useRef } from "react";
import { Play, Pause, X, RotateCcw } from "lucide-react";
import { append, KEYS } from "@/lib/memory";
import type { Event } from "@/lib/types";

type Phase = "work" | "break" | "done";

export type FocusTimerProps = {
  label: string;
  workMin: number;
  breakMin: number;
  onClose: () => void;
};

export default function FocusTimer({ label, workMin, breakMin, onClose }: FocusTimerProps) {
  const [phase, setPhase] = useState<Phase>("work");
  const [secsLeft, setSecsLeft] = useState(workMin * 60);
  const [running, setRunning] = useState(true);
  const [cycles, setCycles] = useState(0);
  const totalRef = useRef(workMin * 60);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  const notify = (body: string) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("Avnik ⏱️", { body });
    }
  };

  const logEvent = (type: string, extra?: Record<string, unknown>) => {
    append<Event>(KEYS.events, {
      ts: Date.now(),
      type,
      source: "active",
      value: { technique: label, ...extra },
    });
  };

  // request notification permission + log start once
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    logEvent("focus_session_start", { workMin, breakMin });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // countdown
  useEffect(() => {
    if (!running || phase === "done") return;
    tick.current = setInterval(() => setSecsLeft(s => Math.max(0, s - 1)), 1000);
    return () => { if (tick.current) clearInterval(tick.current); };
  }, [running, phase]);

  // phase transitions
  useEffect(() => {
    if (secsLeft !== 0) return;
    if (phase === "work") {
      logEvent("focus_session_end", { completed: true, cycles: cycles + 1 });
      setCycles(c => c + 1);
      if (breakMin > 0) {
        notify("Work done! Take a break 🌿");
        totalRef.current = breakMin * 60;
        setSecsLeft(breakMin * 60);
        setPhase("break");
      } else {
        notify("Session complete 🎉");
        setPhase("done");
      }
    } else if (phase === "break") {
      notify("Break over — back to it 🚀");
      totalRef.current = workMin * 60;
      setSecsLeft(workMin * 60);
      setPhase("work");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secsLeft]);

  const RADIUS = 54;
  const CIRC = 2 * Math.PI * RADIUS;
  const progress = totalRef.current ? 1 - secsLeft / totalRef.current : 0;
  const ring = phase === "work" ? "#141414" : phase === "break" ? "#10b981" : "#f59e0b";

  const m = Math.floor(secsLeft / 60);
  const s = secsLeft % 60;
  const time = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  const phaseLabel = phase === "work" ? "Focus" : phase === "break" ? "Break" : "Done";

  return (
    <div className="anim-scale-in rounded-2xl border border-border bg-surface shadow-lg p-5 flex items-center gap-5">
      {/* Ring */}
      <div className="relative shrink-0 select-none">
        <svg width="132" height="132">
          <circle cx="66" cy="66" r={RADIUS} fill="none" stroke="#e8e8e8" strokeWidth="9" />
          <circle
            cx="66" cy="66" r={RADIUS} fill="none" stroke={ring} strokeWidth="9" strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - progress)}
            transform="rotate(-90 66 66)"
            style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[26px] font-black font-mono text-ink tabular-nums leading-none">{time}</span>
          <span className="text-[11px] text-muted font-medium mt-1">{phaseLabel}</span>
        </div>
      </div>

      {/* Info + controls */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-bold text-ink truncate">{label}</p>
          <button onClick={() => { logEvent("focus_session_end", { completed: false }); onClose(); }}
            className="text-muted hover:text-ink transition shrink-0">
            <X className="size-4" />
          </button>
        </div>
        <p className="text-[12px] text-muted mb-3">
          {workMin} min work · {breakMin} min break {cycles > 0 && `· ${"🍅".repeat(Math.min(cycles, 6))}`}
        </p>

        {phase === "done" ? (
          <button onClick={onClose} className="px-4 py-2 rounded-full bg-success text-white text-sm font-semibold hover:bg-emerald-600 transition">
            ✓ Finish
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRunning(r => !r)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-ink text-white text-sm font-semibold hover:bg-brand-600 transition"
            >
              {running ? <><Pause className="size-3.5" /> Pause</> : <><Play className="size-3.5" /> Resume</>}
            </button>
            <button
              onClick={() => { setSecsLeft(totalRef.current); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-border text-sm text-muted hover:text-ink hover:border-ink/30 transition"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
