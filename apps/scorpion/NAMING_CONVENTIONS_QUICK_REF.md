# Scorpion Naming Conventions - Quick Reference

**Purpose:** Eliminate ambiguity and make code self-documenting

---

## Function Naming by Verb

### `validate*()`
**Purpose:** Validation functions (returns boolean or ValidationResult)
**Examples:**
- `validateRequest()` - Validate HTTP request structure
- `validatePlanStructure()` - Validate plan has required fields
- `validateToolParams()` - Validate tool parameters against schema
- `validateUserAuthentication()` - Validate user auth token

**Return types:** `boolean`, `ValidationResult`, `{ ok: boolean, errors?: string[] }`

---

### `extract*()`
**Purpose:** Data extraction/parsing (returns extracted data)
**Examples:**
- `extractKnowledgeHits()` - Extract KB search results from tool results
- `extractCodeReadResults()` - Extract code.readFile results
- `extractToolParams()` - Extract parameters from user input
- `extractMissingFields()` - Extract missing field names from validation error

**Return types:** Specific data types (arrays, objects, primitives)

---

### `build*()`
**Purpose:** Construction/assembly (returns built object)
**Examples:**
- `buildSummaryContext()` - Build context string for summarizer
- `buildPrompt()` - Build LLM prompt from template
- `buildStreamContext()` - Build context object for stream
- `buildToolResult()` - Build formatted tool result object

**Return types:** Complex objects, strings, formatted data

---

### `execute*()`
**Purpose:** Tool/operation execution (returns ExecutionResult)
**Examples:**
- `executeUserTool()` - Execute a user-callable tool
- `executePlanStep()` - Execute a single step from plan
- `executeQuery()` - Execute a database/search query
- `executeUnifiedTool()` - Execute tool with unified interface

**Return types:** `ExecutionResult`, `ToolResult`, `{ ok: boolean, result?: any, error?: string }`

---

### `handle*()`
**Purpose:** Main phase handlers (orchestration level)
**Examples:**
- `handlePlannerPhase()` - Handle planner phase orchestration
- `handleCouncilPhase()` - Handle council validation phase
- `handleSummarizerPhase()` - Handle summarizer phase
- `handleStreamError()` - Handle error in stream context
- `handleToolExecutionError()` - Handle tool execution error

**Return types:** Phase-specific result types, `void` for error handlers

---

### `detect*()`
**Purpose:** Intent/pattern detection (returns classification)
**Examples:**
- `detectIntent()` - Detect user intent from message
- `detectUserTool()` - Detect if message is a tool invocation
- `detectCodebaseQuestion()` - Detect if question is about codebase
- `detectPreviouslyReadFiles()` - Detect files mentioned in history

**Return types:** Classification enums, detection objects, boolean

---

### `format*()`
**Purpose:** Data formatting (returns formatted string/object)
**Examples:**
- `formatErrorMessage()` - Format error for user display
- `formatToolResult()` - Format tool result for display
- `formatTimestamp()` - Format timestamp string
- `formatMissingFieldsError()` - Format missing fields error message

**Return types:** Formatted strings, display objects

---

### `run*()`
**Purpose:** Main execution flows (top-level orchestrators)
**Examples:**
- `runPreflightChecks()` - Run all preflight validation checks
- `runAgentWorkflow()` - Run the entire agent workflow
- `runLegacyExecutor()` - Run legacy execution loop
- `runToolPipeline()` - Run tool execution pipeline

**Return types:** Workflow results, pipeline outputs

---

### `emit*()`
**Purpose:** Event emission (side effect: sends events)
**Examples:**
- `emitProgress()` - Emit progress event to stream
- `emitStatus()` - Emit status update event
- `emitError()` - Emit error event
- `emitKnowledgeHit()` - Emit knowledge search result event
- `emitToolStart()` - Emit tool execution start event

**Return types:** `void` (side effects only)

---

### `normalize*()`
**Purpose:** Data normalization to consistent format
**Examples:**
- `normalizeError()` - Normalize error to NormalizedError type
- `normalizePlanSteps()` - Normalize plan steps to consistent format
- `normalizeToolArgs()` - Normalize tool arguments structure

**Return types:** Normalized version of input

---

### `inject*()`
**Purpose:** Adding/injecting data into existing structures
**Examples:**
- `injectToolsForKbSearchPlans()` - Inject kb.search tools into plan
- `injectCodeReadSteps()` - Inject code.readFile steps into plan
- `injectMetadata()` - Inject metadata into result object

**Return types:** Enhanced version of input

---

### `correct*()`
**Purpose:** Fixing/correcting data
**Examples:**
- `correctFilePaths()` - Correct file paths in plan
- `correctToolParameters()` - Correct malformed tool parameters

**Return types:** Corrected version of input

---

### `enforce*()`
**Purpose:** Applying rules/constraints
**Examples:**
- `enforcePlanRules()` - Enforce plan structure rules
- `enforceSystemTools()` - Enforce system.health/system.logs inclusion

**Return types:** Rule-enforced version of input

---

## Variable Naming

### No Abbreviations Rule
❌ **BAD:** `ctx`, `msg`, `res`, `cfg`, `req`, `conv`
✅ **GOOD:** `context`, `message`, `result`, `config`, `request`, `conversation`

### Specific Names Rule
❌ **BAD:** `data`, `result`, `output`, `info`, `obj`
✅ **GOOD:** `validationResult`, `toolExecutionResult`, `formattedResponse`, `userProfile`, `configObject`

### Type Suffix Pattern
✅ **Input interfaces:** `ToolExecutionInput`, `ValidationInput`, `BuildContextInput`
✅ **Result interfaces:** `ExecutionResult`, `ValidationResult`, `PlanResult`
✅ **Config interfaces:** `PipelineConfig`, `ExecutionConfig`, `HelperOrchestrationConfig`
✅ **Options interfaces:** `ValidationOptions`, `BuildOptions`, `FormatOptions`

---

## File Naming

### Convention: camelCase
✅ **Examples:** `processStreamStart.ts`, `planValidator.ts`, `toolExecutor.ts`

### Pattern: Purpose + Type
✅ **Helpers:** `*Helper.ts` (e.g., `streamHelper.ts`)
✅ **Handlers:** `*Handler.ts` (e.g., `errorHandler.ts`)
✅ **Utilities:** `*Util.ts` or descriptive name (e.g., `streamEmitter.ts`)
✅ **Orchestrators:** `*Orchestrator.ts` (e.g., `validationOrchestrator.ts`)
✅ **Executors:** `*Executor.ts` (e.g., `toolExecutor.ts`)
✅ **Processors:** `*Processor.ts` (e.g., `resultProcessor.ts`)
✅ **Builders:** `*Builder.ts` (e.g., `promptBuilder.ts`)

---

## Common Patterns to Replace

### Error Handling
❌ **OLD:**
```typescript
try {
  const res = await op();
} catch (err: any) {
  console.error('[Component] Error:', err?.message);
  send({ type: 'error', data: { message: err?.message } });
}
```

✅ **NEW:**
```typescript
try {
  const operationResult = await executeOperation();
} catch (error) {
  handleStreamError(send, error, { component: 'Component', operation: 'operation' });
}
```

### Stream Events
❌ **OLD:**
```typescript
send({ type: 'progress', data: { phase, progress, message } });
send({ type: 'status', data: { message, phase } });
```

✅ **NEW:**
```typescript
emitProgress(send, phase, progress, message);
emitStatus(send, message, phase);
```

### Variable Declaration
❌ **OLD:**
```typescript
const ctx = buildContext();
const res = await exec(ctx);
const msg = format(res);
```

✅ **NEW:**
```typescript
const executionContext = buildExecutionContext();
const executionResult = await executeOperation(executionContext);
const formattedMessage = formatResultMessage(executionResult);
```

---

## Quick Decision Tree

**"What should I name this function?"**

1. Does it validate something? → `validate*()`
2. Does it extract/parse data? → `extract*()`
3. Does it build/construct something? → `build*()`
4. Does it execute a tool/operation? → `execute*()`
5. Does it handle a phase or error? → `handle*()`
6. Does it detect intent/pattern? → `detect*()`
7. Does it format data for display? → `format*()`
8. Does it run a full workflow? → `run*()`
9. Does it emit an event? → `emit*()`
10. Does it normalize data? → `normalize*()`
11. Does it inject/add data? → `inject*()`
12. Does it fix/correct data? → `correct*()`
13. Does it enforce rules? → `enforce*()`

**"What should I name this variable?"**

1. Is it short-lived (<5 lines)? → Descriptive name with context (e.g., `validatedRequest`)
2. Is it long-lived or passed around? → Full descriptive name (e.g., `toolExecutionResult`)
3. Is it a parameter? → Match the function's purpose + `Input` suffix
4. Is it a return value? → Match the function's purpose + `Result` suffix
5. **Never use:** `ctx`, `msg`, `res`, `cfg`, `req`, `err`, `obj`, `data`, `info`

---

## Before/After Examples

### Example 1: Tool Execution

**BEFORE (unclear, abbreviated):**
```typescript
async function exec(t: string, args: any): Promise<any> {
  const res = await tool.run(t, args);
  return res;
}
```

**AFTER (clear, descriptive):**
```typescript
async function executeUnifiedTool(
  toolName: string,
  toolArguments: any
): Promise<ToolExecutionResult> {
  const executionResult = await executeTool(toolName, toolArguments);
  return executionResult;
}
```

### Example 2: Validation

**BEFORE (generic names):**
```typescript
function check(input: any): boolean {
  if (!input || !input.data) return false;
  return true;
}
```

**AFTER (specific purpose):**
```typescript
function validateRequestStructure(request: Request): ValidationResult {
  if (!request || !request.data) {
    return { ok: false, error: 'Missing request data' };
  }
  return { ok: true };
}
```

### Example 3: Context Building

**BEFORE (unclear, nested):**
```typescript
function get(r: any): string {
  let ctx = '';
  if (r.results) {
    for (const res of r.results) {
      if (res.type === 'code') {
        ctx += res.content;
      }
    }
  }
  return ctx;
}
```

**AFTER (clear, flat):**
```typescript
function buildCodebaseContext(executionResults: ExecutionResult[]): string {
  const codeReadResults = extractCodeReadResults(executionResults);
  return formatCodeReadContext(codeReadResults);
}
```

---

## Remember

1. **Names should reveal intent** - A reader should know what a function does just by its name
2. **No abbreviations** - Full words make code self-documenting
3. **Be specific** - `userToolResult` is better than `result`
4. **Follow the verb patterns** - They create consistent mental models
5. **Type suffixes for interfaces** - `*Input`, `*Result`, `*Config`, `*Options`

**The ultimate test:** Can a new developer understand this code in under 2 minutes?

If not, the naming needs improvement.

---

**See Also:**
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Full coding standards
- [READABILITY_REFACTOR_PROGRESS.md](./READABILITY_REFACTOR_PROGRESS.md) - Refactoring progress
