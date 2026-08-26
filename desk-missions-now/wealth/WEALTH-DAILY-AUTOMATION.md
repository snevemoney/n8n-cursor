---
tags: [os, wealth, automation, cadence]
at: 2026-08-26
desk: wealth-manager
machine: wealth-daily-show
status: existing Glass row · Inactive / no cron unless Evens Enables
send: removed
clock: parked
create: 2026-08-26 · open_automation prefill · later draft-update of live row
automationId: 8e8d7b8c-a119-11f1-b532-320a589b8025
---

# Wealth daily show — Cursor automation draft

**Skill:** `wealth-daily-show`  
**Default artifact:** ~7min `DailyShow` + Higgsfield **Juno** → `apps/portfolio-brief-remotion/out/daily-YYYY-MM-DD-vo-juno.mp4`  
**Host:** **Mac Cursor** only (Higgsfield MCP + npm Remotion). Cloud / `/workspace` must abort. Do not treat a Cloud miss as “tree missing on origin/main.”  
**Wake:** cold unless this automation is Enabled **or** Evens names Wealth Manager.  
**Hijack:** do **not** edit Hive daily TRAIN. TRAIN is signal-train. This is a named row.

Yellow `grokbot_orphans` = **8**. Unrelated. Continue.

```
WAKE: cadence (trading-day) OR Evens names Wealth Manager
HOST: Cursor Automations — local Mac agent only
CLOUD: abort. Remotion is on origin/main; this host cannot render. Run on Mac.
SCHEDULE: no surprise cron. Save as Inactive unless Evens Enables. Optional later: weekday after US cash open, America/Toronto (e.g. 10:05).
RUN-NOW: no until Evens Enables
```

```
DONE-CHECK: episode + registry + stills + Juno pack (or named local-say fallback) + out/daily-YYYY-MM-DD-vo-juno.mp4
CAP: 1 trading day / 1 episode
COST: Higgsfield Juno credits (get_cost first, use_unlim false) + local Remotion — or local say if session expired
STOP-KIND: metric
HITL: Evens watches. No YouTube. No trades.
```

```
ALLOW: wealth-daily-show · episode file + loadEpisode.ts · public/voice/{date}/full-higgs-juno/ · out/daily-*-vo-juno.mp4 · stills
DENY: YouTube · publish · trades · send / pay / deploy / book · Slack · hijack Hive daily TRAIN · loop mcp_auth · invent tickers · rebuild Remotion · Cloud render · fabricate remotion tree
TERRITORY: apps/portfolio-brief-remotion/ + this folder
BYPASS: none
```

## First step every wake (Mac or Cloud)

```
git fetch origin main && git rev-parse origin/main
git ls-tree -d --name-only origin/main apps/portfolio-brief-remotion
git cat-file -e origin/main:scripts/hive/grok-skills/wealth-daily-show.md && echo SKILL_OK
git cat-file -e origin/main:docs/hive/outer-heaven/CONTENT/job-cards/wealth-manager.md && echo CARD_OK
```

If a path is missing on the SHA you printed: **STOP** and report that SHA. Do not invent the tree.

If the three paths exist and this host is Cloud / `/workspace`: **ABORT**. Say: `Remotion is on origin/main at SHA … but this host cannot render. Run on Mac.` Do **not** tell Evens the tree is missing.

## How Evens turns this on

Existing row `8e8d7b8c-a119-11f1-b532-320a589b8025` (name: `Wealth daily show`). Draft-update the paste only. Do not Enable a surprise cron.

- **Name:** `Wealth daily show`
- **Trigger:** none (Off) unless Evens Enables. No cron from agents.
- **Tools:** Higgsfield (`serverName` `higgsfield`). Shell is built-in. No Slack / Stripe / Hostinger / YouTube / GitHub.
- **Repo:** `snevemoney/n8n-cursor` · `main` (form field only). Render host is still **this Mac**.
- **Prompt:** paste from `desk-missions-now/wealth/pastes/01-wealth-daily-show.md`

**One click left if the row is still draft:** **Save as Inactive.** Do not Enable until you want a sitting. One Enable ≠ YouTube.

After a Mac run: watch `out/daily-YYYY-MM-DD-vo-juno.mp4`. Upload stays you.

`open_automation` with this `automationId` + prefill = draft update of **that** row. Do not open a new form (ghost rows). Extra Saves without an id = ghosts.

## Engine on git

Engine **is** on `origin/main` @ **`3ffd55815`** (`Merge pull request #61 from snevemoney/wealth/daily-show-engine`).

Proof (2026-08-26 fetch):

| Path | on `origin/main` |
|---|---|
| `apps/portfolio-brief-remotion` | tree `1f60e43793d8c27619462bd4b8fe78e6fd90dd25` |
| `scripts/hive/grok-skills/wealth-daily-show.md` | blob present (`SKILL_OK`) |
| `docs/hive/outer-heaven/CONTENT/job-cards/wealth-manager.md` | blob present (`CARD_OK`) |

GitHub API `contents/apps/portfolio-brief-remotion?ref=main` lists the folder (not 404).

A Cloud checkout that reports “Remotion / skill / job card missing on origin/main” is **wrong-host or stale checkout**, not a missing merge. Do not invent a 2026-08-26 book in a triage sitting. Re-run the show on **Mac Cursor**.

PR (already merged): https://github.com/snevemoney/n8n-cursor/pull/61

## Fallback

If Higgsfield `balance` session expired: do **not** loop `mcp_auth`. Local `say` via `scripts/render-voice.sh` + `scripts/render-day.sh`. Say so. Artifact is `out/daily-YYYY-MM-DD.mp4`, not `-vo-juno`.
