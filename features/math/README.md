# 🧮 The Math Fork — Avnik's Probabilistic Reasoning Engine

> Part of **Avnik**. Master → [`../../FEATURES.md`](../../FEATURES.md). This is a **separate subsystem** ("fork") that runs **deterministic math in code** — separate from the LLM. **Math computes the beliefs; the LLM only narrates them.** That makes Avnik's reasoning reproducible, explainable, and research-grade — a strong Agentic-Depth story.

## Why a separate fork
Most productivity apps use **fixed if-then rules**. Avnik instead keeps a **live probabilistic belief state** about *why* the user procrastinates, updates it with **Bayes' theorem** on every piece of evidence, models **how factors cause each other** (causal graph), and learns a **personal cognitive graph** over time. The agent isn't reacting to tasks — it's **continuously refining its understanding of the user** and selecting interventions on accumulated evidence.

## Architecture — where the math sits
```
👁️ SENSES (../sensing.md)        ← evidence: active check-ins + passive behavior
        ↓
🧮 TRACKING AGENT (tracking-agent.md)  ← collects evidence, runs the updates on a schedule
        ↓
   ┌───────────────── MATH ENGINE (deterministic, in code) ─────────────────┐
   │ bayesian-belief.md  → P(root cause | evidence), confidence scores        │
   │ causal-graph.md     → factor→factor influence, cycle detection           │
   │ cognitive-graph.md  → personal weighted graph of all habit factors       │
   └──────────────────────────────────────────────────────────────────────────┘
        ↓ beliefs (numbers)
🧠 BRAIN (../agentic.md)  ← LLM narrates numbers + picks intervention (L4/L8)
        ↓
📊 DASHBOARD (dashboard.md)  ← user sees the stats as % (daily/weekly/monthly)
```

## Index of this fork
| File | Contains |
|---|---|
| [`tracking-agent.md`](tracking-agent.md) | 🧮 The Statistician/Tracker agent — collects signals, runs the math, stores belief snapshots |
| [`bayesian-belief.md`](bayesian-belief.md) | Priors, Bayes' theorem, likelihood table, update algorithm, worked examples, confidence scores, belief timeline |
| [`causal-graph.md`](causal-graph.md) | Sleep→energy→burnout→procrastination cycles, cycle detection, insight generation |
| [`cognitive-graph.md`](cognitive-graph.md) | Personal Cognitive Graph — nodes (Big Five, energy, stress…) + weighted edges updated over time |
| [`dashboard.md`](dashboard.md) | Stats dashboard — % confidence, trends, time-budget tracking; daily/weekly/monthly/custom |

## The hybrid principle (math + LLM)
- **Math (deterministic, code):** belief percentages, confidence, graph weights, trends. Always the same given the same evidence.
- **LLM (Gemini/Groq):** turns *"Perfectionism 68%, Fear 19%"* into the human sentence and chooses the matched intervention via [`agentic.md` L4/L8](../agentic.md).
- **Never a diagnosis** — always the AI's *current working hypothesis*, shown with confidence.

## New agent
🧮 **Statistician / Tracker** — a background agent (8th on the roster in [`../orchestration.md`](../orchestration.md)) that owns this fork.

## Build phasing (honest, 36 hrs)
- **⭐ HERO (genuinely buildable — it's simple arithmetic):** Bayesian belief updater over the root causes + **confidence scores** + **belief timeline** + the **stats dashboard**. This is the killer differentiator and is cheap.
- **🟡 Light / seeded:** causal graph with a few hardcoded cycles (demo the sleep→burnout insight).
- **🌌 Roadmap:** full Personal Cognitive Graph with learned edge weights (show a seeded version for the pitch).
