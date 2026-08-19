---
chatId: 3654c269-9ac9-4249-bb91-84c9efd7c220
workspace: client-engine-1
source: cursor
title: "Cursor IDE browser MCP lead pipeline execution"
updated: 1772223131853
messageCount: 12
archived: false
projects: ["[[PROJECTS/client-engine]]", "[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/client-engine-money]]", "[[THEMES/n8n-ops]]"]
tags: [hive]
---

# Cursor IDE browser MCP lead pipeline execution

**Workspace:** `client-engine-1`  
**Chat ID:** `3654c269-9ac9-4249-bb91-84c9efd7c220`  
**Messages:** 12  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-client-engine-1/agent-transcripts/3c2e9c5b-cfd8-4ec5-b0c1-afec043de3e8/subagents/3654c269-9ac9-4249-bb91-84c9efd7c220.jsonl`

## What you asked

- Using the cursor-ide-browser MCP (NOT Playwright), perform:

1. Navigate to http://localhost:3000/dashboard/leads
2. Take browser_snapshot to get element refs
3. Click the "Run pipeline" button using browser_click with the correct element ref from the snapshot
4. Wait 60 seconds using browser_wait_for
5. Take browser_snapshot again to verify leads show SCORED status
6. Unlock the browser

The browser is already at the Leads page with viewId 71f88c and is locked. You need to get the snapshot which should return an accessibility tree with refs for each element. The Run pipeline button text is "R

## Assistant (excerpts)

- Found the "Run pipeline (24)" button — ref: e7. Clicking it, waiting 60 seconds, then verifying SCORED status.

---

- Clicked the button; it's disabled and the pipeline is running. Waiting 60 seconds.

---

- Taking a post-wait snapshot to verify leads show SCORED status:

---

- Unlocking the browser.

---

- ## Result

**Status:** Success

**Steps completed:**
1. Snapshot taken (page already on `http://localhost:3000/dashboard/leads`, viewId `71f88c`)
2. Located "Run pipeline (24)" button (ref: `e7`) and clicked it
3. Waited 60 seconds
4. Took a second snapshot
5. Unlocked the browser

**Leads SCORED:** Yes. In the post-run snapshot, the leads table shows all visible rows with SCORED status and numeric scores (e.g. 70, 65, 60).

Note: The "Run pipeline (24)" button stayed disabled after 60 seconds, so the bulk run may still be processing for some leads. The visible portion of the table shows leads

## Composer meta

- Name: Cursor IDE browser MCP lead pipeline execution
- Subtitle: Read leads-table.tsx, browser_search.json, browser_unlock.json, browser_wait_for.json, browser_click.json

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/client-engine]]
- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/client-engine-money]]
- [[THEMES/n8n-ops]]

## Related chats

- [[20260227-playwright-leads-pipeline-testing-c257780c|Playwright leads pipeline testing]]
- [[20260227-playwright-e2e-test-for-leads-page-d76dd68c|Playwright E2E test for leads page]]
- [[20260221-current-inventory-and-future-pipeline-plans-fb5d2bb0|Current inventory and future pipeline plans]]
- [[20260228-css-style-changes-for-codebase-3c2e9c5b|CSS style changes for codebase]]
- [[20260310-website-building-prompts-for-claude-opus-and-fig-dc690e0c|Website building prompts for Claude Opus and Figma]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
