# Ashford & Vale product preview — private apply → qualify behind the brass shell

SAMPLE. CapEx / preview only. Live `/` stays **HOLD**. Not a live club. No send, no pay, no outbound. invent_kpi=0. Door tag in the brief: **HOLD** (product-mode tag, not a deploy gate).

Why this exists: the Ashford & Vale launch story sells a **private application that qualifies before anyone talks** — the opposite of a loud public Book widget. The `/work` case page only shows a landing. This folder is the product that makes the story true, so Creative Studio can capture real plates. Pattern cloned from `../ironlane-product/` (PR #323). Videos and Remotion comps were **not** touched.

```bash
cd docs/hive/outer-heaven/CONTENT/website-building/ashford-product
bash serve.sh        # 127.0.0.1:4843
npm test             # node --test, no install
```

| URL | What it proves |
|-----|----------------|
| `/` | Brass Ashford shell (nav About/Rooms/Apply, hero “Membership by application.”). Every CTA points at `apply.html`. **No** Book button, no `book.html` anywhere in the slice (tested). |
| `/apply.html` | Three-step private application. Deterministic **empty** state on load. About you → Fit → Review → Submit privately. The answers pick a lane on the page: **Referred** (invite), **Under private review**, or **Not now**. Outcome card + reference `AV-SAMPLE-0001` + toast “Received · private review”. The Loud Book card mutes once received. |
| `/apply.html?state=received` | Example application already under review (the success picture). |

## Files

- `index.html` shell · `apply.html` private apply
- `assets/apply.js` pure state + `qualify()` (no clock, no storage) · `assets/apply-ui.js` DOM
- `assets/tokens.css` brand tokens — **swap point** for `VERTICALS.ashford` from `launch-samples/project/src/lib/tokens.ts` (that file is not in this repo; values here are preview placeholders) · `assets/product.css` shared token-only shell (identical across the six book-path slices)
- `tests/*.test.mjs` — state machine, qualify lanes, page/link checks, CapEx locks, serve.sh binding

## Verification

`npm test` → node tests. `GRADE.md` in this folder is **UNFILLED** — Watchdog fills it. Forge does not self-PASS. Batch index: `../critic/BATCH-book-path-20260917.md`.

## Not here

- The real `/work/ashford-vale` case page lives in `client-engine-1` (operator Mac), not this repo. Wiring its CTA to this preview is a separate HITL step.
- Real applicants, CRM, email, calendar, payments, deploy.
