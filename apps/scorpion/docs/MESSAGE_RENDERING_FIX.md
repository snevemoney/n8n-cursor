# Message Rendering Fix - Root Cause Analysis

## Problem
Messages weren't rendering because the stream was failing before reaching the summarizer/delta phase.

## Root Causes Identified

### 1. Planner Timeout Closing Stream
- **Location**: Line 2904 in `route.ts`
- **Issue**: Outer catch block was checking for `timeout` in error message and closing stream
- **Impact**: Even though inner timeout handler created fallback plan, outer catch closed stream

### 2. Import Path Issue
- **Location**: Line 2437 in `route.ts`  
- **Issue**: Import path was wrong, causing fallback to fail
- **Impact**: If import failed, no fallback plan was created

### 3. Error Classification Too Broad
- **Location**: Line 2901-2905 in `route.ts`
- **Issue**: `isModelError` included timeouts, causing stream to close
- **Impact**: Recoverable timeout errors were treated as fatal

## Fixes Applied

### Fix 1: Robust Timeout Fallback (Lines 2432-2462)
```typescript
try {
  rawPlan = await Promise.race([plannerPromise, timeoutPromise]);
} catch (timeoutError: any) {
  if (timeoutError?.message?.includes('timeout')) {
    try {
      const { generateSimplePlan } = await import('@/server/orchestrator/planner');
      rawPlan = { plan: generateSimplePlan(userMessage), ... };
    } catch (importError) {
      // Fallback: create minimal plan directly
      rawPlan = { plan: [{ id: 's1', title: 'Respond to user query', tool: 'none' }], ... };
    }
  }
}
```

### Fix 2: Better Error Classification (Lines 2915-2947)
```typescript
// Only stop stream for CRITICAL errors
const isCriticalModelError = (errorMsg.includes('not found') && errorMsg.includes('404')) || 
                            errorMsg.includes('Ollama connection refused') ||
                            errorMsg.includes('ECONNREFUSED');

// Timeouts are NOT critical - they have fallback plans
if (isCriticalModelError) {
  controller.close();
  return;
}
```

### Fix 3: Guaranteed Fallback (Lines 2949-2976)
```typescript
// Always create fallback plan if undefined
if (!plan) {
  plan = { objective: userMessage, plan: [{ id: 's1', ... }], ... };
}

// Send status (not error) so stream continues
send({ type: 'status', data: { message: 'Using fallback plan', phase: 'planning' } });
```

## Expected Flow After Fix

1. **Planner Timeout** → Inner handler creates fallback plan → Stream continues
2. **Planner Error** → Outer catch creates fallback plan → Stream continues  
3. **Stream Reaches Summarizer** → Summary generated → Delta events sent
4. **Messages Render** → UI displays assistant response

## Testing Checklist

- [ ] Send message that triggers planner timeout
- [ ] Verify fallback plan is created (check logs)
- [ ] Verify stream continues (no early close)
- [ ] Verify summarizer runs (check logs)
- [ ] Verify delta events are sent (check logs)
- [ ] Verify messages render in UI

