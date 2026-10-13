# ironlane-4842 — click-live RUN

STATUS: pass (11/11 steps OBSERVED = EXPECTED; two mid-run fixes, both re-verified) · **not a GRADE**
HOST: cloud VM Chrome via computerUse (cursor-ide-browser MCP not in this run's tool catalog; Playwright / browser-use not used). Headed `cursor-ide-browser` re-run by Watchdog welcome.
STARTED: 2026-09-17
STOPPED: 2026-09-17
HARD_STEP: publish — not executed. Live `/` HOLD. Nothing deployed. Videos untouched.

LADDER: api (curl 200 on `/`, `/book.html`, `/book.html?state=confirmed`, `/check.html`, `/check.html?url=…`, 5 assets) → node tests (25 pass / 0 fail, `npm test`) → headed (11 steps, screenshots) → mobile 390px.

## Steps
COMPARE = match on 11/11. Steps 07 and 10 were `match after fix`:
- 07: `hidden` attribute lost to `.actions{display:flex}` → pass CTA leaked into the fail state. Fixed with `[hidden]{display:none!important}` (+ regression test). Re-verified.
- 10: header button clipped at 390px. Fixed with wrapping nav ≤720px. Re-verified.
- Console: one `favicon.ico` 404 on first pass → inline `data:` SVG favicon on all pages. No 404s remain.

## Side-effect
CLAIM: Ironlane preview on 127.0.0.1:4842 has a working book path (shell CTA → calendar → confirmed + toast), deterministic empty/confirmed states, door check with pass/fail/invalid/not-checked, muted-inbox contrast, mobile layout.
SIDE-EFFECT: `website-building/ironlane-product/` (3 pages, 5 assets, 3 test files, serve.sh) + this flow (yaml, RUN, 11 cards, GRADE unfilled). Screenshots + walkthrough mp4 in the PR.
DIFF: content-only under `docs/hive/outer-heaven/CONTENT/`. No `apps/`, no `packages/`, no video sources, no live `/`.

## Not proven here
- Real `/work/ironlane-studio` case page (client-engine-1, operator Mac) still points its CTAs at `/contact`. Wiring it to this preview is a separate HITL step.
- Screen-reader pass (aria hooks present; not read aloud).
- Keyboard-only traversal end to end (focus-visible + 44px targets present; tab order not walked).

## Watchdog GRADE
Forge does not fill. See GRADE.md.
