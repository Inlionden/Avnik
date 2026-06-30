# Avnik — The Agentic Reasoning Engine (`agentic.md`)

> **The brain.** Don't build an AI that says *"Do Task A."* Build one that answers *"Why aren't you doing Task A?"* and *"What intervention is most likely to work for **this** person, right now?"*
> Part of **Avnik**. Master → [`../FEATURES.md`](../FEATURES.md). This is the **canonical spec for the Reasoning core** and deepens [`psychology.md`](psychology.md) + [`onboarding-identity.md`](onboarding-identity.md) (it supersedes them where they overlap).
> **Not new scope** — it's the rigorous blueprint for the Reasoning pillar we already committed to. Most layers just realize hero features more deeply.

**Owner agents:** 🧠 Profiler (L1, L5, L6) · 🔍 Root-Cause (L2, L3) · 💬 Coach (L4, L8) · 🗂️ Memory (L6, L7, L9) · 🧭 Manager (routes all). Every layer is agentic: **Perceive → Reason → Act.**

## The pipeline at a glance
```
PERCEIVE        DIAGNOSE          INTERVIEW       PRESCRIBE              ACT            LEARN                 REFLECT
Profile(L1)  →  Root cause %(L2) → Socratic(L3) → Person×Cause(L4)  →  intervention → Dynamic traits(L5)  → Weekly report(L7)
+ signals                                                                              + Prod. theory(L6)    + Journal(L9)
                                                                       Coach persona(L8) chosen from L1
```

---

## Layer 1 — Psychological Profile (initial assessment) · ⭐HERO 🟢 · Step 4
Spend the first ~5 min understanding the user, not collecting tasks.
**Hardcoded data model:**
```ts
profile = {
  ocean: { openness, conscientiousness, extraversion, agreeableness, neuroticism }, // 0–100
  workStyle: {
    chronotype: 'morning' | 'night',
    focus:      'deep' | 'bursts',
    planning:   'planner' | 'spontaneous',
    social:     'solo' | 'collaborative',
    drive:      'deadline-driven' | 'consistent',
  },
  motivation: { achievement, curiosity, competition, money, recognition, purpose }, // 0–100 weights
}
```
**Perceive→Reason→Act:** quiz answers → LLM infers OCEAN + workStyle + motivation → seeds every downstream layer.
**Implementation points:**
- [ ] Big Five quick quiz (~10–12 items, slider/chips) — short form, not clinical.
- [ ] Work-style + motivation questions.
- [ ] Inference prompt → fills `profile`; user can correct (correction = signal).

## Layer 2 — Root Cause Engine · ⭐HERO 🟢 · Step 2–3
> **Quantified by the Math Fork — see [`math/bayesian-belief.md`](math/bayesian-belief.md).** The probabilities below come from a real **Bayesian belief updater** (deterministic math), *narrated* by the LLM — not guessed.

For every postponed task, never assume laziness — predict cause(s) as **probabilities**, not labels.
**Hardcoded cause → signal map:**
| Root cause | Signals to detect |
|---|---|
| Fear of failure | delays important tasks, many "what if" questions |
| Perfectionism | rewrites repeatedly, never submits |
| ADHD / distraction | rapid app switching, unfinished subtasks |
| Burnout | energy drops across *all* tasks |
| Low confidence | frequently asks for reassurance |
| Lack of clarity | doesn't know the first step |
| Overplanning | plans endlessly, doesn't execute |
| Boredom | starts enthusiastically, quits quickly |
| Decision fatigue | avoids choices late in the day |
| Imposter syndrome | downplays achievements, avoids hard work |
**Output (adaptive, not diagnostic):** `{ fearOfFailure: 0.72, lackOfClarity: 0.18, burnout: 0.10 }`
**Implementation points:**
- [ ] LLM prompt: task + profile + recent events → probability vector over the 10 causes.
- [ ] Feed top cause into L3/L4; log to Memory for trends (→ L7).

## Layer 3 — Socratic Interview · ⭐HERO 🟢 · Step 2
Don't advise immediately — ask guided questions until the real cause surfaces. Feels like coaching.
**Hardcoded ladder (example):** *"Why haven't you started?" → "What's the hardest part?" → "What happens if it isn't perfect?" → "Who are you afraid will judge you?" → root: fear of failure.*
**Implementation points:**
- [ ] Socratic loop prompt; 3–5 questions max; stop when root cause confidence high.
- [ ] Question bank seeded per suspected cause (from L2).
- [ ] Outcome → confirms L2 probabilities + writes insight to Journal (L9).

## Layer 4 — Personality × Root Cause Matrix · ⭐HERO 🟢 · Step 3
Same problem, different solution per person. **Hardcoded advice rules:**
| Condition | Intervention |
|---|---|
| High Conscientiousness + Perfectionism | "Submit version 1 after 30 minutes." |
| High Neuroticism + Fear | "Break it into the smallest possible action." |
| High Openness + Boredom | "Gamify it or add novelty." |
| Low Conscientiousness + Distraction | "Remove distractions; use structured intervals (Pomodoro)." |
| High Achievement-motivation + Low confidence | "Stack one tiny win first to prove momentum." |
| Purpose-motivated + Lack of clarity | "Connect this task to your North Star, then define step 1." |
| Decision fatigue (late day) | "I'll choose for you — do exactly this one thing." |
**Implementation points:**
- [ ] Rules table in code as a first-pass; LLM fills gaps when no rule matches.
- [ ] Intervention dispatches to an Action feature (5-min bargain / Just-Start-It / Pomodoro).

## Layer 5 — Dynamic Personality · ⭐HERO(light) 🟡 · Step 5
Personality isn't fixed — track movement → sense of growth.
**Tracked (0–100, over time):** confidence ↑, stress ↓, discipline ↑, focus ↑, consistency ↑.
**Implementation points:**
- [ ] After sessions/contracts, nudge these traits from outcomes.
- [ ] Trend lines on the dashboard (ties to Growth pillar / Impact Dashboard).

## Layer 6 — Personal Productivity Theory ⭐ · 🌌roadmap(light in Step 5) 🟡
A living, natural-language model of how *this* user works.
**Example facts (auto-derived from events):**
- "Performs best 8–11 AM." · "Complex coding ≤ 90 min." · "Starts faster when first task < 5 min." · "Struggles with ambiguous tasks." · "After one success, productivity rises for ~3 hrs."
**Implementation points:**
- [ ] Pattern-mining prompt over `events[]` → a list of model facts (with confidence).
- [ ] Inject relevant facts into planning (Day Planner) & nudges.

## Layer 7 — Weekly Psychological Report ⭐⭐⭐ · ⭐HERO 🟢 · Step 5
Beyond completed tasks — a mirror. **Hardcoded template:**
```
This Week
  Delayed 9 tasks → Fear of failure 4 · Lack of clarity 3 · Burnout 2
  Average confidence: 82%
  Most productive hour: 9–11 AM
  Most distracting app: Instagram
  Biggest improvement: started tasks 18% faster
```
**Implementation points:**
- [ ] Aggregate L2 causes + L5 traits + events → report. Powers the **Board Meeting**.

## Layer 8 — Adaptive AI Coach (personas) · ⭐HERO 🟢 · Step 2
Coaching *style* adapts to personality (distinct from reply-length modes). **Hardcoded personas + prompt seeds:**
| Persona | Seed |
|---|---|
| 🏛️ The Stoic | calm, disciplined; quotes Seneca / Marcus Aurelius |
| 🔬 The Scientist | explains habits via psychology + research |
| 🤗 The Friendly Mentor | warm, supportive, encouraging |
| 🎯 The Strict Coach | direct, accountability-first |
| 🧠 The Socratic Philosopher | mostly asks questions |
**Auto-select rule:** pick persona from `profile.ocean` + state (e.g. high neuroticism → Friendly Mentor; high conscientiousness + low results → Strict Coach; high openness → Socratic/Scientist). User can override.
**Implementation points:**
- [ ] `PERSONA_PROMPTS` map; Manager auto-selects, user can switch.
- [ ] Reconciles with the 5 reply-length modes (length = secondary axis).

## Layer 9 — Personal Knowledge Journal ⭐⭐⭐ · ⭐HERO 🟢 · Step 4–5
After each work session, the AI auto-writes a page → over a year, a personalized book of how your thinking evolved. **Hardcoded sections:**
```
1. What you worked on
2. Why you struggled        (from L2 root cause)
3. What helped              (which intervention worked)
4. Research-backed insight  (the Scientist)
5. Philosophical reflection (Gita/Stoic/Frankl — the Daily Anchor)
6. Suggestion for tomorrow  (the next 5-min start)
```
**Implementation points:**
- [ ] On session end (Pomodoro/contract), generate the 6-section page; store to the growing book.
- [ ] Merges Philosophy Notebook + Why Journal into one auto-written artifact.

---

## Consolidated data model (what Memory holds)
```ts
memory = {
  profile,                        // L1 + L5 dynamic traits
  rootCauseHistory: Event[],      // L2 outputs over time
  productivityTheory: Fact[],     // L6
  journal: Page[],                // L9
  events: Event[],                // everything (drives L6, L7, dashboards)
}
```

## Pillar & rubric mapping
Reasoning pillar = L1–L4, L8. Growth = L5, L6. Reflection = L7, L9.
Rubric: **personalized recommendations (#3)** = L4+L8 · **predictive insights (#11)** = L6 · **context-aware (#4)** = L2+L8.

## Build phasing (honest, for 36 hrs)
- **Hero now:** L1 (light), L2, L3, L4, L7, L8, L9 — these *are* our committed Reasoning/Reflection features, done rigorously.
- **Light/Step 5:** L5, L6 (simulate from limited data; deepen if ahead).
- The full versions (rich L5/L6 over months of data) = roadmap for the pitch.
