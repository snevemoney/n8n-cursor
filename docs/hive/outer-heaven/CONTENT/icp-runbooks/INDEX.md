# Hunt ICP runbooks — ready today

**Lane:** `ai-partner-websites` (all client ICPs) · `us` = internal Path C  
**Default hunt geo:** **Greater Montreal** (unless Evens names another city)  
**Router:** `website-offer-funnel` → pick Path A / B / C  
**Hunt board:** [HUNT_LOG.md](./HUNT_LOG.md) — append rows at end of every Today  
**Catalog JSON:** [../watch-later/business-types.json](../watch-later/business-types.json)  
**Steal sheet:** [../watch-later/STEAL_SHEET.md](../watch-later/STEAL_SHEET.md)  
**Skill:** `scripts/hive/grok-skills/icp-runbook.md` · Cursor: `.cursor/skills/icp-runbook`

**Not** `business-lanes.json` rows — these are **hunt types** under the website/AI Partner lane.

## Pick an ICP → open the runbook

| icp_id | Runbook | Path | Default machine | Lead agent |
|--------|---------|------|-----------------|------------|
| `local-clinic` | [local-clinic.md](./local-clinic.md) | A | `review-to-book` | Lead Hunter |
| `local-pro` | [local-pro.md](./local-pro.md) | A | `private-book-install` | Lead Hunter |
| `restaurant` | [restaurant.md](./restaurant.md) | A | `missed-call-book` | Lead Hunter + Consultant |
| `exec-coach` | [exec-coach.md](./exec-coach.md) | A/C | `orchestrated-site-brief` | Lead Hunter + Consultant + Forge |
| `creator-longform` | [creator-longform.md](./creator-longform.md) | A/C | `clip-factory` | Lead Hunter + Publishing + Creative |
| `agency-delivery` | [agency-delivery.md](./agency-delivery.md) | A/C | `client-delivery-kit` | Lead Hunter + Consultant + Forge |
| `industrial-smb` | [industrial-smb.md](./industrial-smb.md) | B→A | `list-anneal` | Lead Hunter |
| `mktg-software` | [mktg-software.md](./mktg-software.md) | B | `list-anneal` | Lead Hunter |
| `owner-coach-fitness` | [owner-coach-fitness.md](./owner-coach-fitness.md) | A | `private-book-install` | Lead Hunter |
| `law-adj` | [law-adj.md](./law-adj.md) | A | `private-book-install` | Lead Hunter |
| `us` | [us.md](./us.md) | C | internal desk | Big Boss + Forge |

## Route here (disambiguation — pick ONE tag)

| If prospect is… | Tag | Not |
|-----------------|-----|-----|
| Dentist, med-spa, physio, vet, dental hygiene | `local-clinic` | `local-pro` |
| Plumber, HVAC, salon, home services (trade) | `local-pro` | `law-adj` · `owner-coach-fitness` |
| Solo lawyer, boutique consult, law-adjacent pro services | `law-adj` | `local-pro` |
| Fitness coach, trainer, wellness coach with leaky book | `owner-coach-fitness` | `exec-coach` |
| Exec coach: VP→consulting, numbered 90-day promise | `exec-coach` | `owner-coach-fitness` |
| Indie restaurant | `restaurant` | OpenTable/Resy alone ≠ leak — need missed-call / after-hours gap |
| Podcaster, YouTuber, course creator (long-form) | `creator-longform` | Short-form-only creators |
| Agency owner drowning in client delivery | `agency-delivery` | Marketing **software** company |
| Manufacturing, castings, robotics, B2B industrial | `industrial-smb` | `mktg-software` |
| Marketing **software** product (not agency) | `mktg-software` | Agency · “I do AI” shop |
| Evens / hive desk / our proof | `us` | Any client ICP |

**Named URL on any client ICP?** Run Path A money spine (MUST → constraint → four-blank → margin) **before** build — even for A/C types.

## Kill (never tag these)

OFM/IG farms · betting · auto-dial · auto-book-no-callback · generic landing mill · “I do AI” · tweet/YouTube $ as proof · real-estate walkthrough SKU.

## Operator one-liner (Cursor)

```
Tag icp_id: <id> · city: Greater Montreal · URL: <if named> · Run Today from CONTENT/icp-runbooks/<id>.md · append HUNT_LOG.md
```
