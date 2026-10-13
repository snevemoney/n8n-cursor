---
name: pre-gate-post-log
description: Use when adding or running a workflow, tool, or skill. Pre-hooks can block with exit 2. Post-hooks only log and cannot block.
---
# Pre-gate / post-log
Owner: Watchdog. Stack: Cursor + Grok.

## Pre (gate)
Events: PreToolUse, UserPromptSubmit, Stop.
Return exit 2 to block. Exit 0 to allow.
Hive: `python3 scripts/hive/product-state.py --can-act AGENT PROJECT`. Not RUN = stop.
Tier 3 (money / send / deploy / secrets) fails pre unless operator already approved.

## Post (log)
Events: PostToolUse, Notification, SessionStart.
Always exit 0. Cannot block. Log what actually ran.
SessionStart cannot prevent the session.

Never use a post hook as a gate. Never skip pre because post will catch it.
Scorpion and Telegram are legacy notify. Grok is daily notify.
