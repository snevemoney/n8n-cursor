---
name: Compact hive from chats
description: >-
  use this when operator hits agent quota and wants chat knowledge promoted into
  OPERATOR_MEMORY, cheat sheet, and role cards instead of more agent pings
---
# Compact hive from chats

Use when operator usage is high and chats are the only copy of decisions.

## Do
1. Run `python3 scripts/hive/os/outer-heaven-brief.py --agent "Big Boss"` then read `OPERATOR_MEMORY.md` + `AGENT_CHEAT_SHEET.md`.
2. Diff chat decisions vs OM. Promote only durable facts (DECISIONS / FACTS / LESSONS). Never dump transcripts.
3. Message **Librarian only** with a paste-ready OM block. Librarian writes vault + cache. Do not fan out to all 17 (burns quota).
4. Update agent **role cards** only for real lane changes (e.g. Report Creator). Do not rewrite sacred-rule dumps.
5. Save a Grok workflow if the compact itself is reusable.
6. Tell operator: start **new** chats; old threads are archives. First action in new chat = Outer Heaven brief.

## Do not
- Wake every agent to “summarize your chat”
- Re-seed archived /work items
- Put secrets, X-Hive-Secret, or Tier 3 payloads in OM
