---
name: Compare vendors (Demkinn #25)
description: >-
  Use when: Tooling / infra choice. Demkinn #25. Owner Consultant.
---
# Compare vendors (Demkinn #25)

**Owner desk:** Consultant  
**Lane:** hive-os (+ tag others)  
**Sources:** demkinn skills/25  
**Status:** owned  
**HITL:** ASK before pay


## Tools
| Need | Path |
|---|---|
| Vendor docs / pricing | WebFetch — **PROVE** |
| Requirements list | operator paste — **PROVE** |
| Payment / subscribe | **BLOCKED** without ASK |
| Claim check on price claims | claim-verifier (#47) — **PROVE** |

## Prompts
**Vendor compare**
```
Run Demkinn #25 compare-vendors.
Requirement: [what we need]
Candidates: [A, B, C]
Axes: price · features · limits · integrations · pros · cons · migration · fit to Grok+Cursor hive.
Operator-requirements first (not generic G2 scores). claim-verifier on $. ASK before pay.
```

**Fit-only recommendation**
```
Given this matrix, recommend 1 primary + 1 fallback with migration risk note:
[paste matrix]
No purchase.
```

## When
Tooling / infra choice

## Do
1. Compare on operator requirements — not generic scores
2. Axes: price · features · limits · integrations · pros · cons · migration · fit
3. ASK before pay; claim-verifier on pricing pages

## Don't
- Mint agents · auto-send · auto-pay/book/publish
- New icp_id / business-lanes row without operator yes
- $ FACT without claim-verifier (#47)
- Farms/NSFW sources

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.
