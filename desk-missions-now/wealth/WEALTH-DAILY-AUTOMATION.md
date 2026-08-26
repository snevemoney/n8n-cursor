---
tags: [os, wealth, automation, cadence]
at: 2026-08-26
desk: wealth-manager
machine: wealth-daily-show
status: Glass draft opened · Inactive / no cron · no automationId returned
send: removed
clock: parked
create: 2026-08-26 · open_automation prefill only · not a live row
automationId: none
---

# Wealth daily show — Cursor automation draft

**Skill:** `wealth-daily-show`  
**Default artifact:** ~7min `DailyShow` + Higgsfield **Juno** → `apps/portfolio-brief-remotion/out/daily-YYYY-MM-DD-vo-juno.mp4`  
**Host:** **Mac Cursor** (Higgsfield MCP + npm Remotion). Not a Cloud Agent checkout of `origin/main`. Cloud cannot see `:3333` and cannot render this engine.  
**Wake:** cold unless this automation is Enabled **or** Evens names Wealth Manager.  
**Hijack:** do **not** edit Hive daily TRAIN. TRAIN is signal-train. This is a new named row.

Yellow `grokbot_orphans` = **8**. Unrelated. Continue.

```
WAKE: cadence (trading-day) OR Evens names Wealth Manager
HOST: Cursor Automations — local Mac agent (not Cloud VM)
SCHEDULE: Glass draft · no cron · Save as Inactive. Optional later: weekday after US cash open, America/Toronto (e.g. 10:05).
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
DENY: YouTube · publish · trades · send / pay / deploy / book · Slack · hijack Hive daily TRAIN · loop mcp_auth · invent tickers · rebuild Remotion
TERRITORY: apps/portfolio-brief-remotion/ + this folder
BYPASS: none
```

## How Evens turns this on

Glass editor was opened **2026-08-26** with this prefill (one new form — Hive TRAIN / GRADE / inbox were not opened):

- **Name:** `Wealth daily show`
- **Trigger:** none (Off). No cron. Will not fire tonight.
- **Tools:** Higgsfield (`serverName` `higgsfield`). Shell is built-in (no allow-list field). No Slack / Stripe / Hostinger / YouTube / GitHub.
- **Repo:** `snevemoney/n8n-cursor` · `main` (form field only). Host is still **this Mac**, not a Cloud VM render.
- **Prompt:** paste from `desk-missions-now/wealth/pastes/01-wealth-daily-show.md`

**One click left:** **Save as Inactive.** Do not Enable until you want a sitting. One Enable ≠ YouTube.

After a run: watch `out/daily-YYYY-MM-DD-vo-juno.mp4`. Upload stays you.

`automationId`: **none returned**. `open_automation` only prefills the form. Extra Saves = ghost rows. Do not reopen this sitting.

## Engine on git

Engine is on `wealth/daily-show-engine` @ `43ec8c028`.  
PR: https://github.com/snevemoney/n8n-cursor/pull/61  
`origin/main` still missing the tree until Evens merges that PR. A Cloud/`origin/main` checkout will keep saying Remotion trees are MISSING until merge. After merge, re-run on the **Mac** with Higgsfield attached — do not invent a 2026-08-26 book in this sitting.

## Fallback

If Higgsfield `balance` session expired: do **not** loop `mcp_auth`. Local `say` via `scripts/render-voice.sh` + `scripts/render-day.sh`. Say so. Artifact is `out/daily-YYYY-MM-DD.mp4`, not `-vo-juno`.
