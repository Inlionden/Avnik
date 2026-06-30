# Psychology Engine — Implementation Spec (the big one)

> Part of **Avnik**. Master overview → [`../FEATURES.md`](../FEATURES.md)
> **Pillars:** 🔍 Reasoning + 📓 Reflection · **Agents:** 💬 Coach, 🧠 Profiler · **Rubric owned:** personalized recommendations (#3), context-aware (#4), predictive insights (#11 partial)
> **The soul of Avnik.** Procrastination is emotion + identity + temporal conflict, not forgetfulness. Every feature here **perceives** your inner state and **acts** to move you. Grounded in research: Steel (2007/2018) Temporal Motivation Theory; Aristotle (akrasia); emotion-regulation theory; Frankl/Nietzsche (meaning); Stoics & Bhagavad Gita (Karma Yoga).

---

## 💬 Coach & the 5 Modes · ⭐HERO 🟢 · Step 2
**What:** the voice of Avnik. Same brain, 5 switchable personalities + adaptive reply length.
- ⚡ **Focus** — one-line replies only. · 💬 **Coach** — medium guidance. · 🤝 **Friend** — casual. · 🧠 **Socratic** — mostly questions. · 🤫 **Vent** — listens, saves it, *no advice unless asked*.
**Perceive→Reason→Act:** reads mode + mood → constrains tone/length → replies; always offers the **next smallest action**, never a lecture.
**Implementation points:**
- [ ] `lib/agents/coach.ts` with a `MODE_PROMPTS` map (5 system prompts + length caps).
- [ ] Mode switcher UI (chips); persists per session.
- [ ] "Next smallest action" rule baked into every mode prompt.
- [ ] Vent mode: store the vent to Why Journal, reply with restraint only.

## 🧠 Procrastination Profile (Psychological Digital Twin) · ⭐HERO 🟢 · Step 4
> **Formalized as the Root Cause Engine — see [`agentic.md` Layers 2–4](agentic.md).** The blockers below become a probability vector + the Personality×Cause advice matrix.

**What:** a living profile of *why* you stall: fear of failure, perfectionism, distraction (ADHD-like), overplanning, burnout, low clarity, low confidence, boredom, decision fatigue, imposter syndrome.
**Perceive→Reason→Act:** perceives onboarding answers + ongoing behavior (delays, vents, missed contracts) → infers dominant blockers (weights 0–100) → makes the Coach phrase everything to that blocker. *"You avoid DSA because you don't know where to begin — let's do one easy problem for 5 min."*
**Implementation points:**
- [ ] `profile.blockers = { fearOfFailure, perfectionism, distraction, overplanning, burnout, lowClarity, lowConfidence, boredom }` (0–100).
- [ ] Seed from MBTI/behavior quiz (see `onboarding-identity.md`).
- [ ] Update function: after each delay/vent/missed-task, LLM nudges the weights.
- [ ] Inject top blockers into every agent's context.

## ❤️‍🩹 Emotion-First Check-in · ⭐HERO 🟢 · Step 2
**What:** before planning a task, asks how you *feel* about it; classifies the blocker; picks the matched intervention.
**Implementation points:**
- [ ] Quick feeling picker (chips) + free text.
- [ ] LLM classifier → blocker → intervention map (fear→shrink task; boredom→gamify/why; perfectionism→Anti-Perfection; overwhelm→5-min bargain).
- [ ] Feeds the Procrastination Profile + Why Journal.

## 📊 Motivation Meter (Temporal Motivation Theory) · ⭐HERO 🟢 · Step 3
**What:** scores `Motivation = (Expectancy × Value) / (Impulsiveness × Delay)` per task; says which lever to pull.
**Implementation points:**
- [ ] LLM estimates 4 levers (0–1) from task + profile; compute score.
- [ ] Visual meter + the single recommended lever action (distant deadline→fake near-milestone; low expectancy→shrink; low value→link North Star; high impulsiveness→Focus block).

## 🤝 The 5-Minute Bargain (akrasia negotiator) · ⭐HERO 🟢 · Step 2
**What:** when reason vs desire conflict, negotiates instead of nagging: *"Just 5 minutes, then quit if you want."* Lowers activation energy.
**Implementation points:**
- [ ] Detect avoidance language → trigger bargain.
- [ ] Offer a 5-min Focus block (links Pomodoro); celebrate starting, not finishing.

## ✋ Anti-Perfection Mode · 🌌roadmap 🟡
**What:** detects over-perfecting (*"rewritten this email 5×"*) and calls it: *"This is no longer improvement — it's perfectionism. Ship it."*
**Implementation points:**
- [ ] Track revisit/edit count per task; threshold → intervention prompt.

## 🗣️ AI Debate (Socratic) · 🌌roadmap 🟡
**What:** argues back like Socrates, keeps asking *why* until the real reason surfaces.
**Implementation points:**
- [ ] Socratic system prompt loop; stop when root cause reached → log to Why Journal.

## 🪔 Philosophy Notebook / Daily Anchor · ⭐HERO 🟢 · Step 4
**What:** one AI-written page per day, matched to your state → 365 pages/yr = a personal philosophy book.
- Sources by blocker: fear → **Gita Karma Yoga** ("act without attachment to results"); distraction → Pascal/Seneca; lost purpose → Nietzsche ("a why to bear any how"); delay → Seneca ("while we postpone, life speeds by").
**Implementation points:**
- [ ] Curated quote bank (JSON: source, text, theme) + LLM matcher to today's blocker.
- [ ] Daily page template: *today's resistance · the philosophy · the quote · your observation · tomorrow's 5-min start.*
- [ ] Store every page → the growing book (Reflection memory).

## 📓 Why Journal · ⭐HERO 🟢 · Step 5
**What:** every delay logs a one-line *why*; after time → weekly report (emotional trends, biggest fear, biggest distraction, most productive hours).
**Implementation points:**
- [ ] On delay/skip, prompt one sentence; store `{ts, task, whyText, emotion}`.
- [ ] Weekly aggregation prompt → report; feeds Board Meeting + Predictive Insights.

## ✉️ Future Self Dialogue · ⭐HERO 🟢 · Step 3
**What:** talk to **Present / Future (1yr) / Past** self; Gemini voices all three. Future self: *"I succeeded because I started before feeling ready."* Collapses temporal discounting.
**Implementation points:**
- [ ] 3 persona prompts seeded with the user's goals + current behavior.
- [ ] Chat surface to switch persona; optional "letter from future self" one-shot.

## ⏳ Time Machine · 🌌roadmap 🟡
**What:** simulates the consequences of skipping today: today → tomorrow → exam day → interview → outcome, as a visual timeline. Humans act on stories, not dates.
**Implementation points:**
- [ ] LLM generates a branching consequence narrative from the task + deadline; render as a timeline.

## 📖 Life Thesis Generator · 🌌roadmap 🟡
**What:** monthly "your philosophy" write-up from your data — reads like a biography by AI.
**Implementation points:**
- [ ] Monthly aggregation of profile + journals → long-form reflection.
