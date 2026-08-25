---
name: one-brain
description: >-
  Cursor sittings and desks share one brain: vault STATE + thin
  handoff, not a transcript dump. Use when Evens says one brain,
  sync chats with agents, session start/end, or morning consume.
---

# One brain (Cursor)

Desks are mouths. The brain is `hot.md` + last emit + a named sitting.
Do not dump Cursor JSONL into every agent.

**CLI:** `python3 scripts/hive/os/one-brain.py`
**Hooks:** `.cursor/hooks.json` → `sessionStart` / `sessionEnd`
**Ring:** FREE (local read/write). Capture push and Automations stay ASK.
**Never:** send / pay / deploy / book / publish · 15-minute chat sync · laptop-off Cloud Agent reading `~/.cursor`

This sitting does **not** edit the uncommitted hive OS from other chats.
It only adds this machine.

## Card

```
WAKE: event (sessionStart / sitting start) + cadence (weekday 07:00 ET consume)
HOST: local for transcripts · cloud only after close-desk capture
WRITE: close --title --item  (STATE/EVENT) · sessionEnd writes a receipt only
READ:  wake → hot.md + LAST-EMIT + YELLOW + chat titles (not bodies)
```

## Loop

1. **Wake** — `python3 scripts/hive/os/one-brain.py wake`
   Local Composer also gets this from `sessionStart`.
   Cloud Agents: `sessionStart` does not fire. Run `wake --no-chats` yourself.
2. **Work** the named bite.
3. **Close** — `python3 scripts/hive/os/one-brain.py close --title "…" --item "…"`
   That is the handoff. The transcript stays on disk.
4. **Close-desk** (Mac still on) — `python3 scripts/hive/os/one-brain.py capture`
   Exports chats for Cloud Agents. Do not run this from a Cloud Agent.
5. **Morning consume** — weekday 07:00 ET Cursor Automation. Spec:
   `python3 scripts/hive/os/one-brain.py automation`

If the previous sitting closed without `--title`, next `wake` shows `GAP`.

## Fetch one chat

Titles only on wake. When Evens names a sitting:

```
python3 scripts/hive/os/cursor-chat-sessions.py list --limit 20
python3 scripts/hive/os/cursor-chat-sessions.py read --id <uuid>
```

If that CLI is not on this branch, do not invent a dump. Leave the transcript on disk.

## Prove the trigger

```
python3 scripts/hive/os/one-brain.py trigger-check
```

That rehearses the exact `sessionStart` / `sessionEnd` JSON Cursor sends. Live Composer proof is still Settings → Hooks after this branch is checked out on the Mac.

## Create the Automation

1. Open https://cursor.com/automations/new
2. Paste the JSON from `one-brain.py automation`
3. Save. Do not enable PR creation or Slack send.
4. Close-desk capture stays a local command. Do not cron it in the cloud.

## Stop

Hard steps stay Evens. This skill never sends.
