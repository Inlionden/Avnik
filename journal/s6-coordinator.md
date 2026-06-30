# 🪞 S6 — Coordinator — Journal (reads all, checks, integrates)

> The 6th session. Reads `s1`–`s5` journals + the code, verifies consistency, flags what's improper, maintains the integration plan. Does **not** rewrite others' files — flags issues to the owning session; does final wiring at integration.

## What to check each pass
- **Contract adherence** — did anyone deviate from the Shared Contracts (`types/ai/memory/tools/agent` interfaces)? (scan ⚠️ flags in journals)
- **Interface match** — do consumers' expected signatures match producers' exposed ones? (e.g. S2 calls `runBayesUpdate(evidence)` — does S3 expose exactly that?)
- **No duplicates/conflicts** — two sessions building the same thing or editing shared files.
- **Coverage gaps** — any rubric item / hero feature with no owner yet (cross-check [`../FEATURES.md` §6](../FEATURES.md)).
- **"Improper"** — deviations from specs, hardcoded that should be dynamic, missing error/empty states, broken contracts.

## Coordination pass template
```
## Pass <n> — <YYYY-MM-DD HH:MM>
Reviewed: S1<✓/–> S2<> S3<> S4<> S5<>
✅ Consistent: <...>
⚠️ Mismatch / improper: <S? expects X, S? exposes Y → tell S? to fix>
❌ Missing / gap: <rubric item / feature with no owner>
🔗 Integration actions: <what to wire, in what order>
🚦 Go / No-go: <ready to integrate? blockers?>
```

## Integration duties (final)
- Wire the Helmsman → real agents; swap mock tools (analytics←S3, sensing←S5) for real.
- Connect pages to live agents; one nav shell; smoke-test the full loop ([`../STORY.md`](../STORY.md) as the test script).
- Then: deploy Google Cloud · GitHub (tag `v1-submission`) · Google Doc · submit on BlockseBlock.

<!-- Add coordination passes below -->
