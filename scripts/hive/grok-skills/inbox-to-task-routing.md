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
1. Gmail plugin scan (read-only).
2. Bucket: reply-needed · delegate · archive · HITL money/send.
3. Day Planner: one focus block + task list for evening operator block.
4. Accumulate in HITL digest — **do not SMS operator at day job**.

## HITL
Send · forward · unsubscribe · pay links

## Never
Auto-send · new inbox SaaS · parallel ClickUp install without operator yes
