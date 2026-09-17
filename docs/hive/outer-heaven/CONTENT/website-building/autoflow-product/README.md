# Autoflow product preview — visual-editor idea screens (cite-only) behind the brand shell

SAMPLE. CapEx / preview only. Live `/` stays **HOLD**. Not a live product. No send, no pay, no outbound. invent_kpi=0.

Why this exists: the Autoflow launch story sells **a visual editor where ideas sit as nodes on a canvas, connect with lines, and each one carries the source it came from**. The public `/work/autoflow` case page only shows a landing screenshot, and nothing behind its primary CTA resolves. This folder is the product that makes the video true, so Creative Studio can capture real plates. Pattern cloned from `../ironlane-product/` (PR #323). Brief: `FORGE_BRIEF.md` (packet, not in repo). Videos and Remotion comps were **not** touched.

**Cite-only · NOT finance.** This Autoflow is an idea canvas. It is not `autoflow-finance` (a different hive project) and carries no ledger, invoice, budget or money vocabulary — tests assert that. Every node shows `cited` or `uncited`; the screen is ready only when all are cited.

```bash
cd docs/hive/outer-heaven/CONTENT/website-building/autoflow-product
bash serve.sh        # 127.0.0.1:4862   (override: AUTOFLOW_PORT=…)
npm test             # node --test, no install
```

| URL | What it proves |
|-----|----------------|
| `/` | Violet Autoflow shell with the name-collision contrast card struck through. Every CTA points at `editor.html`. |
| `/editor.html` | The editor. Deterministic **blank canvas** on load. Add idea → node appears at the next grid slot. Select node A then B → Connect draws the line (inline SVG). Select a node → paste a source → Cite. Footer: `cited n/m`; stage flips to `cited` when n = m > 0. |
| `/editor.html?state=example` | Example screen: four nodes, three connections, one uncited (the amber badge picture). |
| `/editor.html?state=cited` | Same screen with every node cited — the ready picture. |

## Tokens

Placeholder palette in `assets/autoflow.css` `:root` (brand `#8b6cff`). SSOT `launch-samples/project/src/lib/tokens.ts` → `VERTICALS.autoflow` is **not in this repo**; swap the `:root` block when Creative Studio hands the tokens over. Layout does not depend on the values.

## Files

- `index.html` shell · `editor.html` product door
- - `assets/canvas.js` pure canvas state (nodes, edges, cites, deterministic grid layout) · `assets/canvas-ui.js` DOM + inline SVG edges
- `assets/autoflow.css` brand shell + dark product chrome, mobile ≤720px
- `tests/*.test.mjs` — state machine + page/link checks (“no local href points at a missing file”)
- `GRADE.md` — Watchdog fills. Forge does not self-PASS.

## Verification

`npm test` green is the API rung. Headed click-live (`click-live-site`, per-step `verify-after-browser`) is the next rung; Watchdog grades. Batch critic packet: `../product-match-critic/BATCH.md`.

## Not here

- The real `/work/autoflow` case page lives in `client-engine-1` (operator Mac), not this repo. Wiring its CTA to this preview is a separate, HITL step.
- `autoflow-finance` (hive project, vault template `PROJECTS/autoflow-finance.md`) is unrelated; nothing from it is referenced.
- Drag-and-drop, persistence, export, collaboration.
- Payments, login, real users, real data, deploy.
