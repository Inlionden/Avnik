# Memory & Growth — Implementation Spec

> Part of **Avnik**. Master overview → [`../FEATURES.md`](../FEATURES.md)
> **Pillars:** 🧠 Memory + 📈 Growth · **Agent:** 🗂️ Memory · **Rubric owned:** goal & habit tracking (#6 partial), predictive insights (#11), impact dashboards (#10), gamification (#12)
> **The spine + the payoff.** Memory makes every other agent personal; Growth makes progress visible so users don't quit. "MLOps-like behavior buildup": store → retrieve → improve over time.

---

## 🗂️ Memory Spine (RAG-lite) · ⭐HERO 🟡→🟢 · Step 1 (seed) → Step 5 (full)
**What:** the shared store every agent reads/writes: profile, goals, tasks, journals, history.
**Implementation points:**
- [ ] `lib/memory.ts` — typed store in localStorage (later Firestore). Keys: `profile, goals, tasks, journal, contracts, failures, events`.
- [ ] `retrieve(query)` → relevant snippets injected into prompts (keyword first; Gemini embeddings if ahead = real RAG).
- [ ] Append-only `events[]` log (every action) → feeds insights, dashboard, board meeting.

## 🧬 Task DNA · 🌌roadmap 🟡
**What:** logs each task's context (mood, time, focus, place, device…) → discovers patterns.
**Implementation points:**
- [ ] Capture context on task complete; periodic pattern-mining prompt → insights (*"43% faster after coffee 9–11am"*).

## 📚 Knowledge Vault · 🌌roadmap 🔴
**What:** research/notes/PDFs → graph, mind-map, flashcards, quiz, revision schedule.
**Implementation points:**
- [ ] Save snippets; LLM → flashcards/quiz; spaced-repetition schedule.

## 🧯 Failure Library · 🌌roadmap 🟡
**What:** stores failures w/ reason, emotion, lesson, alternative, prevention; flags repeats.
**Implementation points:**
- [ ] On missed contract → structured failure entry; detect recurring patterns (*"5th time"*).

## 🎓 AI Research Coach · 🌌roadmap 🟡
**What:** explains *why this approach*, alternatives, papers, books, architecture — a mentor, not an answer machine.
**Implementation points:**
- [ ] "Teach me why" mode on any task; cites sources, offers alternatives.

## 🔮 Predictive Insights · ⭐HERO 🟡 · Step 3 (seed) → Step 5 (full)  · rubric #11
**What:** predicts deadline miss-risk, best focus hours, likely blockers, from events + Task DNA + Motivation Meter.
**Implementation points:**
- [ ] `slipRisk` + "best hours" computed from event history; surfaced on dashboard & via Proactive Nudge.
- [ ] Plain-language insight cards (*"You start late on math — schedule it first tomorrow"*).

## 📈 Impact Dashboard · ⭐HERO 🟢 · Step 5 · rubric #10
**What:** the home screen proof-of-value: tasks done, deadlines saved, focus minutes, momentum + motivation trends.
**Implementation points:**
- [ ] Aggregate from `events[]`; cards + simple trend charts.
- [ ] Built as the app's landing dashboard (shell stubbed in Step 1, filled here).

## 🎮 Invisible Progress / Gamification · ⭐HERO(core)/🌌(full) 🟡 · Step 5 · rubric #12
**What:** XP, consistency score, skill tree, identity graph — not just streaks. Makes growth visible.
**Implementation points:**
- [ ] XP per completed task/focus block; consistency score; level/identity badges.
- [ ] (Full) skill tree + learning graph = roadmap.

## 🔥 Habit Streaks · ⭐HERO 🟡 · Step 5 · rubric #6
**What:** track recurring habits/goals with streaks.
**Implementation points:**
- [ ] Recurring habit model; daily check; streak count + don't-break-the-chain UI.

## 🏛️ The Board Meeting (weekly multi-agent review) · ⭐HERO 🟢 · Step 5
**What:** the team meets on screen weekly: Triage (done/missed), Profiler (behavior shifts), North Star (goal drift), Why Journal (emotional trends) → Manager synthesizes next week. Showcases orchestration.
**Implementation points:**
- [ ] Each agent exposes `weeklyReport(ctx)`; Manager collects → synthesis prompt → plan.
- [ ] Render as an agent-by-agent transcript with avatars; export to the Reflection book.
