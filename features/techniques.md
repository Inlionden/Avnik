# ⏱️ Technique System (`techniques.md`) — not just Pomodoro

> Part of **Avnik**. Master → [`../FEATURES.md`](../FEATURES.md). Productivity has **many** work/break rhythms. The **Pacer** sub-agent (under [The Quartermaster](../OUTLINE.md)) **selects or creates** the right technique for the user's current state — and registers it as a runnable **MCP-style timer tool** on the fly.

## Principle
A technique = a timer config + *when to use it*. Avnik doesn't hard-code one rhythm; it has a **library** + a **factory** that builds new ones. The Pacer matches technique → state (distraction, overwhelm, flow, fatigue).

## Technique library (named presets)
| Technique | Rhythm | Best for |
|---|---|---|
| **Classic Pomodoro** | 25 work / 5 break ×4, then 15 | general focus |
| **DeskTime 52/17** | 52 / 17 | sustained knowledge work |
| **Sprint 50/10** | 50 / 10 | longer deep blocks |
| **Ultradian 90** | 90 / 20 | deep flow, big tasks |
| **Flowtime** | work till natural stop, break = ⅕ of worked time | hates fixed breaks / in flow |
| **2-Minute Rule** | "just do 2 minutes" | severe avoidance / starting |
| **Eat the Frog** | hardest task first, single block | overwhelm + clear priority |
| **Timeboxing** | fixed box per task (from the time-budget) | many small tasks |

## Matching (Pacer logic)
- High **distraction** → short cycles (Pomodoro 25/5) · High **overwhelm** → 2-Minute Rule / Eat the Frog · In **flow** / high energy → Ultradian 90 or Flowtime · **Fatigue** → shorter work, longer breaks · **Many tiny tasks** → Timeboxing.

## The Technique Factory (tools that create tools) ⭐
The agent can **compose a new technique at runtime** and expose it as a callable tool — the MCP-style "tools that create tools" you described.
```ts
createTechnique({ name, workMin, breakMin, cycles, longBreakMin? }) → registers tool `startTechnique:<name>`
// e.g. agent invents "Arjun Crunch 40/8" when it sees 40-min focus + quick resets work for him
```
**Named technique tools:**
| Tool | Signature |
|---|---|
| `startTechnique` | `(name) → session` |
| `createTechnique` | `(config) → registers a new timer tool` |
| `suggestTechnique` | `(state) → best-match name + why` |
| `timer.tick / pause / stop` | session control |
| `logTechniqueOutcome` | `(name, completed, focusScore) → feeds self-eval + Task DNA` |

## Self-improving
Each technique run logs outcome (completed? focus quality?) → the [Auditor](self-eval.md) learns **which rhythm works for this user** → Pacer's matching improves; winning custom techniques get saved.

## Build phasing
- ⭐ **HERO:** library presets + `startTechnique` + `suggestTechnique` (state→technique) + the timer UI.
- 🟡 **Light:** `createTechnique` factory (compose new rhythms).
- 🌌 **Roadmap:** fully self-invented techniques tuned from outcome data.

## Implementation points
- [ ] `lib/techniques/presets.ts` (the table) · `lib/techniques/factory.ts` (`createTechnique`).
- [ ] Register technique tools into [`lib/tools/registry.ts`](tools.md).
- [ ] Pacer picks via state from Energy Prediction + Root-Cause; user can override.
- [ ] Outcome logging → Task DNA + Auditor.
