---
name: cursor-chat-sessions
description: >-
  Read Evens's local Cursor conversation transcripts on this Mac.
  All local projects, not only n8n-cursor. Use when a Grok desk needs
  what he said in Cursor, a prior sitting, or "my chats." One session
  by id. Do not dump all. Do not publish. Do not commit JSONL.
---

# Cursor chat sessions

**Owner:** Librarian (index) · Researcher (read) · Forge / Big Boss (when a sitting cites a prior chat).  
**Stack:** Cursor + Grok Bot. Local disk only.  
**Cursor copy:** `.cursor/skills/cursor-chat-sessions/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/cursor-chat-sessions/SKILL.md`  
**Config:** `scripts/hive/os/cursor-chat-sessions.json`  
**CLI:** `python3 scripts/hive/os/cursor-chat-sessions.py`  
**Ring:** FREE (local read).

**Live path (SSOT):** `~/.cursor/projects/*/agent-transcripts/`  
**This workspace:** `~/.cursor/projects/Users-evenslouis-n8n-cursor/agent-transcripts/`  
**Grok-readable link:** `~/.grokbot/outer-heaven/CURSOR_LIVE` → `~/.cursor/projects` (symlink, not a copy)  
**Processed copies (stale-safe secondary):** `~/.grokbot/outer-heaven/CURSOR_CHATS` — markdown export, not live.

**Dissent (do not flatten):**
- `export-all-cursor-chats.py` writes markdown into `CURSOR_CHATS`. This skill reads **live JSONL**. Do not treat the export as current.
- `skill-from-session` mints a skill after a winning run. This skill only **reads**.
- `ask-log.py` extracts operator asks into `ASKS.md`. Use that for the ask log; use this for the full sitting.
- `session-bootstrap` starts a new dump. Not a transcript reader.

**Law:** Grok, Claude, ChatGPT, and Cursor each read Grok, Claude, ChatGPT, and Cursor. Same brain. Same session store. Refresh: `python3 scripts/hive/os/sync-sessions.py`. This CLI is the one-id Cursor deep read.

## When

Evens says read my Cursor chats / local sessions / what we said in Cursor / give Grok my chats. A desk needs a prior sitting. Not a publish. Not a vault dump. Do not ask Evens to paste.

## Card (required before the model)

```
STORE: ~/.cursor/projects/*/agent-transcripts
FILTER: --id <uuid> | --project <slug> --limit ≤20
ROWS: 1 session (list first if id unknown)
```

No FILTER → do not pass transcripts. `cat` of the glob is a fail.

## Steps

1. Confirm the path exists. `projects` then `list`. Do not walk every JSONL into context.
2. `python3 scripts/hive/os/cursor-chat-sessions.py list --project n8n-cursor --limit 20`
3. Pick **one** id. `python3 scripts/hive/os/cursor-chat-sessions.py read --id <uuid>`
4. Pair with `filter-then-llm`. Quote the ask, not the whole file, unless Evens named that sitting.
5. Subagents stay off (`--subagents` only if he names a subagent).
6. Never copy JSONL into the repo, vault, or a packet. Never publish.

## Stop

Send / pay / deploy / book / publish = operator. This skill never closes a hard step.

## Never

Dump all sessions · commit `*.jsonl` · treat `CURSOR_CHATS` markdown as live · paste secrets from a chat into a prompt (`sanitize-in-check-out`) · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus
