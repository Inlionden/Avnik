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

type ChatOpts = { provider?: Provider; system?: string; temperature?: number };

function toCore(messages: Message[]) {
  return messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
}

/** One-shot completion with automatic Groq→Groq2 fallback. */
export async function chat(messages: Message[], opts: ChatOpts = {}): Promise<string> {
  try {
    const { text } = await generateText({
      model: model(opts.provider ?? DEFAULT_PROVIDER),
      system: opts.system,
      temperature: opts.temperature ?? 0.7,
      messages: toCore(messages),
    });
    return text;
  } catch (err) {
    // Auto-fallback: if primary Groq fails, try Groq2
    if ((opts.provider ?? DEFAULT_PROVIDER) === "groq" && process.env.GROQ_API_KEY_2) {
      const { text } = await generateText({
        model: groq(MODELS.groq2),
        system: opts.system,
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
