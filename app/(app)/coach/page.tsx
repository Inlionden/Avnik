"use client";
// Foundation: a minimal working chat (proves the Gemini/Groq pipe). Session 2 expands into the full Coach.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Message } from "@/lib/types";

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages([
        ...next,
        { role: "assistant", content: data.reply ?? data.error ?? "…", agent: "helmsman" },
      ]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Network error.", agent: "helmsman" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col">
      <h1 className="mb-3 text-xl font-bold text-ink">💬 Coach</h1>
      <div className="flex-1 space-y-3 overflow-y-auto pb-3">
        {messages.length === 0 && (
          <p className="pt-10 text-center text-sm text-muted">
            Tell me what you&apos;re avoiding. <br /> (Add API keys in <code>.env.local</code> to get replies.)
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span
              className={`inline-block max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                m.role === "user" ? "bg-brand text-white" : "border border-line bg-surface text-ink"
              }`}
            >
              {m.content}
            </span>
          </div>
        ))}
        {loading && <p className="text-sm text-muted">thinking…</p>}
      </div>
      <div className="flex gap-2 border-t border-line pt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="I don't feel like starting…"
          className="flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
        <Button onClick={send} disabled={loading}>
          Send
        </Button>
      </div>
    </div>
  );
}
