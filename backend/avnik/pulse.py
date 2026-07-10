"""💓 Pulse — deterministic always-on scan (no LLM). Port of app/api/pulse/route.ts."""
from datetime import datetime, timezone
from .models import now_ms


def run_pulse(tasks: list, calendar: list, events: list, hour: int) -> list:
    now = now_ms()
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    nudges = []

    # 👁️ Sentinel: a calendar block starts within the next hour.
    for c in calendar:
        if c.get("date") != today:
            continue
        delta = c.get("hour", -99) - hour
        if delta in (0, 1):
            h = c.get("hour", 0)
            when = f"{h-12}pm" if h > 12 else f"{h}am"
            nudges.append({
                "id": f"cal_{c.get('id')}", "agent": "sentinel",
                "text": (f"Now on your calendar: \"{c.get('title')}\". Start it?" if delta == 0
                         else f"Coming up at {when}: \"{c.get('title')}\"."),
                "href": "/calendar", "urgency": "high" if delta == 0 else "medium",
            })

    # ⭐ North Star: overdue tasks.
    overdue = [t for t in tasks if t.get("deadline") and t.get("status") != "done"
               and _to_ms(t["deadline"]) < now]
    if overdue:
        title = overdue[0].get("title", "a task")
        nudges.append({
            "id": f"overdue_{overdue[0].get('id')}", "agent": "north-star",
            "text": f"\"{title}\" is past its deadline. A 2-minute start beats a perfect plan.",
            "href": "/coach?mode=focus&q=" + _enc(f"Just start it for me: {title}"), "urgency": "high",
        })

    # ⚔️ Quartermaster: task overload.
    open_tasks = [t for t in tasks if t.get("status") == "todo"]
    if len(open_tasks) >= 6:
        nudges.append({
            "id": f"triage_{len(open_tasks)}", "agent": "quartermaster",
            "text": f"{len(open_tasks)} open tasks. Let Triage cut it to the ONE that matters.",
            "href": "/coach?mode=plan&q=" + _enc("Triage everything on my plate"), "urgency": "medium",
        })

    # 📜 Chronicler: evening with zero completions.
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0).timestamp() * 1000
    done_today = sum(1 for e in events if e.get("type") == "task_done" and e.get("ts", 0) > today_start)
    if 18 <= hour <= 23 and done_today == 0 and tasks:
        nudges.append({
            "id": f"evening_{today}", "agent": "chronicler",
            "text": "Nothing crossed off yet today. One small win before you close the day?",
            "href": "/coach?mode=focus&q=" + _enc("Give me one 5-minute win right now"), "urgency": "low",
        })

    # 🗓️ Day-Planner: unplanned morning.
    today_cal = [c for c in calendar if c.get("date") == today]
    if 7 <= hour <= 11 and not today_cal and any(t.get("status") == "todo" for t in tasks):
        nudges.append({
            "id": f"plan_{today}", "agent": "day-planner",
            "text": "Today is unplanned. 30 seconds with me and it won't be.",
            "href": "/coach?mode=plan&q=" + _enc("Plan my day"), "urgency": "medium",
        })

    rank = {"high": 0, "medium": 1, "low": 2}
    nudges.sort(key=lambda n: rank[n["urgency"]])
    return nudges[:3]


def _to_ms(iso: str) -> float:
    try:
        return datetime.fromisoformat(iso.replace("Z", "+00:00")).timestamp() * 1000
    except Exception:
        return float("inf")


def _enc(s: str) -> str:
    from urllib.parse import quote
    return quote(s)
