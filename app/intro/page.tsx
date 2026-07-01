import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Cinematic monochrome intro — matches the app's template design language.
export default function IntroPage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-8 bg-surface px-6 text-center overflow-hidden">
      {/* Grid backdrop */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(0,0,0,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.035) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(0,0,0,0.04) 0%, transparent 70%)",
      }} />

      <div className="relative z-10 anim-fade-up">
        <div className="inline-flex items-center gap-2 border border-border rounded-full px-3.5 py-1.5 mb-8 bg-surface">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[11px] font-semibold text-muted uppercase tracking-widest">30-agent AI companion</span>
        </div>

        <h1 className="text-[64px] sm:text-[88px] font-black tracking-tight text-ink leading-none">
          Avnik<span className="text-accent">.</span>
        </h1>
        <p className="mt-5 max-w-md mx-auto text-[17px] text-muted leading-relaxed text-balance">
          Your last-minute life saver. Tell it what you&apos;re avoiding — it plans, focuses, and finishes with you.
        </p>

        <Link
          href="/home"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-ink text-white px-7 py-4 text-[15px] font-bold hover:bg-brand-600 transition active:scale-[0.98] anim-fade-up delay-200"
        >
          Enter Avnik
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <p className="relative z-10 text-[11px] text-muted anim-fade-in delay-500">No sign-up · Private · Works offline</p>
    </div>
  );
}
