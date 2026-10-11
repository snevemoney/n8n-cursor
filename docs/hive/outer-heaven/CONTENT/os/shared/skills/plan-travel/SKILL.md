---
name: Plan travel (Demkinn #40)
description: >-
  Use when: Trip ask. Demkinn #40. Owner Day Planner.
---
# Plan travel (Demkinn #40)

**Owner desk:** Day Planner  
**Lane:** hive-os (+ tag others)  
**Sources:** demkinn skills/40  
**Status:** owned  
**HITL:** ASK book/pay


## Tools
| Need | Path |
|---|---|
| Maps / schedules / weather | WebSearch/WebFetch — **PROVE** |
| Itinerary artifact | Day Planner brief — **PROVE** |
| Book / pay flights/hotels | **BLOCKED** without ASK |
| Calendar holds | operator HITL — **WORKAROUND** |

## Prompts
**Travel plan**
```
Run Demkinn #40 plan-travel.
Dates: […] · Budget: […] · From/To: […] · Prefs: […]
Geo-clustered itinerary + weather alts + cost bands.
No bookings — mark options READY_FOR_HITL. Quarantine sketchy venues.
```

**Day-by-day only**
```
Tighten this trip to a day-by-day with walk times + rain alts:
[paste draft]
```

## When
Trip ask

## Do
1. Collect dates · budget · prefs; geo-clustered itinerary; weather alts
2. Options only — no bookings without HITL
3. Quarantine sketchy/NSFW venues

## Don't
- Mint agents · auto-send · auto-pay/book/publish
- New icp_id / business-lanes row without operator yes
- $ FACT without claim-verifier (#47)
- Farms/NSFW sources

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.
