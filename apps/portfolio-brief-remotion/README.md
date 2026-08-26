# Daily Wealth Intelligence Video Engine

Remotion engine for a personal daily market show. Research lands in a typed episode file; `selectScenes` picks visualizations. Aug 25 2026 is the first episode — not a one-off slideshow.

- **Format:** 1920×1080 · 30 fps
- **Compositions:** `DailyShow` (~7:03 / 12705 frames, default product) and `Morning60` (~74s commute, optional). `PortfolioBrief` is a DailyShow alias.
- **Default VO:** Higgsfield **Juno** (`full-higgs-juno`) → `$HOME/n8n-cursor/apps/portfolio-brief-remotion/out/daily-YYYY-MM-DD-vo-juno.mp4` on the Grok desktop (Evens Mac optional). Local `say` is the fallback only if that host has it.
- **Automation draft (Inactive):** `AUTOMATION.md` → `desk-missions-now/wealth/WEALTH-DAILY-AUTOMATION.md`
- **Numbers:** only fields on the episode (or formulas in `src/data/compute.ts` / `delta.ts`). No decorative scores. Do not invent TSX / FX / scout prints.

## Daily workflow

Wealth Manager desk SSOT: `scripts/hive/grok-skills/wealth-daily-show.md` (Cursor pointer `.cursor/skills/wealth-daily-show/`).

1. Research the **book** (existing holdings).
2. Research **GLOBAL + US + CA tape** from filings / IR / index pages. Omit a lane if you have no source.
3. Write `markets` + `opportunities` (candidates that are not already in the book).
4. On **this desktop** (`scripts/desk-checkout.sh` pulls `origin/main`): stub → fill → typecheck → still pack → **Higgsfield Juno** (desk plugin; `get_cost` first, `use_unlim` false) → `bash scripts/render-juno-day.sh YYYY-MM-DD`. Morning60 is optional. Local `say` (`render-voice.sh`) only if Higgsfield session expired **and** this host has `say` — do not loop `mcp_auth`.

### New stock (holding)

`universe` + `holdings[]` → optional `names[]` → optional `nextNvda[]`. Never a new `.tsx`.

### New opportunity (not a holding)

A name can be scout-only. Do **not** add it to `universe` / `holdings`. Write `opportunities.candidates[]` `{ticker, market, thesis, tone, whyNow, whatKillsIt, relativeToBook?}`. `excludePortfolioDupes` defaults true. Leave `candidates: []` unless Evens or a sourced page names a non-book ticker.

Publish stays HITL.

Stub + register: `bash scripts/new-episode.sh YYYY-MM-DD` (copied numbers are not live). After stills the desk calls Higgsfield Juno (preset `a3ce02fe-4d3e-55bc-b4d4-a4801b9acdb4`) and lands wavs in `public/voice/YYYY-MM-DD/full-higgs-juno/`. Then: `bash scripts/render-juno-day.sh YYYY-MM-DD` → `out/daily-YYYY-MM-DD-vo-juno.mp4`. That script does **not** call Higgsfield. `FALLBACK=say` runs local Reed/Samantha. Optional commute cut: `bash scripts/render-morning.sh YYYY-MM-DD`. Cursor automation draft: `AUTOMATION.md`.

```ts
import {parseDailyReport} from '../schema';

export const episode = parseDailyReport({
  meta: {date: '2026-08-26', dateLabel: 'AUG 26, 2026', title: 'Daily Wealth Intelligence', thesis: '…', catalyst: '…', universe: ['NVDA']},
  market: {},
  markets: {
    global: {commodities: [{label: 'Oil', note: 'Falling'}]},
    us: {indices: [{label: 'S&P 500', value: '7,677.28', dayPct: 0.32}]},
    // omit `ca` unless a TSX / CAD print is sourced
    calendar: {items: [{when: 'Wednesday', where: 'US', label: 'PCE', why: '…'}]},
  },
  holdings: [],
  names: [],
  nextNvda: [],
  opportunities: {candidates: [], excludePortfolioDupes: true},
  scenarios: [],
  capitalPlan: {
    existingPortfolio: '…',
    freshCapital: '…',
    bestAdd: '…',
    highestUpsideWatch: 'none named',
    biggestRisk: '…',
    nextTrigger: '…',
    ifThen: [],
  },
  close: {headline: '…', body: '…'},
  tickerTape: [],
});
```

Register in `src/data/loadEpisode.ts` — or let `scripts/new-episode.sh` do file + line.

Overnight delta: `diffEpisodes(previous, today)` in `src/data/delta.ts`. First registered day shows **first episode / no prior tape**. Do not fake a delta.

Optional fields (`markets`, `opportunities`, `scenarios`, `nextNvda`, causal `network`, `scores`) render only when present. Empty opportunity board is correct. Missing scores show `n/a` or the scene is omitted — never invent a 73/100.

`unknowns[]` is **required** every episode (short is fine). Highest-leverage first. Scene **What we cannot claim tonight** renders when the list is non-empty. Morning60 shows the first 1–2. `flagMissing()` flags typed gaps only — it does not estimate weights or TSX.

Atmosphere plates live in `public/plates/` + `plates.json` (`beatId → file + caption + usedOnScenes`). One plate per beat, faded behind the matching scene. Plates are metaphor, not data. Do not put fake prices on a generated still.

`capitalPlan` is required every episode.

## Commands (npm in this folder)

Workspace `pnpm` registry failed here before. Stay on npm inside `apps/portfolio-brief-remotion`.

```bash
cd apps/portfolio-brief-remotion
npm install
npm run studio          # http://localhost:3333 — switch DailyShow / Morning60
npm run typecheck
npm run still:qa        # delta, world tape, calendar, opportunity, capital, open, Morning60 → out/engine-qa/
npm run still:pack      # 4 chat stills → out/still-pack/
npm run render:juno     # DailyShow + Juno pack → out/daily-YYYY-MM-DD-vo-juno.mp4
npm run render:voice    # local `say` fallback → public/voice/{date}/{full|morning60}/
npm run render:morning  # optional ~74s → out/morning-YYYY-MM-DD.mp4
npm run render          # 1080p DailyShow → out/daily-2026-08-25.mp4
npm run render:preview  # half-res draft
```

If Studio is already on 3333, reuse it.

## Architecture

```
src/data/schema.ts              DailyReport (Zod) — markets + opportunities
src/data/compute.ts             derived fields only (spreads, streak counts)
src/data/delta.ts               diffEpisodes(prev, curr) → DeltaTape
src/data/view.ts                world-tape lanes + visible opportunities
src/data/episodes/2026-08-25.ts first episode
src/data/formulas.ts            named prediction-board functions (UNKNOWN if inputs missing)
src/engine/selectScenes.ts      five acts: MARKET → PORTFOLIO → DEEP DIVE → RADAR → ACTION
src/viz/                        reusable charts (heatmap, range bar, lollipop, look-through)
src/voice/scriptFromReport.ts   one spoken beat per scene (from report + plan)
src/voice/VoiceTrack.tsx        Remotion <Sequence> + <Audio>, mute if file missing
src/primitives/                 data-driven scene kinds
src/chrome/                     HUD, tape, progress
src/compositions/DailyShow.tsx
src/compositions/Morning60.tsx
```

## Voice

**Default:** Higgsfield **Juno** (desk MCP, not a shell script). Preset `a3ce02fe-4d3e-55bc-b4d4-a4801b9acdb4`. `get_cost` first. `use_unlim` false. Pack: `public/voice/{date}/full-higgs-juno/`. Render: `bash scripts/render-juno-day.sh YYYY-MM-DD`. Proven: `out/daily-2026-08-25-vo-juno.mp4`.

Script is a pure function of `DailyReport` + `ScenePlan`. Cue start frames = cumulative scene durations. If a line is too long for the scene, it is shortened — VO does not overrun the next scene. Target ~2.5 words/sec.

If Higgsfield `balance` session expired: do **not** loop `mcp_auth`. Local fallback:

```bash
bash scripts/render-voice.sh 2026-08-25
# public/voice/2026-08-25/full/*.wav + cues.json
FALLBACK=say bash scripts/render-juno-day.sh 2026-08-25
# or: bash scripts/render-day.sh 2026-08-25 → out/daily-YYYY-MM-DD.mp4
```

Local fallback voice is **Reed (English (US))** (`VOICE=Samantha` restores the compact voice). Not a branded newsreader. Not a clone. If `say` fails, stop — do not call a second paid TTS.

Missing wav files: picture still plays. Publish / YouTube upload stays HITL. Do not trade.
