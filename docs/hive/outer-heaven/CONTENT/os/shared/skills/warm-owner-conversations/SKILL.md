---
name: Warm owner conversations
description: >-
  Use for Month-1 warm owner talks — five conversations and a patterns note; HITL drafts only; no cold blast.
merged_from: [warm-owner-conversation-loop]
---

# Warm owner conversations

Sources: youtube-ai-implement P0 #1; warm-owner lane.

## When
Month-1 AI Partner learning cycle with real owners (not cold spam).

## Do
1. Need operator-named candidates.
2. Goal: 5 talks + patterns.md (pain, WTP signals, objections).
3. Personalized one-pager first. Comms drafts only — HITL send.
4. Feed patterns into constraint-position and four-blank.

## Don't
- Cold blast
- Treat Spencer Boyd capability test as a live warm ask
- Fake close rates


## Grok Bot harness (2026-09-01 — update, not a rebuild)

Org: Evens talks to Big Boss. Consultant audits/scope. Other desks only via mention or handoff. No 17 DMs.

After a meaningful run, append one JSON line (never overwrite, never log secrets):
`python3 /home/box/.grokbot/outer-heaven/append-action-log.py --agent "<desk>" --action "<slug>" --target "<what>" --result "<one line>"`
Log file: `/home/box/.grokbot/outer-heaven/ACTION_LOG.jsonl`

Failed or finished scheduled work doorbells the Big Boss / Day Planner / Consultant exec group only. Stay quiet if nothing failed. No logger desk. Mac out unless Evens asks local. HITL: money, client send, prod deploy, secrets.

## Batch-4 extract — Carnegie talk-track (`yt:Xo2Q4PQqqWU`) 2026-09-01

Book-summary tape. Steal as **draft language** for the five Month-1 owner talks — not a new course SKU.

FACT principles to apply when Grok drafts a warm note or sitting agenda:
- Don't criticize / condemn / complain. Ask what you might be missing.
- Make the other person want the next step (their outcome, not our tool).
- Never open with “you're wrong.” Move the spotlight onto facts: “I could be mistaken — let's check X.”
- Give a reputation to live up to (their existing craft), then one small ask.
- If a disagreement shows up: time-box, ask whether winning is ego, then resume.

Anti-triggers: cold blast, manipulation scripts, “influence” as a product. HITL send still required. Quotes from the 1930s book are public-domain ideas, not a copyright dump — do not paste the full summary into client-facing pages.

### Prompt

```
Warm owner draft for [name]:
One genuine observation (no flattery spam)
Their outcome, not our stack
No “you're wrong”
HITL send. Not a cold sequence.
```

---

## Merged from `warm-owner-conversation-loop` (2026-10-11)

- Original description: Use when: Month-1 warm conversations
- Unique content carried: loop cadence/steps section

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
