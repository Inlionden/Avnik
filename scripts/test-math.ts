/**
 * Deterministic math verification — no LLM, pure functions.
 * Run:  npx tsx scripts/test-math.ts
 * Validates the Bayesian belief engine, slip-risk, sleep inference, place inference,
 * and self-scoring against the worked examples in features/math/*.md.
 */
import { runBayesUpdate } from "@/lib/agents/oracle/root-cause";
import { predictSlipRisk, scoreSelf } from "@/lib/tools/analytics";
import { estimateSleepFromGap, inferActivityFromPlace } from "@/lib/tools/sensing";
import { analyzeMotion, type MotionReading } from "@/lib/tools/motion";
import { passiveBeliefUpdate } from "@/lib/agents/tracker";
import { sanitizeReply } from "@/lib/agents/conversation/sanitize";
import type { Task, Event } from "@/lib/types";

// Synthetic IMU window: gravity baseline + sinusoidal bounce at `freqHz`, plus rotation.
function imuWindow(freqHz: number, amp: number, sec = 4, hz = 20, rot = 0): MotionReading[] {
  const n = sec * hz;
  return Array.from({ length: n }, (_, i) => {
    const t = i / hz;
    const mag = 9.8 + amp * Math.sin(2 * Math.PI * freqHz * t);
    return { mag, rot };
  });
}

let pass = 0, fail = 0;
const lines: string[] = [];
function log(s = "") { lines.push(s); }
function check(name: string, cond: boolean, detail = "") {
  if (cond) { pass++; log(`  ✅ ${name}${detail ? "  —  " + detail : ""}`); }
  else { fail++; log(`  ❌ ${name}${detail ? "  —  " + detail : ""}`); }
}
const pct = (n: number) => (n * 100).toFixed(1) + "%";
const top = (b: Record<string, number>) => Object.entries(b).sort((a, c) => c[1] - a[1])[0];
const sum = (b: Record<string, number>) => Object.values(b).reduce((s, v) => s + v, 0);
const entropyConf = (b: Record<string, number>) => {
  const v = Object.values(b);
  const e = -v.reduce((s, p) => s + (p > 0 ? p * Math.log(p) : 0), 0);
  return 1 - e / Math.log(v.length);
};

const PRIORS: Record<string, number> = {
  fear: 0.15, perfectionism: 0.15, burnout: 0.15, clarity: 0.15,
  distraction: 0.15, confidence: 0.10, overplanning: 0.10, boredom: 0.05,
};

log("══════════════════════════════════════════════════════════════");
log("  AVNIK — DETERMINISTIC MATH VERIFICATION");
log("  (pure functions, reproducible, no LLM)");
log("══════════════════════════════════════════════════════════════");

// ── TEST 1 — Single Bayes update: 'rewrites_same_work' → perfectionism dominates
log("\n▶ TEST 1 — Single update: 'rewrites same work 5×' (perfectionism likelihood 0.90)");
{
  const b = runBayesUpdate(PRIORS, "rewrites_same_work");
  const [cause, prob] = top(b);
  log(`    posterior: ${Object.entries(b).map(([k, v]) => `${k} ${pct(v)}`).join(" · ")}`);
  check("perfectionism becomes the top cause", cause === "perfectionism", `got ${cause} ${pct(prob)}`);
  check("perfectionism > 45%", prob > 0.45, pct(prob));
  check("distribution still sums to 1", Math.abs(sum(b) - 1) < 1e-9, sum(b).toFixed(6));
}

// ── TEST 2 — Burnout signal
log("\n▶ TEST 2 — 'energy drops across all tasks' (burnout likelihood 0.90)");
{
  const b = runBayesUpdate(PRIORS, "energy_drops_all_tasks");
  const [cause, prob] = top(b);
  log(`    posterior: ${Object.entries(b).map(([k, v]) => `${k} ${pct(v)}`).join(" · ")}`);
  check("burnout becomes the top cause", cause === "burnout", `got ${cause} ${pct(prob)}`);
  check("burnout > 50%", prob > 0.50, pct(prob));
}

// ── TEST 3 — Distraction signal
log("\n▶ TEST 3 — 'rapid task switching' (distraction likelihood 0.90)");
{
  const b = runBayesUpdate(PRIORS, "rapid_task_switching");
  const [cause] = top(b);
  check("distraction becomes the top cause", cause === "distraction", `got ${cause}`);
}

// ── TEST 4 — Sequential update = Story 3 'Perfection Cage' (9 rewrites + fear question)
log("\n▶ TEST 4 — Sequential evidence (Story 3: asks-if-good-enough, then rewrites ×9)");
{
  let b = { ...PRIORS };
  const c0 = entropyConf(b);
  b = runBayesUpdate(b, "asks_what_if_not_good_enough");
  log(`    after 'what if not good enough?': ${top(b)[0]} leads at ${pct(top(b)[1])}`);
  for (let i = 0; i < 9; i++) b = runBayesUpdate(b, "rewrites_same_work");
  const [cause, prob] = top(b);
  const c1 = entropyConf(b);
  log(`    after 9 rewrites: ${Object.entries(b).sort((a, c) => c[1] - a[1]).slice(0, 3).map(([k, v]) => `${k} ${pct(v)}`).join(" · ")}`);
  check("perfectionism is the dominant cause", cause === "perfectionism", `${pct(prob)}`);
  check("perfectionism > 80% after repeated evidence", prob > 0.80, pct(prob));
  check("confidence rose vs priors (entropy fell)", c1 > c0, `${pct(c0)} → ${pct(c1)}`);
}

// ── TEST 5 — Story 4 'Collapse Week': burnout signature wins over mixed evidence
log("\n▶ TEST 5 — Story 4 (Collapse Week): energy-drop evidence shifts belief to burnout");
{
  let b = { ...PRIORS };
  b = runBayesUpdate(b, "energy_drops_all_tasks");
  b = runBayesUpdate(b, "energy_drops_all_tasks");
  const [cause, prob] = top(b);
  check("burnout dominates after repeated energy-drop", cause === "burnout", `${cause} ${pct(prob)}`);
  check("burnout > 75%", prob > 0.75, pct(prob));
}

// ── TEST 6 — Unknown evidence key is a no-op (safety)
log("\n▶ TEST 6 — Unknown evidence key leaves beliefs unchanged");
{
  const b = runBayesUpdate(PRIORS, "totally_unknown_signal");
  check("returns priors unchanged", JSON.stringify(b) === JSON.stringify(PRIORS));
}

// ── TEST 7 — Slip-risk predictor
log("\n▶ TEST 7 — predictSlipRisk()");
{
  const far = new Date(Date.now() + 10 * 86_400_000).toISOString();
  const near = new Date(Date.now() + 1 * 86_400_000).toISOString();
  const highTask: Task = { id: "a", title: "x", status: "todo", importance: 30, deadline: far, createdAt: 0 };
  const lowTask: Task = { id: "b", title: "y", status: "todo", importance: 85, deadline: near, createdAt: 0 };
  const poorSleep = { estimatedHours: 4, bedtime: "", wakeTime: "", quality: "poor" as const, confidence: "inferred" as const };
  const goodSleep = { estimatedHours: 8, bedtime: "", wakeTime: "", quality: "good" as const, confidence: "inferred" as const };
  const hi = predictSlipRisk(highTask, poorSleep, "avoidant");
  const lo = predictSlipRisk(lowTask, goodSleep, "focused");
  check("low-importance + far deadline + poor sleep + avoidant → HIGH", hi === "high", hi);
  check("high-importance + near deadline + good sleep + focused → LOW", lo === "low", lo);
}

// ── TEST 8 — Sleep inference from app gap
log("\n▶ TEST 8 — estimateSleepFromGap()");
{
  const mk = (h: number, m: number, day = 15) => new Date(2026, 5, day, h, m, 0).getTime();
  const poorEvents: Event[] = [
    { ts: mk(1, 30), type: "app_close", source: "passive" },
    { ts: mk(6, 30), type: "app_open", source: "passive" },
  ];
  const goodEvents: Event[] = [
    { ts: mk(23, 0, 15), type: "app_close", source: "passive" },
    { ts: mk(7, 30, 16), type: "app_open", source: "passive" },
  ];
  const dayEvents: Event[] = [
    { ts: mk(14, 0), type: "app_close", source: "passive" },
    { ts: mk(17, 0), type: "app_open", source: "passive" },
  ];
  const poor = estimateSleepFromGap(poorEvents);
  const good = estimateSleepFromGap(goodEvents);
  const day = estimateSleepFromGap(dayEvents);
  check("1:30→6:30 ⇒ ~5h, quality poor", poor?.quality === "poor" && Math.abs((poor?.estimatedHours ?? 0) - 5) < 0.2, `${poor?.estimatedHours}h ${poor?.quality}`);
  check("23:00→7:30 ⇒ ~8.5h, quality good", good?.quality === "good" && Math.abs((good?.estimatedHours ?? 0) - 8.5) < 0.2, `${good?.estimatedHours}h ${good?.quality}`);
  check("14:00→17:00 daytime ⇒ not sleep (null)", day === null, String(day));
}

// ── TEST 9 — Place inference (the 'dining table' story)
log("\n▶ TEST 9 — inferActivityFromPlace() — the dining-table signal");
{
  const lunch = inferActivityFromPlace("eat", 20, 13);
  const study = inferActivityFromPlace("study", 30, 10);
  check("eat zone, 20min, 1pm ⇒ infers lunch + post-lunch dip", /ate lunch/i.test(lunch.note), lunch.note.slice(0, 50) + "…");
  check("study zone ⇒ deep-work suggestion", /focus|hardest/i.test(study.note), study.note.slice(0, 40) + "…");
}

// ── TEST 10 — Self score / grade
log("\n▶ TEST 10 — scoreSelf()");
{
  const tasks: Task[] = [
    { id: "1", title: "a", status: "done", createdAt: 0 },
    { id: "2", title: "b", status: "done", createdAt: 0 },
    { id: "3", title: "c", status: "done", createdAt: 0 },
    { id: "4", title: "d", status: "todo", createdAt: 0 },
  ];
  const events: Event[] = [
    { ts: 0, type: "focus_session_end", source: "active" },
    { ts: 0, type: "focus_session_end", source: "active" },
  ];
  const r = scoreSelf(tasks, events);
  check("3 done + 2 focus, 0 overdue ⇒ score 40, grade D", r.score === 40 && r.grade === "D", `score ${r.score} grade ${r.grade}`);
}

// ── TEST 11 — Phone motion sensors (accelerometer + gyroscope)
log("\n▶ TEST 11 — analyzeMotion() — IMU activity classification + step counting");
{
  const still   = imuWindow(0, 0.0, 4, 20, 0);     // flat on a table
  const sitting  = imuWindow(0.3, 1.0, 4, 20, 0);   // hand-held, small movement
  const walking = imuWindow(1.8, 2.5, 4, 20, 0);    // ~1.8 Hz cadence
  const running = imuWindow(3.0, 8.0, 4, 20, 0);    // fast + big amplitude
  const turning = imuWindow(0.2, 0.5, 4, 20, 150);  // little translation, high rotation

  const rWalk = analyzeMotion(walking);
  const rRun  = analyzeMotion(running);
  log(`    still=${analyzeMotion(still).activity} · sitting=${analyzeMotion(sitting).activity} · walking=${rWalk.activity}(${rWalk.steps} steps, ${rWalk.cadenceHz}Hz) · running=${rRun.activity} · turning=${analyzeMotion(turning).activity}`);
  check("flat phone ⇒ still", analyzeMotion(still).activity === "still");
  check("tiny fidget ⇒ sitting", analyzeMotion(sitting).activity === "sitting");
  check("1.8 Hz bounce ⇒ walking", rWalk.activity === "walking", `${rWalk.activity} ${rWalk.cadenceHz}Hz`);
  check("walking step count ≈ 7 (1.8Hz×4s)", Math.abs(rWalk.steps - 7) <= 2, `${rWalk.steps} steps`);
  check("3 Hz big amplitude ⇒ running", rRun.activity === "running", rRun.activity);
  check("high rotation, low translation ⇒ turning", analyzeMotion(turning).activity === "turning");
}

// ── TEST 12 — Passive belief tracker bootstraps from natural language (the wiring fix)
log("\n▶ TEST 12 — passiveBeliefUpdate() — always-on tracker turns chat text into beliefs");
{
  // No prior beliefs → a procrastination sentence should bootstrap a belief state.
  const t1 = passiveBeliefUpdate({ input: "i keep rewriting the same thing, it's never good enough", beliefs: undefined });
  check("natural text bootstraps beliefs (no prior needed)", !!t1, t1 ? `evidence: ${t1.evidence.join(",")}` : "null");
  check("perfectionism/fear surface from rewrite+good-enough text",
    !!t1 && ["perfectionism", "fear"].includes(Object.entries(t1.beliefs.rootCauses).sort((a, b) => b[1] - a[1])[0][0]),
    t1 ? Object.entries(t1.beliefs.rootCauses).sort((a, b) => b[1] - a[1])[0].join(" ") : "");

  // Threading: feed t1's beliefs back in with burnout text → state evolves, not resets.
  const t2 = passiveBeliefUpdate({ input: "honestly i'm exhausted and my energy is gone across everything", beliefs: t1?.beliefs });
  check("second turn threads prior beliefs forward (output→input)", !!t2 && t2.beliefs.updatedAt >= (t1?.beliefs.updatedAt ?? 0));

  // Neutral text → no evidence → no update (null).
  const t3 = passiveBeliefUpdate({ input: "what's the weather like today", beliefs: t1?.beliefs });
  check("neutral text yields no spurious belief update", t3 === null, String(t3));
}

// ── TEST 13 — Reply sanitizer (the A+ polish — strips LLM artifacts)
log("\n▶ TEST 13 — sanitizeReply() — removes self-corrections, filler, disclaimers");
{
  const leak = "That makes sense given all that's on your plate!  wait, let me rephrase that. What's feeling hardest right now?";
  const s1 = sanitizeReply(leak);
  check("strips 'wait, let me rephrase that'", !/rephrase/i.test(s1), s1);
  check("keeps the real content", /feeling hardest/i.test(s1));

  const filler = "Sure! Here's my response: you should start with the easiest task.";
  const s2 = sanitizeReply(filler);
  check("strips 'Sure!' + 'Here's my response:'", /^You should start/i.test(s2), s2);

  const disclaimer = "As an AI language model, I can't feel. But your plan looks solid.";
  const s3 = sanitizeReply(disclaimer);
  check("strips 'As an AI…' disclaimer", !/as an ai/i.test(s3) && /plan looks solid/i.test(s3), s3);

  const clean = "Work on the DBMS quiz first — it's worth the most and is due soonest.";
  check("leaves clean text untouched", sanitizeReply(clean) === clean);
}

log("\n══════════════════════════════════════════════════════════════");
log(`  RESULT:  ${pass} passed · ${fail} failed  (${pass + fail} checks)`);
log("══════════════════════════════════════════════════════════════");

console.log(lines.join("\n"));
process.exit(fail > 0 ? 1 : 0);
