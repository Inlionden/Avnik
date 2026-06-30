"use client";
import { useState, useEffect } from "react";
import { Plus, Target, Trash2, Sparkles } from "lucide-react";
import { get, set, KEYS } from "@/lib/memory";
import type { Profile, Goal } from "@/lib/types";

const OCEAN_META: { key: keyof Profile["ocean"]; label: string; emoji: string; color: string }[] = [
  { key: "openness",          label: "Openness",          emoji: "🎨", color: "bg-violet-500" },
  { key: "conscientiousness", label: "Conscientiousness", emoji: "📐", color: "bg-indigo-500" },
  { key: "extraversion",      label: "Extraversion",      emoji: "🔥", color: "bg-amber-500" },
  { key: "agreeableness",     label: "Agreeableness",     emoji: "🤝", color: "bg-emerald-500" },
  { key: "neuroticism",       label: "Sensitivity",       emoji: "🌊", color: "bg-rose-500" },
];

const DEFAULT_OCEAN: Profile["ocean"] = {
  openness: 60, conscientiousness: 55, extraversion: 50, agreeableness: 65, neuroticism: 45,
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [newWhy, setNewWhy] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setProfile(get<Profile | null>(KEYS.profile, null));
    setGoals(get<Goal[]>(KEYS.goals, []));
  }, []);

  function addGoal() {
    if (!newGoal.trim()) return;
    const goal: Goal = {
      id: `goal_${Date.now()}`,
      title: newGoal.trim(),
      why: newWhy.trim() || undefined,
      createdAt: Date.now(),
    };
    const updated = [...goals, goal];
    set(KEYS.goals, updated);
    setGoals(updated);
    setNewGoal("");
    setNewWhy("");
    setAdding(false);
  }

  function removeGoal(id: string) {
    const updated = goals.filter(g => g.id !== id);
    set(KEYS.goals, updated);
    setGoals(updated);
  }

  const ocean = profile?.ocean ?? DEFAULT_OCEAN;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
          <span className="text-white text-xl font-black">
            {(profile?.name ?? "A").charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink">{profile?.name ?? "You"}</h1>
          <p className="text-xs text-muted mt-0.5">
            {profile?.onboarded ? "Profile complete" : "Tap a goal below to begin your Red Book"}
          </p>
        </div>
      </div>

      {/* ── RED BOOK ── */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-red-200">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-b from-red-600 to-red-800" />
        <div className="ml-8 bg-[#fffef7]">
          <div className="bg-red-600 px-5 py-3 flex items-center gap-2">
            <Target className="size-4 text-red-100" />
            <p className="text-red-100 text-xs font-bold tracking-widest uppercase">Red Book · Who you want to become</p>
          </div>

          <div className="px-5 py-4 space-y-3">
            {goals.length === 0 && !adding && (
              <p className="text-sm text-red-900/60 italic font-serif py-2">
                Your North Star is empty. Write the person you&apos;re becoming.
              </p>
            )}

            {goals.map(g => (
              <div key={g.id} className="group flex items-start gap-3 rounded-xl bg-white border border-red-100 px-4 py-3">
                <div className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="size-3 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink font-serif">{g.title}</p>
                  {g.why && <p className="text-xs text-muted mt-0.5 italic">Why: {g.why}</p>}
                </div>
                <button
                  onClick={() => removeGoal(g.id)}
                  className="opacity-0 group-hover:opacity-100 transition text-muted hover:text-red-600 shrink-0"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}

            {adding ? (
              <div className="space-y-2 rounded-xl border border-red-200 bg-white p-3">
                <input
                  value={newGoal}
                  onChange={e => setNewGoal(e.target.value)}
                  placeholder="I want to become…"
                  autoFocus
                  className="w-full bg-transparent text-sm text-ink outline-none font-serif placeholder:text-muted/50"
                />
                <input
                  value={newWhy}
                  onChange={e => setNewWhy(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addGoal()}
                  placeholder="Why does this matter? (optional)"
                  className="w-full bg-transparent text-xs text-muted outline-none italic placeholder:text-muted/40"
                />
                <div className="flex gap-2 pt-1">
                  <button onClick={addGoal} className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition">
                    Add to Red Book
                  </button>
                  <button onClick={() => { setAdding(false); setNewGoal(""); setNewWhy(""); }} className="px-3 py-1.5 rounded-lg text-muted text-xs font-medium hover:text-ink transition">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition"
              >
                <Plus className="size-4" /> Add a goal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Personality ── */}
      <div className="rounded-2xl bg-surface border border-line p-5 shadow-sm">
        <h2 className="text-sm font-bold text-ink mb-1">Your psychological profile</h2>
        <p className="text-xs text-muted mb-4">How Avnik tunes its tone for you (Big Five).</p>
        <div className="space-y-3">
          {OCEAN_META.map(({ key, label, emoji, color }) => {
            const val = ocean[key] ?? 50;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-ink">
                    <span>{emoji}</span><span>{label}</span>
                  </span>
                  <span className="text-xs font-bold text-muted">{val}</span>
                </div>
                <div className="h-2 rounded-full bg-black/5 overflow-hidden">
                  <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${val}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        {!profile?.onboarded && (
          <p className="mt-4 text-[11px] text-muted bg-canvas rounded-lg px-3 py-2 border border-line">
            These are starting estimates. Avnik refines them as you chat.
          </p>
        )}
      </div>
    </div>
  );
}
