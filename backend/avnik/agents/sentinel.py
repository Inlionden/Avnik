"""👁️ Sentinel — perception agent. Sleep-Estimator, Context-Reader, Silence-Watcher.

Faithful port of lib/agents/sentinel/*. The two data agents (sleep, silence) are
deterministic; the LLM only narrates. No phone sensors — inferred from the event log.
"""
import re
from datetime import datetime
from ..llm import chat
from ..models import HelmContext, AgentResult, now_ms


# ── Sleep-Estimator ──────────────────────────────────────────────────────────
def estimate_sleep_from_gap(events: list):
    ev = sorted(events, key=lambda e: e.ts, reverse=True)
    last_open = next((e for e in ev if e.type == "app_open"), None)
    if not last_open:
        return None
    closes_before = [e for e in ev if e.type == "app_close" and e.ts < last_open.ts]
    if not closes_before:
        return None
    last_close = closes_before[0]
    gap_hours = (last_open.ts - last_close.ts) / 3_600_000
    close_hour = datetime.fromtimestamp(last_close.ts / 1000).hour
    is_night = close_hour >= 21 or close_hour <= 7
    if not is_night or gap_hours < 3 or gap_hours > 13:
        return None
    hours = round(gap_hours * 10) / 10
    quality = "good" if hours >= 7 else "fair" if hours >= 5.5 else "poor"
    return {
        "estimatedHours": hours,
        "bedtime": datetime.fromtimestamp(last_close.ts / 1000).strftime("%H:%M"),
        "wakeTime": datetime.fromtimestamp(last_open.ts / 1000).strftime("%H:%M"),
        "quality": quality, "confidence": "inferred",
    }


async def sleep_estimator(ctx: HelmContext) -> AgentResult:
    sleep = estimate_sleep_from_gap(ctx.events)
    if not sleep:
        return AgentResult(
            text="I don't have a clear read on last night's sleep yet — I infer it from when you "
                 "close the app at night and reopen it in the morning. Tell me roughly how many hours "
                 "you got and I'll factor it into today's plan.",
            agent="sleep-estimator")
    quality_text = {
        "poor": f"⚠️ Only {sleep['estimatedHours']}h — below the 7h minimum. Today's plan should be lighter.",
        "fair": f"{sleep['estimatedHours']}h. Okay but not great. Energy will likely dip around 3pm.",
        "good": f"✅ {sleep['estimatedHours']}h — well rested. Good day to tackle your hardest task first.",
    }[sleep["quality"]]
    return AgentResult(
        text=f"🌙 Sleep inferred: you closed the app at {sleep['bedtime']}, reopened at {sleep['wakeTime']}. {quality_text}",
        agent="sleep-estimator",
        sideEffects=[{"ts": now_ms(), "type": "sleep_inferred", "source": "passive", "value": sleep}])


# ── Context-Reader ───────────────────────────────────────────────────────────
def _zone_inference(zone: str, hour: int, dur: int):
    if zone == "eat":
        if dur < 5:
            return None
        nxt = ("Post-meal energy dip coming in ~30 min — schedule your easiest tasks next, save deep work for 3pm."
               if hour < 14 else "Good dinner break. Wind down with a review session, not new hard tasks.")
        return {"inference": f"Looks like you ate (~{dur} min at dining area around {hour}:00)", "nextSuggestion": nxt}
    if zone == "study":
        return {"inference": f"At your study spot", "nextSuggestion": "Optimal focus environment. Start your hardest task now."}
    if zone == "office":
        nxt = "Deep work window — block distractions." if hour < 12 else "Post-lunch: good for meetings and reviews."
        return {"inference": "At the office", "nextSuggestion": nxt}
    if zone == "sleep":
        return {"inference": "You're in the sleep zone", "nextSuggestion": "Log today's progress and set tomorrow's first task."}
    if zone == "bath":
        return {"inference": "Bathroom break", "nextSuggestion": "Good micro-break. Resume with a 2-min review."}
    if zone == "shop":
        return {"inference": "Running errands", "nextSuggestion": "Schedule your re-entry: 5 min review then pick up where you stopped."}
    return None


async def context_reader(ctx: HelmContext) -> AgentResult:
    place_ev = next((e for e in reversed(ctx.events) if e.type in ("place_enter", "place_stay")), None)
    if not place_ev or not place_ev.value:
        return AgentResult(text="No location context yet. Define your places in Settings → Places to enable context awareness.",
                           agent="context-reader")
    v = place_ev.value if isinstance(place_ev.value, dict) else {}
    hour = v.get("hour", datetime.fromtimestamp(place_ev.ts / 1000).hour)
    inf = _zone_inference(v.get("zoneType", "other"), hour, v.get("durationMin", 0))
    if not inf:
        return AgentResult(text="Context noted.", agent="context-reader")
    return AgentResult(text=f"📍 {inf['inference']}. {inf['nextSuggestion']}", agent="context-reader",
                       sideEffects=[{"ts": now_ms(), "type": "context_inferred", "source": "passive", "value": inf}])


# ── Silence-Watcher ──────────────────────────────────────────────────────────
def _journaling_baseline(events: list):
    je = sorted([e for e in events if e.type in ("journal", "mood_checkin", "app_open")], key=lambda e: e.ts)
    if len(je) < 3:
        return {"avgGapHours": 24.0, "count": len(je)}
    gaps = []
    for i in range(1, min(len(je), 10)):
        gap = (je[i].ts - je[i - 1].ts) / 3_600_000
        if gap < 48:
            gaps.append(gap)
    avg = sum(gaps) / len(gaps) if gaps else 24.0
    return {"avgGapHours": avg, "count": len(je)}


async def silence_watcher(ctx: HelmContext) -> AgentResult:
    events = ctx.events
    if not events:
        return AgentResult(text="No activity logged yet.", agent="silence-watcher")
    baseline = _journaling_baseline(events)
    last = max(e.ts for e in events)
    hours_since = (now_ms() - last) / 3_600_000
    if hours_since < baseline["avgGapHours"] * 2:
        return AgentResult(
            text=f"Activity normal. Last seen {hours_since:.1f}h ago (baseline {baseline['avgGapHours']:.1f}h).",
            agent="silence-watcher")
    silent = round(hours_since)
    return AgentResult(
        text=(f"I've noticed you've been quieter than usual ({silent}h vs your typical "
              f"{baseline['avgGapHours']:.0f}h). You don't have to write anything. If you'd like, just tap "
              "one word: 😄 Great · 😐 Okay · 😔 Stressed · 😴 Tired · 😟 Anxious — or simply skip."),
        agent="silence-watcher",
        sideEffects=[{"ts": now_ms(), "type": "silence_detected", "source": "passive",
                     "value": {"silentHours": silent, "baseline": baseline["avgGapHours"]}}])


def _detect_sentinel_mode(t: str) -> str:
    t = t.lower()
    if re.search(r"sleep|tired|woke|slept|rest|night", t): return "sleep"
    if re.search(r"where|place|dining|eating|office|home|gym|library", t): return "context"
    if re.search(r"quiet|silent|not been|miss|check.?in", t): return "silence"
    return "fuse"


async def sentinel(ctx: HelmContext) -> AgentResult:
    """👁️ Sentinel Lead — routes to sleep / context / silence, or fuses all three."""
    mode = _detect_sentinel_mode(ctx.input)
    if mode == "sleep": return await sleep_estimator(ctx)
    if mode == "context": return await context_reader(ctx)
    if mode == "silence": return await silence_watcher(ctx)

    results = [await sleep_estimator(ctx), await context_reader(ctx), await silence_watcher(ctx)]
    meaningful = next((r for r in results if not any(x in r.text for x in ("No ", " yet", "normal"))), results[0])
    meaningful.agent = "sentinel"
    return meaningful
