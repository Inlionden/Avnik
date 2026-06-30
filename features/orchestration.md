# Orchestration — Implementation Spec

> Part of **Avnik**. Master overview → [`../FEATURES.md`](../FEATURES.md)
> **Pillar:** spans all 5 · **Agent:** 🧭 Manager · **Rubric owned:** autonomous planning **& execution** (#8)
> **The structural core.** This is the "simple but central" feature: a Manager agent that makes every other feature feel like one mind. Everything is agentic — each agent **perceives → reasons → acts**, and the Manager decides who runs.

---

## 🧭 The Manager (Orchestrator) · ⭐HERO 🟢 · Step 1 (seed) → Step 5 (full)

**What:** "In charge of the team." Reads every user message + current state, decides which agent(s) handle it, runs them (single or chained), merges the result into one reply.

**Perceive → Reason → Act:**
- **Perceive:** message + memory (profile, goals, tasks, mood, time, recent behavior).
- **Reason:** classify intent → pick agent(s) → pick communication mode → decide if action/tool is needed.
- **Act:** call the agent(s), optionally chain (e.g. Emotion Check-in → Triage → Just-Start-It), return one coherent response + any side-effects (task created, nudge scheduled, journal entry saved).

**Implementation points:**
- [ ] `lib/agents/manager.ts` — `route(message, context) → plan` (which agents, which order).
- [ ] Intent classifier (one Gemini/Groq call returns `{agent, mode, needsAction, params}` as JSON).
- [ ] Agent registry — each agent = `{ name, systemPrompt, tools[], run(ctx) }`.
- [ ] Chaining: Manager can run agents in sequence, passing outputs forward.
- [ ] Shared **context bus** = the Memory spine (see `memory-growth.md`) every agent reads/writes.
- [ ] Graceful fallback: if classification fails → default to Coach agent.
- [ ] Surface "which agent answered" in the UI (small tag) — makes the multi-agent system *visible* to judges.

## 👥 The Agent Roster (who the Manager routes to)

| Agent | Perceives | Acts | Spec file |
|---|---|---|---|
| 🎯 **Triage** | tasks, deadlines, energy | orders tasks, plans the day | `action.md` |
| 💬 **Coach** | message, mood, profile | replies in the right mode, negotiates | `psychology.md` |
| 🧠 **Profiler** | answers, behavior over time | updates the psych profile | `psychology.md` + `onboarding-identity.md` |
| 🌟 **North Star** | goals (Red Book) | ties tasks to meaning | `onboarding-identity.md` |
| ⏱️ **Focus** | session state | runs Pomodoro, breaks overwhelm | `action.md` |
| 🗂️ **Memory** | everything | stores & retrieves context | `memory-growth.md` |

## 🏛️ Multi-agent showcase — The Board Meeting
The weekly **Board Meeting** (detailed in `memory-growth.md`) is where the whole team reports on screen — the clearest visible proof of orchestration. Manager runs each agent, collects reports, synthesizes next week's plan.

**Implementation points:**
- [ ] Manager `runBoardMeeting()` calls each agent's `weeklyReport(ctx)` then a synthesis prompt.
- [ ] Render as a transcript (agent avatars + their report) → demo gold.
