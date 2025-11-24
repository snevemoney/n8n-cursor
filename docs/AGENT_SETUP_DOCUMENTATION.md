# Agent Setup Documentation

**Last Updated:** 2025-01-15  
**Status:** Complete Analysis

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [System Prompts](#system-prompts)
4. [Council System](#council-system)
5. [Tools System](#tools-system)
6. [RAG/Knowledge Base](#ragknowledge-base)
7. [Chat Orchestration](#chat-orchestration)
8. [Specialized Agents](#specialized-agents)
9. [Agent Operations](#agent-operations)
10. [Configuration & Deployment](#configuration--deployment)

---

## Overview

Scorpion is an AI-powered operations environment with a sophisticated multi-agent system. The architecture consists of:

- **Planner**: Creates execution plans from user queries
- **Council**: Multi-agent deliberation system with 9 specialized agents
- **Executor**: Executes planned tool calls
- **RAG Store**: Vector-based knowledge retrieval system
- **Specialized Agents**: Domain-specific expert agents
- **Tools**: AI-callable and user-triggered tools

---

## System Architecture

### Main Components

```
┌─────────────────────────────────────────────────────────┐
│              Chat Orchestration Layer                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Planner  │→ │ Council  │→ │ Executor │            │
│  └──────────┘  └──────────┘  └──────────┘            │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│   RAG Store  │ │   Tools     │ │ Specialized │
│  (Knowledge) │ │  Registry  │ │   Agents    │
└──────────────┘ └────────────┘ └─────────────┘
```

### Key Files

- **Main Orchestration**: `apps/scorpion/app/api/chat/stream/route.ts`
- **Council System**: `apps/scorpion/lib/chat/council.ts`
- **Planner Prompt**: `apps/scorpion/lib/prompts/planner.system.txt`
- **Council Prompt**: `apps/scorpion/lib/prompts/council.system.txt`
- **Tools Registry**: `apps/scorpion/lib/chat/tools/index.ts`
- **RAG Store**: `packages/scorpion-core/src/rag/store.ts`
- **Types**: `apps/scorpion/lib/chat/types.ts`

---

## System Prompts

### Planner System Prompt

**Location**: `apps/scorpion/lib/prompts/planner.system.txt`

**Purpose**: Creates execution plans from user queries

**Key Features**:
- Anti-repetition enforcement (automatic tool/file replacement)
- Conversation history analysis
- Creative and adaptive planning
- Tool diversity requirements
- Council decision logic

**Planning Strategy**:
1. Analyze conversation history
2. Identify question type (casual/technical/conversational/operational/research/creative)
3. Select tools creatively (avoid repetition)
4. Create plan with steps
5. Decide if council review is needed

**Output Format**: JSON with:
- `objective`: Goal statement
- `assumptions`: List of assumptions
- `plan`: Array of plan steps
- `done_when`: Acceptance criteria
- `needsCouncil`: Boolean
- `questionType`: Type classification
- `councilRationale`: Explanation

**Example Plan Structure**:
```json
{
  "objective": "Understand what LightningFlow is",
  "plan": [
    {"id":"s1","title":"Analyze project structure","tool":"project.analyze","args":{"scope":"apps/lightningflow"}},
    {"id":"s2","title":"Read README","tool":"code.readFile","args":{"path":"apps/lightningflow/README.md"}}
  ],
  "needsCouncil": false,
  "questionType": "casual"
}
```

### Council System Prompt

**Location**: `apps/scorpion/lib/prompts/council.system.txt`

**Purpose**: Multi-agent deliberation on plans

**Council Members** (9 agents):
1. **Architectus** (E-001) - System architecture & scope fit
2. **Analytica** (A-002) - Knowledge/RAG strategy & sources
3. **Pragmaton** (P-003) - Execution reliability & rollout
4. **Satori** (S-004) - Alignment, safety, and user intent
5. **Nexus** (N-005) - Integrations & data contracts
6. **Sentinel** (S-006) - Security & performance risks
7. **Catalyst** (C-007) - Innovation vs. complexity ROI
8. **Oracle** (O-008) - Metrics, success criteria, and observability
9. **Mentor** (M-009) - LLM training, fine-tuning, and model evaluation

**Vote Types**:
- `approve`: Plan is good (minor notes)
- `revise`: Needs concrete edits
- `reject`: Blocking issue + alternative

**Scoring Rubric**:
- Scope fit (0-10)
- Risk (0-10, lower is better)
- Cost/time (0-10, lower is better)
- Probability of success (0-10)

**Output Format**: JSON array of votes:
```json
[{
  "agent": "Architectus",
  "vote": "approve",
  "confidence": 0.85,
  "scores": {"scope":8,"risk":3,"cost":4,"prob":9},
  "rationale": "Plan is well-structured...",
  "edits": []
}]
```

---

## Council System

### Implementation

**Location**: `apps/scorpion/lib/chat/council.ts`

**Key Functions**:
- `runCouncilDeliberation()`: Non-streaming council review
- `runCouncilDeliberationStreaming()`: Streaming council review with real-time events
- `computeConsensus()`: Calculate consensus from votes
- `getCouncilMembers()`: Fetch council members (from API or defaults)
- `getAgentPersonality()`: Get personality profile for each agent

### Council Members Configuration

**Default Members** (if API unavailable):
```typescript
[
  { id: 'E-001', name: 'Architectus', weight: 1.5, role: 'System Architect' },
  { id: 'A-002', name: 'Analytica', weight: 1.2, role: 'Knowledge & RAG Strategist' },
  { id: 'P-003', name: 'Pragmaton', weight: 1.3, role: 'Execution Engineer' },
  { id: 'S-004', name: 'Satori', weight: 1.0, role: 'Alignment & Safety' },
  { id: 'N-005', name: 'Nexus', weight: 1.1, role: 'Integration Specialist' },
  { id: 'S-006', name: 'Sentinel', weight: 1.2, role: 'Security & Performance' },
  { id: 'C-007', name: 'Catalyst', weight: 0.9, role: 'Innovation Advisor' },
  { id: 'O-008', name: 'Oracle', weight: 1.1, role: 'Data & Analytics' },
  { id: 'M-009', name: 'Mentor', weight: 1.2, role: 'LLM Training & Evaluation' },
]
```

**Dynamic Loading**: Tries to fetch from `/api/agents` endpoint first, falls back to defaults

### Personality Profiles

Each agent has a unique personality defined in `getAgentPersonality()`:

- **Architectus**: Methodical, strategic, sees blueprints before buildings
- **Analytica**: Curious, insightful, sees patterns in chaos
- **Pragmaton**: Direct, practical, brutally honest about feasibility
- **Satori**: Thoughtful, principled, ethical compass
- **Nexus**: Technical, focused on connections and interfaces
- **Sentinel**: Vigilant, protective, sees threats everywhere
- **Catalyst**: Energetic, creative, sees possibilities
- **Oracle**: Data-driven, confident, reads signals
- **Mentor**: Knowledgeable, methodical, LLM training expert

### Casual Question Detection

**Function**: `isCasualQuestion()`

Detects if a question is casual/conversational vs technical:

**Casual Patterns**:
- Identity/definition questions ("what is", "who is")
- Preference questions ("which", "prefer", "favorite")
- Simple yes/no questions

**Technical Patterns**:
- Implementation keywords ("implement", "deploy", "build")
- How-to questions ("how to", "how do")
- Error/problem keywords ("error", "bug", "fix")

**Impact**: Casual questions skip council review and get direct answers

---

## Tools System

### Tool Registry

**Location**: `apps/scorpion/lib/chat/tools/index.ts`

### AI-Callable Tools

Tools that the Planner can include in execution plans:

1. **kb.search** - Search knowledge base/RAG
   - Args: `{ query: string, limit: number }`
   - Returns: Knowledge hits with similarity scores

2. **code.readFile** - Read code files
   - Args: `{ path: string, includeAST?: boolean, includeDependencies?: boolean, maxLines?: number }`
   - Returns: File content with optional AST parsing

3. **research.run** - Web research
   - Args: `{ query: string, depth: number, category: string, maxSites: number }`
   - Returns: Structured web findings

4. **workflows.trigger** - Execute n8n workflow
   - Args: `{ workflowId: string, payload: object }`
   - Returns: Run ID and link

5. **logs.tail** - Get recent logs
   - Args: `{ service: string, lines: number }`
   - Returns: Recent log entries

6. **notifications.post** - Send notification
   - Args: `{ message: string, level: string }`
   - Returns: Notification ID

7. **agent.deploy** - Deploy agent
   - Args: `{ agentId: string, config: object }`
   - Returns: Deployment status

8. **system.health** - Check system health
   - Args: `{}`
   - Returns: Health metrics

9. **project.analyze** - Analyze project
   - Args: `{ scope: string }`
   - Returns: Project analysis

10. **backup.create** - Create backup
    - Args: `{ name: string }`
    - Returns: Backup ID

11. **llm.train** - Train LLM
    - Args: `{ config: object }`
    - Returns: Training job ID

12. **llm.evaluate** - Evaluate LLM
    - Args: `{ config: object }`
    - Returns: Evaluation results

### User Tools

Tools executed directly by users (not planned):

1. **user.image** - Generate images (`/image`)
2. **user.transcribe** - Transcribe audio/video (`/transcribe`)
3. **user.design** - Create design layouts (`/design`)
4. **user.content** - Answer questions (`/content`)
5. **user.search** - Web search (`/search`)
6. **user.summarize** - Summarize documents (`/summarize`)
7. **user.marketing** - Marketing copy (`/marketing`)
8. **user.copy** - Ad/product copy (`/copy`)
9. **user.seo** - SEO content (`/seo`)
10. **user.research** - Deep research (`/research-deep`)
11. **user.storyboard** - Storyboards (`/storyboard`)
12. **user.translate** - Translation (`/translate`)
13. **user.grammar** - Grammar check (`/grammar`)
14. **user.simplify** - Simplify text (`/simplify`)
15. **user.tutorial** - Tutorial generation (`/tutorial`)
16. **user.presentation** - Presentation (`/presentation`)
17. **user.workflow** - Workflow auto (`/workflow`)
18. **user.video-clip** - Video clips (`/video-clip`)
19. **user.media-edit** - Media editing (`/media-edit`)
20. **user.purposeful-search** - Purposeful search (`/purposeful-search`)

**Implementation Status**: Some tools marked `implemented: false` are incomplete

### Tool Execution

**Function**: `executeTool(name, args)`

- Validates arguments using Zod schemas
- Executes with 60s timeout
- Handles both AI-callable and user tools
- Returns results or throws errors

### Tool Detection

**Function**: `detectUserTool(message)`

Detects user tools from natural language:
- Slash commands (`/image`, `/search`)
- Natural language patterns ("create image", "generate image")
- Extracts arguments from message

---

## RAG/Knowledge Base

### RAG Store Implementation

**Location**: `packages/scorpion-core/src/rag/store.ts`

### Features

1. **Vector Storage**: Uses embeddings for semantic search
2. **Embedding Generation**: Uses Ollama (default) or OpenAI
3. **Caching**: 
   - Query result cache (5 min TTL)
   - Embedding cache (max 1000 entries)
4. **Adaptive Thresholds**: Different similarity thresholds based on query type
5. **Strategy-Aware Boosting**: Boosts results based on indexing strategy
6. **Persistent Storage**: Saves to disk via PersistentStore

### Query Patterns

Pre-compiled regex patterns for query classification:

- `whatIs`: Definition questions
- `howTo`: Procedural questions
- `technical`: Technical implementation questions
- `casual`: Casual/preference questions

### Adaptive Thresholds

Different similarity thresholds based on query type:

- **What is queries**: 0.4 (higher threshold, avoid irrelevant matches)
- **How to queries**: 0.35 (moderate threshold)
- **Technical queries**: 0.3 (lower threshold, more results)
- **Casual queries**: 0.4 (higher threshold, avoid noise)
- **Default**: 0.35

### Indexing Strategies

- `chunk`: Standard chunking
- `summary`: Summary-based indexing
- `query`: Query-focused indexing
- `sub-chunk`: Sub-chunking for granularity

### Knowledge Ingestion

**Location**: `apps/scorpion/lib/knowledge-ingestion.ts`

- Automatically ingests knowledge domains at startup
- Splits markdown files into sections
- Tracks ingestion status
- Tags documents with domain, type, metadata

### Knowledge Domains

1. **AI Tools Hierarchy** (`docs/knowledge/ai-tools-hierarchy.md`)
2. **System Design** (`docs/knowledge/system-design.md`)
3. **Data Analytics** (`docs/knowledge/data-analytics.md`)
4. **Business Strategy** (`docs/knowledge/business-strategy.md`)
5. **Python Programming** (`docs/knowledge/python-programming.md`)

---

## Chat Orchestration

### Main Flow

**Location**: `apps/scorpion/app/api/chat/stream/route.ts`

**Endpoint**: `POST /api/chat/stream`

### Phases

1. **PLANNER** → Creates execution plan
2. **COUNCIL** → Reviews plan (if needed)
3. **EXECUTOR** → Executes plan steps
4. **SUMMARIZER** → Synthesizes final answer

### Request Format

```typescript
{
  conversationId?: string;
  messages: Message[];
  mode?: string;
  tools?: string[];
  provider?: string;
  model?: string;
}
```

### Response Format

Server-Sent Events (SSE) stream with event types:

- `planner`: Plan created
- `council`: Council deliberation
- `tool`: Tool execution
- `tool_progress`: Tool progress updates
- `plan_step`: Plan step status
- `status`: Status updates
- `content`: Final answer content
- `done`: Stream complete

### Execution Flow

1. **Parse Request**: Validate and extract parameters
2. **Detect User Tool**: Check if user wants direct tool execution
3. **Create Plan**: Call planner with conversation history
4. **Early KB Search**: For casual questions, execute kb.search early
5. **Council Review**: If `needsCouncil: true`, run council deliberation
6. **Execute Plan**: Run plan steps sequentially
7. **Synthesize Answer**: Generate final response from results
8. **Stream Response**: Send SSE events throughout

### Error Handling

- Request validation errors (400)
- Tool execution errors (caught and reported)
- Model errors (fallback responses)
- Timeout handling (60s per tool)

### Caching

- Response cache for common queries (5 min TTL)
- Cache key: First 100 chars of lowercase message
- Max cache size: 100 entries

---

## Specialized Agents

### Agent Registry

**Location**: `apps/scorpion/app/api/agents/specialized/route.ts`

**Endpoint**: `GET /api/agents/specialized` - List agents  
**Endpoint**: `POST /api/agents/specialized` - Execute agent method

### Available Agents

1. **DataAnalyticsAgent** (`data-analytics`)
   - Capabilities: Descriptive/diagnostic/predictive/prescriptive analytics
   - Methods: `analyze()`, `recommendVisualization()`, `suggestMetrics()`, `designMLPipeline()`, `diagnose()`, `forecast()`, `optimize()`

2. **SystemDesignAgent** (`system-design`)
   - Capabilities: Architecture, scalability, design patterns
   - Methods: `design()`, `recommendPattern()`, `evaluateArchitecture()`, `suggestTechnology()`

3. **AIToolsAgent** (`ai-tools`)
   - Capabilities: AI tool selection, agent design patterns
   - Methods: `recommendTool()`, `designAgent()`, `suggestWorkflow()`

4. **BusinessStrategyAgent** (`business-strategy`)
   - Capabilities: Business models, GTM, pricing, competitive analysis
   - Methods: `analyzeBusinessModel()`, `suggestGTM()`, `recommendPricing()`, `competitiveAnalysis()`

5. **PythonExpertAgent** (`python-expert`)
   - Capabilities: Python programming, code review, optimization
   - Methods: `generateCode()`, `reviewCode()`, `optimizeCode()`, `suggestBestPractices()`

6. **LLMTrainingAgent** (`llm-training`)
   - Capabilities: LLM training strategies, hyperparameter optimization
   - Methods: `suggestTrainingStrategy()`, `optimizeHyperparameters()`, `designFineTuning()`

7. **ModelEvaluationAgent** (`model-evaluation`)
   - Capabilities: Model evaluation, benchmarking, performance analysis
   - Methods: `evaluateModel()`, `benchmark()`, `analyzePerformance()`, `compareModels()`

8. **PromptEngineeringAgent** (`prompt-engineering`)
   - Capabilities: Prompt optimization, A/B testing, templates
   - Methods: `optimizePrompt()`, `abTest()`, `generateTemplate()`

### Agent Initialization

All agents require:
- `LLMAdapter`: LLM provider (OpenAI or Ollama)
- `RAGStore`: Knowledge base for context

**Example**:
```typescript
const agent = new DataAnalyticsAgent(llm, ragStore);
const result = await agent.suggestMetrics('e-commerce', 'Online fashion retailer');
```

### Specialized Agent Router

**Location**: `apps/scorpion/lib/chat/specialized-agent-router.ts`

**Function**: `detectSpecializedAgentRoute(question, planSummary)`

Routes questions to appropriate specialized agents based on keywords and patterns.

**Agent Groups**:
- `llm-development`: LLM training, evaluation, prompt engineering
- `data-analytics`: Data analysis questions
- `system-design`: Architecture questions
- `ai-tools`: AI tool questions
- `business-strategy`: Business questions
- `python`: Python programming questions

---

## Agent Operations

### Safe Operations Registry

**Location**: `apps/scorpion/lib/agent-operations.ts`

Defines safe operations that agents can perform 24/7 without breaking anything.

**Operation Types**:
- `analyze`: Read-only analysis
- `review`: Code/documentation review
- `monitor`: Health/performance monitoring
- `optimize`: Suggest optimizations (read-only)
- `cleanup`: Safe cleanup (temp files, old logs)
- `update`: Update dependencies/docs (requires approval)
- `index`: Index knowledge (read-only)
- `test`: Run tests (read-only)
- `scan`: Security/health scans (read-only)
- `suggest`: Make suggestions (read-only)

**Risk Levels**: `none` | `low` | `medium` (never `high` or `critical`)

**Example Operations**:
- Architectus: Analyze project structure, review dependencies
- Analytica: Index documentation, analyze RAG quality
- Pragmaton: Monitor execution times, suggest optimizations
- Sentinel: Security scans, performance monitoring

### Agent Operations Executor

**Location**: `apps/scorpion/lib/agent-operations-executor.ts`

Executes safe operations with:
- Scheduling
- Error handling
- Result tracking
- Approval workflow (for operations requiring approval)

### Agent Operations Scheduler

**Location**: `apps/scorpion/lib/agent-operations-scheduler.ts`

Schedules operations based on:
- Frequency (maxFrequency in minutes)
- Triggers (event-based)
- Agent availability

---

## Configuration & Deployment

### Environment Variables

- `SCORPION_MODEL_SOURCE`: `openai` or `ollama` (default: `ollama`)
- `OLLAMA_MODEL`: Model name (default: auto-selected based on RAM)
- `OLLAMA_URL`: Ollama server URL (default: `http://localhost:11434`)

### Model Selection

**Function**: `getRecommendedModelForRAM()`

Automatically selects model based on available RAM:
- High RAM: Larger models
- Low RAM: Smaller models

### Agent Storage

**Location**: `apps/scorpion/lib/agent-storage.ts`

Stores agent configurations, deployments, and execution history.

### API Endpoints

1. **Chat Stream**: `POST /api/chat/stream`
2. **List Agents**: `GET /api/agents`
3. **Specialized Agents**: `GET /api/agents/specialized`
4. **Execute Agent**: `POST /api/agents/specialized`
5. **Deploy Agent**: Via `agent.deploy` tool

---

## Summary

### Key Components

1. **Planner**: Creates adaptive, non-repetitive execution plans
2. **Council**: 9-agent deliberation system with unique personalities
3. **Tools**: 12 AI-callable + 20 user tools
4. **RAG Store**: Vector-based knowledge retrieval with adaptive thresholds
5. **Specialized Agents**: 8 domain-specific expert agents
6. **Orchestration**: 4-phase execution (Plan → Council → Execute → Summarize)

### Design Principles

1. **Anti-Repetition**: Automatic tool/file replacement to avoid patterns
2. **Adaptive Planning**: Creative tool selection based on context
3. **Multi-Agent Deliberation**: Council review for complex plans
4. **Knowledge Grounding**: RAG integration for context-aware responses
5. **Streaming**: Real-time SSE events for transparency
6. **Error Resilience**: Comprehensive error handling and fallbacks

### Next Steps

1. Monitor agent performance and adjust weights
2. Expand specialized agent capabilities
3. Improve RAG retrieval quality
4. Add more tools as needed
5. Optimize execution performance

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

### Recommended Improvements

Based on current observations, the following improvements are recommended:

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

**Documentation Complete** ✅

