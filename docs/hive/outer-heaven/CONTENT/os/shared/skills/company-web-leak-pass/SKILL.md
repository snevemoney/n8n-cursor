---
name: company-web-leak-pass
description: >-
  Use when scoring or deepening a small-business website for intake leakage
  (404s, mailto-only, buried booking) without running scanners.
---
# Company-web leak pass

Walk a small-business site for intake leakage the way MUST-score needs it. Public pages only. No scanners.

## When
Lead Hunter handed a URL, or Researcher is MUST-scoring. Complements lead-web-find (find) and prospect-must-score (verdict).

## Steps
1. **Open the live site.** Home, /contact, /book, /apply, /about, footer. Note status codes. 404 on those paths is evidence.
2. **Map the intake path.** Form vendor (Calendly, TidyCal, native), mailto, phone, DM-only, or dead. One sentence: how a stranger actually reaches the owner.
3. **Public extras, no brute.** robots.txt, sitemap.xml, Linktree from bio. Follow *their* links only. Do not gobuster, katana, nuclei, or subdomain brute.
4. **If a path is dead or the host is down:** wayback-site-diff. If the handle is thin: osint-handle-pivot.
5. **Constraint hypothesis.** ACQUIRE (leads die at intake) or CUT (hours burned on missed calls / 404s). Mark hypothesis.
6. **Hand off.** URL · contact · 404s · constraint sentence · vertical tag. Do not score the MUST here if this is a LH find; Researcher scores.

## Anti-patterns
- Scanner/recon tool default
- Treating a pretty site as “no leak”
- Outreach copy
- Mixing coaching janethoyt.com with a different law domain without two self-links

## Tools
| Need | Path |
|---|---|
| Public pages | WebFetch/Playwright — **PROVE** |
| Offensive scan | **BLOCKED** — no pentest |

## Prompts
**Leak pass (public)**
```
Company URL:
Public footers · careers · docs · status · pricing leaks
Read-only. No exploit.
```
