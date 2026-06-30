// 📅 Day-Planner — turns "plan my day" into real tasks + scheduled slots.
// Extracts tasks from natural language, emits task_created + dayplan_slot sideEffects
// that the client writes into localStorage so they appear in the Day Plan.
import type { HelmContext } from "../state";
import type { AgentResult, Event } from "@/lib/types";
import { chat } from "@/lib/ai";

type PlannedTask = { title: string; importance: number; hour: number; durationMin: number };

export async function dayPlanner(ctx: HelmContext): Promise<AgentResult> {
  const now = Date.now();
  const currentHour = new Date().getHours();

  const SYSTEM = `You are Day-Planner — Avnik's scheduling agent.
The user described what they need to do today. Extract concrete tasks and lay them out on a timeline.

Rules:
- It is currently ${currentHour}:00. Schedule tasks AFTER this hour, within 7:00–21:00.
- Hardest / most important work goes in the user's peak hours (late morning ~10-12, or now if late).
- importance: 0-100 (exams, deadlines, hard work = 80-100; admin/errands = 30-50).
- durationMin: realistic block size (25, 50, 90).
- Max 6 tasks. Don't invent work the user didn't mention.

Output ONLY valid JSON, no prose:
{ "tasks": [ { "title": "...", "importance": 85, "hour": 10, "durationMin": 50 } ], "note": "one encouraging sentence" }`;

  let parsed: { tasks: PlannedTask[]; note: string };
  try {
    const raw = await chat(ctx.messages, { system: SYSTEM, temperature: 0.4 });
    const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    parsed = JSON.parse(json);
  } catch {
    return {
      text: "Tell me what's on your plate today — meetings, study, errands — and I'll lay it out on your timeline.",
      agent: "day-planner",
    };
  }

  const tasks = (parsed.tasks ?? []).slice(0, 6);
  if (!tasks.length) {
    return {
      text: "I didn't catch any specific tasks. Try: \"I need to study chapter 4, reply to 3 emails, and prep for tomorrow's meeting.\"",
      agent: "day-planner",
    };
  }

  // Build task_created + dayplan_slot sideEffects
  const sideEffects: Event[] = [];
  const summaryLines: string[] = [];

  tasks.forEach((t, i) => {
    const id = `task_${now}_${i}`;
    sideEffects.push({
      ts: now,
      type: "task_created",
      source: "active",
      taskId: id,
      value: { id, title: t.title, importance: t.importance, status: "todo", createdAt: now },
    });
    sideEffects.push({
      ts: now,
      type: "dayplan_slot",
      source: "active",
      taskId: id,
      value: { hour: t.hour, durationMin: t.durationMin },
    });
    const ampm = t.hour === 12 ? "12pm" : t.hour < 12 ? `${t.hour}am` : `${t.hour - 12}pm`;
    summaryLines.push(`• ${ampm} — ${t.title} (${t.durationMin}m)`);
  });

  const text =
    `📅 Planned your day — ${tasks.length} task${tasks.length > 1 ? "s" : ""} added to your Day Plan:\n\n` +
    summaryLines.join("\n") +
    (parsed.note ? `\n\n${parsed.note}` : "") +
    `\n\nOpen **Tasks → Day Plan** to see them on your timeline.`;

  return { text, agent: "day-planner", sideEffects };
}
