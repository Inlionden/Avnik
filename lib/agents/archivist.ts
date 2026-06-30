// 🗄️ Archivist — Storage agent. Consolidates and organizes what to persist.
// Runs server-side; returns sideEffects so the client can apply them to localStorage.
import type { HelmContext } from "./state";
import type { AgentResult, Event } from "@/lib/types";

type ArchiveCommand = {
  op: "store" | "append" | "delete";
  key: string;
  value?: unknown;
};

// Parse "STORE: key = value" or "APPEND: key = value" commands from text
function parseCommands(text: string): ArchiveCommand[] {
  const cmds: ArchiveCommand[] = [];
  const re = /\b(STORE|APPEND|DELETE):\s*(\w+)\s*(?:=\s*(.+))?/gi;
  for (const m of text.matchAll(re)) {
    cmds.push({
      op: m[1].toLowerCase() as ArchiveCommand["op"],
      key: m[2],
      value: m[3]?.trim(),
    });
  }
  return cmds;
}

export async function archivist(ctx: HelmContext): Promise<AgentResult> {
  const cmds = parseCommands(ctx.input);
  const events: Event[] = [];
  const stored: string[] = [];

  for (const cmd of cmds) {
    events.push({
      ts: Date.now(),
      type: `archivist_${cmd.op}`,
      source: "active",
      value: { key: cmd.key, value: cmd.value },
    });
    stored.push(`${cmd.op.toUpperCase()}: ${cmd.key}`);
  }

  if (stored.length === 0) {
    // General consolidation report
    const eventCount = ctx.events?.length ?? 0;
    const taskCount = ctx.tasks?.length ?? 0;
    return {
      text: `Memory status: ${eventCount} events · ${taskCount} tasks · profile ${ctx.profile?.onboarded ? "complete" : "pending onboarding"}. Use STORE: key = value to save specific data.`,
      agent: "archivist",
    };
  }

  return {
    text: `Archived: ${stored.join(" | ")}`,
    agent: "archivist",
    sideEffects: events,
  };
}
