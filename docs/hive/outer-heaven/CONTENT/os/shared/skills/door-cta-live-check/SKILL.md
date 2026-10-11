---
name: Door/CTA live check
description: >-
  Use when: Before warm draft using packed door
---
# Door/CTA live check

**Owner desk:** Lead Hunter  
**Lane:** ai-partner-websites  
**Sources:** fr-cta-live-check-20260813.md

## When
Before warm draft using packed door

## Do
1. curl live hrefs
2. DOOR_MATCH vs CHANGED
3. Update packet note
4. No reopen/email

## Don't
- Assume packet door still works
- Client send from check

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.

## Tools
| Need | Path |
|---|---|
| Playwright | **PROVE** |
| Hostinger | HITL deploy — **PROVE** |

## Prompts
**CTA check**
```
URL:
Click primary CTA mobile+desktop. Pass/fail + screenshot path.
```
