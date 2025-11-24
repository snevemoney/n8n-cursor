# Power of 10 Refactoring Patches

This document provides concrete refactoring examples for representative violations. Apply these patterns to similar violations throughout the codebase.

---

## Patch 1: Fix Unbounded Loop in `modelRunner.ts`

### File: `apps/scorpion/lib/chat/modelRunner.ts`

**Violation**: `while (true)` without max iteration counter (Rule 2)

### Before:
```typescript
if (reader) {
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          if (data.error) {
            throw new Error(`Ollama error: ${data.error}`);
          }
          if (data.message?.content) {
            const content = data.message.content;
            fullContent += content;
            onChunk(content);
          }
        } catch (e: any) {
          if (e.message && !e.message.includes('JSON')) {
            throw e;
          }
        }
      }
    }
  } catch (readError: any) {
    // ...
  }
}
```

### After:
```typescript
if (reader) {
  try {
    const MAX_ITERATIONS = 10000; // Power of 10: explicit max iterations
    let iteration = 0;
    
    while (iteration < MAX_ITERATIONS) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          if (data.error) {
            throw new Error(`Ollama error: ${data.error}`);
          }
          if (data.message?.content) {
            const content = data.message.content;
            fullContent += content;
            onChunk(content);
          }
        } catch (e: any) {
          if (e.message && !e.message.includes('JSON')) {
            throw e;
          }
        }
      }
      
      iteration++;
    }
    
    if (iteration >= MAX_ITERATIONS) {
      throw new Error(`Stream processing exceeded max iterations (${MAX_ITERATIONS})`);
    }
  } catch (readError: any) {
    // ...
  }
}
```

**Apply to**: All `while (true)` loops in:
- `apps/scorpion/lib/chat/modelRunner.ts` (4 instances)
- `apps/scorpion/app/(scorpion)/chat/hooks/useChatStream.ts`
- `apps/scorpion/app/(scorpion)/council/page.tsx`

---

## Patch 2: Split Long Function - `runPlanner()`

### File: `packages/scorpion-core/src/orchestration/ScorpionOrchestrator.ts`

**Violation**: Function >200 lines (Rule 3)

### Before:
```typescript
async runPlanner(
  userMessage: string,
  conversationHistory: Message[],
  intent: ScorpionIntent,
  send: EventCallback,
  checkAbort: AbortChecker,
  tools: any,
  tracker?: any,
  customPrompt?: string
): Promise<Plan> {
  // 200+ lines of mixed concerns
  checkAbort();
  send({ type: 'status', data: { message: 'Analyzing request...', phase: 'planning' } });
  // ... 50 lines of prompt loading
  // ... 50 lines of tool list generation
  // ... 50 lines of model calling
  // ... 50 lines of parsing and validation
  return plan;
}
```

### After:
```typescript
// Split into focused helpers (each < 60 lines)

/**
 * Load planner prompt from file system
 */
private async loadPlannerPrompt(customPrompt?: string): Promise<string> {
  if (customPrompt) {
    return customPrompt;
  }
  
  const promptPath = getPromptPath('planner.system.txt');
  if (!existsSync(promptPath)) {
    throw new Error(`Planner prompt file not found: ${promptPath}`);
  }
  
  const prompt = readFileSync(promptPath, 'utf-8');
  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Planner prompt file is empty');
  }
  
  return prompt;
}

/**
 * Generate tools list string for prompt injection
 */
private generateToolsList(
  tools: Record<string, unknown>,
  intent: ScorpionIntent
): string {
  const allowedTools = this.getToolsForIntent(intent);
  
  if (intent === 'small_talk') {
    return '\n=== AVAILABLE AI-CALLABLE TOOLS (GATED BY INTENT) ===\n' +
           'INTENT: small_talk - NO TOOLS AVAILABLE\n' +
           'You should respond conversationally without using any tools.\n\n';
  }
  
  let toolsList = `\n=== AVAILABLE AI-CALLABLE TOOLS (GATED BY INTENT) ===\n`;
  toolsList += `INTENT: ${intent} - ${allowedTools.length} tools available\n`;
  
  // ... tool enumeration logic (30 lines)
  
  return toolsList;
}

/**
 * Enrich prompt with conversation history and file context
 */
private enrichPromptWithContext(
  prompt: string,
  conversationHistory: Message[],
  tracker?: any
): string {
  if (conversationHistory.length > 0) {
    const historyText = `\n\n=== CONVERSATION HISTORY ===\n` +
      `${conversationHistory.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}\n`;
    prompt += historyText;
  }
  
  if (tracker && this.config.conversationId) {
    try {
      const fileContext = tracker.getContextForPlanner(this.config.conversationId, 10);
      if (fileContext) {
        prompt += fileContext;
      }
    } catch (e) {
      console.warn('[Orchestrator] Error getting file context:', e);
    }
  }
  
  return prompt;
}

/**
 * Call planner model and get response
 */
private async callPlannerModel(
  prompt: string,
  userMessage: string,
  conversationHistory: Message[]
): Promise<string> {
  const lightweightMode = this.config.lightweightMode || false;
  const defaultMaxTokens = lightweightMode ? 600 : 2000;
  const defaultTemp = lightweightMode ? 0.05 : 0.1;
  const defaultModel = this.config.defaultModel || this.config.model || 'llama3.1:8b';
  
  send({ type: 'progress', data: { phase: 'planning', progress: 60, message: 'Parsing plan...' } });
  
  const response = await this.runModelUnified(
    prompt,
    userMessage,
    {
      provider: this.config.provider || 'ollama',
      model: defaultModel,
      maxTokens: defaultMaxTokens,
      temperature: defaultTemp
    },
    undefined,
    conversationHistory
  );
  
  if (!response || response.trim().length === 0) {
    throw new Error('Empty response from planner model');
  }
  
  return response;
}

/**
 * Parse and validate plan from model response
 */
private parseAndValidatePlan(
  planResponse: string,
  userMessage: string
): Plan {
  let plan: Plan;
  
  try {
    plan = this.parseModelJSON<Plan>(planResponse);
    
    // Validate plan structure
    if (!plan || typeof plan !== 'object') {
      throw new Error('Invalid plan: not an object');
    }
    
    if (!plan.plan || !Array.isArray(plan.plan)) {
      throw new Error('Invalid plan: missing plan steps array');
    }
    
    if (!plan.objective) {
      plan.objective = userMessage;
    }
    
    // Ensure needsCouncil is set
    if (plan.needsCouncil === undefined) {
      plan.needsCouncil = plan.plan.length > 3 || 
        plan.plan.some((step: PlanStep) => step.tool && step.tool !== 'none');
    }
    
    // Ensure all steps have required fields
    plan.plan = plan.plan.map((step: PlanStep, index: number) => {
      if (!step.id) step.id = `s${index + 1}`;
      if (!step.title) step.title = step.description || `Step ${index + 1}`;
      return step;
    });
    
  } catch (error: any) {
    console.warn('[Orchestrator] Plan parsing failed, using fallback:', error.message?.substring(0, 100));
    plan = this.createFallbackPlan(userMessage);
  }
  
  return plan;
}

/**
 * Create fallback plan when parsing fails
 */
private createFallbackPlan(userMessage: string): Plan {
  return {
    objective: userMessage,
    assumptions: [],
    plan: [{
      id: 's1',
      title: 'Respond to user',
      tool: 'none',
    }],
    done_when: ['User receives response'],
    needsCouncil: false,
    questionType: 'casual',
    councilRationale: 'Fallback plan - parsing failed (will be corrected by enforcement)'
  };
}

/**
 * Main planner entry point (now < 40 lines)
 */
async runPlanner(
  userMessage: string,
  conversationHistory: Message[],
  intent: ScorpionIntent,
  send: EventCallback,
  checkAbort: AbortChecker,
  tools: any,
  tracker?: any,
  customPrompt?: string
): Promise<Plan> {
  checkAbort();
  send({ type: 'status', data: { message: 'Analyzing request...', phase: 'planning' } });
  send({ type: 'progress', data: { phase: 'planning', progress: 10, message: 'Analyzing request...' } });
  
  // Load prompt
  let plannerPrompt = await this.loadPlannerPrompt(customPrompt);
  
  // Generate tools list if not using custom prompt
  if (!customPrompt) {
    const toolsList = this.generateToolsList(tools, intent);
    plannerPrompt = plannerPrompt.replace('{{TOOLS_LIST}}', toolsList);
  }
  
  // Enrich with context
  plannerPrompt = this.enrichPromptWithContext(plannerPrompt, conversationHistory, tracker);
  
  // Call model
  const planResponse = await this.callPlannerModel(plannerPrompt, userMessage, conversationHistory);
  
  // Parse and validate
  const plan = this.parseAndValidatePlan(planResponse, userMessage);
  
  send({ type: 'progress', data: { phase: 'planning', progress: 100, message: 'Plan created successfully' } });
  send({ type: 'plan', data: plan });
  
  return plan;
}
```

**Apply to**: Similar long functions in:
- `runExecutor()` (163 lines)
- `runSummarizer()` (99 lines)
- `apps/scorpion/server/orchestrator/executor.ts:runTool()` (165 lines)

---

## Patch 3: Fix Ignored Promise

### File: `apps/scorpion/server/council/index.ts`

**Violation**: Promise created but not explicitly handled (Rule 4)

### Before:
```typescript
// Store result asynchronously (don't await to avoid blocking)
if (input.userId || input.conversationId || input.missionId) {
  storeCouncilResult(result, {
    userId: input.userId,
    conversationId: input.conversationId,
    missionId: input.missionId,
  }).catch((err) => {
    console.warn('[Council] Failed to store result:', err.message);
  });
}
```

### After:
```typescript
// Store result asynchronously (fire-and-forget with explicit void)
if (input.userId || input.conversationId || input.missionId) {
  void storeCouncilResult(result, {
    userId: input.userId,
    conversationId: input.conversationId,
    missionId: input.missionId,
  }).catch((err) => {
    console.warn('[Council] Failed to store result:', err.message);
  });
}
```

**Apply to**: Similar patterns in:
- `apps/scorpion/lib/shared-stores.ts:110`
- `apps/scorpion/server/orchestrator/index.ts`

---

## Patch 4: Replace Global Mutable State with Context

### File: `apps/scorpion/lib/shared-stores.ts`

**Violation**: Global mutable singletons (Rule 7)

### Before:
```typescript
let ragStore: RAGStore | null = null;
let ontologyStore: OntologyStore | null = null;
let orchestrator: ProjectKnowledgeOrchestrator | null = null;
let initialized = false;
let dataDir: string | null = null;
let initializationPromise: Promise<void> | null = null;

export async function getRAGStore(): Promise<RAGStore> {
  if (ragStore) return ragStore;
  // ... initialization logic with global mutation
}
```

### After:
```typescript
/**
 * Store context - encapsulates all mutable state
 */
interface StoreContext {
  ragStore: RAGStore | null;
  ontologyStore: OntologyStore | null;
  orchestrator: ProjectKnowledgeOrchestrator | null;
  initialized: boolean;
  dataDir: string | null;
  initializationPromise: Promise<void> | null;
}

/**
 * Factory function - creates new context per request/scope
 */
function createStoreContext(): StoreContext {
  return {
    ragStore: null,
    ontologyStore: null,
    orchestrator: null,
    initialized: false,
    dataDir: null,
    initializationPromise: null,
  };
}

/**
 * Singleton context (for backward compatibility)
 * TODO: Migrate to dependency injection
 */
let globalContext = createStoreContext();

/**
 * Get RAG store with explicit context
 */
async function getRAGStoreWithContext(context: StoreContext): Promise<RAGStore> {
  if (context.ragStore) return context.ragStore;
  
  if (context.initializationPromise) {
    await context.initializationPromise;
    return context.ragStore!;
  }
  
  context.initializationPromise = (async () => {
    if (!context.dataDir) {
      await initializeStorageConfig();
      context.dataDir = await getDataDir();
    }
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    context.ragStore = new RAGStore(ollamaUrl, context.dataDir!);
    await context.ragStore.initialize();
  })();
  
  await context.initializationPromise;
  return context.ragStore!;
}

/**
 * Public API (backward compatible, uses global context)
 * TODO: Deprecate in favor of context-based API
 */
export async function getRAGStore(): Promise<RAGStore> {
  return getRAGStoreWithContext(globalContext);
}

/**
 * New API: Get stores with explicit context
 * Use this in new code
 */
export async function getStoresWithContext(context: StoreContext = createStoreContext()) {
  return {
    ragStore: await getRAGStoreWithContext(context),
    ontologyStore: await getOntologyStoreWithContext(context),
    orchestrator: await getOrchestratorWithContext(context),
  };
}
```

**Apply to**: Similar patterns in:
- `apps/scorpion/server/orchestrator/executor.ts` (scratchpads Map)

---

## Patch 5: Replace `any` with Typed Interfaces

### File: `apps/scorpion/server/orchestrator/executor.ts`

**Violation**: Excessive `any` types (Rule 5)

### Before:
```typescript
function normalizeError(error: any, defaultCode: string = 'RUNTIME_ERROR'): ToolERR {
  // ... uses any
}

async function runTool(
  conversationId: string,
  tool: string,
  args: Record<string, unknown>,
): Promise<ToolResult<any>> {
  // ... uses any
  let lastError: any = null;
  
  try {
    // ...
  } catch (e: any) {
    // ...
  }
}
```

### After:
```typescript
/**
 * Typed error union for normalization
 */
type NormalizableError = 
  | ToolERR
  | { ok: false; error: string; meta?: unknown }
  | { ok: false; error: { code: string; message: string } }
  | Error
  | string
  | unknown;

/**
 * Normalize error with explicit type handling
 */
function normalizeError(
  error: NormalizableError,
  defaultCode: string = 'RUNTIME_ERROR'
): ToolERR {
  // If already in ToolERR format, return as-is
  if (
    error &&
    typeof error === 'object' &&
    'ok' in error &&
    error.ok === false &&
    'error' in error &&
    typeof error.error === 'object' &&
    error.error !== null &&
    'code' in error.error
  ) {
    return error as ToolERR;
  }
  
  // Handle old format (error: string)
  if (
    error &&
    typeof error === 'object' &&
    'ok' in error &&
    error.ok === false &&
    typeof (error as { error: unknown }).error === 'string'
  ) {
    const oldFormat = error as { error: string; meta?: unknown };
    return {
      ok: false,
      error: {
        code: (oldFormat.meta as { code?: string })?.code || defaultCode,
        message: oldFormat.error,
        details: (oldFormat.meta as { details?: unknown })?.details,
      },
      meta: oldFormat.meta,
    };
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return {
      ok: false,
      error: {
        code: defaultCode,
        message: error,
      },
    };
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    return {
      ok: false,
      error: {
        code: error.name || defaultCode,
        message: error.message || String(error),
        details: error.stack,
      },
    };
  }
  
  // Fallback
  return {
    ok: false,
    error: {
      code: defaultCode,
      message: String(error || 'Unknown error'),
    },
  };
}

/**
 * Typed tool result (no any)
 */
async function runTool<T = unknown>(
  conversationId: string,
  tool: string,
  args: Record<string, unknown>,
): Promise<ToolResult<T>> {
  // ... implementation with typed error handling
  let lastError: NormalizableError | null = null;
  
  try {
    // ...
  } catch (e: unknown) {
    lastError = e;
    // ... handle with normalizeError
  }
}
```

**Apply to**: All files with `any` types in:
- `packages/scorpion-core/src/orchestration/ScorpionOrchestrator.ts`
- `apps/scorpion/server/orchestrator/council/legacy.ts`
- `apps/scorpion/lib/orchestrator/run-pipeline.ts`
- All other files listed in violations report

---

## Patch 6: Add Invariant Assertions

### File: `packages/scorpion-core/src/orchestration/ScorpionOrchestrator.ts`

**Violation**: Missing assertions for critical assumptions (Rule 9)

### Before:
```typescript
async runExecutor(
  plan: Plan,
  intent: ScorpionIntent,
  userMessage: string,
  send: EventCallback,
  checkAbort: AbortChecker
): Promise<any[]> {
  const results: any[] = [];
  const totalSteps = plan.plan.filter(s => s.tool !== 'none').length;
  
  for (const step of plan.plan) {
    // What if step.tool is undefined? What if step.id is missing?
    await executeStep(step);
  }
}
```

### After:
```typescript
/**
 * Assert plan is valid before execution
 */
function assertValidPlan(plan: Plan): asserts plan is ValidPlan {
  if (!plan || typeof plan !== 'object') {
    throw new Error('Plan must be an object');
  }
  
  if (!plan.plan || !Array.isArray(plan.plan)) {
    throw new Error('Plan must have plan array');
  }
  
  if (plan.plan.length === 0) {
    throw new Error('Plan must have at least one step');
  }
  
  for (const step of plan.plan) {
    if (!step.id || typeof step.id !== 'string') {
      throw new Error(`Step missing required id: ${JSON.stringify(step)}`);
    }
    
    if (!step.title || typeof step.title !== 'string') {
      throw new Error(`Step missing required title: ${JSON.stringify(step)}`);
    }
    
    // tool can be 'none' or a string, but must be defined
    if (step.tool === undefined) {
      throw new Error(`Step missing tool field: ${JSON.stringify(step)}`);
    }
  }
}

interface ValidPlan extends Plan {
  plan: Array<PlanStep & { id: string; title: string; tool: string }>;
}

async runExecutor(
  plan: Plan,
  intent: ScorpionIntent,
  userMessage: string,
  send: EventCallback,
  checkAbort: AbortChecker
): Promise<Result[]> {
  // Fail fast on invalid plan
  assertValidPlan(plan);
  
  const results: Result[] = [];
  const totalSteps = plan.plan.filter(s => s.tool !== 'none').length;
  
  for (const step of plan.plan) {
    // TypeScript now knows step has required fields
    checkAbort();
    if (step.tool === 'none') continue;
    
    // ... rest of execution
  }
  
  return results;
}
```

**Apply to**: All entry points in:
- `runPlanner()`
- `runExecutor()`
- `runCouncil()`
- `runSummarizer()`

---

## Summary

These patches demonstrate the refactoring patterns for all 10 rules:

1. ✅ **Rule 1**: No recursion found (good!)
2. ✅ **Rule 2**: Add max iteration counters to loops
3. ✅ **Rule 3**: Split long functions into focused helpers
4. ✅ **Rule 4**: Add `void` prefix or await for promises
5. ✅ **Rule 5**: Replace `any` with typed interfaces
6. ✅ **Rule 6**: No `eval`/`new Function` found (good!)
7. ✅ **Rule 7**: Replace globals with context objects
8. ✅ **Rule 8**: No heavy decorators found (good!)
9. ✅ **Rule 9**: Add invariant assertions
10. ✅ **Rule 10**: Use explicit state machines (see Patch 2 for pattern)

Apply these patterns systematically to all violations listed in the violations report.

