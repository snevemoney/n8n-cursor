# Transformer Architecture Integration Guide

This guide shows how to integrate the transformer architecture into your existing Scorpion system.

## What's Been Implemented

### ✅ 1. Vector Embeddings
- **File**: `lib/transformer/embeddings.ts`
- **Features**:
  - OpenAI embeddings with Ollama fallback
  - Cosine similarity calculation
  - Batch embedding generation
- **Usage**: Automatically used by `ResourceIndex` for semantic search

### ✅ 2. Real Tool Execution
- **File**: `server/transformer/decoder-block.ts` (feedForwardPhase)
- **Features**:
  - Executes actual tools from `tools` registry
  - Supports both AI-callable and user tools
  - Dependency checking
  - Error handling
- **Usage**: Automatically called during decoder block execution

### ✅ 3. Council System Integration
- **File**: `lib/transformer/council-integration.ts`
- **Features**:
  - Connects to existing `runCouncilDeliberationStreaming`
  - Converts council votes to `HeadOutput` format
  - Can use either transformer attention or existing council system
- **Usage**: Set `useCouncilSystem: true` in `runDecoderBlock` options

### ✅ 4. Chat Route Integration
- **File**: `lib/transformer/chat-integration.ts`
- **Features**:
  - `runTransformerOrchestration()` - Drop-in replacement for chat orchestration
  - `shouldUseTransformerOrchestration()` - Feature flag check
- **Usage**: Call from chat route when `USE_TRANSFORMER_ORCHESTRATOR=true`

## Integration Options

### Option 1: Use as Alternative Orchestrator

In `apps/scorpion/app/api/chat/stream/processStreamStart.ts`:

```typescript
import { runTransformerOrchestration, shouldUseTransformerOrchestration } from '@/lib/transformer/chat-integration';

// Before creating orchestrator
if (shouldUseTransformerOrchestration()) {
  const transformerResult = await runTransformerOrchestration(
    userMessage,
    messages,
    {
      riskMode: lightweightMode ? 'safe' : 'balanced',
      userId: conversationId,
    }
  );
  
  // Use transformerResult.integrationPlan to guide execution
  // transformerResult.executionResults contains tool execution results
}
```

### Option 2: Use Alongside Existing Orchestrator

Use transformer for resource discovery, existing orchestrator for execution:

```typescript
import { createToolResourceIndex } from '@/lib/transformer/toolResourceIndex';
import { plannerAttentionQuery } from '@/server/transformer/attention-query';

// Use transformer to find relevant tools
const resourceIndex = createToolResourceIndex();
const attention = await plannerAttentionQuery(resourceIndex, context);

// Then use existing orchestrator with discovered tools
const tools = attention.topTools.map(t => t.toolId);
// ... pass to existing orchestrator
```

### Option 3: Use Council Integration Only

Use transformer's council integration with existing planner:

```typescript
import { runCouncilAsMultiHead } from '@/lib/transformer/council-integration';

// After planner generates plan
const councilHeads = await runCouncilAsMultiHead(resourceIndex, context, plan);

// Merge council outputs
const consensus = mergeHeadOutputs(councilHeads);
```

## Environment Variables

```bash
# Enable transformer orchestrator
USE_TRANSFORMER_ORCHESTRATOR=true

# Use OpenAI embeddings (otherwise falls back to Ollama)
USE_OPENAI_EMBEDDINGS=true
OPENAI_API_KEY=your-key

# Override system prompt
SCORPION_SYSTEM_PROMPT="Your custom prompt"
```

## Testing

### Test Vector Embeddings

```typescript
import { generateEmbedding, cosineSimilarity } from '@/lib/transformer/embeddings';

const vec1 = await generateEmbedding('import workflow');
const vec2 = await generateEmbedding('workflow import');
const similarity = cosineSimilarity(vec1, vec2);
console.log('Similarity:', similarity); // Should be high (>0.8)
```

### Test Resource Index

```typescript
import { createToolResourceIndex } from '@/lib/transformer/toolResourceIndex';

const index = createToolResourceIndex();
const results = await index.search('import n8n workflow', { limit: 5 });
console.log('Found tools:', results.map(r => r.entry.title));
```

### Test Full Orchestration

```typescript
import { orchestrateScorpionStep } from '@/lib/transformer/orchestrator-example';

const result = await orchestrateScorpionStep({
  query: 'Import AgentPilot workflow',
  riskMode: 'safe',
});

console.log('Plan:', result.integrationPlan);
console.log('Results:', result.executionResults);
```

## Next Steps

1. **Enable in Production**: Set `USE_TRANSFORMER_ORCHESTRATOR=true`
2. **Monitor Performance**: Compare transformer vs existing orchestrator
3. **Tune Embeddings**: Adjust embedding model or add caching
4. **Add More Resources**: Populate ResourceIndex with docs, workflows, logs
5. **Fine-tune Council**: Adjust council member perspectives and weights

## Architecture Benefits

- **Semantic Search**: Find tools/resources by meaning, not just keywords
- **Multi-Head Attention**: Multiple perspectives (Architectus, Analytica, etc.)
- **Residual Connections**: Append-only events, never lose context
- **Decoder Blocks**: Iterative refinement like transformer layers
- **Positional Encoding**: Track pipeline stage and step number

This makes Scorpion behave like a "system-sized transformer" where every component maps to transformer architecture concepts.

