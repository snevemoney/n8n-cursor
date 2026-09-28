# Ledgerline product preview — demo book + 10-second clarity UI behind the ledger-blue shell

SAMPLE. CapEx / preview only. Live `/` stays **HOLD**. Not a live product. No send, no CRM, no outbound. invent_kpi=0. Door tag in the brief: **DEMO** (product-mode tag, not a deploy gate).

Why this exists: the Ledgerline launch story sells **ten-second product clarity, then a demo on the calendar** — against a page that opens on twenty-four feature tabs (feature fog). The `/work` case page only shows a landing. This folder is the product that makes the story true, so Creative Studio can capture real plates. Pattern cloned from `../ironlane-product/` (PR #323). Videos and Remotion comps were **not** touched.

```bash
cd docs/hive/outer-heaven/CONTENT/website-building/ledgerline-product
bash serve.sh        # 127.0.0.1:4846
npm test             # node --test, no install
```

| URL | What it proves |
|-----|----------------|
| `/` | Ledger-blue shell (nav About/What it is/Demo, hero “Three lines. Then a demo.”). **Clarity block** opens on three sentences (what · who · not) with a measured pill “3 lines · N words · under 40”. Toggle **Show the fog it replaced** → 24 feature tabs in a dense grid, pill “24 feature tabs · no sentence says what it does”. Every demo CTA points at `demo.html`. |
| `/?mode=fog` | Opens on the fog (the contrast picture). |
| `/demo.html` | Deterministic **empty** business-week calendar (Mon–Fri × 4). Pick slot → pick role → **Book demo** → slot green “Demo ✓ Sample finance lead”, pill “demo booked · on the calendar”, outcome card, toast. Three lines recapped in the sidebar. Feature-fog card mutes once booked. |
| `/demo.html?state=booked` | Example demo on the calendar (the success picture). |

The clarity numbers are **measured on the copy in `clarity.js`** (line count, word count, tab count) — facts about the page, not performance claims. Tests refuse `%`, `$`, `Nx`, “faster”, “save” anywhere on the pages.

## Files

- `index.html` shell + clarity block · `demo.html` demo calendar
- `assets/clarity.js` three lines + fog list + measured facts · `assets/clarity-ui.js` toggle DOM
- `assets/demo.js` pure booking state (no clock, no storage) · `assets/demo-ui.js` DOM
- `assets/tokens.css` brand tokens — **swap point** for `VERTICALS.ledgerline` from `launch-samples/project/src/lib/tokens.ts` (not in this repo; values are preview placeholders) · `assets/product.css` shared token-only shell (identical across the six book-path slices)
- `tests/*.test.mjs` — clarity facts, booking state machine, page/link checks, CapEx + no-claims locks, serve.sh binding

## Verification

`npm test` → node tests. `GRADE.md` in this folder is **UNFILLED** — Watchdog fills it. Forge does not self-PASS. Batch index: `../critic/BATCH-book-path-20260917.md`.

## Not here

- The real `/work/ledgerline` case page lives in `client-engine-1` (operator Mac), not this repo. Wiring its CTA to this preview is a separate HITL step.
- Real product, pricing, calendar invites, CRM, deploy.
