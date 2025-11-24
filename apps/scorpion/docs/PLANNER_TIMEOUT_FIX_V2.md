# Planner Timeout Fix V2 - Better Error Recovery

## Problem
Messages weren't rendering because:
1. Planner timeout (40s) was causing stream to fail
2. Timeout fallback wasn't working (import path issues)
3. Outer catch block was closing stream for timeout errors
4. Stream never reached summarizer/delta phase

## Root Cause Analysis
- **Line 2432-2446**: Inner timeout handler catches timeout and creates fallback plan
- **Line 2908**: Outer catch block was catching ALL errors including timeouts
- **Line 2904**: Outer catch was checking `errorMsg.includes('timeout')` and closing stream
- **Line 2930**: Stream was being closed and returned, preventing continuation

## Solution

### 1. Robust Timeout Fallback (Lines 2432-2462)
- Added nested try-catch in timeout handler
- If `generateSimplePlan` import fails, create minimal plan directly
- Always succeeds with a fallback plan - never throws

### 2. Better Error Classification (Lines 2915-2947)
- Only stop stream for **critical** errors:
  - Model not found (404)
  - Connection refused (ECONNREFUSED)
- **NOT** for timeouts - those should have fallback plans

### 3. Guaranteed Fallback Plan (Lines 2949-2976)
- Always create fallback plan if `plan` is undefined
- Changed error event to status event (doesn't break stream)
- Stream continues even after planner errors

## Key Changes

```typescript
// Before: Timeout would close stream
if (errorMsg.includes('timeout')) {
  controller.close();
  return;
}

// After: Timeout uses fallback and continues
if (isCriticalModelError) { // timeout NOT included
  controller.close();
  return;
}
// ... create fallback plan and continue
```

## Expected Behavior
1. Planner timeout → Fallback plan created → Stream continues
2. Planner error → Fallback plan created → Stream continues  
3. Critical model error → Stream closes with helpful message
4. Stream always reaches summarizer → Delta events sent → Messages render

## Testing
- Send a message that triggers planner timeout
- Verify fallback plan is created
- Verify stream continues to summarizer
- Verify delta events are sent
- Verify messages render in UI

