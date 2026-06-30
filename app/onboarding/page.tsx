import Link from "next/link";

// 🛠️ Stub — Session 3 builds the Big Five quiz + Red Book + first personalized insight.
export default function OnboardingPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-2xl font-bold text-ink">Let&apos;s understand you first</h1>
      <p className="text-sm text-muted">
        Session 3 builds the Big Five quiz and the Red Book here — before any tasks.
      </p>
      <Link
        href="/home"
        className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600"
      >
        Skip for now
      </Link>
    </div>
  );
}
