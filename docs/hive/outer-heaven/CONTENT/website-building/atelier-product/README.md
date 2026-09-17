# Atelier Cohort product preview — request a seat / cohort waitlist behind the plum shell

SAMPLE. CapEx / preview only. Live `/` stays **HOLD**. Not a live course. No drip, no send, no outbound. invent_kpi=0. Door tag in the brief: **HOLD** (product-mode tag, not a deploy gate).

Why this exists: the Atelier Cohort launch story sells **a seat request for a twelve-chair cohort** — not a funnel opt-in with a lead magnet and a seven-email drip. The `/work` case page only shows a landing. This folder is the product that makes the story true, so Creative Studio can capture real plates. Pattern cloned from `../ironlane-product/` (PR #323). Videos and Remotion comps were **not** touched.

```bash
cd docs/hive/outer-heaven/CONTENT/website-building/atelier-product
bash serve.sh        # 127.0.0.1:4845
npm test             # node --test, no install
```

| URL | What it proves |
|-----|----------------|
| `/` | Plum Atelier shell (nav About/Cohorts/Seats, hero “Twelve chairs. Request one.”). Every CTA points at `seat.html`. **No** `<input>`, no subscribe/newsletter/lead-magnet copy on the shell (tested). |
| `/seat.html` | Deterministic **empty** state: Autumn cohort, seat map with 9 taken / 3 open. Pick an open chair → **Request this seat** → chair turns green “✓ Sample maker”, pill “seat N held”, outcome card, toast. Switch to Winter (full) → button becomes **Join the waitlist** → outcome “Waitlist · place 3” (brand tone, not green). Funnel-spam card mutes once requested. |
| `/seat.html?cohort=winter` | Lands on the full cohort. |
| `/seat.html?state=held` · `?state=waitlisted` | The two success pictures. |

## Files

- `index.html` shell · `seat.html` seat map + waitlist
- `assets/seat.js` pure state (empty → held | waitlisted; no clock, no `setInterval`, so no countdown is even possible) · `assets/seat-ui.js` DOM
- `assets/tokens.css` brand tokens — **swap point** for `VERTICALS.atelier` from `launch-samples/project/src/lib/tokens.ts` (not in this repo; values are preview placeholders) · `assets/product.css` shared token-only shell (identical across the six book-path slices)
- `tests/*.test.mjs` — state machine, full-cohort branch, data honesty (12 chairs, no duplicate takens), page/link checks, no-opt-in guard, CapEx locks, serve.sh binding

## Verification

`npm test` → node tests. `GRADE.md` in this folder is **UNFILLED** — Watchdog fills it. Forge does not self-PASS. Batch index: `../critic/BATCH-book-path-20260917.md`.

## Not here

- The real `/work/atelier-cohort` case page lives in `client-engine-1` (operator Mac), not this repo. Wiring its CTA to this preview is a separate HITL step.
- Real students, payments, seat-hold timers, email, deploy.
