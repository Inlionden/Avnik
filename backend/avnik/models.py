"""Pydantic models mirroring the TypeScript shared contract (lib/types.ts).

Loose where the TS uses `unknown` (Event.value); extra fields allowed so the
frontend and backend never break each other on a new field.
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
import time


def now_ms() -> int:
    return int(time.time() * 1000)


class Message(BaseModel):
    role: str
    content: str
    agent: Optional[str] = None


class Task(BaseModel, extra="allow"):
    id: str
    title: str
    status: str = "todo"
    importance: Optional[float] = None
    deadline: Optional[str] = None
    createdAt: Optional[int] = None
    goalId: Optional[str] = None


class Event(BaseModel, extra="allow"):
    ts: int
    type: str
    source: str  # "active" | "passive"
    taskId: Optional[str] = None
    value: Optional[Any] = None


class Ocean(BaseModel, extra="allow"):
    openness: float = 50
    conscientiousness: float = 50
    extraversion: float = 50
    agreeableness: float = 50
    neuroticism: float = 50


class Profile(BaseModel, extra="allow"):
    name: Optional[str] = None
    ocean: Ocean = Field(default_factory=Ocean)
    onboarded: bool = False


class BeliefState(BaseModel, extra="allow"):
    rootCauses: Dict[str, float] = Field(default_factory=dict)
    confidence: float = 0.0
    traits: Dict[str, float] = Field(default_factory=dict)
    updatedAt: int = Field(default_factory=now_ms)


class AgentTrailEntry(BaseModel):
    agent: str
    ts: int
    summary: str


class CurrentState(BaseModel, extra="allow"):
    mood: str = "neutral"
    energy: float = 0.7
    toneMode: str = "gentle"
    activeTaskId: Optional[str] = None
    sessionStart: int = Field(default_factory=now_ms)
    phase: str = "idle"
    urgencyTop3: List[str] = Field(default_factory=list)
    agentTrail: List[AgentTrailEntry] = Field(default_factory=list)
    lastUpdated: int = Field(default_factory=now_ms)


class ChatRequest(BaseModel, extra="allow"):
    messages: List[Message]
    chatMode: Optional[str] = "chat"
    provider: Optional[str] = None
    profile: Optional[Profile] = None
    beliefs: Optional[BeliefState] = None
    tasks: List[Task] = Field(default_factory=list)
    events: List[Event] = Field(default_factory=list)
    currentState: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    reply: str
    agent: str
    route: str
    state: Dict[str, Any]
    sideEffects: List[Dict[str, Any]] = Field(default_factory=list)
    beliefs: Optional[Dict[str, Any]] = None


class AgentResult(BaseModel):
    """What every agent returns internally."""
    text: str
    agent: str
    sideEffects: List[Dict[str, Any]] = Field(default_factory=list)
    beliefs: Optional[Dict[str, Any]] = None


class HelmContext(BaseModel, extra="allow"):
    """Superset context every agent receives."""
    input: str
    messages: List[Dict[str, Any]]
    profile: Optional[Profile] = None
    beliefs: Optional[BeliefState] = None
    tasks: List[Task] = Field(default_factory=list)
    events: List[Event] = Field(default_factory=list)
    state: CurrentState = Field(default_factory=CurrentState)
