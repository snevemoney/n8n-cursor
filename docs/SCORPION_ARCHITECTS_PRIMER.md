# 🦂 SCORPION ARCHITECT'S PRIMER

**Use this when discussing design, refactoring, or architectural decisions.**

This is a specialized version for thinking about Scorpion's structure, evolution, and best practices.

---

## Design Principles

### 1. **Separation of Concerns**

Each module should have one clear responsibility:

- **Pipeline** (`lib/orchestrator/run-pipeline.ts`): Orchestrates phases, emits events
- **Tools** (`lib/tools/*.ts`): Implement specific tool logic
- **Agents** (`lib/agents/*.ts`): Define agent roles and expertise
- **Knowledge** (`lib/knowledge/*.ts`): Handle RAG and context retrieval
- **LLM Integration** (`lib/ai-ml/*.ts`): Abstract different LLM providers
- **Chat** (`app/api/chat/stream/route.ts`): Handle client communication
- **Types** (`packages/shared-types/`): Central type definitions

**Anti-pattern:**
```typescript
// ❌ Too much logic in one file
app/api/chat/stream/route.ts (1000+ lines with plan, council, tools, RAG, etc.)
```

**Better:**
```typescript
// ✅ Split into phases
lib/orchestrator/run-pipeline.ts
lib/orchestrator/phases/plan.ts
lib/orchestrator/phases/council.ts
lib/orchestrator/phases/tools.ts
// Each phase is ~100-200 lines
```

### 2. **Composition Over Inheritance**

Build Scorpion by composing small, focused modules:

```typescript
// ✅ Good: Compose functions
const pipeline = async (input) => {
  const plan = await executePlanPhase(input);
  const council = await executeCouncilPhase({...plan});
  const tools = await executeToolsPhase({...council});
  return { plan, council, tools };
};

// ❌ Bad: Inheritance chains
class Pipeline extends Orchestrator extends Agent { /* ... */ }
```

### 3. **Dependency Injection**

Pass dependencies in, don't import globally:

```typescript
// ✅ Good: Dependencies passed in
type PipelineInput = {
  modelPlan: (objective) => Promise<Plan>;
  modelCouncil: (objective, plan) => Promise<Council>;
  kbSearch: (query) => Promise<Results>;
  emit: Emit;
};

async function runPipeline(input: PipelineInput) {
  const plan = await input.modelPlan(input.objective);  // Use passed-in dependency
}

// ❌ Bad: Global imports
import { openaiClient } from "../ai-ml/openai";  // Hardcoded dependency
async function runPipeline(objective) {
  const plan = await openaiClient.chat(...);  // Can't swap providers
}
```

### 4. **Strong Typing**

Scorpion is TypeScript-first. Use types to encode business logic:

```typescript
// ✅ Good: Types encode invariants
type PhaseStatus = 
  | { status: "done"; payload: unknown }
  | { status: "skipped"; reason: string }
  | { status: "error"; error: { code: string; message: string } };

// Code can't represent invalid states
if (result.status === "error") {
  const msg = result.error.message;  // TypeScript knows this exists
}

// ❌ Bad: Weak typing
type PhaseStatus = { status: string; payload?: any; reason?: any; error?: any };
// Any of these could be undefined, logic becomes defensive
```

### 5. **Immutability by Default**

Don't mutate state; create new versions:

```typescript
// ✅ Good: Immutable phase results
const planResult = { status: "done" as const, payload: plan };
const councilResult = { status: "done" as const, payload: votes };
// Can replay history, easier to debug

// ❌ Bad: Mutating state
const phaseResult = { status: undefined };
phaseResult.status = "planning";  // Mutated, hard to trace
```

---

## Architecture Patterns

### The Pipeline Pattern

Scorpion's core is a **stage pipeline** where each stage is a phase:

```
Input → [Phase 1] → [Phase 2] → [Phase 3] → Output
         ↓          ↓          ↓
      Emit      Emit       Emit
   (to client) (to client) (to client)
```

**Advantages:**
- Clear, linear flow (easier to reason about)
- Each phase can be tested independently
- Easy to add new phases (e.g., "Refinement" after Result)
- Events streamed in real-time to client

**Extending:**

```typescript
// To add a new "Refinement" phase:
enum Phase {
  PLAN = "PLAN",
  COUNCIL = "COUNCIL",
  TOOLS = "TOOLS",
  KNOWLEDGE = "KNOWLEDGE",
  RESULT = "RESULT",
  REFINEMENT = "REFINEMENT"  // NEW
}

async function runPipeline(input: PipelineInput) {
  // ... existing phases ...
  
  const refinementResult = await executeRefinementPhase({
    objective: input.objective,
    result: resultOutput,
    emit: input.emit
  });
  
  return { ...all results };
}
```

### The Tool Registry Pattern

Tools are registered declaratively, selected dynamically:

```typescript
// Registry: Static declarations
const TOOL_REGISTRY: Tool[] = [
  { name: "code-analyzer", tags: ["code", "analyze"], execute: ... },
  { name: "rag-search", tags: ["knowledge", "search"], execute: ... }
];

// Selection: Dynamic matching
function selectToolsByTags(step: string): Tool[] {
  const keywords = extractKeywords(step);
  return TOOL_REGISTRY.filter(tool =>
    tool.tags.some(tag => keywords.includes(tag))
  );
}

// Execution: Generic
async function executeTools(tools: Tool[], context) {
  return Promise.all(tools.map(tool => tool.execute(context)));
}
```

**Advantages:**
- Easy to add/remove tools (just update registry)
- No hardcoded if/switch statements for tool selection
- Testable (mock registry for tests)

**Extending:**

```typescript
// Add a new tool:
const newTool: Tool = {
  name: "document-analyzer",
  description: "Analyze documents and extract insights",
  tags: ["document", "analyze", "extract"],  // Keywords matched in plan
  inputSchema: { /* ... */ },
  execute: async (input) => { /* ... */ }
};

TOOL_REGISTRY.push(newTool);  // Done! Automatically included

// It will be selected when plan has steps like:
// "Analyze the document and extract key insights"
//  ↑ Matches tag "analyze"
```

### The Agent Roles Pattern

Agents are role-based, not behavior-based:

```typescript
// ✅ Good: Define by role
type Agent = {
  name: string;
  role: string;  // E.g., "Architectural reviewer"
  systemPrompt: string;  // The actual instruction
  expertise: string[];  // Areas of knowledge
};

const architect: Agent = {
  name: "Architect",
  role: "Critiques system design, modularity, maintainability",
  systemPrompt: "You are an experienced systems architect...",
  expertise: ["design", "patterns", "scalability"]
};

// Usage: Generic
async function getAgentVote(agent: Agent, objective, plan) {
  return llm.chat({
    system: agent.systemPrompt,
    user: `${objective}\n\nPlan:\n${plan}`,
    temperature: 0.7
  });
}

// ❌ Bad: Behavior-hardcoded
class ArchitectAgent { }
class SecurityAgent { }
class PragmatistAgent { }
// Hard to swap, test, or add new agents
```

---

## Refactoring Opportunities

### Current State → Future State

#### 1. **Phase Factory Pattern**

**Current:**
```typescript
// Each phase is hardcoded in run-pipeline.ts
async function runPipeline(input) {
  const plan = await executePlanPhase(input);
  const council = await executeCouncilPhase(input);
  const tools = await executeToolsPhase(input);
  // ... 100+ lines of orchestration
}
```

**Better:**
```typescript
// Define phases declaratively
const PHASES: Phase[] = [
  {
    name: "PLAN",
    execute: executePlanPhase,
    shouldSkip: (context) => context.isSimpleQuery
  },
  {
    name: "COUNCIL",
    execute: executeCouncilPhase,
    shouldSkip: (context) => context.stepCount <= 1
  },
  // ...
];

// Generic executor
async function runPipeline(input: PipelineInput) {
  const context = { /* ... */ };
  const results = {};
  
  for (const phase of PHASES) {
    if (phase.shouldSkip?.(context)) {
      emit({ type: "phase.skipped", phase: phase.name });
      continue;
    }
    
    results[phase.name] = await phase.execute({ ...input, previousResults: results });
  }
  
  return results;
}
```

**Benefit:** Adding a new phase (e.g., "Refinement") is 1 line, not 20.

#### 2. **Event Store Pattern**

**Current:**
- Events emitted to client
- Persisted ad-hoc to DB

**Better:**
```typescript
// Centralized event store
class EventStore {
  private events: Event[] = [];
  
  async append(event: Event) {
    this.events.push(event);
    await db.insert(event);  // Durable
    this.emitter.emit("event", event);  // Broadcast
  }
  
  async getHistory(conversationId) {
    return db.query("events", { conversationId });
  }
  
  // Replay for debugging
  async replay(conversationId) {
    const events = await this.getHistory(conversationId);
    return events;
  }
}

// Usage
const eventStore = new EventStore();
eventStore.append({ type: "phase.start", phase: "PLAN" });
// Automatically saved + broadcast
```

**Benefit:** Full audit trail, replay support, consistent persistence.

#### 3. **Tool Capability Matching**

**Current:**
- Match tools by simple tag keywords

**Better:**
```typescript
// Semantic matching (if needed for complex scenarios)
type ToolCapability = {
  name: string;
  canHandle: (step: string, context: Context) => Promise<boolean>;
};

async function selectTools(step, context) {
  const candidates = TOOL_REGISTRY.filter(tool => 
    tool.tags.some(tag => step.toLowerCase().includes(tag))
  );
  
  const capable = await Promise.all(
    candidates.map(async tool => ({
      tool,
      match: await tool.canHandle?.(step, context) ?? true
    }))
  );
  
  return capable.filter(c => c.match).map(c => c.tool);
}

// Example: Tool can be smarter about whether to handle a request
const codeAnalyzerTool: Tool = {
  name: "code-analyzer",
  canHandle: async (step, context) => {
    // Only if context has code files
    return context.projectFiles?.some(f => f.endsWith('.ts')) ?? false;
  },
  execute: async (input) => { /* ... */ }
};
```

**Benefit:** More intelligent tool selection, less fragile matching.

#### 4. **Agent Specialization**

**Current:**
- Council members are generic voices voting on plan

**Better:**
```typescript
// Agent specialization with context awareness
type AgentSpecialist = {
  name: string;
  role: string;
  expertise: string[];
  // Only votes if context is relevant
  shouldParticipate: (objective, context) => boolean;
  // Custom voting logic per agent
  vote: (objective, plan, context) => Promise<Vote>;
};

const securityAgent: AgentSpecialist = {
  name: "Security",
  expertise: ["security", "auth", "encryption"],
  shouldParticipate: (objective, context) => {
    // Only vote if objective mentions sensitive areas
    return /password|secret|key|auth|security/i.test(objective);
  },
  vote: async (objective, plan, context) => {
    // Custom logic for security review
    return await llm.chat({
      system: SECURITY_PROMPT,
      user: `${objective}\n\n${plan}\n\nContext: ${JSON.stringify(context)}`
    });
  }
};
```

**Benefit:** Smarter agent participation, context-aware reviews.

---

## Best Practices

### ✅ DO

- **Type everything**: Use TypeScript interfaces for config, events, results
- **Emit events**: Use `emit()` at key checkpoints (phase start/end, tool calls)
- **Handle errors gracefully**: Return error shapes, don't throw silently
- **Test in isolation**: Each phase, tool, agent should be testable independently
- **Document invariants**: Comments like "Plan always has steps > 0"
- **Use const declarations**: Favor `const` for immutable config, data
- **Dependency inject**: Pass dependencies, don't import globally
- **Version APIs**: If changing request/response, version the endpoint

### ❌ DON'T

- **Hardcode LLM calls**: Always go through LLM router for flexibility
- **Mutate input objects**: Create new objects, don't modify parameters
- **Silent failures**: Log errors, emit error events
- **Skip error handling**: "It should never happen" → 2am pager alert
- **Create monolithic files**: >500 lines → split into helpers
- **Add global state**: Use context/DI instead
- **Ignore types**: `any` is an anti-pattern
- **Block on external APIs**: Use timeouts, circuit breakers for remote calls

---

## Scaling Patterns

As Scorpion grows, consider:

### 1. **Worker Queues** (BullMQ)

For long-running operations:

```typescript
// Instead of: await executeToolAsync(...)
// Use: queue.add('execute-tool', { tool, input })

const toolQueue = new Queue('tool-execution', {
  connection: redis
});

toolQueue.process(async (job) => {
  const { tool, input } = job.data;
  return await executeTool(tool, input);
});

// Emit progress:
toolQueue.on('progress', (progress) => {
  emit({ type: 'tool.progress', percentage: progress });
});
```

**Benefit:** Non-blocking execution, retries, progress tracking.

### 2. **Caching Layer**

For repeated queries:

```typescript
type CacheOptions = { ttl?: number; strategy: 'lru' | 'lfu' | 'fifo' };

class Cache {
  get(key: string): T | null { /* ... */ }
  set(key: string, value: T, options: CacheOptions) { /* ... */ }
}

// Usage:
const cachedRagSearch = async (query, options) => {
  const cacheKey = `rag:${query}`;
  
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  const result = await ragSearch(query, options);
  cache.set(cacheKey, result, { ttl: 3600 });  // 1 hour
  
  return result;
};
```

**Benefit:** Faster responses, reduced external API calls.

### 3. **Agent Pool**

For concurrent agent voting:

```typescript
// Instead of sequential council calls
// Use concurrent pool

class AgentPool {
  async executeParallel(agents: Agent[], task: Task) {
    return Promise.allSettled(
      agents.map(agent => this.executeAgent(agent, task))
    );
  }
}

// Usage:
const councilResults = await agentPool.executeParallel(
  councilMembers,
  { objective, plan }
);
```

**Benefit:** Faster council deliberation, more parallelism.

### 4. **Streaming Responses**

For long-running pipelines:

```typescript
// Emit partial results as each phase completes
response = new Response(
  new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      await runPipeline({
        emit: (event) => {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));
        }
      });
      
      controller.close();
    }
  }),
  { headers: { 'Content-Type': 'text/event-stream' } }
);
```

**Benefit:** Real-time feedback, better UX for long operations.

---

## Decision Framework

When deciding whether to refactor/change Scorpion:

**Ask:**

1. **Does it reduce complexity?** (fewer lines, fewer concepts)
2. **Does it improve testability?** (easier to write tests)
3. **Does it maintain flexibility?** (easier to swap providers, add features)
4. **Does it respect existing flows?** (doesn't break Planner → Council → Tools → Result)
5. **Is it worth the effort?** (benefits > rewrite cost)

**Example: Event Store Pattern**

- ✅ Reduces complexity: Centralized event handling
- ✅ Improves testability: Can test events in isolation
- ✅ Maintains flexibility: Easy to change storage backend
- ✅ Respects flows: Doesn't change pipeline logic
- ✅ Worth it: Used by many systems (Event Sourcing), proven pattern

**Example: Kubernetes Migration**

- ✅ Scales better: Horizontal scaling
- ❓ Reduces complexity: Adds operational complexity (k8s, monitoring)
- ✅ Improves testability: Can test each pod separately
- ✅ Maintains flexibility: Easy to deploy anywhere
- ❌ Worth it? (Only if you need the scale. Otherwise, overhead)

---

## Code Review Checklist

When reviewing Scorpion PRs:

- [ ] **Types**: All functions have typed inputs/outputs
- [ ] **Events**: Important operations emit events
- [ ] **Errors**: Errors are caught and logged
- [ ] **DI**: Dependencies are injected, not imported globally
- [ ] **Tests**: New logic has tests (>70% coverage)
- [ ] **Docs**: Non-obvious code has comments explaining "why"
- [ ] **No mutations**: No unexpected state changes
- [ ] **Naming**: Function/variable names are clear
- [ ] **Size**: Files are <300 lines (not monolithic)
- [ ] **Separation**: Each module has one responsibility

---

## Reading List

Patterns used in Scorpion:

- **Pipeline Pattern**: Continuous Delivery (book by Humble & Farley)
- **Event Sourcing**: Microsoft Azure patterns
- **Dependency Injection**: Clean Architecture (Uncle Bob)
- **Tool Registry**: Strategy Pattern (Gang of Four)
- **Immutability**: Functional Programming in JavaScript

---

**Last Updated**: 2025-01-27  
**For architecture questions**: Reference this doc or start a new chat with the Short Primer + this guide
