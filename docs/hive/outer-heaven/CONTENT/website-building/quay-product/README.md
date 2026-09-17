# Quay Team product preview — request showing → approve → calendar behind the harbour-blue shell

SAMPLE. CapEx / preview only. Live `/` stays **HOLD**. Not a live brokerage. No call, no send, no outbound. invent_kpi=0. Door tag in the brief: **DEMO** (product-mode tag, not a deploy gate).

Why this exists: the Quay Team launch story sells **showings requested on the page, approved by the agent, landing on the calendar** — instead of cold calls and phone tag. The `/work` case page only shows a landing. This folder is the product that makes the story true, so Creative Studio can capture real plates. Pattern cloned from `../ironlane-product/` (PR #323). Videos and Remotion comps were **not** touched.

```bash
cd docs/hive/outer-heaven/CONTENT/website-building/quay-product
bash serve.sh        # 127.0.0.1:4844
npm test             # node --test, no install
```

| URL | What it proves |
|-----|----------------|
| `/` | Harbour-blue Quay shell (nav About/Listings/Showings, hero “See the place. Skip the phone tag.”). Three sample listings; every CTA points at `showing.html`, listing CTAs preselect via `?listing=`. No `tel:` door (tested). |
| `/showing.html` | Deterministic **empty** state. Pick listing → offer up to 2 windows on a Mon–Sat grid → **Request showing** → pill “requested · awaiting agent approval”, offered slots dashed. **Approve (agent side)** or approve a specific window → slot turns green “Showing ✓ Sample buyer”, pill “approved · on the calendar”, outcome card, toast. Phone-tag card mutes once requested. |
| `/showing.html?state=requested` | Example request awaiting approval. |
| `/showing.html?state=approved` | Example showing on the calendar (the success picture). |
| `/showing.html?listing=quay-12` | Lands with a listing preselected. |

## Files

- `index.html` shell · `showing.html` request → approve → calendar
- `assets/showing.js` pure state (empty → requested → approved; no clock, no storage) · `assets/showing-ui.js` DOM
- `assets/tokens.css` brand tokens — **swap point** for `VERTICALS.quay` from `launch-samples/project/src/lib/tokens.ts` (not in this repo; values are preview placeholders) · `assets/product.css` shared token-only shell (identical across the six book-path slices)
- `tests/*.test.mjs` — state machine, refusals, page/link checks, CapEx locks (no `%`, no `$` figures), serve.sh binding

## Verification

`npm test` → node tests. `GRADE.md` in this folder is **UNFILLED** — Watchdog fills it. Forge does not self-PASS. Batch index: `../critic/BATCH-book-path-20260917.md`.

## Not here

- The real `/work/quay-team` case page lives in `client-engine-1` (operator Mac), not this repo. Wiring its CTA to this preview is a separate HITL step.
- Real listings, MLS data, agent login, SMS, calendar sync, deploy.
