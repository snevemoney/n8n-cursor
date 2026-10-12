---
name: Warm draft HITL
description: >-
  Use when producing a warm outreach note for a qualified prospect. Dual HITL;
  never send.
merged_from: [inbound-followup-draft-only]
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

---

## Merged from `inbound-followup-draft-only` (2026-10-11)

- Original description: Use after a call or inbound lead to draft a follow-up in the operator's voice. Drafts only — never send.
- Unique content carried: post-call/inbound follow-up variant

# Inbound follow-up draft only
Owner: Communications Manager.
1. Pull last external call / inbound from calendar or Gmail (read).
2. Draft To / Subject / body with concrete next steps.
3. Hold for operator. Never send. Never mint Stripe links. Never book on the calendar.
Refuse: Revenue Closer, Speed-to-Lead Closer, Outbound In Your Voice send-after-10.
