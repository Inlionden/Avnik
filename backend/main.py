"""Avnik agent backend — FastAPI over the OpenAI SDK (Nvidia NIM).

Endpoints match the Next.js contract so the frontend can point at this service:
  POST /chat   -> { reply, agent, route, state, sideEffects, beliefs }
  POST /pulse  -> { nudges, ts }
  GET  /health -> { ok, model }
"""
import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

from avnik.models import ChatRequest, now_ms
from avnik.orchestrator import run_helmsman
from avnik.pulse import run_pulse
from avnik import llm

app = FastAPI(title="Avnik Agent Backend", version="1.0.0")

_origins = os.environ.get("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origins],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"ok": True, "model": llm.MODEL, "provider": "nvidia-nim (openai-sdk)"}


@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        return await run_helmsman(req)
    except Exception as e:
        return {"error": f"{type(e).__name__}: {e} — check NVIDIA_API_KEY"}


class PulseRequest(BaseModel):
    tasks: List[Dict[str, Any]] = []
    calendar: List[Dict[str, Any]] = []
    events: List[Dict[str, Any]] = []
    hour: int = 12


@app.post("/pulse")
async def pulse_endpoint(req: PulseRequest):
    return {"nudges": run_pulse(req.tasks, req.calendar, req.events, req.hour), "ts": now_ms()}
