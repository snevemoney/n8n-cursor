# Evens Louis product preview — soft /work proofs door (building mode) behind the brand shell

SAMPLE. CapEx / preview only. Live `/` stays **HOLD**. Not a live product. No send, no pay, no outbound. invent_kpi=0.

Why this exists: the Evens Louis launch story sells **a soft door into the work: proofs of things being built, with what is proven and what is not, in building mode — not a pitch deck and not an agency**. The public `/work/business` case page only shows a landing screenshot, and nothing behind its primary CTA resolves. This folder is the product that makes the video true, so Creative Studio can capture real plates. Pattern cloned from `../ironlane-product/` (PR #323). Brief: `FORGE_BRIEF.md` (packet, not in repo). Videos and Remotion comps were **not** touched.

**Building mode · not a pitch deck.** The door opens onto proof cards (sample), each with what is proven / what is not / grade status. No slides, no investor copy, no “book a call”. Tests assert the vocabulary lock. Proof cards are sample records here; they do **not** link to the live `/work` case pages (separate HITL).

```bash
cd docs/hive/outer-heaven/CONTENT/website-building/business-product
bash serve.sh        # 127.0.0.1:4868   (override: BUSINESS_PORT=…)
npm test             # node --test, no install
```

| URL | What it proves |
|-----|----------------|
| `/` | Bone-and-graphite Evens Louis shell with the agency-fog contrast struck through. Every CTA points at `proofs.html`. |
| `/proofs.html` | The door. Deterministic **closed** state on load (door shut, “Building mode”). Open → sample proof cards render; pill `n proofs · building mode`. Filter chips All / Building / Graded / Held. Tap a card → detail panel: what shipped, proven, not proven, grade status (`UNFILLED` for held/building, `sample` for graded). Close the door → cards gone. |
| `/proofs.html?state=open` | Door open on All. |
| `/proofs.html?state=open&filter=graded` | Door open on the graded set (the plate). |

## Tokens

Placeholder palette in `assets/business.css` `:root` (brand `#d8d2c4`). SSOT `launch-samples/project/src/lib/tokens.ts` → `VERTICALS.business` is **not in this repo**; swap the `:root` block when Creative Studio hands the tokens over. Layout does not depend on the values.

## Files

- `index.html` shell · `proofs.html` product door
- - `assets/proofs.js` pure door state (sample proofs, open/close, filter, select, query) · `assets/proofs-ui.js` DOM
- `assets/business.css` brand shell + dark product chrome, mobile ≤720px
- `tests/*.test.mjs` — state machine + page/link checks (“no local href points at a missing file”)
- `GRADE.md` — Watchdog fills. Forge does not self-PASS.

## Verification

`npm test` green is the API rung. Headed click-live (`click-live-site`, per-step `verify-after-browser`) is the next rung; Watchdog grades. Batch critic packet: `../product-match-critic/BATCH.md`.

## Not here

- The real `/work/business` case page lives in `client-engine-1` (operator Mac), not this repo. Wiring its CTA to this preview is a separate, HITL step.
- Links to the live `/work/<case>` pages — they exist on evenslouis.ca (client-engine-1, operator Mac) and wiring is separate HITL. Cards here are sample records with sample counts, labelled.
- Contact form, calendar embed, CV download, deck.
- Payments, login, real users, real data, deploy.
