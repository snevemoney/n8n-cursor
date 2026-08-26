---
name: wealth-daily-show
description: >-
  Trading-day wake for Wealth Manager: Mac host-gate, then book + tape
  research → DailyReport → Higgsfield Juno batch (or skip if wavs match)
  → one locked render-juno-day.sh. Cloud aborts. Publish stays HITL.
---

# Wealth daily show (Cursor)

Load `scripts/hive/grok-skills/wealth-daily-show.md` and follow it.

**V2 visual systems:** MARKET → PORTFOLIO → DEEP DIVE → OPPORTUNITY RADAR → ACTION, plus a sourced yesterday-delta. Screens show evidence; voice interprets. Formulas in `apps/portfolio-brief-remotion/src/data/formulas.ts` — missing inputs stay UNKNOWN. Do not invent scores, Next-NVDA names, or fake price paths. Full law is in the SSOT file.

**Owner:** Wealth Manager (cold unless Evens names the desk or Enables the Glass row).  
**Host:** Mac only. Cloud / `/workspace` abort: `Remotion is on origin/main but this host cannot render.`  
**Engine:** `apps/portfolio-brief-remotion` · `DailyShow` + optional `Morning60`.  
**Card:** `DONE-CHECK` episode + Juno pack (or named say fallback) + `out/daily-YYYY-MM-DD-vo-juno.mp4` · `CAP` 1 day · `COST` Higgsfield Juno (`get_cost` first, `use_unlim` false) or local `say`.

Wired loop: `new-episode.sh` → `voice-pack-ready.sh` (SKIP_TTS or `generate_audio_batch` ≤12) → typecheck may run while TTS is in flight → one background `render-juno-day.sh` (lockfile refuses a second writer). Do not open Studio. Do not scoop the dirty checkout.

**Since cap (2026-08-25 → reset 2026-08-26):** Aug 26 Juno mp4 is Mac-local only; V2 is PR 64 (not merged); Cloud cannot render; no fake scores / Next-NVDA. See SSOT “Since cap / current truth.”

Automation paste: `desk-missions-now/wealth/pastes/01-wealth-daily-show.md`. Hard step: send / pay / deploy / book / publish stay Evens.

Grok `/` copy: `~/.grokbot/skills/wealth-daily-show/SKILL.md` (generated from SSOT).
