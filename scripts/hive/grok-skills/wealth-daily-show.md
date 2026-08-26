---
name: wealth-daily-show
description: >-
  Trading-day wake for Wealth Manager — research the book plus GLOBAL/US/CA
  tape, write unknowns (required) and opportunities, register a DailyReport,
  then render the default ~7min DailyShow with Higgsfield Juno.
  Morning60 is optional. New tickers are data only. Publish stays HITL.
  Do not invent prices or a scout name.
---

# Wealth daily show

**Owners:** Wealth Manager  
**Host:** Mac only. `/Users/evenslouis/n8n-cursor` or a Mac worktree under `/Users/evenslouis/`. Cloud / `/workspace` / Linux: **ABORT**. Say: `Remotion is on origin/main but this host cannot render.` Do **not** report “tree missing” if `origin/main` has the three paths below.  
**Stack:** Cursor → IDE browser + Shell + Higgsfield MCP. Grok → Grok browser + **Mac ExternalShell** for Remotion. Higgsfield `generate_audio` is MCP — not a helper script.  
**Engine:** `apps/portfolio-brief-remotion` (npm only). Compositions `DailyShow` (~7:03) and optional `Morning60`. Do not rebuild visuals. Do not open Studio on the daily path.  
**Cold** unless Evens names Wealth Manager or Enables the Glass row.

**Default artifact:** `out/daily-YYYY-MM-DD-vo-juno.mp4`

## Host gate (first, every wake)

```
git fetch origin main && git rev-parse origin/main
git ls-tree -d --name-only origin/main apps/portfolio-brief-remotion
git cat-file -e origin/main:scripts/hive/grok-skills/wealth-daily-show.md && echo SKILL_OK
git cat-file -e origin/main:docs/hive/outer-heaven/CONTENT/job-cards/wealth-manager.md && echo CARD_OK
```

Missing path on that SHA → STOP and report the SHA. Paths exist + this host is Cloud → ABORT (wrong host, not a missing tree). Scripts enforce the same gate (`scripts/_host-gate.sh`).

Daily show home is **`origin/main` on the Mac**. Do not scoop the dirty researcher checkout.

## Card

```
DONE-CHECK: episode + registry + Juno pack (or named local-say fallback) + out/daily-YYYY-MM-DD-vo-juno.mp4
CAP: 1 trading day / 1 episode
COST: Higgsfield Juno (get_cost first, use_unlim false) + local Remotion — or local say if session expired
STOP-KIND: metric
HITL: Evens watches. Publish / YouTube / trades = Evens
```

Voice **Juno** preset `a3ce02fe-4d3e-55bc-b4d4-a4801b9acdb4`. Proven pack: `public/voice/2026-08-25/full-higgs-juno/`.

## Faster loop (wired)

1. **Stub** — `bash scripts/new-episode.sh YYYY-MM-DD` (sourced tape only; no hive scoop). Edit if the file exists.
2. **Fill** `DailyReport` from filings / IR / quotes Evens already owns. Required: `unknowns[]`, `markets`, `opportunities`. No invented prices, scores, TSX/FX, or Next-NVDA.
3. **TTS or skip** — `bash scripts/voice-pack-ready.sh YYYY-MM-DD`. `SKIP_TTS` → go to render. `NEED_TTS` → Higgsfield:
   - `balance`. Session expired → **do not loop `mcp_auth`**. Fall back to `bash scripts/render-voice.sh DATE` (skip-if-present is inside that script) + `render-day.sh`. Artifact is `out/daily-DATE.mp4`, not `-vo-juno`.
   - Else: `generate_audio` **one** cue with `get_cost: true`. Then **`generate_audio_batch` (≤12 per batch) is the default path** — do not walk cues with sequential `generate_audio`. `use_unlim: false`. Do not pass `get_cost` in the batch. Poll `jobs_wait` / `job_status`. Land wavs + `cues.json` + `VOICE.txt` under `public/voice/DATE/full-higgs-juno/`.
4. **Typecheck may run while TTS is already in flight.** `npm run typecheck` does not block encode. Do not wait on chat.
5. Stills (`qa-stills.sh` / `still-pack.sh`) may run in parallel with TTS. They do not block encode.
6. **The moment the last wav lands** — start **one** background `bash scripts/render-juno-day.sh DATE`. That script refuses a second writer of the same `out/daily-DATE-vo-juno.mp4` (lockfile + pgrep). Do not start a second encode. Do not open Studio. Leave Remotion `--concurrency` unset.
7. Stop. Tell Evens the mp4 path. He watches.

Automation paste: `desk-missions-now/wealth/pastes/01-wealth-daily-show.md`. Do not hijack Hive daily TRAIN. Do not upload YouTube.

## Inputs

- Date: America/Toronto session date unless Evens names another
- Holdings Evens already gave — do not invent a position
- Schema: `src/data/schema.ts` (`DailyReport`)
- Prior episode under `src/data/episodes/` (first day = “no prior tape”)
- Write: episode file + one `loadEpisode.ts` line + Juno pack + `out/daily-YYYY-MM-DD-vo-juno.mp4`

Sacred files stay read-only. Numbers only from sourced research or `compute.ts` / `delta.ts` / `formulas.ts`.

## V2 visual systems (DailyShow)

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

Browser: public filings / IR / index quotes only. After each click: ACT → EXPECTED → OBSERVED → COMPARE → NEXT. No brokerage ticket. No YouTube Studio.

## Never

- Cloud / `/workspace` render, or “tree missing” when `origin/main` has the three paths
- Open Studio (`:3333`) on the daily path
- Sequential Higgsfield `generate_audio` for the remaining cues (batch ≤12 is default)
- Second `render-juno-day.sh` while a lock/pgrep guard is live
- Scoop hive vault / watch-later / CURSOR_CHATS / dirty checkout into the episode
- New primitive `.tsx` / rebuild visuals / invent prices, scores, TSX/FX, or a scout name
- Trade, publish, YouTube, send / pay / book / deploy
- Hand-edit `~/.grokbot/skills/` · loop `mcp_auth` · second paid TTS · hijack Hive TRAIN
- lightningflow.online / n8ncloud.tech
