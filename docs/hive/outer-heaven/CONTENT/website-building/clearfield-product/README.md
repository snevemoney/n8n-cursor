# Clearfield product preview — claims / evidence workbench (no truth adjudicate) behind the brand shell

SAMPLE. CapEx / preview only. Live `/` stays **HOLD**. Not a live product. No send, no pay, no outbound. invent_kpi=0.

Why this exists: the Clearfield launch story sells **a claims-and-evidence workbench where every claim shows what is attached to it — supports, contradicts, context — and nobody presses a truth button**. The public `/work/clearfield` case page only shows a landing screenshot, and nothing behind its primary CTA resolves. This folder is the product that makes the video true, so Creative Studio can capture real plates. Pattern cloned from `../ironlane-product/` (PR #323). Brief: `FORGE_BRIEF.md` (packet, not in repo). Videos and Remotion comps were **not** touched.

**No truth adjudicate.** The workbench has no True / False / Verdict control, and the state module exports none. `contested` is structural (a claim with both a `supports` and a `contradicts` attachment), not a ruling. Tests assert the absence.

```bash
cd docs/hive/outer-heaven/CONTENT/website-building/clearfield-product
bash serve.sh        # 127.0.0.1:4861   (override: CLEARFIELD_PORT=…)
npm test             # node --test, no install
```

| URL | What it proves |
|-----|----------------|
| `/` | Blue Clearfield shell. Every CTA points at `workbench.html`. |
| `/workbench.html` | The workbench. Deterministic **empty** casefile on load (no claims, evidence pool waiting). Add a claim → select it → tap an evidence card → pick relation → Attach. Per-claim counts, `contested` badge when supports + contradicts both attached. Summary strip always reads `0 verdicts`. |
| `/workbench.html?state=linked` | Example casefile with three claims linked, one contested (the sorted picture). |

## Tokens

Placeholder palette in `assets/clearfield.css` `:root` (brand `#4f8cff`). SSOT `launch-samples/project/src/lib/tokens.ts` → `VERTICALS.clearfield` is **not in this repo**; swap the `:root` block when Creative Studio hands the tokens over. Layout does not depend on the values.

## Files

- `index.html` shell · `workbench.html` product door
- - `assets/casefile.js` pure casefile state (claims, evidence pool, attachments, relations, summary) · `assets/casefile-ui.js` DOM
- `assets/clearfield.css` brand shell + dark product chrome, mobile ≤720px
- `tests/*.test.mjs` — state machine + page/link checks (“no local href points at a missing file”)
- `GRADE.md` — Watchdog fills. Forge does not self-PASS.

## Verification

`npm test` green is the API rung. Headed click-live (`click-live-site`, per-step `verify-after-browser`) is the next rung; Watchdog grades. Batch critic packet: `../product-match-critic/BATCH.md`.

## Not here

- The real `/work/clearfield` case page lives in `client-engine-1` (operator Mac), not this repo. Wiring its CTA to this preview is a separate, HITL step.
- The real `clearfield-evidence-flow` repo (OSINT casefile, link graphs) is a different codebase. This is the story-shaped CapEx stage only.
- Scraping, OSINT feeds, graph rendering, exports.
- Payments, login, real users, real data, deploy.
