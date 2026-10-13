# Working Volumes product preview — shelf pull-a-volume interaction behind the brand shell

SAMPLE. CapEx / preview only. Live `/` stays **HOLD**. Not a live product. No send, no pay, no outbound. invent_kpi=0.

Why this exists: the Working Volumes launch story sells **a shelf of working volumes where you pull one, it slides out and opens on the desk, and you can put it back — not a dead shelf of thumbnails that opens nothing**. The public `/work/working-volumes` case page only shows a landing screenshot, and nothing behind its primary CTA resolves. This folder is the product that makes the video true, so Creative Studio can capture real plates. Pattern cloned from `../ironlane-product/` (PR #323). Brief: `FORGE_BRIEF.md` (packet, not in repo). Videos and Remotion comps were **not** touched.

Pull-a-volume: spines on a shelf, tap to pull (translate + tilt), the pulled volume opens on the desk with its chapters, Reshelve slides it back. CSS transforms only; `prefers-reduced-motion` cuts. Sample volumes.

```bash
cd docs/hive/outer-heaven/CONTENT/website-building/working-volumes-product
bash serve.sh        # 127.0.0.1:4867   (override: WORKINGVOLUMES_PORT=…)
npm test             # node --test, no install
```

| URL | What it proves |
|-----|----------------|
| `/` | Oxblood Working Volumes shell with the dead-shelf contrast struck through. Every CTA points at `shelf.html`. |
| `/shelf.html` | The shelf. Deterministic **shelved** state on load (eight spines, empty desk). Tap a spine → pulls forward, opens on the desk with chapters + status. Pull more → desk stacks, pill `n pulled`. Reshelve → slides back. Reshelve all → empty desk. |
| `/shelf.html?state=pulled&vol=v3` | Volume III on the desk (the plate). |
| `/shelf.html?state=pulled&vol=v1,v5` | Two pulled, desk stacked. |

## Tokens

Placeholder palette in `assets/working-volumes.css` `:root` (brand `#d9564f`). SSOT `launch-samples/project/src/lib/tokens.ts` → `VERTICALS.working-volumes` is **not in this repo**; swap the `:root` block when Creative Studio hands the tokens over. Layout does not depend on the values.

## Files

- `index.html` shell · `shelf.html` product door
- - `assets/shelf.js` pure shelf state (volumes, pull/reshelve, desk order, query) · `assets/shelf-ui.js` DOM
- `assets/working-volumes.css` brand shell + dark product chrome, mobile ≤720px
- `tests/*.test.mjs` — state machine + page/link checks (“no local href points at a missing file”)
- `GRADE.md` — Watchdog fills. Forge does not self-PASS.

## Verification

`npm test` green is the API rung. Headed click-live (`click-live-site`, per-step `verify-after-browser`) is the next rung; Watchdog grades. Batch critic packet: `../product-match-critic/BATCH.md`.

## Not here

- The real `/work/working-volumes` case page lives in `client-engine-1` (operator Mac), not this repo. Wiring its CTA to this preview is a separate, HITL step.
- Real Working Volumes content, reader, purchase.
- Payments, login, real users, real data, deploy.
