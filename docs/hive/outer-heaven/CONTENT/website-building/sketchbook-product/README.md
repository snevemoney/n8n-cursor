# Sketchbook product preview — desk-book page-turn site interaction behind the brand shell

SAMPLE. CapEx / preview only. Live `/` stays **HOLD**. Not a live product. No send, no pay, no outbound. invent_kpi=0.

Why this exists: the Sketchbook launch story sells **a site that sits on the desk like a sketchbook and turns page by page — not another template that looks like every other template**. The public `/work/sketchbook` case page only shows a landing screenshot, and nothing behind its primary CTA resolves. This folder is the product that makes the video true, so Creative Studio can capture real plates. Pattern cloned from `../ironlane-product/` (PR #323). Brief: `FORGE_BRIEF.md` (packet, not in repo). Videos and Remotion comps were **not** touched.

Page turns are CSS 3D transforms on a two-page spread, with `prefers-reduced-motion` collapsing them to a cut. Pages are sample content. Keyboard arrows turn pages too.

```bash
cd docs/hive/outer-heaven/CONTENT/website-building/sketchbook-product
bash serve.sh        # 127.0.0.1:4864   (override: SKETCHBOOK_PORT=…)
npm test             # node --test, no install
```

| URL | What it proves |
|-----|----------------|
| `/` | Kraft Sketchbook shell with the template-sameness contrast struck through. Every CTA points at `book.html`. |
| `/book.html` | The book. Deterministic **closed** state on load (cover only). Open → spread 1. Next / Prev turn spreads with a CSS 3D flip; ← → keys work. Position pill `spread n / N`. Reaching the colophon flips the stage to `end` + toast “Read to the end”. |
| `/book.html?state=open&page=2` | Lands open on spread 2. |
| `/book.html?state=end` | Lands on the colophon (the end picture). |

## Tokens

Placeholder palette in `assets/sketchbook.css` `:root` (brand `#e0b878`). SSOT `launch-samples/project/src/lib/tokens.ts` → `VERTICALS.sketchbook` is **not in this repo**; swap the `:root` block when Creative Studio hands the tokens over. Layout does not depend on the values.

## Files

- `index.html` shell · `book.html` product door
- - `assets/pages.js` pure book state (pages, open/close, next/prev/goTo, query) · `assets/pages-ui.js` DOM + flip class toggling
- `assets/sketchbook.css` brand shell + dark product chrome, mobile ≤720px
- `tests/*.test.mjs` — state machine + page/link checks (“no local href points at a missing file”)
- `GRADE.md` — Watchdog fills. Forge does not self-PASS.

## Verification

`npm test` green is the API rung. Headed click-live (`click-live-site`, per-step `verify-after-browser`) is the next rung; Watchdog grades. Batch critic packet: `../product-match-critic/BATCH.md`.

## Not here

- The real `/work/sketchbook` case page lives in `client-engine-1` (operator Mac), not this repo. Wiring its CTA to this preview is a separate, HITL step.
- Real Sketchbook content, CMS, print export.
- Payments, login, real users, real data, deploy.
