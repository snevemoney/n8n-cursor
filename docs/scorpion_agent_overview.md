# ⚠️ This Documentation Has Been Consolidated

**This file has been merged into:** [`docs/AGENT_SETUP_DOCUMENTATION.md`](./AGENT_SETUP_DOCUMENTATION.md)

Please refer to the consolidated documentation for the most up-to-date and comprehensive information about Scorpion's agent system.

---

# Scorpion Agent Architecture Overview (Archived)

**Generated:** 2025-01-XX  
**Status:** ⚠️ **ARCHIVED** - See [`AGENT_SETUP_DOCUMENTATION.md`](./AGENT_SETUP_DOCUMENTATION.md) for current documentation  
**Purpose:** Comprehensive documentation of Scorpion's chat agent system, including planning, council deliberation, tool execution, and knowledge base retrieval.

---

## Table of Contents

1. [Main Chat Agent Behavior](#main-chat-agent-behavior)
2. [System Prompts](#system-prompts)
3. [Tool System](#tool-system)
4. [Knowledge Base / RAG System](#knowledge-base--rag-system)
5. [Council of Experts](#council-of-experts)
6. [Orchestration Flow](#orchestration-flow)
7. [Current Issues & Observations](#current-issues--observations)

---

## Main Chat Agent Behavior

### Primary Entry Point

**File:** `apps/scorpion/app/api/chat/stream/route.ts`

This is the main SSE (Server-Sent Events) streaming endpoint that orchestrates the entire chat-AGI process. It implements a 4-phase pipeline:

1. **PLANNER** → Analyzes user intent and creates execution plan
2. **COUNCIL** → Expert review (optional, based on plan decision)
3. **EXECUTOR** → Executes tools from the plan
4. **SUMMARIZER** → Synthesizes results into final answer

### Key Functions

- **`POST(req: NextRequest)`**: Main handler that creates a ReadableStream for SSE
- **`analyzeConversationHistory()`**: Analyzes previous messages to detect repetition patterns
- **`generateToolsList()`**: Dynamically generates tool list for planner prompt
- **`executeTool()`**: Executes individual tools from plan steps

### Flow Summary

```
User Message
  ↓
[Cache Check] → If cached, return immediately
  ↓
[User Tool Detection] → If detected, execute directly (bypass planner)
  ↓
[PLANNER Phase]
  - Loads: `lib/prompts/planner.system.txt`
  - Analyzes conversation history for anti-repetition
  - Generates plan JSON with steps, tools, dependencies
  - Decides: needsCouncil (true/false)
  ↓
[COUNCIL Phase] (if needsCouncil === true)
  - Loads: `lib/prompts/council.system.txt`
  - Calls: `runCouncilDeliberationStreaming()` from `lib/chat/council.ts`
  - 9 expert agents vote: approve/revise/reject
  - Computes consensus
  ↓
[EXECUTOR Phase]
  - Executes plan steps sequentially (respecting dependencies)
  - Calls: `executeTool(name, args)` for each step
  - Collects results
  ↓
[SUMMARIZER Phase]
  - Loads: `lib/prompts/summarizer.system.txt`
  - Builds context from: plan results, council consensus, knowledge hits
  - Generates final answer
  - Streams response to client
```

---

## System Prompts

### Location

All system prompts are stored in: `apps/scorpion/lib/prompts/`

### Files

1. **`planner.system.txt`** - PLANNER agent prompt
2. **`council.system.txt`** - COUNCIL agent prompt  
3. **`summarizer.system.txt`** - SUMMARIZER agent prompt

### Prompt Loading

Prompts are loaded via `getPromptPath(filename)` function in `route.ts`:

```typescript
function getPromptPath(filename: string): string {
  // Tries multiple paths:
  // 1. apps/scorpion/lib/prompts/{filename}
  // 2. Project root relative path
  // 3. Fallback with cleaned cwd
}
```

### Planner Prompt (`planner.system.txt`)

**Purpose:** Creates execution plans with tool steps

**Key Features:**
- Anti-repetition enforcement (analyzes conversation history)
- Tool diversity requirements
- Council decision logic (`needsCouncil: true/false`)
- Question type detection (`casual|technical|conversational`)

**Output Format:** JSON plan structure:
```json
{
  "objective": "...",
  "assumptions": ["..."],
  "plan": [
    {"id": "s1", "title": "...", "tool": "...", "args": {...}, "dependsOn": [...]}
  ],
  "done_when": ["..."],
  "needsCouncil": true/false,
  "questionType": "casual|technical|conversational",
  "councilRationale": "..."
}
```

**Anti-Repetition System:**
- Analyzes conversation history to detect frequently used tools/files
- Enforces tool diversity (warns against repeating same tools)
- Suggests unused tools as alternatives

### Council Prompt (`council.system.txt`)

**Purpose:** Expert review of plans (for technical questions)

**9 Expert Agents:**
1. **Architectus** - System architecture & scope fit
2. **Analytica** - Knowledge/RAG strategy & sources
3. **Pragmaton** - Execution reliability & rollout
4. **Satori** - Alignment, safety, and user intent
5. **Nexus** - Integrations & data contracts
6. **Sentinel** - Security & performance risks
7. **Catalyst** - Innovation vs. complexity ROI
8. **Oracle** - Metrics, success criteria, and observability
9. **Mentor** - LLM training, fine-tuning, and model evaluation

**Output Format:** JSON array of votes:
```json
[{
  "agent": "Architectus",
  "vote": "approve|revise|reject",
  "confidence": 0.0-1.0,
  "scores": {"scope": 8, "risk": 3, "cost": 4, "prob": 0.82},
  "rationale": "...",
  "edits": [...]
}]
```

**Council Decision Logic:**
- Called when `plan.needsCouncil === true`
- Typically for technical/architectural questions
- NOT called for casual/conversational questions

### Summarizer Prompt (`summarizer.system.txt`)

**Purpose:** Synthesizes plan results, council consensus, and knowledge hits into final answer

**Key Features:**
- Multi-source synthesis (code files, knowledge base, research, council)
- Priority ordering:
  1. Code files (code.readFile results) - HIGHEST
  2. Knowledge base results (especially README files)
  3. Web research results
  4. Council consensus
- Anti-hallucination rules
- Natural vs. technical output format (based on question type)

**Output Style:**
- **Casual questions:** Natural, conversational, friendly
- **Technical questions:** Structured format with citations and next actions

---

## Tool System

### Location

Tools are defined in: `apps/scorpion/lib/chat/tools/`

### Tool Registry

**File:** `apps/scorpion/lib/chat/tools/index.ts`

**AI-Callable Tools** (used in plans):
```typescript
export const tools = {
  'research.run': research,
  'kb.search': knowledge,        // ← Knowledge base search
  'workflows.trigger': workflows,
  'logs.tail': logs,
  'notifications.post': notifications,
  'agent.deploy': agentDeploy,
  'system.health': systemHealth,
  'project.analyze': projectAnalyze,
  'backup.create': backupCreate,
  'code.readFile': code,         // ← Read code files
  'llm.train': llmTrain,
  'llm.evaluate': llmEvaluate,
};
```

**User Tools** (executed directly, bypass planner):
- Located in: `apps/scorpion/lib/chat/tools/user-tools/`
- Examples: `user.image`, `user.transcribe`, `user.translate`, `user.summarize`, etc.
- Executed when detected via slash command or natural language

### Tool Structure

Each tool follows this pattern:

```typescript
export const name = 'tool.name';
export const label = 'Tool Label';
export const description = 'Tool description';
export const schema = z.object({...}); // Zod schema for validation
export async function handler(args: z.infer<typeof schema>) {
  // Tool implementation
  return { ok: true, data: ... };
}
```

### Tool Execution

**Function:** `executeTool(name: string, args: any)`

**Location:** `apps/scorpion/lib/chat/tools/index.ts`

**Process:**
1. Validates args against tool schema (Zod)
2. Executes handler with timeout (60s for AI tools, 5min for user tools)
3. Returns result object: `{ ok: boolean, data?: any, error?: string }`

### Key Tools

#### `kb.search` (Knowledge Base Search)

**File:** `apps/scorpion/lib/chat/tools/knowledge.ts`

**Purpose:** Search RAG store for relevant documents

**Implementation:**
```typescript
const { getRAGStore } = await import('@/lib/shared-stores');
const store = await getRAGStore();
const results = await store.search(args.query, args.limit);
```

**Returns:**
```typescript
{
  ok: true,
  hits: [{
    id: string,
    title: string,
    url: string,
    description: string,
    spans: [{ text: string }],
    relevance: number,
    source: string,
    metadata: object
  }],
  query: string,
  totalResults: number
}
```

#### `code.readFile`

**File:** `apps/scorpion/lib/chat/tools/code.ts`

**Purpose:** Read code files with optional AST parsing

**Features:**
- Can include AST parsing
- Can include dependency analysis
- Max lines limit

#### `project.analyze`

**File:** `apps/scorpion/lib/chat/tools/project-analyze.ts`

**Purpose:** Analyze project structure and health

**Uses:** RAGStore to search for project knowledge

---

## Knowledge Base / RAG System

### Core Implementation

**Package:** `@scorpion/core` (monorepo package)

**Class:** `RAGStore`

**Location (in monorepo):** `packages/scorpion-core/src/rag/store.ts`

### Access Pattern

**File:** `apps/scorpion/lib/shared-stores.ts`

**Function:** `getRAGStore(): Promise<RAGStore>`

**Initialization:**
```typescript
const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
ragStore = new RAGStore(ollamaUrl, dataDir);
await ragStore.initialize();
```

### RAGStore Features

**From `packages/scorpion-core/src/rag/types.ts`:**

```typescript
interface RAGDocument {
  id: string;
  content: string; // Full text representation
  metadata: {
    source: string;
    type: string;
    category: string;
    tags: string[];
    extractedAt: string;
    indexingStrategy?: 'chunk' | 'summary' | 'query' | 'sub-chunk';
    isTestFile?: boolean; // Pre-computed flags
    isReadme?: boolean;
    isDoc?: boolean;
    filePath?: string;
    contentUrl?: string;
    codeSnippets?: Array<{...}>;
  };
  embedding?: number[]; // Vector embedding
}
```

### Search Method

**Method:** `store.search(query: string, limit: number)`

**Returns:** Array of `RAGDocument` objects with similarity scores

### Indexing

**Orchestrator:** `ProjectKnowledgeOrchestrator`

**Location:** `packages/scorpion-core/src/knowledge/project-knowledge.ts`

**Purpose:** Extracts and indexes project knowledge into RAGStore

**Features:**
- Chunking strategies
- Metadata extraction
- Embedding generation (via Ollama)

### Knowledge Base Integration Points

1. **Tool:** `kb.search` → Calls `RAGStore.search()`
2. **Tool:** `project.analyze` → Uses RAGStore for project knowledge
3. **Summarizer:** Receives knowledge hits and prioritizes them
4. **Council:** Can receive knowledge context for deliberation

---

## Council of Experts

### Implementation

**File:** `apps/scorpion/lib/chat/council.ts`

**Main Function:** `runCouncilDeliberationStreaming()`

### Council Members

9 specialized agents (defined in `council.system.txt`):

1. **Architectus** (weight: 1.5) - System Architect
2. **Analytica** (weight: 1.2) - Knowledge & RAG Strategist
3. **Pragmaton** (weight: 1.3) - Execution Engineer
4. **Satori** (weight: 1.0) - Alignment & Safety
5. **Nexus** (weight: 1.1) - Integration Specialist
6. **Sentinel** (weight: 1.2) - Security & Performance
7. **Catalyst** (weight: 0.9) - Innovation Advisor
8. **Oracle** (weight: 1.1) - Data & Analytics
9. **Mentor** (weight: 1.2) - LLM Training & Evaluation

### Council Decision Logic

**When Council is Called:**
- `plan.needsCouncil === true` (set by planner)
- Typically for technical/architectural questions
- NOT for casual/conversational questions

**Process:**
1. Each agent reviews the plan
2. Votes: `approve`, `revise`, or `reject`
3. Provides confidence score and rationale
4. Can propose edits to plan steps
5. Consensus is computed via `computeConsensus(votes)`

### Consensus Computation

**Function:** `computeConsensus(votes: CouncilVote[])`

**Logic:**
- Weighted voting based on agent weights
- Majority vote determines outcome
- Generates summary from rationales

---

## Orchestration Flow

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER MESSAGE RECEIVED                     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Cache Check  │
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │ User Tool?    │
                    └───────┬───────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
         YES│                               │NO
            │                               │
            ▼                               ▼
    ┌───────────────┐           ┌──────────────────┐
    │ Execute User  │           │  PHASE 1:        │
    │ Tool Directly │           │  PLANNER         │
    └───────────────┘           └────────┬─────────┘
                                         │
                            ┌────────────▼────────────┐
                            │ 1. Analyze History     │
                            │ 2. Generate Plan JSON  │
                            │ 3. Decide: needsCouncil │
                            └────────────┬────────────┘
                                         │
                            ┌────────────▼────────────┐
                            │  needsCouncil?          │
                            └────────────┬────────────┘
                                         │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
                 YES│                                       │NO
                    │                                       │
                    ▼                                       ▼
        ┌───────────────────┐                   ┌──────────────────┐
        │  PHASE 2: COUNCIL │                   │  PHASE 3:        │
        └───────────┬───────┘                   │  EXECUTOR        │
                    │                           └────────┬─────────┘
        ┌───────────▼───────────┐                        │
        │ 1. Load council prompt│                        │
        │ 2. Run 9 agents      │                        │
        │ 3. Collect votes     │                        │
        │ 4. Compute consensus │                        │
        └───────────┬───────────┘                        │
                    │                                     │
                    └──────────────┬──────────────────────┘
                                   │
                                   ▼
                        ┌──────────────────┐
                        │ Execute Plan     │
                        │ Steps Sequentially│
                        │ (with dependencies)│
                        └──────────┬───────┘
                                   │
                        ┌───────────▼───────────┐
                        │ Collect Tool Results │
                        └───────────┬───────────┘
                                    │
                                    ▼
                        ┌──────────────────┐
                        │  PHASE 4:        │
                        │  SUMMARIZER      │
                        └──────────┬───────┘
                                   │
                        ┌───────────▼───────────┐
                        │ 1. Build Context     │
                        │    - Plan results    │
                        │    - Council consensus│
                        │    - Knowledge hits  │
                        │ 2. Generate Answer   │
                        │ 3. Stream to Client  │
                        └──────────────────────┘
```

### Phase Details

#### Phase 1: PLANNER

**Input:**
- User message
- Conversation history
- Available tools list (dynamically generated)
- History analysis (frequently used tools/files)

**Process:**
1. Loads `planner.system.txt`
2. Injects conversation history analysis
3. Injects dynamic tools list
4. Calls LLM with planner prompt
5. Parses JSON plan response

**Output:** `Plan` object with steps, dependencies, and `needsCouncil` flag

#### Phase 2: COUNCIL (Conditional)

**Input:**
- Plan from Phase 1
- Knowledge hits (if available)
- User question

**Process:**
1. Loads `council.system.txt`
2. Calls `runCouncilDeliberationStreaming()`
3. Each of 9 agents votes independently
4. Collects votes
5. Computes consensus

**Output:** `CouncilVote[]` and consensus summary

#### Phase 3: EXECUTOR

**Input:**
- Plan steps (possibly revised by council)
- Tool registry

**Process:**
1. Executes steps sequentially
2. Respects `dependsOn` dependencies
3. Calls `executeTool(name, args)` for each step
4. Collects results
5. Handles errors gracefully

**Output:** Array of tool execution results

#### Phase 4: SUMMARIZER

**Input:**
- Plan results
- Council consensus (if available)
- Knowledge hits (if available)
- User question

**Process:**
1. Loads `summarizer.system.txt`
2. Builds context from all sources
3. Prioritizes sources (code > knowledge > research > council)
4. Calls LLM with summarizer prompt
5. Optionally refines response (if not lightweight mode)
6. Streams response to client

**Output:** Final answer (streamed via SSE)

---

## Current Issues & Observations

### Issues Identified

1. **Planning Inconsistency**
   - Planner sometimes skips tools when it should use them
   - Anti-repetition system may be too aggressive, causing tool avoidance
   - Plan quality varies significantly

2. **Council Usage**
   - Council is only called when `needsCouncil === true`
   - Planner's decision logic may be inconsistent
   - Council not always used for questions that would benefit from expert review

3. **Knowledge Base Usage**
   - `kb.search` is not always called when it should be
   - Planner may skip RAG retrieval for questions about Scorpion itself
   - Knowledge hits are not always prioritized correctly in summarizer

4. **Tool Execution**
   - Tools are executed but results may not be fully utilized
   - Error handling exists but could be improved
   - Tool results are sometimes not synthesized well

5. **Output Quality**
   - Responses sometimes contain technical jargon
   - PLAN_STRUCTURE comments were leaking into output (recently fixed)
   - Natural language output format is inconsistent

### Strengths

1. **Well-Structured Architecture**
   - Clear separation of concerns (planner, council, executor, summarizer)
   - Good tool abstraction
   - Solid RAG integration

2. **Anti-Repetition System**
   - Sophisticated conversation history analysis
   - Tool diversity enforcement

3. **Council System**
   - Well-defined expert roles
   - Weighted voting system
   - Consensus computation

4. **RAG Integration**
   - Solid RAGStore implementation
   - Good metadata structure
   - Multiple indexing strategies

### Areas for Improvement

1. **Core Contract Needed**
   - No single source of truth for agent behavior
   - Prompts are duplicated/diverged across files
   - Need unified protocol: Understand → Plan → Consult & Call → Synthesize → Answer

2. **Planning Reliability**
   - Planner should ALWAYS create plans (even for simple questions)
   - Plans should ALWAYS include knowledge base search for questions about Scorpion
   - Tool selection should be more consistent

3. **Council Activation**
   - Clearer rules for when council is needed
   - More consistent activation logic

4. **Knowledge Base Priority**
   - RAG should be called more reliably
   - Better query construction from user messages
   - Improved filtering and summarization of retrieved chunks

5. **Tool Usage**
   - Tools should be preferred over guessing
   - Better error handling and retry logic
   - Improved result synthesis

---

## File Reference

### Core Files

- **Main Orchestrator:** `apps/scorpion/app/api/chat/stream/route.ts` (3132 lines)
- **Council System:** `apps/scorpion/lib/chat/council.ts` (823 lines)
- **Tool Registry:** `apps/scorpion/lib/chat/tools/index.ts`
- **RAG Access:** `apps/scorpion/lib/shared-stores.ts`

### System Prompts

- `apps/scorpion/lib/prompts/planner.system.txt`
- `apps/scorpion/lib/prompts/council.system.txt`
- `apps/scorpion/lib/prompts/summarizer.system.txt`

### Tool Definitions

- `apps/scorpion/lib/chat/tools/knowledge.ts` (kb.search)
- `apps/scorpion/lib/chat/tools/code.ts` (code.readFile)
- `apps/scorpion/lib/chat/tools/project-analyze.ts`
- `apps/scorpion/lib/chat/tools/research.ts`
- `apps/scorpion/lib/chat/tools/system-health.ts`
- `apps/scorpion/lib/chat/tools/logs.ts`
- `apps/scorpion/lib/chat/tools/workflows.ts`
- `apps/scorpion/lib/chat/tools/user-tools/` (user tools)

### RAG Implementation

- **Core:** `packages/scorpion-core/src/rag/store.ts` (RAGStore class)
- **Types:** `packages/scorpion-core/src/rag/types.ts`
- **Orchestrator:** `packages/scorpion-core/src/knowledge/project-knowledge.ts`

### Types

- `apps/scorpion/lib/chat/types.ts` (Plan, CouncilVote, Message, ToolSpec)

---

## Next Steps

Based on this analysis, the following improvements are recommended:

1. **Create Core Contract** (`apps/scorpion/ai/corePrompt.ts`)
   - Unified protocol for all phases
   - Clear rules for council activation
   - Explicit tool usage requirements
   - Knowledge base priority rules

2. **Refactor Planner**
   - Ensure plans ALWAYS include knowledge base search for relevant questions
   - Improve tool selection consistency
   - Better council decision logic

3. **Strengthen Council**
   - Clearer activation rules
   - More consistent expert roles
   - Better integration with knowledge base

4. **Improve RAG Usage**
   - Always call RAG for questions about Scorpion
   - Better query construction
   - Improved result filtering

5. **Tool Reliability**
   - Prefer tools over guessing
   - Better error handling
   - Improved result synthesis

6. **Evaluation Harness**
   - Create test cases to catch regressions
   - Verify planning, council, tools, and RAG usage

---

**End of Documentation**

