---
chatId: 94df8a7e-960c-46ff-bc5e-d5a34823b165
workspace: client-engine-1
source: cursor
title: "Site-builder codebase exploration"
updated: 1773034955525
messageCount: 2
archived: false
projects: ["[[PROJECTS/client-engine]]", "[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/client-engine-money]]"]
tags: [hive]
---

# Site-builder codebase exploration

**Workspace:** `client-engine-1`  
**Chat ID:** `94df8a7e-960c-46ff-bc5e-d5a34823b165`  
**Messages:** 2  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-client-engine-1/agent-transcripts/dc690e0c-ee86-4919-9088-943d970a6de3/subagents/94df8a7e-960c-46ff-bc5e-d5a34823b165.jsonl`

## What you asked

- Explore the site-builder codebase to understand:
1. All section components (Hero, About, Services, Testimonials, Booking, Contact, Footer) - their structure, props, and what they render
2. DesignSpecContext and how spec flows to components
3. The DesignSpec type and what fields exist
4. How theme/colors are applied (themeToStyleVars, getTheme)
5. Any existing font loading or CSS variable usage
Return: file paths, key structures, and gaps for applying design spec (fonts, radius, shadows, layout).

## Assistant (excerpts)

- Here’s a concise report of the site-builder codebase:

---

# Site-Builder Codebase Exploration Report

## 1. Section Components (Hero, About, Services, Testimonials, Booking, Contact, Footer)

### Preview rendering (`builder/src/app/preview/[id]/page.tsx`)

There are no separate section components. The preview uses inline JSX:

- **Hero** (lines 33–46): Renders when `s.type === "hero" || s.type === "homepage"`. Uses `heroProps.headline`, `heroProps.subhead`, `heroProps.ctaText`, `heroProps.ctaLink`. Single `<header>` with gradient, h1, p, and CTA link.
- **Other sections** (lines 48–56): All 

## Composer meta

- Name: Site-builder codebase exploration
- Subtitle: Read 2026-03-09-builder-service-scaffold.md, page.tsx, page.tsx, CHANGELOG.md, schema.prisma

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/client-engine]]
- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]
- [[THEMES/client-engine-money]]

## Related chats

- [[20260309-artifact-model-and-builder-proxy-routes-1ec65d96|Artifact model and builder proxy routes]]
- [[20260308-data-flow-audit-for-site-generation-68b06c2c|Data flow audit for site generation]]
- [[20260310-website-building-prompts-for-claude-opus-and-fig-dc690e0c|Website building prompts for Claude Opus and Figma]]
- [[20260309-client-engine-1-enrichment-schemas-and-outputs-412bab61|Client-engine-1 enrichment schemas and outputs]]
- [[20260309-client-engine-1-repository-structure-and-compone-2e508b4f|Client-engine-1 repository structure and component]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
