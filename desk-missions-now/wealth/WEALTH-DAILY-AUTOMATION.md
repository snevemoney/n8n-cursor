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
**Artifact:** `$HOME/n8n-cursor/apps/portfolio-brief-remotion/out/daily-YYYY-MM-DD-vo-juno.mp4`  
**Host:** Grok desktop computer (in-session). Evens Mac optional. Cursor Cloud `/workspace` abort.  
**Row:** `8e8d7b8c-a119-11f1-b532-320a589b8025` — draft-update this id only. Do not mint a second row.

```
WAKE: Enabled cadence or Evens names Wealth Manager
HOST: Grok desktop (or Evens Mac). Not Cursor Cloud /workspace.
CLOUD: abort. Cursor /workspace cannot render Remotion.
SCHEDULE: none unless Evens Enables. Save as Inactive is Evens’ click.
```

```
DONE-CHECK: episode + Juno pack (or named say fallback) + desk mp4 attached in Grok chat
CAP: 1 trading day / 1 episode
COST: Higgsfield Juno (get_cost first, use_unlim false) + Remotion on this desktop
HITL: Evens watches. No YouTube. No trades.
```

```
ALLOW: wealth-daily-show · episode + loadEpisode.ts · public/voice/{date}/full-higgs-juno/ · out/daily-*-vo-juno.mp4 · stills
DENY: YouTube · publish · trades · send/pay/deploy/book · Slack · Hive TRAIN hijack · loop mcp_auth · invent tickers · /workspace render · “tree missing” lie · second Glass row · overwrite daily-2026-08-26-vo-juno.mp4 on Evens Mac
```

## First step every wake

On **this** computer (Grok desktop shell):

```
bash apps/portfolio-brief-remotion/scripts/desk-checkout.sh
```

Then prove the three paths on the SHA that script printed.

`/workspace` → **ABORT** (wrong host). Do not say the tree is missing.

Enabled Glass jobs on Cursor Cloud still abort — that host cannot encode. The Grok desk routine is the product path.

## Evens click

Existing row name: `Wealth daily show`.  
Paste: `desk-missions-now/wealth/pastes/01-wealth-daily-show.md`.  
**Save as Inactive.** Do not Enable until you want a sitting. One Enable ≠ YouTube.

After a desktop run: watch the attached mp4. Upload stays you.

## Fallback

Higgsfield `balance` expired: no `mcp_auth` loop. On Mac, `scripts/render-voice.sh` + `scripts/render-day.sh`. On Grok desktop without `say`: stop and say so. Artifact would be `out/daily-YYYY-MM-DD.mp4`, not `-vo-juno`.
