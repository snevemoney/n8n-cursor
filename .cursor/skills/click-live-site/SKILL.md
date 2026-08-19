---
name: click-live-site
description: >-
  Click the live surface (alias click-live-surface). After a ship, when
  fixing a previous build, or before calling a factory bite done on a UI.
  Maestro-style flow on any owned URL a human can click. Looks good
  without a click is a fail. Do not install Maestro. Forge and Watchdog.
  Cursor plus Grok Bot.
---

# Click the live surface (Cursor)

Load `scripts/hive/grok-skills/click-live-site.md` and follow it.

**Alias:** `click-live-surface`. **Owners:** Forge + Watchdog.  
**Schema:** `docs/hive/outer-heaven/CONTENT/knowledge/workflows/click-live/SCHEMA.md`  
**Examples:** `flows/evenslouis-ca.yaml` · `flows/proofcheck-local.yaml`

**Surface:** any owned UI we built / will build / fix — prod, staging, preview, or localhost-if-that-is-the-ship. Repo with no UI → not this skill. Native mobile → ASK; do not install Maestro.

**Split:** LEFT living surface · RIGHT flow YAML (`launchApp|navigate` · `scroll` · `tapOn|click` · `swipe` · `assertVisible`). After **each** step: `verify-after-browser`. Status `running|pass|fail` on `flows/{id}/RUN.md`. Watchdog fills GRADE.

**Browser path:** IF Cursor (this IDE / Task / this skill here) → `cursor-ide-browser` (navigate, snapshot, click, take_screenshot; lock/unlock). Not Chrome / Playwright / browser-use. IF Grok Bot → Grok Bot’s own web browser. Do not call Cursor MCP from Grok.

**Runner:** the agent executes YAML steps via those host browser tools and writes per-step OBSERVED. Do not write a Playwright runner. Do not install Maestro CLI.

Hard step: send / pay / deploy / book / publish stay Evens. No headed drive of those verbs.

Grok `/` copy: `~/.grokbot/skills/click-live-site/SKILL.md`.
