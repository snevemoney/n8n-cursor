# ProofCheck QC product preview — sources → Verify Now → voice-kept draft gate behind the brand shell

SAMPLE. CapEx / preview only. Live `/` stays **HOLD**. Not a live product. No send, no pay, no outbound. invent_kpi=0.

Why this exists: the ProofCheck QC launch story sells **a draft that gets checked against its own sources and comes out sounding like you (Sources → Verify Now → gate opens, voice kept)**. The public `/work/proofcheck-qc` case page only shows a landing screenshot, and nothing behind its primary CTA resolves. This folder is the product that makes the video true, so Creative Studio can capture real plates. Pattern cloned from `../ironlane-product/` (PR #323). Brief: `FORGE_BRIEF.md` (packet, not in repo). Videos and Remotion comps were **not** touched.

DEMO door: this **Verify Now** is a local, deterministic cite check. It never generates, never rewrites your words, never calls a model. The real ProofCheck `:8080` Verify Now is billed and is not clicked in click-live (see `flows/proofcheck-local.yaml`).

```bash
cd docs/hive/outer-heaven/CONTENT/website-building/proofcheck-qc-product
bash serve.sh        # 127.0.0.1:4860   (override: PROOFCHECK_PORT=…)
npm test             # node --test, no install
```

| URL | What it proves |
|-----|----------------|
| `/` | Teal ProofCheck shell (nav, hero “Your sources. Your voice. Then Verify Now.”). Every CTA points at `verify.html`. |
| `/verify.html` | The gate. Deterministic **empty** state on load (no sources, blank draft, Verify Now disabled). Add sources → load or type a draft → Verify Now → claim list with `cited` / `uncited`, voice meter “Words changed: 0”, gate `closed` until 0 uncited. Cite a flagged sentence → verify again → gate **open** + toast. |
| `/verify.html?state=verified` | Example draft already verified, gate open (the plate Creative Studio wants). |
| `/verify.html?state=flagged` | Example draft with one uncited claim — the amber flag picture. |

## Tokens

Placeholder palette in `assets/proofcheck.css` `:root` (brand `#1fb6a6`). SSOT `launch-samples/project/src/lib/tokens.ts` → `VERTICALS.proofcheck-qc` is **not in this repo**; swap the `:root` block when Creative Studio hands the tokens over. Layout does not depend on the values.

## Files

- `index.html` shell · `verify.html` product door
- - `assets/verify.js` pure gate state (sources, draft, cite check, voice meter) · `assets/verify-ui.js` DOM
- `assets/proofcheck.css` brand shell + dark product chrome, mobile ≤720px
- `tests/*.test.mjs` — state machine + page/link checks (“no local href points at a missing file”)
- `GRADE.md` — Watchdog fills. Forge does not self-PASS.

## Verification

`npm test` green is the API rung. Headed click-live (`click-live-site`, per-step `verify-after-browser`) is the next rung; Watchdog grades. Batch critic packet: `../product-match-critic/BATCH.md`.

## Not here

- The real `/work/proofcheck-qc` case page lives in `client-engine-1` (operator Mac), not this repo. Wiring its CTA to this preview is a separate, HITL step.
- The real ProofCheck QC app (`:8080`, FR/EN, Sign In, billed Verify Now) is a different codebase. This is the story-shaped CapEx stage only.
- Model calls, PDF upload, accounts.
- Payments, login, real users, real data, deploy.
