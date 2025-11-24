# System Health & Logs Query Response Fix

## Issue
When users asked "Analyze the system health and check recent logs", the system:
1. Returned incorrect status like "System Health is currently Urgent" (hallucinated)
2. Said "no recent log entries available in the knowledge base results" (wrong source)
3. Suggested web search instead of using tool results
4. Didn't use actual tool execution results

## Root Causes

### 1. Tool Result Extraction Not Handling ToolResult v2 Format
Both `system.health` and `logs.tail` tools return data in ToolResult v2 format:
- ToolResult v2: `{ ok: true, data: { status, uptime, logs, ... } }`
- Legacy format: `{ ok: true, status, uptime, logs, ... }`

The extraction code was only looking at the top level, missing the `data` field.

### 2. Summarizer Hallucinating When No Results
When tools failed or returned no data, the summarizer was inventing status values like "Urgent" instead of reporting the actual failure.

### 3. Missing Instructions for system_debug Queries
The summarizer wasn't getting clear instructions to:
- Use ONLY actual tool results
- Not invent status values
- Not suggest web search for internal system queries

## Fixes Applied

### Fix 1: Logs Result Extraction (line 5239-5249)
```typescript
// Before: Only extracted top-level result
.map(r => r.result)

// After: Handles both ToolResult v2 and legacy formats
.map(r => {
  const result = r.result;
  if (result.data && typeof result.data === 'object') {
    // ToolResult v2 format: extract data
    return { ...result.data, ok: result.ok };
  }
  // Legacy format or direct format: use result as-is
  return result;
})
```

### Fix 2: Logs Context Building (line 5400-5424)
```typescript
// Before: Assumed logs at top level
if (result.logs && result.logs.length > 0) {

// After: Handles both nested and flat formats
const logs = result.logs || result.data?.logs || [];
if (Array.isArray(logs) && logs.length > 0) {
  // Process logs...
} else {
  summaryContext += `No log entries found.\n`;
}
```

### Fix 3: Enhanced system_debug Instructions (line 5706-5731)
Added explicit instructions to prevent hallucination:
- ✅ Check if tool results are available
- ✅ If no results: Explain the failure, don't invent status
- ✅ If results available: Use EXACT values from tools
- ✅ Explicitly forbid inventing status values like "Urgent"
- ✅ Explicitly forbid suggesting web search

### Fix 4: Better Error Handling for Missing Logs
Added fallback message when logs are requested but not found:
```typescript
} else if (intent === 'system_debug' && userMessage.toLowerCase().includes('log')) {
  summaryContext += `\n⚠️ Logs query detected but no logs.tail tool results found...\n\n`;
}
```

## Files Modified
- `apps/scorpion/app/api/chat/stream/route.ts`
  - Line 5239-5249: Fixed logs result extraction
  - Line 5400-5424: Fixed logs context building
  - Line 5706-5731: Enhanced system_debug instructions
  - Line 5421-5424: Added missing logs detection

## Expected Behavior After Fix

### When Tools Succeed:
- ✅ Actual system status from tool results (e.g., "healthy", not "Urgent")
- ✅ Real uptime values (e.g., "2h 15m")
- ✅ Actual service names (e.g., "api, database, ollama, n8n")
- ✅ Real log entries with timestamps and levels
- ✅ No suggestions to search online

### When Tools Fail:
- ✅ Clear explanation that tools didn't return data
- ✅ Possible reasons for failure (API unavailable, execution error, etc.)
- ✅ No invented status values
- ✅ No suggestions to search online

## Related Components
- `lib/chat/tools/system-health.ts` - System health tool
- `lib/chat/tools/logs.ts` - Logs tool
- `lib/prompts/summarizer.system.system_debug.txt` - Summarizer prompt
- `lib/chat/summarizer-config.ts` - Prompt selection logic

## Testing Checklist
- [ ] System health query with successful tools → Shows actual status
- [ ] System health query with failed tools → Explains failure, no hallucination
- [ ] Logs query with successful tool → Shows actual log entries
- [ ] Logs query with failed tool → Explains failure, no hallucination
- [ ] Combined query (health + logs) → Uses both tool results correctly
- [ ] No web search suggestions for system_debug queries

