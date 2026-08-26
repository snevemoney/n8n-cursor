---
name: wealth-daily-show
description: >-
  Trading-day wake for Wealth Manager: Grok-desktop host-gate, then book +
  tape research → DailyReport → Higgsfield Juno batch (or skip if wavs
  match) → one locked render-juno-day.sh on this desktop. Cloud /workspace
  aborts. Publish stays HITL.
---

# Wealth daily show (Cursor)

Load `scripts/hive/grok-skills/wealth-daily-show.md` and follow it.

**V2 visual systems (on main `6bad96631`):** MARKET → PORTFOLIO → DEEP DIVE → OPPORTUNITY RADAR → ACTION, plus a sourced yesterday-delta. Screens show evidence; voice interprets. Formulas in `apps/portfolio-brief-remotion/src/data/formulas.ts` — missing inputs stay UNKNOWN. Do not invent scores, Next-NVDA names, or fake price paths. Full law is in the SSOT file.

**Owner:** Wealth Manager (cold unless Evens names the desk or Enables the Glass row).  
**Host:** Grok desktop computer (in-session). Evens Mac optional. Cursor Cloud `/workspace` abort.  
**Desk mp4:** `$HOME/n8n-cursor/apps/portfolio-brief-remotion/out/daily-YYYY-MM-DD-vo-juno.mp4` — attach in the Grok chat.  
**Engine:** `apps/portfolio-brief-remotion` · `DailyShow` + optional `Morning60`.  
**Card:** `DONE-CHECK` episode + Juno pack (or named say fallback) + desk mp4 · `CAP` 1 day · `COST` Higgsfield Juno (`get_cost` first, `use_unlim` false) or local `say`.

Wired loop: `desk-checkout.sh` (origin/main on this computer) → `new-episode.sh` → `voice-pack-ready.sh` (SKIP_TTS or `generate_audio_batch` ≤12) → typecheck may run while TTS is in flight → one background `render-juno-day.sh` (lockfile refuses a second writer). Do not open Studio. Do not scoop the dirty checkout. Do not wait for Cursor.

**Since cap (2026-08-25 → reset 2026-08-26):** Aug 26 Juno mp4 is Evens-Mac local — do not overwrite. V2 is merged on main. `/workspace` cannot render. No fake scores / Next-NVDA.

Automation paste: `desk-missions-now/wealth/pastes/01-wealth-daily-show.md`. Hard step: send / pay / deploy / book / publish stay Evens.

Grok `/` copy: `~/.grokbot/skills/wealth-daily-show/SKILL.md` (generated from SSOT).
