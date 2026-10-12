---
name: Meetings to execution (Demkinn #22)
description: >-
  Use when: After transcript/notes. Demkinn #22. Owner Day Planner.
merged_from: [sales-call-to-actions]
---
# Meetings to execution (Demkinn #22)

**Owner desk:** Day Planner  
**Lane:** hive-os (+ tag others)  
**Sources:** demkinn skills/22  
**Status:** owned  
**HITL:** none


## Tools
| Need | Path |
|---|---|
| Transcript / notes | operator paste — **PROVE** |
| Decision ledger | vault / decision-ledger-md — **PROVE** |
| Calendar | operator HITL — **WORKAROUND** (no auto-book) |
| Client email of minutes | **BLOCKED** without HITL |

## Prompts
**Meeting → execution**
```
Run Demkinn #22 meetings-to-execution.
Notes/transcript:
[paste]
Output: Decisions · Actions (owner/due) · Open Qs · Follow-ups.
Write ledger artifact. Do not auto-email attendees.
```

**Open questions scrub**
```
From this meeting card, list only unresolved open Qs with suggested owner:
[paste]
```

## When
After transcript/notes

## Do
1. Extract: decisions · actions · owners · deadlines · open Qs · follow-ups
2. Push to ledger/calendar (HITL for external invites)
3. No auto-send of summaries to clients

## Don't
- Mint agents · auto-send · auto-pay/book/publish
- New icp_id / business-lanes row without operator yes
- $ FACT without claim-verifier (#47)
- Farms/NSFW sources

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.

---

## Merged from `sales-call-to-actions` (2026-10-11)

- Original description: Use when: After call notes/transcript. Demkinn #16. Owner Day Planner.
- Unique content carried: sales-call variant (Day Planner)

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
Run Demkinn #16 meetings-to-execution.
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
