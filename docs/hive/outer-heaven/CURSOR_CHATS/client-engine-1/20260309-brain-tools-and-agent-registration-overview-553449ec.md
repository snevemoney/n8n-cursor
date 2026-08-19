---
chatId: 553449ec-671f-4bd6-9268-45f930f48d27
workspace: client-engine-1
source: cursor
title: "Brain tools and agent registration overview"
updated: 1773023072328
messageCount: 2
archived: false
projects: ["[[PROJECTS/client-engine]]", "[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/client-engine-money]]"]
tags: [hive]
---

# Brain tools and agent registration overview

**Workspace:** `client-engine-1`  
**Chat ID:** `553449ec-671f-4bd6-9268-45f930f48d27`  
**Messages:** 2  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-client-engine-1/agent-transcripts/dc690e0c-ee86-4919-9088-943d970a6de3/subagents/553449ec-671f-4bd6-9268-45f930f48d27.jsonl`

## What you asked

- In the client-engine-1 repo, find and report:
1. How Brain tools are defined in src/lib/brain/ - the tools.ts structure, WRITE_TOOLS set, tool schema format
2. How agents are registered in src/lib/agents/registry.ts - structure, tool allowlist pattern
3. The AgentApproval model and how approval gates work

## Assistant (excerpts)

- ---

## Report: Brain Tools, Agent Registry, and Approval Gates

### 1. Brain tools (`src/lib/brain/tools.ts`)

**Structure**

- Tools are defined as `BRAIN_TOOLS: BrainToolDefinition[]`.
- `BrainToolDefinition` is `Anthropic.Messages.Tool` from `@/lib/llm/anthropic.ts` (Anthropic SDK).
- Each tool has `name`, `description`, and `input_schema`.

**Tool schema format**

```ts
{
  name: "tool_name",
  description: "Human-readable description.",
  input_schema: {
    type: "object" as const,
    properties: {
      paramName: {
        type: "string" | "number" | "boolean" | "object",
        des

## Composer meta

- Name: Brain tools and agent registration overview
- Subtitle: Read route.ts, 005-agent-approval-gates.md, anthropic.ts, runner.ts, executor.ts

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/client-engine]]
- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]
- [[THEMES/client-engine-money]]

## Related chats

- [[20260309-client-engine-1-repository-structure-and-compone-2e508b4f|Client-engine-1 repository structure and component]]
- [[20260309-artifact-model-and-builder-proxy-routes-1ec65d96|Artifact model and builder proxy routes]]
- [[20260309-client-engine-1-enrichment-schemas-and-outputs-412bab61|Client-engine-1 enrichment schemas and outputs]]
- [[20260309-site-builder-codebase-exploration-94df8a7e|Site-builder codebase exploration]]
- [[20260308-data-flow-audit-for-site-generation-68b06c2c|Data flow audit for site generation]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
