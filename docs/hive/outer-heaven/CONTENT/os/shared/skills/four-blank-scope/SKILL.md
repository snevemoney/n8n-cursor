---
name: Four-blank scope
description: 'use this before any client build — fill Bucket, KPI, Baseline, 60-day target'
---
# Four-blank scope

AI Partner scope before any client build (from AI Partner Playbook).

## Fill all four
1. **Bucket:** ACQUIRE | GROW | CUT
2. **KPI:** one measurable number
3. **Baseline today:** honest current value
4. **60-day target:** realistic target

## Rules
- Find the CONSTRAINT (where ops sighs), not the requested feature
- Workflow-only is OK if cheaper/safer than software
- No build until blanks are filled and operator/client agrees


## Grok Bot harness (2026-09-01 — update, not a rebuild)

Org: Evens talks to Big Boss. Consultant audits/scope. Other desks only via mention or handoff. No 17 DMs.

After a meaningful run, append one JSON line (never overwrite, never log secrets):
`python3 /home/box/.grokbot/outer-heaven/append-action-log.py --agent "<desk>" --action "<slug>" --target "<what>" --result "<one line>"`
Log file: `/home/box/.grokbot/outer-heaven/ACTION_LOG.jsonl`

Failed or finished scheduled work doorbells the Big Boss / Day Planner / Consultant exec group only. Stay quiet if nothing failed. No logger desk. Mac out unless Evens asks local. HITL: money, client send, prod deploy, secrets.
