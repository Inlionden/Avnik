# 🌌 Avnik — Master Outline (agents · tools · features · folders · tasks)

> The single index of **everything** to build, with names. Detailed specs live in [`features/`](features/); the page map is [`PAGES.md`](PAGES.md); the parallel plan is [`BUILD-PARALLEL.md`](BUILD-PARALLEL.md); the walkthrough is [`STORY.md`](STORY.md).

---

## 1. The Agent Constellation (named)

> Theme: a **ship of agents** steered toward your **North Star**. Each **Lead** is a named, user-facing agent; behind it run **sub-agents** (workers). The **Helmsman** routes between Leads.

### 🧭 The Helmsman — *Manager / Orchestrator*
Routes every message + state to the right Lead, chains them, merges one reply. Owns the tool registry + the agent loop.

### 🌟 North Star — *Goals & Meaning Lead* (drives the **Red Book**)
> **Red Book** = the document the user writes (what he wants to become + tracks). **North Star** = the agent that keeps every action pointed at it.
- **Goal-Keeper** — stores/edits Red Book goals
- **Meaning-Weaver** — ties each task to a goal ("this moves you toward placement")
- **Drift-Watcher** — flags goal drift / tasks tied to nothing

### 💬 The Mentor — *Conversation Lead* (the Coach)
- **Mood-Reader** · **Style-Tuner** · **Fit-Checker** (right size/wording) · **Interruption-Guard** · **Persona-Switcher** (Stoic/Scientist/Mentor/Strict/Socratic)

### 🔮 The Oracle — *Reasoning Lead* (why you're stuck)
- **Root-Cause** (Bayesian) · **Socratic-Interviewer** · **Statistician** (the math/Tracker) · **Causal-Cartographer** (causal graph) · **Pattern-Miner** (productivity theory)

### ⚡ The Quartermaster — *Action Lead* (tasks & execution)
- **Triage** (prioritize) · **Planner** (schedule) · **Starter** ("Just Start It For Me") · **Nudger** (Proactive Nudge) · **Pacer** (techniques/Pomodoro) · **Blocker-Watch** · **Contractor** (the **Ulysses Contract**)

### 👁️ The Sentinel — *Perception Lead* (gathers signal)
- **Mood-Checkin** · **Silence-Watcher** ("Silence Speaks") · **Context-Reader** (places/zones) · **Movement-Watcher** (sitting/steps) · **Sleep-Estimator** · **Vitals** (wearable, roadmap)

### 🗂️ The Archivist — *Memory Lead* (remember & retrieve)
- **Scribe** (writes) · **Retriever** (RAG-lite) · **Graph-Keeper** (cognitive graph)

### 📓 The Chronicler — *Reflection Lead* (journals)
- **Journal-Extractor** · **Anchor** (Daily Anchor / Philosophy Notebook) · **Future-Self** · **Board-Secretary** (the **Board Meeting**)

### 🪞 The Auditor — *Self-Evaluation Lead* (grades Avnik itself)
- **Self-Critic** · **Calibrator** · **Question-Designer** · **Tool-Selector** → the **Mirror** card

**Two context-inference examples (Sentinel):**
- 💤 *Sleep:* app closed 1:50 AM, reopened 9:05 AM, last activity late → **Sleep-Estimator** infers ~5h. **Next step:** Energy Prediction lowers today's load → Planner schedules lighter/earlier → Mentor mentions it gently → suggests earlier wind-down tonight.
- 🍽 *Eating:* phone stationary in **Dining** zone ~20 min at 1 PM → **Context-Reader** infers "ate" → expects a post-lunch dip → Pacer offers a shorter block after. *(Heuristic, opt-in, simulated on web.)*

---

## 2. Named Features (full list)
**Onboarding/Identity:** Big Five Assessment · **Red Book** · Live Conversation Profile bars
**Reasoning (the brain):** Procrastination Profile · **Bayesian Belief Engine** · Confidence Score · **Causal Graph** · **Cognitive Graph** · Personal Productivity Theory · Weekly Psychological Report · Adaptive Coach Personas
**Conversation:** 5 Modes · Adaptive Length · Context-Aware Length · Interruptibility · **"Don't Help Me"/Vent** · Communication Model
**Action:** Task Triage · Day Planner · **What Now?** · **Just Start It For Me** · **Proactive Nudge** · **5-Minute Bargain** · **Ulysses Contract** · Body-Double · **Technique System** (Pomodoro/52-17/Ultradian/Flowtime/2-Min/Eat-the-Frog/Timeboxing + Factory) · Blocker Tracker · Decision AI · Anti-Perfection
**Sensing/Reflection:** Multi-modal Journaling (3 levels) · **Silence Speaks** · **Daily Anchor / Philosophy Notebook** · Why Journal · **Future Self Dialogue** · Time Machine · Life Thesis
**Memory/Growth:** Memory Spine · Task DNA · Knowledge Vault · Failure Library · Predictive Insights · **Impact Dashboard** · Invisible Progress / Gamification · Habit Streaks · **The Board Meeting**
**LifeOS:** Context Engine · Movement Intelligence · Breathing/Stress · Energy Prediction · Environment Score · Productivity Map · Behavioral Digital Twin
**Meta:** **The Auditor / Mirror** (self-evaluation)

## 3. Named Tools (the MCP-style catalog)
**Perceive:** `getCurrentPlace` `getSteps` `getSittingDuration` `getNoiseLevel` `getLightLevel` `getDeviceUsage` `getCalendarLoad` `getSleep` `estimateSleepFromGap` `inferActivityFromPlace` `getHeartRate` `getHRV` `getSpO2` `getMood`
**Reason:** `runBayesUpdate` `calibrateBeliefs` `computeEnergy` `computeEnvironmentScore` `getProductivityMap` `predictSlipRisk` `getInsights` `detectCausalCycle` `evaluateIntervention` `scoreSelf`
**Memory:** `memoryGet` `memorySet` `memoryAppend` `memoryRetrieve` `definePlace` `logEvent` `getBeliefs` `snapshotTimeline`
**Act:** `createTask` `breakDownTask` `prioritizeTasks` `scheduleDay` `draftArtifact` `scheduleNudge` `sendCheckIn` `startBreathing`
**Technique:** `startTechnique` `createTechnique` `suggestTechnique` `logTechniqueOutcome` `timer.*`
*(Specs: [`tools.md`](features/tools.md), [`techniques.md`](features/techniques.md), [`self-eval.md`](features/self-eval.md).)*

## 4. Folder Structure
```
avnik/
├─ app/
│  ├─ layout.tsx · page.tsx · globals.css
│  ├─ intro/ · onboarding/
│  └─ (app)/  home/ coach/ tasks/ journal/ insights/ profile/ settings/
│     └─ api/ chat/route.ts · agent/route.ts
├─ components/  ui/ chat/ tasks/ dashboard/ onboarding/ reflection/ charts/
├─ lib/
│  ├─ types.ts · ai.ts · memory.ts
│  ├─ agents/  registry.ts · northstar/ mentor/ oracle/ quartermaster/ sentinel/ archivist/ chronicler/ auditor/
│  ├─ math/    bayes.ts · causal.ts · cognitive.ts · energy.ts · tracker.ts
│  ├─ tools/   registry.ts · sensing.ts · analytics.ts · memory.ts · actions.ts
│  └─ techniques/  presets.ts · factory.ts
├─ public/  intro.mp4 · assets
└─ docs/  + FEATURES.md OUTLINE.md PAGES.md BUILD-PARALLEL.md STORY.md + features/*
```

## 5. Master Task List (what to build)
**Foundation (Phase 0 — first):** clean scaffold · theme · intro · shell+nav · `types.ts` · `ai.ts` (Gemini+Groq) · `memory.ts` · agent `registry.ts` (Helmsman) · `tools/registry.ts` + function-calling · shadcn+Vengeance setup · Settings provider switch.
**Sentinel + Onboarding (Stream D):** Big Five quiz · Red Book · 3-level journaling · Silence Speaks · mood check-in · `definePlace` · sleep/activity inference (sim) · Live Profile bars.
**Oracle + Math (Stream B):** Bayesian engine + likelihood table · confidence score · Statistician/Tracker · Root-Cause · Socratic · causal graph (seed) · cognitive graph (seed) · productivity theory · predictive insights.
**Mentor + Conversation (Stream A):** chat UI · 5 modes + Vent · personas · Mood/Style/Fit/Interruption sub-agents · adaptive length · comm-profile updater · 5-Minute Bargain.
**Quartermaster + Action (Stream C):** task model · Triage · Planner · What Now? · Just Start It For Me · Proactive Nudge · Ulysses Contract · Technique System + Factory · Pomodoro · Blocker Tracker.
**Chronicler + Growth (Stream E):** Impact Dashboard · stats viz · belief timeline · Philosophy Notebook · Why Journal · Board Meeting · gamification · time-budget tracker · **Mirror** (Auditor card).
**Integration:** wire Helmsman → all Leads · connect pages to live agents · smoke-test the full loop.
**Ship:** deploy Google Cloud · GitHub · Google Doc · submit on BlockseBlock.

---
*Names can change — but this is the full map. Say **"build foundation"** to start Phase 0.*
