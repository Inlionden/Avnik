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

  // LLM JSON extraction with one retry — a single flaky generation must not
  // cost the user their plan.
  let parsed: { tasks: PlannedTask[]; note: string } | null = null;
  for (let attempt = 0; attempt < 2 && !parsed; attempt++) {
    try {
      const raw = await chat(ctx.messages, { system: SYSTEM, temperature: attempt === 0 ? 0.4 : 0.2, raw: true });
      const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
      const candidate = JSON.parse(json);
      if (Array.isArray(candidate.tasks)) parsed = candidate;
    } catch { /* retry once, then fall through */ }
  }
  if (!parsed) {
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

  // Which day is the user planning? "tomorrow" shifts every entry one day out.
  const isTomorrow = /\btomorrow\b/i.test(ctx.input);
  const target = new Date(now + (isTomorrow ? 86_400_000 : 0));
  const dateStr = target.toISOString().slice(0, 10); // YYYY-MM-DD

  // Build task_created + dayplan_slot + persistent calendar_event sideEffects
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
    if (!isTomorrow) {
      sideEffects.push({
        ts: now,
        type: "dayplan_slot",
        source: "active",
        taskId: id,
        value: { hour: t.hour, durationMin: t.durationMin },
      });
    }
    // The persistent record: stays on the calendar across days ("auto keep it there").
    sideEffects.push({
      ts: now,
      type: "calendar_event",
      source: "active",
      taskId: id,
      value: {
        id: `cal_${now}_${i}`,
        date: dateStr,
        hour: t.hour,
        durationMin: t.durationMin,
        title: t.title,
        taskId: id,
        source: "agent",
        createdAt: now,
      },
    });
    const ampm = t.hour === 12 ? "12pm" : t.hour < 12 ? `${t.hour}am` : `${t.hour - 12}pm`;
    summaryLines.push(`• ${ampm} — ${t.title} (${t.durationMin}m)`);
  });

  const dayWord = isTomorrow ? "tomorrow" : "today";
  const text =
    `📅 Planned ${dayWord} — ${tasks.length} task${tasks.length > 1 ? "s" : ""} on your Calendar:\n\n` +
    summaryLines.join("\n") +
    (parsed.note ? `\n\n${parsed.note}` : "");

  return { text, agent: "day-planner", sideEffects };
}
