---
chatId: 14ebfadf-100b-481d-b72e-f3cc9f55fc03
workspace: client-engine-1
source: cursor
title: "Tier-A API routes checklist"
updated: 1772250605308
messageCount: 9
archived: false
projects: ["[[PROJECTS/client-engine]]", "[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/client-engine-money]]", "[[THEMES/n8n-ops]]"]
tags: [hive]
---

# Tier-A API routes checklist

**Workspace:** `client-engine-1`  
**Chat ID:** `14ebfadf-100b-481d-b72e-f3cc9f55fc03`  
**Messages:** 9  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-client-engine-1/agent-transcripts/3c2e9c5b-cfd8-4ec5-b0c1-afec043de3e8/subagents/14ebfadf-100b-481d-b72e-f3cc9f55fc03.jsonl`

## What you asked

- In the client-engine-1 repo, list all Tier-A API routes and check each for:
1. Uses withRouteTiming
2. Uses requireAuth (for internal routes)
3. Uses sanitizeErrorMessage in catch blocks for 500
4. Returns NextResponse.json (not raw Response.json)
5. Has route.test.ts with 401, 200, 500 tests

Tier-A APIs:
- Scores: /api/internal/scores/summary, history, latest, compute
- Risk: /api/risk (list), summary, run-rules/[id]
- Next Actions: list, summary, run, [id], execute/[id], template, preferences
- Copilot: coach, action, sessions
- Founder: summary, os/quarter, os/week, suggest
- Growth: deals

## Assistant (excerpts)

- Checking test files for 401, 200, and 500 tests. Reading a few more to understand the pattern:

---

- Compiling the audit table. Checking a few more routes for missing details:

---

- Checking a few more routes for missing details:

---

- Compiling the audit table:

---

- ## Tier-A API Routes Audit

| Route Path | withRouteTiming | requireAuth | sanitize500 | NextResponse | route.test.ts | 401 | 200 | 500 |
|------------|----------------|-------------|-------------|--------------|---------------|-----|-----|-----|
| **Scores** |
| `/api/internal/scores/summary` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/api/internal/scores/history` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/api/internal/scores/latest` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/api/internal/scores/compute` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Risk** |
| `/api/risk` (list) | ✅ | ✅ | N/A* | ✅ | ✅ | ❌ | ✅ | ❌ |


## Composer meta

- Name: Tier-A API routes checklist
- Subtitle: Read route.ts, route.ts, route.ts, route.ts, route.ts

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/client-engine]]
- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/client-engine-money]]
- [[THEMES/n8n-ops]]

## Related chats

- [[20260306-api-route-test-file-analysis-475d559b|API route test file analysis]]
- [[20260227-client-engine-dashboard-audit-586691d6|Client Engine dashboard audit]]
- [[20260306-repo-review-and-architectural-assessment-11a05495|Repo review and architectural assessment]]
- [[20260310-website-building-prompts-for-claude-opus-and-fig-dc690e0c|Website building prompts for Claude Opus and Figma]]
- [[20260227-client-engine-codebase-audit-for-data-sources-add7c84e|Client-engine codebase audit for data sources]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
