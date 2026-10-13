---
name: Sales call to action items (Demkinn #16)
description: >-
  Use when: After call notes/transcript. Demkinn #16. Owner Day Planner.
---
# Sales call to action items (Demkinn #16)

**Owner desk:** Day Planner  
**Lane:** hive-os (+ tag others)  
**Sources:** demkinn skills/16  
**Status:** owned  
**HITL:** none


## Tools
| Need | Path |
|---|---|
| Transcript / notes | operator paste or file — **PROVE** |
| Action ledger write | vault / day-plan artifact — **PROVE** |
| Calendar write | operator HITL / paste events — **WORKAROUND** (no auto-book) |
| Email send | **BLOCKED** — route drafts to #17 HITL |

## Prompts
**Call → actions**
```
Run Demkinn #16 sales-call-to-actions.
Transcript/notes:
[paste]
Extract table: Item · Type (pain/objection/promise/feature/action/deadline/follow-up) · Owner · Due · Notes.
Push actions to day plan. Do not auto-send email; flag #17 follow-ups.
```

**Owners + deadlines only**
```
From this extraction, assign owners + realistic deadlines only (no new fluff):
[paste table]
```

## When
After call notes/transcript

## Do
1. Extract: pains · objections · promises · features · next actions · deadlines · follow-ups
2. Assign owners; schedule into day plan / ledger
3. Hand follow-up drafts need to #17 (HITL send)

## Don't
- Mint agents · auto-send · auto-pay/book/publish
- New icp_id / business-lanes row without operator yes
- $ FACT without claim-verifier (#47)
- Farms/NSFW sources

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.
