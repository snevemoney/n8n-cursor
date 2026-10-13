---
name: OSINT handle pivot
description: >-
  Use when a public handle or prospect name needs corroboration across Linktree, GitHub, Medium, LinkedIn — public sources only.
---

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
