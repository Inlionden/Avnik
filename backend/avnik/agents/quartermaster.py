"""⚔️ Quartermaster — Pacer (Technique Factory) + technique suggestion."""
import re
import json
from ..llm import chat
from ..models import HelmContext, AgentResult, now_ms

PRESETS = {
    "pomodoro":  {"name": "Classic Pomodoro", "workMin": 25, "breakMin": 5, "emoji": "🍅", "desc": "25 min work · 5 min break · long break after 4 cycles", "bestFor": "General focus"},
    "desktime":  {"name": "DeskTime 52/17", "workMin": 52, "breakMin": 17, "emoji": "⏱️", "desc": "52 min work · 17 min break", "bestFor": "Sustained knowledge work"},
    "ultradian": {"name": "Ultradian 90", "workMin": 90, "breakMin": 20, "emoji": "🌊", "desc": "90 min flow block · 20 min recovery", "bestFor": "Deep flow"},
    "two-minute": {"name": "2-Minute Rule", "workMin": 2, "breakMin": 5, "emoji": "⚡", "desc": "Just commit to 2 minutes", "bestFor": "Severe avoidance"},
    "frog":      {"name": "Eat the Frog", "workMin": 60, "breakMin": 15, "emoji": "🐸", "desc": "Hardest task first, 60-min block", "bestFor": "Overwhelm + one priority"},
    "timebox":   {"name": "Timeboxing", "workMin": 30, "breakMin": 5, "emoji": "📦", "desc": "Fixed 30-min box per task", "bestFor": "Many small tasks"},
}


def _suggest(ctx: HelmContext) -> dict:
    s = ctx.state
    if s.energy < 0.25 or s.mood == "burnt-out":
        return {"slug": "two-minute", **PRESETS["two-minute"]}
    if s.mood == "avoidant":
        return {"slug": "frog", **PRESETS["frog"]}
    if s.energy > 0.8:
        return {"slug": "ultradian", **PRESETS["ultradian"]}
    if s.mood == "focused":
        return {"slug": "desktime", **PRESETS["desktime"]}
    return {"slug": "pomodoro", **PRESETS["pomodoro"]}


async def pacer(ctx: HelmContext) -> AgentResult:
    wants_custom = re.search(r"custom|create|my own|\d+\s*min|minutes", ctx.input.lower())
    if wants_custom:
        system = (
            "You are Pacer — the technique factory. Extract a custom timer from the user's message.\n"
            'Output ONLY JSON: { "name": "...", "workMin": N, "breakMin": N, "reason": "..." }'
        )
        try:
            raw = await chat(ctx.messages, system=system, temperature=0.3, raw=True)
            parsed = json.loads(raw[raw.find("{"): raw.rfind("}") + 1])
            return AgentResult(
                text=f"⚙️ Created **{parsed['name']}** ({parsed['workMin']}/{parsed['breakMin']}min) and registered it as a tool. {parsed.get('reason', '')} Ready to start?",
                agent="pacer",
                sideEffects=[{"ts": now_ms(), "type": "technique_created", "source": "active", "value": parsed}],
            )
        except Exception:
            pass

    best = _suggest(ctx)
    return AgentResult(
        text=f"{best['emoji']} Recommending **{best['name']}** ({best['workMin']}/{best['breakMin']}min) — {best['desc']}. Best for: {best['bestFor']}. Ready to start?",
        agent="pacer",
        sideEffects=[{"ts": now_ms(), "type": "technique_suggested", "source": "active",
                      "value": {"name": best["slug"], "workMin": best["workMin"], "breakMin": best["breakMin"]}}],
    )
