---
name: Follow-up assistant (Demkinn #17)
description: >-
  Use when: Stale prospect / no reply. Demkinn #17. Owner Communications Manager.
---
# Follow-up assistant (Demkinn #17)

**Owner desk:** Communications Manager  
**Lane:** hive-os (+ tag others)  
**Sources:** demkinn skills/17  
**Status:** owned  
**HITL:** NEVER auto-send


## Tools
| Need | Path |
|---|---|
| Context / CRM notes | operator paste — **PROVE** |
| Draft write | Comms draft artifact — **PROVE** |
| Email/X send | **BLOCKED** auto-send — operator HITL only |
| Inbox connector | **WORKAROUND** paste thread if Gmail MCP offline |

## Prompts
**Stage-aware follow-up**
```
Run Demkinn #17 follow-up-assistant.
Stage: [no-answer|later|silent-after-proposal]
Prospect + last touch:
[paste]
Draft 1 short follow-up in operator voice. No new claims. NEVER auto-send — mark READY_FOR_HITL.
```

**Three variants**
```
Same context; write 3 tone variants (direct / value-add / breakup). HITL pick. No send.
```

## When
Stale prospect / no reply

## Do
1. Context-aware draft by stage
2. Different copy for: no-answer · later · silent-after-proposal
3. HITL send only — NEVER auto-send

## Don't
- Mint agents · auto-send · auto-pay/book/publish
- New icp_id / business-lanes row without operator yes
- $ FACT without claim-verifier (#47)
- Farms/NSFW sources

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.
