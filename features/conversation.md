# Conversation & Communication Subsystem (`conversation.md`)

> Part of **Avnik**. Master → [`../FEATURES.md`](../FEATURES.md). A **dedicated agent group** for *how* Avnik talks — separate from *what* it says (that's [`psychology.md`](psychology.md) / [`action.md`](action.md)). This governs **how much, what style, and whether to speak at all.**
> Pillar: 🔍 Reasoning (communication model) · Owner: 💬 Coach + the Conversation group below.

---

## 🗣️ The Conversation Agent Group (the new dedicated team)
A small sub-team that runs **around every Coach reply** and gates every proactive message:

| Sub-agent | Perceives | Acts |
|---|---|---|
| 🎭 **Mood Agent** | active mood check-ins + passive signals ([`sensing.md`](sensing.md)) | tags current mood/energy for this turn |
| 🧭 **Context-Length Agent** | context (walking / deep work / night / busy) | sets a target reply length & verbosity |
| 🎚️ **Style Agent** | the Communication Model (below) | shapes tone/format to the user's profile |
| 📏 **Fit Agent** ⭐ | the drafted reply vs target | checks it's **accurate** — not too big, not too small; right **word usage**/tone; trims or expands |
| 🤫 **Interruptibility Agent** | focus-session state | decides **interrupt vs stay silent**, summarize later |

**Flow:** `Mood + Context + Style → draft → Fit Agent corrects size/wording → send`. Interruptibility gates whether a proactive message fires at all.

---

## Adaptive Conversation Length
The AI shouldn't always reply in paragraphs — it learns how much you want *right now*.
- **Busy** — *User:* "I don't feel like coding." → *AI:* "Start for 5 minutes. I'll check back later." (that's it)
- **Stressed** — *AI:* "You seem overwhelmed today. Let's forget the whole project. What's the smallest thing you can finish in 10 minutes?"
- **Wants coaching** — deeper: *"I think this is fear of failure. Here's why…"*
- **Asks "Why?"** — go deep: psychology, research papers, philosophy.

## Context-Aware Response Length ⭐
Estimate how much attention the user has from context:
- 🚶 Walking → "Meeting in 10 min."
- 💻 Deep work → "Fix line 42."
- 🌙 Night reflection → a detailed explanation / research insight / journal entry.

## Communication Modes (instant switch)
⚡ **Focus** → one-line replies · 💬 **Coach** → medium · 📚 **Research** → detailed + papers · 🤝 **Friend** → casual · 🧠 **Socratic** → mostly questions.
*(Pairs with the coaching **personas** in [`agentic.md` L8](agentic.md): personas = WHO speaks; modes = HOW MUCH.)*

## "Don't Help Me" / Vent button
Sometimes users just vent: *"Today was terrible."* → AI: *"Got it. I saved that. No advice unless you ask."* Restraint makes it feel human — a good coach knows when to stay quiet.

## Interruptibility Score ⭐
In a deep-focus session, ❌ don't say "Remember your meeting in two hours." Instead: stay silent → wait until done → **summarize everything at once.**

---

## The Communication Model (Conversation Profile) — full data model
A second model beside the psychological one. Auto-learned, 0–100 per dimension:

- **Response Style:** short · detailed · bullet points · step-by-step · visual diagrams · examples · analogies · code snippets · research references
- **Motivation Style:** rare quotes · daily encouragement · accountability reminders · strict coaching · friendly coaching · philosophical reflections · humor occasionally · no motivation (just facts)
- **Interaction Style:** asks many questions · gives direct answers · suggests alternatives · waits for input · autonomous planning · requests confirmation before acting
- **Learning Style:** visual · reading · hands-on · video · quiz-based · flashcard
- **Notification Style:** silent · minimal · deadline-only · gentle nudges · frequent · emergency-only

```ts
commProfile = {
  responseStyle:   { short, detailed, bullets, stepByStep, diagrams, examples, analogies, code, research }, // 0–100
  motivationStyle: { rareQuotes, dailyEncouragement, accountability, strict, friendly, philosophical, humor, justFacts },
  interactionStyle:{ asksQuestions, direct, alternatives, waits, autonomous, confirms },
  learningStyle:   { visual, reading, handsOn, video, quiz, flashcard },
  notificationStyle:{ silent, minimal, deadlineOnly, gentle, frequent, emergencyOnly },
  context: { bestLength, workHoursWords, nightWords }, // learned: e.g. <40 words during work hours, detailed at night
}
```

## AI Adaptation (no settings — it just learns)
User often replies "just tell me what to do." → the model updates:
```
Direct Instructions   ██████████ 96%
Long Explanations     ██         18%
Examples              ███████     72%
Motivational Quotes   █            8%
Bullet Points         █████████   91%
```
After a week the style changes **without the user touching settings.** Eventually it knows: *"prefers responses under 40 words during work hours but enjoys detailed explanations at night."*

## How it connects
- **Seeded** by onboarding ([`onboarding-identity.md`](onboarding-identity.md) Live Profile bars = the UI for this model).
- **Consumes** mood + context from [`sensing.md`](sensing.md).
- **Feeds** every Coach reply; the **Fit Agent** is the quality gate on size/wording.

## Implementation points
- [ ] `lib/agents/conversation/` — `mood.ts`, `context.ts`, `style.ts`, `fit.ts`, `interruptibility.ts`.
- [ ] `commProfile` in Memory; update fn after each exchange (heuristic + occasional LLM tag).
- [ ] Mode switcher + Vent button in chat UI; length targets per mode.
- [ ] Fit Agent: post-process the draft to hit target length/format; re-prompt if off.
- [ ] Interruptibility flag blocks proactive nudges during focus blocks.

## Build phasing (honest)
- ⭐ **HERO:** modes, Vent, adaptive length, `commProfile` bars, **Fit Agent** (length/format gate), **Mood Agent** (light).
- 🟡 **Light:** Interruptibility, Context-Length agent.
- 🌌 **Roadmap:** full auto-learning of learning-style & notification-style.
