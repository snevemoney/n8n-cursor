---
name: Session handoff
description: >-
  Use before ending a sitting — write HANDOFF.md so a different model, app,
  and computer can continue. Not client-site delivery. Not session start.
---

# Session handoff

Sources: Nate Herk session-handoff slash (`yt:vfWTyEreOEc`); Outer Heaven save-file lock 2026-08-27; Grok Bot harness 2026-09-01.

## When

End of a thread, desk, or jump. Before compact. Before switching Grok ↔ Cursor Cloud ↔ Claude Code Web ↔ Codex Cloud.

## Do

1. Update the sitting's `HANDOFF.md` before you stop. If the job already has `CURRENT_STATE.md` / `ACTIVE_TASKS.md`, update those too.
2. Write for a stranger employee: different model, different app, different computer. Do not assume they have this chat.
3. Prefer the packet or git Outer Heaven path the next worker can actually read. Mac Obsidian is the human copy, not the cloud save file.
4. State vs event: current objective **replaces**. Done / failures / decisions **append**.
5. One next ask. Not a pile.
6. Append one ACTION_LOG card (never skip because HANDOFF.md exists). Compaction is automatic and uncontrolled — this card + HANDOFF.md are what survives:
   `python3 /home/box/.grokbot/outer-heaven/append-action-log.py --agent "<desk>" --action session-handoff --target "<job>" --asked "<one sentence>" --deliverable "<path or none>" --status done --result "<one line>"`
   Log: `/home/box/.grokbot/outer-heaven/ACTION_LOG.jsonl` — append only, no secrets.

## Don't

- Skip the write because "it's in the chat"
- Skip ACTION_LOG because HANDOFF.md exists
- Dump raw transcripts into Obsidian / OH
- Use client-handoff (that's finished-site delivery)
- Mint a second brain, a new Grok desk, or a Mac-only CURRENT.md jump file
- Unattended send, pay, deploy, post, or delete
- Claim Cursor/Claude/Codex already see Grok chat — they do not
- Fan out to 17 DMs. Doorbell misses go to the Big Boss / Day Planner / Consultant exec group only.

## Tools

| Need | Path |
|---|---|
| Packet HANDOFF | `/workspace/research/packets/jump-surfaces-20260827/HANDOFF.md` |
| Grok OH cache | `/home/box/.grokbot/outer-heaven/` (cache, not SoT) |
| ACTION_LOG | `/home/box/.grokbot/outer-heaven/ACTION_LOG.jsonl` |
| Git OH (n8n-cursor docs/hive/outer-heaven) | Cursor Cloud Agent — not cloned here |
| Mac vault `00_Outer_Heaven` | BLOCKED as execution path |

## Prompt (paste)

```
Handoff:
- Last agent / surface:
- Current objective (done when):
- Done:
- Not done:
- Decisions + rejected alternatives:
- Next single ask:
- Files/paths touched (cloud-readable):
- Uncommitted / branch (do not clone onto Grok computer):
- Verification run (or "not run"):
- Known failures:
- ACTION_LOG line written? (yes/no)
- Do not:
```

## Pickup

Read PROJECT + CURRENT_STATE + HANDOFF + ACTIVE_TASKS + relevant DECISIONS. Inspect git branch/status/latest commits if the job is in a repo. Do not repeat completed work.

## Repass 20260909 wave AC — Durable memory after dream
- On handoff: point to durable consolidated MD, not raw session flood (LrgfmZkl3nc).
