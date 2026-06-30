import type { ReactNode } from "react";

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-2xl border border-line bg-surface p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Bar({
  value,
  color = "bg-brand",
  label,
}: {
  value: number;
  color?: string;
  label?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-xs text-muted">
          <span>{label}</span>
          <span>{Math.round(v)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-line">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}
