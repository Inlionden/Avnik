# ✅ Avnik — A+ Answer Demo (post-polish)

> The three previously-blemished responses, re-run through the full pipeline with the Mentor quality layer wired in. Re-run: `npx tsx scripts/demo-aplus.ts`

```

🧑 everything is falling apart, 3 deadlines and i'm completely drained   [mode=vent]
   ↳ burnout vent (was: sage leaked 'let me rephrase')
   🤖 [sage] route=tone  (59 words)
   💬 What's feeling hardest right now. I wonder if it's the weight of all three deadlines at once that's feeling overwhelming. That makes sense given how much you have on your plate. Can you take one slow breath with me and notice what's the very next thing you need to do to move forward, even if it's something very small.
   🧮 belief: burnout 54% · conf 27%
   ✅ clean (no artifacts)

🧑 i'm at the dining table, just finished lunch   [mode=chat]
   ↳ dining-table (was: mislabeled lunch as 'dinner/16:00')
   🤖 [context-reader] route=sentinel  (30 words)
   💬 📍 Looks like you ate (~25 min at dining area around 13:00). Post-meal energy dip coming in ~30 min — schedule your easiest tasks next, save deep work for 3pm.
   🧮 belief: burnout 54% · conf 27%
   ✅ clean (no artifacts)

🧑 ok so what should i actually do next   [mode=plan]
   ↳ planning (mode=plan → concise structured)
   🤖 [north-star] route=north-star  (70 words)
   💬 Since we don't have any tasks ranked yet, let's start by adding your first task: please share the name of one of the tasks with a deadline that's been weighing on you, and I'll help you prioritize and create a plan to tackle it. 

Once you share the task, I can tell you which one to work on RIGHT NOW and provide a 3-step micro-plan for the next 90 minutes.
   🧮 belief: burnout 54% · conf 27%
   ✅ clean (no artifacts)
```

**Fixes that landed:** Mentor layer (`applyMentor`) now wired into Helmsman Step 3.5 → every reply is sanitized + length-fit to its mode; tone prompts forbid self-correction (temps 0.82/0.85 → 0.7/0.75); context-reader reads the **event's** hour (lunch ≠ dinner); sleep-estimator fallback is now useful.
