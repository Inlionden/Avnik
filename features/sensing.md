# Perception Layer — Multi-Modal Journaling, Passive + Active Sensing & "Silence Speaks" (`sensing.md`)

> Part of **Avnik**. Master → [`../FEATURES.md`](../FEATURES.md). This is the **PERCEIVE** half of the agentic loop — how Avnik gathers signal — feeding the reasoning brain in [`agentic.md`](agentic.md).
> **Owner agents:** 🗂️ Memory (capture/fuse), 🧠 Profiler (interpret), 💬 Coach (respond). Pillars: 🧠 Memory + 📓 Reflection.

---

## The design principle (non-negotiable)
**Journaling must never become another task.** If users feel forced to write every day, they'll **procrastinate on the journaling itself** — the exact failure mode Avnik exists to fix. So input is **multi-modal across three effort levels**, and the system **never depends on the user writing anything**. The product's question shifts from *"Did you finish your task?"* to *"How are you doing?"*

---

## Level 1 — Full Journal (optional)
If the user *wants* to write, they write freely:

> "Today I finally completed the API integration. I was scared to start because I thought authentication would take hours, but it turned out to be easier than expected."

The AI **extracts structure** from it:
- **Emotion:** Relief
- **Root cause:** Fear of failure
- **Confidence:** Increased
- **Lesson:** Tasks seem harder before starting

**Perceive→Reason→Act:** free text → LLM extraction → updates Root Cause Engine ([agentic.md L2](agentic.md)) + Dynamic Personality (L5) + writes a Knowledge Journal page (L9).
**Implementation points:**
- [ ] Free-text journal entry box (and voice note → transcript).
- [ ] Extraction prompt → `{ emotion, rootCause, confidenceDelta, lesson }` stored to memory.
- [ ] Never required; entirely opt-in.

## Level 2 — Quick Check-in (10 seconds)
If they don't want to write, just ask two one-tap questions.

**How are you feeling?**
😀 Great · 🙂 Good · 😐 Okay · 😔 Stressed · 😫 Exhausted

**What best describes today?**
Productive · Distracted · Overwhelmed · Motivated · Confused · Burned out

**One tap.** That's the whole interaction.
**Implementation points:**
- [ ] Two-question chip UI (mood + day descriptor); stores `{mood, dayTag, ts}`.
- [ ] Maps mood/tag → emotion + provisional root-cause signal.
- [ ] < 10 seconds; dismissible.

## Level 3 — Zero-Effort Logging ⭐
If the user answers **nothing at all**, the AI still learns from **behavior**:
- Planned 5 tasks, completed 4.
- Started work 2 hours later than planned.
- Switched tasks frequently.
- Worked continuously for 90 minutes.
- Missed one deadline.

The AI can infer and reflect back:
> "You didn't write today, but I noticed you completed more tasks than yesterday. Great progress."

**So the system never depends entirely on journal entries.**
**Implementation points:**
- [ ] Derive daily behavior summary from `events[]` (planned vs done, start delay, task-switch count, longest focus, missed deadlines).
- [ ] Inference + warm reflection prompt → feeds the same root-cause / confidence model as Levels 1–2.

---

## Passive + Active Intelligence (the fusion)
Avnik has **two sources of information** and **combines them**:

**Active (what the user tells you)**
- Journal · Voice notes · Mood check-ins · Reflection · Goals

**Passive (what the AI observes)**
- Task completion · Delays · Time spent · Calendar events · Focus sessions · Schedule changes

**Combine them — worked example:**
> User says: *"I'm feeling tired."*
> AI notices: slept late · had four meetings · completed only one deep-work session.
> Response: *"Your low productivity today seems related to **workload rather than motivation**. Tomorrow, try scheduling your hardest task before your meetings."*

**Perceive→Reason→Act:** fuse active statement + passive signals → distinguish *workload* vs *motivation* vs *emotion* → give a precise, non-generic intervention.
**Implementation points:**
- [ ] `fuse(activeSignals, passiveSignals)` → a single interpreted state before any response.
- [ ] Always check passive evidence before accepting an active claim at face value (tired-because-workload vs tired-because-avoidance).

---

## "Silence Speaks" ⭐ (unique feature)
If a user **normally journals every evening but suddenly stops for four days**, do **not** send a generic reminder. Instead, reach out gently:

> "I've noticed you've been quieter than usual. You don't have to write anything today. If you'd like, just tap one word that describes how you're feeling."

Options:
😄 Great · 😐 Okay · 😔 Stressed · 😴 Tired · 😟 Anxious
Or simply: **Skip**

**Even the act of skipping is data** — not proof of a problem, but a signal considered alongside everything else.
**Perceive→Reason→Act:** detect a break from the user's *own baseline* rhythm → respond with care, not pressure → log the response (including a skip) as a soft signal.
**Implementation points:**
- [ ] Track each user's journaling/check-in baseline cadence.
- [ ] Detect deviation (e.g. silent ≥ N× their normal gap) → trigger the gentle, no-pressure prompt (one-word taps + Skip).
- [ ] Record outcome (word *or* skip) as a low-weight signal; never alarmist.
- [ ] Tone: supportive, never guilt-inducing. Distinct from the Action-pillar Proactive Nudge (that's about deadlines; this is about wellbeing).

---

## The philosophy behind the product
Most productivity apps ask: **"Did you finish your task?"**
Avnik asks: **"How are you doing?"**
If the user wants to explain, it listens. If they don't, it respects that and keeps learning from patterns. **Supportive, not demanding** — which is what keeps people engaged over months instead of quitting in a week.

---

## How this feeds the brain
| This layer captures | → feeds in [`agentic.md`](agentic.md) |
|---|---|
| Extracted emotion / root cause (L1) | Root Cause Engine (L2) |
| Mood + day tag (L2) | Dynamic Personality (L5), Weekly Report (L7) |
| Behavior summary (L3) | Productivity Theory (L6), Predictive Insights |
| Fused active+passive state | Coach response (L8), "What Now?" |
| Silence / skip signal | wellbeing trend (L5), Board Meeting (L7) |

## Build phasing (honest, 36 hrs)
- **Hero now:** Level 2 (one-tap check-in) · Level 3 (passive from `events[]`) · active+passive fusion in the Coach. These are cheap and make Avnik feel alive.
- **Hero if time:** Level 1 full-journal extraction (ties to Why Journal / L9).
- **Light/roadmap:** "Silence Speaks" baseline-deviation detection (simple version doable in Step 5; richer cadence modeling = roadmap).
