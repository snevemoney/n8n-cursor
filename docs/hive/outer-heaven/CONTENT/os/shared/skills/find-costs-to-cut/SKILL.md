---
name: Find costs to cut (Demkinn #28)
description: >-
  Use when: Spend review. Demkinn #28. Owner Personal CFO.
---
# Find costs to cut (Demkinn #28)

**Owner desk:** Personal CFO  
**Lane:** hive-os (+ tag others)  
**Sources:** demkinn skills/28  
**Status:** owned  
**HITL:** ASK before cancel/pay


## Tools
| Need | Path |
|---|---|
| Bank / card / SaaS CSV | operator paste — **PROVE** |
| free-for-dev / vendor alts | WebSearch + free-for-dev-vendor-cuts — **PROVE** |
| Cancel / refund actions | **BLOCKED** without ASK |
| Claim check on savings $ | claim-verifier (#47) — **PROVE** |

## Prompts
**Cost-cut pass**
```
Run Demkinn #28 find-costs-to-cut.
Spend dump:
[paste CSV/summary]
Flag: duplication · underused · spikes · cheaper alts.
Report only — no auto-cancel. ASK list for operator. claim-verifier on savings $.
```

**SaaS duplicate hunt**
```
From this subscription list, group duplicates/overlaps only:
[paste]
```

## When
Spend review

## Do
1. Find: duplication · underused · spikes · unnecessary alts
2. Report only; operator cuts
3. No auto-cancel

## Don't
- Mint agents · auto-send · auto-pay/book/publish
- New icp_id / business-lanes row without operator yes
- $ FACT without claim-verifier (#47)
- Farms/NSFW sources

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.
