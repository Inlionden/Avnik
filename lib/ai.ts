// 🔒 SHARED CONTRACT — the AI provider switch (Gemini default + Groq). Owned by Session 1.
import { generateText, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import type { Message, Provider } from "./types";

// Default to Groq for now (Gemini free-tier quota was unavailable). Switch back once a valid AIza… Gemini key is set.
const DEFAULT_PROVIDER: Provider = "groq";

const MODELS = {
  gemini: "gemini-2.0-flash",
  groq: "llama-3.3-70b-versatile",
} as const;

function model(provider: Provider) {
  return provider === "groq" ? groq(MODELS.groq) : google(MODELS.gemini);
}

type ChatOpts = { provider?: Provider; system?: string; temperature?: number };

function toCore(messages: Message[]) {
  return messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
}

/** One-shot completion. Returns the reply text. */
export async function chat(messages: Message[], opts: ChatOpts = {}): Promise<string> {
  const { text } = await generateText({
    model: model(opts.provider ?? DEFAULT_PROVIDER),
    system: opts.system,
    temperature: opts.temperature ?? 0.7,
    messages: toCore(messages),
  });
  return text;
}

/** Streaming variant (for the chat UI). */
export function chatStream(messages: Message[], opts: ChatOpts = {}) {
  return streamText({
    model: model(opts.provider ?? DEFAULT_PROVIDER),
    system: opts.system,
    temperature: opts.temperature ?? 0.7,
    messages: toCore(messages),
  });
}

export { DEFAULT_PROVIDER, MODELS };
