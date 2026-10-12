---
name: cursor-chat-sessions
description: >-
  Read Evens's local Cursor conversation transcripts on this Mac.
  All local projects, not only n8n-cursor. Use when a desk needs
  what he said in Cursor, a prior sitting, or "my chats."
  One session by id. Do not dump all. Do not publish.
---

# Cursor chat sessions (Cursor)

Load `scripts/hive/grok-skills/cursor-chat-sessions.md` and follow it.

**Live:** `~/.cursor/projects/*/agent-transcripts/`  
**CLI:** `python3 scripts/hive/os/cursor-chat-sessions.py list|read --id`  
**Catch-up:** `python3 scripts/hive/os/session-matrix.py write` → `CONTENT/os/SESSION-INDEX.md` (do not ask Evens to paste)  
**Slack:** Hive `#hive` — shared room for Cursor / Grok / Claude / ChatGPT.  
**Link:** `~/.grokbot/outer-heaven/CURSOR_LIVE` → `~/.cursor/projects`  
**Card:** `STORE` · `FILTER` · `ROWS` — no filter, no dump.

Do not commit JSONL. Hard step: send / pay / deploy / book / publish stay Evens.

Grok `/` copy: `~/.grokbot/skills/cursor-chat-sessions/SKILL.md`.
