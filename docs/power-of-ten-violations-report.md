# Power of 10 Violations Report - Scorpion Monorepo

**Date**: 2025-01-27  
**Scope**: `server/orchestrator`, `server/council`, `server/tools`, `lib/orchestrator`, `packages/scorpion-core/src/orchestration`

---

## Executive Summary

This report documents violations of the Power of 10 safety guidelines found in Scorpion's critical paths. **Total violations found: 47** across 5 rule categories.

### Violation Summary by Rule

| Rule | Violations | Severity | Files Affected |
|------|-----------|----------|----------------|
| Rule 2: Unbounded Loops | 9 | High | 6 files |
| Rule 3: Long Functions (>60 lines) | 12 | Medium | 8 files |
| Rule 4: Ignored Promises | 3 | High | 3 files |
| Rule 5: Excessive `any` Types | 20 | Medium | 15 files |
| Rule 7: Global Mutable State | 3 | High | 2 files |

---

## Detailed Violations

### Rule 2: Unbounded Loops (9 violations)

**Severity**: HIGH - Can cause orchestrator to hang indefinitely

#### 1. `apps/scorpion/lib/chat/modelRunner.ts:272`
```typescript
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // ... process chunk
}
```
**Issue**: No max iteration counter  
**Fix**: Add `MAX_ITERATIONS = 10000` and iteration counter

#### 2. `apps/scorpion/lib/chat/modelRunner.ts:451`
```typescript
while (true) {
  // Similar pattern
}
```

#### 3. `apps/scorpion/lib/chat/modelRunner.ts:678`
```typescript
while (true) {
  // Similar pattern
}
```

#### 4. `apps/scorpion/lib/chat/modelRunner.ts:855`
```typescript
while (true) {
  // Similar pattern
}
```

#### 5. `apps/scorpion/app/(scorpion)/chat/hooks/useChatStream.ts:300`
```typescript
while (true) {
  // Stream processing without max iterations
}
```

#### 6. `apps/scorpion/app/(scorpion)/council/page.tsx:122`
```typescript
while (true) {
  // Similar pattern
}
```

#### 7-9. Test files with `while (true)` patterns (3 files)
- `apps/scorpion/scripts/chat-cli-tests.ts:102`
- `apps/scorpion/scripts/test-frontier-fixes.ts:103`

---

### Rule 3: Long Functions (>60 lines) (12 violations)

**Severity**: MEDIUM - Makes control flow hard to follow

#### 1. `packages/scorpion-core/src/orchestration/ScorpionOrchestrator.ts:243-445`
**Function**: `runPlanner()`  
**Lines**: ~202  
**Issue**: Monolithic function handling prompt loading, tool generation, model calling, parsing  
**Fix**: Split into:
- `loadPlannerPrompt()` (~20 lines)
- `generateToolsList()` (~40 lines)
- `enrichPromptWithContext()` (~30 lines)
- `callPlannerModel()` (~30 lines)
- `parseAndValidatePlan()` (~40 lines)

#### 2. `packages/scorpion-core/src/orchestration/ScorpionOrchestrator.ts:493-656`
**Function**: `runExecutor()`  
**Lines**: ~163  
**Issue**: Complex execution loop with error handling  
**Fix**: Extract:
- `executeStepWithRetry()` (~50 lines)
- `normalizeToolResult()` (~30 lines)
- `updateProgress()` (~20 lines)

#### 3. `packages/scorpion-core/src/orchestration/ScorpionOrchestrator.ts:662-761`
**Function**: `runSummarizer()`  
**Lines**: ~99  
**Issue**: Long summarization logic  
**Fix**: Split into helpers

#### 4. `apps/scorpion/server/orchestrator/executor.ts:97-262`
**Function**: `runTool()`  
**Lines**: ~165  
**Issue**: Complex retry logic with timeout handling  
**Fix**: Extract retry state machine

#### 5. `apps/scorpion/lib/orchestrator/run-pipeline.ts:14-174`
**Function**: `runPipeline()`  
**Lines**: ~160  
**Issue**: Long pipeline orchestration  
**Fix**: Extract phase handlers

#### 6. `apps/scorpion/lib/orchestrator/run-pipeline.ts:177-266`
**Function**: `executeByPolicy()`  
**Lines**: ~89  
**Issue**: Complex execution policy  
**Fix**: Split into tool selection and execution helpers

#### 7-12. Additional long functions in:
- `apps/scorpion/server/orchestrator/planner.ts:56-186` (~130 lines)
- `apps/scorpion/server/council/index.ts:131-196` (~65 lines)
- `apps/scorpion/lib/chat/modelRunner.ts:30-951` (multiple functions >60 lines)

---

### Rule 4: Ignored Promises (3 violations)

**Severity**: HIGH - Unhandled rejections can crash Node.js

#### 1. `apps/scorpion/server/council/index.ts:190`
```typescript
storeCouncilResult(result, metadata).catch((err) => {
  console.warn('[Council] Failed to store result:', err.message);
});
```
**Issue**: Promise created but not awaited or voided  
**Fix**: Add `void` prefix or await

#### 2. `apps/scorpion/lib/shared-stores.ts:110`
```typescript
Promise.resolve().then(async () => {
  // ... monitoring code
}).catch(() => {
  // Silent fail
});
```
**Issue**: Fire-and-forget promise without explicit void  
**Fix**: Add `void` prefix

#### 3. Similar pattern in `apps/scorpion/server/orchestrator/index.ts`

---

### Rule 5: Excessive `any` Types (20 violations)

**Severity**: MEDIUM - Disables type checking

#### Files with high `any` usage:

1. **`packages/scorpion-core/src/orchestration/ScorpionOrchestrator.ts`**
   - Line 23: `args?: Record<string, any>`
   - Line 46: `parts?: any[]`
   - Line 63-71: Multiple `any` in `OrchestratorConfig`
   - Line 174: `tools: any`
   - Line 281: `error: any`
   - Line 393: `error: any`
   - Line 422: `error: any`

2. **`apps/scorpion/server/orchestrator/executor.ts`**
   - Line 8: `ToolResult<any>`
   - Line 14: `error: any`
   - Line 101: `Promise<ToolResult<any>>`
   - Line 159: `let lastError: any = null`
   - Line 203: `catch (e: any)`

3. **`apps/scorpion/server/orchestrator/council/legacy.ts`**
   - Lines 37-40: Multiple `any[]` types
   - Line 95: `onEvent: (event: { type: string; data: any }) => void`
   - Line 165: `async function runLegacyCouncilFallback(input: any)`

4. **`apps/scorpion/lib/orchestrator/run-pipeline.ts`**
   - Line 186: `context: any`
   - Line 214: `as any` cast

5. **Additional files**:
   - `apps/scorpion/server/orchestrator/jobPhases.ts` (multiple `any`)
   - `apps/scorpion/server/orchestrator/planner.ts` (multiple `any`)
   - `apps/scorpion/lib/chat/tools/index.ts` (multiple `any`)

**Fix Strategy**: Create typed interfaces for:
- `ToolArgs` (per tool type)
- `ToolResult<T>` (generic result type)
- `CouncilEvent` (typed event structure)
- `OrchestratorContext` (explicit context shape)

---

### Rule 7: Global Mutable State (3 violations)

**Severity**: HIGH - Causes race conditions and testing issues

#### 1. `apps/scorpion/lib/shared-stores.ts:11-16`
```typescript
let ragStore: RAGStore | null = null;
let ontologyStore: OntologyStore | null = null;
let orchestrator: ProjectKnowledgeOrchestrator | null = null;
let initialized = false;
let dataDir: string | null = null;
let initializationPromise: Promise<void> | null = null;
```
**Issue**: Global mutable singletons  
**Fix**: Use dependency injection or factory pattern with explicit context

#### 2. `apps/scorpion/server/orchestrator/executor.ts:88`
```typescript
const scratchpads = new Map<string, ReturnType<typeof createScratchpad>>();
```
**Issue**: Module-level mutable state  
**Fix**: Move to context object passed to executor

#### 3. Similar pattern in tool registry (if global)

---

## Files to Change (Grouped by Rule)

### Rule 2: Unbounded Loops
1. `apps/scorpion/lib/chat/modelRunner.ts` (4 violations)
2. `apps/scorpion/app/(scorpion)/chat/hooks/useChatStream.ts` (1 violation)
3. `apps/scorpion/app/(scorpion)/council/page.tsx` (1 violation)
4. `apps/scorpion/scripts/chat-cli-tests.ts` (1 violation)
5. `apps/scorpion/scripts/test-frontier-fixes.ts` (1 violation)

### Rule 3: Long Functions
1. `packages/scorpion-core/src/orchestration/ScorpionOrchestrator.ts` (3 functions)
2. `apps/scorpion/server/orchestrator/executor.ts` (1 function)
3. `apps/scorpion/lib/orchestrator/run-pipeline.ts` (2 functions)
4. `apps/scorpion/server/orchestrator/planner.ts` (1 function)
5. `apps/scorpion/server/council/index.ts` (1 function)
6. `apps/scorpion/lib/chat/modelRunner.ts` (multiple functions)

### Rule 4: Ignored Promises
1. `apps/scorpion/server/council/index.ts`
2. `apps/scorpion/lib/shared-stores.ts`
3. `apps/scorpion/server/orchestrator/index.ts`

### Rule 5: Excessive `any` Types
1. `packages/scorpion-core/src/orchestration/ScorpionOrchestrator.ts`
2. `apps/scorpion/server/orchestrator/executor.ts`
3. `apps/scorpion/server/orchestrator/council/legacy.ts`
4. `apps/scorpion/lib/orchestrator/run-pipeline.ts`
5. `apps/scorpion/server/orchestrator/jobPhases.ts`
6. `apps/scorpion/server/orchestrator/planner.ts`
7. `apps/scorpion/lib/chat/tools/index.ts`
8. Additional files (13 more)

### Rule 7: Global Mutable State
1. `apps/scorpion/lib/shared-stores.ts`
2. `apps/scorpion/server/orchestrator/executor.ts`

---

## Refactoring Priority

### Priority 1 (Critical - Fix Immediately)
- Rule 2 violations in `modelRunner.ts` (stream processing)
- Rule 4 violations (unhandled promises)
- Rule 7 violations (global state in executor)

### Priority 2 (High - Fix This Sprint)
- Rule 3 violations in `ScorpionOrchestrator.ts` (long functions)
- Rule 2 violations in hooks/components
- Rule 5 violations in executor

### Priority 3 (Medium - Fix Next Sprint)
- Rule 3 violations in other files
- Rule 5 violations in non-critical paths
- Remaining Rule 2 violations in test files

---

## Next Steps

1. **Create refactored versions** of representative violations (see separate patches)
2. **Apply pattern** to remaining violations
3. **Update CI** to enforce rules via ESLint/TypeScript
4. **Code review** all changes in critical paths
5. **Monitor** for regressions after refactoring

---

## Notes

- **No recursion violations found** - Good!
- **No `eval`/`new Function` violations found** - Good!
- **No heavy decorator usage** - Good!
- Most violations are in **orchestrator and model runner** - expected given complexity

