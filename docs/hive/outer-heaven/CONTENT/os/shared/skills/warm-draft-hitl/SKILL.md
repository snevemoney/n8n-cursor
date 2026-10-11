---
name: Warm draft HITL
description: >-
  Use when producing a warm outreach note for a qualified prospect. Dual HITL;
  never send.
---
# Warm draft + dual HITL

1. Sample operator voice in channel if available.
2. Draft short note: public constraint fact + reversible offer; no fake $.
3. HITL A: approve/edit/reject draft.
4. HITL B: second approve before actual send.
5. On deny: stop.

Anti-patterns: auto-send; educator revenue claims; stacking Rung 0+1.


## Grok Bot harness (2026-09-01 — update, not a rebuild)

Org: Evens talks to Big Boss. Consultant audits/scope. Other desks only via mention or handoff. No 17 DMs.

After a meaningful run, append one JSON line (never overwrite, never log secrets):
`python3 /home/box/.grokbot/outer-heaven/append-action-log.py --agent "<desk>" --action "<slug>" --target "<what>" --result "<one line>"`
Log file: `/home/box/.grokbot/outer-heaven/ACTION_LOG.jsonl`

Failed or finished scheduled work doorbells the Big Boss / Day Planner / Consultant exec group only. Stay quiet if nothing failed. No logger desk. Mac out unless Evens asks local. HITL: money, client send, prod deploy, secrets.
