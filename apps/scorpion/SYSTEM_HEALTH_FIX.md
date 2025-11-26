# System Health Query Response Fix

## Issue
When users asked "Analyze the system health and check recent logs", the system returned generic placeholder text like "[X] hours and [Y] minutes" instead of actual system health data.

## Root Cause
The tool result extraction code wasn't handling the ToolResult v2 format correctly. The `system.health` tool returns data in a nested structure:
- ToolResult v2: `{ ok: true, data: { status, uptime, services, ... } }`
- Legacy format: `{ ok: true, status, uptime, services, ... }`

The extraction code was only looking at the top level, missing the `data` field.

## Fix Applied

### 1. Fixed Result Extraction (line 5221-5231)
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

### 2. Fixed Context Building (line 5361)
```typescript
// Before: Assumed data at top level
summaryContext += `Status: ${result.status || 'unknown'}\n`;

// After: Handles both nested and flat formats
const health = result.data || result;
summaryContext += `Status: ${health.status || 'unknown'}\n`;
```

## Files Modified
- `apps/scorpion/app/api/chat/stream/route.ts`
  - Line 5221-5231: Fixed result extraction
  - Line 5360-5386: Fixed context building for system health results

## Testing
The fix ensures that:
1. ✅ Tool results are correctly extracted regardless of format (v2 or legacy)
2. ✅ System health data (status, uptime, services, agents, workflows, alerts) is properly passed to the summarizer
3. ✅ The summarizer receives actual values instead of placeholders

## Expected Behavior After Fix
When users ask "Analyze the system health", the response should now include:
- Actual uptime (e.g., "2h 15m" instead of "[X]h [Y]m")
- Real service status (e.g., "api, database, ollama, n8n" instead of "[list]")
- Actual agent/workflow counts
- Real alerts if any exist

## Related Components
- `lib/chat/tools/system-health.ts` - Tool implementation
- `lib/prompts/summarizer.system.system_debug.txt` - Summarizer prompt
- `lib/chat/summarizer-config.ts` - Prompt selection logic

