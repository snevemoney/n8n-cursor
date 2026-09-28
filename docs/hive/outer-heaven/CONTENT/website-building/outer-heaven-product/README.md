# Outer Heaven product preview — factory / ops proof walkthrough behind the brand shell

SAMPLE. CapEx / preview only. Live `/` stays **HOLD**. Not a live product. No send, no pay, no outbound. invent_kpi=0.

Why this exists: the Outer Heaven launch story sells **a software factory you can walk: spec in, hold-outs hidden, Forge builds, Watchdog grades, Evens holds the ship — not an agency saying it does AI**. The public `/work/outer-heaven` case page only shows a landing screenshot, and nothing behind its primary CTA resolves. This folder is the product that makes the video true, so Creative Studio can capture real plates. Pattern cloned from `../ironlane-product/` (PR #323). Brief: `FORGE_BRIEF.md` (packet, not in repo). Videos and Remotion comps were **not** touched.

**Not “I do AI”.** The hero and the walkthrough talk in stations and artifacts (spec, hold-outs, tests, GRADE, HITL hold). The agency-talk line lives only in the struck friction card. The Grade station shows a *sample* stamp, clearly labelled — the real GRADE for this slice is `GRADE.md`, unfilled.

```bash
cd docs/hive/outer-heaven/CONTENT/website-building/outer-heaven-product
bash serve.sh        # 127.0.0.1:4863   (override: OUTERHEAVEN_PORT=…)
npm test             # node --test, no install
```

| URL | What it proves |
|-----|----------------|
| `/` | Brass Outer Heaven shell with the agency-talk contrast struck through. Every CTA points at `walkthrough.html`. |
| `/walkthrough.html` | The line. Deterministic **empty** state on load (no run, benches dark). Load example spec → station 1 lights. Advance → each station reveals its artifact card (spec excerpt, hold-out count hidden, test tally, sample GRADE stamp, HITL hold). Completes at HITL hold; Ship is shown as a locked station. |
| `/walkthrough.html?state=complete` | Finished run, all benches lit, hold stamped (the plate). |
| `/walkthrough.html?state=grade` | Lands on the Grade station with hold-outs just revealed. |

## Tokens

Placeholder palette in `assets/outer-heaven.css` `:root` (brand `#c9a227`). SSOT `launch-samples/project/src/lib/tokens.ts` → `VERTICALS.outer-heaven` is **not in this repo**; swap the `:root` block when Creative Studio hands the tokens over. Layout does not depend on the values.

## Files

- `index.html` shell · `walkthrough.html` product door
- - `assets/line.js` pure line state (stations, artifacts, advance/back, query) · `assets/line-ui.js` DOM
- `assets/outer-heaven.css` brand shell + dark product chrome, mobile ≤720px
- `tests/*.test.mjs` — state machine + page/link checks (“no local href points at a missing file”)
- `GRADE.md` — Watchdog fills. Forge does not self-PASS.

## Verification

`npm test` green is the API rung. Headed click-live (`click-live-site`, per-step `verify-after-browser`) is the next rung; Watchdog grades. Batch critic packet: `../product-match-critic/BATCH.md`.

## Not here

- The real `/work/outer-heaven` case page lives in `client-engine-1` (operator Mac), not this repo. Wiring its CTA to this preview is a separate, HITL step.
- Real hive state, real runs, Slack, Watchdog integration.
- Any implication that this slice's own GRADE is filled — it is not.
- Payments, login, real users, real data, deploy.
