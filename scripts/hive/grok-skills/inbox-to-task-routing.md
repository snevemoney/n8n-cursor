---
name: inbox-to-task-routing
description: Gmail triage to Day Planner tasks. Operator-run hive-os machine. Read-only until HITL on send.
---

# Inbox → task routing

**Machine:** `inbox-to-task-routing` · **Lane:** hive-os / operator

## When
Operator asks to triage inbox, surface tasks, or reduce email noise.

## Handshake
- **Plugin:** Gmail (read-only) — Comms Manager + Day Planner routines
- **Terminal:** `python3 scripts/hive/os/outer-heaven-brief.py --agent "Communications Manager"`
- **Writer:** Grok drafts; Cursor only if new skill/routine needed

## Steps
1. Gmail plugin scan (read-only). **Filter-then-llm:** name FILTER (`unread` / `from:` / HITL label) before classify. Do not dump the inbox.
2. **Sanitize-in:** `python3 scripts/hive/sanitize-check.py --text "<snippet>" --direction in`. Fail → halt.
3. Bucket: reply-needed · delegate · archive · HITL money/send.
4. **Sanitize-out** on any draft: `--direction out`. `verdict=pass` still HITL. Pass ≠ send.
5. Day Planner: one focus block + task list for evening operator block.
6. Accumulate in HITL digest — **do not SMS operator at day job**.

## HITL
Send · forward · unsubscribe · pay links

## Never
Auto-send · new inbox SaaS · parallel ClickUp install without operator yes

**Merged 2026-08-14:** `lRUpu2-KtGQ` inbox specialist + chief-of-staff group chat. Steal the **handoff sentence**, not a ClickUp install. Schedule vs event = `hosted-neq-scheduled`. Send-removed.

