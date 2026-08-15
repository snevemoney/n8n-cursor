---
name: verify-after-browser
description: >-
  After a browser or UI act, observe the resulting state and compare
  expected. Do not assume the click landed. Use when a desk clicks,
  types, or navigates, or after click-live-site. Caption-only tapes
  do not invent click traces. Cursor plus Grok Bot.
---

# Verify after browser (Cursor)

Load `scripts/hive/grok-skills/verify-after-browser.md` and follow it.

**Browser path:** IF Cursor (this IDE / Task / click-live-site here) → `cursor-ide-browser` (navigate, snapshot, click, take_screenshot; lock/unlock). Not Chrome / Playwright / browser-use. IF Grok Bot → Grok Bot’s own web browser. Do not call Cursor MCP from Grok. Same card either way.  
**Card:** `ACT` · `EXPECTED` · `OBSERVED` · `COMPARE` · `NEXT` — write it after each click/type/navigate.  
**Wired job:** `click-live-site` — Forge + Watchdog after a surface flow (any owned UI).  
**Spawn:** only if the desk uses the browser this session. Caption-only: no invented clicks.

A click without OBSERVED is a fail. Verify ≠ success.  
Hard step: send / pay / deploy / book / publish stay Evens. No headed drive of those surfaces.

Grok `/` copy: `~/.grokbot/skills/verify-after-browser/SKILL.md`.
