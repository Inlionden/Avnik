# 📊 Stats Dashboard — the user-facing view of the math

> Part of the [Math Fork](README.md). Where the user **sees the numbers** — root-cause confidence %, trait trends, belief timeline, the cognitive graph, and time-budget tracking. Periods: **daily / weekly / monthly / custom**. (This is the quantitative side of the [Impact Dashboard](../memory-growth.md).)

## What it shows
1. **Current understanding (Bayesian beliefs)** — root-cause % bars + overall confidence ([`bayesian-belief.md`](bayesian-belief.md)).
2. **Dynamic traits** — confidence / stress / discipline / focus / consistency, as trend lines (agentic L5).
3. **Belief timeline** — how the dominant cause shifted (Week 1 → 4 → 8).
4. **Causal insight card** — the upstream-cause sentence (e.g. sleep→burnout).
5. **Cognitive graph** — a visual of the user's habit network (seeded for now).
6. **Productivity-theory facts** — "best 8–11 AM", "coding ≤ 90 min" (agentic L6).
7. **Time-budget tracking** — see below.

## Static / Dynamic / Hybrid views
- **Static** — fixed-ish facts: Big Five baseline, chronotype, motivation drivers. Shown as a stable profile card.
- **Dynamic** — updates every interaction: root-cause beliefs, traits, blockers.
- **Hybrid** — slow-drifting: Big Five can nudge over months; shown with a "drift" indicator.

## Time-budget tracking (stipulated time → part-times)
The user can set a **stipulated time** for a task; the dashboard divides it into **part-times (segments)** — **equal**, or **weighted by priority / expected difficulty** — and tracks **completion against each segment**.
- Example: 3-hour assignment → 4 segments. Equal = 45 min each; priority-weighted = 60/60/40/20 if early parts are harder.
- Live: which segment you're in, % of the budget used vs % of task done → flags "behind pace" → triggers a Proactive Nudge / re-plan.
**Implementation points:**
- [ ] `task.timeBudget = { totalMin, segments: [{label, plannedMin, doneMin, weight}] }`.
- [ ] Split mode: `equal | priorityWeighted | difficultyWeighted`.
- [ ] Pace meter: `usedFraction` vs `doneFraction` → on/behind/ahead.

## Periods
- [ ] Daily / Weekly / Monthly tabs + a **custom range** (the "stipulated time" they set).
- [ ] Each period aggregates from `events[]` + belief snapshots in that window.

## Implementation points
- [ ] `app/(dashboard)` route reading the Tracking Agent's published state.
- [ ] Bar/line components (lightweight — no heavy chart lib needed for MVP).
- [ ] Everything read-only from Memory; the Tracking Agent owns the numbers.

## Build phasing
- ⭐ **HERO:** beliefs %, trait trends, timeline, time-budget pace meter, period tabs.
- 🟡 **Light:** causal insight card.
- 🌌 **Roadmap:** interactive cognitive-graph viz.
