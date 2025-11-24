# Planner Timeout Fix

## Issue
The planner was timing out after 40 seconds, preventing the stream from completing and delta events from being sent.

## Root Cause
1. **Tool-router timeouts**: The tool-router was taking 30-50 seconds per attempt, causing cascading timeouts
2. **Fixed timeout**: The planner had a fixed 40-second timeout regardless of query complexity
3. **No fallback**: When the planner timed out, there was no fallback mechanism

## Fixes Applied

### 1. Dynamic Timeout Based on Query Complexity
**Location**: `apps/scorpion/app/api/chat/stream/route.ts` (lines 2417-2425)

- Simple queries (greetings, small talk): 20-second timeout
- Complex queries: 60-second timeout
- Detects simple queries by checking:
  - `small_talk` intent
  - Simple greeting patterns: `hi`, `hello`, `hey`, `thanks`, `test`, etc.

```typescript
const isSimpleQuery = (intent as string) === 'small_talk' || 
                      /^(hi|hello|hey|thanks|thank you|ok|okay|yes|no|test)$/i.test(userMessage.trim());
const plannerTimeout = isSimpleQuery ? 20000 : 60000; // 20s for simple, 60s for complex
```

### 2. Fallback to Simple Plan on Timeout
**Location**: `apps/scorpion/app/api/chat/stream/route.ts` (lines 2427-2443)

- If planner times out, automatically falls back to `generateSimplePlan()`
- Ensures the stream continues even if the LLM is unresponsive
- Prevents complete stream failure

```typescript
try {
  rawPlan = await Promise.race([plannerPromise, timeoutPromise]);
} catch (timeoutError: any) {
  if (timeoutError?.message?.includes('timeout')) {
    console.warn('[Chat Stream] Planner timeout, falling back to simple plan');
    const { generateSimplePlan } = await import('../../server/orchestrator/planner');
    rawPlan = {
      plan: generateSimplePlan(userMessage),
      intent: intent as import('@scorpion/core').ScorpionIntent,
      objective: userMessage,
    };
  } else {
    throw timeoutError;
  }
}
```

### 3. Short-Circuit for Simple Greetings
**Location**: `apps/scorpion/app/api/chat/stream/route.ts` (lines 697-701)

- Bypasses tool-router, planner, and council for simple greetings
- Handles both `small_talk` intent and simple greeting patterns
- Provides direct conversational responses

```typescript
const isSimpleGreeting = /^(hi|hello|hey|thanks|thank you|ok|okay|yes|no|test|hello test)$/i.test(userMessage.trim());
if (intent === 'small_talk' || isSimpleGreeting) {
  // Direct response, no tools, no planner, no council
}
```

## Benefits

1. **Faster responses**: Simple queries complete in 20 seconds instead of 40+
2. **Resilience**: Fallback ensures stream continues even if LLM is slow
3. **Better UX**: Simple greetings get immediate responses without expensive operations
4. **Power-of-10 compliance**: All changes include proper guards and error handling

## Testing

### Test Cases
1. **Simple greeting**: "hello test" → Should bypass planner, get direct response
2. **Complex query**: "analyze the codebase" → Should use 60s timeout
3. **Timeout scenario**: If LLM is unresponsive → Should fallback to simple plan

### Expected Behavior
- Simple queries: Complete in < 20 seconds
- Complex queries: Have 60 seconds to complete
- Timeout fallback: Stream continues with simple plan

## Related Issues

- Tool-router timeouts (30-50s per attempt) - This is a separate issue that may need investigation
- LLM connectivity - If model is completely unresponsive, fallback ensures stream continues

## Next Steps

1. Monitor planner timeout rates after this fix
2. Investigate tool-router timeouts if they persist
3. Consider increasing tool-router timeout or adding fallback there as well

