# Onboarding & Identity — Implementation Spec

> Part of **Avnik**. Master overview → [`../FEATURES.md`](../FEATURES.md)
> **Pillars:** 🔍 Reasoning (seed) + 📈 Growth · **Agents:** 🧠 Profiler, 🌟 North Star · **Rubric owned:** goal & habit tracking (#6), personalized recommendations (#3 seed)
> **First impression = the hook.** Within 2 minutes a new user should feel *"this thing already understands me."* Onboarding seeds the Procrastination Profile and the North Star that every other agent then uses.

---

## 🚪 First-Run Onboarding Flow · ⭐HERO 🟢 · Step 4
**What:** a short, warm first-launch sequence: intro → "what's stressing you?" → MBTI/behavior quiz → write your North Star → land on a personalized dashboard.
**Implementation points:**
- [ ] `onboarded` flag in Memory; route first-timers into the flow.
- [ ] 4–5 screens max; skippable but encouraged; everything stored to Memory.
- [ ] Ends by showing the first personalized insight (proof it listened).

## 🧠 Psychological Assessment — Big Five (OCEAN) + Work Style + Motivation · ⭐HERO 🟢 · Step 4
**What:** ~10–12 quick questions giving a **Big Five (OCEAN)** read + work style + motivation drivers. Formal model & data shape live in [`agentic.md` Layer 1](agentic.md). (We use OCEAN over MBTI — more scientifically credible for judges.)
**Implementation points:**
- [ ] Question bank (JSON) covering: openness, conscientiousness, extraversion, agreeableness, neuroticism; chronotype; deep vs bursts; planner vs spontaneous; fear vs boredom triggers; motivation drivers.
- [ ] Chip/slider answers → stored raw → inference (next).

## 🧬 Personality Inference ("ML judging", honestly LLM) · ⭐HERO 🟡 · Step 4
**What:** LLM reads the quiz answers → infers an MBTI-ish type + work-style + initial **Procrastination Profile** blocker weights. (Honest: LLM as classifier, not a trained model.)
**Implementation points:**
- [ ] Inference prompt → `{ type, workStyle, blockers{...}, bestHoursGuess }` → seeds `profile` (see `psychology.md`).
- [ ] Show the result as a friendly card the user can correct (correction = more signal).

## 📊 Live Conversation Profile (the wow visual) · ⭐HERO 🟢 · Step 4
**What:** progress bars that visibly update as you chat — `Direct ████ 96%`, `Examples ███ 72%`, `Long explanations ██ 18%`… proof it learns you.
**Implementation points:**
- [ ] `profile.commStyle = { directness, examples, brevity, motivation, bulletPoints, ... }` (0–100).
- [ ] After each exchange, lightweight update (heuristic + occasional LLM tag).
- [ ] Animated bars component; Coach reads these to shape replies.

## 🌟 North Star / Red Book (Master Diary) · ⭐HERO 🟢 · Step 4
**What:** the user writes their "gold goals" — the deep *why*. Every task later ties back to one. (Frankl/Nietzsche: a why makes the how bearable.)
**Implementation points:**
- [ ] `goals[] = { id, title, why, horizon, linkedTaskIds[] }` in Memory.
- [ ] Red Book UI (a special reflective page); North Star agent references it in planning & motivation.
- [ ] When prioritizing, surface "this moves you toward [goal]"; flag tasks tied to no goal.
