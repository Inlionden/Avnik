# Avnik — Python Agent Backend

The 30-agent network, ported to **Python + FastAPI**, driving the LLM through the
**OpenAI SDK** pointed at **Nvidia NIM** (`meta/llama-3.3-70b-instruct`). Because
the OpenAI SDK is provider-agnostic (only `base_url` + `model` differ), the same
code transparently falls back to Groq's OpenAI-compatible endpoint if the primary
is unreachable — a circuit breaker trips a dead provider after one failure so only
the first request pays a timeout.

## Architecture

```
main.py                 FastAPI app — /chat, /pulse, /health
avnik/
  constitution.py       shared behavior protocol injected into every agent
  llm.py                OpenAI SDK client (Nvidia → Groq fallback + circuit breaker)
  models.py             Pydantic contract (mirrors the TS lib/types.ts)
  state.py              CurrentState + mood/energy inference
  mentor.py             sanitize + fit-check quality layer
  orchestrator.py       Helmsman: route → act → chain → mentor → observe
  pulse.py              deterministic always-on nudge scan
  agents/
    tone.py             MoE: Sage / Spark / Sensei
    north_star.py       TMT prioritization + Day-Planner (calendar side-effects)
    quartermaster.py    Pacer (Technique Factory)
    oracle.py           Bayesian root-cause engine (8 causes)
    simple.py           auditor, chronicler (+anchor/board), sentinel, archivist, courier, promptsmith
```

## Run

```bash
cd backend
python -m venv .venv && .venv\Scripts\activate     # (Windows) or: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # add your NVIDIA_API_KEY (and optionally GROQ_API_KEY as fallback)
uvicorn main:app --port 8000 --reload
```

Health check: `GET http://localhost:8000/health`

## Wire the Next.js frontend to it

Set one env var in the frontend's `.env.local`, then restart `npm run dev`:

```bash
AGENT_BACKEND_URL=http://localhost:8000
```

The Next.js `/api/chat` route now proxies to this Python service. Unset it and the
built-in TypeScript agents run instead — same UI, either brain.

## Endpoints

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/chat` | `{messages, chatMode, profile, beliefs, tasks, events, currentState}` | `{reply, agent, route, state, sideEffects, beliefs}` |
| POST | `/pulse` | `{tasks, calendar, events, hour}` | `{nudges, ts}` |
| GET | `/health` | — | `{ok, model, provider}` |

## Env

| Var | Default | Notes |
|---|---|---|
| `NVIDIA_API_KEY` | — | primary provider (OpenAI SDK → Nvidia NIM) |
| `GROQ_API_KEY` | — | optional fallback (OpenAI SDK → Groq) |
| `NVIDIA_MODEL` | `meta/llama-3.3-70b-instruct` | override model |
| `LLM_TIMEOUT` | `20` | seconds before a provider is considered dead |
| `CORS_ORIGINS` | localhost:3000,3001 | comma-separated allowed origins |
