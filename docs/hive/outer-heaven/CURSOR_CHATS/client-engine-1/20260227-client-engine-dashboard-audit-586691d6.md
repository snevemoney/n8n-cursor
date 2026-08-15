---
chatId: 586691d6-6cea-4980-80de-22ad5326d8f5
workspace: client-engine-1
source: cursor
title: "Client Engine dashboard audit"
updated: 1772216021011
messageCount: 10
archived: false
projects: ["[[PROJECTS/client-engine]]", "[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/client-engine-money]]", "[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]"]
tags: [hive]
---

# Client Engine dashboard audit

**Workspace:** `client-engine-1`  
**Chat ID:** `586691d6-6cea-4980-80de-22ad5326d8f5`  
**Messages:** 10  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-client-engine-1/agent-transcripts/3c2e9c5b-cfd8-4ec5-b0c1-afec043de3e8/subagents/586691d6-6cea-4980-80de-22ad5326d8f5.jsonl`

## What you asked

- Perform a systematic audit of the Client Engine dashboard. For each page/section below, identify:
1. Which API endpoint(s) it fetches
2. Whether data scope is IntakeLead only, Lead (pipeline) only, or both
3. Any data gaps (missing pipeline or intake data)
4. Caching that could cause stale data

**Pages to audit:**
Overview, Daily Summary (Command Center), Leads, Follow-ups, Proposals, Inbox, Next Actions, Chat, Pipeline, Prospect Research, Lead Intake, Proposal Follow-ups, Delivery, Handoffs, Retention, Reminders, Risk, Numbers, Sales, Forecast, Intelligence, Scoreboard, Results, Operator Sco

## Assistant (excerpts)

- Reviewing additional critical pages, then compiling the audit:

---

- Checking a few more pages and components, then compiling the audit:

---

- Compiling the audit report. Checking a few more API endpoints to confirm data scope:

---

- Checking the fetch-metrics file to understand data scope:

---

- ## Dashboard API Audit Report

### Already fixed (per your note)
- Command Center (`/dashboard/command-center`) — `/api/command-center` — Both — Fixed
- Follow-ups (`/dashboard/followups`) — `/api/followups` — Both — Fixed
- Follow-ups Summary (`/api/followups/summary`) — Both — Fixed
- Intake Leads Summary (`/api/intake-leads/summary`) — Intake only — Fixed
- Conversion (`/dashboard/conversion`) — `/api/metrics/conversion` — Both — Fixed
- Sales (`/dashboard/sales`) — `/api/intake-leads/summary`, `/api/proposals/summary` — Intake + Proposals — Fixed

---

### High-traffic / money-path pages



## Composer meta

- Name: Client Engine dashboard audit
- Subtitle: Read fetch-metrics.ts, route.ts, route.ts, route.ts, route.ts

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/client-engine]]
- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/client-engine-money]]
- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]

## Related chats

- [[20260227-client-engine-codebase-audit-for-data-sources-add7c84e|Client-engine codebase audit for data sources]]
- [[20260228-css-style-changes-for-codebase-3c2e9c5b|CSS style changes for codebase]]
- [[20260228-tier-a-api-routes-checklist-14ebfadf|Tier-A API routes checklist]]
- [[20260308-self-improvement-skill-framework-0e0eaab3|Self-improvement skill framework]]
- [[20260221-current-inventory-and-future-pipeline-plans-fb5d2bb0|Current inventory and future pipeline plans]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
