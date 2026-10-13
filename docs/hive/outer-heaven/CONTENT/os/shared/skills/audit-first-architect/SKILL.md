---
name: Audit-first architect
description: >-
  Alias — use audit-first-architect-2 (full Systems→Teams→AI audit skill). Kept so old links do not break.
---
# Alias

Use **[audit-first-architect-2](sand-workflow:audit-first-architect-2)** as the canonical audit-first skill.
This short twin is retired to a pointer (Consultant 2026-08-22).

## Tools
| Need | Path |
|---|---|
| Discovery | warm-owner-conversation-loop — **PROVE** |
| Build | ASK before build |

## Prompts
**Audit-first**
```
Prospect:
Audit scope · constraint · proof plan · retainer path
No boil-the-ocean build.
```


## Grok Bot harness (2026-09-01 — update, not a rebuild)

Org: Evens talks to Big Boss. Consultant audits/scope. Other desks only via mention or handoff. No 17 DMs.

After a meaningful run, append one JSON line (never overwrite, never log secrets):
`python3 /home/box/.grokbot/outer-heaven/append-action-log.py --agent "<desk>" --action "<slug>" --target "<what>" --result "<one line>"`
Log file: `/home/box/.grokbot/outer-heaven/ACTION_LOG.jsonl`

Failed or finished scheduled work doorbells the Big Boss / Day Planner / Consultant exec group only. Stay quiet if nothing failed. No logger desk. Mac out unless Evens asks local. HITL: money, client send, prod deploy, secrets.

## Enrich 2026-10-10: map before reading (`yt:AQ8GIXh4ezs`)
For code you didn't write: (1) size it up (lines, files), (2) anticipate the structure and confirm it with an outline before reading lines. `code_map.py` (AST outline, call edges, entry point).
