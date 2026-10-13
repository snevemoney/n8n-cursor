---
name: wayback-site-diff
description: >-
  Use when a prospect site is down, a path 404s, or you need prior
  contact/booking copy from a public web archive.
---
# Wayback site-diff

Public Internet Archive (and siblings) when the live site lies, 404s, or is HOLD.

## When
- MUST-score hits a 404 (`/contact`, `/apply`, `/rendez-vous`)
- Domain NXDOMAIN / timeout (e.g. law site HOLD)
- Need prior pricing, booking URL, or phone that vanished

## Steps
1. **Confirm live failure.** Status code + screenshot or fetch error. That’s the FACT that opens this skill.
2. **CDX lookup (public).**  
   `https://web.archive.org/cdx/search/cdx?url=<host>/*&output=json&fl=original,timestamp,statuscode,mimetype&filter=statuscode:200&collapse=urlkey`  
   Also try the exact 404 path and `*.host`.
3. **Pick 1–3 snapshots.** Newest 200 on the dead path, plus one older if copy changed. Open via `https://web.archive.org/web/<timestamp>/<url>`.
4. **Diff what matters for MUST.** Contact, booking, price, phone, mailto, form vendor (Calendly/TidyCal). Ignore blog chrome.
5. **Label.** Archive text is FACT *as of timestamp*. Do not present it as current. If archive and live disagree, say so.
6. **Siblings if CDX empty.** archive.is, `https://cybdetective.com/webarchiveviewer/`, search-engine cache. Still public, still cited.
7. **Write into the prospect packet** and change HOLD → re-score only if a *live* path now works. Archive alone does not unlock outreach.

## Anti-patterns
- Treating Wayback copy as a live bookable URL
- Bulk-downloading whole sites
- Using this to recover “hidden” admin panels or secrets
- Scanner-style URL brute (gobuster/katana) unless the operator owns the site

## Tools
| Need | Path |
|---|---|
| Wayback | WebFetch archive.org — **PROVE** |

## Prompts
**Wayback diff**
```
URL: … · Windows: …
What changed (IA snapshots). Hive angle. No login bypass.
```
