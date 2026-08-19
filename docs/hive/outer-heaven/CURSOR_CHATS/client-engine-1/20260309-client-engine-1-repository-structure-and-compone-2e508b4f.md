---
chatId: 2e508b4f-5a26-4726-aa1c-8a6ca6cdd73a
workspace: client-engine-1
source: cursor
title: "Client-engine-1 repository structure and components"
updated: 1773023072838
messageCount: 4
archived: false
projects: ["[[PROJECTS/client-engine]]", "[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/client-engine-money]]"]
tags: [hive]
---

# Client-engine-1 repository structure and components

**Workspace:** `client-engine-1`  
**Chat ID:** `2e508b4f-5a26-4726-aa1c-8a6ca6cdd73a`  
**Messages:** 4  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-client-engine-1/agent-transcripts/dc690e0c-ee86-4919-9088-943d970a6de3/subagents/2e508b4f-5a26-4726-aa1c-8a6ca6cdd73a.jsonl`

## What you asked

- In the client-engine-1 repo, find and report:
1. The enrich-site-brief-9phases.ts structure - how phases run, what each phase outputs, skill loading
2. The skills in src/lib/builder/skills/ - list all .md files and their purpose
3. The JobRun model and how jobs are enqueued (enqueueJob, runJobsLoopOnce pattern)

## Assistant (excerpts)

- Reading skill files and job-related code for details:

---

- Checking the claim logic and job types:

---

- ---

## Report

### 1. `enrich-site-brief-9phases.ts` structure

**Location:** `src/lib/builder/enrich-site-brief-9phases.ts`

**Flow:**
- One LLM call per phase, run in sequence.
- Each phase uses a skill file as the system prompt and returns a JSON fragment.
- Outputs are merged into a single `EnrichedSiteBrief`.

**Skill loading:**
- `loadSkill(name)` reads `src/lib/builder/skills/{name}.md` via `readFileSync`.
- If the file is missing, it returns `""` and the system prompt falls back to a minimal JSON-only instruction.

**Phase execution (`runPhase`):**
1. Load skill content from `{skillNa

## Composer meta

- Name: Client-engine-1 repository structure and components
- Subtitle: Read types.ts, claim.ts, runner.ts, enqueue.ts, schema.prisma

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
- [[20260309-brain-tools-and-agent-registration-overview-553449ec|Brain tools and agent registration overview]]
- [[20260308-data-flow-audit-for-site-generation-68b06c2c|Data flow audit for site generation]]
- [[20260309-client-engine-1-enrichment-schemas-and-outputs-412bab61|Client-engine-1 enrichment schemas and outputs]]
- [[20260221-current-inventory-and-future-pipeline-plans-fb5d2bb0|Current inventory and future pipeline plans]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
