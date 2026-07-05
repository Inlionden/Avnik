// 💓 PULSE — the always-on agent loop. The client calls this on load and every
// few minutes; the agents scan the user's world and push proactive nudges
// WITHOUT the user typing anything. Deterministic (no LLM) so it's instant,
// free, and never hallucinates.
import { NextRequest, NextResponse } from "next/server";
import type { Task, Event, CalendarEntry } from "@/lib/types";

export type Nudge = {
  id: string;
  agent: string;          // which agent noticed it
  text: string;
  href?: string;          // where tapping the nudge takes the user
  urgency: "high" | "medium" | "low";
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      tasks?: Task[];
      calendar?: CalendarEntry[];
      events?: Event[];
      hour?: number; // client's local hour (server TZ may differ)
    };
    const tasks = body.tasks ?? [];
    const calendar = body.calendar ?? [];
    const events = body.events ?? [];
    const now = Date.now();
    const hour = body.hour ?? new Date().getHours();
    const todayStr = new Date().toISOString().slice(0, 10);

    const nudges: Nudge[] = [];

    // 👁️ Sentinel: a calendar block starts within the next 60 minutes.
    for (const c of calendar) {
      if (c.date !== todayStr) continue;
      const delta = c.hour - hour;
      if (delta === 0 || delta === 1) {
        nudges.push({
          id: `cal_${c.id}`,
          agent: "sentinel",
          text: delta === 0
            ? `Now on your calendar: "${c.title}". Start it?`
            : `Coming up at ${c.hour > 12 ? c.hour - 12 + "pm" : c.hour + "am"}: "${c.title}".`,
          href: "/calendar",
          urgency: delta === 0 ? "high" : "medium",
        });
      }
    }

    // ⭐ North Star: overdue tasks.
    const overdue = tasks.filter(
      t => t.deadline && new Date(t.deadline).getTime() < now && t.status !== "done"
    );
    if (overdue.length > 0) {
      nudges.push({
        id: `overdue_${overdue[0].id}`,
        agent: "north-star",
        text: `"${overdue[0].title}" is past its deadline. A 2-minute start beats a perfect plan.`,
        href: "/coach?mode=focus&q=" + encodeURIComponent(`Just start it for me: ${overdue[0].title}`),
        urgency: "high",
      });
    }

    // ⚔️ Quartermaster: too many open tasks → triage.
    const open = tasks.filter(t => t.status === "todo");
    if (open.length >= 6) {
      nudges.push({
        id: `triage_${open.length}`,
        agent: "quartermaster",
        text: `${open.length} open tasks. Let Triage cut it to the ONE that matters.`,
        href: "/coach?mode=plan&q=" + encodeURIComponent("Triage everything on my plate"),
        urgency: "medium",
      });
    }

    // 📜 Chronicler: evening with zero completions → gentle close-of-day.
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const doneToday = events.filter(e => e.type === "task_done" && e.ts > todayStart).length;
    if (hour >= 18 && hour <= 23 && doneToday === 0 && tasks.length > 0) {
      nudges.push({
        id: `evening_${todayStr}`,
        agent: "chronicler",
        text: "Nothing crossed off yet today. One small win before you close the day?",
        href: "/coach?mode=focus&q=" + encodeURIComponent("Give me one 5-minute win right now"),
        urgency: "low",
      });
    }

    // 🗓️ Day-Planner: it's morning and today has no plan at all.
    const todayCal = calendar.filter(c => c.date === todayStr);
    if (hour >= 7 && hour <= 11 && todayCal.length === 0 && tasks.some(t => t.status === "todo")) {
      nudges.push({
        id: `plan_${todayStr}`,
        agent: "day-planner",
        text: "Today is unplanned. 30 seconds with me and it won't be.",
        href: "/coach?mode=plan&q=" + encodeURIComponent("Plan my day"),
        urgency: "medium",
      });
    }

    // Highest urgency first, max 3.
    const rank = { high: 0, medium: 1, low: 2 } as const;
    nudges.sort((a, b) => rank[a.urgency] - rank[b.urgency]);

    return NextResponse.json({ nudges: nudges.slice(0, 3), ts: now });
  } catch {
    return NextResponse.json({ nudges: [], ts: Date.now() });
  }
}
