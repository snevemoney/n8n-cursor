---
chatId: 4c9a9d3d-85ae-4b57-9eab-b00a75b202e9
workspace: client-engine-1
source: cursor
title: "Client-engine-1 codebase exploration"
updated: 1772585901041
messageCount: 3
archived: false
projects: ["[[PROJECTS/client-engine]]", "[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/scorpion-ops]]", "[[THEMES/client-engine-money]]"]
tags: [hive]
---

# Client-engine-1 codebase exploration

**Workspace:** `client-engine-1`  
**Chat ID:** `4c9a9d3d-85ae-4b57-9eab-b00a75b202e9`  
**Messages:** 3  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-client-engine-1/agent-transcripts/187e6d13-59df-4361-94fd-beacfaa485e9/subagents/4c9a9d3d-85ae-4b57-9eab-b00a75b202e9.jsonl`

## What you asked

- Explore client-engine-1 codebase structure. Find:
1. Pipeline worker location and structure (pipeline-worker, pipeline-steps)
2. API routes that duplicate pipeline logic (enrich, score, propose)
3. Health endpoints (api/health, api/worker/health)
4. Dockerfile structure and COPY commands
5. Existing tests (Vitest, Playwright, smoke tests)
6. Auth/access control patterns in API routes
7. Zod or validation usage
8. Rate limiting
9. Prisma transaction usage
10. next-auth version in package.json

Return a concise summary of what exists vs what the TECH_DEBT_AUDIT expects.

## Assistant (excerpts)

- Exploring the codebase and TECH_DEBT_AUDIT expectations.

---

- Here’s a concise summary of what exists vs. what a typical tech debt audit would expect.

---

## Codebase Structure Summary

### 1. Pipeline worker and pipeline steps

**Exists:**
- **Pipeline steps:** `src/lib/pipeline/orchestrator.ts` — `PIPELINE_STEPS = ["enrich", "score", "position", "propose"]`
- **Step implementations:** `src/lib/pipeline/enrich.ts`, `score.ts`, `positioning.ts`, `propose.ts`
- **Worker:** `src/workers/index.ts` — BullMQ workers for `enrich`, `score`, `monitor`

**Gap:** Workers are stubs. They only `console.log` and never call the pipeline:

```9:15:src/workers/index.t

## Composer meta

- Name: Client-engine-1 codebase exploration
- Subtitle: Read docker-compose.yml, api-utils.ts, queue.ts, api-routes-audit.spec.ts, route.ts

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/client-engine]]
- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]
- [[THEMES/scorpion-ops]]
- [[THEMES/client-engine-money]]

## Related chats

- [[20260221-current-inventory-and-future-pipeline-plans-fb5d2bb0|Current inventory and future pipeline plans]]
- [[20260226-website-performance-issues-2db66e24|Website performance issues]]
- [[20260304-command-center-data-fetching-analysis-cecf72a7|Command-center data fetching analysis]]
- [[20260306-youtube-ingest-feature-audit-75d0fa82|YouTube ingest feature audit]]
- [[20260221-local-versus-production-configuration-settings-12251b21|Local versus production configuration settings]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
