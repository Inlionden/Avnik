# Avnik — Product Vision & Build Plan (Single Source of Truth)

> **Avnik — your last-minute life saver.**
> Not a to-do app. A **Personal Operating System**: a team of AI agents that learns *how you think, why you delay, and how to move you forward* — and **acts** before deadlines are missed.

> **How to read this doc:** this is the master knowledge base for Avnik. Anyone (teammate, judge, or AI assistant) should be able to read it and understand the entire product. §4 is the **complete vision catalog** (every feature). §5 is the **committed hackathon build** (the hero set, as a checklist). Tags: `[ ]` to-do · `[x]` done · ⭐**HERO** = we build it now · 🌌 **roadmap** = vision/pitch, built only if ahead · 🟢 real · 🟡 light/LLM-simulated.

**Hackathon:** Vibe2Ship (Coding Ninjas × Google for Developers) · **Problem A — The Last-Minute Life Saver**
**Deadline:** 30 June 2026, 11:59 PM · **Today:** 29 June · **Status:** 🟡 PLANNING — *nothing built yet.*

---

## 0. Progress Tracker
- [x] Scaffold Next.js 16 app at Avnik root
- [x] Lock full vision + build plan (this file)
- [ ] **Step 1** — Foundation & first impression
- [ ] **Step 2** — The Coach + Emotion engine
- [ ] **Step 3** — Action: tasks, prioritization & motivation
- [ ] **Step 4** — Identity: onboarding, North Star & "learns you"
- [ ] **Step 5** — Memory, reflection, growth & ship to Google Cloud

---

## 📁 Detailed Implementation Specs (the split)
This master file = **generic overview + checklists + the rubric gate**. The **full per-feature implementation points** live in [`features/`](features/):

| File | Contains | Size |
|---|---|---|
| [`features/agentic.md`](features/agentic.md) | 🧠 **THE BRAIN** — the 9-layer reasoning engine (profile → root-cause % → Socratic → prescribe → learn → reflect) | 🔥🔥 core |
| [`features/sensing.md`](features/sensing.md) | 👁️ **THE SENSES** — multi-modal journaling (3 effort levels), passive+active fusion, "Silence Speaks" | 🔥 core |
| [`features/math/`](features/math/README.md) | 🧮 **THE MATH FORK** — Bayesian belief engine, causal & cognitive graphs, tracking agent, stats dashboard (6 sub-specs, deterministic math + LLM narration) | 🔬 research core |
| [`features/orchestration.md`](features/orchestration.md) | The multi-agent **Manager** & how agents perceive→reason→act | structural core |
| [`features/psychology.md`](features/psychology.md) | **The big one** — all psychological & procrastination-science features, fully detailed | 🔥 largest |
| [`features/conversation.md`](features/conversation.md) | 🗣️ **THE VOICE** — dedicated conversation agent group (mood/fit/style/interruptibility), modes, adaptive length, comm-profile | 🔥 core |
| [`features/action.md`](features/action.md) | Agentic execution: prioritize, plan, start-for-you, nudge, commit, blockers | large |
| [`features/memory-growth.md`](features/memory-growth.md) | Memory/RAG, predictive insights, impact dashboard, gamification, board meeting | large |
| [`features/onboarding-identity.md`](features/onboarding-identity.md) | Onboarding, MBTI, live profile bars, North Star / Red Book | medium |
| [`features/lifeos.md`](features/lifeos.md) | 🌍 **LifeOS** — context/places, movement, breathing/stress, energy, environment, productivity map, behavioral twin (privacy-first) | large (mostly roadmap) |
| [`features/tools.md`](features/tools.md) | 🧰 **TOOL LAYER** — MCP-style tools agents call to perceive/analyze/act (function-calling); sensor simulation | infra core |
| [`features/techniques.md`](features/techniques.md) | ⏱️ **TECHNIQUES** — Pomodoro + many rhythms; the Pacer + a factory that *creates* timer tools | core |
| [`features/self-eval.md`](features/self-eval.md) | 🪞 **THE AUDITOR** — Avnik grades its own understanding (the Mirror calibration card) | core |

> Every feature in §4 lives in exactly one spec file with its **implementation checklist**. This master stays the generic + checklist layer.

> 🛠️ **Building with multiple Claude sessions?** See [`BUILD-PARALLEL.md`](BUILD-PARALLEL.md) for the principle, and **[`SESSIONS.md`](SESSIONS.md) for the 5 copy-paste session briefs** (UI · Agents · Math+Quiz+Intro · Dashboard · Tasks) with shared contracts so they never collide.
> 🗺️ **Page map & navigation:** see [`PAGES.md`](PAGES.md) — all screens, nav, and what each button leads to (high-level).
> 🎬 **See it in action:** [`STORY.md`](STORY.md) — a mock user (Arjun) across 2 days: onboarding, agent collaboration, memory store/retrieve, Bayesian belief shifts, dashboards, the last-minute save.
> 🌌 **THE MASTER MAP:** [`OUTLINE.md`](OUTLINE.md) — every **agent** (named, with sub-agents), **tool**, **feature**, **folder**, and **task** in one index. Start here.
> 🧱 **Tech stack & decisions:** [`TECH-STACK.md`](TECH-STACK.md) — languages, AI SDK, Supabase/pgvector, voice/maps modules, env keys, install list, color theme, and which `.md` to give each Claude session.

---

## 1. The Official Challenge (what judges score)
Build an AI companion that **proactively** helps users *plan, prioritize, and complete* tasks before deadlines — **beyond passive reminders**, driving **meaningful action**. Judges weigh **Agentic Depth (20%)**: the AI must *reason and act*, not just chat.
**Rubric example features (all 12 — we cover every one, see §6):** task prioritization · AI scheduling · personalized recommendations · context-aware reminders · calendar integration · goal & habit tracking · voice · autonomous planning **& execution** · real-time issue tracking · impact dashboards · predictive insights · gamification.
> *Note: real-time issue tracking, impact dashboards & gamification-for-citizen-engagement originate from the **other** problem statement (Community Hero); for Avnik we interpret them personally — blocker tracking, your impact dashboard, gamified self-engagement. Covered regardless.*

## 2. Our Thesis (the soul)
> People don't procrastinate because they forget. They procrastinate because their **present self, future self, emotions, identity, and attention are in conflict.**

So Avnik is an **agent that negotiates between your rational goals and your emotional state** — reducing uncertainty, breaking overwhelm into steps, adapting when motivation changes, and making the next action feel achievable. (Grounded in Steel 2007/2018 Temporal Motivation Theory; Aristotle's *akrasia*; emotion-regulation research.)

---

## 3. The Personal Operating System — 5 Pillars

```
                        🧭 MANAGER (orchestrates the team)
   ┌───────────┬───────────┬────────────┬───────────┬───────────┐
   │ 🧠 MEMORY │🔍 REASONING│📓 REFLECTION│ ⚡ ACTION  │ 📈 GROWTH │
   └───────────┴───────────┴────────────┴───────────┴───────────┘
```
- **🧠 Memory** — remembers patterns, goals, and past behavior.
- **🔍 Reasoning** — understands *why* you're procrastinating.
- **📓 Reflection** — generates a daily philosophy/research journal.
- **⚡ Action** — creates, adjusts, and executes plans. *(← the agentic scoring sweet spot.)*
- **📈 Growth** — evolves your personal productivity model over time.

**Agent team:** 🧭 Manager · 🎯 Triage · 💬 Coach · 🧠 Profiler · 🌟 North Star · ⏱️ Focus · 🗂️ Memory.
**Stack:** Next.js 16 · **Gemini** (default) **+ Groq** switch · Tailwind · localStorage→Firestore · deploy on **Google Cloud**.

---

## 4. Vision Catalog — every feature, by pillar

### 🧠 Memory — *remembers patterns, goals & past behavior*
| Feature | What it does | Helps the user | Build |
|---|---|---|---|
| **Memory spine (RAG-lite)** | Stores profile, history, goals; retrieves relevant bits into every prompt | The AI never forgets who you are | ⭐ 🟡→🟢 |
| **Task DNA** | Logs each task's context (mood, time, focus, place, etc.) → finds patterns | *"You finish coding 43% faster after coffee, 9–11am"* | 🌌 🟡 |
| **Knowledge Vault** | Research / notes / PDFs → graph, mind-map, flashcards, quiz, revision | Knowledge stops disappearing | 🌌 🔴 |
| **Failure Library** | Stores failures w/ reason, emotion, lesson, prevention | *"You've repeated this mistake 5×"* — learns from losses | 🌌 🟡 |

### 🔍 Reasoning — *understands why you're stuck*
| Feature | What it does | Helps the user | Build |
|---|---|---|---|
| **Procrastination Profile (Psych Digital Twin)** | Living profile: fear of failure, perfectionism, distraction, burnout, low clarity/confidence, boredom | *"You avoid DSA because you don't know where to begin — let's do one easy problem for 5 min"* | ⭐ 🟢 |
| **Emotion-First Check-in** | Asks how you *feel* about a task, detects the blocker, matches the intervention | Treats procrastination as emotion, not laziness | ⭐ 🟢 |
| **Motivation Meter (TMT)** | Scores `(Expectancy×Value)/(Impulsiveness×Delay)`; says which lever to pull | Turns "I'm unmotivated" into a fixable diagnosis | ⭐ 🟢 |
| **Decision AI** | Ranks tasks by impact, deadline, difficulty, energy, long-term value, regret, opportunity cost | *"Do better decisions"* — the rubric, literally | 🌌 🟡 |
| **Anti-Perfection Mode** | Detects over-perfecting (*"rewritten this email 5×"*) and calls it | Stops the hidden second form of procrastination | 🌌 🟡 |
| **AI Debate (Socratic)** | Argues back like Socrates, keeps asking *why* until the real reason surfaces | Breaks through excuses to the truth | 🌌 🟡 |
| **AI Research Coach** | Explains *why this approach*, alternatives, papers, books, architecture | An educational mentor, not an answer vending machine | 🌌 🟡 |
| **Predictive Insights** *(rubric)* | Predicts miss-risk on a deadline, your best focus hours, likely blockers (from Task DNA + Motivation Meter) | *"You're likely to miss this — start now"* early warning | ⭐ 🟡 |

### 📓 Reflection — *daily philosophy / research journal*
| Feature | What it does | Helps the user | Build |
|---|---|---|---|
| **Philosophy Notebook / Daily Anchor** | One AI-written page/day matched to your state (Gita *Karma Yoga*, Stoics, Nietzsche, Frankl, Pascal) → 365 pages/yr = a personal philosophy book | Meaning + identity; *nobody is building this* | ⭐ 🟢 |
| **Why Journal** | Each delay logs a one-line *why* → weekly report: emotional trends, biggest fear/distraction, best hours | Feels like therapy; reveals the real pattern | ⭐ 🟢 |
| **Future Self Dialogue** | Talk to Present / Future (1yr) / Past self; Gemini voices all three | *"I succeeded because I started before feeling ready"* — collapses temporal discounting | ⭐ 🟢 |
| **Time Machine** | Simulates consequences of skipping: today → exam day → interview → outcome | Humans act on stories, not dates | 🌌 🟡 |
| **Life Thesis Generator** | Monthly "your philosophy" write-up from your data | Reads like a biography written by AI | 🌌 🟡 |

### ⚡ Action — *creates, adjusts & executes plans (agentic core)*
| Feature | What it does | Helps the user | Build |
|---|---|---|---|
| **Task Triage + AI Prioritization** | Add tasks (deadline/effort); AI orders them | Intelligent task prioritization (rubric) | ⭐ 🟢 |
| **Day Planner** | Schedules tasks into time blocks | AI scheduling assistance (rubric) | ⭐ 🟢 |
| **"What Now?"** | Context-aware single next action given time + mood | Removes decision paralysis | ⭐ 🟢 |
| **"Just Start It For Me" (execution agent)** | Does the first real step: drafts email, outlines essay, generates problem #1, splits project | Kills blank-page terror; autonomous **execution** | ⭐ 🟢 |
| **Proactive Nudge ("Avnik moves first")** | Watches deadlines + patterns, reaches out *before* you slip, right moment/tone | The agentic headline: initiative vs passive reminders | ⭐ 🟢 |
| **5-Minute Bargain (akrasia negotiator)** | Negotiates not nags: *"Just 5 min, then quit if you want"* | Lowers activation energy to start | ⭐ 🟢 |
| **Commitment Pact (Ulysses Contract)** | You precommit (*"done by 6pm"*); AI holds you, renegotiates scope when motivation drops, asks *"what prevented success?"* if missed | Precommitment device (Odysseus bound to the mast) beats willpower | ⭐ 🟡 |
| **Body-Double Focus Session** | Live "work with me" sprint; checks in, adapts mid-session | Proven ADHD body-doubling effect | 🌌 🟡 |
| **Pomodoro / Focus blocks** | Timed deep-work mini-mode | Structure for the actual doing | ⭐ 🟢 |
| **Real-time Blocker Tracker** *(rubric)* | Tracks live blockers per task ("stuck: don't know where to start") & missed commitments, surfaced as they happen | Nothing silently stalls; the AI sees you're stuck *now* | ⭐ 🟡 |

### 📈 Growth — *evolves your model over time*
| Feature | What it does | Helps the user | Build |
|---|---|---|---|
| **The Board Meeting (weekly multi-agent review)** | Agent team "meets" on screen: Triage/Profiler/North Star report, Manager plans next week | Strategic life review; **visibly showcases the multi-agent system** | ⭐ 🟢 |
| **North Star / Red Book** | Write your "gold goals"; every task ties back to meaning | Frankl/Nietzsche: a *why* makes the *how* bearable | ⭐ 🟢 |
| **Live Conversation Profile** | Bars (`Direct ████ 96%`) update as you chat | Visible proof it's learning you | ⭐ 🟢 |
| **Invisible Progress / Gamification** *(rubric)* | Skill tree, XP, consistency score, identity graph (not just streaks) | Makes invisible growth visible → fewer quits | ⭐(core)🌌(full) 🟡 |
| **Impact Dashboard** *(rubric)* | Home dashboard: tasks done, deadlines saved, focus time, momentum & motivation trends | Proof the app is working for them → "impact dashboard" | ⭐ 🟢 |
| **Habit streaks** | Track recurring habits | Goal & habit tracking (rubric) | ⭐ 🟡 |

---

## 5. Committed Hackathon Build — the Hero Set (checklist)

> 🔁 **RUBRIC GATE — applies to EVERY step:** a step is not "done" until we re-open §6 and tick which rubric items it just delivered. We never drift from the 12 official features.

### ☐ Step 1 — Foundation & first impression
- [ ] Strip boilerplate · Avnik theme (colors/fonts/logo)
- [ ] 5–6s **cinematic intro** (+ `public/intro.mp4` Veo slot)
- [ ] App **shell/layout** · `lib/ai.ts` **Gemini+Groq switch** · `.env`
- [ ] `/api/chat` route · basic chat · **Memory spine** seed (localStorage) · *→ app opens, you can talk*

### ☐ Step 2 — The Coach + Emotion engine *(Reasoning + Action)*
- [ ] **5 modes** (Focus/Coach/Friend/Socratic/Vent) · adaptive length · next-smallest-action
- [ ] **Emotion-First Check-in** · [ ] **5-Minute Bargain** · [ ] polished chat · *→ a coach that changes how it talks*

### ☐ Step 3 — Action: tasks, prioritization & motivation *(rubric core)*
- [ ] Task model · **AI prioritization** · **day planner** · **"What Now?"**
- [ ] **"Just Start It For Me"** · [ ] **Motivation Meter** · [ ] **Future Self Dialogue**
- [ ] **Real-time Blocker Tracker** · [ ] **Predictive Insights** (miss-risk early warning) · *→ dump tasks, AI plans + starts your rescue*

### ☐ Step 4 — Identity: onboarding, North Star & "learns you"
- [ ] **MBTI/behavior onboarding** → **Procrastination Profile**
- [ ] **Red Book** (North Star goals) · [ ] **Live Profile bars** · [ ] **Philosophy Notebook / Daily Anchor** · *→ personalized; visibly learns you*

### ☐ Step 5 — Memory, reflection, growth & ship
- [ ] **RAG-lite memory** wired into all agents · [ ] **Why Journal** · [ ] **Proactive Nudge**
- [ ] **The Board Meeting** · [ ] **Pomodoro** · [ ] **Manager** orchestration · [ ] habit streaks
- [ ] **Impact Dashboard** · [ ] **Gamification** (XP/streaks/consistency) · [ ] deepen **Predictive Insights**
- [ ] **Deploy to Google Cloud** · [ ] GitHub repo · [ ] Google Doc · *→ live link*

> 🌌 **Roadmap (pitch + build-if-ahead):** Task DNA · Knowledge Vault · Failure Library · Decision AI · Anti-Perfection · AI Debate · Research Coach · Time Machine · Life Thesis · Body-Double · Invisible Progress (full) · Commitment Pact (stakes) · Voice · Calendar sync. *Each is ~a prompt + a screen on top of the Memory spine.*

---

## 6. Rubric Coverage Matrix (checked at EVERY step — the gate)
*Tick a box only when that rubric item is actually working in the app.*

| # | Official rubric feature | Avnik feature(s) | Pillar | Step | Status | Done |
|---|---|---|---|---|---|---|
| 1 | Intelligent task prioritization | Triage + AI Prioritization | Action | 3 | ⭐🟢 | [ ] |
| 2 | AI-powered scheduling assistance | Day Planner | Action | 3 | ⭐🟢 | [ ] |
| 3 | Personalized productivity recommendations | Coach modes · Profiler · Daily Anchor | Reasoning/Reflection | 2,4 | ⭐🟢 | [ ] |
| 4 | Context-aware reminders | "What Now?" · Proactive Nudge · Emotion Check-in | Action | 3,5 | ⭐🟢 | [ ] |
| 5 | Calendar integration | Google Calendar sync | Action | stretch | 🌌🔴 | [ ] |
| 6 | Goal and habit tracking | Red Book / North Star · habit streaks | Growth | 4,5 | ⭐🟢 | [ ] |
| 7 | Voice-enabled assistance | Voice (reuse Appily) | — | stretch | 🌌🟡 | [ ] |
| 8 | Autonomous task planning **& execution** | "Just Start It For Me" · autonomous plan · Manager | Action | 3,5 | ⭐🟢 | [ ] |
| 9 | Real-time issue tracking | Real-time Blocker Tracker | Action | 3,5 | ⭐🟡 | [ ] |
| 10 | Impact dashboards | Impact Dashboard | Growth | 5 | ⭐🟢 | [ ] |
| 11 | Predictive insights | Predictive Insights · Motivation Meter | Reasoning | 3,5 | ⭐🟡 | [ ] |
| 12 | Gamification (engagement) | Invisible Progress / Gamification | Growth | 5 | ⭐🟡 | [ ] |

**Coverage:** 10/12 in the hero build · 2 (calendar, voice) as stretch. *No rubric item is unaccounted for.*

## 7. Submission Checklist (mandatory)
- [ ] Deployed link on **Google Cloud** · [ ] **GitHub** repo (public) · [ ] **Google Doc** · [ ] submitted on **BlockseBlock** before 30 June 11:59 PM

**You, in parallel:** Google Cloud account (billing on) · Gemini key ([aistudio.google.com](https://aistudio.google.com)) · Groq key (from Appily) · GitHub account.

---
*Living source of truth — names & scope can change. Say **"Step 1"** to start building.*
