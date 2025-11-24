# Testing Progress - Various Request Types

## Test Plan
Testing the chat system with various request types to verify all functionality works correctly.

## Test Requests

### 1. Research Request
**Request**: "Research the latest Bitcoin + global macro news. Give top 3 with links."
**Expected**: Plan, Tools
**Status**: In progress

### 2. Workflows Request
**Request**: "Explain my ElevenLabs workflow on n8ncloud.tech and how audio flows through it."
**Expected**: Plan, Tools
**Status**: Pending

### 3. Files → RAG Request
**Request**: "Pull my last uploaded file and add it to RAG; then show its title and storage path."
**Expected**: Knowledge, Tools
**Status**: Pending

### 4. Ontology / KB Request
**Request**: "List all my side-hustles and group them by theme (use KB + ontology)."
**Expected**: Knowledge, Plan
**Status**: Pending

### 5. Health Request
**Request**: "How healthy is the system right now? List services up/down + warnings."
**Expected**: Tools
**Status**: Pending

### 6. Ops Request
**Request**: "Show the most recent operations with status, startedAt, endedAt."
**Expected**: Tools
**Status**: Pending

### 7. Code Skim Request
**Request**: "Skim the orchestrator route and summarize the 4-phase pipeline."
**Expected**: Plan, Tools
**Status**: Pending

### 8. Logs Request
**Request**: "Check recent API logs; give top 3 errors/timeouts and likely causes."
**Expected**: Tools
**Status**: Pending

### 9. Agents Request
**Request**: "List my agents and inspect one in detail (capabilities, config)."
**Expected**: Tools
**Status**: Pending

### 10. Notify Request
**Request**: "Post a notification that diagnostics ran; then show last 3 notifications."
**Expected**: Tools
**Status**: Pending

## Issues Encountered

### Tool-Router JSON Parsing Errors
**Problem**: Tool-router is failing to extract valid JSON from LLM responses
**Symptoms**:
- `[Prompt tool-router] Error (XXXXms): Failed to extract valid JSON from: ...`
- `[Metrics] Error: Failed to extract valid JSON from: ...`
- Tool-router taking 30-50 seconds per attempt

**Impact**: 
- Delays in request processing
- Potential timeouts if tool-router is called during planning

**Status**: Monitoring - This appears to be an LLM response quality issue, not a code bug

## Next Steps

1. Continue testing each request type
2. Monitor for errors and fix as encountered
3. Document any issues found
4. Verify all expected outputs (Plan, Tools, Knowledge) are generated correctly

