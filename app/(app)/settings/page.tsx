"use client";
import { useEffect, useState } from "react";
import { Cpu, Bell, Trash2, Shield, Check } from "lucide-react";
import { get, set, clearAll, KEYS } from "@/lib/memory";
import type { Provider } from "@/lib/types";

const PROVIDERS: { id: Provider; name: string; sub: string }[] = [
  { id: "groq",   name: "Groq",   sub: "Llama 3.3 70B · fastest" },
  { id: "groq2",  name: "Groq 2", sub: "backup key · auto-failover" },
  { id: "nvidia", name: "Nvidia", sub: "NIM · Llama 3.3" },
  { id: "gemini", name: "Gemini", sub: "Google · needs valid key" },
];

export default function SettingsPage() {
  const [provider, setProvider] = useState<Provider>("groq");
  const [notify, setNotify] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setProvider(get(KEYS.settings, { provider: "groq" as Provider }).provider ?? "groq");
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotify(Notification.permission === "granted");
    }
  }, []);

  function pick(p: Provider) {
    setProvider(p);
    set(KEYS.settings, { ...get(KEYS.settings, {}), provider: p });
  }

  async function toggleNotify() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted") { setNotify(false); return; }
    const res = await Notification.requestPermission();
    setNotify(res === "granted");
  }

  function wipe() {
    if (!confirm("Erase all local data — tasks, journal, beliefs, day plans? This cannot be undone.")) return;
    clearAll();
    setCleared(true);
    setTimeout(() => setCleared(false), 2500);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-black text-ink">Settings</h1>
        <p className="text-sm text-muted mt-1">Tune the engine, notifications, and your data.</p>
      </header>

      {/* AI engine */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="size-4 text-ink" />
          <h2 className="text-sm font-bold text-ink">AI engine</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {PROVIDERS.map(p => (
            <button
              key={p.id}
              onClick={() => pick(p.id)}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition ${
                provider === p.id ? "border-ink bg-ink text-white" : "border-border bg-surface text-ink hover:border-ink/30"
              }`}
            >
              <div>
                <p className="text-sm font-bold">{p.name}</p>
                <p className={`text-[11px] ${provider === p.id ? "text-white/60" : "text-muted"}`}>{p.sub}</p>
              </div>
              {provider === p.id && <Check className="size-4 shrink-0" />}
            </button>
          ))}
        </div>
        <p className="mt-2.5 text-xs text-muted">Saved locally. Groq is the default and auto-fails over to Groq 2.</p>
      </section>

      {/* Notifications */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Bell className="size-4 text-ink" />
          <h2 className="text-sm font-bold text-ink">Notifications</h2>
        </div>
        <button
          onClick={toggleNotify}
          className="w-full flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4 hover:border-ink/30 transition"
        >
          <div className="text-left">
            <p className="text-sm font-bold text-ink">Focus timer alerts</p>
            <p className="text-[12px] text-muted">Get pinged when a work or break block ends.</p>
          </div>
          <div className={`relative w-11 h-6 rounded-full transition-colors ${notify ? "bg-success" : "bg-border"}`}>
            <div className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${notify ? "left-[22px]" : "left-0.5"}`} />
          </div>
        </button>
      </section>

      {/* Privacy / data */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="size-4 text-ink" />
          <h2 className="text-sm font-bold text-ink">Privacy & data</h2>
        </div>
        <div className="rounded-2xl border border-border bg-surface px-5 py-4 space-y-3">
          <p className="text-[13px] text-muted leading-relaxed">
            Everything Avnik knows about you lives in <span className="text-ink font-semibold">this browser only</span> —
            tasks, journal, beliefs, and day plans. Nothing is uploaded.
          </p>
          <button
            onClick={wipe}
            className="flex items-center gap-2 rounded-full bg-alert/10 text-alert border border-alert/20 px-4 py-2 text-sm font-semibold hover:bg-alert/20 transition"
          >
            {cleared ? <><Check className="size-4" /> Erased</> : <><Trash2 className="size-4" /> Erase all local data</>}
          </button>
        </div>
      </section>

      <footer className="pt-4 border-t border-border">
        <p className="text-[11px] text-muted text-center">Avnik · your last-minute life saver · v1</p>
      </footer>
    </div>
  );
}
