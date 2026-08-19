---
name: state-json
description: >-
  Durable facts and run logs live in a typed hive state.json the next
  run can read — not only the chat. Filter one key into the model.
  Do not dump the store. Use when a desk wakes more than once, writes
  last-run, or is about to paste a table into context. Cursor plus Grok Bot.
---

# State.json (Cursor)

Load `scripts/hive/grok-skills/state-json.md` and follow it.

**Card:** `STORE` · `FILTER` · `ROWS` — one key, never the whole file.  
**Wired job:** `coverage-loop` writes `hive-state.py log-run`.  
**CLI:** `python3 scripts/hive/hive-state.py get --key last_run` (or `product_factory`)

IDs are monotonic. Delete ≠ reset. Do not migrate to n8n tables.  
Hard step: send / pay / deploy / book / publish stay Evens.

Grok `/` copy: `~/.grokbot/skills/state-json/SKILL.md`.
