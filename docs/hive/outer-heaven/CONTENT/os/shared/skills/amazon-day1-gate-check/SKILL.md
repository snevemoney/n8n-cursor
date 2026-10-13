---
name: Amazon day-1 gate-check no spend
description: >-
  Use when: Before any unit purchase
---
# Amazon day-1 gate-check no spend

**Owner desk:** Personal CFO  
**Lane:** amazon-own-store  
**Sources:** AMAZON-DAY1-OFFERS.md, AMAZON-DAY1-FILTERS.md

## When
Before any unit purchase

## Do
1. Add a Product probe
2. Record Sell vs Request approval
3. Skip gated
4. No purchase this step

## Don't
- Invent ungated list without Seller Central
- Food/supplements day 1

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.

## Tools
| Need | Path |
|---|---|
| Checklists | ecom-ops-cut-20260813/ — **PROVE** |

## Prompts
**Day1 gate**
```
No spend until gate checklist green. Match ASIN / signup as separate skills.
```
