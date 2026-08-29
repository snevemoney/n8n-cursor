---
name: grok-chat-sessions
description: >-
  Read Evens's local Grok Bot desk threads on this Mac.
  17 named desks in sand-client-persistence. Use when a desk needs
  what he said in Grok, a prior Grok sitting, or "my Grok chats."
  One thread by id. Do not dump all. Do not publish. Do not commit blobs.
---

# Grok chat sessions

**Owner:** Librarian (index) · Researcher (read) · Forge / Big Boss (when a sitting cites a Grok thread).  
**Stack:** Cursor + Grok Bot. Local Mac disk only.  
**Cursor copy:** `.cursor/skills/grok-chat-sessions/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/grok-chat-sessions/SKILL.md`  
**Config:** `scripts/hive/os/grok-chat-sessions.json`  
**CLI:** `python3 scripts/hive/os/grok-chat-sessions.py`  
**Ring:** FREE (local read). Cloud cron = reminder only.

**Live path (SSOT):** `~/Library/Application Support/Grok Bot/sand-client-persistence/`  
**Not `/workspace`.** Cloud cannot see this folder. Do not invent a listing from a cold checkout.

**Dissent (do not flatten):**
- Sibling of `cursor-chat-sessions`. Same card (STORE / FILTER / ROWS). Not a remint.
- `skill-from-session` mints a skill after a winning run. This skill only **reads**.
- Factory-OS reminder Automation writes `FACTORY-OS-NEXT.md`. It does not run this CLI.

**Law:** Grok, Claude, ChatGPT, and Cursor each read Grok, Claude, ChatGPT, and Cursor. Same brain. Same session store. Refresh: `python3 scripts/hive/os/sync-sessions.py`. This CLI is the one-id Grok deep read.

## When

Evens says read my Grok chats / desk threads / what we said in Grok Bot. A desk needs a prior Grok sitting. Not a publish. Not a vault dump. Not a `/workspace` copy. Do not ask Evens to paste.

## Card (required before the model)

```
STORE: ~/Library/Application Support/Grok Bot/sand-client-persistence
FILTER: --id <uuid> | --desk <name> --limit ≤20
ROWS: 1 thread (list first if id unknown)
```

No FILTER → do not pass transcripts. Dumping every `.blob` is a fail.

## Steps

1. Confirm the folder exists. If missing → honest MISS + stop. Do not fake 17 desks.
2. `python3 scripts/hive/os/grok-chat-sessions.py list --limit 20`
3. Pick **one** id. `python3 scripts/hive/os/grok-chat-sessions.py read --id <uuid>`
4. Pair with `filter-then-llm` + `sanitize-in-check-out`. Quote the ask, not the whole thread, unless Evens named that sitting.
5. Never copy `.blob` files into the repo, vault, or a packet. Never publish.

## Stop

Send / pay / deploy / book / publish = operator. This skill never closes a hard step.

## Never

Dump all threads · commit persistence blobs · run this on Cloud and pretend it listed · copy `/workspace` · paste secrets from a chat into a prompt · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus
