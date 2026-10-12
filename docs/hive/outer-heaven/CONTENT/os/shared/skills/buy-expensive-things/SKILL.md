---
name: Buy expensive things smarter (Demkinn #41)
description: >-
  Use when: Big purchase. Demkinn #41. Owner Personal CFO.
merged_from: [buy-expensive-smarter]
---
# Buy expensive things smarter (Demkinn #41)

**Owner desk:** Personal CFO  
**Lane:** hive-os (+ tag others)  
**Sources:** demkinn skills/41  
**Status:** owned  
**HITL:** ASK pay


## Tools
| Need | Path |
|---|---|
| Spec / review research | WebSearch/WebFetch — **PROVE** |
| match-model-to-task | workflow — **PROVE** companion |
| Purchase / checkout | **BLOCKED** without ASK |
| Claim check on 'save $X' | claim-verifier (#47) — **PROVE** |

## Prompts
**Expensive buy brief**
```
Run Demkinn #41 buy-expensive-things.
Item category: […]
Must-haves vs nice-to-haves: […]
Budget ceiling: […]
Compare 2–3 options: needs-fit · unused specs · TCO · risk.
Recommend one — no purchase. ASK before pay. claim-verifier on savings claims.
```

**Needs vs specs**
```
Strip this product to must-have specs only; list likely unused features:
[paste]
```

## When
Big purchase

## Do
1. Needs vs unused specs; where spend actually helps
2. Compare 2–3 options; TCO not sticker only
3. No purchase automation — ASK pay

## Don't
- Mint agents · auto-send · auto-pay/book/publish
- New icp_id / business-lanes row without operator yes
- $ FACT without claim-verifier (#47)
- Farms/NSFW sources

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.

---

## Merged from `buy-expensive-smarter` (2026-10-11)

- Original description: Alias for Demkinn #41. Canonical workflow id is buy-expensive-things. Use buy-expensive-things. Distinct from cheap-read-expensive-decide (model routing).
- Unique content carried: distinction note vs cheap-read-expensive-decide

# Buy expensive smarter (alias)

**Canonical:** [buy-expensive-things](sand-workflow:buy-expensive-things) (Demkinn #41)  
**Not:** match-model-to-task (model routing)

## Tools
| Need | Path |
|---|---|
| Canonical skill | buy-expensive-things — **PROVE** |
| Model routing | match-model-to-task — **PROVE** (different skill) |

## Prompts
**Redirect**
```
Use workflow buy-expensive-things (Demkinn #41). Do not use this alias id for new packets.
```
