import Link from "next/link";

// 🛠️ Stub — Session 3 builds the 5-sec cinematic intro (+ public/intro.mp4 fallback).
export default function IntroPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-canvas px-6 text-center">
      <div className="text-5xl font-black tracking-tight text-brand">
        Avnik<span className="text-accent">.</span>
      </div>
      <p className="max-w-xs text-sm text-muted">Your last-minute life saver.</p>
      <Link
        href="/home"
        className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600"
      >
        Enter
      </Link>
    </div>
  );
}
