# 🪞 Self-Evaluation — "The Auditor" (`self-eval.md`)

> Part of **Avnik**. Master → [`../FEATURES.md`](../FEATURES.md). The meta-agent: **Avnik evaluates itself.** It knows *when* to evaluate, *what* to feed in, *what* to ask, and *which tools* to use — then corrects its own model. This self-grading loop is a top Agentic-Depth signal.

## Why
A belief like "Perfectionism 68%" is only useful if Avnik checks whether acting on it actually helped. The Auditor closes the loop: **predict → intervene → observe outcome → grade itself → adjust.**

## When to evaluate (triggers)
- **After every intervention** — did the user act within N minutes? complete? abandon?
- **On each rollup** (daily/weekly) — were the week's beliefs/predictions accurate?
- **On a prediction miss** — predicted a deadline save, user missed → learn.
- **On low confidence** — distribution too flat → ask, don't prescribe.
- **On user correction** — he edits his profile/belief → strong signal.

## What to feed it
- The intervention given · the matched root-cause + persona · belief **before vs after** · the **outcome** (acted / completed / abandoned / ignored) · any explicit user feedback.

## What to ask (and how)
- Mostly **infer from behavior** (acting = it worked). Occasionally **one** explicit, well-timed question — the **Question-Designer** picks the *right* one:
  - after a win: *"Did the 5-minute start help, or was it something else?"*
  - after a miss: *"What actually got in the way?"* (blameless → Failure Library)
- Never a survey. One question, only when it adds signal.

## What tools it uses
| Tool | Does |
|---|---|
| `evaluateIntervention` | scores did-it-work from outcome |
| `calibrateBeliefs` | compares predicted vs actual → adjusts the Bayesian **likelihood table** |
| `scoreSelf` | overall "how well do I understand this user" (0–100) |
| `getInsights` | trends to grade against |

## Dashboard surface — "The Mirror" (Calibration card)
A visible self-assessment the user can correct:
```
🪞 How well is Avnik understanding you?
   Self-confidence: ███████░ 74%
   Best read:  "perfectionism on small tasks"   ✅ correct?  [yes] [no]
   Recent miss: predicted you'd start at 9am (you started 11am) — adjusting.
```
The **[yes]/[no]** feeds straight back into calibration → the model learns.

## Sub-agents (under the Auditor)
- **Self-Critic** — judged each intervention's outcome.
- **Calibrator** — tunes belief likelihoods from predicted-vs-actual.
- **Question-Designer** — composes the single best follow-up question.
- **Tool-Selector** — decides which tools/data the system should look at next.

## Outcome (the learning)
- Updates the **likelihood table** in [`math/bayesian-belief.md`](math/bayesian-belief.md) → better root-cause guesses over time.
- Updates the **Pacer** ([`techniques.md`](techniques.md)) on which technique works.
- Raises/lowers persona & intervention choices in [`agentic.md` L4/L8](agentic.md).

## Build phasing
- ⭐ **HERO:** `evaluateIntervention` after each action + the **Mirror** calibration card + occasional Question-Designer prompt.
- 🟡 **Light:** `calibrateBeliefs` adjusting likelihoods.
- 🌌 **Roadmap:** full self-tuning across all models.

## Implementation points
- [ ] `lib/agents/auditor/` — `selfCritic.ts`, `calibrator.ts`, `questionDesigner.ts`, `toolSelector.ts`.
- [ ] Hook: every intervention writes `{intervention, outcome, beliefBefore, beliefAfter}`.
- [ ] Mirror card on Insights page; [yes]/[no] → `calibrateBeliefs`.
