# 🍴 Avnik — 5 Parallel Claude Sessions (copy-paste briefs)

> Open 5 Claude Code sessions. Paste the matching brief into each. **Every session attaches:** [`OUTLINE.md`](OUTLINE.md) · [`TECH-STACK.md`](TECH-STACK.md) · [`PAGES.md`](PAGES.md) · this file. Then its own spec files (listed per session).

## ✅ Foundation is DONE (commit `e23a5ba`)
Shared contracts + Aurora shell + PWA + working chat are built & committed on `master`.
**All sessions work in the SAME folder** `D:\ganesha\Om\deployment\Avnik` — shared `node_modules`, one branch, no worktrees. Coordination = **strict file ownership + the journal** (sessions edit different files, so they don't collide).

### Single-folder rules
- **Stay in your Owns list** — this is what prevents collisions. Never edit another session's files.
- **One dev server at a time** — only one session runs `npm run dev` (port 3000). Others just edit code, or use `npm run dev -- -p 3001`.
- **Coordinate package installs** — need a new npm package? Note it in your journal and install **one at a time** (two simultaneous `npm install` can corrupt `node_modules`).
- **Commit your own files** with a `[s2] …` prefix. Disjoint ownership ⇒ no merge conflicts.

## 🚫 Collision rules (every session)
1. **Only edit files in your "Owns" list.** Never touch another session's folder.
2. **Never edit** `lib/types.ts`, `lib/ai.ts`, `lib/memory.ts`, `lib/tools/registry.ts`, `lib/agents/registry.ts` — Session 1 owns these (frozen contracts). Need a new shared type? Put it in your own module; flag it for integration.
3. **Build against the Shared Contracts + mocks** so you never block on another session.
4. **📓 Journal every checkpoint** to your own file in [`journal/`](journal/README.md) (`s1-ui.md` … `s5-tasks.md`) using the 6-point template. Log loudly (⚠️) any deviation from the Shared Contracts so the Coordinator catches it.

---

## 📜 Shared Contracts (everyone codes to these)
```ts
// lib/types.ts  (Session 1 writes; everyone imports)
export type Task = { id:string; title:string; deadline?:string; effortMin?:number;
  importance?:number; status:'todo'|'doing'|'done'|'blocked'; blockers?:string[]; goalId?:string };
export type Goal = { id:string; title:string; why?:string };               // the Red Book
export type Profile = { ocean:Record<string,number>; workStyle:Record<string,string>;
  motivation:Record<string,number>; commProfile:Record<string,number> };
export type BeliefState = { rootCauses:Record<string,number>; confidence:number;
  traits:Record<string,number> };
export type Event = { ts:number; type:string; source:'active'|'passive'; taskId?:string; value?:any };
export type Message = { role:'user'|'assistant'; content:string; agent?:string };
export type AgentResult = { text:string; agent:string; sideEffects?:Event[] };

// lib/ai.ts        chat(messages:Message[], opts?:{provider?:'gemini'|'groq', tools?:Tool[]}) => Promise<string>
// lib/memory.ts    get(key), set(key,val), append(key,item), retrieve(query) => string[]
// lib/agents/registry.ts   type Agent = { name:string; run(ctx):Promise<AgentResult> }
// lib/tools/registry.ts    type Tool = { name; description; params; run(args,ctx) }
```

---

## 🎨 SESSION 1 — UI, Shell & Foundation
**🎯 Goal:** the skeleton + the "Aurora" look everyone builds inside; commit the contracts first.
**📂 Owns:** `lib/types.ts` `lib/ai.ts` `lib/memory.ts` `lib/tools/registry.ts` `lib/agents/registry.ts` · `app/layout.tsx` `app/globals.css` · PWA (`app/manifest.ts`, service worker) · nav (sidebar/bottom-tabs) · `components/ui/**` (shadcn + Vengeance wrappers) · `app/(app)/settings/` (Gemini⇄Groq switch UI) · placeholder route shells for every page.
**🎨 Theme:** Aurora — Indigo `#4F46E5` · Amber `#F59E0B` · Emerald `#10B981` · Coral `#FB7185` · canvas `#F8FAFC` / text `#1E293B`. Make CSS vars `--brand --accent --success --alert`.
**📤 Produces:** working contracts + installable PWA shell + nav + design system.
**📑 Read:** TECH-STACK.md, PAGES.md, `features/tools.md`. **Uses skills:** frontend-design, modern-web-design.

## 🤖 SESSION 2 — Agents & Orchestration (+ chat)
**🎯 Goal:** the brain — the Helmsman + every agent, callable; the Coach chat surface.
**📂 Owns:** `lib/agents/**` (helmsman/northstar/mentor/oracle/quartermaster/sentinel/archivist/chronicler/auditor) · `lib/tools/{actions,memory}.ts` · `app/api/chat/route.ts` `app/api/agent/route.ts` · `app/(app)/coach/` `components/chat/**`.
**🔌 Consumes:** ai, memory, types, tools registry. Mock math/sensor tools until integration.
**📤 Produces:** Manager routing + agents + chat UI (5 modes, Vent).
**📑 Read:** `features/orchestration.md`, `features/agentic.md`, `features/psychology.md`, `features/conversation.md`, `features/self-eval.md`.

## 🧮 SESSION 3 — Math, Quiz & Intro Animation
**🎯 Goal:** the probabilistic engine + the onboarding quiz + the 5-sec opener.
**📂 Owns:** `lib/math/**` (bayes, causal, cognitive, energy, tracker) · `lib/tools/analytics.ts` · `app/onboarding/**` `components/onboarding/**` (Big Five quiz + inference) · `app/intro/**` `components/intro/**` (5-sec cinematic animation + `public/intro.mp4` fallback).
**🔌 Consumes:** types, memory, ai.
**📤 Produces:** `runBayesUpdate`, belief state, Big Five quiz → Profile, the intro animation.
**📑 Read:** `features/math/*`, `features/agentic.md` (L1–L4), `features/onboarding-identity.md`.

## 📊 SESSION 4 — Dashboard, Home & Growth
**🎯 Goal:** the visible payoff — Home hub + Insights/stats + Board Meeting.
**📂 Owns:** `app/(app)/home/` `app/(app)/insights/` · `components/dashboard/**` `components/charts/**`.
**🔌 Consumes:** memory, types (reads BeliefState/Event shapes); mock data until integration.
**📤 Produces:** Home (energy bars, What Now? button, mood), Impact Dashboard, belief %/trends/timeline, Board Meeting, gamification, the **Mirror** (Auditor) card, time-budget.
**📑 Read:** `features/memory-growth.md`, `features/math/dashboard.md`, `features/self-eval.md`.

## ✅ SESSION 5 — Tasks, Action & Journaling
**🎯 Goal:** the action center + journaling/sensing + Red Book.
**📂 Owns:** `app/(app)/tasks/` `app/(app)/journal/` `app/(app)/profile/` · `components/tasks/**` `components/reflection/**` · `lib/tools/sensing.ts` (mock provider) · `lib/techniques/**`.
**🔌 Consumes:** memory, types, ai.
**📤 Produces:** task model + UI (triage/planner/What-Now/Just-Start-It/Pomodoro/Ulysses/blocker), 3-level journaling + mood check-in + Silence Speaks, Red Book/Profile page.
**📑 Read:** `features/action.md`, `features/techniques.md`, `features/sensing.md`, `features/lifeos.md`.

---

## 🪞 SESSION 6 — Coordinator (the 6th session)
**🎯 Goal:** keep the 5 sessions in sync, catch what's improper, and integrate. (Mirrors Avnik's own **Auditor**.)
**📂 Owns:** `journal/s6-coordinator.md` + final wiring at integration time.
**🔁 Every pass:** read all `journal/s1–s5` + the code → check **contract adherence**, **interface match** (consumer signatures vs producer exposes), **no duplicates/conflicts**, **coverage gaps** (vs [`FEATURES.md §6`](FEATURES.md)), and flag anything **improper** → report back to the owning session (don't rewrite their files).
**🔗 Integration (final):** wire Helmsman → real agents · swap mock tools for real (`analytics`←S3, `sensing`←S5) · connect pages to live agents · smoke-test using [`STORY.md`](STORY.md) as the script · deploy Google Cloud · GitHub (tag `v1-submission`) · Google Doc · submit.
**📑 Read:** [`journal/README.md`](journal/README.md), all session journals, OUTLINE, FEATURES.

