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
**Stack:** Cursor → IDE browser + Shell + Higgsfield MCP. Grok → Grok browser + **Mac ExternalShell** for Remotion.  
**Host split:** Public filings / IR / quote pages → desk browser. Remotion Studio `:3333` and `npm run render` live on the **user Mac** in `apps/portfolio-brief-remotion`. Box / Grok desk browser cannot see Mac loopback — never open `http://127.0.0.1:3333` from the box and treat it as Studio. Higgsfield `generate_audio` is Cursor MCP (`plugin-higgsfield-higgsfield`) or Grok’s Higgsfield plugin — **not** this helper script.  
**Engine:** `apps/portfolio-brief-remotion` (Remotion 4 · compositions `DailyShow` ~7:03 / 12705 frames and `Morning60` ~74s commute; alias `PortfolioBrief`). Stay on **npm** in that folder. Do not rebuild visuals. Do not mint a second video stack.  
**Aliases:** daily-wealth-intelligence, portfolio-brief-daily  
**Handoff:** `wiki-lint-holdings` (contradictions before thesis) · `cheap-read-expensive-decide` (keep/kill = decision, still HITL to trade) · `input-required-money` if a trade is proposed · Publishing Engine formats only after Evens watches · HITL / Evens watches + publish

Desk stays **cold** unless Evens names Wealth Manager. This skill is the trading-day machine once named.

**Default artifact:** `out/daily-YYYY-MM-DD-vo-juno.mp4` — ~7min `DailyShow` + Higgsfield **Juno**. Not a thesis-only note. Not Morning60-only. Morning60 is an optional second cut.

## When

Evens names Wealth Manager for the daily book, a market-open review, or “run the daily show.” After research is on disk. Before any trade talk. Not a YouTube upload sitting. Not a new scene-design sitting.

Cursor automation draft (Inactive until Evens Enables): `desk-missions-now/wealth/WEALTH-DAILY-AUTOMATION.md` · paste `desk-missions-now/wealth/pastes/01-wealth-daily-show.md` · engine pointer `apps/portfolio-brief-remotion/AUTOMATION.md`. Do not hijack Hive daily TRAIN. Do not upload YouTube.

## Card

```
DONE-CHECK: episode src/data/episodes/YYYY-MM-DD.ts registered in loadEpisode.ts + tsc clean + stills in out/engine-qa/ + still-pack + public/voice/YYYY-MM-DD/full-higgs-juno/ (or full-higgs-juno-YYYY-MM-DD) cues.json + wavs + out/daily-YYYY-MM-DD-vo-juno.mp4
CAP: 1 trading day / 1 episode this sitting
COST: local Remotion + Higgsfield Juno credits (get_cost first, use_unlim false) — or local macOS `say` if Higgsfield session expired. No YouTube. No vendor video render.
STOP-KIND: metric
HITL: Evens watches; publish / YouTube / trades = Evens
```

Until-satisfied is a weak stop. One episode, then halt.

Proven pack (do not invent a second voice): `public/voice/2026-08-25/full-higgs-juno/` · proven file `out/daily-2026-08-25-vo-juno.mp4`. Voice **Juno** preset `a3ce02fe-4d3e-55bc-b4d4-a4801b9acdb4`. Morning Nora sample is a separate optional pack — not the default.

## Inputs

- Date: `YYYY-MM-DD` (America/Toronto session date unless Evens names another)
- Holdings context Evens already gave — do not invent a position
- Research notes / packets (read):
  - `~/.grokbot/research/` and `~/.grokbot/research-packets/`
  - `docs/hive/outer-heaven/CONTENT/job-cards/wealth-manager.md`
  - vault wealth / holdings pages if present (`wiki-lint-holdings` paths)
- Schema SSOT: `apps/portfolio-brief-remotion/src/data/schema.ts` (`DailyReport`)
- Prior episode: latest file under `apps/portfolio-brief-remotion/src/data/episodes/` (delta vs that date — first day = “no prior tape”)
- Write targets (Mac SSOT):
  - `apps/portfolio-brief-remotion/src/data/episodes/YYYY-MM-DD.ts`
  - one registry line in `apps/portfolio-brief-remotion/src/data/loadEpisode.ts`
  - voice pack `public/voice/YYYY-MM-DD/full-higgs-juno/` (or `full-higgs-juno-YYYY-MM-DD`)
  - artifact `out/daily-YYYY-MM-DD-vo-juno.mp4` (+ optional `out/morning-YYYY-MM-DD.mp4`) + `out/engine-qa/` + `out/still-pack/`

Sacred files stay read-only. Numbers only from sourced research or `src/data/compute.ts` / `src/data/delta.ts`. No decorative 73/100 scores. Atmosphere plates in `public/plates/` are metaphor only — never a substitute for a sourced print.

## New stocks (data only — 3 steps)

A new **holding** is **not** a new React scene. `selectScenes` emits extra rows when the fields exist. **Never** add a primitive `.tsx` for a ticker.

1. **Holding / name on the board** — add the ticker to `meta.universe` and a `holdings[]` row (`ticker`, `rating`, `tone`, `whatMatters`; `role` / `ytd` / `drawdown` / `overlapWith` only if sourced).
2. **Deep chapter (optional)** — if the name needs a chapter, add a `names[]` block. Fill only fields you have: `price`, `dayPct`, `streak`, `fundamentals`, `vsSpx` / `returns`, `consensus`, `options`, `narrative`, `network`, `actionMatrix`, `catalyst`, `action`. Empty / unknown → omit the field or write `n/a` in a string you actually sourced as unknown. Do not invent prices, streaks, or scores.
3. **Sleeve watch (optional)** — if it is a Next-NVDA watch, not a chapter: `nextNvda[]` `{ticker, thesis, tone?}` and/or `capitalPlan.highestUpsideWatch`. Leave `nextNvda: []` and `highestUpsideWatch: 'none named'` unless Evens or a sourced filing names one. Do **not** invent a Next-NVDA name.

Then stop. `selectScenes` adds the extra scenes. If the name only belongs on the holdings board, skip step 2.

## New opportunity (not a holding)

A name can be **opportunity-only**. Do **not** add it to `universe` / `holdings` / `names`.

Write `opportunities.candidates[]`:

`{ticker, market: 'US'|'CA'|'GLOBAL', thesis, tone, whyNow, whatKillsIt, relativeToBook?}`

`excludePortfolioDupes` defaults true — a name already in the book is not a “new opportunity.” Empty `candidates: []` is correct when Evens did not name a non-book ticker. Do not invent a scout name to fill the board.

## Browser / terminal

### Terminal (user Mac — Remotion)

```bash
cd /Users/evenslouis/n8n-cursor/apps/portfolio-brief-remotion
DATE=$(TZ=America/Toronto date +%Y-%m-%d)   # or the date Evens named

# stub from latest episode (copied numbers are NOT live — overwrite from research)
bash scripts/new-episode.sh "$DATE"

# after the DailyReport is real and registered:
npm run typecheck
EPISODE_ID="$DATE" bash scripts/qa-stills.sh
EPISODE_ID="$DATE" bash scripts/still-pack.sh

# Higgsfield Juno is the DESK (MCP) — not this script. After wavs land:
bash scripts/render-juno-day.sh "$DATE"
# → out/daily-YYYY-MM-DD-vo-juno.mp4  (voicePack=full-higgs-juno)

# optional second cut (not the default product):
# bash scripts/render-voice.sh "$DATE" && bash scripts/render-morning.sh "$DATE"
```

Stay on **npm** in this folder. Workspace pnpm registry failed here before.

Studio (optional, Mac only): `npm run studio` → http://localhost:3333 — switch composition `DailyShow` / `Morning60`. Reuse if already up. Do not start a second stack.

### Browser

Public **filings / issuer IR / index quote** pages only if cited. Desk browser. No brokerage trade ticket. No YouTube Studio upload.

1. **ACT:** open the cited public filing or quote page. Read. Do not log into a brokerage to trade.
2. **EXPECTED:** the document or quote exists, or 404.
3. **OBSERVED:** title + date + the number you will put on the episode (or UNVERIFIED).
4. **COMPARE:** wiki / yesterday episode vs filing. Conflict → label on the research note, do not silently “fix” a sacred file.
5. **NEXT:** write the episode. Do not order.

Hard step (trade, transfer, publish, YouTube): **ask-principal**. Wealth Manager writes the show; Evens actuates.

Mac localhost Studio `:3333`: ExternalShell on the user Mac only.

## Higgsfield Juno (default VO)

Namespace: `plugin-higgsfield-higgsfield`. Model `seed_audio`. Voice **Juno** · `voice_type: preset` · `voice_id: a3ce02fe-4d3e-55bc-b4d4-a4801b9acdb4`. `use_unlim: false`. Save under `public/voice/YYYY-MM-DD/full-higgs-juno/` (or `full-higgs-juno-YYYY-MM-DD` if the dated folder is needed to keep two packs).

`get_cost` is a flag on `generate_audio`, not a separate tool.

1. Call `balance`. If the session is expired / unauthorized: **do not loop `mcp_auth`**. Say so. Fall back to `bash scripts/render-voice.sh YYYY-MM-DD` (local macOS `say`, Reed / Samantha) then `bash scripts/render-day.sh YYYY-MM-DD`. Tell Evens the artifact is the local-say `out/daily-YYYY-MM-DD.mp4`, not Juno.
2. Print cues: `npx tsx src/voice/printCues.ts YYYY-MM-DD` (full cut).
3. Preflight: `generate_audio` with the same Juno params on **one** cue and `get_cost: true`. Do not submit the batch until the cost is on the card.
4. Generate: `generate_audio_batch` (≤12 per batch) · `use_unlim: false` · do not pass `get_cost` inside the batch. Poll with `jobs_wait` / `job_status`. Download wavs into the pack folder. Write `cues.json` + `VOICE.txt` (Juno · billed · use_unlim false).
5. Remotion is **not** Higgsfield’s job. After wavs land, Grok **Mac ExternalShell** (or Cursor Shell) runs `bash scripts/render-juno-day.sh YYYY-MM-DD`. Cloud / box cannot render.

If wavs already exist in `full-higgs-juno`, skip generation — just render.

## Steps

1. Read the Wealth Manager job card (`desk-wiki-before-work`). Lint holdings if notes conflict (`wiki-lint-holdings`). Social / YouTube = hypothesis until a filing or Evens-given quote backs it (`cheap-read-expensive-decide`).
2. **Research the book** — positions Evens already owns. Do not invent a holding.
3. **Research GLOBAL + US + CA tape** — filings / IR / index pages in the desk browser. Fill only sourced prints. Omit a CA or global index number if the page was not read. Never invent a TSX close, FX print, or scout ticker.
4. Stub today: `bash scripts/new-episode.sh YYYY-MM-DD` (copies latest episode + one registry line). If the file already exists, edit it — do not invent a second episode file.
5. Rewrite the stub into a real `DailyReport`. Required every day: `meta` (incl. `universe`), `market`, `holdings`, `names`, `nextNvda` (may be `[]`), **`unknowns`** (short is fine), `scenarios` (may be `[]`), `capitalPlan`, `close`, `tickerTape`. Write **`markets`** (global / us / ca / calendar — all optional, omit empty lanes) and **`opportunities`** (candidates not already in the book). Overnight delta is computed vs the previous registered date; first episode shows “no prior tape.”
6. **New tickers:** holding recipe above, **or** opportunity-only via `opportunities.candidates`. No new `.tsx`.
7. Replace every copied price / % / score / market print from today’s sources. Leftover yesterday numbers = lie. Unknown → omit or `n/a`. Do not invent. Do not mint a Next-NVDA or opportunity name to fill a board.
7b. **Write `unknowns[]` every episode** (required, can be 2–5 rows). Highest-leverage first — Morning60 shows the first 1–2. Each row: “We don’t know X; we would need Y.” `{id, area: book|US|CA|GLOBAL|name|opportunity, ticker?, question, whyItMatters, neededToKnow, status}`. Optional `confidence` only if a source named the number — never invent 0–100. `flagMissing()` in `src/data/unknowns.ts` may list typed gaps (`ca.tsxClose`, `holdings[].weight`); it must not fill them. Missing CA/TSX, empty scout, missing weights, missing scores → UNKNOWN / omitted, never a plausible fake.
8. `npm run typecheck`. Fix schema errors in the episode file — not in primitives.
9. `EPISODE_ID=YYYY-MM-DD bash scripts/qa-stills.sh` then `bash scripts/still-pack.sh`.
10. **Default VO + render:** Higgsfield Juno (steps above) then `bash scripts/render-juno-day.sh YYYY-MM-DD`. Default output is the ~7min Juno DailyShow. **Morning60 is optional** — only if Evens asks; do not block the sitting on the commute cut.
11. Stop. Tell Evens the mp4 path. He watches. Publish / YouTube stays HITL. Do not schedule, upload, or @ Publishing Engine to post.

## Done-when

On-disk: `src/data/episodes/YYYY-MM-DD.ts` + registry line + Juno pack (or local-say fallback, named as such) + `out/daily-YYYY-MM-DD-vo-juno.mp4` (or fallback `out/daily-YYYY-MM-DD.mp4`) + `out/engine-qa/` + `out/still-pack/` + typecheck pass. Evens has the path. No trade. No publish.

## Never

- Add a primitive `.tsx` / new composition for a new ticker
- Rebuild Remotion visuals
- Invent prices, scores, filings, positions, TSX/FX prints, or a scout name
- Treat copied stub numbers as today’s tape
- Trade, rebalance, or enter an order
- Publish, upload YouTube, or schedule a post
- Send, pay, book, or deploy
- Open Mac `:3333` / `:8080` from the box browser
- Hand-edit `~/.grokbot/skills/` (mirrors are generated)
- Mutate sacred files (OPERATOR_MEMORY, NORTH_STAR, SURVIVAL_CONTRACT, HIVEMIND_DNA, AGENT_CHEAT_SHEET, job cards except the Tools block Forge already owns)
- Open a new lane or mint a new `icp_id`
- Auto-dial, or lead farms
- Loop Higgsfield `mcp_auth` when `balance` says the session expired — fall back to local `say` and say so
- Call a second paid TTS if Juno fails
- Quote tweet income as portfolio proof
- Use lightningflow.online / n8ncloud.tech
- Hijack Hive daily TRAIN for this show
