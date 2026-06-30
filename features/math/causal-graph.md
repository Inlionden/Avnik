# 🕸️ Causal Graph — how factors influence each other ⭐⭐⭐

> Part of the [Math Fork](README.md). Beyond independent probabilities: model **causation** between factors, so Avnik can find the *real* root — often not procrastination itself.

## The model
A **directed weighted graph**: nodes = factors, edges = "X causally raises Y" (with a strength weight). Example chain Avnik can trace:
```
Poor Sleep → Low Energy → Burnout → Procrastination → Missed Deadline → Guilt → Fear of Failure → (back to) More Procrastination
```

## Why it's powerful
Independent probabilities say *"you have burnout 40%."* The causal graph says:
> "The root problem may not be procrastination itself. Your recent **sleep pattern** appears to reduce energy, which contributes to burnout and then delays."

That's an upstream, actionable insight — far better than "work harder."

## Cycle detection (the key trick)
The chain above contains a **vicious cycle**: Procrastination → Missed Deadline → Guilt → Fear → Procrastination. Detecting the cycle lets Avnik intervene at the **weakest upstream link** (e.g. fix sleep) instead of nagging about the task.

## Hardcoded seed graph (for the demo)
```ts
edges = [
  ['sleep','energy', -0.7],      // poor sleep lowers energy
  ['energy','burnout', -0.6],    // low energy → burnout
  ['burnout','procrastination', 0.7],
  ['procrastination','missedDeadline', 0.8],
  ['missedDeadline','guilt', 0.6],
  ['guilt','fearOfFailure', 0.5],
  ['fearOfFailure','procrastination', 0.6], // closes the loop
]
```

## Insight generation
- [ ] Trace paths from observed symptoms (missed deadline) back to upstream causes (sleep).
- [ ] Detect cycles (DFS) → flag self-reinforcing loops.
- [ ] LLM narrates the path/cycle into a sentence + suggests the upstream intervention.

## Build phasing
- 🟡 **Light/seeded now:** ship the hardcoded graph + cycle detection + one narrated insight (the sleep→burnout story) — enough to demo the idea.
- 🌌 **Roadmap:** learn edge weights from the user's own data over time (see [`cognitive-graph.md`](cognitive-graph.md)).
