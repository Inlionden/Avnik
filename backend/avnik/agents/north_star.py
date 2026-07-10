"""⭐ North Star — TMT prioritization + Day-Planner (auto-creates calendar blocks)."""
import re
import json
import time
from datetime import datetime, timezone, timedelta
from ..llm import chat
from ..models import HelmContext, AgentResult, now_ms


def _tmt_score(task, now_ms_val: float, impulsiveness: float) -> float:
    E = 0.7
    V = task.importance if task.importance is not None else 50
    if task.deadline:
        try:
            deadline_ms = datetime.fromisoformat(task.deadline.replace("Z", "+00:00")).timestamp() * 1000
        except Exception:
            deadline_ms = now_ms_val + 7 * 86_400_000
    else:
        deadline_ms = now_ms_val + 7 * 86_400_000
    D = max(0.5, (deadline_ms - now_ms_val) / 86_400_000)
    return (E * V) / (impulsiveness * D)


def _detect_plan_intent(t: str) -> bool:
    t = t.lower()
    plan_verb = re.search(r"\b(plan|schedule|map out|lay out|organi[sz]e|block ?out|time ?box)\b", t)
    day_ref = re.search(r"\b(day|today|tomorrow|morning|afternoon|evening|week|tasks?|schedule|to-?dos?)\b", t)
    return bool(re.search(r"plan my day|plan out my|schedule my day", t) or (plan_verb and day_ref))


async def day_planner(ctx: HelmContext) -> AgentResult:
    now = now_ms()
    current_hour = datetime.now().hour
    system = (
        f"You are Day-Planner — Avnik's scheduling agent. Extract concrete tasks and lay them "
        f"on a timeline.\nRules: it is {current_hour}:00; schedule AFTER this hour, within 7-21. "
        f"Hard/important work in peak hours. importance 0-100. durationMin realistic (25/50/90). "
        f"Max 6 tasks; don't invent work.\nOutput ONLY valid JSON:\n"
        '{ "tasks": [ { "title": "...", "importance": 85, "hour": 10, "durationMin": 50 } ], "note": "one encouraging sentence" }'
    )
    parsed = None
    for attempt in range(2):
        try:
            raw = await chat(ctx.messages, system=system, temperature=0.4 if attempt == 0 else 0.2, raw=True)
            js = raw[raw.find("{"): raw.rfind("}") + 1]
            candidate = json.loads(js)
            if isinstance(candidate.get("tasks"), list):
                parsed = candidate
                break
        except Exception:
            continue
    if not parsed:
        return AgentResult(text="Tell me what's on your plate today — meetings, study, errands — and I'll lay it out on your timeline.", agent="day-planner")

    tasks = parsed["tasks"][:6]
    if not tasks:
        return AgentResult(text='I didn\'t catch any specific tasks. Try: "study chapter 4, reply to 3 emails, prep for the meeting."', agent="day-planner")

    is_tomorrow = bool(re.search(r"\btomorrow\b", ctx.input, re.IGNORECASE))
    target = datetime.now(timezone.utc) + (timedelta(days=1) if is_tomorrow else timedelta())
    date_str = target.strftime("%Y-%m-%d")

    side_effects = []
    lines = []
    for i, t in enumerate(tasks):
        tid = f"task_{now}_{i}"
        hour = int(t.get("hour", 9))
        dur = int(t.get("durationMin", 50))
        side_effects.append({"ts": now, "type": "task_created", "source": "active", "taskId": tid,
                             "value": {"id": tid, "title": t.get("title", "Task"), "importance": t.get("importance", 50),
                                       "status": "todo", "createdAt": now}})
        if not is_tomorrow:
            side_effects.append({"ts": now, "type": "dayplan_slot", "source": "active", "taskId": tid,
                                 "value": {"hour": hour, "durationMin": dur}})
        side_effects.append({"ts": now, "type": "calendar_event", "source": "active", "taskId": tid,
                             "value": {"id": f"cal_{now}_{i}", "date": date_str, "hour": hour, "durationMin": dur,
                                       "title": t.get("title", "Task"), "taskId": tid, "source": "agent", "createdAt": now}})
        ampm = "12pm" if hour == 12 else (f"{hour}am" if hour < 12 else f"{hour - 12}pm")
        lines.append(f"• {ampm} — {t.get('title', 'Task')} ({dur}m)")

    day_word = "tomorrow" if is_tomorrow else "today"
    text = (f"📅 Planned {day_word} — {len(tasks)} task{'s' if len(tasks) > 1 else ''} on your Calendar:\n\n"
            + "\n".join(lines) + (f"\n\n{parsed.get('note')}" if parsed.get("note") else ""))
    return AgentResult(text=text, agent="day-planner", sideEffects=side_effects)


async def goal_keeper(ctx: HelmContext) -> AgentResult:
    goals = [t for t in ctx.tasks if t.goalId is None and (t.importance or 0) >= 80]
    goal_list = "\n".join(f'{i+1}. "{g.title}"' for i, g in enumerate(goals)) or "No goals set yet."
    system = (
        "You are Goal-Keeper — guardian of the Red Book (the user's life goals): what they want "
        f"to BECOME, not just tasks to complete.\n\nCurrent Red Book goals:\n{goal_list}\n\n"
        'If adding a goal: extract it clearly, ask "What does achieving this make you?" '
        'Format any new goal as: GOAL: "[title]" | WHY: "[deeper reason]". Be reverent — these matter.'
    )
    text = await chat(ctx.messages, system=system, temperature=0.75)
    return AgentResult(text=text, agent="goal-keeper")


async def meaning_weaver(ctx: HelmContext) -> AgentResult:
    tasks = [t for t in ctx.tasks if t.status != "done"][:5]
    task_list = "\n".join(
        f'- "{t.title}"' + (f" [linked to goal {t.goalId}]" if t.goalId else " [UNLINKED]") for t in tasks
    ) or "No tasks yet."
    system = (
        "You are Meaning-Weaver — connect tasks to what the user actually cares about. Every task "
        "without meaning is friction; every task WITH meaning becomes fuel (Temporal Motivation "
        f"Theory: low VALUE is fixed by connecting to a North Star).\n\nUnlinked tasks:\n{task_list}\n\n"
        "For each: 1) suggest which goal it serves, 2) write one visceral sentence — "
        '"Finishing [task] means you\'re one step closer to [identity goal]." Use their own language.'
    )
    text = await chat(ctx.messages, system=system, temperature=0.8)
    return AgentResult(text=text, agent="meaning-weaver")


def _detect_ns_mode(t: str) -> str:
    t = t.lower()
    if re.search(r"goal|red book|become|want to be|life|mission|vision", t):
        return "goals"
    if re.search(r"meaning|why|purpose|connect|matter|motivation", t):
        return "meaning"
    return "priority"


async def north_star(ctx: HelmContext) -> AgentResult:
    if _detect_plan_intent(ctx.input):
        return await day_planner(ctx)

    mode = _detect_ns_mode(ctx.input)
    if mode == "goals":
        return await goal_keeper(ctx)
    if mode == "meaning":
        return await meaning_weaver(ctx)

    now = now_ms()
    tasks = [t for t in ctx.tasks if t.status != "done"]
    conscientiousness = ctx.profile.ocean.conscientiousness if ctx.profile else 50
    impulsiveness = max(1.0, 10 - conscientiousness / 10)
    ranked = sorted(tasks, key=lambda t: _tmt_score(t, now, impulsiveness), reverse=True)

    if not ranked:
        summary = "No tasks yet — ask the user to add their first task."
    else:
        summary = "\n".join(
            f"{i+1}. \"{t.title}\" | importance {t.importance or 50}"
            for i, t in enumerate(ranked[:6])
        )
    system = (
        "You are North Star — Avnik's planning agent using Temporal Motivation Theory "
        "M = (Expectancy × Value) / (Impulsiveness × Delay). You just scored the user's tasks.\n"
        "1. Name the #1 task to do RIGHT NOW and why (1 sentence).\n"
        "2. Give a 3-step micro-plan for the next 90 minutes.\n"
        f"Task ranking:\n{summary}\nBe specific, use task names, be concise."
    )
    text = await chat(ctx.messages, system=system, temperature=0.65)
    urgency_top3 = [t.id for t in ranked[:3]]
    return AgentResult(
        text=text, agent="north-star",
        sideEffects=[{"ts": now, "type": "priority_update", "source": "active", "taskId": tid} for tid in urgency_top3],
    )
