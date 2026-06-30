// Quick live check: does the belief state now evolve through /api/agent each turn?
// Run dev server, then: npx tsx scripts/verify-belief-wiring.ts
import type { BeliefState, Message } from "@/lib/types";
const BASE = process.env.AVNIK_URL ?? "http://localhost:3000";

const turns = [
  "i keep rewriting my essay, it's never good enough to submit",
  "what if it's just not perfect enough?",
  "honestly now i'm exhausted and my energy is gone across everything",
];

async function main() {
  const messages: Message[] = [];
  let beliefs: BeliefState | undefined;
  for (const input of turns) {
    messages.push({ role: "user", content: input });
    const res = await fetch(`${BASE}/api/agent`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ input, messages, beliefs }),
    });
    if (!res.ok) { console.log(`HTTP ${res.status}: ${await res.text()}`); return; }
    const out = await res.json();
    if (out.beliefs) beliefs = out.beliefs as BeliefState;
    messages.push({ role: "assistant", content: out.text, agent: out.agent });
    const top = beliefs
      ? Object.entries(beliefs.rootCauses).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 3)
          .map(([k, v]) => `${k} ${((v as number) * 100).toFixed(0)}%`).join(" · ")
      : "—";
    console.log(`🧑 ${input}`);
    console.log(`   → route=${out.route} agent=${out.agent}`);
    console.log(`   🧮 beliefs: ${top}  (conf ${beliefs ? (beliefs.confidence * 100).toFixed(0) : "—"}%)\n`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
