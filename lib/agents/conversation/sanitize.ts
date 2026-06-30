// 🧽 sanitizeReply — deterministic cleanup applied to EVERY agent response.
// Strips LLM artifacts (self-corrections, filler preambles, "as an AI" disclaimers)
// so replies read like a polished product, not a raw model dump. No LLM call.

const META_PATTERNS: RegExp[] = [
  // self-corrections: "wait, let me rephrase that.", "let me try that again", "I'll restate that"
  /\b(wait,?\s*)?let me rephrase(?:\s*that)?\b[.:!\s]*/gi,
  /\b(wait,?\s*)?(?:let me|i'?ll)\s+(?:try (?:that|this)?\s*again|restate(?:\s*that)?|put that better|reword(?:\s*that)?)\b[.:!\s]*/gi,
  // leading filler: "Sure! ", "Okay, ", "Got it. " — only when real content follows
  /^\s*(?:sure|okay|ok|alright|got it|certainly|of course|absolutely)[!,.:\s]+(?=\S)/i,
  // "Here's my rewritten response:" lead-ins
  /^\s*here'?s (?:my|the)\s+(?:rewritten|revised|updated)?\s*(?:response|reply|answer|version)[:.]?\s*/i,
  // AI self-reference disclaimers
  /\b(?:as an ai|i'?m (?:just )?an ai(?: language model)?|being an ai)\b[^.!?]*[.!?]\s*/gi,
];

export function sanitizeReply(text: string): string {
  let t = (text ?? "").trim();
  for (const re of META_PATTERNS) t = t.replace(re, " ");
  t = t
    .replace(/\s+([.,!?;:])/g, "$1")   // no space before punctuation
    .replace(/([.!?]){2,}/g, "$1")      // collapse repeated end punctuation
    .replace(/[ \t]{2,}/g, " ")          // collapse runs of spaces
    .replace(/\n{3,}/g, "\n\n")          // cap blank lines
    .replace(/^\s*[-–—]\s*/, "")        // stray leading dash
    .trim();
  // Capitalize first letter if a filler strip left it lowercase.
  if (t && /[a-z]/.test(t[0])) t = t[0].toUpperCase() + t.slice(1);
  return t;
}
