"use client";
// 💓 Pulse — mounts on every page; polls /api/pulse so the agents keep working
// even when the user isn't talking to them. Shows proactive nudges as a banner.
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Compass } from "lucide-react";
import { get, append, KEYS } from "@/lib/memory";
import type { Task, Event, CalendarEntry } from "@/lib/types";

type Nudge = {
  id: string;
  agent: string;
  text: string;
  href?: string;
  urgency: "high" | "medium" | "low";
};

const AGENT_EMOJI: Record<string, string> = {
  sentinel: "👁️", "north-star": "⭐", quartermaster: "⚔️",
  chronicler: "📜", "day-planner": "🗓️",
};

const POLL_MS = 3 * 60 * 1000; // every 3 minutes — the agents stay awake

export default function Pulse() {
  const router = useRouter();
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const check = useCallback(async () => {
    try {
      const tasks = get<Task[]>(KEYS.tasks, []);
      const calendar = get<CalendarEntry[]>(KEYS.calendar, []);
      const events = get<Event[]>(KEYS.events, []).slice(-50);
      const res = await fetch("/api/pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks, calendar, events, hour: new Date().getHours() }),
      });
      const data = await res.json();
      if (Array.isArray(data.nudges)) setNudges(data.nudges);
    } catch { /* pulse never breaks the app */ }
  }, []);

  useEffect(() => {
    check();
    const t = setInterval(check, POLL_MS);
    return () => clearInterval(t);
  }, [check]);

  const visible = nudges.filter(n => !dismissed.includes(n.id));
  if (visible.length === 0) return null;
  const top = visible[0];

  function dismiss(id: string) {
    setDismissed(d => [...d, id]);
    append<Event>(KEYS.events, {
      ts: Date.now(), type: "nudge_dismissed", source: "active", value: { id },
    });
  }

  function act(n: Nudge) {
    append<Event>(KEYS.events, {
      ts: Date.now(), type: "nudge_accepted", source: "active", value: { id: n.id, agent: n.agent },
    });
    setDismissed(d => [...d, n.id]);
    if (n.href) router.push(n.href);
  }

  return (
    <div className="sticky top-0 z-30 -mx-5 md:-mx-10 mb-4 anim-fade-up">
      <div className={`mx-5 md:mx-10 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-md backdrop-blur ${
        top.urgency === "high"
          ? "bg-ink text-white border-ink"
          : "bg-surface/95 text-ink border-border"
      }`}>
        <span className="text-lg shrink-0">{AGENT_EMOJI[top.agent] ?? "🧭"}</span>
        <p className="flex-1 text-[13px] font-medium leading-snug">{top.text}</p>
        {top.href && (
          <button
            onClick={() => act(top)}
            className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition ${
              top.urgency === "high"
                ? "bg-white text-ink hover:bg-white/90"
                : "bg-ink text-white hover:bg-brand-600"
            }`}
          >
            <Compass className="size-3" /> Go
          </button>
        )}
        <button
          onClick={() => dismiss(top.id)}
          className={`shrink-0 transition ${top.urgency === "high" ? "text-white/50 hover:text-white" : "text-muted hover:text-ink"}`}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
