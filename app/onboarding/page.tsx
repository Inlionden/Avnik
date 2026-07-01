"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { get, set, KEYS } from "@/lib/memory";
import type { Profile, Ocean, Goal } from "@/lib/types";

type Q = { key: keyof Ocean; prompt: string; a: string; b: string };
const QUESTIONS: Q[] = [
  { key: "openness",          prompt: "When you approach a task, you'd rather…", a: "Try a fresh, creative angle", b: "Use a proven method that works" },
  { key: "conscientiousness", prompt: "Your ideal day is…", a: "Planned out in advance", b: "Open and go-with-the-flow" },
  { key: "extraversion",      prompt: "You recharge best by…", a: "Being around people", b: "Having quiet time alone" },
  { key: "agreeableness",     prompt: "When deciding, you lead with…", a: "Empathy and harmony", b: "Logic and directness" },
  { key: "neuroticism",       prompt: "Under pressure, you usually…", a: "Feel it intensely", b: "Stay pretty calm" },
];

const DEFAULT_OCEAN: Ocean = { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 };

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [ocean, setOcean] = useState<Ocean>({ ...DEFAULT_OCEAN });
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");

  const total = QUESTIONS.length + 2; // intro-less: questions + name + goal
  const progress = Math.round((step / total) * 100);

  function answer(q: Q, pickA: boolean) {
    // A = high trait (except neuroticism, where A = high). Simple 72/34 split.
    setOcean(o => ({ ...o, [q.key]: pickA ? 72 : 34 }));
    setStep(s => s + 1);
  }

  function finish() {
    const existing = get<Profile | null>(KEYS.profile, null);
    const profile: Profile = {
      name: name.trim() || undefined,
      ocean,
      workStyle: existing?.workStyle ?? {},
      motivation: existing?.motivation ?? {},
      commProfile: existing?.commProfile ?? {},
      onboarded: true,
    };
    set(KEYS.profile, profile);
    if (goal.trim()) {
      const goals = get<Goal[]>(KEYS.goals, []);
      set(KEYS.goals, [...goals, { id: `goal_${Date.now()}`, title: goal.trim(), createdAt: Date.now() }]);
    }
    router.push("/home");
  }

  const isQuestion = step < QUESTIONS.length;
  const isName = step === QUESTIONS.length;
  const isGoal = step === QUESTIONS.length + 1;

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 bg-surface">
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
      }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted">Getting to know you</span>
            <span className="text-[11px] font-bold text-muted tabular-nums">{Math.min(step + 1, total)}/{total}</span>
          </div>
          <div className="h-1.5 rounded-full bg-border overflow-hidden">
            <div className="h-full rounded-full bg-ink transition-all duration-500" style={{ width: `${Math.max(progress, 8)}%` }} />
          </div>
        </div>

        {/* Question steps */}
        {isQuestion && (
          <div key={step} className="anim-fade-up">
            <h1 className="text-[26px] font-black text-ink leading-tight mb-6">{QUESTIONS[step].prompt}</h1>
            <div className="space-y-3">
              {[true, false].map(pickA => (
                <button
                  key={String(pickA)}
                  onClick={() => answer(QUESTIONS[step], pickA)}
                  className="w-full text-left rounded-2xl border border-border bg-surface px-5 py-4 text-[15px] font-medium text-ink hover:border-ink hover:bg-ink hover:text-white transition-all group flex items-center justify-between"
                >
                  {pickA ? QUESTIONS[step].a : QUESTIONS[step].b}
                  <ArrowRight className="size-4 opacity-0 group-hover:opacity-100 transition" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Name */}
        {isName && (
          <div className="anim-fade-up">
            <h1 className="text-[26px] font-black text-ink leading-tight mb-2">What should Avnik call you?</h1>
            <p className="text-sm text-muted mb-6">Optional — you can skip it.</p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && setStep(s => s + 1)}
              placeholder="Your name"
              autoFocus
              className="w-full rounded-2xl border border-border bg-surface px-5 py-4 text-[15px] text-ink outline-none focus:border-ink transition mb-4"
            />
            <button onClick={() => setStep(s => s + 1)} className="w-full rounded-full bg-ink text-white py-4 font-bold text-sm hover:bg-brand-600 transition flex items-center justify-center gap-2">
              Continue <ArrowRight className="size-4" />
            </button>
          </div>
        )}

        {/* First goal */}
        {isGoal && (
          <div className="anim-fade-up">
            <div className="w-11 h-11 rounded-xl bg-ink flex items-center justify-center mb-4">
              <Sparkles className="size-5 text-white" />
            </div>
            <h1 className="text-[26px] font-black text-ink leading-tight mb-2">Who are you becoming?</h1>
            <p className="text-sm text-muted mb-6">Your North Star — the identity behind the tasks. (Optional)</p>
            <input
              value={goal}
              onChange={e => setGoal(e.target.value)}
              onKeyDown={e => e.key === "Enter" && finish()}
              placeholder="e.g. A disciplined writer who ships"
              autoFocus
              className="w-full rounded-2xl border border-border bg-surface px-5 py-4 text-[15px] text-ink outline-none focus:border-ink transition mb-4"
            />
            <button onClick={finish} className="w-full rounded-full bg-ink text-white py-4 font-bold text-sm hover:bg-brand-600 transition flex items-center justify-center gap-2">
              Enter Avnik <ArrowRight className="size-4" />
            </button>
          </div>
        )}

        {/* Back */}
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="mt-6 flex items-center gap-1.5 text-[13px] text-muted hover:text-ink transition mx-auto">
            <ArrowLeft className="size-3.5" /> Back
          </button>
        )}
      </div>
    </div>
  );
}
