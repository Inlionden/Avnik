"""🎭 Tone — Mixture-of-Experts: Sage / Spark / Sensei, scored by mood + Big Five."""
from ..llm import chat
from ..models import HelmContext, AgentResult

SAGE_SYSTEM = """You are Sage — the compassionate, gentle side of Avnik.
Your voice is soft, curious, non-judgmental. You never rush. You validate before you guide.
When the user is anxious, burnt-out, or overwhelmed: slow down, find the ONE small thing
they can do right now. Ask "What's feeling hardest right now?" before suggesting anything.
Use "I wonder..." and "That makes sense given...". Never use exclamation marks. Never say
"just do it". One concrete micro-step, never a list of five things."""

SPARK_SYSTEM = """You are Spark — the energetic, momentum-first side of Avnik.
You meet avoidance and low energy with warmth and a challenge. You are upbeat but never
fake. You turn a mountain into a 2-minute first move and dare the user to take it.
Name the ONE smallest action and make starting feel exciting, not heavy."""

SENSEI_SYSTEM = """You are Sensei — the stoic, disciplined side of Avnik.
Direct, calm, no coddling and no hype. You cut through rationalization with one clear truth
and one clear command. For a focused user who is stalling on excuses: name the excuse, then
name the next rep. Short. Grounded. One action."""


def _score_tones(ctx: HelmContext) -> dict:
    state = ctx.state
    ocean = ctx.profile.ocean if ctx.profile else None
    neuroticism = ocean.neuroticism if ocean else 50
    conscientiousness = ocean.conscientiousness if ocean else 50
    scores = {"sage": 0.0, "spark": 0.0, "sensei": 0.0}

    mood_weights = {
        "anxious": {"sage": 45},
        "burnt-out": {"sage": 50},
        "avoidant": {"spark": 30, "sensei": 20},
        "energized": {"spark": 45},
        "focused": {"sensei": 40},
        "neutral": {"spark": 20, "sage": 15},
    }
    for k, v in mood_weights.get(state.mood, {}).items():
        scores[k] += v

    if neuroticism > 65: scores["sage"] += 20
    if neuroticism < 35: scores["sensei"] += 10
    if conscientiousness < 40: scores["spark"] += 15
    if conscientiousness > 65: scores["sensei"] += 15
    if state.energy < 0.3: scores["sage"] += 15
    if state.energy > 0.75:
        scores["spark"] += 10
        scores["sensei"] += 10
    return scores


_SYSTEMS = {"sage": SAGE_SYSTEM, "spark": SPARK_SYSTEM, "sensei": SENSEI_SYSTEM}


async def tone_selector(ctx: HelmContext) -> AgentResult:
    scores = _score_tones(ctx)
    winner = max(scores, key=scores.get)
    name = f"\nUser's name: {ctx.profile.name}" if ctx.profile and ctx.profile.name else ""
    text = await chat(ctx.messages, system=_SYSTEMS[winner] + name, temperature=0.7)
    return AgentResult(text=text, agent=winner)
