# PR: Test math + story verification; fix 3 integration bugs

**Branch:** `test/math-and-story-verification` → `main`

## Summary
Built test harnesses for the math engine and the live agent pipeline, ran them against the 6 hard stories, and fixed three real integration bugs the tests surfaced.

## What's verified
- **Math — 30/30 deterministic checks** (`scripts/test-math.ts`, no LLM): Bayesian belief updates, slip-risk, sleep/place inference, self-score, phone-motion classifier, passive belief tracker. → [`review/MATH-TESTS.md`](MATH-TESTS.md)
- **Live pipeline — 4 conversations, ~23 turns** (`scripts/test-conversations.ts`): routing 76%, 30+ sub-agents fire distinctly, dining-table inference works end-to-end, state threads forward. → [`review/CONVERSATION-TESTS.md`](CONVERSATION-TESTS.md)
- **Belief evolution confirmed live** (`scripts/verify-belief-wiring.ts`).

## Bugs fixed
1. **Sentinel unreachable** — Helmsman route whitelist omitted `"sentinel"`; all sleep/location/silence fell back to `tone`. Fixed + verified.
2. **Belief engine never wired into chat** (chicken-and-egg: beliefs never bootstrapped). Added always-on passive Bayesian tracker (`lib/agents/tracker.ts`) as Helmsman Step 1.5 → every turn updates beliefs and feeds all downstream agents.
3. **Brittle evidence regex** (`rewriting`, `never good enough` missed) — broadened.

Plus: deterministic `[ROUTE_TO:x]` handling; **phone motion sensors** (`lib/tools/motion.ts` + `lib/useMotion.ts`).

## Known issues (follow-up, not in this PR)
- Groq 12k-TPM rate limit under burst → add Gemini fallback + backoff in `lib/ai.ts`.
- Duplicate `estimateSleepFromGap` (sensing.ts vs sentinel/sleep-estimator.ts) → consolidate.
- Naive-Bayes saturation → consider damping repeated identical evidence.

## Full write-up
[`review/FINDINGS.md`](FINDINGS.md)

---
### To push & open this PR (no remote configured yet)
```bash
# create an empty GitHub repo first (gh or web), then:
git remote add origin https://github.com/<you>/avnik.git
git push -u origin main
git push -u origin test/math-and-story-verification
# then open the PR on GitHub (or: gh pr create --base main --head test/math-and-story-verification -F review/PR_BODY.md)
```

🤖 Generated with [Claude Code](https://claude.com/claude-code)
