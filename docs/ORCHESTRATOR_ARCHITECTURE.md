# Scorpion Orchestrator Architecture

## Overview

The `ScorpionOrchestrator` centralizes Scorpion's 4-phase pipeline logic, making the "brain on top" architecture explicit in code.

## Structure

### Core Module: `packages/scorpion-core/src/orchestration/`

- **`ScorpionOrchestrator.ts`** - Main orchestrator class
- **`index.ts`** - Exports

### Key Components

1. **ScorpionOrchestrator Class**
   - Encapsulates the 4-phase pipeline:
     - PHASE 1: PLANNER - Analyzes intent and generates execution plan
     - PHASE 2: COUNCIL - Expert review (conditional, based on plan.needsCouncil)
     - PHASE 3: EXECUTOR - Executes plan steps sequentially
     - PHASE 4: SUMMARIZER - Synthesizes final answer from results

2. **Agent Registry Integration**
   - Uses `getCouncilMembers()` from `packages/scorpion-core/src/agents/registry.ts`
   - All 9 council members and 8 specialized agents are registered
   - Registry provides metadata for introspection, routing, and UI display

## Design Decisions

### Dependency Injection

The orchestrator uses dependency injection to avoid coupling to app-specific implementations:

```typescript
interface OrchestratorConfig {
  // Core config
  provider?: string;
  model?: string;
  conversationId?: string;
  lightweightMode?: boolean;
  defaultModel?: string;
  
  // Injected dependencies from app
  runModelUnified: (prompt: string, context: string, config: any, stream?: any, history?: Message[]) => Promise<string>;
  parseModelJSON: <T>(response: string) => T;
  runCouncilDeliberationStreaming: (plan: Plan, modelConfig: any, onEvent: (event: any) => void, knowledgeHits?: any[]) => Promise<any[]>;
  computeConsensus: (votes: any[], isCasual: boolean, userMessage: string) => any;
  executeTool: (tool: string, args: any) => Promise<any>;
  remember: (conversationId: string, content: string) => void;
  classifyIntent: (message: string) => ScorpionIntent;
  getToolsForIntent: (intent: ScorpionIntent) => string[];
  shouldUseKnowledgeBase: (intent: ScorpionIntent) => boolean;
}
```

This allows the orchestrator to:
- Live in `scorpion-core` (shared package)
- Work with app-specific implementations
- Be testable in isolation
- Avoid circular dependencies

### Type Definitions

The orchestrator defines its own types that match the app's types:
- `Plan`, `PlanStep` - Execution plan structure
- `Message` - Chat message structure
- `ScorpionIntent` - Intent classification types

## Integration Example

### Route Integration (Simplified)

```typescript
// apps/scorpion/app/api/chat/stream/route.ts
import { ScorpionOrchestrator } from '@scorpion/core';
import { runModelUnified, parseModelJSON } from '@/lib/chat/modelRunner';
import { runCouncilDeliberationStreaming, computeConsensus } from '@/lib/chat/council';
import { executeTool } from '@/lib/chat/tools';
import { remember } from '@/lib/chat/memory';
import { classifyIntent, getToolsForIntent, shouldUseKnowledgeBase } from '@/lib/chat/intent';

export async function POST(req: NextRequest) {
  // ... request parsing, validation, streaming setup ...
  
  const orchestrator = new ScorpionOrchestrator({
    provider,
    model: defaultModel,
    conversationId,
    lightweightMode,
    defaultModel,
    // Inject dependencies
    runModelUnified,
    parseModelJSON,
    runCouncilDeliberationStreaming,
    computeConsensus,
    executeTool,
    remember,
    classifyIntent,
    getToolsForIntent,
    shouldUseKnowledgeBase,
  });
  
  try {
    const context = await orchestrator.handleChat(
      userMessage,
      conversationHistory,
      send, // Event callback for streaming
      checkAbort, // Abort checker
      tools, // Available tools
      tracker // Optional file tracker
    );
    
    // Stream the final summary
    if (context.finalSummary) {
      // Stream summary in chunks
      const words = context.finalSummary.split(' ');
      for (let i = 0; i < words.length; i += 15) {
        const chunk = words.slice(i, i + 15).join(' ');
        send({ type: 'delta', data: { content: (i > 0 ? ' ' : '') + chunk } });
      }
    }
    
    send({ type: 'done', data: { messageId } });
  } catch (error) {
    // Error handling
  }
}
```

## Benefits

1. **Separation of Concerns**
   - Route handles HTTP/streaming concerns
   - Orchestrator handles business logic
   - Clear boundaries

2. **Testability**
   - Orchestrator can be tested independently
   - Dependencies can be mocked
   - Easier to verify 4-phase pipeline logic

3. **Maintainability**
   - Centralized orchestration logic
   - Easier to understand flow
   - Changes to pipeline logic are isolated

4. **Reusability**
   - Orchestrator can be used from other entry points
   - Not tied to HTTP/SSE streaming
   - Could be used for CLI, background jobs, etc.

## Next Steps

1. **Full Route Integration**
   - Update `apps/scorpion/app/api/chat/stream/route.ts` to use orchestrator
   - Handle all edge cases (caching, user tools, knowledge base, etc.)
   - Maintain identical behavior

2. **Type Safety**
   - Ensure orchestrator types match app types exactly
   - Consider sharing types between packages

3. **Error Handling**
   - Standardize error handling across phases
   - Improve error messages and recovery

4. **Testing**
   - Add unit tests for orchestrator
   - Add integration tests for full pipeline

## Files Changed

- ✅ `packages/scorpion-core/src/orchestration/ScorpionOrchestrator.ts` - Created
- ✅ `packages/scorpion-core/src/orchestration/index.ts` - Created
- ✅ `packages/scorpion-core/src/index.ts` - Added orchestration export
- ✅ `packages/scorpion-core/src/agents/registry.ts` - Already exists (used by orchestrator)

## Agent Registry

The agent registry (`packages/scorpion-core/src/agents/registry.ts`) provides:

- **9 Council Members**: Architectus, Analytica, Pragmaton, Satori, Nexus, Sentinel, Catalyst, Oracle, Mentor
- **8 Specialized Agents**: Data Analytics, System Design, AI Tools, Business Strategy, Python Expert, LLM Training, Model Evaluation, Prompt Engineering

All agents have metadata including:
- `id`, `type`, `name`, `role`, `description`
- `inputs`, `outputs`, `tools`
- `status`, `weight` (council), `capabilities` (specialized)

The orchestrator uses `getCouncilMembers()` to get council member metadata for the council phase.

