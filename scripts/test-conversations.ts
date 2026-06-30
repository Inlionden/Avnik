/**
 * Live conversation tests against the running agent pipeline (/api/agent).
 * Start the dev server first:  npm run dev   (port 3000)
 * Then:  npx tsx scripts/test-conversations.ts
 *
 * Each conversation threads state FORWARD — the messages, accumulated events,
 * carried beliefs (from sideEffects) and currentState from turn N feed turn N+1.
 * This verifies the core requirement: one agent's output becomes the others' input.
 * Writes a full transcript to review/CONVERSATION-TESTS.md.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import type { Event, Task, BeliefState, Message } from "@/lib/types";

const BASE = process.env.AVNIK_URL ?? "http://localhost:3000";
const MD: string[] = [];
let routeHits = 0, routeTotal = 0;

type Turn = { user: string; expect?: string; note?: string };
type Conv = { title: string; seedEvents?: Event[]; seedTasks?: Task[]; turns: Turn[] };

const md = (s = "") => MD.push(s);
const trunc = (s: string, n = 320) => (s.length > n ? s.slice(0, n) + "…" : s).replace(/\n+/g, " ");

// ── helper: hours-ago timestamp ──────────────────────────────────────────────
const hAgo = (h: number) => Date.now() - h * 3_600_000;

async function callAgent(body: Record<string, unknown>) {
  const res = await fetch(`${BASE}/api/agent`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json() as Promise<{
    text: string; agent: string; route: string;
    state: Record<string, unknown>; sideEffects: Event[];
  }>;
}

// ── Conversations ────────────────────────────────────────────────────────────
const CONVS: Conv[] = [
  {
    title: "Conv A — The 4 AM Mirage (sleep + avoidance + perfectionism)",
    seedEvents: [
      { ts: hAgo(7), type: "app_close", source: "passive" },   // closed ~late night
      { ts: hAgo(2), type: "app_open", source: "passive" },    // reopened few h later → short sleep
    ],
    seedTasks: [
      { id: "os1", title: "OS assignment (process scheduling)", status: "todo", importance: 90, deadline: new Date(Date.now() + 5 * 3_600_000).toISOString(), createdAt: 0 },
    ],
    turns: [
      { user: "i just woke up and i barely slept last night", expect: "sentinel" },
      { user: "i have an OS assignment due in 5 hours and i haven't started", expect: "north-star" },
      { user: "honestly i want to rewrite my whole approach so it's perfect", expect: "oracle" },
      { user: "what if it's not good enough to submit?", expect: "oracle" },
      { user: "ok how long should i actually work right now", expect: "quartermaster" },
      { user: "can you just help me start the very first part", expect: "quartermaster" },
      { user: "how am i doing overall, be honest", expect: "auditor" },
    ],
  },
  {
    title: "Conv B — The Dining-Table Drift (place + boredom)",
    seedEvents: [
      { ts: hAgo(0.4), type: "place_stay", source: "passive", value: { zoneType: "eat", durationMin: 70, label: "dining table" } },
    ],
    seedTasks: [
      { id: "dsa1", title: "DSA: 10 problems", status: "doing", importance: 70, createdAt: 0 },
    ],
    turns: [
      { user: "i'm at the dining table, just finished lunch a while ago", expect: "sentinel" },
      { user: "i keep taking these long breaks instead of doing my DSA practice", expect: "oracle" },
      { user: "what should i do next?", expect: "north-star" },
      { user: "pick a focus technique for me", expect: "quartermaster" },
      { user: "remember that i procrastinate the most right after lunch", expect: "archivist" },
      { user: "what's my current state right now?", expect: "courier" },
    ],
  },
  {
    title: "Conv C — Collapse Week (burnout + multi-deadline)",
    seedEvents: [
      { ts: hAgo(9), type: "app_close", source: "passive" },
      { ts: hAgo(5), type: "app_open", source: "passive" },   // ~4h sleep
      { ts: hAgo(48), type: "focus_session_end", source: "active" },
    ],
    seedTasks: [
      { id: "db", title: "DBMS quiz", status: "todo", importance: 85, deadline: new Date(Date.now() + 36 * 3_600_000).toISOString(), createdAt: 0 },
      { id: "os", title: "OS lab", status: "todo", importance: 80, deadline: new Date(Date.now() + 24 * 3_600_000).toISOString(), createdAt: 0 },
      { id: "poster", title: "Club poster", status: "todo", importance: 40, deadline: new Date(Date.now() + 20 * 3_600_000).toISOString(), createdAt: 0 },
    ],
    turns: [
      { user: "everything is falling apart, i have 3 deadlines and i'm exhausted", expect: "tone" },
      { user: "i genuinely can't do all of them", expect: "north-star" },
      { user: "my energy is gone across literally everything i try", expect: "oracle" },
      { user: "i feel like just giving up honestly", expect: "tone" },
      { user: "give me an honest weekly review of where i am", expect: "auditor" },
      { user: "write me a short daily anchor to ground me", expect: "chronicler" },
    ],
  },
  {
    title: "Conv D — Identity & Red Book (goals + meaning + meta)",
    turns: [
      { user: "i want to become a backend engineer at a top company", expect: "north-star" },
      { user: "why does this even matter to me deep down", expect: "north-star" },
      { user: "let me talk to my future self one year from now", expect: "chronicler" },
      { user: "that answer was way too long, improve it", expect: "promptsmith" },
    ],
  },
];

async function run() {
  md("# 🗣️ Avnik — Live Conversation Tests");
  md("");
  md(`> Pipeline: \`POST /api/agent\` → Helmsman (Regulate → Route → Act → Observe). State threaded forward each turn (messages + events + beliefs + currentState). Generated by \`scripts/test-conversations.ts\`.`);
  md("");

  for (const conv of CONVS) {
    md(`\n## ${conv.title}`);
    const messages: Message[] = [];
    const events: Event[] = [...(conv.seedEvents ?? [])];
    const tasks: Task[] = conv.seedTasks ?? [];
    let beliefs: BeliefState | undefined;
    let currentState: Record<string, unknown> | undefined;
    if (conv.seedEvents?.length) md(`*seeded events:* ${conv.seedEvents.map(e => e.type).join(", ")}`);
    if (conv.seedTasks?.length) md(`*seeded tasks:* ${conv.seedTasks.map(t => t.title).join(" · ")}`);
    md("");

    for (const turn of conv.turns) {
      messages.push({ role: "user", content: turn.user });
      let out;
      try {
        out = await callAgent({ input: turn.user, messages, beliefs, tasks, events, currentState });
      } catch (e) {
        md(`- 🧑 **${turn.user}**`);
        md(`  - ❌ ERROR: ${(e as Error).message}`);
        continue;
      }
      messages.push({ role: "assistant", content: out.text, agent: out.agent });

      // Thread forward: accumulate events, carry beliefs from sideEffects, carry state.
      for (const se of out.sideEffects ?? []) {
        events.push(se);
        if (se.type === "belief_updated" && se.value) beliefs = se.value as BeliefState;
      }
      currentState = out.state;

      // Routing expectation (soft).
      let mark = "";
      if (turn.expect) {
        routeTotal++;
        const hit = out.route === turn.expect;
        if (hit) routeHits++;
        mark = hit ? `✅ →${out.route}` : `⚠️ expected **${turn.expect}**, got **${out.route}**`;
      } else {
        mark = `→${out.route}`;
      }

      md(`- 🧑 **${turn.user}**`);
      md(`  - 🤖 [${out.agent}] ${mark}`);
      md(`  - 💬 ${trunc(out.text)}`);
      const beliefTop = beliefs
        ? Object.entries(beliefs.rootCauses).sort((a, b) => b[1] - a[1])[0]
        : null;
      if (beliefTop) md(`  - 🧮 belief: ${beliefTop[0]} ${(beliefTop[1] * 100).toFixed(0)}% (conf ${(beliefs!.confidence * 100).toFixed(0)}%)`);
    }
  }

  md("");
  md("---");
  md(`## Routing accuracy: ${routeHits}/${routeTotal} expected routes hit (${routeTotal ? Math.round((routeHits / routeTotal) * 100) : 0}%)`);
  md("");
  md("> Routing is LLM-based (temp 0.2) so a few ⚠️ are normal — what matters is each turn produced a coherent, on-topic reply and the belief state evolved across turns.");

  mkdirSync("review", { recursive: true });
  writeFileSync("review/CONVERSATION-TESTS.md", MD.join("\n"), "utf8");
  console.log(MD.join("\n"));
  console.log(`\n\nSaved → review/CONVERSATION-TESTS.md  |  routing ${routeHits}/${routeTotal}`);
}

run().catch((e) => { console.error(e); process.exit(1); });
