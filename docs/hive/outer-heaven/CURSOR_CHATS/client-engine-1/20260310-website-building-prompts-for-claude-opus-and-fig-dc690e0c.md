---
chatId: dc690e0c-ee86-4919-9088-943d970a6de3
workspace: client-engine-1
source: cursor
title: "Website building prompts for Claude Opus and Figma Make"
updated: 1773159124475
messageCount: 597
archived: false
projects: ["[[PROJECTS/client-engine]]", "[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/client-engine-money]]", "[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]"]
tags: [hive]
---

# Website building prompts for Claude Opus and Figma Make

**Workspace:** `client-engine-1`  
**Chat ID:** `dc690e0c-ee86-4919-9088-943d970a6de3`  
**Messages:** 597  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-client-engine-1/agent-transcripts/dc690e0c-ee86-4919-9088-943d970a6de3/dc690e0c-ee86-4919-9088-943d970a6de3.jsonl`

## What you asked

- Here are 9 insane Claude Opus 4.6 + Figma Make prompts for site builder to use when building websites for clients. Claude Opus 4.6 for architecture, logic & complex reasoning
- Figma Make for pixel-perfect UI, interactions & deployment. PROMPT 1: The Architecture Strategist

You are a Principal Architect at Vercel. Build a [WEBSITE TYPE].
Requirements:
Target: [AUDIENCE]
Features: [LIST 3-5]
Tech: [RESPONSIVE/SEO/PERFORMANCE]

Deliver:
Site map (page hierarchy)
User flows (3 journeys)
Data models (if dynamic)
Show more

PROMPT 2: The Design System Generator

You are Apple's Design Director. Cr

---

- this is to make better websites automatically. nothing manually

---

- <attached_files>

<code_selection path="file:///Users/evenslouis/.cursor/plans/site_builder_auto-enrichment_b7641490.plan.md" lines="1-196">
---
name: Site Builder Auto-Enrichment
overview: Automatically enrich builder payloads (createSite + generateContent) by running a condensed LLM prompt before each build. The prompt embodies the logic of Prompts 1–3 (architecture, design system, content) to produce better scope, brandColors, contentHints, and clientInfo—no manual steps.
todos: []
isProject: false
---

# Site Builder Auto-Enrichment Plan

## Goal

Make better websites **automatically** by 

---

- Here are 9 insane Claude Opus 4.6 + Figma Make prompts for site builder to use when building websites for clients. Claude Opus 4.6 for architecture, logic & complex reasoning
- Figma Make for pixel-perfect UI, interactions & deployment. PROMPT 1: The Architecture Strategist

You are a Principal Architect at Vercel. Build a [WEBSITE TYPE].
Requirements:
Target: [AUDIENCE]
Features: [LIST 3-5]
Tech: [RESPONSIVE/SEO/PERFORMANCE]

Deliver:
Site map (page hierarchy)
User flows (3 journeys)
Data models (if dynamic)
Show more

PROMPT 2: The Design System Generator

You are Apple's Design Director. Cr

---

- this is to make better websites automatically. nothing manually

---

- <attached_files>

<code_selection path="/Users/evenslouis/.cursor/plans/site_builder_auto-enrichment_b7641490.plan.md" lines="1-189">
# Site Builder Auto-Enrichment Plan

## Goal

Make better websites **automatically** by enriching what Client Engine sends to the builder API. No manual prompt-running. The system runs an enrichment step before every `createSite` + `generateContent` call.

---

## Current Flow

```mermaid
flowchart LR
    A[Delivery Project + Lead] --> B[createSite]
    B --> C[generateContent]
    C --> D[Quality Check]
```

**Payloads today:**

- `createSite`: industry preset,

---

- using browser mcp, test with a lead i already have and compare it to the a website i did

---

- you didnt do anything. i wanted you to stay in dev. i said to test the new implementation

## Assistant (excerpts)

- Verification summary:

## Phase 2 implementation verification

### TypeScript
- `npx tsc --noEmit` — passes

### Unit & route tests
- 113 tests pass across:
  - `coach-tools`, `coach-actions`, `coach-engine`
  - `scores/summary`, `history`, `compute`
  - `risk/summary`, `route`, `run-rules`
  - `next-actions/summary`, `route`, `run`
  - `copilot/coach`, `copilot/coach/action`

### Data flow
- **coach-tools** — no `fetch`, `coachFetch`, `baseUrl`, or `cookie`; uses services only
- **Coach route** — calls `getScoreContext`, `getRiskContext`, `getNBAContext` with no opts
- **Coach action route** 

---

- **Error -102** is Chrome’s **ERR_CONNECTION_REFUSED**: the browser can’t connect to the server.

For `http://localhost:3000/dashboard/delivery/...` this usually means:

1. **Dev server not running** — Next.js isn’t listening on port 3000.
2. **Wrong port** — The app might be on another port (e.g. 3001).

**Fix:** Start the dev server:

```bash
npm run dev
```

Then open `http://localhost:3000/dashboard/delivery/cmm80xcwz00b5v5in14g5bkyb` again.

If the server is already running, check the terminal for the port it’s using and try that URL instead.

---

- Dev server is running at **http://localhost:3000**.

You can open: http://localhost:3000/dashboard/delivery/cmm80xcwz00b5v5in14g5bkyb

---

- Creating lead-service and refactoring routes and executor.

---

- Phase 2 refactor is updated with the lead service. Summary:

## Lead service

**`src/lib/services/lead-service.ts`**
- `list(options)` — status, source, verdict, search, limit
- `create(data)` — create lead
- `getById(id, opts?)` — fetch with default includes
- `update(id, data)` — update lead
- `deleteLead(id)` — delete lead
- `listForAgent(options)` — compact list for brain executor

**Routes**
- `GET/POST /api/leads` — use `list`, `create`
- `GET/PATCH/DELETE /api/leads/[id]` — use `getById`, `update`, `deleteLead`; `requireLeadAccess` replaced with `requireAuth` + service

**Brain executor

## Composer meta

- Name: Website building prompts for Claude Opus and Figma Make
- Subtitle: Edited ROADMAP.md, 2026-03-08-phase-2-architecture-refactor.md, CHANGELOG.md, route.test.ts, executor.ts

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/client-engine]]
- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/client-engine-money]]
- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]

## Related chats

- [[20260221-current-inventory-and-future-pipeline-plans-fb5d2bb0|Current inventory and future pipeline plans]]
- [[20260308-self-improvement-skill-framework-0e0eaab3|Self-improvement skill framework]]
- [[20260306-repo-review-and-architectural-assessment-11a05495|Repo review and architectural assessment]]
- [[20260222-missing-components-in-build-5ad508ad|Missing components in build]]
- [[20260221-quiet-proof-engine-implementation-4e9afda5|Quiet proof engine implementation]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
