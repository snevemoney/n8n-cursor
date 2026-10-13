# Betawise Earth product preview — owned motion stage (procedural canvas globe) behind the brand shell

SAMPLE. CapEx / preview only. Live `/` stays **HOLD**. Not a live product. No send, no pay, no outbound. invent_kpi=0.

Why this exists: the Betawise Earth launch story sells **a motion stage the studio owns — a procedural point-globe drawn live in the browser — instead of a licensed stock loop everyone else also bought**. The public `/work/betawise-earth` case page only shows a landing screenshot, and nothing behind its primary CTA resolves. This folder is the product that makes the video true, so Creative Studio can capture real plates. Pattern cloned from `../ironlane-product/` (PR #323). Brief: `FORGE_BRIEF.md` (packet, not in repo). Videos and Remotion comps were **not** touched.

**CapEx-safe motion.** No WebGL, no shaders, no libraries: a 2D `<canvas>` point-sphere with a seeded generator (no `Math.random`, no clock reads — time comes from the `requestAnimationFrame` timestamp). `prefers-reduced-motion` freezes the globe on a still frame. Zero stock assets, zero external requests.

```bash
cd docs/hive/outer-heaven/CONTENT/website-building/betawise-earth-product
bash serve.sh        # 127.0.0.1:4865   (override: BETAWISE_PORT=…)
npm test             # node --test, no install
```

| URL | What it proves |
|-----|----------------|
| `/` | Sea-green Betawise shell with the stock-loop contrast struck through. Every CTA points at `stage.html`. |
| `/stage.html` | The stage. Deterministic **dark** state on load (canvas off, “Start the stage”). Start → point-globe turns; pill reads `live · 0 stock assets`. Density sparse / dense, style dots / wire, Pause. Frame counter and rotation readout are derived from rAF time only. |
| `/stage.html?state=live` | Starts turning immediately (the motion plate). |
| `/stage.html?state=live&density=dense&style=wire` | Dense wire variant. |

## Tokens

Placeholder palette in `assets/betawise.css` `:root` (brand `#3fd0a0`). SSOT `launch-samples/project/src/lib/tokens.ts` → `VERTICALS.betawise-earth` is **not in this repo**; swap the `:root` block when Creative Studio hands the tokens over. Layout does not depend on the values.

## Files

- `index.html` shell · `stage.html` product door
- - `assets/globe.js` pure geometry + state (seeded points, rotation, projection, controls, query) · `assets/globe-ui.js` canvas draw loop
- `assets/betawise.css` brand shell + dark product chrome, mobile ≤720px
- `tests/*.test.mjs` — state machine + page/link checks (“no local href points at a missing file”)
- `GRADE.md` — Watchdog fills. Forge does not self-PASS.

## Verification

`npm test` green is the API rung. Headed click-live (`click-live-site`, per-step `verify-after-browser`) is the next rung; Watchdog grades. Batch critic packet: `../product-match-critic/BATCH.md`.

## Not here

- The real `/work/betawise-earth` case page lives in `client-engine-1` (operator Mac), not this repo. Wiring its CTA to this preview is a separate, HITL step.
- WebGL, Three.js, shaders, video files, Lottie, any downloaded asset.
- Real Betawise Earth brand motion — this is the owned-motion proof, not their finished piece.
- Payments, login, real users, real data, deploy.
