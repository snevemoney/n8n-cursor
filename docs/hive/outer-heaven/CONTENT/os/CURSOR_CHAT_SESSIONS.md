---
tags: [os]
---

# Cursor chat sessions — live path

#os

Grok desks read **live** Cursor transcripts on this Mac. Not a git copy. Not the processed `CURSOR_CHATS` markdown export.

| Key | Path |
|-----|------|
| All local projects | `/Users/evenslouis/.cursor/projects/*/agent-transcripts/` |
| This workspace | `/Users/evenslouis/.cursor/projects/Users-evenslouis-n8n-cursor/agent-transcripts/` |
| Grok-readable link | `~/.grokbot/outer-heaven/CURSOR_LIVE` → `~/.cursor/projects` |
| Config | `scripts/hive/os/cursor-chat-sessions.json` |
| Skill | `cursor-chat-sessions` |

```
python3 scripts/hive/os/cursor-chat-sessions.py projects
python3 scripts/hive/os/cursor-chat-sessions.py list --limit 20
python3 scripts/hive/os/cursor-chat-sessions.py read --id <uuid>
```

One session by id. Do not dump all. Do not publish. Do not commit JSONL.
