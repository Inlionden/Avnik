"""⚙️ Regulator — infers mood/energy/phase from the latest turn. Runs first, always.

Faithful port of lib/agents/regulator.ts.
"""
import re
from .models import CurrentState
from .state import infer_mood_from_text, infer_energy_from_text, mood_to_tone


def _infer_phase(user_input: str, current_phase: str) -> str:
    t = user_input.lower()
    if re.search(r"break|pause|rest|lunch|walk", t):
        return "break"
    if re.search(r"plan|what should|priorit|what next|review", t):
        return "planning"
    if re.search(r"working|focusing|doing|started|in flow", t):
        return "working"
    return current_phase or "idle"


def run_regulator(state: CurrentState, user_input: str) -> CurrentState:
    state.mood = infer_mood_from_text(user_input)
    state.energy = infer_energy_from_text(user_input)
    state.toneMode = mood_to_tone(state.mood)
    state.phase = _infer_phase(user_input, state.phase)
    return state
