---
name: GSC dying pages
description: Use for a read-only Search Console or GEO visibility check. Recommend only. Never publish or stand up an SEO writer team.
---
# GSC dying pages (read-only)

**Owner:** Researcher. Consultant may request. **READ-ONLY.**

Open SEO / Julian farm / geo-town articles / AEO CMS autopilot = **PARK / REFUSE**. No new SEO lane. No SEO team. No commit. No publish.

## When
Operator asks what pages are leaking impressions, or which queries sit on page two. Same skill for a **GEO visibility** read — still recommend-only, still not a new lane.

## Recipe
1. Check whether a Search Console connector is actually connected this session (MCP / plugin status). Hostinger WordPress or a sitemap fetch is **not** GSC.
2. **If GSC is connected:** list pages losing impressions (period vs prior) and queries stuck on page two. Numbers from the connector are **FACT**. Why they fell is **INFERENCE**.
3. **If GSC is not connected:** stop and write **BLOCKED**: would work if Search Console were connected. Do not scrape SERPs as a fake GSC. Do not invent a dying-page list.
4. Output **exactly**:
   - one leak sentence
   - **exactly one** recommended fix (technical or copy)
   - draft of that fix is optional
5. Hand the note to the requester. Do not commit. Do not publish. Do not open a writer queue.

GEO visibility uses the same output shape: one leak sentence + one recommended fix. No town-page program. No AEO autopilot.

## Tooling (label every run)

| Need | Path | Label |
|---|---|---|
| Google Search Console connector | only if present and authed | **PROVE** when connected; else **BLOCKED** — would work if GSC connected |
| Public page / sitemap read | WebFetch / box Chrome | **WORKAROUND** for "is this URL live?" — never a substitute for GSC counts |
| Open SEO farm / Julian / geo-town / AEO CMS | refused | **BLOCKED** / **PARK** — not a missing-tool ask; do not stand it up |
| Commit / publish / SEO desk | not this skill | **BLOCKED** |

## Never
- Open an SEO writer team or Monday SEO routine
- Geo-targeted town pages, doorway pages, or AEO CMS autopilot
- Treat Hostinger / WordPress as Search Console
- Commit, merge, or publish the fix
- Start a new SEO or GEO lane

## Prompts
**Read-only leak check**
```
Property: [domain] (only if GSC connected)
Window: [28d vs prior]
List pages losing impressions + page-two queries.
Output: one leak sentence + exactly one recommended fix. Draft optional.
If no GSC: BLOCKED — would work if Search Console were connected.
PARK: open SEO / Julian farm / geo-town / AEO autopilot.
No commit. No publish. No new lane.
```
