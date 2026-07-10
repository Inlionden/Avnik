"""🧮 Tracker (the Actuary) — always-on Bayesian belief engine.

Runs every turn before routing so every downstream agent gets a fresh
BeliefState. Pure + deterministic (no LLM). Port of lib/agents/tracker.ts.
"""
from typing import Optional, Dict, Tuple, List
from .models import now_ms
from .agents.oracle import run_bayes_update, infer_evidence_from_text, PRIORS


def passive_belief_update(user_input: str, prior_beliefs: Optional[Dict]) -> Optional[Tuple[Dict, List[str]]]:
    signals = infer_evidence_from_text(user_input)
    if not signals:
        return None
    root_causes = dict((prior_beliefs or {}).get("rootCauses", PRIORS))
    for s in signals:
        root_causes = run_bayes_update(root_causes, s)
    from .agents.oracle import confidence as _confidence_fn
    beliefs = {
        "rootCauses": root_causes,
        "confidence": _confidence_fn(root_causes),
        "traits": (prior_beliefs or {}).get("traits", {}),
        "updatedAt": now_ms(),
    }
    return beliefs, signals
