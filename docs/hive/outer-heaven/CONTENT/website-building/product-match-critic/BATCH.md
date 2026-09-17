# Product-match CapEx batch — 9 /work verticals (tools + craft shelves) · critic packet

GRADE **UNFILLED**. Forge built; Forge does not self-PASS. Watchdog grades each slice in its own `GRADE.md`.

Pattern: clone of `../ironlane-product/` (PR #323). Brief: `FORGE_BRIEF.md` (packet, 2026-09-17). Locks held: CapEx / preview only · live `/` HOLD · invent_kpi=0 · no Remotion / video edits · no deploy · no live `/work` wiring · ironlane not redone · ashford / quay / atelier / ledgerline / harbor / northline not touched (other agent).

Branch: `cursor/work-verticals-product-match-capex-dc1b` · content-only under `docs/hive/outer-heaven/CONTENT/website-building/`.

## Slices

| slug | folder | port | door | primary door (story) | `npm test` | DOM smoke* | GRADE |
|---|---|---|---|---|---|---|---|
| proofcheck-qc | `proofcheck-qc-product/` | 4860 | `verify.html` | Sources → Verify Now → voice-kept draft gate (DEMO door, local cite check, no generate) | 18 pass | 10/10 | UNFILLED |
| clearfield | `clearfield-product/` | 4861 | `workbench.html` | Claims / evidence workbench · **no truth adjudicate** (`0 verdicts` in every state) | 18 pass | 9/9 | UNFILLED |
| autoflow | `autoflow-product/` | 4862 | `editor.html` | Visual-editor idea canvas · **cite-only · NOT finance** · name-collision card struck | 16 pass | 9/9 | UNFILLED |
| outer-heaven | `outer-heaven-product/` | 4863 | `walkthrough.html` | Factory line walkthrough, six stations, HITL hold, Ship locked (not “I do AI”) | 15 pass | 8/8 | UNFILLED |
| sketchbook | `sketchbook-product/` | 4864 | `book.html` | Desk-book page-turn (cover → spreads → colophon, arrow keys) | 15 pass | 8/8 | UNFILLED |
| betawise-earth | `betawise-earth-product/` | 4865 | `stage.html` | Owned motion stage — seeded 2D-canvas point globe, no WebGL, 0 stock assets | 16 pass | 6/6 | UNFILLED |
| field-manuals | `field-manuals-product/` | 4866 | `manual.html` | Tactile held-docs: pick → lift → open → thumb-tabs → tick steps → put back | 16 pass | 7/7 | UNFILLED |
| working-volumes | `working-volumes-product/` | 4867 | `shelf.html` | Shelf pull-a-volume → opens on the desk → reshelve | 14 pass | 7/7 | UNFILLED |
| business (Evens Louis) | `business-product/` | 4868 | `proofs.html` | Soft proofs door, building mode, not a deck; sample records, no live links | 16 pass | 8/8 | UNFILLED |

Totals: **144 node tests pass / 0 fail** · 72 DOM-smoke checks match / 0 mismatch.

\* DOM smoke = the real `assets/*-ui.js` modules executed in jsdom (script kept in `/tmp`, not in repo): shell CTA → door, empty state, story clicks, success state, `?state=` deep link, zero uncaught JS errors. It is the API rung, not the headed rung.

Every slice: `bash serve.sh` (127.0.0.1 only, never kills a listener, `<ENV>_PORT` override) · `npm test` (node --test, no install) · `index.html` brand shell with every CTA landing on the door · door with deterministic empty vs success state · friction-contrast card that mutes on success · demo controls (load example / reset) · `[hidden]` beats flex/grid · mobile ≤720px · `prefers-reduced-motion` · SAMPLE / CapEx / invent_kpi=0 on every page · noindex · no external scripts · no fetch / storage / clock / `Math.random` in any module.

## What Watchdog should run (per slice `GRADE.md` has the HYPOTHESIS + hold-outs)

1. `bash serve.sh` + `npm test` — API rung.
2. Headed click-live (`click-live-site`, per-step `verify-after-browser`): shell CTA → door (not 404) → story clicks → success state + toast → `?state=` deep link → 390px.
3. Hold-outs listed in each `GRADE.md` (builder did not script them).
4. Fill `MISS:` and `GRADE:`.

## Blockers / not proven by Forge

- **Tokens SSOT missing.** `launch-samples/project/src/lib/tokens.ts` (`VERTICALS.*`) is not in this repo or on the PR #323 branch. Each slice carries a **placeholder palette** in its `:root` with a `VERTICALS.<slug>` comment; tests pin the placeholder so the swap is one visible diff. Creative Studio hands over tokens → swap the `:root` block per slice.
- **Headed rung not run by Forge.** `cursor-ide-browser` is not in this cloud run's tool catalog; the `computerUse` host was saturated and refused to start; Playwright / browser-use were not used (rule). So no screenshots / 390px captures from Forge. Ironlane's RUN had a headed pass; this batch does not yet.
- **autoflow name collision** is real: `PROJECTS/autoflow-finance.md` exists in the vault template. The slice carries no finance vocabulary (tests assert) and the collision card is struck.
- **outer-heaven sample stamp**: the Grade station shows a stamp labelled “SAMPLE STAMP · not this slice's GRADE”. It must never be read as this slice's grade.
- **business proof cards** are sample records with sample counts, labelled; they do not link to `/work/*` (separate HITL, same gap note as Ironlane).
- Not proven anywhere: screen-reader pass, keyboard-only end to end, real content.

## Hard step

Merge ≠ ship. Publish / deploy / wiring the live `/work` case pages / sending anything stay Evens. Live `/` HOLD.
