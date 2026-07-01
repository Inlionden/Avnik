# 🧱 Avnik — Tech Stack & Decisions

> Decisive choices tuned to: **36 hrs · deploy on Google Cloud · Google hackathon (prefer Gemini) · web-first · single-user MVP.** You manage all keys/env; this lists exactly what to get.

## 0. Platform — 🔒 **Web app first → installable PWA** (one codebase)
Build **one web app** (Next.js). Make it a **PWA** (add a manifest + service worker) so it **installs like a real app** on phone & desktop — your "website converted into an app." Same code runs in the browser *and* as an installed app.
- **Web CAN detect:** location (Geolocation), microphone/voice, notifications, in-app activity/time, camera.
- **Web CANNOT:** steps / heart-rate / background sensors → **simulated now**, added later by wrapping the same web app in **Capacitor/Expo** for native (roadmap). No rewrite — the web app *becomes* the native app.
> **Decision:** ship the PWA web app for the hackathon. Native sensor wrapper = post-hackathon, zero rework.

## 1. Language — **TypeScript only**
Everything (UI + API + the math/Bayesian engine) in **TypeScript**. The "math fork" is simple arithmetic — no need for Python. **Avoid a second Python service** (it means a second deploy = wasted hours).

## 2. Core framework
- **Next.js 16** (App Router) — already scaffolded; front + backend (API routes) in one deploy.
- **React 19 · Tailwind v4 · shadcn/ui** (base components) **+ Vengeance UI** (flourishes — you'll hand-pick components).
- **TypeScript · Zod** (typed tool/function schemas).

## 3. AI layer — **Vercel AI SDK** (not LangGraph/AutoGen)
- **`ai` (Vercel AI SDK)** + **`@ai-sdk/google`** (Gemini, default) + **`@ai-sdk/groq`** (Groq, switch). Gives the **provider switch, streaming, and tool/function-calling** out of the box — exactly our [tool layer](features/tools.md).
- **Orchestration = our own thin Manager (the Helmsman)** on top of the SDK. **Honest call: skip LangGraph / AutoGen** — they're Python-first, heavy, and would slow a 36-hr TS build. Our multi-agent pattern is just "route → run agent with its tools." *(If you want a named TS agent framework for the pitch, **Mastra** is the option — but not needed.)*
- **Models:** Gemini `gemini-2.0-flash` (fast, cheap, default) / `gemini-2.0-pro` (deep reasoning); Groq `llama-3.3-70b-versatile` (fallback/speed).

## 4. Storage + Vector/RAG — **Supabase** (you already have it)
- **Supabase (Postgres)** for profile, tasks, events, journals, beliefs, goals. Free tier; you already have `APPILY_SUPABASE_URL/ANON_KEY`.
- **Vector DB = Supabase `pgvector`** (built in) — no separate vector DB. Embed journals/memory with **Gemini `text-embedding-004`** for real RAG. *(MVP fallback: keyword retrieval, no embeddings.)*
- **Auth:** Supabase Auth (optional for MVP — single user can be local).
- ⚡ **Zero-setup fallback:** localStorage for the Memory spine on day 1, swap to Supabase when ready (same `memory.ts` interface).

## 5. Voice — **Web Speech API** (free) + optional **Groq Whisper**
- MVP: browser `SpeechRecognition` (STT) + `speechSynthesis` (TTS) — zero install (like Appily web).
- Better STT (optional): **Groq `whisper-large-v3`**. No extra module needed beyond the AI SDK.

## 6. Location / Maps — browser **Geolocation API** + manual places
- Coords via browser `navigator.geolocation`; **places are user-defined** (no Google Maps needed for MVP).
- Optional map UI: **Leaflet + react-leaflet** (free, OpenStreetMap) or `@react-google-maps/api`. Geofencing = mobile-only (roadmap).

## 7. Steps / Health — **roadmap (mobile)**
- Web **cannot** read steps/HR. **Google Health Connect** needs the Android/Expo app. For web MVP: **simulate behind the [tool layer](features/tools.md)** (`MockSensorProvider`), swap to real later. No install now.

## 8. External APIs — deep research (optional)
- **Gemini + Google Search grounding** (native, gives real citations) for the **AI Research Coach** — on-theme for a Google hackathon.
- Alternatives: **Tavily** or **Exa** (search-for-LLM APIs) if you want web research outside Google.

## 9. Deployment — **Google Cloud** (mandatory)
- **Firebase App Hosting** (easiest for Next.js SSR) — recommended. Alt: **Cloud Run** (container, more control).

## 10. Env vars you'll create
```
GOOGLE_GENERATIVE_AI_API_KEY=   # Gemini (aistudio.google.com)
GROQ_API_KEY=                   # Groq (you have one from Appily)
NEXT_PUBLIC_SUPABASE_URL=       # Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-side writes (optional)
TAVILY_API_KEY=                 # optional, deep research
```

## 11. Install list (npm)
**Core (now):** `ai @ai-sdk/google @ai-sdk/groq zod @supabase/supabase-js zustand lucide-react date-fns`
**UI:** shadcn CLI (`npx shadcn@latest init`) + Vengeance components (`npx shadcn@latest add @vengeanceui/[component]`) + `framer-motion` (if not via Vengeance)
**Optional/per-feature:** `react-leaflet leaflet` (maps) · a light chart (or hand-built bars) · `@ai-sdk/react` (streaming hooks)

---

## 12. Color theme — 🔒 LOCKED: **"Aurora"** (4 colors on a light canvas, not black-everywhere)
A real **4-color combination** used together across the UI, on a clean **light slate-white canvas** (dark mode optional later). Each color has a job:
| # | Color | Hex | Used for |
|---|---|---|---|
| 1 | **Indigo** (primary) | `#4F46E5` | brand, buttons, links, focus blocks, active nav |
| 2 | **Amber** (accent / North Star) | `#F59E0B` | key CTAs (What Now?, Start), streaks, highlights, the star |
| 3 | **Emerald** (positive) | `#10B981` | success, progress/energy bars, "done", growth |
| 4 | **Coral/Rose** (emotion/urgency) | `#FB7185` | deadlines, stress, gentle alerts (softer than red) |
| — | Canvas / text (neutral) | bg `#F8FAFC` · card `#FFFFFF` · text `#1E293B` · muted `#64748B` | the page itself — light, airy |

**Why:** indigo = focus/trust/lower-stress, amber = the guiding-star energy for actions, emerald = reassuring progress, coral = warmth for emotional/urgent moments without red's anxiety. Light canvas keeps it calm and modern. Full design tokens (`--brand`, `--accent`, etc.) get generated in the UI step.

---

## 13. Reference files for Claude (what to give each session)
**Always attach (every session):** [`OUTLINE.md`](OUTLINE.md) (master) · [`TECH-STACK.md`](TECH-STACK.md) (this) · [`FEATURES.md`](FEATURES.md) (index) · [`PAGES.md`](PAGES.md) · [`BUILD-PARALLEL.md`](BUILD-PARALLEL.md).
**Per parallel stream, add its specs:**
| Stream | Attach these |
|---|---|
| Foundation | OUTLINE, TECH-STACK, PAGES, BUILD-PARALLEL, `features/tools.md` |
| A · Convo+Coach | `features/conversation.md`, `features/psychology.md` |
| B · Brain+Math | `features/agentic.md`, `features/math/*`, `features/self-eval.md` |
| C · Action | `features/action.md`, `features/techniques.md` |
| D · Onboarding+Sensing | `features/onboarding-identity.md`, `features/sensing.md`, `features/lifeos.md` |
| E · Dashboard+Growth | `features/memory-growth.md`, `features/math/dashboard.md` |
**For context/story:** [`STORY.md`](STORY.md).
