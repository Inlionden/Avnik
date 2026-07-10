"""🔮 Oracle / Root-Cause — the Bayesian diagnostic engine (8 causes).

Faithful port of lib/agents/oracle/root-cause.ts.
"""
import re
import math
from ..llm import chat
from ..models import HelmContext, AgentResult, now_ms

LIKELIHOODS = {
    "delays_important_tasks":        {"fear": 0.85, "perfectionism": 0.40, "burnout": 0.20, "clarity": 0.30, "distraction": 0.15},
    "asks_what_if_not_good_enough":  {"fear": 0.80, "perfectionism": 0.70, "burnout": 0.10, "clarity": 0.20, "distraction": 0.10},
    "rewrites_same_work":            {"fear": 0.30, "perfectionism": 0.90, "burnout": 0.10, "clarity": 0.15, "distraction": 0.10},
    "finishes_small_tasks":          {"fear": 0.20, "perfectionism": 0.55, "burnout": 0.10, "clarity": 0.20, "distraction": 0.30},
    "energy_drops_all_tasks":        {"fear": 0.15, "perfectionism": 0.10, "burnout": 0.90, "clarity": 0.15, "distraction": 0.20},
    "rapid_task_switching":          {"fear": 0.10, "perfectionism": 0.10, "burnout": 0.25, "clarity": 0.20, "distraction": 0.90},
    "doesnt_know_first_step":        {"fear": 0.25, "perfectionism": 0.20, "burnout": 0.15, "clarity": 0.90, "distraction": 0.15},
    "avoids_hard_tasks":             {"fear": 0.85, "perfectionism": 0.40, "burnout": 0.40, "clarity": 0.30, "confidence": 0.70},
    "overplans_underexecutes":       {"overplanning": 0.90, "fear": 0.50, "perfectionism": 0.40, "distraction": 0.20},
    "starts_enthusiastic_quits_fast": {"boredom": 0.85, "distraction": 0.60, "burnout": 0.30, "clarity": 0.25},
}

PRIORS = {
    "fear": 0.15, "perfectionism": 0.15, "burnout": 0.15, "clarity": 0.15,
    "distraction": 0.15, "confidence": 0.10, "overplanning": 0.10, "boredom": 0.05,
}


def run_bayes_update(priors: dict, evidence_key: str) -> dict:
    likelihoods = LIKELIHOODS.get(evidence_key)
    if not likelihoods:
        return priors
    raw = {c: likelihoods.get(c, 0.1) * priors[c] for c in priors}
    total = sum(raw.values())
    n = len(raw)
    return {c: (raw[c] / total if total > 0 else 1 / n) for c in raw}


def infer_evidence_from_text(text: str) -> list:
    t = text.lower()
    signals = []
    def has(p): return re.search(p, t)
    if has(r"avoid|procrastinat|important|big task|put.?(ting|s)? off|haven.?t started"): signals.append("delays_important_tasks")
    if has(r"what if|good enough|not ready|not perfect|too sloppy|has to be perfect|never (good|right|done)"): signals.append("asks_what_if_not_good_enough")
    if has(r"rewrit|re-?do|redo|keep (editing|changing|tweaking)|over and over|can.?t finish"): signals.append("rewrites_same_work")
    if has(r"don.?t know where|first step|unclear|confus|where to start|where to begin"): signals.append("doesnt_know_first_step")
    if has(r"tired|exhaust|burn.?out|drained|no energy|everything|all tasks"): signals.append("energy_drops_all_tasks")
    if has(r"switch|distract|can.?t focus|losing focus|attention|keep checking"): signals.append("rapid_task_switching")
    if has(r"plan|list|organize.*but|planning too much"): signals.append("overplans_underexecutes")
    if has(r"excited.*but|start.*then|interesting.*then quit"): signals.append("starts_enthusiastic_quits_fast")
    if has(r"confidence|can i|am i capable|imposter"): signals.append("avoids_hard_tasks")
    return signals


def _confidence(dist: dict) -> float:
    values = list(dist.values())
    entropy = -sum(p * math.log(p) for p in values if p > 0)
    max_entropy = math.log(len(values)) if values else 1
    return max(0.0, 1 - entropy / max_entropy) if max_entropy else 0.0


async def root_cause(ctx: HelmContext) -> AgentResult:
    current = dict(ctx.beliefs.rootCauses) if (ctx.beliefs and ctx.beliefs.rootCauses) else dict(PRIORS)
    for signal in infer_evidence_from_text(ctx.input):
        current = run_bayes_update(current, signal)

    confidence = _confidence(current)
    top3 = sorted(current.items(), key=lambda kv: kv[1], reverse=True)[:3]
    top3_str = " · ".join(f"{c.replace('_', ' ')}: {round(p * 100)}%" for c, p in top3)
    beliefs = {
        "rootCauses": current,
        "confidence": confidence,
        "traits": (ctx.beliefs.traits if ctx.beliefs else {}),
        "updatedAt": now_ms(),
    }

    system = (
        f"You are Root-Cause — Avnik's Bayesian diagnostic agent.\n"
        f"Current belief update: {top3_str}\nConfidence: {round(confidence * 100)}%\n\n"
        f"Translate this into a 2-sentence human insight. Never say 'you have X disorder.'\n"
        f"Say \"It looks like {top3[0][0].replace('_', ' ')} is the most likely driver right now.\"\n"
        f"Then name ONE intervention matched to the top cause."
    )
    text = await chat(ctx.messages, system=system, temperature=0.65)
    return AgentResult(
        text=text, agent="root-cause", beliefs=beliefs,
        sideEffects=[{"ts": now_ms(), "type": "belief_updated", "source": "active", "value": beliefs}],
    )
