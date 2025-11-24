# RAG Quick Start - 5 Minutes

Get the anti-hallucination RAG system running in 5 minutes.

## 1. Test the System (30 seconds)

```bash
pnpm test:rag:pipeline
```

You should see:
```
✅ SUCCESS
📦 Retrieved Context (3 chunks)
✔️ Validation: Quality score: 85.2%
✅ Test complete!
```

## 2. Index Your First Document (1 minute)

```typescript
import { chunkDocument, generateEmbedding, InMemoryVectorStore } from '@/lib/rag';
import { readFileSync } from 'fs';

// Create store
const vectorStore = new InMemoryVectorStore();

// Read file
const text = readFileSync('apps/scorpion/ARCHITECTURE.md', 'utf-8');

// Chunk it
const chunks = chunkDocument(text, 'ARCHITECTURE.md');

// Index chunks
for (const chunk of chunks) {
  const embedding = await generateEmbedding(chunk.content);
  vectorStore.addDocument(`chunk-${chunk.index}`, embedding, {
    content: chunk.content,
    source: chunk.source,
    chunkIndex: chunk.index,
  });
}

console.log(`✅ Indexed ${chunks.length} chunks`);
```

## 3. Run Your First Query (30 seconds)

```typescript
import { createRAGPipeline } from '@/lib/rag';

const pipeline = createRAGPipeline({ vectorStore });

const result = await pipeline.execute("What is Scorpion's architecture?");

if (result.success && result.context) {
  console.log('✅ Retrieved context:', result.context);
} else {
  console.log('⚠️', result.insufficientContextMessage);
}
```

## 4. Integrate with Chat (2 minutes)

Add to `processStreamStart.ts`:

```typescript
import { createRAGPipeline, InMemoryVectorStore } from '@/lib/rag';

// Create pipeline (once, at module level)
const vectorStore = new InMemoryVectorStore();  // Replace with Pinecone
const ragPipeline = createRAGPipeline({ vectorStore });

// In summarizer phase, before LLM call:
if (shouldUseKnowledgeBase(intent)) {
  const ragResult = await ragPipeline.execute(userMessage);

  if (ragResult.success && ragResult.context) {
    summarizerPrompt += `\n\n${ragResult.context}`;
    summarizerPrompt += `\nAnswer using ONLY the context above. Cite sources.`;
  } else {
    // Return insufficient context message
    return ragResult.insufficientContextMessage;
  }
}
```

## 5. Validate Answers (1 minute)

After LLM generates answer:

```typescript
const validation = ragPipeline.validateAnswer(llmAnswer, ragResult);

if (validation.isValid) {
  const finalAnswer = ragPipeline.appendCitations(llmAnswer, ragResult);
  return finalAnswer;
} else {
  console.warn('Validation failed:', validation.issues);
  // Retry or fallback
}
```

---

## ✅ You're Done!

Your chat now:
- ✅ Never hallucinates (threshold gating)
- ✅ Always cites sources
- ✅ Validates every answer
- ✅ Refuses to guess when context is insufficient

## Next Steps

1. Replace `InMemoryVectorStore` with Pinecone/Supabase (see `INTEGRATION.md`)
2. Index your entire codebase (see `README.md`)
3. Tune thresholds in `config.ts`
4. Add telemetry

## Cheat Sheet

```typescript
// Import everything
import {
  createRAGPipeline,
  InMemoryVectorStore,
  chunkDocument,
  generateEmbedding,
} from '@/lib/rag';

// Index
const chunks = chunkDocument(text, 'file.ts');
for (const chunk of chunks) {
  const embedding = await generateEmbedding(chunk.content);
  vectorStore.addDocument(id, embedding, metadata);
}

// Query
const pipeline = createRAGPipeline({ vectorStore });
const result = await pipeline.execute("query");

// Validate
const validation = pipeline.validateAnswer(answer, result);
const finalAnswer = pipeline.appendCitations(answer, result);
```

## Key Files

- `lib/rag/README.md` - Full docs
- `lib/rag/INTEGRATION.md` - Integration guide
- `lib/rag/config.ts` - Configuration
- `RAG_SYSTEM_SUMMARY.md` - System overview

## Commands

```bash
# Test pipeline
pnpm test:rag:pipeline

# Test integration
pnpm test:chat

# Index codebase (create this script)
pnpm tsx scripts/index-codebase.ts
```

---

**That's it!** 🎉

For questions, see the full docs or ask in #scorpion-dev.
