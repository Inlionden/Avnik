// 🏛️ Board Meeting — Weekly multi-agent review. Each Lead reports; Helmsman synthesizes.
import type { HelmContext } from "../state";
import type { AgentResult } from "@/lib/types";
import { chat } from "@/lib/ai";

type BoardReport = { agent: string; emoji: string; report: string };

export async function runBoardMeeting(ctx: HelmContext): Promise<AgentResult> {
  const now = Date.now();
  const weekAgo = now - 7 * 86_400_000;

  const events = (ctx.events ?? []).filter(e => e.ts > weekAgo);
  const tasks = ctx.tasks ?? [];

  // Collect data per domain
  const done    = tasks.filter(t => t.status === "done").length;
  const todo    = tasks.filter(t => t.status === "todo").length;
  const blocked = tasks.filter(t => t.status === "blocked").length;
  const overdue = tasks.filter(t => t.deadline && new Date(t.deadline).getTime() < now && t.status !== "done").length;
  const focusEvents = events.filter(e => e.type.includes("focus") || e.type.includes("pomodoro"));
  const moodEvents  = events.filter(e => e.type === "mood_checkin");

  const reports: BoardReport[] = [
    {
      agent: "north-star",
      emoji: "⭐",
      report: `Goals: ${tasks.filter(t => (t.importance ?? 0) >= 80).length} high-importance tasks. ${done} completed this week.`,
    },
    {
      agent: "quartermaster",
      emoji: "⚔️",
      report: `Actions: ${done} done · ${todo} pending · ${blocked} blocked · ${overdue} overdue. Focus sessions: ${focusEvents.length}.`,
    },
    {
      agent: "oracle",
      emoji: "🔮",
      report: `Root cause: ${Object.entries(ctx.beliefs?.rootCauses ?? {}).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? "unknown"} is leading. Confidence: ${((ctx.beliefs?.confidence ?? 0)*100).toFixed(0)}%.`,
    },
    {
      agent: "sentinel",
      emoji: "👁️",
      report: `Mood signals: ${moodEvents.length} check-ins. Passive events: ${events.filter(e => e.source === "passive").length}.`,
    },
    {
      agent: "auditor",
      emoji: "🪞",
      report: `Self-grade: ${
        done >= 7 ? "A" : done >= 5 ? "B" : done >= 3 ? "C" : done >= 1 ? "D" : "F"
      }. ${overdue > 0 ? `⚠️ ${overdue} overdue tasks need attention.` : "No overdue tasks. ✅"}`,
    },
  ];

  const boardSummary = reports.map(r => `${r.emoji} ${r.agent.toUpperCase()}: ${r.report}`).join("\n");

  const SYSTEM = `You are the Board Secretary — summarizing the weekly Board Meeting.
Each Lead has reported. Synthesize into a 5-minute weekly review:

BOARD REPORTS:
${boardSummary}

Write:
1. THIS WEEK AT A GLANCE (2 sentences)
2. BIGGEST WIN (1 sentence)
3. BIGGEST GAP (1 sentence, honest)
4. NEXT WEEK'S ONE FOCUS (1 task or habit)

Tone: like a good CEO memo to themselves. Honest, forward-looking, brief.`;

  const synthesis = await chat(ctx.messages, { system: SYSTEM, temperature: 0.7 });

  const fullText = `🏛️ **WEEKLY BOARD MEETING**\n\n${boardSummary}\n\n---\n\n${synthesis}`;

  return {
    text: fullText,
    agent: "board-meeting",
    sideEffects: [{
      ts: now,
      type: "board_meeting",
      source: "active" as const,
      value: { reports, synthesis },
    }],
  };
}
