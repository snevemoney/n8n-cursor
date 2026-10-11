---
name: Background infrastructure (Demkinn #55)
description: >-
  Use when: Standing infra health
---
# Background infrastructure (Demkinn #55)

**Owner desk:** Watchdog  
**Lane:** hive-os  
**Sources:** demkinn skills/55, money-mix operator constraints

## When
Standing infra health

## Do
1. Monitor/prep only overnight
2. Report disk/auth deltas
3. No prune/restart without OK

## Don't
- Overnight Tier 3
- PM2 restart without operator

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.

## Tools
| Need | Path |
|---|---|
| Watchdogs | existing monitors — **PROVE** |

## Prompts
**Bg infra**
```
What runs unattended vs needs HITL. List only; no new agents.
```
