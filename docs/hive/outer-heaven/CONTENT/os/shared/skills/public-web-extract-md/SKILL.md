---
name: Public web extract to markdown
description: >-
  Use when Researcher needs clean public-page → markdown/facts without a Firecrawl
  install — Playwright / Browser-use / box browser rubric.
---
# Public web extract → markdown

**Owner:** Researcher
**Path:** **PROVE** on connected Playwright + Browser-use + box browser. Firecrawl API = optional later, not required.

## Steps
1. Open public URL only (no auth bypass, respect robots/ToS).
2. Extract title, key claims, dates, citations into markdown.
3. Label FACT / INFERENCE / UNVERIFIED; run claim-verifier on money/job stats.
4. Save beside the research packet.

## Never
- Scrape behind logins without operator ask
- Second scrape stack on VPS

## Tools
| Need | Path |
|---|---|
| Fetch | WebFetch / Playwright — **PROVE** |

## Prompts
**Extract MD**
```
URL:
Clean markdown extract · key quotes · links. No login walls bypass.
```

## Enrich 2026-10-11: monitor pattern (yt:eH8JdttKIdA, Greg Isenberg on Firecrawl)
- Recurring watch = fetch → structured JSON → diff against the last snapshot → filter by fit → alert only on new matches. Firecrawl's agent does the fetch-and-extract step; our Playwright/WebFetch path does the same without a key.
- The video's business angle (niche data sold as output, per-batch enrichment) is parked: Evens is in building mode, no selling.
- PROVE: `/workspace/research/packets/signals-2mo-backlog-20261010/recreations/20261011/run1430/niche_monitor.py` (stdlib stand-in; Firecrawl not exercised) PASS.
