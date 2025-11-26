# Before/After Transformation Examples

Visual guide showing how the 3 Laws of Readable Code transform Scorpion's codebase.

---

## Law 1: Avoid Deep Nesting

### Example 1: User Tool Execution Block

**❌ BEFORE (6 levels deep - 330 lines)**
```typescript
// processStreamStart.ts lines ~367-700
if (detectedTool) {
  try {
    if (!detectedTool.isAiTool) {
      const { tool: userTool, argsText } = detectedTool;
      if (!userTool || typeof userTool !== 'object') {
        console.error('[Chat Stream] Invalid userTool:', userTool);
        send({ type: 'error', data: { message: 'Invalid tool configuration', phase: 'validation' } });
        controller.close();
        return;
      }

      const toolName = userTool.name || 'unknown';
      send({ type: 'status', data: { message: `Executing ${toolLabel}...`, phase: 'executing' } });

      let toolArgs: any = {};
      if (argsText) {
        try {
          toolArgs = JSON.parse(argsText);
        } catch {
          if (userTool.schema && typeof userTool.schema === 'object') {
            const schemaShape = (userTool.schema as any)._def || {};
            if (schemaShape.shape) {
              const fields = Object.keys(schemaShape.shape);
              if (fields.length > 0) {
                const commonTextFields = ['message', 'text', 'query', 'content'];
                const foundField = commonTextFields.find(f => fields.includes(f));
                if (foundField) {
                  toolArgs[foundField] = argsText;
                } else {
                  // ... 50+ more lines of nested logic
                }
              }
            }
          }
        }
      }
      // ... 200+ more lines of deeply nested logic
    }
  } catch (error) {
    // ... error handling
  }
}
```

**✅ AFTER (2 levels max - extracted & flattened)**
```typescript
// processStreamStart.ts (orchestration only)
const toolExecutionResult = await executeUserToolIfDetected({
  detectedTool,
  send,
  messageId,
  conversationId,
  userMessage,
  controller,
});

if (toolExecutionResult) {
  return; // Tool was executed, early return
}

// Continue with standard pipeline...
```

```typescript
// helpers/toolExecutor.ts (extracted business logic)
export async function executeUserToolIfDetected(input: ToolExecutionInput): Promise<boolean> {
  // Guard clauses at top - no nesting!
  if (!input.detectedTool) return false;
  if (input.detectedTool.isAiTool) return false;

  const validatedTool = validateToolStructure(input.detectedTool);
  if (!validatedTool.ok) {
    handleValidationError(input.send, validatedTool.error, { phase: 'validation', messageId: input.messageId });
    input.controller.close();
    return true; // Handled
  }

  const parsedArgs = parseToolArguments(input.detectedTool.argsText, validatedTool.tool.schema);
  if (!parsedArgs.ok) {
    handleMissingFieldsError(input.send, { /* ... */ });
    input.controller.close();
    return true; // Handled
  }

  await executeToolWithTelemetry({
    toolName: validatedTool.tool.name,
    args: parsedArgs.args,
    send: input.send,
    messageId: input.messageId,
    conversationId: input.conversationId,
  });

  return true; // Executed
}
```

**Improvements:**
- 🎯 **330 lines → ~80 lines** (76% reduction)
- 🧠 **6 levels → 2 levels** (67% flatter)
- ✨ **Clear flow:** Guard clauses → Validation → Parsing → Execution
- 🧪 **Testable:** Each helper can be tested independently

---

### Example 2: Plan Validation Block

**❌ BEFORE (5 levels deep)**
```typescript
// processStreamStart.ts lines ~1900-2200
if (isCodebaseQuestion && !hasCodeReadSteps) {
  if (conversationHistory && conversationHistory.length > 0) {
    const assistantMessages = conversationHistory
      .filter((msg: any) => msg.role === 'assistant')
      .map((msg: any) => msg.content)
      .join('\n');

    const filePatterns = [/reading.*?(\S+\.(ts|js|tsx|jsx|json|md))/gi, /* ... */];
    filePatterns.forEach(pattern => {
      if (pattern.test(assistantMessages)) {
        const fileName = pattern.source.replace(/[\\^$.*+?()[\]{}|]/g, '');
        previouslyReadFiles.add(fileName.toLowerCase());

        // More nesting for path correction...
        if (detectedIntent === 'workflow') {
          if (workflowId) {
            if (fileName.startsWith('workflow')) {
              // ... more logic 3 levels deeper
            }
          }
        }
      }
    });
  }
}
```

**✅ AFTER (2 levels max)**
```typescript
// processStreamStart.ts (orchestration)
const { plan, warnings } = await validateAndNormalizePlan({
  plan: rawPlan,
  conversationHistory,
  detectedIntent,
  workflowContext,
});

if (warnings.length > 0) {
  emitDebug(send, `Plan validation warnings: ${warnings.join(', ')}`);
}
```

```typescript
// helpers/planValidator.ts
export async function validateAndNormalizePlan(
  input: PlanValidationInput
): Promise<PlanValidationResult> {
  // Guard clause - early return
  if (!needsCodeReadSteps(input.plan, input.detectedIntent)) {
    return { plan: input.plan, warnings: [] };
  }

  // Flat extraction chain
  const previousFiles = detectPreviouslyMentionedFiles(input.conversationHistory);
  const enrichedPlan = injectCodeReadSteps(input.plan, previousFiles);
  const correctedPlan = correctFilePaths(enrichedPlan, input.workflowContext);
  const enforcedPlan = enforcePlanRules(correctedPlan);

  return { plan: enforcedPlan, warnings: [] };
}

// Each helper is small and focused
function detectPreviouslyMentionedFiles(history: Message[]): Set<string> {
  if (!history?.length) return new Set();

  const assistantContent = extractAssistantMessages(history);
  return extractFileNamesFromText(assistantContent);
}

function extractFileNamesFromText(text: string): Set<string> {
  const files = new Set<string>();
  const patterns = [/reading.*?(\S+\.(ts|js|tsx|jsx|json|md))/gi];

  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) files.add(match[1].toLowerCase());
    }
  });

  return files;
}
```

**Improvements:**
- 🎯 **300 lines → ~150 lines** (50% reduction)
- 🧠 **5 levels → 2 levels** (60% flatter)
- ✨ **Clear pipeline:** Detect → Inject → Correct → Enforce
- 🧪 **Each function <40 lines** and testable independently

---

## Law 2: Avoid Duplication

### Example 3: Error Handling (Duplicated 95+ times)

**❌ BEFORE (repeated in 32 files)**
```typescript
// In handlers/identityHandler.ts
try {
  const result = await detectIdentityIntent(message);
} catch (error: any) {
  console.error('[Identity Handler] Error:', error?.message);
  send({
    type: 'error',
    data: {
      message: error?.message || 'Unknown error',
      phase: 'detection',
    },
  });
}

// In phases/plannerPhase.ts (same pattern)
try {
  const plan = await generatePlan(context);
} catch (error: any) {
  console.error('[Planner Phase] Error:', error?.message);
  send({
    type: 'error',
    data: {
      message: error?.message || 'Unknown error',
      phase: 'planning',
    },
  });
}

// In helpers/ragIntegration.ts (same pattern again)
try {
  const hits = await searchKnowledgeBase(query);
} catch (error: any) {
  console.error('[RAG Integration] Error:', error?.message);
  send({
    type: 'error',
    data: {
      message: error?.message || 'Unknown error',
      phase: 'search',
    },
  });
}

// ... repeated 92 more times across 32 files
```

**✅ AFTER (single source of truth)**
```typescript
// In handlers/identityHandler.ts
import { handleStreamError } from '../helpers/errorHandler';

try {
  const result = await detectIdentityIntent(message);
} catch (error) {
  handleStreamError(send, error, { component: 'Identity Handler', operation: 'detection' });
}

// In phases/plannerPhase.ts
import { handleStreamError } from '../helpers/errorHandler';

try {
  const plan = await generatePlan(context);
} catch (error) {
  handleStreamError(send, error, { component: 'Planner Phase', operation: 'planning' });
}

// In helpers/ragIntegration.ts
import { handleStreamError } from '../helpers/errorHandler';

try {
  const hits = await searchKnowledgeBase(query);
} catch (error) {
  handleStreamError(send, error, { component: 'RAG Integration', operation: 'search' });
}
```

```typescript
// helpers/errorHandler.ts (single implementation)
export function handleStreamError(
  send: SendFunction,
  error: unknown,
  context: ErrorContext
): void {
  const normalized = normalizeError(error);
  logError(context.component, normalized, context.metadata);

  emitError(
    send,
    normalized.message,
    context.operation || 'execution',
    {
      component: context.component,
      code: normalized.code,
    }
  );
}
```

**Improvements:**
- 🎯 **95+ blocks → 1 implementation** (99% reduction in duplication)
- ✨ **Consistent format** across all components
- 🐛 **Fix once, fixes everywhere**
- 📝 **Better logging** with normalized errors

---

### Example 4: Stream Event Emission (Duplicated 50+ times)

**❌ BEFORE (repeated everywhere)**
```typescript
// In processStreamStart.ts (repeated 30+ times)
send({ type: 'progress', data: { phase: 'executing', progress: 10, message: 'Starting...' } });
send({ type: 'progress', data: { phase: 'executing', progress: 50, message: 'Processing...' } });
send({ type: 'progress', data: { phase: 'executing', progress: 90, message: 'Finishing...' } });

send({ type: 'status', data: { message: 'Tool executed', phase: 'executing' } });
send({ type: 'status', data: { message: 'Plan generated', phase: 'planning' } });

send({ type: 'tool', data: { tool: toolName, callId, args, status: 'running' } });
send({ type: 'tool', data: { tool: toolName, callId, args, status: 'completed', result } });

// ... repeated in phases/ (20+ times)
// ... repeated in handlers/ (10+ times)
```

**✅ AFTER (using utilities)**
```typescript
// In processStreamStart.ts
import { emitProgress, emitStatus, emitToolStart, emitToolComplete } from './helpers/streamEmitter';

emitProgress(send, 'executing', 10, 'Starting...');
emitProgress(send, 'executing', 50, 'Processing...');
emitProgress(send, 'executing', 90, 'Finishing...');

emitStatus(send, 'Tool executed', 'executing');
emitStatus(send, 'Plan generated', 'planning');

emitToolStart(send, toolName, callId, args);
emitToolComplete(send, toolName, callId, args, result);
```

```typescript
// helpers/streamEmitter.ts (single implementation)
export function emitProgress(send: SendFunction, phase: string, progress: number, message: string): void {
  send({ type: 'progress', data: { phase, progress, message } });
}

export function emitStatus(send: SendFunction, message: string, phase: string, conversationId?: string): void {
  send({ type: 'status', data: { message, phase, ...(conversationId && { conversationId }) } });
}

export function emitToolStart(send: SendFunction, toolName: string, callId: string, args: any): void {
  send({ type: 'tool', data: { tool: toolName, callId, args, status: 'running' } });
}

export function emitToolComplete(send: SendFunction, toolName: string, callId: string, args: any, result: any): void {
  send({ type: 'tool', data: { tool: toolName, callId, args, status: 'completed', result } });
}
```

**Improvements:**
- 🎯 **50+ duplicates → 12 utility functions**
- ✨ **Shorter, clearer code** in every file
- 🐛 **Consistent event format** across all events
- 📝 **Type-safe** parameters with TypeScript

---

### Example 5: Research Results Emission

**❌ BEFORE (100+ lines of duplication)**
```typescript
// Repeated for every tool that returns search results
if (result.ok && result.sources && Array.isArray(result.sources) && result.sources.length > 0) {
  if (result.query) {
    send({
      type: 'search_query',
      data: {
        query: result.query,
        provider: result.provider || 'custom',
        timestamp: Date.now(),
      },
    });
  }

  send({
    type: 'status',
    data: {
      message: result.sources.length === 0
        ? `Research completed but no external sources found.`
        : `Research completed. Found ${result.sources.length} sources.`,
      phase: 'executing',
      conversationId: conversationId,
    }
  });

  for (const hit of result.sources) {
    const rank = result.sources.indexOf(hit) + 1;
    if (rank <= 3) {
      send({
        type: 'citation',
        data: {
          title: hit.title || 'Untitled',
          url: hit.url || '',
          rank,
          reason: `Top ${rank} result for "${result.query}"`,
          score: hit.score || hit.relevance || 0,
          timestamp: Date.now(),
        },
      });
    }

    send({
      type: 'knowledge_hit',
      data: {
        title: hit.title || 'Untitled',
        url: hit.url || '',
        score: hit.score || hit.relevance || 0,
        excerpt: hit.snippet || hit.excerpt || '',
        snippet: hit.snippet || hit.excerpt || '',
        provider: result.provider || 'custom',
        publishedAt: hit.publishedAt || null,
        query: result.query || '',
        category: 'web',
        conversationId: conversationId,
      },
    });
  }
}
```

**✅ AFTER (single composite function)**
```typescript
// One line replaces 60+ lines
emitResearchSources(send, result.sources, result.query, result.provider, conversationId);
```

```typescript
// helpers/streamEmitter.ts
export function emitResearchSources(
  send: SendFunction,
  sources: any[],
  query: string,
  provider: string,
  conversationId?: string
): void {
  if (!sources || !Array.isArray(sources) || sources.length === 0) return;

  emitSearchQuery(send, query, provider);
  emitStatus(
    send,
    sources.length === 0
      ? `Research completed but no external sources found.`
      : `Research completed. Found ${sources.length} sources.`,
    'executing',
    conversationId
  );

  sources.forEach((hit, index) => {
    const rank = index + 1;
    if (rank <= 3) {
      emitCitation(send, {
        title: hit.title || 'Untitled',
        url: hit.url || '',
        rank,
        reason: `Top ${rank} result for "${query}"`,
        score: hit.score || hit.relevance || 0,
      });
    }

    emitKnowledgeHit(send, {
      title: hit.title || 'Untitled',
      url: hit.url || '',
      score: hit.score || hit.relevance || 0,
      excerpt: hit.snippet || hit.excerpt || '',
      snippet: hit.snippet || hit.excerpt || '',
      provider,
      publishedAt: hit.publishedAt || null,
      query,
      category: 'web',
      conversationId,
    });
  });
}
```

**Improvements:**
- 🎯 **60+ lines → 1 line** at call site (98% reduction)
- ✨ **Handles all edge cases** in one place
- 🐛 **Consistent behavior** across all research tools
- 📝 **Self-documenting** function name

---

## Law 3: Clear Naming

### Example 6: Function Naming

**❌ BEFORE (unclear, abbreviated)**
```typescript
// What do these functions do? Who knows!
async function process(ctx: any): Promise<any> {
  const res = await run(ctx);
  return res;
}

function check(input: any): boolean {
  return !!(input && input.data);
}

function get(r: any): string {
  let str = '';
  if (r.results) {
    for (const res of r.results) {
      str += res.content;
    }
  }
  return str;
}

function exec(t: string, args: any): Promise<any> {
  return tool.execute(t, args);
}

function handle(err: any): void {
  console.error(err);
}
```

**✅ AFTER (clear, descriptive)**
```typescript
// Crystal clear what each function does!
async function executeToolPipeline(context: ExecutionContext): Promise<ExecutionResult> {
  const executionResult = await runToolExecution(context);
  return executionResult;
}

function validateRequestStructure(request: Request): ValidationResult {
  if (!request || !request.data) {
    return { ok: false, error: 'Missing request data' };
  }
  return { ok: true };
}

function buildCodebaseContext(executionResults: ExecutionResult[]): string {
  const codeReadResults = extractCodeReadResults(executionResults);
  return formatCodeReadContext(codeReadResults);
}

async function executeUnifiedTool(
  toolName: string,
  toolArguments: any
): Promise<ToolExecutionResult> {
  return await executeTool(toolName, toolArguments);
}

function handleStreamError(
  send: SendFunction,
  error: unknown,
  context: ErrorContext
): void {
  const normalized = normalizeError(error);
  logError(context.component, normalized);
  emitError(send, normalized.message, context.operation || 'execution');
}
```

**Improvements:**
- 🎯 **Self-documenting:** Function names reveal intent
- ✨ **No abbreviations:** `context` not `ctx`, `result` not `res`
- 🧠 **Verb patterns:** validate*, extract*, build*, execute*, handle*
- 📝 **TypeScript types:** No `any`, all properly typed

---

### Example 7: Variable Naming

**❌ BEFORE (cryptic, abbreviated)**
```typescript
const ctx = getCtx();
const res = await exec(ctx);
const msg = format(res);
const cfg = getCfg();
const req = parse(msg);
const err = validate(req);
const data = process(req, cfg);
const obj = transform(data);
```

**✅ AFTER (clear, specific)**
```typescript
const executionContext = getExecutionContext();
const executionResult = await executeOperation(executionContext);
const formattedMessage = formatResultMessage(executionResult);
const pipelineConfig = getPipelineConfiguration();
const parsedRequest = parseUserRequest(formattedMessage);
const validationError = validateRequest(parsedRequest);
const processedData = processRequestWithConfig(parsedRequest, pipelineConfig);
const transformedResult = transformDataToResponse(processedData);
```

**Improvements:**
- 🎯 **Descriptive:** Every variable name explains its content
- ✨ **No abbreviations:** Full words make code self-documenting
- 🧠 **Specific:** `executionResult` not just `result`
- 📝 **Context-aware:** Names include the domain (execution, validation, pipeline)

---

### Example 8: Type/Interface Naming

**❌ BEFORE (inconsistent)**
```typescript
interface Input { /* ... */ }
interface Output { /* ... */ }
interface Settings { /* ... */ }
interface Params { /* ... */ }
interface Return { /* ... */ }
```

**✅ AFTER (consistent suffixes)**
```typescript
interface ToolExecutionInput { /* ... */ }
interface ToolExecutionResult { /* ... */ }
interface PipelineConfig { /* ... */ }
interface ValidationOptions { /* ... */ }
interface ExecutionResult { /* ... */ }
```

**Pattern:**
- `*Input` - Parameters for functions
- `*Result` - Return values from functions
- `*Config` - Configuration objects
- `*Options` - Optional parameters
- `*Context` - Execution context objects

---

## Summary: The Transformation

### Before
- ❌ 6-level nesting (impossible to follow)
- ❌ 95+ duplicate try/catch blocks
- ❌ 50+ duplicate send() calls
- ❌ Cryptic names (ctx, res, msg, err)
- ❌ 4,667-line monolithic file
- ❌ Functions 200+ lines long

### After
- ✅ 2-level nesting max (easy to follow)
- ✅ Single source of truth for errors
- ✅ Single source of truth for events
- ✅ Clear, descriptive names
- ✅ ~2,000-line orchestrator + focused helpers
- ✅ Functions <40 lines each

### The Result
**Code that a new developer can understand in under 2 minutes.**

That's the power of the 3 Laws of Readable Code.

---

**Ready to transform your code?**

Start with Phase 4.1: [`helpers/planValidator.ts`](./app/api/chat/stream/helpers/planValidator.ts)

Follow the TODOs and apply these principles!
