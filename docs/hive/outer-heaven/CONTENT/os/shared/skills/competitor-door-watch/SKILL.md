---
name: Competitor door watch
description: Use weekly to screenshot a rival homepage/pricing/book CTA and alert only on pricing, packaging, or door changes. No ScreenshotOne required.
---
# Competitor door watch

**Owners:** Product GTM + Researcher.

Public **homepage / pricing / book CTA** only. Named rivals only — operator Amazon comps or Path A doors. If the operator has not named the list: **BLOCKED** until they name them. Do not invent Amazon-comp URLs. Do not grow a new SEO lane.

## When
Weekly GTM pulse, or after a Path A door is packed. Not a general web-monitor. Not Slack autopost.

## Recipe
1. Confirm a **named** rival list exists this run (operator Amazon comps or Path A doors). No list → **BLOCKED**: would work if the operator named the rivals. Stop.
2. For each named URL, open the public homepage, pricing, and book CTA in **box Chrome**. Take a screenshot there. Do **not** call ScreenshotOne. Do **not** Slack-autopost.
3. Compare to the last run's screenshot / notes (if any). Ignore layout, hero art, nav chrome, and motion noise.
4. **Alert ONLY** when one of these moved: **price**, **pack**, **book CTA**, **positioning**. Everything else is noise.
5. Output: before / after (paths or dated notes) + **one sentence** why it matters. No new SKU. No new SEO lane. No new desk.

## Tooling (label every run)

| Need | Path | Label |
|---|---|---|
| Named rival list | operator Amazon comps or Path A doors | **PROVE** when named; **BLOCKED** until operator names them |
| Public pages | box Chrome screenshot | **PROVE** |
| ScreenshotOne / paid snap API | not used | **WORKAROUND** — box Chrome instead |
| Slack / inbox autopost | not allowed | **BLOCKED** |
| Layout / hero only | ignore | not an alert |

## Never
- Invent a competitor list
- Alert on hero / layout / type / motion
- ScreenshotOne, Slack autopost, or a new SEO lane
- Scrape behind login, seller-central, or private pricing
- Mint an `icp_id` from a rival door

## Prompts
**Door watch**
```
Named rivals: [operator list only — else BLOCKED]
Pages: homepage / pricing / book CTA
Box Chrome screenshot. No ScreenshotOne. No Slack autopost.
Alert ONLY on price, pack, book CTA, positioning.
Before/after + one sentence why it matters.
Ignore layout/hero. No new SEO lane.
```
