// 🎯 Triage — Task prioritization with Eisenhower Matrix + TMT scoring.
import type { HelmContext } from "../state";
import type { AgentResult, Task } from "@/lib/types";
import { chat } from "@/lib/ai";

function eisenhowerQuadrant(task: Task): "do-now" | "schedule" | "delegate" | "drop" {
  const urgent = task.deadline
    ? new Date(task.deadline).getTime() - Date.now() < 2 * 86_400_000
    : false;
  const important = (task.importance ?? 50) >= 65;
  if (urgent && important) return "do-now";
  if (!urgent && important) return "schedule";
  if (urgent && !important) return "delegate";
  return "drop";
}

export async function triage(ctx: HelmContext): Promise<AgentResult> {
  const tasks = (ctx.tasks ?? []).filter(t => t.status !== "done");

  const quadrants = {
    "do-now":   tasks.filter(t => eisenhowerQuadrant(t) === "do-now"),
    "schedule": tasks.filter(t => eisenhowerQuadrant(t) === "schedule"),
    "delegate": tasks.filter(t => eisenhowerQuadrant(t) === "delegate"),
    "drop":     tasks.filter(t => eisenhowerQuadrant(t) === "drop"),
  };

  const summary = [
    quadrants["do-now"].length   ? `🔴 DO NOW (${quadrants["do-now"].length}): ${quadrants["do-now"].map(t=>'"'+t.title+'"').join(", ")}` : null,
    quadrants["schedule"].length ? `🟡 SCHEDULE (${quadrants["schedule"].length}): ${quadrants["schedule"].map(t=>'"'+t.title+'"').join(", ")}` : null,
    quadrants["delegate"].length ? `🔵 DELEGATE (${quadrants["delegate"].length}): ${quadrants["delegate"].map(t=>'"'+t.title+'"').join(", ")}` : null,
    quadrants["drop"].length     ? `⚪ DROP (${quadrants["drop"].length}): ${quadrants["drop"].map(t=>'"'+t.title+'"').join(", ")}` : null,
  ].filter(Boolean).join("\n");

  const SYSTEM = `You are Triage — Avnik's task prioritization agent.
You use the Eisenhower Matrix (Urgent×Important) + Temporal Motivation Theory.

Current triage:
${summary || "No tasks to triage."}

Mood: ${ctx.state.mood} | Energy: ${(ctx.state.energy*100).toFixed(0)}%

Respond with:
1. ONE task to start right now (and why in 1 sentence)
2. Quick confirmation of the full ranking (3 lines max)
3. If anything is misclassified, say so

Be decisive. The user needs clarity, not options.`;

  const text = await chat(ctx.messages, { system: SYSTEM, temperature: 0.6 });
  return { text, agent: "triage" };
}
