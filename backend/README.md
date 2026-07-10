# Avnik — Python Agent Backend

The **full 30-agent network**, ported to **Python + FastAPI**, orchestrated by a
real **LangGraph `StateGraph`**, driving the LLM through the **OpenAI SDK** pointed
at **Nvidia NIM** (`meta/llama-3.3-70b-instruct`). Because the OpenAI SDK is
provider-agnostic (only `base_url` + `model` differ), the same code transparently
falls back to Groq's OpenAI-compatible endpoint if the primary is unreachable — a
circuit breaker trips a dead provider after one failure so only the first request
pays a timeout.

## The graph

The Helmsman ReAct loop is an explicit LangGraph state machine:

```
START → regulate → track → router ─(conditional)→ ┌ tone ┐
                                                    │ north_star │
                                                    │ quartermaster │ → chain ─(conditional)→ observe → END
                                                    │ oracle │            (2nd agent finishes
                                                    │ … 10 leads … │        what the 1st started)
                                                    └ promptsmith ┘
```

Inspect it: `python -c "from avnik.graph import GRAPH; print(GRAPH.get_graph().draw_mermaid())"`

## Architecture

```
main.py                 FastAPI app — /chat, /pulse, /health  (LangGraph engine, orchestrator fallback)
avnik/
  graph.py              LangGraph StateGraph — the Helmsman as nodes + conditional edges
  orchestrator.py       hand-rolled fallback (used only if langgraph isn't installed)
  constitution.py       shared behavior protocol injected into every agent
  llm.py                OpenAI SDK client (Nvidia → Groq fallback + circuit breaker)
  regulator.py / tracker.py   mood inference · always-on Bayesian belief update
  models.py             Pydantic contract (mirrors the TS lib/types.ts)
  state.py / mentor.py  CurrentState helpers · sanitize + fit-check quality layer
  pulse.py              deterministic always-on nudge scan
  agents/
    tone.py             MoE: Sage / Spark / Sensei
    north_star.py       TMT prioritization · Day-Planner (calendar) · Goal-Keeper · Meaning-Weaver
    quartermaster.py    core tactics · Pacer (Technique Factory) · Contractor · Triage · Starter
    oracle.py           Bayesian root-cause (8 causes) · Socratic · pattern analysis
    sentinel.py         Sleep-Estimator · Context-Reader · Silence-Watcher
    simple.py           Auditor (+self-critic, question-designer), Chronicler (+anchor, board, future-self),
                        Archivist, Courier, Promptsmith
```

> Note: if a machine-wide `langchain>=1.0` is present, `graph.py` adds a tiny
> non-destructive shim (`langchain.debug`/`verbose`) so LangGraph 0.2.x runs
> without downgrading your global install.

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
