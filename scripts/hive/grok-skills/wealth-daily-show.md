---
name: wealth-daily-show
description: >-
  Trading-day wake for Wealth Manager — research the book plus GLOBAL/US/CA
  tape, write unknowns (required) and opportunities, register a DailyReport,
  then render silent Remotion DailyShow visuals on this Grok desktop.
  Higgsfield Juno only if Evens names Juno that sitting. Morning60 optional.
  New tickers are data only. Publish stays HITL. Do not invent prices or a scout name.
---

# Wealth daily show

**Owners:** Wealth Manager. DailyShow is this desk — do not assign it to Forge (Forge is on webnav / evenslouis.ca).  
**Host:** This desk’s **Grok desktop computer** (in-session computer + local shell). Evens’ Mac is optional. Cursor Cloud `/workspace` is **not** a Remotion host. Do **not** wait for Cursor. Do **not** invent a Lambda/VPS worker.  
**Stack:** Grok → Grok browser (research) + **this desktop’s shell** (`npm` / Chrome / `render-day.sh`). Cursor → IDE browser + Shell if that sitting is Mac Cursor. Higgsfield is **off** unless Evens names Juno this sitting.  
**Engine:** `apps/portfolio-brief-remotion` (npm only, in-folder). Composition `DailyShow` (~7:03). Optional `Morning60`. Do not rebuild visuals. Do not open Studio on the daily path.  
**Schedule:** weekdays **9:00** America/Toronto. Write **simpler language**. Stills per act only when Evens asks.  
**Cold** unless Evens names Wealth Manager or Enables the Glass row.

**Default artifact (desk path):**  
`$HOME/n8n-cursor/apps/portfolio-brief-remotion/out/daily-YYYY-MM-DD.mp4`  
Silent Remotion visuals. Not Higgsfield audio. Override checkout with `WEALTH_DESK_REPO`. Attach that mp4 in this Grok chat. Do **not** write onto Evens Mac `out/daily-2026-08-26-vo-juno.mp4`.

Cursor morning `vo-juno` was a one-off. Evens: not again / too many credits. **Juno is named-only.**

## Host gate (first, every wake)

Reject only Cursor Cloud `/workspace` and hosts with no `node`/`npm`. Accept this Grok desktop. Accept Evens Mac.

```
echo "HOME=$HOME PWD=$(pwd -P) HOST=$(uname -s)"
test -d /workspace && echo ABORT_CURSOR_CLOUD && exit 3
command -v node && command -v npm && command -v git
```

Then get the app onto **this** desktop (do not wait for Cursor):

```
# from this computer's shell — Grok desktop computer
bash apps/portfolio-brief-remotion/scripts/desk-checkout.sh
# → clones or ff-pulls origin/main into $HOME/n8n-cursor
# → npm install in apps/portfolio-brief-remotion if needed
# prints DESK_REPO / ENGINE / DESK_MP4 / HOST_OK
```

If `desk-checkout.sh` is not on disk yet (first clone), run the same steps by hand:

```
REPO="${WEALTH_DESK_REPO:-$HOME/n8n-cursor}"
test -d "$REPO/.git" || git clone --depth 1 --branch main https://github.com/snevemoney/n8n-cursor.git "$REPO"
git -C "$REPO" fetch origin main && git -C "$REPO" checkout main && git -C "$REPO" pull --ff-only origin main
cd "$REPO/apps/portfolio-brief-remotion"
test -d node_modules || npm install
```

Prove the three paths exist on the SHA you pulled:

```
git rev-parse HEAD
git ls-tree -d --name-only HEAD apps/portfolio-brief-remotion
git cat-file -e HEAD:scripts/hive/grok-skills/wealth-daily-show.md && echo SKILL_OK
git cat-file -e HEAD:docs/hive/outer-heaven/CONTENT/job-cards/wealth-manager.md && echo CARD_OK
```

Missing path on that SHA → STOP and report the SHA. Paths exist + this host is `/workspace` → ABORT (wrong host, not a missing tree). Scripts enforce the same gate (`scripts/_host-gate.sh`).

Do not scoop the dirty `hive/desk` checkout.

**Law:** Grok, Claude, ChatGPT, and Cursor each read Grok, Claude, ChatGPT, and Cursor. Same brain. Same session store. INDEX: `CONTENT/os/sessions/INDEX.md`.

## Since cap / current truth (2026-08-27)

- **Default product:** silent Remotion DailyShow on this Grok desktop. `desk-checkout.sh` + `render-day.sh` → `out/daily-YYYY-MM-DD.mp4`. Not ~7min Higgsfield Juno.
- **Juno / Higgsfield:** only if Evens names Juno this sitting → then `render-juno-day.sh` → `out/daily-YYYY-MM-DD-vo-juno.mp4`. Cursor morning vo-juno was a one-off.
- **V2 is on main** `@ 6bad96631` (PR 64 **merged** — not open). Five acts required: MARKET → PORTFOLIO → DEEP DIVE → OPPORTUNITY RADAR → ACTION. Formulas only on the prediction board; else UNKNOWN. Empty Next-NVDA stays empty.
- **Host:** Grok desktop encodes. Evens Mac optional. Cursor Cloud `/workspace` abort is “wrong host,” not a missing tree. Not Mac-only.
- **V1 watch (Evens Mac local):** `apps/portfolio-brief-remotion/out/daily-2026-08-26-vo-juno.mp4` — do not re-encode or overwrite.
- **Glass:** automation `8e8d7b8c-a119-11f1-b532-320a589b8025` **Wealth daily show** → connect **`main`**. Cloud Run ≠ mp4.
- **Dirty checkout:** `hive/desk` stays local.
- Never invent scores / prices / Next-NVDA / TSX / weights.

## Card

```
DONE-CHECK: episode + registry + $HOME/n8n-cursor/apps/portfolio-brief-remotion/out/daily-YYYY-MM-DD.mp4 attached in this Grok chat
CAP: 1 trading day / 1 episode
COST: Remotion on this desktop. Higgsfield Juno credits only if Evens named Juno this sitting (get_cost first, use_unlim false)
STOP-KIND: metric
HITL: Evens watches. Publish / YouTube / trades = Evens
```

Stills (`qa-stills.sh` / `still-pack.sh`) only when Evens asks — per act if he asked for stills.

## Faster loop (wired — this desktop)

Work in `$HOME/n8n-cursor/apps/portfolio-brief-remotion` after `desk-checkout.sh`. Weekdays 9:00 America/Toronto.

1. **Stub** — `bash scripts/new-episode.sh YYYY-MM-DD` (sourced tape only; no hive scoop). Edit if the file exists.
2. **Fill** `DailyReport` from filings / IR / quotes Evens already owns. **Simpler language.** Required: `unknowns[]`, `markets`, `opportunities`. No invented prices, scores, TSX/FX, or Next-NVDA.
3. **Typecheck** — `npm run typecheck`. Do not open Studio.
4. **Default render (silent)** — on **this desktop’s shell**: `bash scripts/render-day.sh YYYY-MM-DD` → `out/daily-YYYY-MM-DD.mp4`. One writer. Remotion uses its own Chrome.
5. **Juno only if named this sitting** — then Higgsfield plugin Juno (`get_cost` first, `use_unlim` false; do not loop `mcp_auth`) and `bash scripts/render-juno-day.sh YYYY-MM-DD` → `out/daily-YYYY-MM-DD-vo-juno.mp4`. Otherwise skip Higgsfield.
6. Stop. Attach the default mp4 in this Grok chat. Tell Evens the exact path. He watches.

Automation paste: `desk-missions-now/wealth/pastes/01-wealth-daily-show.md`. Do not hijack Hive daily TRAIN. Do not upload YouTube.

## Inputs

- Date: America/Toronto session date unless Evens names another
- Holdings Evens already gave — do not invent a position
- Schema: `src/data/schema.ts` (`DailyReport`)
- Prior episode under `src/data/episodes/` (first day = “no prior tape”)
- Write: episode file + one `loadEpisode.ts` line + desk mp4 path above

Sacred files stay read-only. Numbers only from sourced research or `compute.ts` / `delta.ts` / `formulas.ts`.

## V2 visual systems (DailyShow) — required

Every full episode maps, in order: **MARKET** (tape / world / calendar) → **PORTFOLIO** (holdings, concentration, look-through, relative YTD, prediction board) → **DEEP DIVE** (NVDA + AAPL: causal network, streak heatmap, consensus range) → **OPPORTUNITY RADAR** (funnel → 0 passed; closest fails only from `opportunities.candidates` / `nextNvda`) → **ACTION** (unknowns, risks, Today’s Capital Plan). Plus a short **WHAT CHANGED SINCE YESTERDAY** beat from `diffEpisodes` — first episode says so; never fake a delta.

Screens show evidence. Write simpler language on the boards. Scene headlines are short labels (“Seven sessions”, “Look-through”). Prediction-board rows are named formulas in `src/data/formulas.ts`. Missing inputs → UNKNOWN. Do not invent prices, 0–100 scores, Next-NVDA names, TSX prints, weights, or whisper zones. Two YTD scalars → lollipop, not a fake daily path. A 7-print streak → those 7 cells, not an invented 21-day grid. Node size is equal unless the episode supplies `importance`. Evidence chips only from sourced notes already on the tape.

## New tickers (data only)

Not a new `.tsx`. `selectScenes` emits extra rows.

1. **Holding** — `meta.universe` + `holdings[]` (`ticker`, `rating`, `tone`, `whatMatters`; other fields only if sourced).
2. **Chapter (optional)** — `names[]`. Omit unknowns. Do not invent prices or scores.
3. **Sleeve watch (optional)** — `nextNvda[]` / `capitalPlan.highestUpsideWatch` only if Evens or a filing named one. Else `[]` / `'none named'`.

**Opportunity-only** (not a holding): `opportunities.candidates[]`. Empty `[]` is correct. Do not invent a scout name.

## Episode fill

Required every day: `meta` (incl. `universe`), `market`, `holdings`, `names`, `nextNvda` (may be `[]`), **`unknowns`** (2–5 rows: “we don’t know X; we would need Y”), `scenarios` (may be `[]`), `capitalPlan`, `close`, `tickerTape`, **`markets`**, **`opportunities`**. Replace every copied stub number. Unknown → omit or `n/a`. `flagMissing()` lists typed gaps; it must not fill them.

Browser: public filings / IR / index quotes only — **this desk’s Grok browser**. After each click: ACT → EXPECTED → OBSERVED → COMPARE → NEXT. No brokerage ticket. No YouTube Studio.

## Never

- Treat ~7min Higgsfield Juno as the default product
- Run Higgsfield / Juno unless Evens named Juno this sitting
- Render on Cursor Cloud `/workspace`, or say “tree missing” when `origin/main` has the three paths
- Wait for Evens’ Mac or Cursor to encode. This Grok desktop runs Remotion. Not Mac-only.
- Invent a Lambda / VPS / remote worker door
- Open Studio (`:3333`) on the daily path
- Overwrite Evens Mac `out/daily-2026-08-26-vo-juno.mp4`
- Scoop hive vault / watch-later / CURSOR_CHATS / dirty checkout into the episode
- New primitive `.tsx` / rebuild visuals / invent prices, scores, TSX/FX, or a scout name
- Assign DailyShow to Forge
- Trade, publish, YouTube, send / pay / book / deploy
- Hand-edit `~/.grokbot/skills/` · loop `mcp_auth` · hijack Hive TRAIN
- lightningflow.online / n8ncloud.tech
