# Scorpion as a System-Sized Transformer

This module implements the transformer architecture mapping for Scorpion, treating the entire system as a giant transformer where:

- **Tokens** = Events, Messages, Artifacts
- **Embeddings** = Tool Registry + Knowledge Index + Schema Registry
- **Positional Encoding** = Pipeline Stage + Step Index + Timestamps
- **Self-Attention** = Planner + Council looking at everything
- **Multi-Head Attention** = Multiple specialized agents
- **Decoder Blocks** = One iteration of ChainLogicLoop / AgentPilot loop
- **Feed-Forward** = Tools doing real work
- **Residuals** = Validation, tests, health checks, rollbacks

## Core Concepts

### 1. ScorpionContext (`scorpion-context.ts`)

The unified "context window" for one thinking cycle. Contains:
- User query
- Past events (append-only)
- Planned actions
- Resource index
- Pipeline position

### 2. Resource Index (`resource-index.ts`)

The "embedding table" - unified index of:
- Tools (MCP/n8n tools)
- Docs (design docs, architecture READMEs)
- Workflows (n8n schemas)
- Logs (past runs, postmortems)

Provides semantic search (RAG queries) like attention: Q · K^T

### 3. Head Output (`head-output.ts`)

Each specialized agent (Architectus, Analytica, Pragmaton, Risk) produces a `HeadOutput`. The Orchestrator merges all `HeadOutput[]` into an `IntegrationPlan`.

### 4. Attention Query (`attention-query.ts`)

Self-attention at system level:
- Planner queries Resource Index for relevant tools/docs/workflows
- Council agents query from their perspective
- Returns attention scores (relevance weights)

### 5. Decoder Block (`decoder-block.ts`)

One iteration of Scorpion's automation loop:
1. **Normalize** → Build context summary
2. **Multi-Head Attention** → Planner + Council
3. **Feed-Forward** → Tool execution
4. **Residual Merge** → Update state (append-only)

## Usage Example

```typescript
import { createScorpionContext } from './scorpion-context';
import { InMemoryResourceIndex } from './resource-index';
import { runDecoderBlock } from './decoder-block';

// 1. Create context (tokenization)
const context = createScorpionContext(
  'Import AgentPilot workflow',
  [], // past events
  [], // resource index entries
  { pipelineStage: 'planner', stepNumber: 1 }
);

// 2. Initialize resource index (embeddings)
const resourceIndex = new InMemoryResourceIndex();
await resourceIndex.upsert({
  type: 'tool',
  id: 'agentpilot-importer',
  title: 'AgentPilot Importer',
  description: 'Import and validate n8n workflows',
  tags: ['n8n', 'workflow', 'import'],
  metadata: { /* ... */ },
});

// 3. Run decoder block (one thinking cycle)
const { updatedContext, plan, executionResults } = await runDecoderBlock(
  resourceIndex,
  context
);

// 4. Repeat for next block (next loop iteration)
```

## Integration with Existing Code

This transformer mapping integrates with:

- **Enhanced Orchestrator** (`enhanced-orchestrator.ts`) - Adds positional encoding to pipeline phases
- **Council Attention** (`council-attention.ts`) - Calculates attention scores for council members
- **Observatory** - Visualizes the transformer architecture in the brain graph

## Next Steps

1. **Vector Embeddings**: Replace simple text matching with actual vector embeddings (OpenAI, local model, etc.)
2. **Persistent Storage**: Replace `InMemoryResourceIndex` with Supabase/Pinecone/Weaviate
3. **Tool Execution**: Wire up actual tool calls in `feedForwardPhase`
4. **System Prompt**: Create a system prompt that encodes this transformer analogy for agents
