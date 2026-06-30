# 📓 Cloud Journal — checkpoint & coordination system

> How the 5 build sessions stay in sync and the 6th coordinates them. Mirrors Avnik's own **Auditor** idea: a meta-session that grades the build itself.

## How it works
1. **Each session journals to ITS OWN file** — `s1-ui.md`, `s2-agents.md`, `s3-math.md`, `s4-dashboard.md`, `s5-tasks.md`. **Append-only.** One file per session = **zero merge collisions**.
2. **Journal a checkpoint** at every meaningful milestone (interface defined, component done, blocker hit, before a commit). Don't wait till the end.
3. **Session 6 (Coordinator)** reads all 5 journals + the code, writes `s6-coordinator.md`: consistency checks, mismatches, "this is improper", gaps, and the integration plan.

## The 6-point checkpoint (the "6 things" every entry logs)
```
## Checkpoint <n> — <YYYY-MM-DD HH:MM>
1. Did:        <what I built this checkpoint>
2. Files:      <files I created/changed — only inside my Owns list>
3. Exposes:    <interfaces/components others can use>  ⚠️ <any deviation from Shared Contracts>
4. Needs:      <what I consume from others; which mocks I'm using meanwhile>
5. Blockers:   <open questions / what I'm stuck on>
6. Next:       <what I'll do next>
```

## Rules
- Stay inside your **Owns** list ([`../SESSIONS.md`](../SESSIONS.md)). If you must deviate from a **Shared Contract**, log it loudly in point 3 with ⚠️ so the Coordinator catches it.
- Branch per session (`s1-ui`, …). Commit references can go in the checkpoint.
- The Coordinator does **not** rewrite your files — it **flags** issues back to the owning session, and does final wiring at integration.

## Files
| File | Session |
|---|---|
| `s1-ui.md` | UI, Shell & Foundation |
| `s2-agents.md` | Agents & Orchestration |
| `s3-math.md` | Math, Quiz & Intro Animation |
| `s4-dashboard.md` | Dashboard, Home & Growth |
| `s5-tasks.md` | Tasks, Action & Journaling |
| `s6-coordinator.md` | 🪞 Coordinator (reads all, checks, integrates) |
