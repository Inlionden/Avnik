// 🤫 Interruptibility — decides whether to interrupt a focus session or stay silent.
import type { HelmContext } from "../state";

export type InterruptDecision = {
  shouldInterrupt: boolean;
  reason: string;
  deferUntil?: string; // "after focus block" | "session end"
};

export function checkInterruptibility(ctx: HelmContext): InterruptDecision {
  const { state } = ctx;

  // During a focus block: almost never interrupt
  if (state.phase === "working") {
    // Only interrupt for genuine emergencies (overdue by > 1 day)
    const overdue = ctx.tasks?.filter(t => {
      if (!t.deadline || t.status === "done") return false;
      return new Date(t.deadline).getTime() < Date.now() - 86_400_000;
    }) ?? [];

    if (overdue.length > 0) {
      return {
        shouldInterrupt: true,
        reason: `Critical: ${overdue.length} task(s) overdue by 24h+`,
      };
    }

    return {
      shouldInterrupt: false,
      reason: "In focus session — deferring non-urgent messages",
      deferUntil: "after focus block",
    };
  }

  // During a break: yes, good time
  if (state.phase === "break") {
    return { shouldInterrupt: true, reason: "Break time — good moment for a check-in" };
  }

  // Default: interrupt
  return { shouldInterrupt: true, reason: "Not in a focus block" };
}
