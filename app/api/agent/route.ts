// Direct agent endpoint — call a specific agent by name.
// Used by dashboard, tasks page, onboarding (not the chat UI).
import { NextRequest, NextResponse } from "next/server";
import { registerAllAgents, helmsmanRun } from "@/lib/agents";
import type { Message, Profile, BeliefState, Task, Event } from "@/lib/types";
import type { CurrentState } from "@/lib/agents/state";

registerAllAgents();

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      agent?: string; // if omitted, Helmsman routes automatically
      input: string;
      messages?: Message[];
      profile?: Profile;
      beliefs?: BeliefState;
      tasks?: Task[];
      events?: Event[];
      currentState?: Partial<CurrentState>;
    };

    const messages: Message[] = body.messages ?? [{ role: "user", content: body.input }];

    // If a specific agent is requested, inject that as routing hint
    const input = body.agent
      ? `[ROUTE_TO:${body.agent}] ${body.input}`
      : body.input;

    const result = await helmsmanRun({
      input,
      messages,
      profile: body.profile,
      beliefs: body.beliefs,
      tasks: body.tasks ?? [],
      events: body.events ?? [],
      currentState: body.currentState,
    });

    return NextResponse.json({
      text: result.text,
      agent: result.agent,
      route: result.route,
      state: result.state,
      beliefs: result.beliefs ?? null,
      sideEffects: result.sideEffects ?? [],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Agent error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
