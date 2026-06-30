# 🛠️ Parallel Build Plan — fork 4–5 Claude sessions without collisions

> How to split Avnik so **multiple Claude sessions build in parallel** and merge cleanly. The rule: **define shared contracts ONCE, then give each session disjoint file ownership.** No two sessions edit the same file.

---

## ⚠️ The golden rule: Foundation FIRST, then fork
Parallel sessions editing before the shared contracts exist = chaos and merge hell. So **one session builds the Foundation, commits & pushes, and only THEN do you fork the 5 streams.** The Foundation is exactly our **Step 1**.

```
            ┌─────────────────────────────────────────────┐
  PHASE 0   │  FOUNDATION (1 session) — the contracts      │
            └─────────────────────────────────────────────┘
                              │ commit + push
        ┌──────────┬──────────┼──────────┬──────────────┐
  PHASE 1│Stream A  │Stream B  │Stream C  │Stream D  │Stream E   ← 5 parallel sessions
        │Convo+Coach│Brain+Math│Action    │Onboard+Sense│Dash+Growth│
        └──────────┴──────────┴──────────┴──────────────┘
                              │ each pushes its folders
            ┌─────────────────────────────────────────────┐
  PHASE 2   │  INTEGRATION (1 session) — wire Manager + UI │
            └─────────────────────────────────────────────┘
                              │
                       POLISH + DEPLOY
```

---

## PHASE 0 — Foundation (build this first; ~1 session)
Creates every **contract** the parallel streams code against. Owns the shared files so no stream has to.
- [ ] Clean scaffold · Avnik theme/design tokens · app shell + routing · 5–6s intro
- [ ] `lib/types.ts` — **all shared types**: `Task, Goal, Profile, CommProfile, BeliefState, Event, Message, AgentResult`
- [ ] `lib/ai.ts` — **Gemini+Groq provider switch** (`chat(messages, opts)`) — the only AI entry point
- [ ] `lib/memory.ts` — **the store** (`get/set/append/retrieve`) over localStorage — the shared bus
- [ ] `lib/agents/registry.ts` — the **Agent interface** (`{name, run(ctx)→AgentResult}`) + empty Manager skeleton
- [ ] `components/ui/` — shared primitives (Button, Card, Bar, Chip, Bubble)
- [ ] `.env` placeholders · commit + push

**Output = the contract every stream imports.** After this, fork.

---

## PHASE 1 — the 5 parallel streams (each = 1, big ones = 2 sessions)

> Each stream: **reads its spec files**, **owns its folders** (creates/edits only these), **imports** the Foundation contracts, **develops against mock data** (so it never waits on another stream), and **exposes** its agents/components for Integration.

### 🟦 Stream A — Conversation & Coach  *(1–2 sessions)*
- **Specs:** [`features/conversation.md`](features/conversation.md), [`features/psychology.md`](features/psychology.md) (Coach & modes)
- **Owns:** `app/(chat)/`, `components/chat/`, `lib/agents/coach.ts`, `lib/agents/conversation/`
- **Consumes:** `ai.ts`, `memory.ts`, `types.ts`
- **Produces:** `coachAgent`, the chat UI, `commProfile` updater, 5 modes + Vent + Fit/Mood agents
- **Rubric:** personalized recommendations (#3)

### 🟩 Stream B — Brain & Math  *(1–2 sessions, pure logic)*
- **Specs:** [`features/agentic.md`](features/agentic.md), [`features/math/`](features/math/README.md)
- **Owns:** `lib/math/`, `lib/agents/profiler.ts`, `lib/agents/rootcause.ts`
- **Consumes:** `types.ts`, `memory.ts` (read events)
- **Produces:** `tracker`, `bayes.update`, belief state, profile inference, root-cause %
- **Rubric:** predictive insights (#11) · most decoupled — can start immediately on types alone

### 🟧 Stream C — Action & Tasks  *(2 sessions — biggest)*
- **Specs:** [`features/action.md`](features/action.md)
- **Owns:** `app/tasks/`, `components/tasks/`, `lib/agents/triage.ts`, `lib/agents/focus.ts`
- **Consumes:** `ai.ts`, `memory.ts`, `types.ts`
- **Produces:** task CRUD, prioritization, day planner, "What Now?", Just-Start-It, Proactive Nudge, Pomodoro, Blocker Tracker, Ulysses Contract
- **Rubric:** #1, #2, #4, #8, #9

### 🟨 Stream D — Onboarding, Identity & Sensing  *(1–2 sessions)*
- **Specs:** [`features/onboarding-identity.md`](features/onboarding-identity.md), [`features/sensing.md`](features/sensing.md)
- **Owns:** `app/onboarding/`, `app/journal/`, `components/onboarding/`, `lib/sensing.ts`
- **Consumes:** `ai.ts`, `memory.ts`, `types.ts`
- **Produces:** onboarding flow, Big Five quiz, North Star/Red Book, Live Profile bars, 3-level journaling, mood check-ins, "Silence Speaks"
- **Rubric:** goal & habit tracking (#6)

### 🟪 Stream E — Dashboard & Growth  *(1–2 sessions)*
- **Specs:** [`features/memory-growth.md`](features/memory-growth.md), [`features/math/dashboard.md`](features/math/dashboard.md)
- **Owns:** `app/dashboard/`, `components/dashboard/`, `components/reflection/`
- **Consumes:** `memory.ts`, `types.ts` (reads belief state from Stream B's output shape — agreed via `types.ts`)
- **Produces:** Impact Dashboard, stats viz, Philosophy Notebook, Why Journal, Board Meeting, gamification, time-budget tracker
- **Rubric:** impact dashboards (#10), gamification (#12)

---

## PHASE 2 — Integration (1 session, after streams push)
- [ ] Wire `lib/agents/registry.ts` Manager to route to all real agents (replaces mocks).
- [ ] Connect UI pages to live agents (chat → coach, tasks → triage, dashboard → tracker).
- [ ] One nav shell linking onboarding → chat → tasks → dashboard.
- [ ] Smoke-test the full loop; fix interface mismatches.
- [ ] Then: deploy to Google Cloud · GitHub · Google Doc.

---

## Collision-avoidance rules (give these to every session)
1. **Only edit files inside your stream's "Owns" list.** Never edit another stream's folder.
2. **Never edit `lib/types.ts`, `lib/ai.ts`, `lib/memory.ts`, `registry.ts`** — these are Foundation-frozen. Need a new shared type? Put it in your own module's local types; flag cross-cutting ones for the Integration session.
3. **Develop against mocks** conforming to `types.ts` — don't block on another stream.
4. **Each agent implements the `Agent` interface** so the Manager can register it at Integration with zero rework.
5. **Use a branch/worktree per stream** (`stream-a`, `stream-b`, …); merge order = B, then A/C/D/E, then Integration.

> Mapping to the 5-Step plan: Phase 0 = Step 1. The streams cover Steps 2–5 in parallel instead of in sequence. Same scope, ~3–4× faster.
