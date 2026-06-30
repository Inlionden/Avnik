import Link from "next/link";
import { Card, Bar } from "@/components/ui/card";

// 🛠️ Foundation stub — Session 4 builds the real Impact Dashboard here.
export default function HomePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-ink">Good to see you 👋</h1>
        <p className="text-sm text-muted">Let&apos;s find your next move.</p>
      </header>

      <Link
        href="/coach"
        className="block rounded-2xl bg-accent px-5 py-4 text-center text-lg font-bold text-white shadow-sm transition hover:opacity-90"
      >
        ⚡ What Now?
      </Link>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-ink">Energy</h2>
        <div className="space-y-3">
          <Bar label="Mental" value={61} color="bg-brand" />
          <Bar label="Physical" value={55} color="bg-success" />
          <Bar label="Stress" value={38} color="bg-alert" />
        </div>
        <p className="mt-3 text-xs text-muted">Placeholder — Session 4 wires live data.</p>
      </Card>
    </div>
  );
}
