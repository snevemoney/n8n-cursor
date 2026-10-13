---
name: Client handoff
description: >-
  use this when handing a finished site to a client — hosting, secrets, CMS
  training, V2 backlog
---
# Client handoff

## Checklist
1. Hosting account owner (client vs builder) + access transfer steps.
2. Domain/DNS ownership.
3. Secrets rotation schedule; no secrets in repo/chat history reliance.
4. CMS training: how to edit/publish; who to call.
5. Backup/restore note.
6. Out of scope / V2 backlog list (do not shrink price — shrink scope).
7. Maintenance retainer definition if any (keep-alive ≠ feature factory).

## Output
One handoff doc the operator can send; Loom optional.


## Grok Bot harness (2026-09-01 — update, not a rebuild)

Org: Evens talks to Big Boss. Consultant audits/scope. Other desks only via mention or handoff. No 17 DMs.

After a meaningful run, append one JSON line (never overwrite, never log secrets):
`python3 /home/box/.grokbot/outer-heaven/append-action-log.py --agent "<desk>" --action "<slug>" --target "<what>" --result "<one line>"`
Log file: `/home/box/.grokbot/outer-heaven/ACTION_LOG.jsonl`

Failed or finished scheduled work doorbells the Big Boss / Day Planner / Consultant exec group only. Stay quiet if nothing failed. No logger desk. Mac out unless Evens asks local. HITL: money, client send, prod deploy, secrets.

Sitting save is [session-handoff](sand-workflow:session-handoff) + ACTION_LOG, not this skill.
