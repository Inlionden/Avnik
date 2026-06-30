// ⚡ Act tools — create tasks, schedule, draft artifacts
import type { Event, Task } from "@/lib/types";

let _nextId = Date.now();
const genId = () => `task_${_nextId++}`;

// ── Task Creation ──────────────────────────────────────────────────────────
export function createTask(title: string, deadline?: string, importance = 50): Task {
  return {
    id: genId(),
    title,
    deadline,
    importance,
    status: "todo",
    createdAt: Date.now(),
  };
}

// ── Task Breakdown ─────────────────────────────────────────────────────────
export function breakDownTask(task: Task, subTitles: string[]): Task[] {
  return subTitles.map((title) => ({
    ...createTask(title, task.deadline, Math.round((task.importance ?? 50) * 0.8)),
    goalId: task.goalId,
  }));
}

// ── TMT Prioritization — uses importance as proxy for Value, deadline for Delay
export function prioritizeTasks(tasks: Task[], impulsiveness = 0.5): Task[] {
  return [...tasks].sort((a, b) => {
    const daysA = a.deadline
      ? Math.max(1, (new Date(a.deadline).getTime() - Date.now()) / 86_400_000)
      : 30;
    const daysB = b.deadline
      ? Math.max(1, (new Date(b.deadline).getTime() - Date.now()) / 86_400_000)
      : 30;
    const tmtA = (a.importance ?? 50) / (impulsiveness * daysA);
    const tmtB = (b.importance ?? 50) / (impulsiveness * daysB);
    return tmtB - tmtA;
  });
}

// ── Schedule Day ───────────────────────────────────────────────────────────
export type Block = { startHour: number; endHour: number; task: Task; label: string };

export function scheduleDay(tasks: Task[], workStart = 9, workEnd = 18): Block[] {
  const sorted = prioritizeTasks(tasks.filter(t => t.status === "todo"));
  const blocks: Block[] = [];
  let hour = workStart;

  for (const task of sorted.slice(0, 5)) {
    const duration = (task.importance ?? 50) >= 80 ? 2 : 1;
    if (hour + duration > workEnd) break;
    blocks.push({
      startHour: hour,
      endHour: hour + duration,
      task,
      label: `${hour}:00 – ${hour + duration}:00 · ${task.title}`,
    });
    hour += duration + 0.25;
  }

  return blocks;
}

// ── Draft Artifact ─────────────────────────────────────────────────────────
export type ArtifactType = "email" | "opening-sentences" | "sub-tasks" | "study-questions" | "code-stub";

export function draftArtifact(type: ArtifactType, context: string): string {
  const preambles: Record<ArtifactType, string> = {
    "email":             `Draft professional email:\nSubject: [Re: ${context}]\n\nHi [Name],\n\n`,
    "opening-sentences": `Here are 3 opening sentences for "${context}":\n\n1. `,
    "sub-tasks":         `Sub-tasks for "${context}":\n\n- [ ] `,
    "study-questions":   `Key questions to understand "${context}":\n\n1. What is the core idea?\n2. `,
    "code-stub":         `// ${context}\nfunction ${context.replace(/\s+/g, "_").toLowerCase()}() {\n  // TODO\n}\n`,
  };
  return preambles[type] ?? `Starting "${context}":\n\n`;
}

// ── Schedule Nudge ─────────────────────────────────────────────────────────
export function scheduleNudge(taskId: string, afterMs: number): Event {
  return {
    ts: Date.now() + afterMs,
    type: "nudge_scheduled",
    source: "active" as const,
    value: { taskId, scheduledFor: new Date(Date.now() + afterMs).toISOString() },
  };
}

// ── Start Pomodoro ─────────────────────────────────────────────────────────
export function startPomodoro(taskId: string, workMin = 25, breakMin = 5): Event {
  return {
    ts: Date.now(),
    type: "focus_session_start",
    source: "active" as const,
    value: { taskId, workMin, breakMin, technique: "pomodoro" },
  };
}
