---
chatId: 68b06c2c-c8f0-4683-b434-0b76b2bbb678
workspace: client-engine-1
source: cursor
title: "Data flow audit for site generation"
updated: 1773013538053
messageCount: 4
archived: false
projects: ["[[PROJECTS/client-engine]]", "[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/client-engine-money]]", "[[THEMES/n8n-ops]]"]
tags: [hive]
---

# Data flow audit for site generation

**Workspace:** `client-engine-1`  
**Chat ID:** `68b06c2c-c8f0-4683-b434-0b76b2bbb678`  
**Messages:** 4  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-client-engine-1/agent-transcripts/dc690e0c-ee86-4919-9088-943d970a6de3/subagents/68b06c2c-c8f0-4683-b434-0b76b2bbb678.jsonl`

## What you asked

- Trace the full data flow for the 9 phases:

1. **Client Engine** - Where does enrichSiteBrief run? What does it produce? Where does that get passed to generateContent?
2. **generateContent** - What exact JSON body is sent to the site-builder POST /api/sites/[id]/generate?
3. **Site-builder generate route** - What does it receive? What does it persist to the DB (designSpecJson, themeColorsJson)?
4. **Site-builder preview page** - What does it read from the site? How does it pass designSpec to components?
5. **Section components** - What do they actually use from useDesignSpec()? List each compo

## Assistant (excerpts)

- Tracing the 9-phase data flow across Client Engine and Site-builder. Reading the relevant files.

---

- Checking the site-builder create route and Site model schema:

---

- # 9-Phase Data Flow Audit

## 1. Client Engine — enrichSiteBrief

**Where it runs**
- `regenerate/route.ts` L57: `await enrichSiteBrief(id)`
- `create/route.ts` L90: `await enrichSiteBrief(id)`

**What it produces** (`EnrichedSiteBrief` from `enrich-site-brief.ts`)

| Phase | Field(s) |
|-------|----------|
| 1 | `scope`, `siteMap`, `userFlows` |
| 2 | `brandColors`, `designSystem` (typographyScale, spacingSystem, layoutPatterns, animationGuidelines, wcagNotes) |
| 3 | `contentHints`, `clientInfo` (heroHeadline, heroSubhead, ctaPrimary, features, testimonials, faq, footerTagline, tone) |
| 4 |

## Composer meta

- Name: Data flow audit for site generation
- Subtitle: Read page.tsx, route.ts, registry.tsx, route.ts, DesignSpecContext.tsx

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/client-engine]]
- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/client-engine-money]]
- [[THEMES/n8n-ops]]

## Related chats

- [[20260309-client-engine-1-enrichment-schemas-and-outputs-412bab61|Client-engine-1 enrichment schemas and outputs]]
- [[20260310-website-building-prompts-for-claude-opus-and-fig-dc690e0c|Website building prompts for Claude Opus and Figma]]
- [[20260309-client-engine-1-repository-structure-and-compone-2e508b4f|Client-engine-1 repository structure and component]]
- [[20260309-site-builder-codebase-exploration-94df8a7e|Site-builder codebase exploration]]
- [[20260309-artifact-model-and-builder-proxy-routes-1ec65d96|Artifact model and builder proxy routes]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
