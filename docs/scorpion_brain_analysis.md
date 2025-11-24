# Scorpion Brain Analysis

## Knowledge Base (KB) / RAG Pipeline Analysis

### KB Call Locations

1. **Early KB Search (for casual questions)** - `apps/scorpion/app/api/chat/stream/route.ts:2091-2216`
   - Executes KB search BEFORE council deliberation for "casual" questions
   - Checks if plan has `kb.search` step
   - Calls `executeTool('kb.search', kbSearchStep.args || {})`
   - Stores results in `knowledgeHitsForCouncil` array

2. **Executor Phase KB Search** - `apps/scorpion/app/api/chat/stream/route.ts:2312-2390`
   - Executes KB search during plan execution phase
   - Skips if already executed early (for casual questions)
   - Calls `executeTool(step.tool, step.args || {})` for each plan step

3. **Legacy RAG Route** - `apps/scorpion/app/api/chat/route.ts:40-54`
   - Uses `getRAGStore().search(message, 5)` 
   - Injects context into prompt
   - This route is separate from the main stream route

### KB Disclaimer Note Location

**Location:** `apps/scorpion/app/api/chat/stream/route.ts:3262-3264`

```typescript
if (isCasual && !hasResults && !finalSummary.toLowerCase().includes('not found') && !finalSummary.toLowerCase().includes('no information')) {
  // If no results but summary doesn't acknowledge it, append a note
  finalSummary = finalSummary + '\n\n*Note: No specific information was found in the knowledge base. The answer above is based on general knowledge.';
}
```

**Problem:** This disclaimer is added for ALL casual questions, even when KB was never called (like greetings).

### Plan Step Status Tracking

**Current State:**
- Plan steps are marked as `running` when execution starts
- Plan steps are marked as `completed` when tool execution finishes
- However, for `small_talk` with tool: 'none', steps remain `pending`

**Issue:** Steps with `tool: 'none'` are never marked as completed, even though the response has been generated.

### Intent-Based KB Usage

**Current Behavior:**
- KB is called for "casual" questions (determined by `questionType()` function)
- KB is NOT gated by intent classification
- KB disclaimer is added based on `isCasual` flag, not intent

**Required Behavior:**
- KB should only be called for `project_help` or `system_debug` intents
- KB disclaimer should only appear when:
  - KB was actually attempted (`knowledge.attempted === true`)
  - KB has no results (`knowledge.hasResults === false`)
  - Intent allows KB (`project_help` or `system_debug`)
