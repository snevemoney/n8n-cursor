---
name: wealth-daily-show
description: >-
  Trading-day wake for Wealth Manager — research the book plus GLOBAL/US/CA
  tape, write unknowns (required) and opportunities, register a DailyReport,
  then render the default ~7min DailyShow with Higgsfield Juno
  on this Grok desktop. Morning60 is optional. New tickers are data only.
  Publish stays HITL. Do not invent prices or a scout name.
---

# Wealth daily show

**Owners:** Wealth Manager  
**Host:** This desk’s **Grok desktop computer** (in-session computer + local shell). Evens’ Mac is an optional valid host. Cursor Cloud `/workspace` is **not** a Remotion host. Do **not** wait for Cursor. Do **not** invent a Lambda/VPS worker.  
**Stack:** Grok → Grok browser (research) + Higgsfield plugin (Juno) + **this desktop’s shell** (`npm` / Chrome / `render-juno-day.sh`). Cursor → IDE browser + Shell + Higgsfield MCP on Evens Mac if that sitting is Mac Cursor. Higgsfield `generate_audio` is the plugin — not a helper script.  
**Engine:** `apps/portfolio-brief-remotion` (npm only, in-folder). Compositions `DailyShow` (~7:03) and optional `Morning60`. Do not rebuild visuals. Do not open Studio on the daily path.  
**Cold** unless Evens names Wealth Manager or Enables the Glass row.

**Default artifact (desk path):**  
`$HOME/n8n-cursor/apps/portfolio-brief-remotion/out/daily-YYYY-MM-DD-vo-juno.mp4`  
Override checkout with `WEALTH_DESK_REPO`. Attach that mp4 in this Grok chat so Evens sees it on the desk. Do **not** write onto Evens Mac `out/daily-2026-08-26-vo-juno.mp4`.

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

## Since cap / current truth (2026-08-26)

Grok weekly-capped **2026-08-25**; limit reset **2026-08-26**. Load this before running a day.

- **V2 is on main** `@ 6bad96631` (PR 64 **merged**). Analytic five-act is required: MARKET → PORTFOLIO → DEEP DIVE → OPPORTUNITY RADAR → ACTION. Formulas only on the prediction board; else UNKNOWN. Funnel for empty Next-NVDA — do not fabricate candidates. Remember yesterday when a prior episode exists.
- **V1 watch (Evens Mac local only):** `apps/portfolio-brief-remotion/out/daily-2026-08-26-vo-juno.mp4` — do not re-encode or overwrite. Main episode on git is Aug 25 (`out/daily-2026-08-25-vo-juno.mp4`).
- **Host:** Grok desktop computer is a Remotion host. Evens Mac is optional. Cursor Cloud `/workspace` abort is “wrong host,” not a missing tree.
- **Glass:** automation `8e8d7b8c-a119-11f1-b532-320a589b8025` **Wealth daily show** → connect **`main`**. Cursor Cloud Run ≠ mp4.
- **Dirty checkout:** `hive/desk` stays local. Do not dump onto PRs.
- **Credits (this sitting, live):** Reid 5.1 + Nora 5.1 + Juno Aug25 28.6 + Juno Aug26 27.2 = **66.0**. Remaining **891.5**, plan free. Juno default. `get_cost` first. No `use_unlim`.
- Never invent scores / prices / Next-NVDA / TSX / weights.

## Card

```
DONE-CHECK: episode + registry + Juno pack (or named local-say fallback) + $HOME/n8n-cursor/apps/portfolio-brief-remotion/out/daily-YYYY-MM-DD-vo-juno.mp4 attached in this Grok chat
CAP: 1 trading day / 1 episode
COST: Higgsfield Juno (get_cost first, use_unlim false) + Remotion on this desktop — or local say if session expired
STOP-KIND: metric
HITL: Evens watches. Publish / YouTube / trades = Evens
```

Voice **Juno** preset `a3ce02fe-4d3e-55bc-b4d4-a4801b9acdb4`. Proven pack: `public/voice/2026-08-25/full-higgs-juno/`.

## Faster loop (wired — this desktop)

Work in `$HOME/n8n-cursor/apps/portfolio-brief-remotion` after `desk-checkout.sh`.

1. **Stub** — `bash scripts/new-episode.sh YYYY-MM-DD` (sourced tape only; no hive scoop). Edit if the file exists.
2. **Fill** `DailyReport` from filings / IR / quotes Evens already owns. Required: `unknowns[]`, `markets`, `opportunities`. No invented prices, scores, TSX/FX, or Next-NVDA.
3. **TTS or skip** — `bash scripts/voice-pack-ready.sh YYYY-MM-DD`. `SKIP_TTS` → go to render. `NEED_TTS` → Higgsfield **plugin on this Grok desk**:
   - `balance`. Session expired → **do not loop `mcp_auth`**. Fall back to `bash scripts/render-voice.sh DATE` if this desktop has a local TTS (`say` on Mac). On Grok desktop without `say`: stop and tell Evens Juno session expired — do not invent wavs.
   - Else: `generate_audio` **one** cue with `get_cost: true`. Then **`generate_audio_batch` (≤12 per batch) is the default path** — do not walk cues with sequential `generate_audio`. `use_unlim: false`. Do not pass `get_cost` in the batch. Poll `jobs_wait` / `job_status`. Land wavs + `cues.json` + `VOICE.txt` under `public/voice/DATE/full-higgs-juno/`.
4. **Typecheck may run while TTS is already in flight.** `npm run typecheck` does not block encode. Do not wait on chat.
5. Stills (`qa-stills.sh` / `still-pack.sh`) may run in parallel with TTS. They do not block encode.
6. **The moment the last wav lands** — on **this desktop’s shell**: start **one** background `bash scripts/render-juno-day.sh DATE`. That script refuses a second writer of the same `out/daily-DATE-vo-juno.mp4` (lockfile + pgrep). Do not start a second encode. Do not open Studio. Leave Remotion `--concurrency` unset. Remotion uses its own Chrome — do not claim “Grok cannot render Remotion.”
7. Stop. Attach `out/daily-YYYY-MM-DD-vo-juno.mp4` in this Grok chat. Tell Evens the exact path. He watches.

Automation paste: `desk-missions-now/wealth/pastes/01-wealth-daily-show.md`. Do not hijack Hive daily TRAIN. Do not upload YouTube.

## Inputs

- Date: America/Toronto session date unless Evens names another
- Holdings Evens already gave — do not invent a position
- Schema: `src/data/schema.ts` (`DailyReport`)
- Prior episode under `src/data/episodes/` (first day = “no prior tape”)
- Write: episode file + one `loadEpisode.ts` line + Juno pack + desk mp4 path above

Sacred files stay read-only. Numbers only from sourced research or `compute.ts` / `delta.ts` / `formulas.ts`.

## V2 visual systems (DailyShow) — required

Every full episode maps, in order: **MARKET** (tape / world / calendar) → **PORTFOLIO** (holdings, concentration, look-through, relative YTD, prediction board) → **DEEP DIVE** (NVDA + AAPL: causal network, streak heatmap, consensus range) → **OPPORTUNITY RADAR** (funnel → 0 passed; closest fails only from `opportunities.candidates` / `nextNvda`) → **ACTION** (unknowns, risks, Today’s Capital Plan). Plus a short **WHAT CHANGED SINCE YESTERDAY** beat from `diffEpisodes` — first episode says so; never fake a delta.

Screens show evidence; voice interprets. Scene headlines are short labels (“Seven sessions”, “Look-through”), not the Juno sentence. Prediction-board rows are named formulas in `src/data/formulas.ts`. Missing inputs → UNKNOWN. Do not invent prices, 0–100 scores, Next-NVDA names, TSX prints, weights, or whisper zones. Two YTD scalars → lollipop, not a fake daily path. A 7-print streak → those 7 cells, not a invented 21-day grid. Node size is equal unless the episode supplies `importance`. Evidence chips only from sourced notes already on the tape.

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

- Render on Cursor Cloud `/workspace`, or say “tree missing” when `origin/main` has the three paths
- Wait for Evens’ Mac or Cursor to encode. This Grok desktop runs Remotion.
- Invent a Lambda / VPS / remote worker door
- Open Studio (`:3333`) on the daily path
- Sequential Higgsfield `generate_audio` for the remaining cues (batch ≤12 is default)
- Second `render-juno-day.sh` while a lock/pgrep guard is live
- Overwrite Evens Mac `out/daily-2026-08-26-vo-juno.mp4`
- Scoop hive vault / watch-later / CURSOR_CHATS / dirty checkout into the episode
- New primitive `.tsx` / rebuild visuals / invent prices, scores, TSX/FX, or a scout name
- Trade, publish, YouTube, send / pay / book / deploy
- Hand-edit `~/.grokbot/skills/` · loop `mcp_auth` · second paid TTS · hijack Hive TRAIN
- lightningflow.online / n8ncloud.tech
