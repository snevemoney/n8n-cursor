---
name: pre-gate-post-log
description: >-
  Every workflow, tool, and skill pairs a PRE-GATE (can block, exit 2)
  with a POST-LOG (never blocks, exit 0). Use when running a tool, skill,
  or workflow. Cursor plus Grok Bot. Owner Watchdog.
---

# Pre-gate / post-log (Cursor)

Load `scripts/hive/grok-skills/pre-gate-post-log.md` and follow it.

**Owner:** Watchdog.  
**Status:** WIRED 2026-08-27 operator rule. Not accepted forever.  
**How-to:** pre before tool, post after.

PRE: `python3 scripts/hive/os/pre-gate.py --can-act AGENT PROJECT` (exit 2 ≠ RUN).  
POST: `python3 scripts/hive/os/post-log.py --agent AGENT --action NAME --outcome WHAT --correlation-id ID` (always 0).

Notify = Grok Watchdog / Grok chat. Telegram / Scorpion are legacy, not the sink.  
Hard step: send / pay / deploy / book / publish stay Evens.

Grok `/` copy: `~/.grokbot/skills/pre-gate-post-log/SKILL.md`.
