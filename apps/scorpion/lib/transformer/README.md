# Transformer Architecture Integration

This module provides the integration layer between Scorpion's transformer architecture mapping and the existing codebase.

## Components

### 1. System Prompt Loader (`systemPrompt.ts`)

Loads the transformer-style system prompt and allows switching risk modes.

```typescript
import { getSystemPrompt } from '@/lib/transformer/systemPrompt';

const prompt = getSystemPrompt({
  riskMode: 'safe',
  extraInstructions: 'Focus on n8n schema validation',
});
```

**Features:**
- Loads from `server/transformer/system-prompt.txt` or env variable
- Maps risk modes (safe/balanced/exploratory) to behavioral hints
- Allows custom instructions per request

### 2. Tool Resource Index (`toolResourceIndex.ts`)

Wires the ResourceIndex to the existing tool registry, enabling semantic search over tools.

```typescript
import { createToolResourceIndex } from '@/lib/transformer/toolResourceIndex';

const resourceIndex = createToolResourceIndex();

// Semantic search (attention query)
const results = await resourceIndex.search('import workflow', {
  type: 'tool',
  limit: 5,
});
```

**Features:**
- Automatically populates from `toolRegistry`
- Provides semantic search interface (currently text-based, ready for embeddings)
- Compatible with existing tool metadata (tags, timeouts, etc.)

### 3. Orchestrator Example (`orchestrator-example.ts`)

Shows how to run a complete "decoder block" cycle.

```typescript
import { orchestrateScorpionStep } from '@/lib/transformer/orchestrator-example';

const result = await orchestrateScorpionStep({
  query: 'Import AgentPilot workflow',
  riskMode: 'balanced',
  previousEvents: [],
});

console.log(result.integrationPlan);
console.log(result.executionResults);
```

**Features:**
- Single decoder block execution
- Multi-block stack execution (like transformer layers)
- Result formatting helpers

## Usage Example

Complete example showing the full flow:

```typescript
import { 
  orchestrateScorpionStep,
  formatOrchestratorResult 
} from '@/lib/transformer/orchestrator-example';

// Run one thinking cycle
const result = await orchestrateScorpionStep({
  query: 'Import and validate the AgentPilot workflow',
  riskMode: 'safe',
  pipelineStage: 'planner',
  stepNumber: 1,
});

// Format for user
const response = formatOrchestratorResult(result);
console.log(response);
```

## Integration Points

### With Existing Chat Route

You can integrate this into `apps/scorpion/app/api/chat/stream/route.ts`:

```typescript
import { orchestrateScorpionStep } from '@/lib/transformer/orchestrator-example';

// In your chat handler
const transformerResult = await orchestrateScorpionStep({
  query: userMessage,
  riskMode: lightweightMode ? 'safe' : 'balanced',
  conversationHistory: messages,
});

// Use transformerResult.integrationPlan to guide execution
```

### With Enhanced Orchestrator

The transformer architecture complements the `EnhancedOrchestrator`:

- **EnhancedOrchestrator**: Adds positional encoding to pipeline phases
- **Transformer Integration**: Provides attention-based resource discovery and multi-head planning

They work together:
1. EnhancedOrchestrator handles positional encoding in phases
2. Transformer integration provides attention queries for resource discovery
3. Both contribute to the same `ScorpionContext`

## Next Steps

1. **Add Vector Embeddings**: Replace text matching with actual embeddings (OpenAI, local model)
2. **Persistent Storage**: Replace in-memory index with Supabase/Pinecone/Weaviate
3. **Real Tool Execution**: Wire up actual tool calls in `feedForwardPhase`
4. **Council Integration**: Connect to existing council system for multi-head attention

## Architecture Mapping

This module implements the transformer architecture mapping:

- **Tokens** → Events, Messages, Artifacts (ScorpionContext)
- **Embeddings** → Resource Index (tools, docs, workflows)
- **Attention** → Semantic search over Resource Index
- **Multi-Head** → Planner + Council agents
- **Decoder Block** → One automation loop iteration
- **Feed-Forward** → Tool execution
- **Residuals** → State merging (append-only events)

See `server/transformer/README.md` for the full architecture documentation.

