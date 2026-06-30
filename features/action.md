# Action Engine — Implementation Spec (the agentic core)

> Part of **Avnik**. Master overview → [`../FEATURES.md`](../FEATURES.md)
> **Pillar:** ⚡ Action · **Agents:** 🎯 Triage, ⏱️ Focus · **Rubric owned:** task prioritization (#1), scheduling (#2), context-aware (#4), autonomous planning **& execution** (#8), real-time issue tracking (#9)
> **Where Agentic Depth is scored.** These agents don't just talk — they **act**: create, schedule, start, nudge, and hold you to it.

---

## 🎯 Task Triage + AI Prioritization · ⭐HERO 🟢 · Step 3
**What:** add tasks (title, deadline, est. effort, importance); AI orders them.
**Perceive→Reason→Act:** perceives tasks + time left + your energy/profile → reasons urgency×importance×effort → outputs an ordered list + the one to do now.
**Implementation points:**
- [ ] Task model `{id, title, deadline, effortMin, importance, status, blockers[]}` in Memory.
- [ ] Prioritization prompt → ranked list with one-line *why* each.

## 🧮 Decision AI (advanced ranking) · 🌌roadmap 🟡
**What:** ranks by impact, deadline, difficulty, energy, long-term value, regret-if-delayed, opportunity cost.
**Implementation points:**
- [ ] Multi-factor scoring prompt; show the factor breakdown per task.

## 🗓️ Day Planner · ⭐HERO 🟢 · Step 3
**What:** lays prioritized tasks into time blocks around your energy curve.
**Implementation points:**
- [ ] Generate a time-blocked schedule (respect deadlines + best-focus hours from profile).
- [ ] Editable timeline UI.

## ❓ "What Now?" · ⭐HERO 🟢 · Step 3
**What:** the panic button — given time left + mood, returns the single next action.
**Implementation points:**
- [ ] One-tap; uses Triage + Emotion + Motivation Meter; returns 1 action, nothing else.

## 🛠️ "Just Start It For Me" (execution agent) · ⭐HERO 🟢 · Step 3
**What:** does the first real step *for* you — drafts the email, outlines the essay, generates problem #1, splits a project into a scheduled task list. Autonomous **execution**.
**Implementation points:**
- [ ] Tool: `generateFirstStep(task)` → produces a concrete artifact (draft/outline/checklist).
- [ ] "Break this down" → auto-creates sub-tasks in the task list.
- [ ] Always hands back a started object, never a blank page.

## 🚀 Proactive Nudge ("Avnik moves first") · ⭐HERO 🟢 · Step 5
**What:** watches deadlines + patterns, reaches out *before* you slip, right moment + tone. The rubric's "agent, not reminder" headline.
**Perceive→Reason→Act:** perceives time + unstarted tasks + your low-focus windows → predicts slip risk → acts by surfacing a nudge with a ready 5-min start.
**Implementation points:**
- [ ] Rule/score engine: `slipRisk(task) = f(timeLeft, notStarted, historicalDelay)`.
- [ ] In-app nudge feed (web push = stretch). Tone adapts to profile.
- [ ] Each nudge carries a one-tap action (start / reschedule / "I did it").

## 🤝 Commitment Pact (Ulysses Contract) · ⭐HERO 🟡 · Step 5
**What:** you precommit (*"done by 6pm"*); Avnik holds you, **renegotiates scope when motivation drops** (*"you won't do 3h — commit to 30 min?"*), and if missed asks *"what prevented success?"* (not "you failed") → learning data.
**Implementation points:**
- [ ] Contract model `{task, promiseTime, scope, status}`.
- [ ] On deadline: check-in; if missed → blameless post-mortem → Failure Library + Why Journal.

## 👥 Body-Double Focus Session · 🌌roadmap 🟡
**What:** live "work with me" sprint; Avnik stays present, checks in mid-session, adapts.
**Implementation points:**
- [ ] Session loop with periodic check-ins ("still on it? stuck?"); pairs with Pomodoro.

## ⏱️ Pomodoro / Focus Blocks · ⭐HERO 🟢 · Step 5
**What:** timed deep-work mini-mode; the container for actually doing.
**Implementation points:**
- [ ] Timer (25/5 default, configurable); start from any task or the 5-min bargain.
- [ ] Interruptibility: silent during a block, summarize after.

## 🚧 Real-time Blocker Tracker · ⭐HERO 🟡 · Step 3
**What:** tracks live blockers per task ("stuck: don't know where to start") + missed commitments, surfaced as they happen. (rubric #9)
**Implementation points:**
- [ ] `task.blockers[]` editable; quick "I'm stuck" → logs blocker + triggers Emotion Check-in.
- [ ] Dashboard shows currently-blocked tasks in red.
