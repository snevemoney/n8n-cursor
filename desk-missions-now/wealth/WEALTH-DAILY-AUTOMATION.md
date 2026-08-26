---
tags: [os, wealth, automation, cadence]
at: 2026-08-26
desk: wealth-manager
machine: wealth-daily-show
status: existing Glass row · Inactive until Evens Saves / Enables
automationId: 8e8d7b8c-a119-11f1-b532-320a589b8025
---

# Wealth daily show — Cursor automation

**Skill:** `wealth-daily-show`  
**Artifact:** `apps/portfolio-brief-remotion/out/daily-YYYY-MM-DD-vo-juno.mp4`  
**Host:** Mac Cursor. Cloud / `/workspace` abort.  
**Row:** `8e8d7b8c-a119-11f1-b532-320a589b8025` — draft-update this id only. Do not mint a second row.

```
WAKE: Enabled cadence or Evens names Wealth Manager
HOST: Mac agent only
CLOUD: abort. Remotion is on origin/main; this host cannot render.
SCHEDULE: none unless Evens Enables. Save as Inactive is Evens’ click.
```

```
DONE-CHECK: episode + Juno pack (or named say fallback) + out/daily-YYYY-MM-DD-vo-juno.mp4
CAP: 1 trading day / 1 episode
COST: Higgsfield Juno (get_cost first, use_unlim false) + local Remotion
HITL: Evens watches. No YouTube. No trades.
```

```
ALLOW: wealth-daily-show · episode + loadEpisode.ts · public/voice/{date}/full-higgs-juno/ · out/daily-*-vo-juno.mp4 · stills
DENY: YouTube · publish · trades · send/pay/deploy/book · Slack · Hive TRAIN hijack · loop mcp_auth · invent tickers · Cloud render · “tree missing” lie · second Glass row
```

## First step every wake

```
git fetch origin main && git rev-parse origin/main
git ls-tree -d --name-only origin/main apps/portfolio-brief-remotion
git cat-file -e origin/main:scripts/hive/grok-skills/wealth-daily-show.md && echo SKILL_OK
git cat-file -e origin/main:docs/hive/outer-heaven/CONTENT/job-cards/wealth-manager.md && echo CARD_OK
```

Three paths on that SHA + Cloud host → **ABORT** (wrong host). Do not say the tree is missing.

Enabled jobs run on **Mac**. `origin/main` is the daily-show home.

## Evens click

Existing row name: `Wealth daily show`.  
Paste: `desk-missions-now/wealth/pastes/01-wealth-daily-show.md`.  
**Save as Inactive.** Do not Enable until you want a sitting. One Enable ≠ YouTube.

After a Mac run: watch the mp4. Upload stays you.

## Fallback

Higgsfield `balance` expired: no `mcp_auth` loop. `scripts/render-voice.sh` + `scripts/render-day.sh`. Artifact is `out/daily-YYYY-MM-DD.mp4`.
