"""LLM access — the single choke point. OpenAI SDK, provider-agnostic.

Primary provider is Nvidia NIM (the chosen deployment target). Because the OpenAI
SDK only differs by base_url + model, the same code transparently falls back to
Groq's OpenAI-compatible endpoint if the primary is unreachable — so the agent
network always has a working brain. Every agent calls chat() here, guaranteeing
the shared Constitution is applied (unless raw=True for pure-JSON extractors).
"""
import os
from typing import List, Dict, Optional

from openai import AsyncOpenAI

from .constitution import with_constitution

# ── Providers (all OpenAI-compatible) ────────────────────────────────────────
NVIDIA_BASE = os.environ.get("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
NVIDIA_MODEL = os.environ.get("NVIDIA_MODEL", "meta/llama-3.3-70b-instruct")
GROQ_BASE = "https://api.groq.com/openai/v1"
GROQ_MODEL = "llama-3.3-70b-versatile"

# Primary provider label for /health.
MODEL = NVIDIA_MODEL

# Per-request timeout (seconds) before we consider a provider dead and fall back.
TIMEOUT = float(os.environ.get("LLM_TIMEOUT", "20"))

_clients: Dict[str, AsyncOpenAI] = {}

# Circuit breaker: a provider that fails is skipped for the rest of the process
# so only the FIRST request eats a dead-provider timeout, not every call.
_dead: set = set()


def _providers() -> List[Dict]:
    """Ordered provider chain. Nvidia first (chosen), Groq as working fallback."""
    chain = []
    if os.environ.get("NVIDIA_API_KEY"):
        chain.append({"name": "nvidia", "base": NVIDIA_BASE, "model": NVIDIA_MODEL, "key": os.environ["NVIDIA_API_KEY"]})
    if os.environ.get("GROQ_API_KEY"):
        chain.append({"name": "groq", "base": GROQ_BASE, "model": GROQ_MODEL, "key": os.environ["GROQ_API_KEY"]})
    if os.environ.get("GROQ_API_KEY_2"):
        chain.append({"name": "groq2", "base": GROQ_BASE, "model": GROQ_MODEL, "key": os.environ["GROQ_API_KEY_2"]})
    live = [p for p in chain if p["name"] not in _dead]
    return live or chain  # if all tripped, try them all again


def _client(p: Dict) -> AsyncOpenAI:
    if p["name"] not in _clients:
        _clients[p["name"]] = AsyncOpenAI(base_url=p["base"], api_key=p["key"], timeout=TIMEOUT, max_retries=0)
    return _clients[p["name"]]


def _to_openai_messages(messages: List[Dict], system: Optional[str]) -> List[Dict]:
    out: List[Dict] = []
    if system:
        out.append({"role": "system", "content": system})
    for m in messages:
        role = m.get("role")
        if role in ("user", "assistant"):
            out.append({"role": role, "content": m.get("content", "")})
    return out


async def chat(
    messages: List[Dict],
    system: Optional[str] = None,
    temperature: float = 0.7,
    raw: bool = False,
) -> str:
    """One-shot completion with provider fallback. Constitution applied unless raw."""
    sys = None
    if system:
        sys = system if raw else with_constitution(system)
    oai_messages = _to_openai_messages(messages, sys)

    chain = _providers()
    if not chain:
        raise RuntimeError("No LLM provider key set (NVIDIA_API_KEY or GROQ_API_KEY).")

    last_err: Optional[Exception] = None
    for p in chain:
        try:
            resp = await _client(p).chat.completions.create(
                model=p["model"],
                messages=oai_messages,
                temperature=temperature,
                max_tokens=1024,
            )
            return (resp.choices[0].message.content or "").strip()
        except Exception as e:  # timeout / network / auth → trip breaker, try next
            last_err = e
            _dead.add(p["name"])
            continue
    raise last_err  # type: ignore
