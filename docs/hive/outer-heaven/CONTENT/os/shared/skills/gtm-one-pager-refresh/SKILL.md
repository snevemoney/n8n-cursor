---
name: GTM one-pager refresh
description: >-
  Use when a public AI Partner proof URL goes live or changes — update one-pager
  CTAs; never put localhost in client-facing drafts.
---
# GTM one-pager refresh (Product GTM)

## When
A public proof (cinematic, MCP, speed-to-lead, or other sales demo) gets a new live URL, or an old CTA breaks.

## Steps
1. Confirm each proof URL returns public HTTP 200 (no auth wall, no localhost).
2. Open `~/.grokbot/research/ai-partner-gtm-one-pager-20260812.md` (or current SoT one-pager).
3. Update Proof + CTA sections only — keep Acquire/Grow/Cut framing; no fake $ claims.
4. Strip any `127.0.0.1` / local demo links from client-facing lines.
5. Note date + which URL changed. Ping Publishing only if a SHARE asset must follow.
6. Do not send outreach from this refresh.

## Tools
| Need | Path |
|---|---|
| Drive | Google Drive — **PROVE** |

## Prompts
**One-pager**
```
Lane:
Promise · who · proof · CTA · what we never do. Refresh on disk.
```
