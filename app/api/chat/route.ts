import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/ai";
import type { Message, Provider } from "@/lib/types";

const SYSTEM =
  "You are Avnik, a warm and concise AI productivity companion. You help the user take the next small action instead of nagging. Keep replies short unless they ask you to go deeper.";

export async function POST(req: NextRequest) {
  try {
    const { messages, provider } = (await req.json()) as {
      messages: Message[];
      provider?: Provider;
    };
    const reply = await chat(messages, { provider, system: SYSTEM });
    return NextResponse.json({ reply });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI error";
    return NextResponse.json(
      { error: `${msg} — check API keys in .env.local` },
      { status: 500 },
    );
  }
}
