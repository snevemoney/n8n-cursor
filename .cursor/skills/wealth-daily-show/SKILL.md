---
name: wealth-daily-show
description: >-
  Trading-day routine for Wealth Manager: research book + GLOBAL/US/CA
  + unknowns + opportunities → DailyReport → ~7min DailyShow with
  Higgsfield Juno. Morning60 optional. New tickers are data, not new .tsx.
  Publish stays HITL. Cursor plus Grok Bot.
---

# Wealth daily show (Cursor)

Load `scripts/hive/grok-skills/wealth-daily-show.md` and follow it.

**Owner:** Wealth Manager (cold unless Evens names the desk).  
**Engine:** `apps/portfolio-brief-remotion` · `DailyShow` (~7:03 / 12705 frames) + optional `Morning60` (~74s).  
**Card:** `DONE-CHECK` episode + stills + still-pack + Higgsfield Juno pack (`full-higgs-juno`) + `out/daily-YYYY-MM-DD-vo-juno.mp4` · `CAP` 1 day · `COST` Higgsfield Juno (`get_cost` first, `use_unlim` false) or local `say` if session expired · HITL watch/publish = Evens.

Default product is the **7min Juno DailyShow**, not a thesis-only note. After stills the desk calls Higgsfield MCP (Juno preset `a3ce02fe-4d3e-55bc-b4d4-a4801b9acdb4`); Remotion is `bash scripts/render-juno-day.sh YYYY-MM-DD` on the Mac. If `balance` session expired: do **not** loop `mcp_auth` — fall back to `render-voice.sh` local say and say so.

New stock = `universe` + `holdings[]` → optional `names[]` → optional `nextNvda[]`.  
New opportunity (not a holding) = `opportunities.candidates[]`.  
Required every episode: `unknowns[]` (“we don’t know X; we would need Y”). Never a new scene file. Never invent a score or TSX print.

Automation draft (Inactive until Evens Enables): `desk-missions-now/wealth/WEALTH-DAILY-AUTOMATION.md`. Do not hijack Hive daily TRAIN. Hard step: send / pay / deploy / book / publish stay Evens.

Grok `/` copy: `~/.grokbot/skills/wealth-daily-show/SKILL.md` (generated).
