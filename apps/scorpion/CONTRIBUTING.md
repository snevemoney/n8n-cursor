# SCORPION CODEBASE RULES — READABILITY MANDATE

## Overview

Scorpion is a multi-agent orchestration system with complex flows involving RAG, ML integration, tool routing, and streaming responses. To maintain clarity and prevent cognitive overload, we enforce strict readability principles inspired by the **3 Laws of Readable Code**.

---

## 🎯 THE 3 LAWS OF READABLE CODE

### Law 1: Avoid Deep Nesting
Deep nesting forces readers to mentally track multiple conditions simultaneously, pushing cognitive limits.

**Rule:** Max nesting depth allowed: **2 levels**

**How to flatten:**
- Use **early returns** (guard clauses)
- Use **inversion** (check negative conditions first, return early)
- **Extract** complex nested logic to helper functions

**Example - BEFORE (6 levels deep):**
```typescript
if (!maintenance) {
  if (userAuthenticated) {
    if (userAuthorized) {
      try {
        if (hasPermission) {
          if (validData) {
            // ... core logic buried 6 levels deep
          }
        }
      } catch (error) {
        // ...
      }
    }
  }
}
```

**Example - AFTER (2 levels max):**
```typescript
// Guard clauses at the top
if (maintenance) return maintenanceResponse();
if (!userAuthenticated) return authFailResponse();
if (!userAuthorized) return permissionDeniedResponse();
if (!hasPermission) return insufficientPermissionsResponse();
if (!validData) return invalidDataResponse();

// Core logic is now at top level - easy to read
return executeMainLogic();
```

### Law 2: Avoid Code Duplication
If logic appears in multiple places, extract it to a shared helper.

**Rule:** If you copy-paste code more than once, it must be extracted to a helper function.

**Common duplication areas to avoid:**
- Tool execution logic
- Validation logic (null checks, structure validation)
- Stream formatting (SSE events)
- Error handling patterns
- Logging and telemetry
- Result extraction

**Example - BEFORE:**
```typescript
// In function A
try {
  const result = await executeOperation();
  send({ type: 'progress', data: { message: 'Operation complete' } });
} catch (error: any) {
  console.error('[ComponentA] Error:', error?.message);
  send({ type: 'error', data: { error: error?.message || 'Unknown error' } });
}

// In function B (duplicated)
try {
  const result = await executeOtherOperation();
  send({ type: 'progress', data: { message: 'Other operation complete' } });
} catch (error: any) {
  console.error('[ComponentB] Error:', error?.message);
  send({ type: 'error', data: { error: error?.message || 'Unknown error' } });
}
```

**Example - AFTER:**
```typescript
// Extracted to helpers/errorHandler.ts
export function handleStreamError(
  send: SendFunction,
  error: unknown,
  component: string
): void {
  const normalizedError = normalizeError(error);
  console.error(`[${component}] Error:`, normalizedError.message);
  send({ type: 'error', data: { error: normalizedError.message } });
}

// Usage
try {
  const result = await executeOperation();
  emitProgress(send, 'Operation complete');
} catch (error) {
  handleStreamError(send, error, 'ComponentA');
}
```

### Law 3: Clear, Descriptive Naming
Names must reveal intent. No cryptic abbreviations or single-letter variables (except in small loops).

**Rule:** Function and variable names must be clear to a reader who has never seen the code before.

**Naming Conventions:**

#### Function Naming by Purpose:
- `validate*()` - Validation functions (returns boolean or ValidationResult)
  - Examples: `validateRequest()`, `validatePlanStructure()`, `validateToolParams()`
- `extract*()` - Data extraction/parsing (returns extracted data)
  - Examples: `extractKnowledgeHits()`, `extractCodeReadResults()`, `extractToolParams()`
- `build*()` - Construction/assembly (returns built object)
  - Examples: `buildSummaryContext()`, `buildPrompt()`, `buildStreamContext()`
- `execute*()` - Tool/operation execution (returns ExecutionResult)
  - Examples: `executeUserTool()`, `executePlanStep()`, `executeQuery()`
- `handle*()` - Main phase handlers (orchestration level)
  - Examples: `handlePlannerPhase()`, `handleCouncilPhase()`, `handleSummarizerPhase()`
- `detect*()` - Intent/pattern detection (returns classification)
  - Examples: `detectIntent()`, `detectUserTool()`, `detectCodebaseQuestion()`
- `format*()` - Data formatting (returns formatted string/object)
  - Examples: `formatErrorMessage()`, `formatToolResult()`, `formatTimestamp()`
- `run*()` - Main execution flows (top-level orchestrators)
  - Examples: `runPreflightChecks()`, `runAgentWorkflow()`, `runLegacyExecutor()`

#### Variable Naming:
- **No abbreviations:** Use `context` not `ctx`, `message` not `msg`, `result` not `res`
- **Be specific:** Use `validationResult` not `result`, `userToolResult` not `toolRes`
- **Type suffixes:** Use `*Input`, `*Result`, `*Config`, `*Options` for interfaces/types

**Example - BEFORE (unclear):**
```typescript
function run(ctx: any): any {
  const res = process(ctx.msg);
  const cfg = getCfg();
  return exec(res, cfg);
}
```

**Example - AFTER (clear):**
```typescript
function executeToolWorkflow(context: ExecutionContext): ExecutionResult {
  const toolResult = processToolRequest(context.message);
  const executionConfig = getExecutionConfig();
  return executeWithConfig(toolResult, executionConfig);
}
```

---

## 📏 SIZE LIMITS

### File Size Limits
**Rule:** Any file exceeding **500 lines** must be split into smaller modules.

**Why:** Large files are hard to navigate, understand, and maintain.

**How to split:**
- Extract related functions to helper modules
- Group by responsibility (validation, execution, formatting, etc.)
- Use clear module boundaries with typed interfaces

### Function Size Limits
**Rule:** Any function exceeding **40 lines** must be split into smaller functions.

**Why:** Functions that are too long are hard to understand and test.

**How to split:**
- Extract complex conditionals to named helper functions
- Extract repeated logic blocks to utilities
- Use the "single responsibility principle" - one function, one job

**Example - BEFORE (80 lines):**
```typescript
function processRequest(request: Request): Response {
  // 80 lines of mixed validation, transformation, execution, and formatting
}
```

**Example - AFTER (small, focused functions):**
```typescript
function processRequest(request: Request): Response {
  const validatedRequest = validateAndNormalizeRequest(request);
  const executionContext = buildExecutionContext(validatedRequest);
  const result = executeOperation(executionContext);
  return formatResponse(result);
}

// Each helper is <40 lines, single responsibility
function validateAndNormalizeRequest(request: Request): ValidatedRequest { /* ... */ }
function buildExecutionContext(request: ValidatedRequest): ExecutionContext { /* ... */ }
function executeOperation(context: ExecutionContext): OperationResult { /* ... */ }
function formatResponse(result: OperationResult): Response { /* ... */ }
```

---

## 🧠 BRAIN-SAFE CODE PRINCIPLES

### The Working Memory Rule
Human working memory can hold approximately **7±2 items** at once. Good code should never require holding more than **2 conditions** in your head at any given time.

**Bad - Forces you to track 5 conditions:**
```typescript
if (conditionA) {
  if (conditionB) {
    if (conditionC) {
      if (conditionD) {
        if (conditionE) {
          // You must remember A && B && C && D && E to understand this
        }
      }
    }
  }
}
```

**Good - Only track 1 condition at a time:**
```typescript
if (!conditionA) return handleMissingA();
if (!conditionB) return handleMissingB();
if (!conditionC) return handleMissingC();
if (!conditionD) return handleMissingD();
if (!conditionE) return handleMissingE();

// At this point, you can FORGET all the conditions above
// You only need to understand the core logic below
return executeMainLogic();
```

### The Scanability Principle
Code should be skimmable. A developer should be able to understand the **high-level flow** by reading function names alone, without diving into implementations.

**Example:**
```typescript
export async function processStreamStart(input: ProcessStreamStartInput): Promise<void> {
  // This function reads like a table of contents
  const validatedRequest = validateRequest(input);
  const intentResult = detectIntent(validatedRequest);
  const preflightResult = runPreflightChecks(validatedRequest, intentResult);

  if (preflightResult.shouldShortCircuit) {
    return handleShortCircuit(preflightResult);
  }

  const planResult = await handlePlannerPhase(validatedRequest);
  const councilResult = await handleCouncilPhase(planResult);
  const executionResult = await executeToolPipeline(councilResult);
  const summaryResult = await handleSummarizerPhase(executionResult);

  return streamFinalResponse(summaryResult);
}
```

---

## 🏗️ MODULAR PIPELINE ARCHITECTURE

### The Orchestrator Pattern
The main orchestration file (`processStreamStart.ts`) must **not contain business logic**. It should only:
1. Call helper functions
2. Handle control flow (if/else, try/catch)
3. Pass data between phases

**All business logic must live in focused helper modules:**

```
app/api/chat/stream/
├── processStreamStart.ts        [Orchestration ONLY - no business logic]
├── helpers/
│   ├── validationOrchestrator.ts   [All validation logic]
│   ├── toolExecutor.ts             [All tool execution logic]
│   ├── resultProcessor.ts          [All result extraction logic]
│   ├── planValidator.ts            [All plan validation logic]
│   ├── errorHandler.ts             [All error handling logic]
│   └── streamEmitter.ts            [All stream formatting logic]
```

### Single Source of Truth
Each type of operation must have **one and only one** canonical implementation.

**Bad - 3 different tool executors:**
- `processStreamStart.ts` (inline tool execution)
- `handlers/userToolHandler.ts` (user tool execution)
- `helpers/legacyExecutor.ts` (legacy tool execution)

**Good - 1 unified tool executor:**
- `helpers/toolExecutor.ts` (all tool execution logic)
- Everyone calls this one source of truth

---

## 🤖 AI-READY CODE

Scorpion integrates with LLMs, so code must be structured for both humans AND AI comprehension.

**AI-friendly patterns:**
- **Small units:** Functions <40 lines are easier for LLMs to understand
- **Functional purity:** Minimize side effects, prefer pure functions
- **Descriptive names:** LLMs understand intent better with clear names
- **Typed interfaces:** TypeScript types document contracts clearly
- **Single responsibility:** Each module does one thing well

---

## 🔧 ENFORCEMENT

### Pre-commit Checklist
Before committing code, verify:
- [ ] No functions exceed 40 lines
- [ ] No files exceed 500 lines
- [ ] No nesting exceeds 2 levels
- [ ] No duplicated logic (use helpers)
- [ ] All names are descriptive (no `ctx`, `res`, `msg`, etc.)
- [ ] TypeScript build passes (`pnpm typecheck`)
- [ ] No new TODO/FIXME comments without tracking issues

### Code Review Guidelines
When reviewing PRs, check for:
- Readability: Can you understand the code in <30 seconds?
- Nesting: Any blocks deeper than 2 levels?
- Duplication: Any repeated patterns that should be extracted?
- Naming: Any unclear variable/function names?
- Size: Any files/functions that should be split?

---

## 📚 EXAMPLES FROM SCORPION

### Example 1: Plan Validator (Phase 4.1)

**Before (inline, nested, 600 lines):**
```typescript
// Inside processStreamStart.ts (lines ~1900-2500)
if (isCodebaseQuestion && !hasCodeReadSteps) {
  if (conversationHistory && conversationHistory.length > 0) {
    const assistantMessages = conversationHistory
      .filter((msg: any) => msg.role === 'assistant')
      .map((msg: any) => msg.content)
      .join('\n');

    filePatterns.forEach(pattern => {
      if (pattern.test(assistantMessages)) {
        // ... 50+ lines of nested path correction logic
      }
    });
  }
}
```

**After (extracted, flat, single responsibility):**
```typescript
// In helpers/planValidator.ts
export async function validateAndNormalizePlan(
  input: PlanValidationInput
): Promise<PlanValidationResult> {
  const normalizedPlan = normalizePlanSteps(input.plan);
  const enrichedPlan = await injectMissingTools(normalizedPlan, input);
  const correctedPlan = correctFilePaths(enrichedPlan, input);
  const enforcedPlan = enforcePlanRules(correctedPlan);

  return { plan: enforcedPlan, warnings: [] };
}

// In processStreamStart.ts (orchestration only)
const { plan, warnings } = await validateAndNormalizePlan({
  plan: rawPlan,
  conversationHistory,
  detectedIntent
});
```

### Example 2: Error Handler Consolidation

**Before (duplicated 95 times):**
```typescript
// Duplicated in 32 different files
try {
  const result = await someOperation();
} catch (error: any) {
  console.error('[ComponentName] Error:', error?.message);
  send({ type: 'error', data: { error: error?.message || 'Unknown error' } });
}
```

**After (single source of truth):**
```typescript
// In helpers/errorHandler.ts
export function handleStreamError(
  send: SendFunction,
  error: unknown,
  context: ErrorContext
): void {
  const normalized = normalizeError(error);
  logError(context.component, normalized, context.metadata);
  emitErrorEvent(send, normalized);
}

// Usage everywhere
try {
  const result = await someOperation();
} catch (error) {
  handleStreamError(send, error, { component: 'ComponentName', metadata: {} });
}
```

---

## 🚀 GETTING STARTED

### For New Contributors
1. Read this document completely
2. Review existing helper modules for patterns
3. Follow the naming conventions strictly
4. Keep functions small and focused
5. Extract, don't duplicate

### For Existing Code
1. Prioritize refactoring high-complexity areas (identified in analysis)
2. Follow the phase plan: Flatten → Deduplicate → Rename
3. Test after each extraction
4. Commit incrementally with clear messages

---

## 📖 ADDITIONAL RESOURCES

- **Architecture Overview:** See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Phase 1-3 Report:** See [PHASE_1_2_3_REFACTORING_REPORT.md](./PHASE_1_2_3_REFACTORING_REPORT.md)
- **Phase 4 Plan:** See [PHASE_4_PLAN.md](./PHASE_4_PLAN.md)
- **Power of 10 Rules:** https://en.wikipedia.org/wiki/The_Power_of_10:_Rules_for_Developing_Safety-Critical_Code

---

**Remember:** Code is read far more often than it is written. Optimize for the reader, not the writer.

**The ultimate test:** Can a new developer understand this code in under 2 minutes? If not, refactor it.
