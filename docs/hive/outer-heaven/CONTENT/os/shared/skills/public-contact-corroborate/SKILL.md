---
name: Public contact corroborate
description: >-
  Use to confirm a public email or contact path from site/footer/Linktree before any outreach draft.
merged_from: [osint-handle-pivot]
---

# Public contact corroborate

Sources: cyber-razz / cyb_detective public triangulation.

## When
Need a contact path for HITL draft outreach.

## Do
1. Prefer site contact, footer, Linktree, Google Business if public.
2. Corroborate across two public sources when possible.
3. Hand to Comms for HITL draft only.

## Don't
- Scrape private data
- Auto-send
- Buy email lists

---

## Merged from `osint-handle-pivot` (2026-10-11)

- Original description: Use when a public handle or prospect name needs corroboration across Linktree, GitHub, Medium, LinkedIn — public sources only.
- Unique content carried: cross-source handle pivot (Linktree/GitHub/Medium/LinkedIn)

# OSINT handle pivot

Sources: cyber_razz main/backup; cyb_detective username OSINT; x-profile-intel pack.

## When
Named prospect or creator handle needs identity corroboration.

## Do
1. Start from the given handle or domain.
2. Follow public Linktree / site / GitHub / Medium / LinkedIn only.
3. Note main vs backup handles.
4. Label FACT vs UNVERIFIED. No login walls bypassed with credentials theft.

## Don't
- Pentest, nmap, nuclei, Sherlock mass-enum on private people
- DM / follow / like as research
- Exploit or PoC content

## Tools
| Need | Path |
|---|---|
| Public web | WebSearch/WebFetch — **PROVE** |
| Offensive | **BLOCKED** — research-opsec-hygiene read-only only |

## Prompts
**Handle pivot**
```
Handle/domain:
Public corroboration only. No exploit/nmap/brute.
Output link graph + confidence. Quarantine offensive.
```
