# Comprehensive System Health & Logs Query Fix

## Issues Identified

1. **Combined queries not handled**: "Analyze the system health and check recent logs" wasn't triggering both `system.health` AND `logs.tail`
2. **Bias detection false positive**: Ethics council was incorrectly flagging system health queries as high-risk domains
3. **Knowledge base search mentioned**: Response said "we didn't find any results" suggesting KB search instead of tool execution
4. **Web search suggestions**: Still suggesting web-based resources for internal system queries
5. **Tool results not extracted**: Logs results weren't being extracted correctly (ToolResult v2 format)

## Fixes Applied

### Fix 1: Combined Query Enforcement (line 3586-3670)
**Problem**: Queries like "Analyze the system health and check recent logs" only triggered `system.health`, not `logs.tail`.

**Solution**: Added detection for combined queries and enforcement for both tools:
```typescript
const isSystemHealthQuery = /(check system health|system health|health check|test system health|system.*health|analyze.*system.*health)/i.test(userMessage.toLowerCase());
const isLogsQuery = /(check.*logs|recent.*logs|show.*logs|tail.*logs|get.*logs|analyze.*logs)/i.test(userMessage.toLowerCase());
const isCombinedQuery = isSystemHealthQuery && isLogsQuery;

// For combined queries, also add logs.tail
if (isCombinedQuery && !hasLogsTail) {
  plan.plan.push({
    id: `s${plan.plan.length + 1}`,
    title: 'Get recent system logs',
    tool: 'logs.tail',
    args: { window: 300000, level: 'error' },
    dependsOn: [lastStepId],
    success: 'Recent logs retrieved'
  });
}
```

### Fix 2: Bias Detection Fix (ethicsCouncil.ts)
**Problem**: Ethics council was flagging system health queries as high-risk domains (bias sev 4).

**Solution**: Added early return for system queries:
```typescript
// Skip bias detection for system health/debug queries (not high-risk domains)
const isSystemQuery = /(system health|system status|check.*logs|system.*debug|analyze.*system)/i.test(text);
if (isSystemQuery) {
  return { approved: true, issues: [] };
}
```

### Fix 3: Enhanced system_debug Instructions (line 5754-5784)
**Problem**: Summarizer was mentioning knowledge base search and suggesting web resources.

**Solution**: Added explicit instructions:
- DO NOT mention "knowledge base search" or "we didn't find any results in search"
- DO NOT mention "web sources" or "research"
- DO NOT suggest searching online
- DO NOT say "we didn't find any results" - instead explain what the tools returned
- This query uses system.health and logs.tail tools, NOT knowledge base search

### Fix 4: Updated Summarizer Prompt (summarizer.system.system_debug.txt)
**Problem**: The prompt didn't explicitly forbid knowledge base mentions.

**Solution**: Added to CRITICAL RULES:
- DO NOT mention "knowledge base search" or "we didn't find any results in search"
- DO NOT say "we didn't find any results" - instead explain what the tools returned
- DO NOT suggest searching online or using web-based resources
- DO use ONLY the tool results provided - don't invent or guess

### Fix 5: Logs Result Extraction (from previous fix, line 5239-5249)
**Problem**: Logs results weren't being extracted from ToolResult v2 format.

**Solution**: Handle both formats:
```typescript
.map(r => {
  const result = r.result;
  if (result.data && typeof result.data === 'object') {
    return { ...result.data, ok: result.ok };
  }
  return result;
})
```

## Files Modified

1. **apps/scorpion/app/api/chat/stream/route.ts**
   - Line 3586-3670: Combined query enforcement
   - Line 5754-5784: Enhanced system_debug instructions
   - Line 5239-5249: Logs result extraction (from previous fix)

2. **apps/scorpion/server/council/ethicsCouncil.ts**
   - Line 23-27: Skip bias detection for system queries

3. **apps/scorpion/lib/prompts/summarizer.system.system_debug.txt**
   - Line 51-63: Enhanced critical rules

## Expected Behavior After Fix

### For "Analyze the system health and check recent logs":

✅ **Plan Generation**:
- Plan includes `system.health` tool
- Plan includes `stats.get` tool  
- Plan includes `logs.tail` tool (for combined queries)

✅ **Tool Execution**:
- All three tools execute
- Results are extracted correctly (handles ToolResult v2 format)

✅ **Response**:
- Uses actual tool results (status, uptime, services, logs)
- No mention of "knowledge base search"
- No mention of "we didn't find any results"
- No web search suggestions
- No bias warnings for system queries
- Clear explanation if tools fail

✅ **Bias Detection**:
- System health queries are NOT flagged as high-risk domains
- No false positive bias warnings

## Testing Checklist

- [ ] Combined query (health + logs) → Both tools execute
- [ ] System health query → No bias detection warning
- [ ] Response doesn't mention knowledge base search
- [ ] Response doesn't suggest web search
- [ ] Response uses actual tool results
- [ ] Response explains failures clearly (no hallucination)
- [ ] Logs are extracted correctly from ToolResult v2 format

## Related Issues Fixed

- ✅ SYSTEM_HEALTH_FIX.md - Tool result extraction
- ✅ SYSTEM_HEALTH_LOGS_FIX.md - Logs extraction and anti-hallucination
- ✅ This fix - Combined queries, bias detection, KB search mentions

