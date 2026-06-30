import { NextRequest, NextResponse } from "next/server";
import { registerAllAgents, helmsmanRun } from "@/lib/agents";
import type { Message, Provider, Profile, BeliefState, Task, Event } from "@/lib/types";
import type { CurrentState } from "@/lib/agents/state";

// Register all agents on cold start (idempotent)
registerAllAgents();

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      messages: Message[];
      provider?: Provider;
      profile?: Profile;
      beliefs?: BeliefState;
      tasks?: Task[];
      events?: Event[];
      currentState?: Partial<CurrentState>;
    };

    const { messages, provider, profile, beliefs, tasks, events, currentState } = body;
    const lastMessage = messages[messages.length - 1];

    const result = await helmsmanRun({
      input: lastMessage?.content ?? "",
      messages,
      profile,
      beliefs,
      tasks: tasks ?? [],
      events: events ?? [],
      currentState,
    });

    return NextResponse.json({
      reply: result.text,
      agent: result.agent,
      route: result.route,
      state: result.state,
      sideEffects: result.sideEffects ?? [],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI error";
    return NextResponse.json(
      { error: `${msg} — check API keys in .env.local` },
      { status: 500 },
    );
  }
}
