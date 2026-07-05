// 🔒 SHARED CONTRACT — AI provider switch. Groq primary, Groq2 fallback, Nvidia NIM, Gemini.
import { generateText, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import type { Message, Provider } from "./types";

const DEFAULT_PROVIDER: Provider = "groq";

// Nvidia NIM uses OpenAI-compatible endpoint
const nvidia = createOpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY ?? "",
});

const MODELS = {
  gemini: "gemini-2.0-flash",
  groq:   "llama-3.3-70b-versatile",
  groq2:  "llama-3.3-70b-versatile",
  nvidia: "meta/llama-3.3-70b-instruct",
} as const;

function model(provider: Provider) {
  if (provider === "nvidia") return nvidia(MODELS.nvidia);
  if (provider === "gemini") return google(MODELS.gemini);
  // If primary Groq key is missing, fall back to GROQ_API_KEY_2
  const hasGroq2 = !!process.env.GROQ_API_KEY_2;
  if (provider === "groq" && hasGroq2 && !process.env.GROQ_API_KEY) {
    return groq(MODELS.groq2);
  }
  return groq(MODELS.groq);
}

type ChatOpts = {
  provider?: Provider;
  system?: string;
  temperature?: number;
  /** Skip the shared agent constitution (for pure-JSON extractors like day-planner). */
  raw?: boolean;
};

function toCore(messages: Message[]) {
  return messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
}

// Every agent call passes through here — the one choke point where the shared
// multi-agent protocol (lib/agents/constitution.ts) is guaranteed to apply.
import { withConstitution } from "./agents/constitution";

function buildSystem(opts: ChatOpts): string | undefined {
  if (!opts.system) return undefined;
  return opts.raw ? opts.system : withConstitution(opts.system);
}

/** One-shot completion with automatic Groq→Groq2 fallback. */
export async function chat(messages: Message[], opts: ChatOpts = {}): Promise<string> {
  const system = buildSystem(opts);
  try {
    const { text } = await generateText({
      model: model(opts.provider ?? DEFAULT_PROVIDER),
      system,
      temperature: opts.temperature ?? 0.7,
      messages: toCore(messages),
    });
    return text;
  } catch (err) {
    // Auto-fallback: if primary Groq fails, try Groq2
    if ((opts.provider ?? DEFAULT_PROVIDER) === "groq" && process.env.GROQ_API_KEY_2) {
      const { text } = await generateText({
        model: groq(MODELS.groq2),
        system,
        temperature: opts.temperature ?? 0.7,
        messages: toCore(messages),
      });
      return text;
    }
    throw err;
  }
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
