---
name: Analyze customer reviews (Demkinn #26)
description: >-
  Use when: Offer/ICP research. Demkinn #26. Owner Consultant.
---
# Analyze customer reviews (Demkinn #26)

**Owner desk:** Consultant  
**Lane:** hive-os (+ tag others)  
**Sources:** demkinn skills/26  
**Status:** owned  
**HITL:** none


## Tools
| Need | Path |
|---|---|
| Public review pages | WebFetch (G2/Amazon/etc.) — **PROVE** |
| Operator CSV export | paste/upload — **WORKAROUND** |
| Review farm / NSFW sources | **BLOCKED** — quarantine |
| Claim check on star/$ claims | claim-verifier (#47) — **PROVE** |

## Prompts
**Review theme pass**
```
Run Demkinn #26 analyze-customer-reviews.
Product/ICP: […]
Sources: [URLs or pasted reviews]
Output themes: compliments · complaints · requests · triggers · exact language.
Flag repeated frustrations as fix/offer candidates. Quarantine farms/NSFW. No invented quotes.
```

**Sigh → offer hints**
```
From these complaint themes, list 5 offer hypotheses for Consultant (not builds):
[paste]
```

## When
Offer/ICP research

## Do
1. Mine: compliments · complaints · requests · triggers · language
2. Repeated frustration = fix / offer candidate
3. Quarantine farms/NSFW; no fake review generation

## Don't
- Mint agents · auto-send · auto-pay/book/publish
- New icp_id / business-lanes row without operator yes
- $ FACT without claim-verifier (#47)
- Farms/NSFW sources

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.
