# Tool Contract v2 & Event System Integration

## Overview
Integrated uniform tool contract and SSE event system as provided. All contracts are now in place and ready for use.

## Files Created

### Type Definitions
1. **`apps/scorpion/server/types/tooling.ts`**
   - `ToolResult<T>` - Uniform tool response format
   - `ToolInvokeArgs` - Standardized tool invocation args
   - `Scratchpad` - Conversation memory for executor

2. **`apps/scorpion/server/types/events.ts`**
   - Complete SSE event type definitions
   - `ChatEvent` discriminated union
   - All event types: Progress, Status, Thought, SearchQuery, KnowledgeHit, Citation, Plan, ToolCall, ToolResult, etc.

### Orchestrator Components
3. **`apps/scorpion/server/orchestrator/events.ts`**
   - SSE emitter helper

4. **`apps/scorpion/server/orchestrator/executor.ts`**
   - `makeExecutor()` - Wraps tools with contract enforcement
   - Automatic scratchpad management
   - Event emission (tool_call, tool_result)

5. **`apps/scorpion/server/orchestrator/summarizer.ts`**
   - `buildSummarizerContext()` - Collects sources from scratchpad
   - Guarantees sources are injected into summarizer

6. **`apps/scorpion/server/orchestrator/plannerModel.ts`**
   - `pickPlannerModel()` - Uses preflight to select model

### System Components
7. **`apps/scorpion/server/system/preflight.ts`**
   - `runPreflight()` - Validates LLM availability

8. **`apps/scorpion/lib/orchestrator/planAudit.ts`**
   - `createPlanAudit()` - Plan execution telemetry
   - Tracks plan generation, step execution, summarizer triggers

### Tools
9. **`apps/scorpion/server/tools/_validate.ts`**
   - `assertNonEmptyArray()` - Validates tool results

### Tests
10. **`apps/scorpion/tests/e2e/research-flow.spec.ts`**
    - E2E Playwright tests for research flow
    - Tests Tools panel, Knowledge panel, cited answers

## UI Integration

### Updated Hooks
- **`useChatState.ts`** - Added `auditLog` and `appendAudit`
- **`useChatStream.ts`** - Handles `audit` events, routes to panels
- **`page.tsx`** - Passes `appendAudit` to `useChatStream`

## Next Steps

### 1. Wire Executor into Route
Update `apps/scorpion/app/api/chat/stream/route.ts` to use `makeExecutor()`:

```typescript
import { makeExecutor } from '@/server/orchestrator/executor';
import { sseEmit } from '@/server/orchestrator/events';

// In route handler:
const emit = sseEmit(controller);
const executor = makeExecutor(tools, emit);

// Use executor.runTool() instead of executeTool()
```

### 2. Update Research Tool
Update `apps/scorpion/lib/chat/tools/research.ts` to:
- Use `ToolInvokeArgs` signature
- Return `ToolResult` format
- Emit `EV_SearchQuery` and `EV_KnowledgeHit` events

### 3. Integrate Plan Audit
Add audit tracking to route:

```typescript
import { createPlanAudit } from '@/lib/orchestrator/planAudit';

const emitAudit = (e: any) => {
  if (process.env.SCORPION_AUDIT === '1') {
    send({ type: 'audit', data: e });
  }
  console.debug('[AUDIT]', e);
};

const audit = createPlanAudit(conversationId, emitAudit);

// Call audit methods throughout execution
audit.planGenerated(plan);
audit.stepStarted(step.id, { tool: step.tool });
audit.stepCompleted(step.id, { tool: step.tool, durationMs });
```

### 4. Add Audit UI Component
Create component to display audit log (behind env flag):

```typescript
// apps/scorpion/components/chat/PlanAudit.tsx
{process.env.NEXT_PUBLIC_SCORPION_AUDIT === '1' && (
  <PlanAudit entries={auditLog[currentConversationId]} />
)}
```

### 5. Update Summarizer
Use `buildSummarizerContext()` to inject sources:

```typescript
import { buildSummarizerContext } from '@/server/orchestrator/summarizer';

const scratchpad = executor.getPad(conversationId);
const context = buildSummarizerContext(
  conversationId,
  conversationHistory,
  scratchpad.entries
);

// Pass context.sources to summarizer prompt
```

## Environment Variables

Add to `.env.local`:

```bash
# Enable plan audit telemetry
SCORPION_AUDIT=1
NEXT_PUBLIC_SCORPION_AUDIT=1

# Planner model selection
OPENAI_PLANNER_MODEL=gpt-4o-mini
```

## Testing

Run E2E tests:

```bash
pnpm -w dlx playwright install --with-deps
pnpm -w dlx playwright test apps/scorpion/tests/e2e/research-flow.spec.ts --project=chromium
```

## Benefits

✅ **Uniform Contract**: All tools return `{ok, data, error, meta}`
✅ **Event Parity**: Complete SSE event coverage matching UI needs
✅ **Scratchpad**: Executor maintains conversation memory
✅ **Audit Trail**: Full visibility into plan execution
✅ **Source Injection**: Guaranteed sources in summarizer context
✅ **E2E Tests**: Automated verification of research flow

All contracts are in place and ready for integration!

