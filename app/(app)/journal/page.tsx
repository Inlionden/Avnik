import { Card } from "@/components/ui/card";

// 🛠️ Stub — Session 5 builds 3-level journaling, mood check-in, Silence Speaks, Daily Anchor.
export default function JournalPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink">📓 Journal</h1>
      <Card>
        <p className="text-sm text-muted">
          Session 5 builds multi-modal journaling here — full write, 10-second mood check-in,
          zero-effort logging, &quot;Silence Speaks&quot;, and the Daily Anchor reflection.
        </p>
      </Card>
    </div>
  );
}
