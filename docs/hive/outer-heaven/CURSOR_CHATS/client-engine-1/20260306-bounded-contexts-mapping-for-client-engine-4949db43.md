---
chatId: 4949db43-d9e6-40c0-9c85-aa00984ce9b0
workspace: client-engine-1
source: cursor
title: "Bounded contexts mapping for Client Engine"
updated: 1772776736266
messageCount: 4
archived: false
projects: ["[[PROJECTS/client-engine]]", "[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/client-engine-money]]", "[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]"]
tags: [hive]
---

# Bounded contexts mapping for Client Engine

**Workspace:** `client-engine-1`  
**Chat ID:** `4949db43-d9e6-40c0-9c85-aa00984ce9b0`  
**Messages:** 4  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-client-engine-1/agent-transcripts/11a05495-91b3-4b9b-a729-bed444412c88/subagents/4949db43-d9e6-40c0-9c85-aa00984ce9b0.jsonl`

## What you asked

- I need you to map the bounded contexts of the Client Engine codebase. For each domain below, find:
1. Prisma models (in prisma/schema.prisma)
2. API routes (in src/app/api/)
3. Core services/lib files (in src/lib/)
4. Dashboard pages (in src/app/dashboard/)

The domains are:
- Lead Intake (leads, intake, capture, pipeline)
- Proposals / Sales (proposals, artifacts, outreach)
- Delivery / Proof (delivery projects, milestones, proof, content distribution)
- Risk / NBA (risk flags, next best actions, scoring)
- Copilot / Memory (copilot sessions, memory, attribution, learned weights)
- Founder OS

## Assistant (excerpts)

- Mapping bounded contexts across the codebase. Exploring the schema, API routes, lib structure, and dashboard pages.

---

- Verifying a few domain boundaries and cross-references:

---

- # Bounded Contexts Map — Client Engine

## 1. Lead Intake (leads, intake, capture, pipeline)

| Layer | Items |
|-------|-------|
| **Prisma models** | `Lead`, `IntakeLead`, `LeadActivity`, `PipelineRun`, `PipelineStepRun`, `LeadTouch`, `LeadReferral`, `LeadAttribution`, `Cadence` |
| **API routes** | `/api/capture`, `/api/intake-leads`, `/api/intake-leads/[id]`, `/api/intake-leads/[id]/promote`, `/api/intake-leads/[id]/score`, `/api/intake-leads/[id]/set-followup`, `/api/intake-leads/[id]/followup-*`, `/api/intake-leads/[id]/proof-candidate`, `/api/intake-leads/[id]/proposal`, `/api/intake-le

## Composer meta

- Name: Bounded contexts mapping for Client Engine
- Subtitle: Read prisma-models.md, pages.md, api-routes.md, schema.prisma

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/client-engine]]
- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/client-engine-money]]
- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]

## Related chats

- [[20260306-repo-review-and-architectural-assessment-11a05495|Repo review and architectural assessment]]
- [[20260306-api-route-test-file-analysis-475d559b|API route test file analysis]]
- [[20260222-missing-components-in-build-5ad508ad|Missing components in build]]
- [[20260227-client-engine-dashboard-audit-586691d6|Client Engine dashboard audit]]
- [[20260308-self-improvement-skill-framework-0e0eaab3|Self-improvement skill framework]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
