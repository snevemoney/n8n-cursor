---
name: Weekly business reports (Demkinn #27)
description: >-
  Use when: Weekly review. Demkinn #27. Owner Money Desk.
---
# Weekly business reports (Demkinn #27)

**Owner desk:** Money Desk  
**Lane:** hive-os (+ tag others)  
**Sources:** demkinn skills/27  
**Status:** owned  
**HITL:** ASK on money claims


## Tools
| Need | Path |
|---|---|
| Metrics export / bank CSV | operator paste — **PROVE** |
| Lane tags | business-lanes ids (no new rows) — **PROVE** |
| Live ad/platform APIs | **WORKAROUND** exports if connector missing |
| Publish $ as FACT | **BLOCKED** until claim-verifier Confirmed |

## Prompts
**Weekly signal report**
```
Run Demkinn #27 weekly-business-reports.
Window: [dates]
Inputs: [paste metrics / links]
Signal-only: what moved · what to investigate · lane tags.
Max 10 lines that matter. $ = UNVERIFIED until claim-verifier. ASK before external money claims.
```

**Investigate list**
```
From this weekly, produce top 3 investigate cards (hypothesis · data needed · owner):
[paste]
```

## When
Weekly review

## Do
1. Signal not 70 metrics: what moved · what to investigate
2. Tag lane ids
3. $ unverified until source + claim-verifier

## Don't
- Mint agents · auto-send · auto-pay/book/publish
- New icp_id / business-lanes row without operator yes
- $ FACT without claim-verifier (#47)
- Farms/NSFW sources

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.
