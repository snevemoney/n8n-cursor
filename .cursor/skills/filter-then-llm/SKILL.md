---
name: filter-then-llm
description: >-
  Deterministic narrow (email = from, workflow = name, state = one key)
  then LLM. Dumping hundreds of rows is tokens + hallucination.
  Use before a table, inbox, or state.json hits the model.
  Cursor plus Grok Bot.
---

# Filter, then LLM (Cursor)

Load `scripts/hive/grok-skills/filter-then-llm.md` and follow it.

**Card:** `STORE` · `FILTER` · `ROWS` — no filter, no model.  
**Wired job:** `inbox-to-task-routing` + `hive-state.py get --key`.  
**Librarian:** allow-list keys; do not dump the table.

Do not stand up n8n tables as hive SSOT.  
Hard step: send / pay / deploy / book / publish stay Evens.

Grok `/` copy: `~/.grokbot/skills/filter-then-llm/SKILL.md`.
