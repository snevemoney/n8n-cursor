# Power of 10: Safety Guidelines for Scorpion

**Adapted from NASA's Power of 10 Rules for TypeScript and Agent/Orchestrator Architecture**

## Overview

These 10 rules ensure safety, predictability, and maintainability in Scorpion's critical paths: `server/orchestrator`, `server/council`, and `server/tools`. These modules control agent behavior, tool execution, and multi-agent deliberation—areas where bugs can cause cascading failures.

---

## Rule 1: Avoid Direct or Mutual Recursion

**Rationale**: Recursion depth is unpredictable and can cause stack overflows. In orchestrator/council contexts, recursion can create infinite deliberation loops.

### ❌ Bad: Direct Recursion
```typescript
// BAD: Unbounded recursion
async function processPlan(plan: Plan, depth: number = 0): Promise<Result> {
  if (plan.needsRevision) {
    const revised = await revisePlan(plan);
    return processPlan(revised, depth + 1); // No max depth check
  }
  return { ok: true, plan };
}
```

### ✅ Good: Explicit Loop with State Machine
```typescript
// GOOD: Bounded iteration with explicit state
async function processPlan(plan: Plan): Promise<Result> {
  const MAX_ITERATIONS = 10;
  let current = plan;
  let iteration = 0;
  
  while (iteration < MAX_ITERATIONS && current.needsRevision) {
    current = await revisePlan(current);
    iteration++;
  }
  
  if (iteration >= MAX_ITERATIONS) {
    return { ok: false, error: 'Max revision iterations exceeded' };
  }
  
  return { ok: true, plan: current };
}
```

---

## Rule 2: All Loops Must Have Explicit Max-Iteration Counters

**Rationale**: Unbounded loops can hang the orchestrator, blocking all agent operations.

### ❌ Bad: Unbounded Loop
```typescript
// BAD: No max iteration counter
while (true) {
  const chunk = await reader.read();
  if (chunk.done) break;
  processChunk(chunk.value);
}
```

### ✅ Good: Bounded Loop
```typescript
// GOOD: Explicit max iterations
const MAX_ITERATIONS = 10000;
let iteration = 0;

while (iteration < MAX_ITERATIONS) {
  const chunk = await reader.read();
  if (chunk.done) break;
  processChunk(chunk.value);
  iteration++;
}

if (iteration >= MAX_ITERATIONS) {
  throw new Error('Stream exceeded max iterations');
}
```

---

## Rule 3: Functions in Critical Paths Must Be ≤ 60 Lines

**Rationale**: Long functions hide control flow, making bugs hard to spot. Critical paths need clarity.

### ❌ Bad: Monolithic Function
```typescript
// BAD: 200+ line function
async function runPlanner(userMessage: string, history: Message[], intent: Intent, ...) {
  // 50 lines of prompt loading
  // 50 lines of tool list generation
  // 50 lines of model calling
  // 50 lines of parsing and validation
}
```

### ✅ Good: Composed from Small Functions
```typescript
// GOOD: Split into focused helpers
async function runPlanner(input: PlannerInput): Promise<Plan> {
  const prompt = await loadPlannerPrompt();
  const toolsList = generateToolsList(input.tools, input.intent);
  const enrichedPrompt = enrichPrompt(prompt, toolsList, input.history);
  const response = await callPlannerModel(enrichedPrompt, input.objective);
  return parseAndValidatePlan(response, input.objective);
}

// Each helper is < 30 lines
function generateToolsList(tools: Record<string, Tool>, intent: Intent): string {
  // ... focused logic
}
```

---

## Rule 4: Never Ignore Promises

**Rationale**: Unhandled promise rejections can crash Node.js. In orchestrator context, this can stop all agent operations.

### ❌ Bad: Ignored Promise
```typescript
// BAD: Promise created but not awaited
function storeResult(result: CouncilResult) {
  storeCouncilResult(result, metadata); // No await, no .catch
}
```

### ✅ Good: Explicit Handling
```typescript
// GOOD: Explicit await or void with catch
async function storeResult(result: CouncilResult) {
  await storeCouncilResult(result, metadata).catch(err => {
    console.warn('[Council] Failed to store result:', err.message);
  });
}

// OR for fire-and-forget:
function storeResult(result: CouncilResult) {
  void storeCouncilResult(result, metadata).catch(err => {
    console.warn('[Council] Failed to store result:', err.message);
  });
}
```

---

## Rule 5: Minimize Use of `any` Type

**Rationale**: `any` disables type checking, hiding bugs. In orchestrator, tool args and results must be typed.

### ❌ Bad: Excessive `any`
```typescript
// BAD: Everything is any
async function executeTool(tool: string, args: any): Promise<any> {
  const result = await toolRegistry.get(tool).run(args);
  return result;
}
```

### ✅ Good: Typed Interfaces
```typescript
// GOOD: Explicit types
interface ToolArgs {
  query: string;
  depth: 'shallow' | 'medium' | 'deep';
  maxSites: number;
}

interface ToolResult {
  ok: boolean;
  data?: { sources: Source[] };
  error?: { code: string; message: string };
}

async function executeTool(tool: string, args: ToolArgs): Promise<ToolResult> {
  const toolImpl = toolRegistry.get(tool);
  if (!toolImpl) {
    return { ok: false, error: { code: 'UNKNOWN_TOOL', message: `Tool ${tool} not found` } };
  }
  return toolImpl.run(args);
}
```

---

## Rule 6: No Dynamic Code Execution (`eval`, `new Function`)

**Rationale**: Dynamic code execution is a security risk and makes code untraceable.

### ❌ Bad: Dynamic Execution
```typescript
// BAD: Dynamic code execution
function executeTool(toolName: string, code: string) {
  const fn = new Function('args', code);
  return fn(toolArgs);
}
```

### ✅ Good: Typed Registry
```typescript
// GOOD: Static registry
const toolRegistry = new Map<string, ToolImpl>();

toolRegistry.set('research', {
  run: async (args: ResearchArgs) => {
    // Static, typed implementation
  }
});

function executeTool(toolName: string, args: ToolArgs): Promise<ToolResult> {
  const tool = toolRegistry.get(toolName);
  if (!tool) throw new Error(`Tool ${toolName} not found`);
  return tool.run(args);
}
```

---

## Rule 7: No Global Mutable Singletons for Runtime State

**Rationale**: Global mutable state makes testing impossible and causes race conditions.

### ❌ Bad: Global Mutable State
```typescript
// BAD: Global mutable singleton
let currentPlan: Plan | null = null;
let executionState: ExecutionState = {};

export function setPlan(plan: Plan) {
  currentPlan = plan; // Global mutation
}
```

### ✅ Good: Passed Context Object
```typescript
// GOOD: Context passed explicitly
interface OrchestratorContext {
  plan: Plan;
  executionState: ExecutionState;
  conversationId: string;
}

async function runOrchestrator(
  userMessage: string,
  context: OrchestratorContext
): Promise<Result> {
  // All state in context, no globals
  const newPlan = await generatePlan(userMessage, context);
  return { ...context, plan: newPlan };
}
```

---

## Rule 8: Avoid Heavy Decorators or Metaprogramming

**Rationale**: Decorators hide control flow, making debugging difficult.

### ❌ Bad: Heavy Decorators
```typescript
// BAD: Control flow hidden in decorator
@Retry(maxAttempts: 3)
@Timeout(5000)
@LogExecution
async function executeTool(tool: string, args: any) {
  // What actually happens?
}
```

### ✅ Good: Explicit Control Flow
```typescript
// GOOD: Explicit retry/timeout logic
async function executeTool(tool: string, args: ToolArgs): Promise<ToolResult> {
  const MAX_ATTEMPTS = 3;
  const TIMEOUT_MS = 5000;
  
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const result = await Promise.race([
        toolImpl.run(args),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT_MS)
        )
      ]);
      return result;
    } catch (error) {
      if (attempt === MAX_ATTEMPTS - 1) throw error;
      await backoff(attempt);
    }
  }
}
```

---

## Rule 9: Add Invariant Assertions for Critical Assumptions

**Rationale**: Fail fast on invalid state. In orchestrator, invalid plans can cause cascading failures.

### ❌ Bad: Silent Failures
```typescript
// BAD: No validation
async function executePlan(plan: Plan) {
  for (const step of plan.plan) {
    await executeStep(step); // What if step.tool is undefined?
  }
}
```

### ✅ Good: Explicit Invariants
```typescript
// GOOD: Assertions for critical assumptions
function assertValidPlan(plan: Plan): asserts plan is ValidPlan {
  if (!plan.plan || !Array.isArray(plan.plan)) {
    throw new Error('Plan must have plan array');
  }
  for (const step of plan.plan) {
    if (!step.id || !step.title) {
      throw new Error(`Step missing required fields: ${JSON.stringify(step)}`);
    }
  }
}

async function executePlan(plan: Plan) {
  assertValidPlan(plan); // Fail fast
  for (const step of plan.plan) {
    await executeStep(step);
  }
}
```

---

## Rule 10: Use Explicit State Machines for Complex Control Flow

**Rationale**: State machines make transitions explicit and prevent invalid states.

### ❌ Bad: Implicit State Transitions
```typescript
// BAD: State managed with booleans
let isPlanning = false;
let isExecuting = false;
let isSummarizing = false;

async function runPipeline() {
  isPlanning = true;
  await plan();
  isPlanning = false;
  isExecuting = true;
  // What if plan() throws? State is inconsistent
}
```

### ✅ Good: Explicit State Machine
```typescript
// GOOD: Explicit state machine
type PipelineState = 
  | { phase: 'idle' }
  | { phase: 'planning' }
  | { phase: 'executing', plan: Plan }
  | { phase: 'summarizing', plan: Plan, results: Result[] }
  | { phase: 'error', error: Error };

class PipelineStateMachine {
  private state: PipelineState = { phase: 'idle' };
  
  async transition(newState: PipelineState) {
    // Validate transition
    if (!this.isValidTransition(this.state, newState)) {
      throw new Error(`Invalid transition from ${this.state.phase} to ${newState.phase}`);
    }
    this.state = newState;
  }
  
  private isValidTransition(from: PipelineState, to: PipelineState): boolean {
    // Explicit transition rules
    if (from.phase === 'idle' && to.phase === 'planning') return true;
    if (from.phase === 'planning' && to.phase === 'executing') return true;
    // ... etc
    return false;
  }
}
```

---

## Application Scope

These rules apply **especially** to:
- `server/orchestrator/` - Core orchestration logic
- `server/council/` - Multi-agent deliberation
- `server/tools/` - Tool execution layer
- `lib/orchestrator/` - Pipeline execution
- `packages/scorpion-core/src/orchestration/` - Core orchestrator class

Other areas (UI, utilities, tests) should follow these rules where applicable, but enforcement is strictest in the critical paths listed above.

---

## Enforcement

- **TypeScript**: `strict` mode, `noImplicitReturns`, `noUnusedLocals`
- **ESLint**: `@typescript-eslint/no-floating-promises`, `max-lines-per-function: 60` for critical directories
- **CI**: Treat warnings as errors
- **Code Review**: All PRs touching critical paths must pass these rules

---

## References

- Original: [NASA Power of 10 Rules](https://en.wikipedia.org/wiki/The_Power_of_10:_Rules_for_Developing_Safety-Critical_Code)
- Adapted for: TypeScript, Agent/Orchestrator Architecture, Multi-Agent Systems

