"""CurrentState helpers — the agent network's nervous system.

Pure functions, faithful port of lib/agents/state.ts.
"""
import re
from .models import CurrentState, AgentTrailEntry, now_ms


def infer_mood_from_text(text: str) -> str:
    t = text.lower()
    if re.search(r"tired|exhaust|drain|can't|cannot|overwhelm|stuck|lost|burnout|burnt", t):
        return "burnt-out"
    if re.search(r"anxious|worried|scared|nervous|panic|stress|pressure|deadline", t):
        return "anxious"
    if re.search(r"avoid|procrastinat|delay|later|don't feel|not feel|can't start|can't begin", t):
        return "avoidant"
    if re.search(r"ready|let's go|pump|excit|fire|grind|crush|let me|going to", t):
        return "energized"
    if re.search(r"focus|working|in flow|deep work|concentrat|on it", t):
        return "focused"
    return "neutral"


def infer_energy_from_text(text: str) -> float:
    t = text.lower()
    if re.search(r"tired|exhaust|drain|burnt|can't|overwhelm|stuck", t):
        return 0.2
    if re.search(r"energiz|ready|pump|excit|flow|crush", t):
        return 0.9
    if re.search(r"okay|fine|alright|so-so|meh", t):
        return 0.5
    return 0.65


def mood_to_tone(mood: str) -> str:
    if mood in ("anxious", "burnt-out"):
        return "gentle"
    if mood in ("avoidant", "focused"):
        return "stoic"
    return "energetic"


def add_to_trail(state: CurrentState, agent: str, summary: str) -> CurrentState:
    trail = state.agentTrail[-19:] + [AgentTrailEntry(agent=agent, ts=now_ms(), summary=summary[:120])]
    state.agentTrail = trail
    state.lastUpdated = now_ms()
    return state


def regulate(state: CurrentState, user_input: str) -> CurrentState:
    """Step 1 of the loop: infer mood/energy/tone from the latest message."""
    state.mood = infer_mood_from_text(user_input)
    state.energy = infer_energy_from_text(user_input)
    state.toneMode = mood_to_tone(state.mood)
    state.lastUpdated = now_ms()
    return state
