---
name: Warm owner conversation loop
description: >-
  Use when: Month-1 warm conversations
---
# Warm owner conversation loop

**Owner desk:** Product GTM  
**Lane:** ai-partner-websites  
**Sources:** youtube-ai-implement P0#1

## When
Month-1 warm conversations

## Do
1. Operator names candidates
2. 5 talks
3. patterns.md
4. HITL drafts only

## Don't
- Cold blast
- Fake names

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.

## Tools
| Need | Path |
|---|---|
| Research | pre-call-prospect-brief — **PROVE** |
| Send | HITL only |

## Prompts
**Warm loop**
```
Owner/context:
Questions that surface constraint. Draft only — HITL send.
```


## Grok Bot harness (2026-09-01 — update, not a rebuild)

Org: Evens talks to Big Boss. Consultant audits/scope. Other desks only via mention or handoff. No 17 DMs.

After a meaningful run, append one JSON line (never overwrite, never log secrets):
`python3 /home/box/.grokbot/outer-heaven/append-action-log.py --agent "<desk>" --action "<slug>" --target "<what>" --result "<one line>"`
Log file: `/home/box/.grokbot/outer-heaven/ACTION_LOG.jsonl`

Failed or finished scheduled work doorbells the Big Boss / Day Planner / Consultant exec group only. Stay quiet if nothing failed. No logger desk. Mac out unless Evens asks local. HITL: money, client send, prod deploy, secrets.
