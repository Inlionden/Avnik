"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { get, set, KEYS } from "@/lib/memory";
import type { Provider } from "@/lib/types";

export default function SettingsPage() {
  const [provider, setProvider] = useState<Provider>("gemini");

  useEffect(() => {
    setProvider(get(KEYS.settings, { provider: "gemini" as Provider }).provider);
  }, []);

  function pick(p: Provider) {
    setProvider(p);
    set(KEYS.settings, { provider: p });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink">⚙️ Settings</h1>
      <Card>
        <h2 className="mb-2 text-sm font-semibold text-ink">AI engine</h2>
        <div className="flex gap-2">
          {(["gemini", "groq"] as Provider[]).map((p) => (
            <button
              key={p}
              onClick={() => pick(p)}
              className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold capitalize transition ${
                provider === p
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-surface text-ink hover:bg-black/5"
              }`}
            >
              {p === "gemini" ? "Gemini (Google)" : "Groq (Llama)"}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">Saved locally. Default: Gemini.</p>
      </Card>
    </div>
  );
}
