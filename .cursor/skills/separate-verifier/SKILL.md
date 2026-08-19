---
name: separate-verifier
description: >-
  Maker-checker. A read-only second desk grades against last-known-good.
  The builder does not pass its own pane. Use when a path ships, a loop
  claims green, or Forge / Watchdog share a golden path. Cursor plus Grok Bot.
---

# Separate verifier (Cursor)

Load `scripts/hive/grok-skills/separate-verifier.md` and follow it.

**Card:** `BUILDER` · `VERIFIER` · `HYPOTHESIS` · `LABELED` · `MISS` · `GRADE` — Watchdog fills GRADE.  
**Wired job:** Watchdog grades Forge on `golden-test-loop` / `click-live-site`.  
**Spawn:** only if this session ships a path. Builder must not self-score.

Until-satisfied needs a scorer or `checkable-stop`. Self-8/10 is not a fixture.  
Hard step: send / pay / deploy / book / publish stay Evens.

Grok `/` copy: `~/.grokbot/skills/separate-verifier/SKILL.md`.
