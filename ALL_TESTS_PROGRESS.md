# All 10 Chat Tests - Progress Tracking

## Test 1: Research ⏳ IN PROGRESS
**Query:** "Research the latest Bitcoin + global macro news. Give top 3 with links."
**Expected Panels:** Plan, Tools
**Expected Tools:** `research.run`
**Status:** ⏳ Testing now

### Fixes Applied:
1. ✅ Tool selection enforcement (forces research.run, removes code.readFile)
2. ✅ Tool handler polls for completion and returns actual results
3. ✅ Result formatting displays top 3 with links

### Current Status:
- Query submitted
- Waiting for research to complete (can take up to 2 minutes)
- Will verify:
  - Plan uses research.run ✅
  - Tools panel shows research.run completed
  - Results show top 3 with links

---

## Test 2: Workflows ⏳ PENDING
**Query:** "Explain my ElevenLabs workflow on n8ncloud.tech and how audio flows through it."
**Expected Panels:** Plan, Tools
**Expected Tools:** `workflows.list`, `workflows.get`

---

## Test 3: Files → RAG ⏳ PENDING
**Query:** "Pull my last uploaded file and add it to RAG; then show its title and storage path."
**Expected Panels:** Knowledge, Tools
**Expected Tools:** `files.recent`, `knowledge.get` or `ocr.extract`

---

## Test 4: Ontology / KB ⏳ PENDING
**Query:** "List all my side-hustles and group them by theme (use KB + ontology)."
**Expected Panels:** Knowledge, Plan
**Expected Tools:** `ontology.search`, `kb.search`

---

## Test 5: Health ⏳ PENDING
**Query:** "How healthy is the system right now? List services up/down + warnings."
**Expected Panels:** Tools
**Expected Tools:** `system.health`, `project.status`, `stats.get`

---

## Test 6: Ops ⏳ PENDING
**Query:** "Show the most recent operations with status, startedAt, endedAt."
**Expected Panels:** Tools
**Expected Tools:** `operations.list`

---

## Test 7: Code skim ⏳ PENDING
**Query:** "Skim the orchestrator route and summarize the 4-phase pipeline."
**Expected Panels:** Plan, Tools
**Expected Tools:** `code.readFile`

---

## Test 8: Logs ⏳ PENDING
**Query:** "Check recent API logs; give top 3 errors/timeouts and likely causes."
**Expected Panels:** Tools
**Expected Tools:** `logs.tail`

---

## Test 9: Agents ⏳ PENDING
**Query:** "List my agents and inspect one in detail (capabilities, config)."
**Expected Panels:** Tools
**Expected Tools:** `agents.list`, `agents.get`

---

## Test 10: Notify ⏳ PENDING
**Query:** "Post a notification that diagnostics ran; then show last 3 notifications."
**Expected Panels:** Tools
**Expected Tools:** `notifications.post`, `notifications.list`

---

## Summary
- **Completed:** 0/10
- **In Progress:** 1/10 (Test 1)
- **Pending:** 9/10

