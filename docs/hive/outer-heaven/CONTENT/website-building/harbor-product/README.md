# Harbor & Co. product preview — job request → calendar visit behind the rope-orange shell

SAMPLE. CapEx / preview only. Live `/` stays **HOLD**. Not a live trade. No call, no send, no quote, no outbound. invent_kpi=0. Door tag in the brief: **DEMO** (product-mode tag, not a deploy gate).

Why this exists: the Harbor & Co. launch story sells **the job written down once and the visit on the calendar** — instead of phone tag. The `/work` case page only shows a landing. This folder is the product that makes the story true, so Creative Studio can capture real plates. Pattern cloned from `../ironlane-product/` (PR #323). Videos and Remotion comps were **not** touched.

```bash
cd docs/hive/outer-heaven/CONTENT/website-building/harbor-product
bash serve.sh        # 127.0.0.1:4847
npm test             # node --test, no install
```

| URL | What it proves |
|-----|----------------|
| `/` | Rope-orange Harbor shell (nav About/Services/Request, hero “Describe the job. Pick the visit.”). Three sample service cards; every CTA points at `job.html`, service CTAs preselect via `?service=`. No `tel:` door, no `$` figure anywhere (tested). |
| `/job.html` | Deterministic **empty** two-step request. **1 · The job**: service, address, one line → **Pick a visit** (disabled until service + address). **2 · Pick a visit**: Mon–Fri × AM/PM grid → **Book visit** → window turns green with the service name on it, pill “visit booked · on the calendar”, outcome card carrying job + address + name, toast. Phone-tag card mutes once booked. |
| `/job.html?service=Small+plumbing` | Lands with a service preselected. |
| `/job.html?state=booked` | Example visit on the calendar (the success picture). |

## Files

- `index.html` shell · `job.html` job → visit
- `assets/job.js` pure state (step 0 → 1 → booked; job rides with the visit; no clock, no storage) · `assets/job-ui.js` DOM
- `assets/tokens.css` brand tokens — **swap point** for `VERTICALS.harbor` from `launch-samples/project/src/lib/tokens.ts` (not in this repo; values are preview placeholders) · `assets/product.css` shared token-only shell (identical across the six book-path slices)
- `tests/*.test.mjs` — state machine, step gating, back/forward round trip, page/link checks, CapEx locks (no `%`, no `$`), serve.sh binding

## Verification

`npm test` → node tests. `GRADE.md` in this folder is **UNFILLED** — Watchdog fills it. Forge does not self-PASS. Batch index: `../critic/BATCH-book-path-20260917.md`.

## Not here

- The real `/work/harbor-co` case page lives in `client-engine-1` (operator Mac), not this repo. Wiring its CTA to this preview is a separate HITL step.
- Real crews, dispatch, quotes, SMS, calendar sync, deploy.
