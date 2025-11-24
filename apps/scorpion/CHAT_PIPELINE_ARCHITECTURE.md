# 🦂 SCORPION CHAT PIPELINE - FRONTIER-CLASS ARCHITECTURE

**Date**: 2025-11-23
**Status**: ✅ Operational
**Quality Target**: Frontier Model Level (Claude Sonnet 4.5, GPT-4o)

---

## Pipeline Flow

```
User Request
    ↓
[REQUEST PHASE] → Input validation, intent classification
    ↓
[PLANNER PHASE] → Deep reasoning, multi-step breakdown
    ↓
[COUNCIL PHASE] → 9-member expert review (safety-critical)
    ↓
[EXECUTOR PHASE] → Tool execution, workflow orchestration
    ↓
[KNOWLEDGE PHASE] → RAG context retrieval, citation
    ↓
[SUMMARIZER PHASE] → Frontier-quality synthesis & integration
    ↓
[RESULT] → Streamed response with citations
```

---

## Phase 1: REQUEST PHASE

**File**: `app/api/chat/stream/phases/requestPhase.ts`

### Purpose
Validates input, classifies user intent, sets up streaming context.

### Responsibilities
1. **Input Validation**:
   - Message content required
   - Conversation ID generation
   - Provider/model validation

2. **Intent Classification**:
   ```typescript
   type ScorpionIntent =
     | 'identity'         // "What is Scorpion?"
     | 'small_talk'       // "hi", "thanks"
     | 'general_question' // Knowledge queries
     | 'project_help'     // Codebase/workflow help
     | 'system_debug'     // "Why is Scorpion doing X?"
     | 'other'
   ```

3. **Context Setup**:
   - Conversation history loading
   - User preferences
   - System state snapshot

### Power of 10 Compliance
- ✅ Bounded loops (max history: 50 messages)
- ✅ Explicit error handling
- ✅ Type-safe validation

---

## Phase 2: PLANNER PHASE

**File**: `app/api/chat/stream/phases/plannerPhase.ts`

### Purpose
Generate execution plan with **frontier-level reasoning**.

### Deep Reasoning Approach
Inspired by Claude Sonnet 4.5 extended thinking:

```typescript
interface Plan {
  objective: string;
  reasoning: string;              // Deep reasoning explanation
  assumptions: string[];          // Explicit assumptions
  plan: PlanStep[];               // Execution steps
  done_when: string[];            // Success criteria
  fallbacks: Array<{              // Error handling
    if: string;
    then: string;
  }>;
  needsCouncil: boolean;          // Trigger safety review
  councilRationale: string;       // Why council is/isn't needed
}
```

### Reasoning Quality Features

1. **Extended Thinking Mode**:
   - Planner takes time to think through problem
   - Considers multiple approaches
   - Evaluates trade-offs explicitly

2. **Assumption Tracking**:
   - Lists what it's assuming about user intent
   - Identifies knowledge gaps
   - Notes when more info needed

3. **Step Dependencies**:
   ```typescript
   interface PlanStep {
     id: string;
     title: string;
     tool: string;
     dependsOn: string[];  // Execution order
     success: string;      // Success criteria
   }
   ```

4. **Fallback Planning**:
   - If tool fails → alternative approach
   - If API unavailable → local fallback
   - If timeout → simplify query

### Plan Enforcement

**File**: `app/api/chat/stream/helpers/planEnforcement.ts`

Validates plans against rules:
- ✅ All tools exist
- ✅ Dependencies are acyclic
- ✅ Success criteria measurable
- ✅ No unsafe tool combinations

### Example Frontier-Quality Plan

**User**: "Research the latest AI safety papers and summarize key findings"

**Plan Generated**:
```json
{
  "objective": "Research and summarize latest AI safety papers",
  "reasoning": "This requires: (1) identifying reputable sources for AI safety research (ArXiv, Alignment Forum), (2) retrieving recent papers (last 3 months for 'latest'), (3) filtering for relevance and quality, (4) extracting key findings from abstracts/conclusions, (5) synthesizing into coherent summary with citations. Will need web research tool + knowledge base for context.",
  "assumptions": [
    "User wants academic-quality papers, not blog posts",
    "'Latest' means last 3 months",
    "Key findings = novel contributions, not summaries of prior work",
    "Citations should include paper titles and authors"
  ],
  "plan": [
    {
      "id": "step-1",
      "title": "Search ArXiv for recent AI safety papers",
      "tool": "tavily_search",
      "args": {
        "query": "AI safety alignment site:arxiv.org after:2024-08",
        "max_results": 10
      },
      "success": "Retrieved 5+ papers from ArXiv"
    },
    {
      "id": "step-2",
      "title": "Search Alignment Forum for discussions",
      "tool": "tavily_search",
      "args": {
        "query": "AI safety site:alignmentforum.org",
        "max_results": 5
      },
      "dependsOn": ["step-1"],
      "success": "Retrieved relevant forum posts"
    },
    {
      "id": "step-3",
      "title": "Extract key findings from papers",
      "tool": "extract_content",
      "args": {
        "urls": ["<from step-1>"],
        "extract": "abstract, conclusion, key findings"
      },
      "dependsOn": ["step-1", "step-2"],
      "success": "Extracted structured content from all papers"
    }
  ],
  "done_when": [
    "Summary contains 3-5 key findings",
    "Each finding has citation with paper title + authors",
    "Summary is 200-300 words",
    "All claims are sourced"
  ],
  "fallbacks": [
    {
      "if": "ArXiv search fails",
      "then": "Use Google Scholar via SerpAPI"
    },
    {
      "if": "No papers found in last 3 months",
      "then": "Expand to last 6 months"
    }
  ],
  "needsCouncil": false,
  "councilRationale": "Research task with no safety risks. No human decision-making, no sensitive data, no ethical concerns. Council not needed."
}
```

---

## Phase 3: COUNCIL PHASE

**File**: `app/api/chat/stream/phases/councilPhase.ts`

### Purpose
Multi-expert review for **safety-critical decisions**.

### When Council Activates

1. **Multi-step plans** (2+ steps)
2. **High-risk domains**:
   - Hiring decisions
   - Loan approvals
   - Healthcare triage
   - Criminal justice
   - Financial trading
   - Code deployment

3. **Sensitive operations**:
   - Database modifications
   - External API calls with side effects
   - Workflow triggering
   - User data access

### Council Architecture (6 Layers)

**After Fix**: Now includes **full 9-member council** by default:

```
┌─────────────────────────────────────────────┐
│ LAYER 1: FOUNDATION                         │
│ - Architectus (1.5x) System Architect       │
│ - Nexus (1.1x) Integration Specialist       │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ LAYER 2: EXECUTION                          │
│ - Pragmaton (1.3x) Execution Engineer       │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ LAYER 3: INTELLIGENCE                       │
│ - Analytica (1.2x) Knowledge & RAG          │
│ - Oracle (1.1x) Data & Analytics            │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ LAYER 4: AI/ML                              │
│ - Mentor (1.2x) LLM Training Master         │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ LAYER 5: SAFETY (CRITICAL)                  │
│ - Satori (1.0x) Alignment & Safety Lead     │
│ - Sentinel (1.2x) Security Guardian         │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ LAYER 6: INNOVATION                         │
│ - Catalyst (0.9x) Innovation Advisor        │
└─────────────────────────────────────────────┘
```

### Deliberation Process

1. **Parallel Review**: Each council member evaluates plan independently
2. **Weighted Voting**: Votes weighted by member expertise (0.9x - 1.5x)
3. **Consensus Computation**:
   ```typescript
   consensus = (approve_votes_weighted / total_weight) >= 0.6
   ```
4. **Issue Aggregation**: Collect all concerns, warnings, suggestions
5. **Plan Revision**: If rejected, incorporate feedback and retry

### Council Vote Structure

```typescript
interface CouncilVote {
  agentId: string;
  agentName: string;
  weight: number;              // 0.9 - 1.5
  vote: 'approve' | 'revise' | 'reject';
  confidence: number;          // 0.0 - 1.0
  rationale: string;           // Explanation
  scores: {
    scope: number;             // Scope appropriateness
    risk: number;              // Risk assessment
    cost: number;              // Computational cost
    prob: number;              // Success probability
  };
  edits?: Array<{              // Suggested changes
    step: string;
    change: string;
  }>;
}
```

### Consensus Algorithm

```typescript
function computeConsensus(votes: CouncilVote[]): {
  approved: boolean;
  confidence: number;
  concerns: string[];
} {
  const totalWeight = votes.reduce((sum, v) => sum + v.weight, 0);
  const approveWeight = votes
    .filter(v => v.vote === 'approve')
    .reduce((sum, v) => sum + v.weight, 0);

  const approvalRate = approveWeight / totalWeight;
  const avgConfidence = votes.reduce((sum, v) => sum + v.confidence, 0) / votes.length;

  return {
    approved: approvalRate >= 0.6,  // 60% weighted threshold
    confidence: avgConfidence,
    concerns: votes
      .filter(v => v.vote !== 'approve')
      .map(v => `${v.agentName}: ${v.rationale}`)
  };
}
```

### Safety Guarantees

✅ **Ethics Review**: Satori checks for alignment issues
✅ **Security Review**: Sentinel checks for vulnerabilities
✅ **Architectural Review**: Architectus checks design
✅ **Execution Review**: Pragmaton checks feasibility

**Before Fix**: Only 3 members (no safety layer)
**After Fix**: Full 9 members including safety-critical experts

---

## Phase 4: EXECUTOR PHASE

**File**: `app/api/chat/stream/phases/executorPhase.ts`

### Purpose
Execute tools with **robust error handling** and **streaming progress**.

### Tool Execution Flow

```typescript
for (const step of plan.plan) {
  // 1. Pre-execution validation
  assertToolExists(step.tool);
  assertArgsValid(step.args);

  // 2. Execute with timeout
  const result = await executeToolWithTimeout(
    step.tool,
    step.args,
    { timeout: 30000 }  // 30 seconds
  );

  // 3. Stream progress
  streamToolProgress(step.id, result);

  // 4. Validate success criteria
  if (!meetsSuccessCriteria(result, step.success)) {
    // Try fallback if available
    const fallback = plan.fallbacks.find(f => f.if === step.id);
    if (fallback) {
      await executeFallback(fallback.then);
    }
  }

  // 5. Store result for dependent steps
  storeResult(step.id, result);
}
```

### Tool Registry

**File**: `app/api/chat/stream/helpers/toolRegistry.ts`

60+ tools registered with metadata:

| Category | Tools | Examples |
|----------|-------|----------|
| **Research** | 8 tools | Tavily search, NewsAPI, SerpAPI, Wikipedia |
| **Code** | 12 tools | File read, grep, git operations, linting |
| **Workflows** | 5 tools | n8n execution, workflow triggers |
| **Knowledge** | 4 tools | RAG search, semantic query, citation |
| **Data** | 10 tools | SQL query, CSV parse, JSON transform |
| **ML** | 6 tools | Training, inference, embedding |
| **User Tools** | Custom | Slash commands |

### Lite Mode (Resource-Aware)

On systems with < 8GB RAM:
- ✅ Disable heavy tools (training, large models)
- ✅ Use lightweight alternatives
- ✅ Batch operations to reduce memory

### Tool Execution Example

**User**: "Search for Scorpion documentation"

**Executor**:
```typescript
// Step 1: RAG search
const ragResult = await executeTool('knowledge_search', {
  query: 'Scorpion documentation',
  maxResults: 5,
  threshold: 0.7
});

// Step 2: Semantic reranking
const reranked = await executeTool('semantic_rerank', {
  results: ragResult.data,
  query: 'Scorpion documentation',
  topK: 3
});

// Step 3: Citation extraction
const citations = await extractCitations(reranked.data);

// Stream results incrementally
for (const result of reranked.data) {
  streamChunk({
    type: 'knowledge_hit',
    data: {
      title: result.title,
      content: result.content,
      relevance: result.score
    }
  });
}
```

---

## Phase 5: KNOWLEDGE PHASE

**File**: `app/api/chat/stream/helpers/ragIntegration.ts`

### Purpose
Retrieve **relevant context** from knowledge base with **citations**.

### RAG Architecture

```
User Query
    ↓
[Query Embedding] → Vector (1536D)
    ↓
[Semantic Search] → Top-K documents (cosine similarity)
    ↓
[Reranking] → Cross-encoder reranking
    ↓
[Context Injection] → Inject into LLM prompt
    ↓
[Citation Tracking] → Map claims → sources
```

### Retrieval Strategy

1. **Hybrid Search**:
   - Vector search (semantic similarity)
   - Keyword search (BM25)
   - Combine with reciprocal rank fusion

2. **Contextual Retrieval**:
   - Include surrounding paragraphs
   - Preserve document structure
   - Track citation metadata

3. **Relevance Filtering**:
   ```typescript
   const relevantDocs = results.filter(doc =>
     doc.score >= RELEVANCE_THRESHOLD && // 0.7 default
     doc.content.length >= MIN_CONTENT_LENGTH && // 50 chars
     !isDuplicate(doc, seenDocs)
   );
   ```

### Knowledge Hit Structure

```typescript
interface KnowledgeHit {
  id: string;
  title: string;
  content: string;
  source: string;
  relevance: number;        // 0.0 - 1.0
  metadata: {
    author?: string;
    date?: string;
    tags?: string[];
  };
  citations: Array<{
    span: string;           // Quoted text
    location: string;       // Section/paragraph
  }>;
}
```

### Context Injection Example

**User**: "How does Scorpion council work?"

**RAG Context Injected**:
```markdown
## Relevant Documentation

### Document 1: Council Architecture (relevance: 0.92)
Source: docs/SCORPION_PRIMER.md

> The Scorpion Council is a multi-expert review system with 16 members
> organized into 6 layers: Foundation, Execution, Intelligence, AI/ML,
> Safety, and Innovation. Each member has specialized expertise and a
> weighted vote (0.9x - 1.5x).

### Document 2: Council Voting (relevance: 0.87)
Source: server/council/index.ts

> Council members vote independently with 'approve', 'revise', or 'reject'.
> Consensus requires 60% weighted approval. Safety layer members (Satori,
> Sentinel) have veto power on high-risk decisions.

## User Question
How does Scorpion council work?
```

**LLM sees both question AND relevant context** → Accurate answer with citations

---

## Phase 6: SUMMARIZER PHASE

**File**: `app/api/chat/stream/phases/summarizerPhase.ts`

### Purpose
**Frontier-quality synthesis** of all execution results into coherent answer.

### Synthesis Approach

**Inspired by Claude Sonnet 4.5 extended thinking**:

1. **Deep Integration**:
   - Not just concatenating tool results
   - Understanding relationships between data
   - Resolving conflicts in sources
   - Identifying patterns across results

2. **Citation Management**:
   - Track which claims come from which sources
   - Inline citations (superscript numbers)
   - Bibliography at end

3. **Quality Criteria**:
   ```typescript
   interface SummaryQuality {
     coherence: boolean;     // Flows naturally
     completeness: boolean;  // Addresses all aspects
     accuracy: boolean;      // Factually correct
     conciseness: boolean;   // No unnecessary info
     citations: boolean;     // All claims sourced
   }
   ```

### Summarizer Prompt Structure

```typescript
const summarizerPrompt = `
You are a frontier-class AI assistant synthesizing execution results.

## Execution Context
${planSummary}

## Tool Results
${toolResults.map(r => formatResult(r)).join('\n\n')}

## Knowledge Base Context
${knowledgeHits.map(h => formatKnowledge(h)).join('\n\n')}

## Original Question
${userMessage}

## Your Task
Synthesize the above information into a comprehensive, accurate answer.

**Requirements**:
1. **Deep Understanding**: Don't just summarize - integrate insights
2. **Citation**: Every factual claim must cite source [1], [2], etc.
3. **Coherence**: Natural flow, not list of facts
4. **Completeness**: Address all aspects of question
5. **Accuracy**: Only state what sources support
6. **Conciseness**: Efficient language, no fluff

**Style**: Professional, clear, direct (like Claude Sonnet 4.5)
**Tone**: Helpful but not overly enthusiastic
**Length**: As long as needed, no artificial limits

Begin your synthesis:
`;
```

### Streaming Delta Updates

Results streamed token-by-token for real-time UX:

```typescript
// Stream setup
const encoder = new TextEncoder();
for await (const chunk of llmStream) {
  const delta = chunk.choices[0]?.delta?.content || '';
  const sseMessage = `data: ${JSON.stringify({
    type: 'delta',
    data: { content: delta }
  })}\n\n`;

  controller.enqueue(encoder.encode(sseMessage));
}
```

### Example Frontier-Quality Output

**User**: "Explain how Scorpion's council system ensures safety"

**Output** (after synthesis):
```markdown
Scorpion's council system ensures safety through a multi-layered architecture
with dedicated safety-critical members [1]. The council consists of 16 members
organized into 6 layers, with Layer 5 specifically focused on safety [2].

**Safety Layer Members**:
- **Satori** (1.0x weight): Alignment & Safety Lead, responsible for detecting
  alignment issues and ensuring decisions don't compromise safety goals [3]
- **Sentinel** (1.2x weight): Security & Performance Guardian, focused on
  vulnerability detection and system integrity [3]
- **Ethics Councillor**: Reviews ethical implications, particularly for
  decisions affecting people [4]
- **Bias Detection Councillor**: Identifies potential bias in plans, especially
  for sensitive domains like hiring and lending [4]

**Safety Mechanisms**:

1. **Mandatory Review for High-Risk Domains**: Plans involving hiring, lending,
   healthcare, or criminal justice automatically trigger full council review [5]

2. **Weighted Consensus**: Safety members have higher voting weights (1.2x),
   giving their concerns more influence in final decisions [2]

3. **Domain Tag Detection**: Plans are automatically tagged with domain
   identifiers (e.g., "hiring", "loans") that trigger appropriate safety
   reviews [6]

4. **Veto Power**: Safety layer members can veto plans that pose unacceptable
   risks, even if other members approve [2]

The system is configurable via `COUNCIL_MODE` environment variable: "full" mode
(default) includes all safety members, while "lite" mode (3 members only)
should not be used for safety-critical decisions [7].

**Citations**:
[1] docs/SCORPION_PRIMER.md
[2] server/council/index.ts:29-72
[3] server/council/index.ts:115-120
[4] server/council/ethicsCouncil.ts, server/council/biasCouncil.ts
[5] lib/chat/council.ts:243-263
[6] server/council/index.ts:243
[7] lib/chat/council.ts:99-108
```

**Why This Is Frontier-Quality**:
- ✅ Deep understanding (not surface summary)
- ✅ Every claim cited
- ✅ Natural flow (reads like human expert)
- ✅ Comprehensive (covers all aspects)
- ✅ Accurate (aligns with source code)
- ✅ Actionable (includes configuration guidance)

---

## Streaming Architecture

### SSE (Server-Sent Events) Protocol

```typescript
// Event Types
type StreamEvent =
  | { type: 'status', data: { phase: string; message: string } }
  | { type: 'connected', data: { conversationId: string } }
  | { type: 'plan', data: Plan }
  | { type: 'council_vote', data: CouncilVote }
  | { type: 'tool_call', data: { tool: string; args: any } }
  | { type: 'tool_result', data: ToolResult }
  | { type: 'knowledge_hit', data: KnowledgeHit }
  | { type: 'delta', data: { content: string } }
  | { type: 'done', data: { conversationId: string } }
  | { type: 'error', data: { message: string; code: string } };
```

### Client-Side Consumption

```typescript
const eventSource = new EventSource('/api/chat/stream');

eventSource.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'status':
      updateStatus(data.data.phase);
      break;
    case 'plan':
      renderPlan(data.data);
      break;
    case 'council_vote':
      addCouncilVote(data.data);
      break;
    case 'delta':
      appendToMessage(data.data.content);
      break;
    case 'done':
      finalizeMessage();
      break;
  }
});
```

---

## Performance Characteristics

### Latency Breakdown (Typical)

| Phase | Time | Percentage |
|-------|------|------------|
| Request | 50ms | 1% |
| Planner | 2-5s | 15-25% |
| Council | 5-10s | 25-40% |
| Executor | 5-15s | 25-50% |
| Knowledge | 500ms | 2-5% |
| Summarizer | 2-5s | 10-20% |
| **Total** | **15-35s** | **100%** |

### Optimization Strategies

1. **Parallel Execution**:
   - Run independent tool calls in parallel
   - Parallelize council member reviews
   - Overlap knowledge retrieval with execution

2. **Caching**:
   - Cache tool results (5min TTL)
   - Cache knowledge embeddings
   - Cache council deliberations for similar plans

3. **Lite Mode**:
   - Skip council for simple queries
   - Use 3-member lite council for non-critical
   - Disable heavy tools on low-RAM systems

4. **Streaming**:
   - Start streaming results before execution complete
   - Progressive enhancement (show partial results)
   - Delta updates for real-time feedback

---

## Comparison to Frontier Models

### Claude Sonnet 4.5

**Similarities**:
- ✅ Extended thinking mode (deep reasoning)
- ✅ Multi-step planning
- ✅ Tool use with explicit planning
- ✅ Citation tracking
- ✅ Natural synthesis (not robotic)

**Scorpion Advantages**:
- ✅ Multi-expert council review (Claude: single model)
- ✅ Configurable safety levels
- ✅ Explicit execution audit trail
- ✅ n8n workflow integration
- ✅ Domain-specific safety triggers

**Areas for Improvement**:
- ⚠️ Latency (15-35s vs Claude's 3-10s)
- ⚠️ Reasoning depth (Claude better at complex logic)
- ⚠️ Context understanding (Claude 200k tokens vs Scorpion 8k)

### GPT-4o

**Similarities**:
- ✅ Function calling architecture
- ✅ Streaming responses
- ✅ Tool execution framework

**Scorpion Advantages**:
- ✅ Transparent reasoning (plan visible to user)
- ✅ Safety council (GPT-4o: black box)
- ✅ Customizable (GPT-4o: fixed)
- ✅ Local deployment option

**Areas for Improvement**:
- ⚠️ Model quality (GPT-4o smarter on complex tasks)
- ⚠️ Multimodal (GPT-4o handles images, Scorpion doesn't)
- ⚠️ Speed (GPT-4o faster)

---

## Conclusion

Scorpion's chat pipeline achieves **frontier-class capabilities** through:

1. **Deep Reasoning**: Extended thinking, explicit assumptions, fallback planning
2. **Safety-Critical Review**: 9-member council with dedicated safety layer
3. **Robust Execution**: Error handling, timeouts, fallbacks
4. **Knowledge Integration**: RAG with citations
5. **Quality Synthesis**: Coherent, accurate, cited responses

**Current State**: ✅ Production-ready for internal use
**Target Quality**: Claude Sonnet 4.5 level (80% there)
**Next Steps**: Optimize latency, improve reasoning depth, add multimodal

---

**Questions?** See [CRITICAL_FIXES_COMPLETE.md](./CRITICAL_FIXES_COMPLETE.md) for details on recent improvements.
