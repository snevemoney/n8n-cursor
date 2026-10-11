---
name: Meetings to execution (Demkinn #22)
description: >-
  Use when: After transcript/notes. Demkinn #22. Owner Day Planner.
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
