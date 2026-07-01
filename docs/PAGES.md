# 🗺️ Avnik — Page Map & Navigation (high-level, no visual detail yet)

> What screens exist, what's on each, and **what every button leads to.** Maps each page to a [parallel build stream](BUILD-PARALLEL.md). Visual/interaction detail comes later.

## Navigation (sitemap)
```
[Intro splash 5–6s]
      │ first time → Onboarding → Home   |   returning → Home
      ▼
┌──────────────────────── App shell ────────────────────────┐
│  Primary nav (sidebar desktop / bottom tabs mobile):       │
│   🏠 Home   💬 Coach   ✅ Tasks   📓 Journal   📊 Insights   🌟 Profile │
│  Corner: ⚙️ Settings        •  Floating button: ⚡ "What Now?" (everywhere) │
└────────────────────────────────────────────────────────────┘
```

## Pages & buttons

### 0. Intro / Splash · *(Foundation)*
- 5–6s cinematic intro (or `intro.mp4`). Auto-advances.
- **[Skip]** → Home/Onboarding.

### 1. Onboarding (first run only) · *(Stream D)*
- Stepper: Welcome → Big Five quiz → North Star (Red Book) → done.
- **[Get started]** → quiz · **[Next]** → next question · **[Save goal]** → stores North Star · **[Finish]** → Home (shows first personalized insight) · **[Skip]** → Home.

### 2. 🏠 Home / Dashboard (the hub) · *(Stream E)*
- Greeting · energy bars (Mental/Physical/Stress) · today's top task · current top belief % · streak/XP · quick mood chips.
- **[⚡ What Now?]** → one next action card · **[Start focus]** → Pomodoro · **mood chips** → log mood · **[Talk to coach]** → Coach · **[Open tasks]** → Tasks · **cards** → their page.

### 3. 💬 Coach / Chat · *(Stream A)*
- Message thread · mode chips (⚡Focus 💬Coach 📚Research 🤝Friend 🧠Socratic) · agent tag · input · mic (stretch).
- **send** → AI reply · **mode chips** → switch length/style · **[🤫 Vent]** → no-advice mode · **"Why?"** → deeper explanation · from a reply: **[Start 5 min]** → Pomodoro · **[Add as task]** → Tasks · **[Just start it for me]** → generates first step.

### 4. ✅ Tasks (action center) · *(Stream C)*
- AI-sorted task list · add-task bar · day-planner timeline · each task shows deadline/effort/blocker.
- **[+ Add]** → new task · **[Prioritize]** → AI reorders · **[Plan my day]** → timeline · per task: **[Start]** → Pomodoro · **[Just start it for me]** → first step/subtasks · **[I'm stuck]** → blocker + Emotion check-in · **[Done]** → complete (XP + event).

### 5. 📓 Journal / Reflection · *(Stream D)*
- Today's entry at 3 effort levels · philosophy page of the day · past entries.
- **[Write]** → full journal · **mood chips** → 10-sec check-in · **[Skip]** → logged signal ("Silence Speaks") · **[Today's reflection]** → philosophy page · **entry** → view.

### 6. 📊 Insights / Stats · *(Stream E + Stream B data)*
- "Current understanding" belief % bars · trait trends · belief timeline · causal insight card · productivity map · time-budget pace · period tabs (Daily/Weekly/Monthly).
- **period tabs** → switch range · **[Board Meeting]** → weekly multi-agent review · **graph** → detail (roadmap).

### 7. 🌟 Profile / Red Book · *(Stream D)*
- Psychological profile (OCEAN + root-cause snapshot) · communication-profile bars · North Star goals · LifeOS signal toggles · places.
- **[Edit goals]** → Red Book · **[Define places]** → LifeOS places · **signal toggles** → opt-in/out · **[Retake assessment]** → quiz.

### 8. ⚙️ Settings · *(Foundation)*
- **AI provider switch (Gemini ⇄ Groq)** · default mode/persona · notifications · privacy · export/delete data.

### 9. 🏛️ Board Meeting (weekly, modal/section) · *(Stream E)*
- Multi-agent transcript. **[Generate review]** → runs the team · **[Accept plan]** → creates next-week tasks.

## Core flows
- **First-time:** Intro → Onboarding → Home.
- **Daily:** Intro → Home → mood chip → **What Now?** → Coach/Task → Pomodoro → Done → (evening) Journal.
- **"I'm stuck":** anywhere → Vent/I'm stuck → Emotion check-in → root cause → matched intervention (5-min bargain / Just-start-it / breathing).

## UI library mapping
- **Base = shadcn/ui** (functional): Button, Card, Tabs, Dialog/Sheet, Input, Textarea, Progress (bars), Slider (quiz), Badge, ScrollArea.
- **Flourish = Vengeance UI** (wow): the **intro/hero animation**, **glow/animated CTAs** (What Now?, Just start it), **bento layout** for the dashboard, animated tooltips. Installs via the same shadcn CLI (`npx shadcn@latest add @vengeanceui/[component]`).
- Rule: shadcn for forms/lists/chat; Vengeance for landing/intro + key CTAs + dashboard bento.
