# LifeOS — Context, Movement, Health & Behavioral Twin (`lifeos.md`)

> Part of **Avnik**. Master → [`../FEATURES.md`](../FEATURES.md). The **Personal Life Operating System** layer: understand behavior from many signals, not just tasks. These are extra **senses** ([`sensing.md`](sensing.md)) feeding the **brain** ([`agentic.md`](agentic.md)) + **math** ([`math/`](math/README.md)).
> **The innovation is FUSION, not measurement.** Combining signals + psychology + tasks to answer *"Given your energy, stress, location & history, what's the best next action right now?"*

> ⚠️ **Honest phasing:** most raw sensors need a phone/wearable + permissions → **roadmap** for a 36-hr web build. But the **framework + several signals are buildable now**, and the [tool layer](tools.md) lets us ship **simulated sensors** today and swap real ones later with zero logic change.

## 🔒 Privacy-first principle (non-negotiable)
Every signal is **opt-in**, per-signal toggles, on-device where possible, explainable, and deletable. The user **chooses which signals to share.** No silent collection.

---

## 1. Context Engine — places · 🟡 light (manual) / 🌌 auto
User defines places **once** (with the env mapping you mentioned — tag a zone as eating / bath / study / sleep):
📍 Home · 🏢 Office · 📚 Library · ☕ Coffee shop · 🏋️ Gym · 🛏 Bedroom · 🍽 Dining
Then the AI adapts: at **Library** → *"Your highest-focus spot — start the hardest task?"*; at **Home, late** → *"Let's wrap with a 15-min review, not something new."*
```ts
places = [{ id, label, emoji, zoneType:'sleep'|'eat'|'bath'|'study'|'office'|'shop'|'other', geo?:{lat,lng,radius} }]
```
- [ ] **Buildable now:** manual place/zone definitions + "what should I do here" adaptation.
- [ ] 🌌 Roadmap: auto-detect place via geofence (mobile).

## 2. Movement Intelligence · 🟡 partial / 🌌 full
Beyond step-count: **daily steps · sitting duration · walking breaks · commute time · standing time.**
*"You've been sitting 2.5 hrs. A 5-min walk now could help before your next focus session."*
- [ ] **Buildable now:** in-app **sitting timer** (since last focus/activity) → walk nudge.
- [ ] 🌌 Roadmap: steps/commute/standing via Google Health Connect.

## 3. Breathing & Stress Detection ⭐ · 🟡 guided / 🌌 measured
Realistic about consumer devices. With a wearable: **HR · HRV · respiratory rate · SpO₂**. Without one: **guided breathing** / a phone-based session — *don't claim continuous measurement.*
Interpretation (roadmap): elevated HR + low HRV + task avoidance → likely stressed → *"You seem tense. One-minute breathing before deciding whether to continue?"*
- [ ] **Buildable now:** 1-minute **guided breathing exercise** (offered when avoidance/stress detected from behavior/self-report).
- [ ] 🌌 Roadmap: wearable HR/HRV/SpO₂ ingestion + stress inference.

## 4. Energy Prediction · 🟡 light
Estimate energy from signals instead of asking "are you tired?" Inputs: sleep, sleep consistency, activity, calendar load, focus sessions, time of day, previous workload. Output:
```
Mental    ███████░░ 72%
Physical  █████░░░░ 54%
Stress    ████░░░░░ 38%
```
- [ ] **Buildable now:** estimate from available/self-reported signals (time, calendar, focus history, mood). Richer with wearables later. Feeds "What Now?" + Day Planner.

## 5. Environment Score · 🟡 self-report / 🌌 sensors
Signals: **noise level** (mic, permission) · **lighting** (ambient sensor) · **device usage** (screen time / app-switching) · location type. *"This café has been one of your most productive places this month."*
- [ ] **Buildable now:** self-reported environment + device-usage proxy (in-app activity).
- [ ] 🌌 Roadmap: real mic-RMS noise + ambient-light sensors (web support is limited → mobile).

## 6. Personal Productivity Map ⭐ · 🟡 light
Learn place → best activity: Office→Highest Focus · Home→Creative · Library→Deep Study · Coffee→Planning · Gym→Stress Recovery. Now the AI suggests **where**, not just what.
- [ ] **Buildable now (light):** derive from logged events + places → "do deep work at the Library."

## 7. Behavioral Digital Twin ⭐⭐⭐ · 🌌 roadmap (seeded demo)
A daily-updating model. Nodes: Personality · Energy · Stress · Sleep · Confidence · Focus · Environment · Task Type · Motivation · Health · Root Causes.
> **This IS the [Personal Cognitive Graph](math/cognitive-graph.md)** — these signals become nodes; edges learned over time. Seed it for the demo; full learning = roadmap.

---

## Hackathon caution (your own, kept)
Don't build every sensor. Instead: integrate **Google Health Connect** (Android, permissioned) where easy · use **phone + calendar** signals · **simulate** advanced reasoning from the data you do have. Ship the [tool interface](tools.md) + simulated sensors now; swap real later.

## How these feed the brain
| Signal | Used by |
|---|---|
| Place / zone | Productivity Map, "What Now?", Coach context-length |
| Sitting time, activity | walk nudges, Energy Prediction |
| HR/HRV/breathing | Stress → Emotion Check-in, breathing intervention |
| Energy bars | Triage, Day Planner, Motivation Meter |
| Environment score | Productivity Map, scheduling "where" |
| All of the above | the Behavioral Digital Twin / Cognitive Graph |

## Build phasing (summary)
- ⭐/🟡 **Now:** place+zone definitions, sitting timer + walk nudge, guided breathing, energy estimate (available signals), productivity map (light), all via simulated [tools](tools.md).
- 🌌 **Roadmap:** real steps/HR/HRV/SpO₂/noise/light sensors, auto-geofence, full Behavioral Digital Twin.
