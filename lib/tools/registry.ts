// 🔒 SHARED CONTRACT — the MCP-style tool interface + registry. Owned by Session 1.
// Sessions register their tools (actions[S2], analytics[S3], sensing[S5]) here.
import type { z } from "zod";

export interface Tool<A = unknown, R = unknown> {
  name: string;
  description: string;
  params: z.ZodType<A>;
  availability?: "web" | "mobile" | "wearable";
  permission?: "location" | "mic" | "health" | "notifications";
  run: (args: A, ctx?: unknown) => Promise<R> | R;
}

const tools = new Map<string, Tool>();

export function registerTool(tool: Tool): void {
  tools.set(tool.name, tool);
}
export function getTool(name: string): Tool | undefined {
  return tools.get(name);
}
export function listTools(): Tool[] {
  return [...tools.values()];
}
