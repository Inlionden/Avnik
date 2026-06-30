# 🧮 Tracking Agent (the Statistician)

> Part of the [Math Fork](README.md). Owner of all quantitative state. Runs **continuously in the background**, not in the chat loop.

## Role
Collect every signal, run the math, keep the belief state current, and expose it to the brain ([`../agentic.md`](../agentic.md)) and the [dashboard](dashboard.md). One agent concerned **only with tracking + statistics + probability** — the deterministic engine.

## Perceive → Compute → Expose
- **Perceive:** ingest evidence from [`../sensing.md`](../sensing.md) — active (journal extractions, mood check-ins, "Silence Speaks" taps) + passive (task completion, delays, time-on-task, task-switching, focus sessions, missed deadlines, calendar load, sleep if available).
- **Compute:** on each new piece of evidence → run a **Bayesian update** ([`bayesian-belief.md`](bayesian-belief.md)); on rollups → update the **causal graph** + **cognitive graph**; recompute trait trends + productivity-theory facts.
- **Expose:** publish `beliefs` (root-cause %), `confidence`, `traits`, `graphs`, `timeline` to Memory so any agent/dashboard can read them.

## What it tracks (the evidence schema)
```ts
Evidence = {
  ts, type,                  // 'task_completed' | 'task_delayed' | 'mood' | 'journal' | 'switch' | 'focus' | 'missed' | 'silence' ...
  taskId?, value?,           // numeric/categorical payload
  source: 'active' | 'passive',
}
BeliefState = {
  rootCauses: { fearOfFailure, perfectionism, burnout, lackOfClarity, distraction, lowConfidence, overplanning, boredom }, // sums to 1
  confidence: number,        // how sure the engine is overall
  traits: { confidence, stress, discipline, focus, consistency }, // 0–100, dynamic (agentic L5)
  updatedAt,
}
```

## Cadence (static / dynamic / hybrid)
- **Per-event (dynamic):** Bayesian update fires immediately on new evidence.
- **Daily/weekly/monthly rollups (scheduled):** recompute trends, graphs, productivity theory, and snapshot the belief state into the **timeline**.
- **Static facts:** Big Five baseline (from onboarding) stored once; drifts only slowly (hybrid).

## Implementation points
- [ ] `lib/math/tracker.ts` — `ingest(evidence)`, `update()`, `snapshot()`, `getBeliefs()`.
- [ ] Hooks: every task/focus/mood/journal event calls `ingest`.
- [ ] Persist `BeliefState` + an append-only `timeline[]` of snapshots in Memory.
- [ ] Pure functions (deterministic) so the same evidence always yields the same beliefs — testable.
- [ ] Expose a read API for the dashboard + the Coach.
