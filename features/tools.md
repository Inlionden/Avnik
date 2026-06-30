# 🧰 Agent Tool Layer (`tools.md`) — MCP-style tools the agents use

> Part of **Avnik**. Master → [`../FEATURES.md`](../FEATURES.md). The **agentic tool catalog.** Agents — via LLM **function-calling** (Gemini / Groq tool use), MCP-style — call tools to **perceive** (sensors), **analyze** (analytics/math), and **act**. **Tool use = the agent *doing*, not just chatting** → this is where Agentic Depth lives.
> Owner: 🧭 Manager exposes the registry; any agent may call. Cross-cutting infra (like `types`/`ai`/`memory`).

## The Tool interface
```ts
Tool = {
  name: string,
  description: string,                 // the LLM reads this to decide when to call
  params: ZodSchema,                   // typed args
  availability: 'web' | 'mobile' | 'wearable',
  permission?: 'location'|'mic'|'health'|'notifications',
  run: (args, ctx) => Promise<Result>, // deterministic where possible
}
```

## How agents call tools (the loop)
1. Manager passes relevant tool **schemas** to the model (Gemini function-calling / Groq tools).
2. Model emits a **tool call** (name + args).
3. We **execute** `tool.run(args, ctx)` — math/memory run in code; sensors return **real-or-simulated** data.
4. Result goes back to the model → it continues or answers. (Multi-step → agentic.)

## Simulation strategy (key for the web demo)
Sensor tools sit behind a provider: `MockSensorProvider` (seeded values) on web **now**, swappable to `HealthConnectProvider` / device APIs on mobile **later** — **identical agent logic both times.** So we demo the full reasoning today without real hardware.

---

## Catalog

### 👁️ Perceive — sensing tools
| Tool | Signature | Avail | Status |
|---|---|---|---|
| `getCurrentPlace` | `() → {place, zoneType}` | mobile | 🌌 (mock now) |
| `getSteps` / `getActivity` | `() → {steps, standMin, walkBreaks}` | mobile | 🌌 |
| `getSittingDuration` | `() → minutes` | web | 🟡 (in-app) |
| `getNoiseLevel` | `() → dB` | mic | 🌌 |
| `getLightLevel` | `() → lux` | mobile | 🌌 |
| `getDeviceUsage` | `() → {screenMin, appSwitches}` | web | 🟡 (in-app proxy) |
| `getCalendarLoad` | `() → {meetings, busyMin}` | web | 🟡 |
| `getSleep` | `() → {hours, consistency}` | wearable | 🌌 (self-report now) |
| `getHeartRate`/`getHRV`/`getSpO2` | `() → number` | wearable | 🌌 |
| `getMood` | `() → mood` | web | ⭐ (from sensing.md) |

### 🔍 Reason — analytics & math tools
| Tool | Signature | Status |
|---|---|---|
| `runBayesUpdate` | `(evidence) → beliefs` | ⭐ ([bayesian-belief](math/bayesian-belief.md)) |
| `computeEnergy` | `() → {mental, physical, stress}` | 🟡 ([lifeos §4](lifeos.md)) |
| `computeEnvironmentScore` | `(place) → score` | 🟡 |
| `getProductivityMap` | `() → place→activity[]` | 🟡 |
| `predictSlipRisk` | `(task) → 0..1` | ⭐ |
| `getInsights` | `(period) → insightCard[]` | ⭐ (analytics) |
| `detectCausalCycle` | `() → cycle[]` | 🟡 ([causal-graph](math/causal-graph.md)) |

### 🗂️ Memory tools
| Tool | Signature | Status |
|---|---|---|
| `memoryGet`/`Set`/`Append`/`Retrieve` | store ops | ⭐ |
| `definePlace` | `(label, zoneType, geo?) → ok` | 🟡 |
| `logEvent` | `(event) → ok` | ⭐ |
| `getBeliefs` | `() → BeliefState` | ⭐ |

### ⚡ Act tools
| Tool | Signature | Status |
|---|---|---|
| `createTask` / `breakDownTask` | task ops | ⭐ |
| `prioritizeTasks` / `scheduleDay` | planning | ⭐ |
| `startPomodoro` | `(min) → session` | ⭐ |
| `scheduleNudge` | `(when, msg) → ok` | ⭐ |
| `draftArtifact` | `(task) → draft` (email/outline/problem) | ⭐ ("Just Start It") |
| `startBreathing` | `(min) → session` | 🟡 (lifeos §3) |
| `sendCheckIn` | `() → ok` ("Silence Speaks") | 🟡 |

---

## Mapping to the parallel build ([BUILD-PARALLEL.md](../BUILD-PARALLEL.md))
- **Foundation:** the `Tool` interface + `lib/tools/registry.ts` + function-calling wiring in `ai.ts`.
- **Stream B (Brain+Math):** analytics tools (`runBayesUpdate`, `getInsights`, `predictSlipRisk`…).
- **Stream C (Action):** act tools (`createTask`, `draftArtifact`, `startPomodoro`…).
- **Stream D (Onboarding+Sensing) / LifeOS:** sensing tools + `MockSensorProvider`, `definePlace`, breathing.

## Build phasing
- ⭐ **HERO:** the tool framework + function-calling, memory tools, act tools, analytics tools, `getMood`, simulated sensor tools.
- 🟡 **Light:** energy/environment/productivity-map, sitting timer, breathing, device-usage proxy.
- 🌌 **Roadmap:** real device/health/wearable sensors (mobile + Health Connect).

## Implementation points
- [ ] `lib/tools/registry.ts` (interface + register/list), `lib/tools/{sensing,analytics,memory,actions}.ts`.
- [ ] `SensorProvider` abstraction: `Mock` (now) ↔ `HealthConnect`/device (later).
- [ ] Wire tool schemas into `lib/ai.ts` function-calling; Manager selects the tool subset per agent.
- [ ] Every tool: typed params, permission gate, deterministic where possible.
