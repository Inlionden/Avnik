# 🔍 Avnik — Build Audit (state of the project)

> Snapshot date: **30 June 2026** · Branch `main` · Last commits: `[s2] 11-agent system`, `[s5] timer/tasks/planner`, `[s1] Groq default`, Foundation.
> Read with: [`FEATURES.md`](FEATURES.md) (vision + rubric §6) · [`OUTLINE.md`](OUTLINE.md) (master map) · [`stories/STORIES.md`](stories/STORIES.md) (the stress tests this audit is judged against).

## TL;DR verdict
**The brain is built. The body is not.** The agent/orchestration layer (the hardest part) is ~80% and genuinely good. But the four limbs that make Avnik *more than a chat-with-a-coach app* — **Perception (senses), the Math/Belief engine, the Proactive loop, and the visible Dashboard** — are at **0–10%**. Net product completion ≈ **30–35%**, and the **differentiators are the missing 65%**.

---

## 1. What's actually built (with evidence)

| Layer | Files | Depth | % of its spec |
|---|---|---|---|
| **Foundation (S1)** | `lib/{types,ai,memory,supabase,voice}.ts`, `components/{nav,ui/button,ui/card}`, PWA (`manifest.ts`,`sw.js`), Aurora `globals.css`, `settings` | Solid, shipped | **100%** |
| **Agents (S2)** | `lib/agents/**` — `helmsman` (ReAct), `regulator`, `tone/{sage,spark,sensei,selector}` (MoE), `north-star` (TMT math), `quartermaster`, `oracle`, `chronicler`, `archivist`, `courier`, `promptsmith`, `auditor` + `/api/{chat,agent}` + Coach UI | Strong, real routing | **~80%** of agent vision |
| **Techniques (S5)** | `lib/techniques/{presets,factory}.ts` (8 techniques + `suggestTechnique` + `createTechnique`), `components/tasks/Timer.tsx` | Works, all 8 timers | **~70%** |
| **Tasks/Action (S5)** | `components/tasks/{TaskList,DayPlanner,Timer}`, `app/(app)/tasks` | CRUD + drag-schedule + timer | **~50%** of `action.md` |
| **Coach chat** | `app/(app)/coach` → `/api/agent` → Helmsman | Live, agent-tagged | done |

**This is a legitimately good agentic core.** Helmsman does Regulate→Route→Act→Log; Tone is a real Mixture-of-Experts; North Star runs `M=(E×V)/(I×D)`. Don't rebuild it.

---

## 2. What is NOT built — the gap list (the important part)

| Spec file | Subsystem | Status | What's missing |
|---|---|---|---|
| [`features/math/*`](features/math/README.md) | 🧮 **Bayesian belief / causal / cognitive / energy / tracker** | **0%** — `lib/math/` is **empty** | The entire probabilistic brain. No belief %, no confidence score, no miss-risk. This is the "Agentic Depth (20%)" differentiator. |
| [`features/sensing.md`](features/sensing.md) | 👁️ **Perception** — 3-level journaling, passive+active fusion, "Silence Speaks" | **0%** | Nothing senses anything. Only the `Event` type exists. |
| [`features/lifeos.md`](features/lifeos.md) | 🌍 **LifeOS** — sleep detection, places (dining table!), movement, stress, energy, productivity map | **0%** | Your signature vision (sleep, "he's at the dining table → he ate") — completely absent. |
| [`features/onboarding-identity.md`](features/onboarding-identity.md) | 🧭 **Big Five quiz · Red Book · live profile bars** | **0%** (stub page) | No personality capture → tone/TMT run on default `50`s. No Red Book. |
| [`features/memory-growth.md`](features/memory-growth.md) + [`math/dashboard.md`](features/math/dashboard.md) | 📊 **Impact Dashboard · belief timeline · Board Meeting · Mirror · gamification · habit streaks** | **0%** (stub) | The *visible payoff* for judges. Home has hardcoded bars. |
| [`features/psychology.md`](features/psychology.md) | 🔍 **Procrastination Profile · Emotion Check-in · Motivation Meter UI · Future Self · Time Machine · Why Journal · Philosophy Notebook · Anti-Perfection** | **~5%** | Tone agents *talk* emotionally, but none of the structured psych features/screens exist. |
| Intro | 🎬 5-sec cinematic | **0%** (static text) | — |
| [`features/tools.md`](features/tools.md) | 🧰 **MCP-style tool layer** + MockSensorProvider | **~10%** | Only `registry.ts`. No perceive/reason/act tool catalog, no sensor mock to feed Perception. |

### Rubric reality check (what *works in the app right now*)
Of the 12 official features, **0 are fully solid; ~4 are partial** (prioritization via North Star agent, scheduling via DayPlanner, recommendations via Tone, autonomous-ish planning). **Missing entirely:** context-aware reminders (#4), goal/habit tracking (#6), real-time blocker tracking (#9), impact dashboard (#10), predictive insights (#11), gamification (#12). FEATURES.md §6 claims 10/12 — that's the *plan*, not the *build*.

---

## 3. Are the agents good enough? → **The conversation/reasoning agents: yes. The system as a whole: no — 4 whole agent-roles don't exist.**

The current 12 agents are all **request→response** (they fire when the user types). Your vision needs agents that **run in a loop, perceive the world, do math, and move first.** Those roles have **no owner**. Proposed additions:

| New agent | Role / pattern | Why it's required (and which story breaks without it) |
|---|---|---|
| 👁️ **Sentinel** | **Perception** — ingests passive signals (app-open gaps → sleep; dwell time → "ate"; typing silence → disengaged). Runs first in the loop. | Your #1 vision. Without it the app can't *see* anything. (Stories 1, 2, 5) |
| 🛰️ **Cartographer** | **Places/context** sub-agent of Sentinel — maps signals→zones (desk / bed / dining / outside). | "He's at the dining table" is impossible today. (Story 2) |
| 🧮 **Actuary** | **Belief engine owner** — runs Bayesian updates over the 8 root causes, confidence score, tracking stats. Owns `lib/math`. | Nobody runs the math brain. No belief %, no Mirror calibration. (Stories 3, 4) |
| 🔮 **Augur** | **Predictor** — miss-risk %, best-focus-hour forecast (rubric #11). Consumes Actuary. | "You're likely to miss this — start now." (Stories 1, 4) |
| 🔔 **Herald** | **Proactive nudge** — decides *when to reach out first* + renegotiates scope (rubric #4, #8). | The "Avnik moves first" headline. Today nothing is proactive. (Stories 1, 4, 5) |
| ⏰ **Metronome** | **Scheduler / loop driver** — the "agents running in a loop": decides when Sentinel samples, when Auditor evaluates weekly, when Herald fires. Makes self-eval autonomous ("knows *when* to evaluate"). | The loop you described doesn't exist; everything is on-demand. (Story 5) |
| 🛠️ **Artificer** | **Tool/Technique factory agent** — invents a *new* technique-tool at runtime via LLM ("MCP tools that create themselves"). | `factory.createTechnique` is a stub; nothing drives it. (Story 6) |
| 🎭 **Empath + Interlocutor** | **Conversation sub-group** — mood-from-text + interruptibility/length fit (you asked for a dedicated conversation group). Partially covered by Regulator; needs splitting out. | Adaptive length / "don't interrupt me now". (All stories) |

**Net: +6 core agents (+2 conversation sub-agents).** They cluster exactly in the 0%-built limbs: **perceive · compute · predict · act-first · loop.** Build these and the existing 12 finally have something real to reason over.

---

## 4. Recommended build order (highest leverage first)
1. **🧮 Actuary + `lib/math`** (Bayesian belief + tracker) — unlocks Insights, Mirror, Predictive (rubric #10/#11) and gives every agent real numbers.
2. **👁️ Sentinel + Cartographer + MockSensorProvider** (`lib/tools/sensing.ts`) — unlocks your signature sleep/place sensing; mock now, real sensors later.
3. **📊 Dashboard/Insights + Home (live)** — the visible payoff; render Actuary's output.
4. **🔔 Herald + ⏰ Metronome** — the proactive loop (the agentic headline).
5. **🧭 Onboarding (Big Five → Profile) + Red Book** — so tone/TMT stop running on default 50s.
6. **🛠️ Artificer + 🎭 conversation sub-group** — runtime technique invention + adaptive conversation.

---
*This audit is the gate. A subsystem is "done" only when its [story in `stories/STORIES.md`](stories/STORIES.md) plays end-to-end in the app.*
