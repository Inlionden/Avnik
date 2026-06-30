import { NextRequest, NextResponse } from "next/server";
import { registerAllAgents, helmsmanRun } from "@/lib/agents";
import { applyMentor } from "@/lib/agents/conversation";
import type { Message, Provider, Profile, BeliefState, Task, Event } from "@/lib/types";
import type { CurrentState } from "@/lib/agents/state";
import type { ChatMode } from "@/lib/agents/conversation";

// Register all agents on cold start (idempotent)
registerAllAgents();

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      messages: Message[];
      provider?: Provider;
      chatMode?: ChatMode;
      profile?: Profile;
      beliefs?: BeliefState;
      tasks?: Task[];
      events?: Event[];
      currentState?: Partial<CurrentState>;
    };

    const { messages, provider, chatMode, profile, beliefs, tasks, events, currentState } = body;
    const lastMessage = messages[messages.length - 1];

    const helmCtx = {
      input: lastMessage?.content ?? "",
      messages,
      profile,
      beliefs,
      tasks: tasks ?? [],
      events: events ?? [],
      currentState,
    };

    const result = await helmsmanRun(helmCtx);

    // Apply Mentor layer (fit-checker + mood/style adaptation)
    const finalResult = await applyMentor(result, {
      ...helmCtx,
      state: result.state,
      events: events ?? [],
    }, chatMode ?? "chat");

    return NextResponse.json({
      reply: finalResult.text,
      agent: finalResult.agent,
      route: result.route,
      state: result.state,
      sideEffects: [...(result.sideEffects ?? []), ...(finalResult.sideEffects ?? [])],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI error";
    return NextResponse.json(
      { error: `${msg} — check API keys in .env.local` },
      { status: 500 },
    );
  }
}
