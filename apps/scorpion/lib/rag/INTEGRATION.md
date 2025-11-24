# RAG Integration Guide for Scorpion

Step-by-step guide to integrate the anti-hallucination RAG system into Scorpion's chat pipeline.

## Integration Points

You have **three main options** for where to inject RAG:

1. **Planner Phase** - Retrieve context before planning
2. **Summarizer Phase** - Retrieve context for final answer
3. **Dedicated RAG Helper** - Use RAG as a specialized agent

We recommend **Option 2** (Summarizer Phase) for most use cases.

---

## Option 1: Planner Phase Integration

**When to use:** You want the planner to have access to documentation when creating the plan.

### Implementation

Edit `apps/scorpion/app/api/chat/stream/processStreamStart.ts`:

```typescript
import { createRAGPipeline, InMemoryVectorStore } from '@/lib/rag';

// At the top of processStreamStart function, after intent classification:

// Initialize RAG pipeline (move to module-level singleton in production)
const vectorStore = new InMemoryVectorStore();  // Replace with Pinecone/Supabase
const ragPipeline = createRAGPipeline({
  vectorStore,
  enableReranking: true,
  enableValidation: true,
  autoCitations: true,
});

// After intent classification
const intent = classifyIntent(userMessage);
const shouldUseRAG = shouldUseKnowledgeBase(intent);

let ragContext = '';
if (shouldUseRAG) {
  console.log('[RAG] Retrieving context for planner...');
  const ragResult = await ragPipeline.execute(userMessage, intent);

  if (ragResult.success && ragResult.context) {
    ragContext = ragResult.context;
    console.log('[RAG] Context retrieved:', {
      chunks: ragResult.reranking?.passedThreshold || 0,
      timeMs: ragResult.metrics.totalTimeMs,
    });
  } else if (ragResult.insufficientContext) {
    console.log('[RAG] Insufficient context:', ragResult.insufficientContextMessage);
    // Optional: Return early with insufficientContextMessage
  }
}

// In planner prompt construction
const plannerPrompt = `
You are the Planner agent for Scorpion.
User request: ${userMessage}

${ragContext ? `\n## Retrieved Documentation\n${ragContext}\n` : ''}

Create a plan using the available tools...
`;
```

---

## Option 2: Summarizer Phase Integration (Recommended)

**When to use:** You want RAG-backed answers for knowledge queries, while keeping planner lightweight.

### Implementation

Edit `apps/scorpion/app/api/chat/stream/processStreamStart.ts`:

```typescript
import { createRAGPipeline, InMemoryVectorStore } from '@/lib/rag';

// Module-level singleton (outside processStreamStart)
let ragPipeline: RAGPipeline | null = null;

function getRAGPipeline(): RAGPipeline {
  if (!ragPipeline) {
    const vectorStore = new InMemoryVectorStore();  // Replace with real store
    ragPipeline = createRAGPipeline({
      vectorStore,
      enableReranking: true,
      enableValidation: true,
      autoCitations: true,
    });
  }
  return ragPipeline;
}

// In processStreamStart, before summarizer phase:

// Determine if RAG should be used
const intent = classifyIntent(userMessage);
const shouldUseRAG = shouldUseKnowledgeBase(intent);

let ragResult: RAGPipelineResult | null = null;

if (shouldUseRAG) {
  console.log('[Summarizer] Using RAG for knowledge query');

  const pipeline = getRAGPipeline();
  ragResult = await pipeline.execute(userMessage, intent);

  if (!ragResult.success || ragResult.insufficientContext) {
    // Return insufficient context message immediately
    const errorMessage = ragResult.insufficientContextMessage || 'Failed to retrieve relevant context.';

    safeSend({
      type: 'phase',
      phase: 'summarizer',
      status: 'running',
    });

    safeSend({
      type: 'delta',
      content: errorMessage,
    });

    safeSend({
      type: 'phase',
      phase: 'summarizer',
      status: 'complete',
    });

    safeSend({ type: 'done', data: {} });
    return;
  }
}

// Build summarizer prompt
let summarizerPrompt = `You are the Summarizer agent for Scorpion.
Original request: ${userMessage}

${toolResults.length > 0 ? `Tool results:\n${JSON.stringify(toolResults, null, 2)}\n` : ''}
`;

// Inject RAG context
if (ragResult?.success && ragResult.context) {
  summarizerPrompt += `\n## Retrieved Documentation\n\n${ragResult.context}\n\n`;
  summarizerPrompt += `**IMPORTANT:**
- Answer using ONLY the retrieved documentation above
- Cite sources using format: [filename.ts:L120-150]
- If the documentation doesn't answer the question, say "The documentation doesn't cover this topic"
- DO NOT make assumptions or add information not in the retrieved chunks\n\n`;
}

// Generate summarizer response
const summarizerResponse = await runModelUnified({
  systemPrompt: summarizerPrompt,
  messages: conversationHistory,
  provider: selectedProvider,
  model: selectedModel,
  onToken: (token) => {
    safeSend({
      type: 'delta',
      content: token,
    });
  },
});

// Validate answer (if RAG was used)
if (ragResult?.success) {
  const pipeline = getRAGPipeline();
  const validation = pipeline.validateAnswer(summarizerResponse, ragResult);

  if (!validation.isValid) {
    console.warn('[Summarizer] Answer validation failed:', validation.issues);
    // Optional: Log to telemetry, retry, or send warning to user
  } else {
    console.log('[Summarizer] Answer validated:', {
      score: validation.score,
      citations: validation.citations.length,
    });
  }

  // Append citations (if not already present)
  const finalAnswer = pipeline.appendCitations(summarizerResponse, ragResult);
  if (finalAnswer !== summarizerResponse) {
    safeSend({
      type: 'delta',
      content: finalAnswer.substring(summarizerResponse.length),
    });
  }
}
```

---

## Option 3: Dedicated RAG Helper Agent

**When to use:** You want RAG to be a first-class orchestrator agent with its own phase.

### Implementation

**Step 1:** Define RAG Helper Schema

Create `apps/scorpion/lib/orchestrator/schemas/ragRetriever.ts`:

```typescript
export const RagRetrieverSchema = {
  name: 'rag-retriever',
  systemPrompt: `You are the RAG Retriever agent for Scorpion.

Your role:
1. Retrieve relevant documentation chunks from the knowledge base
2. Synthesize information from multiple sources
3. Cite all sources accurately
4. Refuse to answer if retrieved context is insufficient

Guidelines:
- Use ONLY information from retrieved chunks
- Cite sources: [filename.ts:L120-150]
- If chunks don't answer the question, say "The documentation doesn't cover this topic"
- Never make assumptions or add uncited information
- Prioritize high-relevance chunks (score > 0.70)

Retrieved context will be provided in your system prompt.`,
  temperature: 0.3,
  maxTokens: 2000,
};
```

**Step 2:** Add RAG Phase to Orchestrator

Edit `apps/scorpion/server/orchestrator/index.ts`:

```typescript
import { createRAGPipeline } from '@/lib/rag';
import { RagRetrieverSchema } from '@/lib/orchestrator/schemas/ragRetriever';

// In orchestrator
export async function runScorpionBrain(
  userMessage: string,
  conversationHistory: Message[],
  onEvent: (event: any) => void
) {
  const intent = classifyIntent(userMessage);
  const shouldUseRAG = shouldUseKnowledgeBase(intent);

  if (shouldUseRAG) {
    // RAG phase
    onEvent({ type: 'phase', phase: 'rag', status: 'running' });

    const pipeline = getRAGPipeline();
    const ragResult = await pipeline.execute(userMessage, intent);

    if (!ragResult.success || ragResult.insufficientContext) {
      onEvent({
        type: 'phase',
        phase: 'rag',
        status: 'complete',
        result: ragResult.insufficientContextMessage,
      });

      return {
        answer: ragResult.insufficientContextMessage,
        sources: [],
      };
    }

    // Generate RAG-backed answer
    const ragAnswer = await runModelUnified({
      systemPrompt: RagRetrieverSchema.systemPrompt + '\n\n' + ragResult.context,
      messages: [{ role: 'user', content: userMessage }],
      temperature: RagRetrieverSchema.temperature,
      maxTokens: RagRetrieverSchema.maxTokens,
    });

    // Validate and append citations
    const validation = pipeline.validateAnswer(ragAnswer, ragResult);
    const finalAnswer = pipeline.appendCitations(ragAnswer, ragResult);

    onEvent({
      type: 'phase',
      phase: 'rag',
      status: 'complete',
      result: finalAnswer,
      validation,
    });

    return {
      answer: finalAnswer,
      sources: validation.citations,
    };
  }

  // Continue with normal orchestration...
}
```

---

## Production Setup

### 1. Choose Vector Store

**Option A: Pinecone (Recommended for production)**

```typescript
import { Pinecone } from '@pinecone-database/pinecone';
import { VectorStore } from '@/lib/rag';

class PineconeVectorStore implements VectorStore {
  // See README.md for full implementation
}

const vectorStore = new PineconeVectorStore(
  process.env.PINECONE_API_KEY!,
  'scorpion-knowledge'
);
```

**Option B: Supabase (if you already use Supabase)**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Use pgvector extension
// See Supabase docs: https://supabase.com/docs/guides/ai/vector-columns
```

**Option C: In-Memory (development only)**

```typescript
import { InMemoryVectorStore } from '@/lib/rag';

const vectorStore = new InMemoryVectorStore();
```

### 2. Index Your Codebase

Create `apps/scorpion/scripts/index-codebase.ts`:

```typescript
import { chunkDocument, generateEmbedding } from '@/lib/rag';
import { glob } from 'glob';
import { readFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

async function indexCodebase() {
  const vectorStore = getYourVectorStore();

  const files = glob.sync('apps/scorpion/**/*.{ts,tsx,md}', {
    ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
  });

  console.log(`Indexing ${files.length} files...`);

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const chunks = chunkDocument(content, file);

    for (const chunk of chunks) {
      const id = uuidv4();
      const embedding = await generateEmbedding(chunk.content);

      await vectorStore.addDocument(id, embedding, {
        content: chunk.content,
        source: chunk.source,
        chunkIndex: chunk.index,
        lineStart: chunk.metadata.lineStart,
        lineEnd: chunk.metadata.lineEnd,
        language: chunk.metadata.language,
        chunkType: chunk.metadata.chunkType,
      });
    }

    console.log(`✅ ${file} (${chunks.length} chunks)`);
  }

  console.log('✅ Indexing complete!');
}

indexCodebase().catch(console.error);
```

Run:

```bash
pnpm tsx apps/scorpion/scripts/index-codebase.ts
```

### 3. Environment Variables

Add to `.env`:

```bash
# RAG Configuration
PINECONE_API_KEY=your_key_here
PINECONE_INDEX_NAME=scorpion-knowledge

# Or Supabase
SUPABASE_URL=your_url_here
SUPABASE_KEY=your_key_here

# Embedding provider
OPENAI_API_KEY=your_key_here  # For text-embedding-3-small
# Or
OLLAMA_URL=http://localhost:11434  # For nomic-embed-text
```

### 4. Monitor Performance

Add telemetry:

```typescript
const ragResult = await pipeline.execute(userMessage, intent);

// Log metrics
console.log('[RAG Metrics]', {
  query: userMessage,
  intent: ragResult.query.intent,
  totalTimeMs: ragResult.metrics.totalTimeMs,
  retrievalTimeMs: ragResult.metrics.retrievalTimeMs,
  rerankTimeMs: ragResult.metrics.rerankTimeMs,
  chunksRetrieved: ragResult.retrieval?.chunks.length || 0,
  chunksPassedThreshold: ragResult.reranking?.passedThreshold || 0,
  success: ragResult.success,
});

// Send to your observability system
await yourTelemetry.track('rag_execution', {
  // ...
});
```

---

## Testing

Create `apps/scorpion/tests/rag.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { createRAGPipeline, InMemoryVectorStore, chunkDocument, generateEmbedding } from '@/lib/rag';

describe('RAG Pipeline', () => {
  it('should retrieve and validate context', async () => {
    // Setup
    const vectorStore = new InMemoryVectorStore();
    const text = 'export function hello() { return "world"; }';
    const chunks = chunkDocument(text, 'test.ts');

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.content);
      vectorStore.addDocument(chunk.id, embedding, {
        content: chunk.content,
        source: chunk.source,
        chunkIndex: chunk.index,
      });
    }

    const pipeline = createRAGPipeline({ vectorStore });

    // Execute
    const result = await pipeline.execute('What does the hello function do?');

    // Assert
    expect(result.success).toBe(true);
    expect(result.context).toContain('hello');
  });
});
```

Run:

```bash
pnpm test:rag
```

---

## Common Issues

### Issue: "Insufficient context" on every query

**Cause:** Threshold too high or no documents indexed.

**Fix:**
1. Check that documents are indexed: `vectorStore.query(...)`
2. Lower thresholds in `lib/rag/config.ts`:
   ```typescript
   minSimilarity: 0.60,  // Was 0.65
   rerankThreshold: 0.65,  // Was 0.68
   ```

### Issue: Hallucinations still occurring

**Cause:** Validation disabled or threshold too low.

**Fix:**
1. Enable validation:
   ```typescript
   createRAGPipeline({ vectorStore, enableValidation: true });
   ```
2. Raise threshold:
   ```typescript
   rerankThreshold: 0.75,  // Was 0.68
   ```
3. Add stricter system prompt:
   ```typescript
   systemPrompt += "\nIMPORTANT: Refuse to answer if context is insufficient.";
   ```

### Issue: Slow performance (>2s per query)

**Cause:** Too many chunks retrieved or slow vector store.

**Fix:**
1. Reduce `topK` in config:
   ```typescript
   topK: 10,  // Was 20
   ```
2. Use Pinecone instead of in-memory
3. Cache embeddings
4. Use smaller embedding model

---

## Next Steps

1. ✅ Choose integration point (Summarizer recommended)
2. ✅ Set up vector store (Pinecone/Supabase)
3. ✅ Index your codebase
4. ✅ Test with sample queries
5. ✅ Monitor performance
6. ✅ Tune thresholds based on results

For questions, see `lib/rag/README.md` or ask in #scorpion-dev.
