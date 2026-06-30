# 🎲 Bayesian Belief Model — "why is the user procrastinating?"

> Part of the [Math Fork](README.md). The core engine. Keeps a probability distribution over root causes and updates it with **Bayes' theorem** on every piece of evidence. **Never a diagnosis — a working hypothesis that changes as evidence arrives.**

## Priors (initial beliefs, sum = 100%)
| Root cause | Prior |
|---|---|
| Fear of failure | 15% |
| Perfectionism | 15% |
| Burnout | 15% |
| Lack of clarity | 15% |
| ADHD / distraction | 15% |
| Low confidence | 10% |
| Overplanning | 10% |
| Boredom | 5% |

## Bayes' theorem
```
              P(B | A) · P(A)
P(A | B) = ─────────────────────        with   P(B) = P(B|A)·P(A) + P(B|¬A)·P(¬A)
                  P(B)
```
**Worked single update:** prior `P(A)=0.20`, likelihood `P(B|A)=0.85`, evidence `P(B)=0.25`:
```
P(A|B) = (0.85 × 0.20) / 0.25 = 0.17 / 0.25 = 0.68
```

## Sequential / naive-Bayes update (what the code does)
For new evidence `B`, multiply each cause's current belief by that cause's **likelihood** of producing `B`, then **normalize**:
```
posterior(causeᵢ) ∝ likelihood(B | causeᵢ) × prior(causeᵢ)
normalize so Σ posterior = 1
```

## Hardcoded likelihood table `P(evidence | cause)` (seed values, tune later)
| Evidence signal | Fear | Perfectionism | Burnout | Clarity | Distraction |
|---|---|---|---|---|---|
| Delays only high-impact tasks | 0.85 | 0.40 | 0.20 | 0.30 | 0.15 |
| Asks "what if it's not good enough?" | 0.80 | 0.70 | 0.10 | 0.20 | 0.10 |
| Rewrites same work 5× | 0.30 | 0.90 | 0.10 | 0.15 | 0.10 |
| Finishes small tasks immediately | 0.20 | 0.55 | 0.10 | 0.20 | 0.30 |
| Energy drops across ALL tasks | 0.15 | 0.10 | 0.90 | 0.15 | 0.20 |
| Rapid app/task switching | 0.10 | 0.10 | 0.25 | 0.20 | 0.90 |
| "I don't know where to start" | 0.25 | 0.20 | 0.15 | 0.90 | 0.15 |
*(extend columns for low confidence / overplanning / boredom.)*

## Worked example (the user's scenario)
**Start:** Fear 15 · Perfectionism 15 · others as priors.
**Evidence 1** — delays only high-impact tasks + asks "what if not good enough?" →
→ **Fear of failure 45% · Perfectionism 30%** (both rise; fear leads).
**Evidence 2** — rewrites the same report 5× →
→ **Perfectionism 60%** (perfectionism's high likelihood dominates).
**Evidence 3** — finishes small tasks immediately →
→ Confirms it's not laziness. **Working hypothesis: Perfectionism is the dominant cause.**

## Confidence Score (what the user sees)
Never *"You have perfectionism."* Instead:
```
Current understanding
  Perfectionism   ████████░ 68% confidence
  Fear of failure ██░       19%
  Burnout         █          8%
  Lack of clarity ▌          5%
```
Overall **confidence** = how peaked the distribution is (e.g. 1 − normalized entropy). Low confidence → the Coach asks more (Socratic, [`../agentic.md` L3](../agentic.md)) instead of prescribing.

## Belief Timeline (long-term learning)
Snapshot beliefs on each weekly rollup:
```
Week 1  Fear of failure 55%
Week 4  Fear 35% · Burnout 40%
Week 8  Lack of clarity 50%
```
→ Lets the AI say: *"Two months ago, fear of failure was your biggest obstacle. Recently the evidence suggests unclear project requirements have become the main reason you delay."*

## Implementation points
- [ ] `lib/math/bayes.ts` — `update(beliefs, evidence) → beliefs` (pure, normalized).
- [ ] `LIKELIHOODS` table in code (the matrix above), tunable.
- [ ] `confidence(beliefs)` via entropy.
- [ ] Snapshot to `timeline[]` on each rollup.
- [ ] Expose top cause + confidence to the Coach for narration (never assert as fact).
