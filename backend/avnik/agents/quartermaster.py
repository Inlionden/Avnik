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


EXTRA_TACTICS = [
    {"name": "WOOP", "bestFor": "Motivation crisis / stuck on WHY", "desc": "Wish → Outcome → Obstacle → Plan. Mental contrasting that actually works."},
    {"name": "Temptation Bundling", "bestFor": "Resistance to a specific recurring task", "desc": "Pair the dreaded task with something you enjoy."},
    {"name": "Anti-Perfection Mode", "bestFor": "Perfectionism paralysis", "desc": "Deliberately aim for 70% quality. Ship the ugly draft."},
    {"name": "5-Minute Bargain", "bestFor": "Starting resistance / can't begin", "desc": "Commit to just 5 minutes. No commitment beyond that."},
    {"name": "Daily Anchor", "bestFor": "Inconsistency / habit building", "desc": "Same time + place + ritual every session. Removes decision cost."},
]


async def core(ctx: HelmContext) -> AgentResult:
    """Quartermaster tactics agent — picks the right technique from 12+ options."""
    s = ctx.state
    presets = "\n".join(f"{p['emoji']} **{p['name']}** ({p['workMin']}/{p['breakMin']}min): {p['desc']} | Best for: {p['bestFor']}" for p in PRESETS.values())
    extras = "\n".join(f"🎯 **{t['name']}**: {t['desc']} | Best for: {t['bestFor']}" for t in EXTRA_TACTICS)
    active = sum(1 for t in ctx.tasks if t.status != "done")
    system = (
        f"You are Quartermaster — Avnik's tactics agent. Pick the RIGHT technique for right NOW — "
        f"a decision, not a list.\n\nState: mood={s.mood} energy={round(s.energy*100)}% phase={s.phase} "
        f"| active tasks={active}\n\nAvailable:\n{presets}\n{extras}\n\n"
        "Pick 1 (2 if genuinely complementary). Output: 1) name + why it fits NOW (1 sentence), "
        "2) exact setup: timer + first-60-seconds action, 3) optional fallback if it breaks down."
    )
    text = await chat(ctx.messages, system=system, temperature=0.7)
    return AgentResult(text=text, agent="quartermaster")


async def contractor(ctx: HelmContext) -> AgentResult:
    """🤝 Contractor — the Ulysses Contract. Pre-commit / renegotiate / blameless post-mortem."""
    now = now_ms()
    t = ctx.input.lower()
    is_missed = re.search(r"miss|didn't|did not|failed|couldn't", t)
    is_renegotiate = re.search(r"renegotiate|can't|change|scale.?down|less", t)

    if is_missed:
        system = (
            "You are Contractor — the Ulysses Contract agent. A commitment was missed. Run a "
            "BLAMELESS post-mortem: 1) WHAT HAPPENED (neutral), 2) ROOT CAUSE (1 sentence), "
            '3) LEARNING (one specific change). Then offer: "Ready to make a new smaller commitment '
            'right now?" Tone: warm, not punishing. Failure is data.'
        )
        text = await chat(ctx.messages, system=system, temperature=0.72)
        return AgentResult(text=text, agent="contractor",
                           sideEffects=[{"ts": now, "type": "contract_missed", "source": "active", "value": {"input": ctx.input}}])

    if is_renegotiate:
        system = (
            "You are Contractor — negotiating a scope reduction. Motivation dropped mid-commitment; "
            'this is normal. Respond: "Okay. New commitment: [smaller scope]. Can you do that in the '
            'next [shorter time]?" Make it feel like a fresh start. Ulysses renegotiates when the wind changes.'
        )
        text = await chat(ctx.messages, system=system, temperature=0.75)
        return AgentResult(text=text, agent="contractor")

    system = (
        "You are Contractor — the Ulysses Contract keeper (named after Ulysses, who resisted the "
        "Sirens by committing ahead). Help the user make a SPECIFIC, ACHIEVABLE contract:\n"
        "Task / Scope (minimum acceptable version) / Deadline (specific time) / Stakes (optional).\n"
        "Output as:\n📜 ULYSSES CONTRACT\nTask: ___\nScope: ___\nDeadline: ___\nStakes: ___\n"
        'Then: "Contract sealed. I\'ll check in at [deadline]. You can always renegotiate if needed."'
    )
    text = await chat(ctx.messages, system=system, temperature=0.7)
    return AgentResult(text=text, agent="contractor",
                       sideEffects=[{"ts": now, "type": "contract_created", "source": "active", "value": {"input": ctx.input}}])


def _eisenhower(task) -> str:
    urgent = False
    if task.deadline:
        try:
            from datetime import datetime
            urgent = (datetime.fromisoformat(task.deadline.replace("Z", "+00:00")).timestamp() * 1000 - now_ms()) < 2 * 86_400_000
        except Exception:
            urgent = False
    important = (task.importance or 50) >= 65
    if urgent and important: return "do-now"
    if not urgent and important: return "schedule"
    if urgent and not important: return "delegate"
    return "drop"


async def triage(ctx: HelmContext) -> AgentResult:
    """🎯 Triage — Eisenhower Matrix + TMT."""
    tasks = [t for t in ctx.tasks if t.status != "done"]
    quads = {q: [t for t in tasks if _eisenhower(t) == q] for q in ("do-now", "schedule", "delegate", "drop")}
    labels = {"do-now": "🔴 DO NOW", "schedule": "🟡 SCHEDULE", "delegate": "🔵 DELEGATE", "drop": "⚪ DROP"}
    summary = "\n".join(
        f'{labels[q]} ({len(items)}): ' + ", ".join(f'"{t.title}"' for t in items)
        for q, items in quads.items() if items
    ) or "No tasks to triage."
    s = ctx.state
    system = (
        f"You are Triage — Avnik's task prioritization agent (Eisenhower Matrix + TMT).\n\n"
        f"Current triage:\n{summary}\n\nMood: {s.mood} | Energy: {round(s.energy*100)}%\n\n"
        "Respond: 1) ONE task to start right now + why (1 sentence), 2) quick ranking confirmation "
        "(3 lines max), 3) flag anything misclassified. Be decisive."
    )
    text = await chat(ctx.messages, system=system, temperature=0.6)
    return AgentResult(text=text, agent="triage")


async def starter(ctx: HelmContext) -> AgentResult:
    """🚀 Starter — 'Just Start It For Me.' Does the first real step autonomously."""
    top_task = next((t for t in ctx.tasks if t.status != "done"), None)
    task_name = top_task.title if top_task else "your current task"
    s = ctx.state
    system = (
        f'You are Starter — Avnik\'s autonomous execution agent. Your one job: BREAK THE BLANK PAGE. '
        f'You don\'t suggest starting. You START for them.\n\nTask: "{task_name}"\n'
        f"User's state: mood={s.mood}, energy={round(s.energy*100)}%\n\n"
        "Do ONE of these (pick the most fitting): writing → draft the opening 3 sentences; "
        "coding → function signature + first 3 lines; big project → 5 numbered sub-tasks with time "
        "estimates; email → write the entire first draft; studying → generate 5 key questions.\n\n"
        'Then say: "There. You\'re already 10% done. Keep going for just 5 more minutes." '
        "Never give instructions for how to start. Just START."
    )
    text = await chat(ctx.messages, system=system, temperature=0.8)
    return AgentResult(text=text, agent="starter",
                       sideEffects=[{"ts": now_ms(), "type": "just_start_triggered", "source": "active",
                                    "taskId": top_task.id if top_task else None}])


def _detect_qm_mode(t: str) -> str:
    t = t.lower()
    if re.search(r"prioriti|triage|rank|order|most important|what first", t): return "triage"
    if re.search(r"ulysses|contract|commit|promise|by \d|done by|pledge", t): return "contract"
    if re.search(r"just start|do it for me|begin|first step|blank page|draft|outline", t): return "start"
    if re.search(r"pomodoro|timer|technique|focus session|work for|min|custom|create technique", t): return "technique"
    return "core"


async def quartermaster(ctx: HelmContext) -> AgentResult:
    """⚔️ Quartermaster Lead — routes to Triage / Contractor / Starter / Pacer / core tactics."""
    mode = _detect_qm_mode(ctx.input)
    if mode == "triage": return await triage(ctx)
    if mode == "contract": return await contractor(ctx)
    if mode == "start": return await starter(ctx)
    if mode == "technique": return await pacer(ctx)
    return await core(ctx)
