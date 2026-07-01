# Avnik — your last-minute life saver

> An AI productivity companion that helps you actually *finish*. Not another to-do list —
> a network of **30 specialized agents** that plan your day, coach your mood, start your work
> for you, and learn why you get stuck.

Built as a **Next.js PWA** (installable web app). Everything runs locally in your browser —
no sign-up, private by default, works offline.

---

## ✨ What makes it different

Most productivity apps give you an empty box and blame you when it stays empty. Avnik
figures out **why** you're stuck and does something about it:

- **Talk to it** — "I'm avoiding my thesis." It diagnoses the root cause (fear? perfectionism? no clear next step?) with a Bayesian belief engine and responds in the tone you need.
- **Plan your day** — "Plan my day: study ch4, reply to emails, gym." It extracts tasks and drops them onto your timeline automatically. No typing them one by one.
- **Just start it** — Can't begin? An agent writes your opening sentences / function stub / email draft so you're already 10% done.
- **Focus for real** — Recommends a technique (Pomodoro, 52/17, Ultradian…) and launches a real countdown timer right in the chat.
- **Learn you** — Over time it builds a model of your patterns, moods, and what actually helps.

---

## 🧭 The 30-agent architecture

Every message is routed by the **Helmsman** (a ReAct orchestrator: Reason → Act → Observe)
to the right expert, then post-processed by a **Mentor** layer for tone and length.

```
You → Helmsman (routes) → Lead agent → Sub-agent → Mentor (fit/tone) → Reply + side-effects
```

| Lead agent | Role | Sub-agents |
|---|---|---|
| 🎭 **Tone** (MoE) | Emotional coaching | Sage · Spark · Sensei |
| ⭐ **North Star** | Planning via Temporal Motivation Theory | Day-Planner · Goal-Keeper · Meaning-Weaver |
| ⚔️ **Quartermaster** | Getting-started tactics | Pacer (Technique Factory) · Contractor (Ulysses Contract) · Triage (Eisenhower) · Starter |
| 🔮 **Oracle** | Why you're stuck | Root-Cause (Bayesian) · Socratic |
| 🪞 **Auditor** | Honest self-evaluation | Self-Critic · Question-Designer |
| 📜 **Chronicler** | Memory & reflection | Daily Anchor · Future-Self · Board Meeting |
| 👁️ **Sentinel** | Passive signals | Sleep-Estimator · Context-Reader · Silence-Watcher |
| 🗄️ **Archivist** · 📦 **Courier** · ✍️ **Promptsmith** · 🎙️ **Mentor** · 🚦 **Regulator** | Infrastructure | — |

See [AGENTS.md](AGENTS.md) for the full catalog and [FEATURES.md](FEATURES.md) for every feature.

---

## 🧠 The interesting bits

- **Bayesian belief engine** — 8 root causes (fear, perfectionism, burnout, clarity, distraction, confidence, over-planning, boredom), sequential naive-Bayes updates from what you say and do.
- **Temporal Motivation Theory** — tasks scored by `M = (Expectancy × Value) / (Impulsiveness × Delay)`; impulsiveness derived from your Big Five conscientiousness.
- **Technique Factory** — agents build new tools at runtime. Ask for "a custom 45/12 technique" and it registers a working timer tool on the fly (MCP-style).
- **Server-safe agents** — agents run in API routes; the client passes state in and applies returned `side-effects` to `localStorage`. No server database required for v1.

---

## 🚀 Run it

```bash
npm install
npm run dev
# open http://localhost:3000
```

Add at least one AI key to `.env.local` (Groq is the default and free-tier friendly):

```bash
GROQ_API_KEY=gsk_...                    # primary
GROQ_API_KEY_2=gsk_...                  # optional auto-failover
NVIDIA_API_KEY=nvapi-...                # optional
GOOGLE_GENERATIVE_AI_API_KEY=AIza...    # optional (Gemini)
```

Build for production:

```bash
npm run build && npm start
```

---

## 🛠️ Tech stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript**
- **Vercel AI SDK** with Groq / Nvidia NIM / Gemini providers
- **Tailwind CSS v4** — monochrome + amber design system
- **localStorage** memory (Supabase-ready) · **PWA** (installable, offline)

---

## 📂 Structure

```
app/            Next.js routes (home, coach, tasks, journal, insights, profile, settings)
  api/          chat + agent endpoints
components/     UI (nav, FocusTimer, AgentFlow, tasks/…)
lib/
  agents/       the 30-agent network (helmsman, tone/, north-star/, quartermaster/, …)
  tools/        sensing / analytics / actions tool modules
  ai.ts         provider switch (Groq → Groq2 → Nvidia → Gemini)
  memory.ts     localStorage store
docs/           design notes, build logs, page specs
```

---

*Built for the Vibe2Ship hackathon (Coding Ninjas × Google for Developers). v1.*
