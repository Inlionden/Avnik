// A+ demo: exercises the exact responses that were blemished, now through the full
// pipeline (Regulate → Track → Route → Act → Mentor sanitize/fit → Observe).
// Run dev server, then: npx tsx scripts/demo-aplus.ts
import type { BeliefState, Message, Event } from "@/lib/types";
const BASE = process.env.AVNIK_URL ?? "http://localhost:3000";

const todayAt = (h: number, m = 0) => { const d = new Date(); d.setHours(h, m, 0, 0); return d.getTime(); };

type Step = { input: string; mode?: string; events?: Event[]; label: string };
const steps: Step[] = [
  { label: "burnout vent (was: sage leaked 'let me rephrase')",
    input: "everything is falling apart, 3 deadlines and i'm completely drained", mode: "vent" },
  { label: "dining-table (was: mislabeled lunch as 'dinner/16:00')",
    input: "i'm at the dining table, just finished lunch",
    events: [{ ts: todayAt(13, 0), type: "place_stay", source: "passive", value: { zoneType: "eat", durationMin: 25, hour: 13, label: "dining table" } }] },
  { label: "planning (mode=plan → concise structured)",
    input: "ok so what should i actually do next", mode: "plan" },
];

async function main() {
  const messages: Message[] = [];
  const events: Event[] = [];
  let beliefs: BeliefState | undefined;
  for (const s of steps) {
    if (s.events) events.push(...s.events);
    messages.push({ role: "user", content: s.input });
    const res = await fetch(`${BASE}/api/agent`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ input: s.input, messages, beliefs, events, mode: s.mode ?? "chat" }),
    });
    if (!res.ok) { console.log(`HTTP ${res.status}: ${await res.text()}`); return; }
    const out = await res.json();
    if (out.beliefs) beliefs = out.beliefs as BeliefState;
    messages.push({ role: "assistant", content: out.text, agent: out.agent });
    const top = beliefs ? Object.entries(beliefs.rootCauses).sort((a, b) => (b[1] as number) - (a[1] as number))[0] : null;
    const words = out.text.split(/\s+/).length;
    console.log(`\n🧑 ${s.input}   [mode=${s.mode ?? "chat"}]`);
    console.log(`   ↳ ${s.label}`);
    console.log(`   🤖 [${out.agent}] route=${out.route}  (${words} words)`);
    console.log(`   💬 ${out.text}`);
    if (top) console.log(`   🧮 belief: ${top[0]} ${((top[1] as number) * 100).toFixed(0)}% · conf ${(beliefs!.confidence * 100).toFixed(0)}%`);
    const leak = /\b(wait,?\s*)?let me rephrase|as an ai\b/i.test(out.text);
    console.log(`   ${leak ? "❌ artifact leaked" : "✅ clean (no artifacts)"}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
