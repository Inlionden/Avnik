"""🎙️ Mentor — the quality layer applied to every reply.

sanitize (deterministic artifact stripping) + fit-check (length to the chat mode).
Port of lib/agents/conversation/{sanitize,fit-checker}.ts.
"""
import re
from .llm import chat

_META_PATTERNS = [
    re.compile(r"^\s*cutting knowledge date:.*$", re.IGNORECASE | re.MULTILINE),
    re.compile(r"^\s*today date:\s*\d.*$", re.IGNORECASE | re.MULTILINE),
    re.compile(r"^\s*you are \w[\w-]* [—-] avnik'?s\b.*$", re.IGNORECASE | re.MULTILINE),
    re.compile(r"\byou are (?:helmsman|promptsmith|the orchestrator)\b[^.!?\n]*[.!?\n]", re.IGNORECASE),
    re.compile(r"\b(?:wait,?\s*)?let me rephrase(?:\s*that)?\b[.:!\s]*", re.IGNORECASE),
    re.compile(r"^\s*(?:sure|okay|ok|alright|got it|certainly|of course|absolutely)[!,.:\s]+(?=\S)", re.IGNORECASE),
    re.compile(r"\b(?:as an ai|i'?m (?:just )?an ai(?: language model)?|being an ai)\b[^.!?]*[.!?]\s*", re.IGNORECASE),
]

LENGTH_TARGETS = {"vent": 60, "plan": 150, "focus": 40, "review": 200, "chat": 120}


def sanitize_reply(text: str) -> str:
    t = (text or "").strip()
    for pat in _META_PATTERNS:
        t = pat.sub(" ", t)
    t = re.sub(r"\s+([.,!?;:])", r"\1", t)
    t = re.sub(r"([.!?]){2,}", r"\1", t)
    t = re.sub(r"[ \t]{2,}", " ", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    t = re.sub(r"^\s*[-–—]\s*", "", t).strip()
    if t and t[0].islower():
        t = t[0].upper() + t[1:]
    return t


async def fit_check(draft: str, agent: str, mode: str) -> str:
    words = len(draft.split())
    target = LENGTH_TARGETS.get(mode, 120)
    too_long = words > target * 1.5
    too_short = words < 10 and mode != "focus"
    if not (too_long or too_short):
        return draft
    system = (
        f"You are Fit-Checker — a response quality editor. Mode: {mode}, "
        f"target ~{target} words. This draft from {agent} is "
        f"{'too long' if too_long else 'too short'} ({words} words).\n\nDRAFT:\n{draft}\n\n"
        "Rewrite to hit the target length, keeping all key info. Output ONLY the rewrite."
    )
    try:
        return await chat([{"role": "user", "content": "fix this"}], system=system, temperature=0.4, raw=True)
    except Exception:
        return draft


async def apply_mentor(text: str, agent: str, mode: str) -> str:
    cleaned = sanitize_reply(text)
    fitted = await fit_check(cleaned, agent, mode)
    return sanitize_reply(fitted)
