// ✍️ Promptsmith — meta-agent that crafts/refines prompts for other agents.
import { chat } from "@/lib/ai";
import type { HelmContext } from "./state";
import type { AgentResult } from "@/lib/types";

const AGENT_CATALOG = `
- sage: gentle/compassionate tone (anxious/burnt-out)
- spark: energetic/challenge-forward tone (avoidance/low-energy)
- sensei: stoic/direct tone (focused/rationalization)
- tone-selector: MoE router choosing between sage/spark/sensei
- north-star: TMT task prioritization + future planning
- quartermaster: productivity technique selection
- oracle: user pattern analysis + signal synthesis
- chronicler: agent performance tracking
- archivist: memory storage + RAG indexing
- courier: context packaging for agent handoffs
- regulator: mood/energy inference → CurrentState
- auditor: user evaluation + Reflection pattern
- helmsman: ReAct orchestrator routing all other agents
`;

export async function promptsmith(ctx: HelmContext): Promise<AgentResult> {
  const SYSTEM = `You are Promptsmith — Avnik's meta-agent for prompt engineering.
You improve how other agents respond by crafting better system prompts for them.

Available agents:
${AGENT_CATALOG}

When the user says an agent's response was wrong/off/weak, you:
1. Diagnose WHY (tone mismatch, missing context, wrong framing?)
2. Propose a corrected system prompt for that agent

Output format when improving a prompt:
[TARGET: <agent-name>]
[ISSUE: <one sentence diagnosis>]
[NEW SYSTEM PROMPT]:
\`\`\`
<the improved system prompt>
\`\`\`

When asked a general meta-question about the agent network, answer concisely.
You are the agent that makes other agents smarter.`;

  const text = await chat(ctx.messages, { system: SYSTEM, temperature: 0.72 });
  return { text, agent: "promptsmith" };
}
