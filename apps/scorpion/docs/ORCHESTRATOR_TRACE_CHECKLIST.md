# Orchestrator Flow Trace Checklist

**Purpose:** Step-by-step verification guide for testing the full Scorpion orchestrator flow

**Last Updated:** 2025-01-27

## Overview

This checklist helps verify that the orchestrator flow works correctly after TypeScript refactoring. Each phase should fire in order and produce observable events.

## Test Scenarios

### Scenario 1: Research + Council + RAG Flow
**Query:** "Research the latest Bitcoin news and analyze the market trends"

**Expected Flow:**
1. Intent Detection → `general_question` or `project_help`
2. PLAN Phase → Research tools selected
3. COUNCIL Phase → Plan reviewed and approved
4. TOOLS Phase → `research.run` executed
5. KNOWLEDGE Phase → RAG retrieval (if enabled)
6. Answer Generation → Summary with sources

### Scenario 2: Codebase Analysis Flow
**Query:** "Scan my repo and tell me how the planner → tools → council flow works"

**Expected Flow:**
1. Intent Detection → `project_help`
2. PLAN Phase → `project.analyze` and `code.readFile` tools selected
3. COUNCIL Phase → Plan reviewed
4. TOOLS Phase → Code analysis executed
5. KNOWLEDGE Phase → RAG search for relevant code
6. Answer Generation → Explanation of flow

### Scenario 3: Simple Question Flow
**Query:** "What is the weather today?"

**Expected Flow:**
1. Intent Detection → `small_talk` or `general_question`
2. PLAN Phase → Minimal plan (may skip tools)
3. COUNCIL Phase → Quick approval
4. Answer Generation → Direct response

## Phase-by-Phase Verification

### Phase 0: Intent Detection

**Check in Browser Console:**
```javascript
// Look for logs like:
[Chat Stream] Intent detected: project_help
[Chat Stream] Intent: project_help - Tool router enabled: true
```

**Check in Network Tab:**
- Request to `/api/chat/stream` should include `intent` in request body or headers

**Expected Events (SSE):**
- `intent` event with detected intent type

**✅ Pass Criteria:**
- [ ] Intent is detected and logged
- [ ] Intent type matches query type (codebase → project_help, research → general_question)
- [ ] Intent event sent via SSE

---

### Phase 1: PLAN Phase

**Check in Browser Console:**
```javascript
// Look for logs like:
[Chat Stream] PLAN phase: Generating plan...
[Chat Stream] Expert routing: Selected 2 expert(s) based on phase=PLAN
[Chat Stream] Plan generated: { objective: "...", plan: [...] }
```

**Check in Network Tab:**
- SSE events with type `plan` or `plan_step`

**Expected Events (SSE):**
- `plan` event with full plan object
- `plan_step` events for each step
- `expert_routing` event showing selected experts

**Check Plan Structure:**
```typescript
{
  objective: string;  // Main goal
  plan: Array<{
    id: string;       // Required: step ID
    title: string;    // Required: step title
    tool: string;     // Required: tool name
    args?: Record<string, any>;  // Tool arguments
    dependsOn?: string[];  // Step dependencies
  }>;
  intent?: ScorpionIntent;
}
```

**✅ Pass Criteria:**
- [ ] Plan is generated with at least one step
- [ ] All plan steps have `id`, `title`, and `tool` fields
- [ ] Expert routing is logged (if MoE enabled)
- [ ] Plan events sent via SSE
- [ ] Plan appears in UI (Plan panel)

---

### Phase 2: COUNCIL Phase

**Check in Browser Console:**
```javascript
// Look for logs like:
[Chat Stream] COUNCIL phase: Running council deliberation...
[Chat Stream] Expert routing: Selected 3 expert(s) based on phase=COUNCIL
[Chat Stream] Council result: { approved: true, votes: [...], summary: "..." }
```

**Check in Network Tab:**
- SSE events with type `council_vote`, `council_thinking`, `council_consensus`

**Expected Events (SSE):**
- `council_vote` events for each council member
- `council_thinking` events showing reasoning
- `council_consensus` event with final decision
- `expert_routing` event showing council experts

**Check Council Result Structure:**
```typescript
{
  approved: boolean;
  score?: number;
  summary?: string;
  votes?: Array<{
    agent: string;
    vote: 'approve' | 'revise' | 'reject';
    note: string;
  }>;
  allIssues?: Array<{
    severity: number;
    tag: string;
    message: string;
  }>;
}
```

**✅ Pass Criteria:**
- [ ] Council deliberation runs
- [ ] At least one council vote is logged
- [ ] Council result has `approved` boolean
- [ ] Council events sent via SSE
- [ ] Council panel shows votes in UI

---

### Phase 3: TOOLS Phase

**Check in Browser Console:**
```javascript
// Look for logs like:
[Chat Stream] TOOLS phase: Executing tool: research.run
[Chat Stream] Tool execution result: { ok: true, data: {...} }
[Chat Stream] Tool: research.run completed successfully
```

**Check in Network Tab:**
- SSE events with type `tool_call`, `tool_result`, `tool_progress`

**Expected Events (SSE):**
- `tool_call` event when tool starts
- `tool_progress` events during execution
- `tool_result` event with execution result

**Check Tool Execution:**
- Tools should only execute if `councilResult.approved === true`
- Each tool should have bounded retries (Power of 10 compliance)
- Tool results should be properly formatted

**✅ Pass Criteria:**
- [ ] Tools execute only after council approval
- [ ] Tool calls are logged
- [ ] Tool results are received
- [ ] Tool events sent via SSE
- [ ] Tool panel shows execution in UI

---

### Phase 4: KNOWLEDGE Phase

**Check in Browser Console:**
```javascript
// Look for logs like:
[Chat Stream] KNOWLEDGE phase: Searching RAG store...
[Chat Stream] RAG search: Found 5 results for query "..."
[Chat Stream] Knowledge hits: [{ id: "...", snippet: "...", source: "..." }]
```

**Check in Network Tab:**
- SSE events with type `knowledge_search`, `knowledge_hit`

**Expected Events (SSE):**
- `knowledge_search` event with query
- `knowledge_hit` events for each result

**Check RAG Integration:**
- RAG search should only run if `SCORPION_ENABLE_RAG_RETRIEVER !== '0'`
- Knowledge hits should have `id`, `snippet`, and `source` fields
- RAG results should be passed to council if available

**✅ Pass Criteria:**
- [ ] RAG search runs (if enabled)
- [ ] Knowledge hits are retrieved
- [ ] Knowledge events sent via SSE
- [ ] Knowledge panel shows results in UI

---

### Phase 5: Answer Generation

**Check in Browser Console:**
```javascript
// Look for logs like:
[Chat Stream] Generating final answer...
[Chat Stream] Answer generated successfully
```

**Check in Network Tab:**
- SSE events with type `content`, `done`

**Expected Events (SSE):**
- `content` events with streaming text
- `done` event when complete
- `protocol` event with full ScorpionAgentProtocol JSON

**Check Answer Quality:**
- Answer should reference tools used
- Answer should cite knowledge sources if RAG was used
- Answer should acknowledge council feedback if plan was revised

**✅ Pass Criteria:**
- [ ] Answer is generated and streamed
- [ ] Answer appears in chat UI
- [ ] Protocol JSON is sent
- [ ] Answer references tools/knowledge used

---

## Protocol Verification

### ScorpionAgentProtocol Structure

**Check in Browser Console (Network Tab → Response):**
```javascript
// Look for SSE event:
event: protocol
data: {
  meta: { timestamp: "...", version: "..." },
  intent: "project_help",
  plan: { objective: "...", plan: [...] },
  council: { approved: true, votes: [...] },
  tools: { selected: [...], calls: [...] },
  knowledge: { query: "...", hits: [...] },
  observability: { phases: [...], events: [...] },
  brain_map: { nodes: [...], edges: [...] }
}
```

**✅ Pass Criteria:**
- [ ] Protocol event is sent
- [ ] Protocol includes all phases
- [ ] Protocol includes expert routing data
- [ ] Protocol is valid JSON

---

## Error Handling Verification

### Test Error Scenarios

1. **Invalid Tool Call:**
   - Query: "Use a tool that doesn't exist"
   - Expected: Error logged, fallback behavior

2. **RAG Failure:**
   - Disable RAG: `SCORPION_ENABLE_RAG_RETRIEVER=0`
   - Expected: Flow continues without RAG

3. **Council Rejection:**
   - Query that triggers council rejection
   - Expected: Plan revision or rejection message

**✅ Pass Criteria:**
- [ ] Errors are caught and logged
- [ ] Errors don't crash the route
- [ ] User receives error message
- [ ] System recovers gracefully

---

## Power of 10 Compliance Checks

### Bounded Loops
- [ ] All loops iterate over fixed arrays (no infinite loops)
- [ ] Retry logic has `MAX_RETRIES` constant

### No Recursion
- [ ] No recursive function calls
- [ ] All functions are iterative

### Small Functions
- [ ] Functions are ≤ 60 lines
- [ ] Complex logic is broken into helpers

### Type Guards
- [ ] All `possibly undefined` values are guarded
- [ ] Array access uses optional chaining or bounds checks

### Explicit Error Handling
- [ ] All async operations have try/catch
- [ ] Error messages are descriptive

---

## Quick Test Commands

### Test Research Flow
```bash
# In browser console or via API:
POST /api/chat/stream
{
  "message": "Research the latest Bitcoin news",
  "conversationId": "test-123"
}
```

### Test Codebase Flow
```bash
POST /api/chat/stream
{
  "message": "Scan my repo and explain the planner flow",
  "conversationId": "test-456"
}
```

### Monitor Logs
```bash
# In terminal running the app:
tail -f logs/scorpion.log | grep -E "(PLAN|COUNCIL|TOOLS|KNOWLEDGE)"
```

---

## Success Criteria Summary

**Full Flow Test Passes If:**
- ✅ All 5 phases execute in order
- ✅ SSE events are sent for each phase
- ✅ UI panels update correctly
- ✅ No TypeScript errors in console
- ✅ No runtime errors in logs
- ✅ Protocol JSON is valid
- ✅ Answer is generated and displayed

**If Any Phase Fails:**
1. Check browser console for errors
2. Check network tab for failed requests
3. Check server logs for stack traces
4. Verify environment variables are set correctly
5. Check that required services (Ollama, RAG store) are running

---

## Next Steps After Verification

1. **If All Tests Pass:** Proceed to fix core package errors
2. **If Tests Fail:** Document failure points and fix before proceeding
3. **If Partial Success:** Identify which phases work and which need fixes


