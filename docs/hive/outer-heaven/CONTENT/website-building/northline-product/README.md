# Northline Clinic product preview — private book + form SLA behind the clinic-teal shell

SAMPLE. CapEx / preview only. Live `/` stays **HOLD**. Not a live clinic. No patient data, no send, no outbound. invent_kpi=0. Door tag in the brief: **HOLD** (product-mode tag, not a deploy gate).

Why this exists: the Northline Clinic launch story sells **one private form with a stated review window and a held slot** — against waitlist chaos (“you are number 47, call back at 8am”). The `/work` case page only shows a landing. This folder is the product that makes the story true, so Creative Studio can capture real plates. Pattern cloned from `../ironlane-product/` (PR #323). Videos and Remotion comps were **not** touched.

```bash
cd docs/hive/outer-heaven/CONTENT/website-building/northline-product
bash serve.sh        # 127.0.0.1:4848
npm test             # node --test, no install
```

| URL | What it proves |
|-----|----------------|
| `/` | Clinic-teal Northline shell (nav About/The SLA/Book, hero “Book privately. Know the SLA.”). Three SLA stage cards. Every CTA points at `book.html`. No `tel:`, no waitlist/queue CTA (tested). |
| `/book.html` | Deterministic **empty** business-week grid (Mon–Fri × 4) + **Form SLA track** (Form received → In clinical review → Slot confirmed, label “1 business day · sample”). Pick slot → visit type → name → **consent checkbox (required)** → **Submit privately** → slot dashed “Requested · in review”, pill “form received · SLA 1 business day · sample”, toast. Clinic-side button advances the track: **Start clinical review** → **Confirm slot** → slot green “Private slot ✓ held privately”, pill “slot confirmed · private”, outcome card. Waitlist-chaos card mutes once submitted. |
| `/book.html?state=received` · `?state=review` · `?state=confirmed` | The three stage pictures. |

The SLA is a **labelled sample promise** the clinic states on the form — not a measured turnaround. Tests refuse `%`, `average`, `typically` in the SLA copy and refuse `email` / `tel` / `date` input types anywhere (no contact or DOB capture in a sample).

## Files

- `index.html` shell · `book.html` private book + SLA track
- `assets/private-book.js` pure state (empty → received → review → confirmed; no clock — the SLA is a label, not a timer) · `assets/private-book-ui.js` DOM
- `assets/tokens.css` brand tokens — **swap point** for `VERTICALS.northline` from `launch-samples/project/src/lib/tokens.ts` (not in this repo; values are preview placeholders) · `assets/product.css` shared token-only shell (identical across the six book-path slices)
- `tests/*.test.mjs` — state machine, consent gate, SLA honesty, page/link checks, CapEx + no-PII locks, serve.sh binding

## Verification

`npm test` → node tests. `GRADE.md` in this folder is **UNFILLED** — Watchdog fills it. Forge does not self-PASS. Batch index: `../critic/BATCH-book-path-20260917.md`.

## Not here

- The real `/work/northline-clinic` case page lives in `client-engine-1` (operator Mac), not this repo. Wiring its CTA to this preview is a separate HITL step.
- Real patients, EHR, consent records, reminders, calendar sync, deploy.
