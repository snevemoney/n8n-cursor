---
chatId: 475d559b-5e03-4890-8d22-5879b0ca6698
workspace: client-engine-1
source: cursor
title: "API route test file analysis"
updated: 1772776895073
messageCount: 4
archived: false
projects: ["[[PROJECTS/client-engine]]", "[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/client-engine-money]]", "[[THEMES/n8n-ops]]"]
tags: [hive]
---

# API route test file analysis

**Workspace:** `client-engine-1`  
**Chat ID:** `475d559b-5e03-4890-8d22-5879b0ca6698`  
**Messages:** 4  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-client-engine-1/agent-transcripts/11a05495-91b3-4b9b-a729-bed444412c88/subagents/475d559b-5e03-4890-8d22-5879b0ca6698.jsonl`

## What you asked

- Find all route test files in the Client Engine codebase that test Tier-A API routes. I need to know:

1. Which test files exist for these routes (look in tests/ and src/ for *.test.ts or *.spec.ts files related to these):
   - Scores: /api/internal/scores/*
   - Risk: /api/risk/*
   - Next Actions: /api/next-actions/*
   - Copilot: /api/internal/copilot/*
   - Founder: /api/internal/founder/*
   - Growth: /api/internal/growth/*

2. For each existing test file, tell me:
   - Does it test 401 (unauthorized)?
   - Does it test 500 (sanitized error)?
   - Does it test 200 shape?

3. Which routes a

## Assistant (excerpts)

- Reading Tier-A route test files to verify 401, 500, and 200-shape coverage:

---

- Checking for tests for `next-actions/[id]/route.test.ts` and `next-actions/run/route.test.ts` 401 coverage:

---

- Here’s the gap analysis:

---

## Tier-A Route Test Gap Analysis

### 1. Test Files That Exist (by domain)

| Domain | Route | Test File | 401 | 500 | 200 Shape |
|--------|-------|-----------|-----|-----|-----------|
| **Scores** | summary | `internal/scores/summary/route.test.ts` | No | No | Yes (DB shape only, not route) |
| | history | `internal/scores/history/route.test.ts` | No | No | Yes (DB shape only) |
| | latest | `internal/scores/latest/route.test.ts` | Yes | No | Yes |
| | compute | `internal/scores/compute/route.test.ts` | No | No | Yes (lib only) |
| | compute | `internal/scores

## Composer meta

- Name: API route test file analysis
- Subtitle: Read PHASE_8_0_APP_AUDIT_MATRIX.md, risk-nba.spec.ts, founder-mode.spec.ts, growth.spec.ts, coach-mode.spec.ts

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/client-engine]]
- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/client-engine-money]]
- [[THEMES/n8n-ops]]

## Related chats

- [[20260228-tier-a-api-routes-checklist-14ebfadf|Tier-A API routes checklist]]
- [[20260306-repo-review-and-architectural-assessment-11a05495|Repo review and architectural assessment]]
- [[20260306-bounded-contexts-mapping-for-client-engine-4949db43|Bounded contexts mapping for Client Engine]]
- [[20260310-website-building-prompts-for-claude-opus-and-fig-dc690e0c|Website building prompts for Claude Opus and Figma]]
- [[20260308-self-improvement-skill-framework-0e0eaab3|Self-improvement skill framework]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
