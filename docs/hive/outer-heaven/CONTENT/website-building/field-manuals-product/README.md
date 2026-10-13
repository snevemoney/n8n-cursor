# Field Manuals product preview — tactile manual open / held-docs UI behind the brand shell

SAMPLE. CapEx / preview only. Live `/` stays **HOLD**. Not a live product. No send, no pay, no outbound. invent_kpi=0.

Why this exists: the Field Manuals launch story sells **documentation you pick up and hold — a manual lifts off the desk, opens in hand, thumb-tabs take you to the section, steps get ticked — not a 48 MB PDF dump**. The public `/work/field-manuals` case page only shows a landing screenshot, and nothing behind its primary CTA resolves. This folder is the product that makes the video true, so Creative Studio can capture real plates. Pattern cloned from `../ironlane-product/` (PR #323). Brief: `FORGE_BRIEF.md` (packet, not in repo). Videos and Remotion comps were **not** touched.

Held-docs UI: pick a manual (lifts into the hand frame), open it (contents + thumb-tabs), tick steps. All motion is CSS transform; `prefers-reduced-motion` cuts instead of lifts. Sample manuals only.

```bash
cd docs/hive/outer-heaven/CONTENT/website-building/field-manuals-product
bash serve.sh        # 127.0.0.1:4866   (override: FIELDMANUALS_PORT=…)
npm test             # node --test, no install
```

| URL | What it proves |
|-----|----------------|
| `/` | Safety-orange Field Manuals shell with the PDF-dump contrast struck through. Every CTA points at `manual.html`. |
| `/manual.html` | The desk. Deterministic **empty** hand on load (three manuals shelved, “Nothing in hand”). Tap a manual → lifts into the hand frame, stage `held`. Open → stage `open`, contents + thumb-tabs (Setup / Operate / Troubleshoot). Tick steps → progress `n/N` on the Operate tab; all ticked → toast. Put back → shelved again. |
| `/manual.html?state=held&manual=m1` | Manual 1 lifted, not yet open. |
| `/manual.html?state=open&manual=m2` | Manual 2 open in hand on Setup (the plate). |

## Tokens

Placeholder palette in `assets/field-manuals.css` `:root` (brand `#ff7a3d`). SSOT `launch-samples/project/src/lib/tokens.ts` → `VERTICALS.field-manuals` is **not in this repo**; swap the `:root` block when Creative Studio hands the tokens over. Layout does not depend on the values.

## Files

- `index.html` shell · `manual.html` product door
- - `assets/manual.js` pure held-docs state (manuals, pick/open/close/put back, sections, steps, query) · `assets/manual-ui.js` DOM
- `assets/field-manuals.css` brand shell + dark product chrome, mobile ≤720px
- `tests/*.test.mjs` — state machine + page/link checks (“no local href points at a missing file”)
- `GRADE.md` — Watchdog fills. Forge does not self-PASS.

## Verification

`npm test` green is the API rung. Headed click-live (`click-live-site`, per-step `verify-after-browser`) is the next rung; Watchdog grades. Batch critic packet: `../product-match-critic/BATCH.md`.

## Not here

- The real `/work/field-manuals` case page lives in `client-engine-1` (operator Mac), not this repo. Wiring its CTA to this preview is a separate, HITL step.
- Real Field Manuals content, search, PDF rendering, print.
- Payments, login, real users, real data, deploy.
