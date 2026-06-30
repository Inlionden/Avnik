# 🎬 Avnik — Hard Stories (the stress tests)

> Six scenarios, each stacking **3× the constraints** of the original [`../STORY.md`](../STORY.md). Each one targets a different subsystem and ends with a blunt verdict: **can the current 12 agents handle it?** Use these as the acceptance script — a subsystem is "done" only when its story plays end-to-end in the app.
>
> **Constraint legend:** ⏰ deadline · 🧠 emotional blocker · 😴 physical state (sleep/food/energy) · 📍 environment/place signal · 🎲 curveball.

---

## Story 1 — "The 4 AM Mirage" 🔴 tests: Perception · Predictor · Proactive
**Constraints:** ⏰ OS assignment due 9:00 AM (now 3:40 AM) · 🧠 avoidance + perfectionism (won't submit "ugly" code) · 😴 awake 21 hours, opened app 14× tonight · 🎲 phone battery 12%.

Arjun has reopened Avnik for the 14th time since midnight, each time for 40 seconds, each time closing it. He types: *"i'll just rewrite the whole thing properly, i have time."*

**What Avnik *should* do:** notice the 14 micro-opens + the 21h awake window → infer **sleep-deprived + avoidant-perfectionism, not "fresh start"** → **Augur** says *"miss-risk 86%; you have one 5-hour window and you're spending it reopening me."* → **Herald** moves first: *"Don't rewrite. Submit the working ugly version by 8:30, polish only if time remains. Start the 2-Minute Rule now."* → logs the all-nighter as a belief-shift toward burnout.

**Can the build do it today?**
- ✅ Tone/Regulator would reply warmly and pick a calming voice.
- ✅ North Star would TMT-rank the single task.
- ❌ **No Sentinel** → the 14 opens + 21h-awake are invisible. It can't tell "fresh start" from "avoidance spiral."
- ❌ **No Augur** → no 86% miss-risk warning.
- ❌ **No Herald** → it waits to be asked; it never says "don't rewrite, submit now" first.
> **Verdict: FAILS at the critical moment.** It comforts; it doesn't save. Needs Sentinel + Augur + Herald.

---

## Story 2 — "The Dining-Table Drift" 🟠 tests: Places · Perception · Pattern
**Constraints:** ⏰ DSA practice goal (10 problems today, 2 done by 2 PM) · 🧠 boredom masked as "I deserve a break" · 📍 phone has sat at the dining-table zone for 70 minutes · 🎲 it's the 3rd 70-min "break" this week.

Avnik sees the phone dwell in the dining zone post-lunch, stationary, for 70 minutes — far longer than eating.

**What Avnik *should* do:** **Cartographer** tags zone=dining; **Sentinel** infers *ate ~20 min ago, now drifting* → recognizes the **recurring 70-min post-lunch drift pattern** (3rd time) → **Auditor** names it: *"This is your 3rd long lunch-drift this week — boredom, not hunger. Your next problem is an easy one (Two Sum variant). 2 minutes?"* → **Quartermaster** picks the 2-Minute Rule to re-enter.

**Can the build do it today?**
- ✅ Quartermaster picks a technique *if asked*.
- ✅ Auditor can grade *if the events existed*.
- ❌ **No Cartographer/Sentinel** → no place, no dwell-time, no "ate," no drift detection. The whole scenario is invisible.
> **Verdict: FAILS — entirely unobservable.** This is the exact "he's at the dining table, he ate" vision. Needs Cartographer + Sentinel + the event tracker.

---

## Story 3 — "The Perfection Cage" 🟠 tests: Belief engine · Anti-Perfection · Self-eval
**Constraints:** ⏰ internship cover-letter due tonight · 🧠 fear-of-judgement → perfectionism · 🎲 has rewritten the opening paragraph **9 times** in 90 minutes, each saved as a journal-ish note.

Arjun: *"it's still not good enough, the first line has to be perfect."*

**What Avnik *should* do:** count 9 rewrites of the same artifact → **Actuary** shifts the belief distribution **perfectionism 15%→58%, confidence rising** → flags *hidden* procrastination (motion ≠ progress) → **Anti-Perfection Mode**: *"You've rewritten line 1 nine times. Ship the 'B+' version — recruiters read 7 seconds. Lock the opener, write the body."* → the **Mirror** shows the belief shift with a confidence bar.

**Can the build do it today?**
- ✅ Tone (Sensei) could push focus *if it knew*.
- ❌ **No Actuary/`lib/math`** → no Bayesian update, no perfectionism %, no confidence score, no Mirror.
- ❌ **No Anti-Perfection detector** → 9 rewrites look like 9 normal edits.
> **Verdict: FAILS.** It can't *count behavior* or *update a belief*. Needs Actuary + the rewrite/Anti-Perfection signal + the Mirror card.

---

## Story 4 — "Collapse Week" 🔴 tests: Multi-deadline planning · Belief shift · Scope renegotiation
**Constraints:** ⏰ **three** deadlines in 48h (OS lab, DBMS quiz, club poster) · 🧠 burnout + low mood ("everything's falling apart") · 😴 slept 4h, skipped 2 meals · 🎲 dropped a 12-day Pomodoro streak yesterday.

**What Avnik *should* do:** **Actuary** detects the burnout signature (sleep↓, meals↓, streak broken, mood↓) → belief shifts to **burnout 15%→61%** → **North Star** triages the 3 deadlines (drop/shrink the poster, protect the graded two) → **Herald** *renegotiates scope* proactively: *"You can't do all three at 100%. Plan: DBMS quiz (highest weight) → OS lab minimum-viable → poster = template. Eat first, then 25-min start."* → does **not** shame the broken streak.

**Can the build do it today?**
- ✅ North Star genuinely TMT-ranks 3 tasks — this part works.
- ⚠️ Tone would be kind but generic.
- ❌ **No Actuary** → can't detect the burnout signature or shift the belief.
- ❌ **No Herald** → won't proactively renegotiate scope or say "eat first."
- ❌ **No habit/streak model** → doesn't know the 12-day streak broke.
> **Verdict: PARTIAL.** The ranking works; the *diagnosis* and *proactive triage* don't. Needs Actuary + Herald + habit tracking.

---

## Story 5 — "The Silence" 🔴 tests: The loop · Silence Speaks · Re-entry
**Constraints:** 🎲 user **hasn't opened Avnik for 3 days** · 🧠 shame spiral (avoiding the app *because* he's behind) · ⏰ a deadline he set passed yesterday, unmarked.

Nobody types anything. That's the whole point.

**What Avnik *should* do:** **Metronome** notices 72h of silence + a passed self-set deadline → triggers **Sentinel's "Silence Speaks"** → **Herald** sends *one* gentle, non-guilt re-entry: *"No pressure — you went quiet around your Thursday deadline. Want to just tell me what happened? One sentence."* → on return, **Auditor** logs the gap without shaming.

**Can the build do it today?**
- ❌ **Nothing runs when the user is absent.** Every agent is request→response. No Metronome, no loop, no Silence Speaks, no proactive re-entry.
> **Verdict: TOTAL MISS.** This is the single biggest architectural gap — Avnik currently *cannot act on its own*. Needs Metronome (loop) + Sentinel (silence) + Herald (re-entry). Without this it's a chatbot, not a companion.

---

## Story 6 — "The Plateau" 🟡 tests: Runtime tool creation · Boredom diagnosis
**Constraints:** ⏰ no fire — steady 3-week streak · 🧠 **boredom + over-planning** (re-plans instead of doing) · 🎲 the 8 built-in techniques all feel stale; energy curve peaks oddly at 10 PM.

Arjun: *"pomodoro is boring now and 25 mins feels random for me."*

**What Avnik *should* do:** **Auditor** diagnoses boredom + over-planning (not avoidance) → **Artificer** *invents a new technique at runtime* from his data: *"Built you a '75/15 Night Flow' — 75-min blocks at your 10 PM peak, 15-min breaks. Want it added?"* → registers it as a usable timer-tool (the "MCP tools that create themselves").

**Can the build do it today?**
- ✅ `factory.createTechnique()` *exists* as a function.
- ❌ **No Artificer agent** drives it — nothing analyzes the user and *calls* the factory with invented parameters. It's a dead function.
- ⚠️ Auditor could spot boredom *if the math/events fed it*.
> **Verdict: FAILS (but closest).** The factory is wired; the agent that invents and calls it isn't. Needs Artificer + Actuary's energy-curve data.

---

## 📊 Sufficiency matrix — "are the agents good enough?"

| Story | Subsystem under test | Existing agents enough? | Missing piece |
|---|---|---|---|
| 1 · 4 AM Mirage | Perception + Predict + Proactive | ❌ | Sentinel · Augur · Herald |
| 2 · Dining Drift | Places + Perception | ❌ | Cartographer · Sentinel · tracker |
| 3 · Perfection Cage | Belief engine + Anti-Perfection | ❌ | Actuary · Anti-Perfection · Mirror |
| 4 · Collapse Week | Multi-deadline + diagnosis + renegotiate | ⚠️ partial | Actuary · Herald · habit model |
| 5 · The Silence | The autonomous loop | ❌ total miss | Metronome · Sentinel · Herald |
| 6 · The Plateau | Runtime tool creation | ❌ (closest) | Artificer · Actuary energy data |

**Bottom line:** the **conversation + reasoning agents are good enough** — they win the "talks like it understands you" moments. But **5 of 6 stories break at the decisive beat**, all for the same reason: Avnik **can't perceive, can't compute belief, and can't move first.** Build **Sentinel, Cartographer, Actuary, Augur, Herald, Metronome, Artificer** (see [`../AUDIT.md` §3](../AUDIT.md)) and these stories start passing.
