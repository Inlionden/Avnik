# 🧠🕸️ Personal Cognitive Graph (advanced) ⭐⭐⭐

> Part of the [Math Fork](README.md). The most advanced layer: a **personalized behavioral model** where every aspect of how the user works is a node, and the **edge weights are learned and updated over time**. Turns Avnik from a rule-based app into an **adaptive reasoning system**.

## Nodes (aspects of the user's work habits)
- Personality traits (**Big Five** — OCEAN)
- Motivation · Energy · Stress · Confidence · Sleep
- Task difficulty · Focus · Environment
- Root causes · Interventions

## Edges
Directed, **weighted** connections updated over time — e.g. `sleep —(0.7)→ energy`, `energy —(0.6)→ focus`, `intervention:5-min-bargain —(0.4)→ confidence`. Weights strengthen when correlations recur (Hebbian-style: "what fires together, wires together").

## What it enables
- "For **you specifically**, low sleep predicts low focus more than it predicts stress."
- "The intervention that most raises **your** confidence is *shipping v1 early*, not motivational quotes."
- A living, per-user theory of cause→effect that improves with every interaction.

## Update rule (concept)
```
on rollup:
  for each co-occurring (X, Y): edge[X→Y].weight += learningRate × correlation(X, Y)
  decay unused edges slowly
```

## Relationship to the rest of the fork
- The **Bayesian model** ([`bayesian-belief.md`](bayesian-belief.md)) = beliefs about *current* root cause.
- The **causal graph** ([`causal-graph.md`](causal-graph.md)) = a *seeded, general* cause→effect map.
- The **cognitive graph** = the *personalized, learned* version of that map, unique to the user.

## Build phasing
- 🌌 **Roadmap** — full learned graph needs weeks of data. For the hackathon: **seed it** with the causal-graph edges + show a static visualization on the dashboard so judges see the vision; label dynamic learning as the roadmap.

## Implementation points
- [ ] `Graph = { nodes[], edges: {from, to, weight}[] }` in Memory.
- [ ] Seed from `causal-graph.md`; render with a simple graph viz on the dashboard.
- [ ] (Roadmap) `learn(rollup)` updates weights from co-occurrence.
