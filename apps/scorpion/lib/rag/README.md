# Anti-Hallucination RAG System for Scorpion

A production-grade RAG (Retrieval-Augmented Generation) system designed to **eliminate hallucinations** by enforcing strict retrieval, reranking, validation, and citation requirements.

## Why This RAG System?

Traditional LLM chatbots hallucinate because they:
- Generate text from compressed neural weights (lossy)
- Have no way to verify facts
- Lack citation requirements
- Don't threshold low-confidence answers

This system fixes all of that.

## Architecture

```
User Query
    ↓
1. Query Rewriter (intent classification + expansion)
    ↓
2. Hybrid Retriever (vector + keyword + graph)
    ↓
3. Reranker (cross-encoder + threshold gating)
    ↓
4. Pre-Generation Validator (check sufficiency)
    ↓
5. LLM Generation (with retrieved context)
    ↓
6. Post-Generation Validator (check citations & hallucination)
    ↓
7. Citation Appender (add sources)
    ↓
Final Answer (cited, validated, no hallucination)
```

## Key Features

### 1. Intent-Based Retrieval

Automatically classifies queries into:
- `code_query` - TypeScript/JavaScript/Python code questions
- `ml_query` - Machine learning/AI questions
- `n8n_schema` - n8n workflow/schema questions
- `infrastructure` - Deployment/infra questions
- `architecture` - System architecture questions
- `rag_config` - RAG system questions
- `agent_policy` - Agent behavior questions
- `tool_spec` - Tool/API questions
- `general` - General knowledge

Each intent has tuned retrieval parameters.

### 2. Hybrid Search

Combines three retrieval methods:
- **Vector search** - Semantic similarity (cosine distance)
- **Keyword search** - BM25 term matching
- **Graph expansion** - Context-aware navigation

Results are fused using **Reciprocal Rank Fusion (RRF)**.

### 3. Reranker with Threshold Gating

Cross-encoder reranking + strict threshold:
- Rerank top-K candidates by relevance
- **Gate by threshold** - reject chunks < 0.68 relevance
- If no chunks pass → return "insufficient context" message

This is the **#1 anti-hallucination feature**.

### 4. AutoCut Filters

Removes:
- Chunks < 200 chars (too short)
- Contradictory statements
- Outdated versions
- Near-duplicates (>95% similarity)

### 5. Semantic Chunking

Code-aware chunking:
- Respects function/class boundaries
- Preserves line numbers for citations
- Markdown section-aware
- Configurable overlap

### 6. Citation Enforcement

Every answer MUST include sources:
- Markdown-style: `[file.ts:L120-150]`
- Inline: "according to file.ts..."
- Sources section at end

No citations → auto-reject.

### 7. Hallucination Detection

Post-generation validator checks:
- Do facts exist in retrieved chunks?
- Is citation density sufficient?
- Is chunk coverage adequate?

If confidence < 70% → flag as hallucination.

## Installation

Already installed in Scorpion. Available at:

```typescript
import { createRAGPipeline } from '@/lib/rag';
```

## Quick Start

### Step 1: Create a Vector Store

```typescript
import { InMemoryVectorStore, chunkDocument, generateEmbedding } from '@/lib/rag';

const vectorStore = new InMemoryVectorStore();

// Index a document
const text = `
export function processStreamStart() {
  // Main chat orchestrator
  // ...
}
`;

const chunks = chunkDocument(text, 'apps/scorpion/processStreamStart.ts');

for (const chunk of chunks) {
  const embedding = await generateEmbedding(chunk.content);
  vectorStore.addDocument(chunk.id, embedding, {
    content: chunk.content,
    source: chunk.source,
    chunkIndex: chunk.index,
    lineStart: chunk.metadata.lineStart,
    lineEnd: chunk.metadata.lineEnd,
  });
}
```

### Step 2: Create RAG Pipeline

```typescript
import { createRAGPipeline } from '@/lib/rag';

const pipeline = createRAGPipeline({
  vectorStore,
  enableReranking: true,
  enableValidation: true,
  autoCitations: true,
});
```

### Step 3: Execute Query

```typescript
const result = await pipeline.execute("How does processStreamStart work?");

if (result.success && result.context) {
  console.log('✅ Context retrieved:', result.context);
  console.log('Metrics:', result.metrics);

  // Use result.context as LLM input
  const answer = await yourLLM.generate({
    systemPrompt: `Answer using ONLY the provided context. Cite sources.`,
    context: result.context,
    userQuery: result.query.original,
  });

  // Validate answer
  const validation = pipeline.validateAnswer(answer, result);

  if (validation.isValid) {
    const finalAnswer = pipeline.appendCitations(answer, result);
    console.log('✅ Final answer:', finalAnswer);
  } else {
    console.error('❌ Validation failed:', validation.issues);
  }
} else if (result.insufficientContext) {
  console.log('⚠️ Insufficient context:', result.insufficientContextMessage);
}
```

## Integration with Scorpion Chat

### Option 1: Add RAG to Planner Phase

Inject retrieved context into planner prompt:

```typescript
// In processStreamStart.ts

import { createRAGPipeline, InMemoryVectorStore } from '@/lib/rag';

// Initialize RAG (singleton)
const ragPipeline = createRAGPipeline({
  vectorStore: yourVectorStore,  // Use Pinecone/Supabase
});

// In planner phase
const ragResult = await ragPipeline.execute(userMessage, intent);

if (ragResult.success && ragResult.context) {
  // Add context to planner prompt
  plannerPrompt += `\n\n${ragResult.context}`;
}
```

### Option 2: Add RAG to Summarizer Phase

Use RAG for final answer generation:

```typescript
// In summarizer phase
const ragResult = await ragPipeline.execute(userMessage, intent);

if (ragResult.success && ragResult.context) {
  summarizerPrompt += `\n\n# Retrieved Documentation\n${ragResult.context}`;
}

// After generation
const validation = pipeline.validateAnswer(summarizerOutput, ragResult);
if (!validation.isValid) {
  // Fallback or retry
}
```

### Option 3: Add RAG as Helper Agent

Create a dedicated RAG helper in orchestrator:

```typescript
const RagRetrieverSchema = {
  name: 'rag-retriever',
  systemPrompt: `You retrieve and synthesize context from the knowledge base.
Use ONLY retrieved chunks. Cite all sources.`,
  // ...
};

// Call RAG helper for knowledge queries
if (shouldUseKnowledgeBase(intent)) {
  const ragResult = await ragPipeline.execute(query);
  const helperOutput = await runRAGHelper(ragResult.context);
}
```

## Configuration

### Per-Intent Tuning

Edit `lib/rag/config.ts`:

```typescript
export const RETRIEVAL_CONFIGS: Record<RAGIntent, RetrievalConfig> = {
  code_query: {
    topK: 20,
    minSimilarity: 0.65,
    rerankThreshold: 0.68,
    // ...
  },
  // ...
};
```

### Embedding Models

Supports:
- OpenAI `text-embedding-3-small` (default)
- OpenAI `text-embedding-3-large`
- Ollama `nomic-embed-text`
- Jina `jina-embeddings-v3-code` (best for code)

Change in `config.ts`:

```typescript
export const DEFAULT_EMBEDDING_MODEL = EMBEDDING_MODELS['jina-code'];
```

### Reranker Models

Supports:
- Heuristic (built-in, no external model)
- BGE `bge-reranker-large` (best quality)
- Cohere `rerank-v3` (paid, highest quality)

Implement `CrossEncoderReranker` interface to add custom rerankers.

## Advanced: Pinecone Integration

```typescript
import { Pinecone } from '@pinecone-database/pinecone';
import { VectorStore, VectorSearchResult } from '@/lib/rag';

class PineconeVectorStore implements VectorStore {
  private client: Pinecone;
  private indexName: string;

  constructor(apiKey: string, indexName: string) {
    this.client = new Pinecone({ apiKey });
    this.indexName = indexName;
  }

  async query(
    embedding: number[],
    namespace: string,
    topK: number
  ): Promise<VectorSearchResult[]> {
    const index = this.client.Index(this.indexName);
    const response = await index.namespace(namespace).query({
      vector: embedding,
      topK,
      includeMetadata: true,
    });

    return response.matches.map(match => ({
      id: match.id,
      score: match.score || 0,
      metadata: match.metadata as any,
    }));
  }

  async queryByIds(ids: string[], namespace: string): Promise<VectorSearchResult[]> {
    const index = this.client.Index(this.indexName);
    const response = await index.namespace(namespace).fetch(ids);

    return Object.entries(response.records).map(([id, record]) => ({
      id,
      score: 1.0,
      metadata: record.metadata as any,
    }));
  }
}

// Use in pipeline
const vectorStore = new PineconeVectorStore(
  process.env.PINECONE_API_KEY!,
  'scorpion-knowledge'
);
```

## Advanced: Supabase Keyword Search

```typescript
import { createClient } from '@supabase/supabase-js';
import { KeywordSearchEngine, KeywordSearchResult } from '@/lib/rag';

class SupabaseKeywordSearch implements KeywordSearchEngine {
  private client: ReturnType<typeof createClient>;

  constructor(url: string, key: string) {
    this.client = createClient(url, key);
  }

  async search(
    query: string,
    namespace: string,
    topK: number
  ): Promise<KeywordSearchResult[]> {
    const { data, error } = await this.client
      .from('documents')
      .select('id, content, source, chunk_index, metadata')
      .textSearch('content', query, { type: 'websearch' })
      .eq('namespace', namespace)
      .limit(topK);

    if (error) throw error;

    return (data || []).map((row, idx) => ({
      id: row.id,
      content: row.content,
      source: row.source,
      chunkIndex: row.chunk_index,
      score: 1 - idx / topK,  // Rank-based score
      metadata: row.metadata || {},
    }));
  }
}
```

## Indexing Your Codebase

```typescript
import { chunkDocument, generateEmbedding } from '@/lib/rag';
import { glob } from 'glob';
import { readFileSync } from 'fs';

async function indexCodebase() {
  const files = glob.sync('apps/scorpion/**/*.{ts,tsx,md}', {
    ignore: ['**/node_modules/**', '**/.next/**'],
  });

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const chunks = chunkDocument(content, file);

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.content);

      await vectorStore.addDocument(chunk.id, embedding, {
        content: chunk.content,
        source: chunk.source,
        chunkIndex: chunk.index,
        lineStart: chunk.metadata.lineStart,
        lineEnd: chunk.metadata.lineEnd,
        language: chunk.metadata.language,
      });
    }

    console.log(`✅ Indexed ${file} (${chunks.length} chunks)`);
  }
}
```

## Metrics & Monitoring

Every pipeline execution returns metrics:

```typescript
{
  totalTimeMs: 1234,
  rewriteTimeMs: 10,
  retrievalTimeMs: 500,
  rerankTimeMs: 200,
  validationTimeMs: 50,
}
```

Log these to your observability system.

## Testing

```bash
pnpm test:rag
```

## FAQ

### Q: What if I don't have Pinecone?

Use `InMemoryVectorStore` for testing. For production, use:
- Supabase (pgvector extension)
- Redis (vector similarity)
- Qdrant, Weaviate, Milvus

### Q: Do I need a reranker model?

No. The built-in `HeuristicReranker` works well.
For best results, integrate BGE or Cohere.

### Q: How do I tune thresholds?

Start with defaults. If you get too many "insufficient context" messages:
- Lower `minSimilarity` (try 0.60)
- Lower `rerankThreshold` (try 0.65)

If you get hallucinations:
- Raise `rerankThreshold` (try 0.75)
- Enable `removeContradictions` in AutoCut

### Q: Can I disable validation?

Yes:

```typescript
const pipeline = createRAGPipeline({
  vectorStore,
  enableValidation: false,
});
```

But you'll lose anti-hallucination guarantees.

### Q: How do I handle multi-language?

The chunker auto-detects language from file extension.
For multi-language embeddings, use multilingual models:
- `text-embedding-3-small` (OpenAI, 100+ languages)
- `multilingual-e5-large` (Hugging Face)

## Roadmap

- [ ] GraphRAG integration (Neo4j/Postgres JSONB)
- [ ] BGE reranker integration
- [ ] Cohere rerank API
- [ ] Multi-query fusion for complex questions
- [ ] Query expansion via LLM
- [ ] Adaptive threshold based on query complexity
- [ ] Context compression (remove redundant chunks)
- [ ] Streaming retrieval (yield chunks as they arrive)

## References

- [RAG Best Practices](https://arxiv.org/abs/2312.10997)
- [Retrieval-Augmented Generation for Knowledge-Intensive NLP](https://arxiv.org/abs/2005.11401)
- [BGE Reranker](https://github.com/FlagOpen/FlagEmbedding)
- [Reciprocal Rank Fusion](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf)

---

**Built for Scorpion** by the AgentPilot team.
