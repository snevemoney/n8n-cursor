---
name: Session handoff
description: >-
  Use before ending a sitting — write HANDOFF.md so a different model, app,
  and computer can continue. Not client-site delivery. Not session start.
merged_from: [jump-surface]
---

# Session handoff

Sources: Nate Herk session-handoff slash (`yt:vfWTyEreOEc`); Outer Heaven save-file lock 2026-08-27; Grok Bot harness 2026-09-01.

## When

End of a thread, desk, or jump. Before compact. Before switching Grok ↔ Cursor Cloud ↔ Claude Code Web ↔ Codex Cloud.

## Start
Paste at the top of every new agent session (Claude Code / Codex / Cursor / Grok desk):
```
ONE TASK: <single deliverable, done-when checkable>
Read first (cold start, ≤3 files): <HANDOFF.md path> · <KILL.md path> · <spec/plan path>
Not in scope: <everything else — park new ideas in PARKED.md, don't start them>
Fresh-context triggers → write HANDOFF.md, end this session, start a new one:
  - the task changes (new deliverable)  - context > ~60% / auto-compact fired  - 2 wrong turns in a row
  - you are re-reading the same files to remember what you did
End: run session-handoff (HANDOFF.md + ACTION_LOG card).
```
Rules of thumb: Claude Code `/clear` between tasks; Codex: new thread per task; Cursor: new chat per task; Grok: new desk sitting.

Rule line (Evens): "One deliverable per session; on task change, auto-compact, or 2 wrong turns → HANDOFF.md + fresh session."

Extra HANDOFF fields: **Status** · **Parked ideas** · **Context at end** (see /workspace/research/packets/methods-gap-20261012/close/g08-one-task/HANDOFF_TEMPLATE.md).

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
- Use website-build-pipeline (that's finished-site delivery)
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

---

## Merged from `jump-surface` (2026-10-11)

- Original description: Use when Evens wants to jump from Grok Bot to Claude Code, Codex, ChatGPT desktop, or Cursor without losing the sitting.
- Unique content carried: surface jump list (Claude Code/Codex/ChatGPT/Cursor)

Grok Bot stays the hive face. Cursor stays the repo builder via CloudAgent. Claude Code, Codex, and ChatGPT desktop are jump targets, not new desks.

Overwrite ~/.grokbot/jumps/CURRENT.md on Evens Mac with status, from, to, task, done_when, context, do_not.

Grok to Cursor: CloudAgent plus the packet.
Grok to Claude Code: write the packet, tell Evens to open Claude Code on n8n-cursor. Only run the claude CLI on his Mac if he asked to launch it.
Grok to Codex: write the packet, tell Evens to open Codex.
Grok to ChatGPT desktop: packet only. No CLI. Do not browser-RPA the app.

Reverse: when Evens jumps back, read CURRENT.md and continue. Do not poll. Optional webhook later.

Do not mint a new Grok agent. Do not rewrite hive-funnels-stack unless Evens unfreezes on-tape only. Do not install fake Claude or Codex plugins.

## Simon 37 + Primeagen Origin 2026-08-30 (`yt:RDeofKimDxo`, `yt:AFQW-b2WaRU`) watch-page PROVE
claude --teleport (Claude.ai → local Claude Code) BLOCKED. Jump packet on the box / Outer Heaven. Cursor Origin is Cursor's Git host (WAL/S3 Continuity as stated), not an 18th desk and not a reason to self-host Git. n8n-cursor stays GitHub. Linear MCP not connected — do not add it from the sponsor read.

## Deep repass 2026-09-03 — Cursor /goal + harness jump
When Evens jumps Grok → Cursor for a long sit: put done-when + /goal text in CURRENT.md and the CloudAgent prompt.
FACT cursor.com/changelog/08-19-26: /goal, subscriptions, custom modes, subagents-on-VMs, steering.
Hive: packet already names done_when; CloudAgent holds the goal until complete; Grok routines ≈ subscriptions.
Do not install OpenMausBot/Claude desktop as the jump target OS — jump packet + Cursor CloudAgent only.
Platform: Cursor. Install: none (process-only).


## Repass delta — video-training 20260909 Wave I
- yt:AFQW-b2WaRU: jump card = GitHub vs Origin host; Cursor git-at-any-scale blog for scale literacy; skip Linear MCP sponsor.
