# 🎬 Avnik — A User Story (mock journey, 2 days)

> A narrative walkthrough to see the whole system *work*: onboarding, voice, places, agent collaboration, memory store/retrieve, Bayesian belief updates, dashboards, journaling, the Red Book, and a last-minute save. Mock data only — to validate the design before building.

**Legend:** 🎬 what the user sees · 🧠 behind the scenes (agents) · 💾 memory write/read · 📊 mock dashboard

---

## Meet the user
**Arjun Mehta**, 20, 2nd-year CSE student. **Deadlines:** DSA assignment due *tomorrow 11:59 PM*, DBMS mini-project in 3 days, placement prep ongoing. **Pattern:** avoids hard tasks, perfectionist on small ones, scrolls late at night. He doesn't know *why* he keeps stalling. That's what Avnik is for.

---

## Day 0 — Onboarding (≈5 minutes)

🎬 Arjun opens Avnik → 5-second cinematic intro → a warm welcome: *"Before tasks, let's understand you."*

🎬 **Big Five quiz** — 11 quick slider/chip questions. He answers honestly (skips 2).

🧠 **Profiler agent** infers from his answers → 🧠 **Manager** stores it. 💾 *write `profile`:*
```
OCEAN  Openness 78 · Conscientiousness 52 · Extraversion 40 · Agreeableness 65 · Neuroticism 70
Work   night-owl · deep-focus · spontaneous · solo · deadline-driven
Drive  achievement 80 · purpose 70 · recognition 55
```
🧠 **Tracker (Statistician)** seeds Bayesian **priors** (high Neuroticism nudges fear/perfectionism up a touch):
```
Fear 18% · Perfectionism 17% · Burnout 13% · Clarity 15% · Distraction 15% · LowConf 10% · Overplan 7% · Boredom 5%
```

🎬 **Red Book** — *"What's your North Star?"* Arjun writes: *"Become a confident engineer and get placed at a good company."* 💾 *write `goals[0]`.*

🎬 *"Want to tell me where you usually work?"* He taps the mic 🎙️ and **says by voice**: *"This is my study desk at home — it's where I focus."* 🧠 **Context tool** `definePlace("Study Desk", zone=study)`. 💾 *write `places[0]`.* (Optional — he could've skipped.)

📊 **Onboarding complete dashboard:**
```
👋 Welcome, Arjun.   North Star: "Confident engineer, get placed"
First insight:  "You're driven but anxious — we'll start tiny and build proof. No overwhelm."
```
🧠 *No tasks yet — Avnik deliberately understood him first.*

---

## Day 1 — "I don't even want to start"

### Morning · 9:10 AM
🎬 Home screen greets him. 📊 **Home dashboard:**
```
Energy   Mental ██████░░ 61% · Physical █████░░ 55% · Stress ████░░ 44%
Mood?    😀 🙂 😐 [😔] 😫     ← he taps 😔 Stressed   +  "Overwhelmed"
Today    (empty)            ⚡ What Now?
```
💾 *write mood event (active signal).* 🧠 **Mood agent** flags low-positive + high-stress.

🎬 Arjun adds tasks **by voice**: *"DSA assignment due tomorrow, DBMS project, and gym."*
🧠 **Triage agent** parses → prioritizes by deadline×importance×effort:
```
1. DSA assignment   ⏰ tomorrow 11:59 PM   ~3h   ← do first
2. DBMS project     ⏰ +3 days            ~5h
3. Gym              flexible
```

### 9:25 AM · the stall
🎬 He stares at "DSA assignment," opens Coach, types: *"I don't feel like doing DSA."*

🧠 **Manager** routes → **Coach** detects avoidance → hands to **Root-Cause** + **Socratic**:
> Coach: "What's the hardest part of starting?"
> Arjun: "I'm scared I'll get it wrong."
> Coach: "And if it isn't perfect on the first try?"
> Arjun: "People will think I'm not good enough."

🧠 **Tracker** runs a **Bayesian update** on this evidence (delays high-impact + "what if not good enough"):
```
Fear of failure  18% → 47%
Perfectionism    17% → 24%
(others normalize down)        confidence: moderate
```
💾 *append to `rootCauseHistory`.* 🧠 **Coach** (persona auto-picked: *Friendly Mentor*, because high Neuroticism) + **Style/Fit agents** keep it short & warm:

🎬 Coach: *"This is fear, not laziness — totally normal. Forget the whole assignment. **Just 5 minutes** on one easy sub-problem. Quit after if you want."* → **[Start 5 min]**

🎬 He taps it → **Pomodoro** starts. 🧠 **Interruptibility agent** silences all nudges for the block.

### 10:55 AM
🧠 **Sitting-timer tool** notices 90 min seated → after the block: *"Nice — 2 problems done. Stand up, 5-min walk before the next?"* 🎬 He does.
💾 *write: task progress, focus session, confidence ↑.* 🎬 A tiny **+15 XP** and a streak spark.

### Evening · 9:40 PM · Journal
🎬 Journal screen. He chooses **Level 1 (write):**
> *"Actually finished 4 DSA problems. I was terrified auth—I mean the recursion part—would take hours but it was fine once I started."*

🧠 **Sensing → extraction:**
```
Emotion: Relief · Root cause confirmed: Fear of failure · Confidence: +  · Lesson: "tasks feel harder before starting"
```
💾 *write journal page + nudge traits (confidence ↑, stress ↓).*

🎬 **Daily Anchor** (matched to *fear*): a Bhagavad Gita line —
> *"You have a right to your actions, never to the fruits."* — *act, don't fixate on the outcome.*

📊 **End of Day 1:**
```
Current understanding   Fear ███████░ 44% · Perfectionism ███ 22% · Burnout ██ 12%
Energy  Mental 58% · Stress 39% (↓)     Done today: 4/5 planned     🔥 Streak 1 · XP 60
"You started before feeling ready today. That's the whole game."
```

---

## Day 2 — perfectionism, fatigue, and the save

### 8:50 AM · at the desk
🧠 **Context tool** sees he's at *Study Desk* (he opened the app there / confirmed). **Productivity Map** has one data point already:
🎬 Home: *"You're at your focus desk and it's your sharp morning window — want to start the DBMS project's hardest part now?"*

### 11:00 AM · the rewrite loop
🎬 He's rewritten the project README **4 times**. 🧠 **Anti-Perfection** (edit-count tool) trips:
🎬 Coach (*Strict Coach* persona now — he's high-conscientiousness on this task): *"This stopped being improvement two edits ago. Ship v1. You can polish after submission."*
🧠 **Tracker** update: Perfectionism 22% → **38%** (now co-leading with fear). 💾 *write.*

### Memory retrieval in action · 3:30 PM
🎬 Arjun: *"What should I do right now?"* (taps ⚡ **What Now?**)
🧠 **Manager → Memory agent** `retrieve()` pulls the *relevant* slices (not everything):
```
retrieved → North Star (placement) · top belief (perfectionism/fear) · pattern: "starts DSA faster after a 5-min bargain" · energy now (mental 49%)
```
🧠 **Triage** + **Motivation Meter** combine it → 🎬 *"Energy's dipping and the DBMS deadline is close. One 25-min block on the schema diagram — I'll open a blank one for you."* → **[Just start it for me]** generates the first table. 💾 *write subtasks.*

### 7:20 PM · decision fatigue
🧠 **Tracker** notes choices avoided late in the day → flags *decision fatigue*. 🎬 Coach: *"It's late and you're deciding too much. **I'll choose for you:** revise 5 DSA problems, then stop."*

### A causal insight
🧠 **Causal graph** connects the dots: he slept at 2 AM (he'd told it once) → low energy → afternoon dip.
🎬 *"Heads up: your afternoon slumps trace back to late sleep, not lack of motivation. Earlier night → sharper tomorrow."*

### 11:30 PM · the last-minute save 🏁
🎬 With the deadline near, **What Now?** keeps him on the single next action. He submits the **DSA assignment at 11:46 PM** — on time.
📊 **Moment:**
```
✅ DSA assignment submitted (11:46 PM)   — 13 min to spare
"Two days ago you couldn't start this. Today you finished it scared. That's growth, logged."
```

---

## What Avnik learned (belief timeline)
```
Day 0  Fear 18% (prior)
Day 1  Fear 44%  ← dominant
Day 2  Fear 33% · Perfectionism 38%  ← shifting as evidence arrives
```
🧠 So tomorrow it leads with **perfectionism** interventions ("ship v1"), not fear ones. The model is never a diagnosis — just its current best guess.

## How the agents collaborated (one moment, expanded)
```
"I don't feel like doing DSA"
   → 🧭 Manager (route)
   → 💬 Coach (detect avoidance) → 🔍 Root-Cause + Socratic (find: fear)
   → 🧮 Tracker (Bayesian update) → 🗂️ Memory (write)
   → 🎚️ Style/📏 Fit (shape: short, warm) → ⚡ Action (offer 5-min bargain → Pomodoro)
   → 🤫 Interruptibility (silence during focus)
```

---

## Design answers (your questions, decided)
- **Is place-mapping required?** **No.** Fully optional & user-initiated (he *chose* to say it by voice). Avnik never auto-maps location without explicit opt-in. If he shares it, the Context Engine uses it; if not, everything else still works.
- **Is it the agent's job to map everything?** No — the agent collects only **(a)** what the user actively shares + **(b)** in-app behavior it can see. Bounded by privacy/opt-in, per signal.
- **Who plans — user or agent?** **Both, by design.** It's *his* tool: he adds tasks, sets the North Star, makes commitments. The agents **help him use it well** — especially at the commit moment (the **Ulysses Contract**: "you said done by 6 — want me to hold you to 30 focused minutes instead of 3 vague hours?").
- **Constraints (honesty for the build):** on a web demo, **voice** = Web Speech API, **location/steps/sleep/sensors** are **manual or simulated** behind the [tool layer](features/tools.md) (swap to real on mobile later). **Single local user**, memory in localStorage. Nothing here claims hardware it doesn't have.

> The throughline: Avnik didn't nag Arjun to "do the task." It figured out **why** he wasn't, met his emotion, shrank the first step, and stayed quiet while he worked. A tool he drives — with a coach that knows when to push and when to wait.
