---
name: Proof before seat
description: >-
  Use before asking for a paid seat or client install — self-proof first (demo, own store, walkthrough).
---

# Proof before seat

Sources: Nate lesson 12; Amazon own-store as self-proof; cinematic/STL demos.

## When
Before pitching a paid seat or asking permission to expand spend.

## Do
1. Build a self-proof (demo URL, own Amazon list path, Loom).
2. Show the receipt path, then ask.
3. Tier 3 still propose-first for money.

## Don't
- Lead with portfolio screenshots of workflows
- Quote educator seats as ours


## Grok Bot harness (2026-09-01 — update, not a rebuild)

Org: Evens talks to Big Boss. Consultant audits/scope. Other desks only via mention or handoff. No 17 DMs.

After a meaningful run, append one JSON line (never overwrite, never log secrets):
`python3 /home/box/.grokbot/outer-heaven/append-action-log.py --agent "<desk>" --action "<slug>" --target "<what>" --result "<one line>"`
Log file: `/home/box/.grokbot/outer-heaven/ACTION_LOG.jsonl`

Failed or finished scheduled work doorbells the Big Boss / Day Planner / Consultant exec group only. Stay quiet if nothing failed. No logger desk. Mac out unless Evens asks local. HITL: money, client send, prod deploy, secrets.

## Batch-4 extract — 10-hour SaaS challenge (`yt:I7mpF7_pnPM`) 2026-09-01

FACT: clock covers **product + site + checkout + marketing**, not a 10-hour build with “market later.” Real checkout, not a waitlist. Sell / audience first — distribution is harder than the build in 2026 (tape claim; treat as working rule, not a statistic). Stripe on tape = operator-owned; hive uses [stripe-cfo-readonly](sand-workflow:stripe-cfo-readonly) + HITL.

Hive remap: self-proof a live URL + checkout path on **our** stack. Do not send to strangers. Do not quote challenge revenue as FACT. Chat LLM $10/mo vendor = ignore. If the proof fails on tape, keep the failure — do not rewrite as a success story.

### Tools

| Need | Path |
|---|---|
| Public demo URL | Cursor Cloud + Hostinger/Vercel HITL — **PROVE** / **BLOCKED** needsAuth |
| Stripe live charge | **BLOCKED** — read-only CFO + operator HITL |
| Client send / cold strangers | **NO** — building mode |
