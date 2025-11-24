/**
 * RAG Pipeline Test Script
 * Quick test to verify the RAG system is working
 */

import {
  createRAGPipeline,
  InMemoryVectorStore,
  InMemoryKeywordSearch,
  chunkDocument,
  generateEmbedding,
} from '@/lib/rag';

async function testRAGPipeline() {
  console.log('🧪 Testing RAG Pipeline...\n');

  // Step 1: Create vector and keyword stores
  console.log('📦 Step 1: Creating stores...');
  const vectorStore = new InMemoryVectorStore();
  const keywordSearch = new InMemoryKeywordSearch();

  // Step 2: Add sample documents
  console.log('📄 Step 2: Indexing sample documents...');

  const sampleDocs = [
    {
      text: `
export async function processStreamStart(
  controller: ReadableStreamDefaultController,
  req: NextRequest,
  conversationId?: string,
  messages?: Message[],
  mode?: string,
  requestedTools?: string[],
  provider?: string,
  model?: string,
  clientMode?: string
): Promise<void> {
  // Main chat orchestrator
  // Phases: PLANNER → COUNCIL → EXECUTOR → SUMMARIZER

  const intent = classifyIntent(userMessage);
  console.log('[Chat Stream] Intent classified:', intent);

  // Run planner phase
  const plan = await runPlanner(userMessage, intent);

  // Execute plan
  const results = await runExecutor(plan);

  // Summarize results
  const answer = await runSummarizer(results);

  return answer;
}
      `,
      source: 'apps/scorpion/app/api/chat/stream/processStreamStart.ts',
    },
    {
      text: `
export function classifyIntent(message: string): ScorpionIntent {
  if (!message || typeof message !== 'string') {
    return 'general_question';
  }

  const lower = message.toLowerCase().trim();

  // Identity questions
  if (/who are you|what are you/.test(lower)) {
    return 'identity';
  }

  // Small talk
  if (/^(hi|hello|hey)/.test(lower)) {
    return 'small_talk';
  }

  // Code questions
  if (/function|class|code|implementation/.test(lower)) {
    return 'project_help';
  }

  return 'general_question';
}
      `,
      source: 'apps/scorpion/lib/chat/intent.ts',
    },
    {
      text: `
# Scorpion Architecture

Scorpion is a multi-agent orchestration system with four main phases:

## 1. Planner Phase
The planner analyzes the user request and creates an execution plan.

## 2. Council Phase
The council deliberates on the plan and provides feedback.

## 3. Executor Phase
The executor runs the approved plan using available tools.

## 4. Summarizer Phase
The summarizer synthesizes results into a final answer.

Each phase has specialized agents with specific capabilities.
      `,
      source: 'apps/scorpion/ARCHITECTURE.md',
    },
  ];

  for (const doc of sampleDocs) {
    // Chunk document
    const chunks = chunkDocument(doc.text, doc.source);
    console.log(`  ✅ ${doc.source}: ${chunks.length} chunks`);

    // Generate embeddings and index
    for (const chunk of chunks) {
      const id = `${chunk.source}-chunk-${chunk.index}`;
      const embedding = await generateEmbedding(chunk.content);

      // Add to vector store
      vectorStore.addDocument(id, embedding, {
        content: chunk.content,
        source: chunk.source,
        chunkIndex: chunk.index,
        lineStart: chunk.metadata.lineStart,
        lineEnd: chunk.metadata.lineEnd,
      });

      // Add to keyword search
      keywordSearch.addDocument(
        id,
        chunk.content,
        chunk.source,
        chunk.index,
        chunk.metadata
      );
    }
  }

  console.log('');

  // Step 3: Create pipeline
  console.log('🔧 Step 3: Creating RAG pipeline...');
  const pipeline = createRAGPipeline({
    vectorStore,
    keywordSearch,
    enableReranking: true,
    enableValidation: true,
    autoCitations: true,
  });
  console.log('  ✅ Pipeline created\n');

  // Step 4: Test queries
  const testQueries = [
    'How does processStreamStart work?',
    'What is the architecture of Scorpion?',
    'How does intent classification work?',
    'What is the capital of France?',  // Should return insufficient context
  ];

  for (const query of testQueries) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📝 Query: "${query}"`);
    console.log('='.repeat(80));

    const result = await pipeline.execute(query);

    console.log(`\n📊 Metrics:`);
    console.log(`  Total time: ${result.metrics.totalTimeMs}ms`);
    console.log(`  Rewrite time: ${result.metrics.rewriteTimeMs}ms`);
    console.log(`  Retrieval time: ${result.metrics.retrievalTimeMs}ms`);
    console.log(`  Rerank time: ${result.metrics.rerankTimeMs}ms`);

    console.log(`\n🎯 Intent: ${result.query.intent}`);
    console.log(`🔄 Rewritten: "${result.query.rewritten}"`);
    console.log(`🔑 Keywords: ${result.query.keywords.join(', ')}`);

    if (result.success && result.context) {
      console.log(`\n✅ SUCCESS`);
      console.log(`\n📦 Retrieved Context (${result.retrieval?.chunks.length || 0} chunks):`);

      if (result.reranking) {
        console.log(`  Total candidates: ${result.reranking.totalCandidates}`);
        console.log(`  Passed threshold: ${result.reranking.passedThreshold}`);
        console.log(`  Removed by AutoCut: ${result.reranking.removedByAutoCut}`);
      }

      if (result.reranking?.chunks) {
        console.log(`\n📚 Top Chunks:`);
        result.reranking.chunks.forEach((chunk, idx) => {
          console.log(`\n  ${idx + 1}. ${chunk.citation}`);
          console.log(`     Relevance: ${(chunk.rerankScore * 100).toFixed(1)}%`);
          console.log(`     Preview: ${chunk.content.substring(0, 100)}...`);
        });
      }

      // Simulate LLM answer generation
      console.log(`\n💬 Simulated Answer:`);
      const simulatedAnswer = `Based on the retrieved documentation:\n\n${result.context.substring(0, 300)}...\n\nThis explains the ${result.query.intent} query.`;

      // Validate answer
      const validation = pipeline.validateAnswer(simulatedAnswer, result);
      console.log(`\n✔️ Validation:`);
      console.log(`  Valid: ${validation.isValid}`);
      console.log(`  Has citations: ${validation.hasCitations}`);
      console.log(`  Quality score: ${(validation.score * 100).toFixed(1)}%`);
      console.log(`  Issues: ${validation.issues.length}`);

      if (validation.issues.length > 0) {
        validation.issues.forEach(issue => {
          console.log(`    - [${issue.severity}] ${issue.message}`);
        });
      }
    } else if (result.insufficientContext) {
      console.log(`\n⚠️ INSUFFICIENT CONTEXT`);
      console.log(`\nMessage:\n${result.insufficientContextMessage}`);
    } else if (result.error) {
      console.log(`\n❌ ERROR: ${result.error}`);
    }
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('✅ Test complete!');
  console.log('='.repeat(80));
}

// Run test
testRAGPipeline().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
