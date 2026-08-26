---
chatId: c257780c-12c5-4203-8ea6-7196be3e6852
workspace: client-engine-1
source: cursor
title: "Playwright leads pipeline testing"
updated: 1772222966193
messageCount: 5
archived: false
projects: ["[[PROJECTS/client-engine]]", "[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/client-engine-money]]", "[[THEMES/n8n-ops]]"]
tags: [hive]
---

# Playwright leads pipeline testing

**Workspace:** `client-engine-1`  
**Chat ID:** `c257780c-12c5-4203-8ea6-7196be3e6852`  
**Messages:** 5  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-client-engine-1/agent-transcripts/3c2e9c5b-cfd8-4ec5-b0c1-afec043de3e8/subagents/c257780c-12c5-4203-8ea6-7196be3e6852.jsonl`

## What you asked

- Use Playwright to:
1. Navigate to http://localhost:3000/dashboard/leads
2. Log in if the page redirects to /login (use E2E_EMAIL and E2E_PASSWORD from .env, or project's test creds)
3. Wait for the Leads page to load
4. Click the "Run pipeline" button (orange button with lightning bolt, text like "Run pipeline (N)")
5. Wait 90 seconds for the pipeline to complete (it processes up to 10 leads with 4 LLM steps each)
6. Check for the success alert: either "Pipeline ran for X lead(s)." or "Processed leads but none could run..."
7. Verify that leads in the table show SCORED status (green/orange bad

## Assistant (excerpts)

- Checking the auth helper and how the Run pipeline button behaves:

---

- Checking whether the dev server is running and loading `.env` for credentials:

---

- Updating the spec to accept both success messages, set a 90s pipeline timeout, and run the test.

---

- Running the Playwright test:

## Composer meta

- Name: Playwright leads pipeline testing
- Subtitle:

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/client-engine]]
- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/client-engine-money]]
- [[THEMES/n8n-ops]]

## Related chats

- [[20260227-playwright-e2e-test-for-leads-page-d76dd68c|Playwright E2E test for leads page]]
- [[20260227-cursor-ide-browser-mcp-lead-pipeline-execution-3654c269|Cursor IDE browser MCP lead pipeline execution]]
- [[20260221-current-inventory-and-future-pipeline-plans-fb5d2bb0|Current inventory and future pipeline plans]]
- [[20260221-quiet-proof-engine-implementation-4e9afda5|Quiet proof engine implementation]]
- [[20260222-private-freelancer-operator-app-upgrade-d25e4fff|Private freelancer operator app upgrade]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
