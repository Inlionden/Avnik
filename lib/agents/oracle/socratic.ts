// 🧠 Socratic Interviewer — asks guided questions until the real root cause surfaces.
import type { HelmContext } from "../state";
import type { AgentResult } from "@/lib/types";
import { chat } from "@/lib/ai";

// Question ladder per suspected root cause
const QUESTION_LADDERS: Record<string, string[]> = {
  fear:         ["Why haven't you started this?", "What do you think will happen if you submit it?", "Who are you most afraid of judging it?", "What happens if it's not perfect?"],
  perfectionism:["How many times have you revised this already?", "What would 'good enough' look like?", "What's the cost of shipping a version-1 draft?"],
  burnout:      ["When did you last feel energized?", "What's one thing that would take something off your plate?"],
  clarity:      ["What's the very first physical action you'd need to take?", "If you had to start in 60 seconds, where would you click first?"],
  distraction:  ["What keeps pulling your attention away?", "What's the environment like right now?"],
  confidence:   ["What's your evidence that you can't do this?", "What's one similar thing you've done before?"],
  boredom:      ["What about this task is genuinely boring?", "What would make this interesting?"],
  overplanning: ["How many hours have you spent planning vs doing?", "What's the minimum you need to know before starting?"],
};

export async function socratic(ctx: HelmContext): Promise<AgentResult> {
  const topCause = Object.entries(ctx.beliefs?.rootCauses ?? {})
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "clarity";

  const ladder = QUESTION_LADDERS[topCause] ?? QUESTION_LADDERS.clarity;
  const questionCount = ctx.messages.filter(m => m.agent === "socratic").length;
  const nextQuestion = ladder[Math.min(questionCount, ladder.length - 1)];

  const prevAnswers = ctx.messages
    .filter(m => m.agent === "socratic" || (m.role === "user" && questionCount > 0))
    .slice(-6)
    .map(m => `${m.role === "user" ? "You" : "Socratic"}: ${m.content}`)
    .join("\n");

  const SYSTEM = `You are Socratic-Interviewer — you ask one precise question to uncover the real reason the user is stuck.
Suspected root cause: ${topCause}
Current question in ladder: "${nextQuestion}"
Prior exchange:\n${prevAnswers || "None yet."}

Ask ONLY the next question. Nothing else. No advice. No explanations.
After 3-5 questions, if the cause is clear: say "Root cause identified: [X]" and stop.`;

  const text = await chat(ctx.messages, { system: SYSTEM, temperature: 0.6 });
  return { text, agent: "socratic" };
}
