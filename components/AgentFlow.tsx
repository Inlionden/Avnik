"use client";
import { useState, useEffect } from "react";
import { MessageCircle, Compass, Sparkles, Database } from "lucide-react";

// Lightweight, dependency-free visual of how Avnik's agents collaborate.
// Pure CSS animation — shows the ReAct loop: You → Helmsman → Agent → Reply.
const STEPS = [
  { id: "you",      label: "You",       icon: MessageCircle, sub: "ask anything" },
  { id: "helmsman", label: "Helmsman",  icon: Compass,       sub: "routes intent" },
  { id: "agent",    label: "30 Agents", icon: Sparkles,      sub: "the right expert" },
  { id: "memory",   label: "Memory",    icon: Database,      sub: "remembers you" },
];

export default function AgentFlow() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % STEPS.length), 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 h-full flex flex-col">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted mb-1">Under the hood</p>
      <h3 className="text-[17px] font-black text-ink mb-5">How the agents collaborate</h3>

      <div className="flex items-center justify-between gap-1 flex-1">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1 flex-1 last:flex-none">
            {/* Node */}
            <div className="flex flex-col items-center gap-2 text-center min-w-0">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  active === i
                    ? "bg-ink text-white scale-110 shadow-lg"
                    : "bg-canvas border border-border text-muted scale-100"
                }`}
              >
                <s.icon className="size-5" />
              </div>
              <div>
                <p className={`text-[12px] font-bold leading-tight transition-colors ${active === i ? "text-ink" : "text-muted"}`}>
                  {s.label}
                </p>
                <p className="text-[10px] text-muted hidden sm:block">{s.sub}</p>
              </div>
            </div>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px bg-border relative mx-1 self-start mt-6 min-w-[12px]">
                <div
                  className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-500 transition-all duration-700 ${
                    active === i ? "left-full opacity-100" : "left-0 opacity-0"
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-[12px] text-muted mt-5 leading-relaxed">
        Every message is routed by the <span className="text-ink font-semibold">Helmsman</span> to the
        right expert — a tone coach, the North Star planner, the Oracle, and 27 more — then logged to memory.
      </p>
    </div>
  );
}
