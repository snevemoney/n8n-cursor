# Intent Classification and Tool Gating Fixes

## Issues Found

### 1. Research Queries Not Classified Correctly
**Problem:** "Research the latest Bitcoin + global macro news" was classified as `general_question`, which didn't allow research tools.

**Fix:** Added research patterns to intent classification that match research queries and classify them as `project_help` (which allows `research.run`).

### 2. Tool Availability Mismatch
**Problem:** 
- `getToolsForIntent('general_question')` returned `[]` (no tools)
- But the planner prompt said "Use general-purpose tools only (kb.search, research.run)"
- This contradiction caused confusion

**Fix:** Updated `getToolsForIntent('general_question')` to return `['kb.search', 'research.run', 'research.start']` to match the prompt guidance.

### 3. Wrong Tools Being Used
**Problem:** For research queries, the planner was using `code.readFile` and `project.analyze` instead of `research.run`.

**Root Cause:** 
- Intent was wrong (`general_question` instead of `project_help`)
- Even with wrong intent, tools weren't being filtered correctly

**Fix:** 
- Research queries now correctly classified as `project_help`
- Tool enforcement at line 2219 should now properly filter disallowed tools
- Updated prompt guidance to be clearer about which tools to use

## Changes Made

### 1. `apps/scorpion/lib/chat/intent.ts`
- ✅ Added research patterns before operational patterns
- ✅ Updated `getToolsForIntent('general_question')` to allow research/KB tools
- ✅ Updated prompt guidance text

### 2. `apps/scorpion/app/api/chat/stream/route.ts`
- ✅ Updated tool usage guidance to match actual tool availability
- ✅ Added clearer instructions for research vs project queries

### 3. `apps/scorpion/tests/integration/intent-gating.test.ts`
- ✅ Updated test expectations to match new behavior

## Expected Behavior After Fixes

### Research Queries (e.g., "Research Bitcoin news")
- **Intent:** `project_help` (via research patterns)
- **Available Tools:** All tools including `research.run`
- **Expected Plan:** Should use `research.run` tool
- **Council:** Should deliberate if technical/complex

### General Questions (e.g., "What is X?")
- **Intent:** `general_question`
- **Available Tools:** `kb.search`, `research.run`, `research.start` only
- **Expected Plan:** Should use research/KB tools, NOT project tools
- **Council:** May skip for casual questions

### Workflow Questions (e.g., "Explain ElevenLabs workflow")
- **Intent:** `project_help` (matches "workflow" pattern)
- **Available Tools:** All tools including `workflows.list`, `workflows.get`
- **Expected Plan:** Should use workflow tools
- **Council:** Should deliberate if technical

## Testing Recommendations

1. **Test Research Query:**
   - Query: "Research the latest Bitcoin + global macro news. Give top 3 with links."
   - Expected: Uses `research.run` tool, NOT `code.readFile` or `project.analyze`

2. **Test Workflow Query:**
   - Query: "Explain my ElevenLabs workflow on n8ncloud.tech"
   - Expected: Uses `workflows.list` or `workflows.get`, NOT generic tools

3. **Test General Question:**
   - Query: "What is machine learning?"
   - Expected: Uses `research.run` or `kb.search`, NOT project tools

4. **Verify Council Behavior:**
   - Research queries: Council should deliberate appropriately
   - Casual questions: Council may skip or approve quickly
   - Technical questions: Council should provide detailed review

## Next Steps

1. Test the fixes with actual queries
2. Monitor tool usage in plans
3. Verify council behavior makes sense
4. Check that knowledge base is used appropriately
5. Ensure panels open correctly (Plan, Tools, Knowledge, Council)

