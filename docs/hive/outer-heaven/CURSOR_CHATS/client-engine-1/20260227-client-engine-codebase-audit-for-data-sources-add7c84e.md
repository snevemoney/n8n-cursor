---
chatId: add7c84e-9ac0-4c4b-8757-5d7c0ca41596
workspace: client-engine-1
source: cursor
title: "Client-engine codebase audit for data sources"
updated: 1772215490644
messageCount: 7
archived: false
projects: ["[[PROJECTS/client-engine]]", "[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/client-engine-money]]", "[[THEMES/n8n-ops]]"]
tags: [hive]
---

# Client-engine codebase audit for data sources

**Workspace:** `client-engine-1`  
**Chat ID:** `add7c84e-9ac0-4c4b-8757-5d7c0ca41596`  
**Messages:** 7  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-client-engine-1/agent-transcripts/3c2e9c5b-cfd8-4ec5-b0c1-afec043de3e8/subagents/add7c84e-9ac0-4c4b-8757-5d7c0ca41596.jsonl`

## What you asked

- You are auditing the client-engine codebase for disconnected data sources. The user reports Command Center and other pages show stats that "didn't change" and pages aren't connected systematically.

**Background:**
- Two lead flows: IntakeLead (intake path) and Lead (pipeline path - website, Research Engine, Add Lead)
- We previously fixed: intake-leads/summary (pipeline), /api/followups (merged intake+pipeline), conversion funnel, command-center followup counts

**Please:**
1. Map every dashboard page to its API data sources (which endpoints it fetches)
2. For each API used, note whether it i

## Assistant (excerpts)

- Reading key dashboard pages and their API endpoints to map data sources:

---

- Checking API endpoints and components used by these pages:

---

- Checking additional summary APIs and strategy components:

---

- Checking the conversion metrics API:

---

- ## Audit Report: Disconnected Data Sources

### Summary
Several dashboard pages query IntakeLead-only APIs and miss pipeline Lead data, causing stale stats. Caching may also contribute.

---

### Page-by-Page Analysis

#### 1. Command Center (`/dashboard/command-center`)
**API:** `/api/command-center`  
**Cache TTL:** 30 seconds (`withSummaryCache`)

**Data scope:**
- ✅ Followup Queue: BOTH (intake + pipeline) — lines 55-129
- ❌ Intake Actions: INTAKE ONLY — lines 130-169 (only `db.intakeLead`)
- ❌ Proof Gaps: INTAKE ONLY — lines 170-195 (`wonLeadsWithoutProofCandidate` only checks `db.intakeL

## Composer meta

- Name: Client-engine codebase audit for data sources
- Subtitle: Read route.ts, StrategyPipelineContext.tsx, route.ts, route.ts, route.ts

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/client-engine]]
- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/client-engine-money]]
- [[THEMES/n8n-ops]]

## Related chats

- [[20260227-client-engine-dashboard-audit-586691d6|Client Engine dashboard audit]]
- [[20260228-css-style-changes-for-codebase-3c2e9c5b|CSS style changes for codebase]]
- [[20260221-quiet-proof-engine-implementation-4e9afda5|Quiet proof engine implementation]]
- [[20260227-playwright-leads-pipeline-testing-c257780c|Playwright leads pipeline testing]]
- [[20260228-tier-a-api-routes-checklist-14ebfadf|Tier-A API routes checklist]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
