# 🦂 SCORPION PRIMER – Complete AI Context

**Your personal AI operating system and agent orchestration platform.**

Use this document to bring any new AI up to speed on Scorpion's architecture, codebase, and philosophy. Paste the **Short Version** into new chats; refer to this master doc for detailed context.

---

## 📋 Table of Contents

1. [Short Version (Paste-Ready)](#short-version)
2. [High-Level Vision](#high-level-vision)
3. [Repository Structure](#repository-structure)
4. [Core Architecture](#core-architecture)
5. [Key Components & Modules](#key-components--modules)
6. [Agent Roles & Responsibilities](#agent-roles--responsibilities)
7. [Data Flow & Phase Pipeline](#data-flow--phase-pipeline)
8. [File Paths Quick Reference](#file-paths-quick-reference)
9. [Development Guidelines](#development-guidelines)
10. [Debugging & Troubleshooting](#debugging--troubleshooting)

---

## Short Version

<a id="short-version"></a>

Paste this into a new chat when starting with a fresh AI (Google Antigravity, Gemini, etc.):

```
SCORPION PRIMER – CONTEXT FOR THIS AI

You are helping me work on Scorpion, my personal AI operating system and agent orchestration platform.

High-level vision
  • Scorpion is my central AI brain, running locally (Next.js) and connecting to remote services.
  • It runs on my local machine (Next.js) and connects to:
    – My KVM2 server (n8n workflows, LLMs, etc.)
    – External tools via MCP (Model Context Protocol) tooling
  • Long-term: Scorpion powers SaaS products (AgentPilot, BitBrain, LightningFlow AI), but focus now is on Scorpion itself.

Repo / tech stack
  • Monorepo (Turborepo / pnpm)
  • Main app: apps/scorpion (Next.js App Router, TypeScript + React)
  • n8n side: remote on KVM2 for workflows, LLMs, RAG
  • Integrations: Supabase/Pinecone RAG, Discord, webhooks, MCP tools

Core Scorpion concepts (Pipeline Architecture)
  1. PLANNER: Takes user request → breaks into steps/plan
  2. COUNCIL: Multiple "expert voices" discuss/critique the plan
  3. TOOLS: Agents call tools, n8n workflows, MCP tools, RAG queries
  4. KNOWLEDGE: RAG store with agent schemas, workflow descriptions, project docs
  5. EXECUTION: Tools called, results integrated, summary returned

When you see file paths:
  • apps/scorpion/app/api/chat/stream/route.ts (streaming chat)
  • apps/scorpion/lib/orchestrator/run-pipeline.ts (Plan→Council→Tools→Result)
  • apps/scorpion/lib/tools/* (tool definitions)
  • apps/scorpion/lib/ai-ml/* (LLM integrations)
  • apps/scorpion/lib/knowledge/* (RAG, context retrieval)
  • packages/* (shared types, helpers)

Architectural goals
  • Keep Scorpion modular: avoid monolithic route files
  • Prefer helpers in lib/, packages/, utils/
  • Respect existing flows: Plan→Council→Tools→Knowledge→Result
  • Don't silently remove hooks to MCP, n8n, RAG
  • Move toward: clean event-driven architecture (events persisted, event bus)

How to work with me
  1. Ask for or find the relevant file(s)
  2. Summarize what it currently does
  3. Identify improvements: structure, typing, responsibility split
  4. Keep behavior consistent (don't randomly change business logic)
  5. Show full functions/components you modify (not tiny line patches)

Your job: Help evolve Scorpion into a clean, modular, multi-agent AI OS that orchestrates tools and workflows (n8n, MCP, RAG) without breaking current structure.
```

---

## High-Level Vision

### What is Scorpion?

**Scorpion** is your central AI brain—a personal operating system for managing AI agents, workflows, and operations. Think of it as:

- **Local orchestrator** for multiple AI agents and tools
- **Knowledge hub** that understands your entire ecosystem (Scorpion, AgentPilot, BitBrain, Bitcoin tools, side hustles)
- **Workflow engine** that connects to n8n (remote), RAG, external APIs, and MCP tools
- **Decision-maker** with a "council" of expert voices that critique and refine plans

### Design Philosophy

- **Modular**: Each component has a single responsibility
- **Event-driven**: Changes flow through an event bus (being standardized)
- **Tool-agnostic**: MCP, n8n workflows, custom functions, RAG—all pluggable
- **Knowledge-aware**: RAG store provides context about your ecosystem
- **Transparent**: Clear logging and tracing throughout execution

### Long-term Vision

Scorpion is the foundation for future SaaS products:
- **AgentPilot**: Sell agent orchestration capabilities
- **BitBrain**: Bitcoin/Lightning Network intelligence
- **LightningFlow**: Lightning Network SaaS platform (in development)
- Each product reuses Scorpion's core: orchestrator, council, tools, knowledge

---

## Repository Structure

### Top Level

```
n8n-cursor/
├── apps/
│   ├── scorpion/              # Main Scorpion Next.js app
│   ├── lightningflow/         # Lightning Network SaaS (side hustle)
│   ├── lovable-frontend/      # n8n testing dashboard
│   └── ...
├── packages/                  # Shared code
│   ├── scorpion-core/        # Core Scorpion types, utilities
│   ├── agent-factory/        # Agent instantiation helpers
│   ├── lf-sdk/               # LightningFlow SDK
│   ├── shared-types/         # Shared TypeScript types
│   ├── shared-helpers/       # Shared utilities
│   └── ...
├── infra/                     # Infrastructure (Docker, Caddy, k8s)
├── docs/                      # Documentation
├── database/                  # DB schemas, migrations
└── ...
```

### Scorpion App Structure

```
apps/scorpion/
├── app/
│   ├── api/
│   │   ├── chat/             # Chat streaming, conversation management
│   │   ├── council/          # Council voting, deliberation
│   │   ├── agents/           # Agent endpoints
│   │   ├── tools/            # Tool execution
│   │   ├── knowledge/        # RAG and knowledge retrieval
│   │   ├── operations/       # Operations monitoring
│   │   └── ...
│   ├── (scorpion)/           # Main dashboard routes
│   │   ├── plan/             # Planner UI
│   │   ├── council/          # Council UI
│   │   ├── tools/            # Tools UI
│   │   ├── knowledge/        # Knowledge base UI
│   │   └── dashboard/        # Main dashboard
│   ├── layout.tsx            # Root layout
│   └── globals.css
├── components/               # React components
│   ├── chat/
│   ├── council/
│   ├── planner/
│   ├── tools/
│   └── ...
├── lib/
│   ├── orchestrator/         # ⭐ Core pipeline logic
│   │   ├── run-pipeline.ts  # Main execution (Plan→Council→Tools→Result)
│   │   ├── phases.ts        # Phase definitions
│   │   ├── tool-registry.ts # Tool lookup and selection
│   │   └── ...
│   ├── chat/                # Chat logic
│   ├── tools/               # Tool implementations
│   ├── ai-ml/               # LLM integrations (OpenAI, Ollama, etc.)
│   ├── knowledge/           # RAG, vector stores
│   ├── agents/              # Agent definitions
│   ├── events/              # Event system
│   ├── db/                  # Database queries
│   ├── mcp-n8n-client.ts   # MCP and n8n integrations
│   └── ...
├── hooks/                    # React hooks
├── middleware.ts            # Next.js middleware
├── instrumentation.ts       # Telemetry
└── package.json
```

### Key Packages

```
packages/
├── scorpion-core/           # Core types and utilities
│   ├── types/              # TypeScript types (Agent, Tool, Phase, etc.)
│   ├── utils/              # Shared utilities
│   └── constants/
├── agent-factory/          # Agent creation and instantiation
├── shared-types/           # Shared TypeScript interfaces
└── shared-helpers/         # Shared helper functions
```

---

## Core Architecture

### The Pipeline: Plan → Council → Tools → Result

This is the **heart of Scorpion**. When you send a message, it flows through these phases:

```
User Request
    ↓
[PLANNER] → "Here's my breakdown into steps"
    ↓
[COUNCIL] → "Approve / Revise / Critique"
    ↓
[TOOLS] → Execute selected tools, n8n workflows, RAG queries
    ↓
[KNOWLEDGE] → Retrieve context, integrate results
    ↓
[RESULT] → Summary + sources + artifacts
```

### Phase Definitions

**Phase 1: PLANNER**
- Input: User request + context
- Process: LLM breaks request into logical steps
- Output: `{ steps: string[]; deliverable: string }`
- Location: `lib/orchestrator/run-pipeline.ts::executePlanPhase()`

**Phase 2: COUNCIL**
- Input: Objective + plan
- Process: Multiple expert agents vote (approve/revise/critique)
- Output: `{ votes: Array<{agent, vote, note}>; summary: string }`
- Location: `lib/orchestrator/run-pipeline.ts::executeCouncilPhase()`
- Logic: `if (!needsCouncil) skip` (single-step objectives don't need deliberation)

**Phase 3: TOOLS**
- Input: Plan steps + tool registry
- Process: Select and execute tools (n8n, MCP, RAG, custom)
- Output: Tool results + metadata (sources, timing, costs)
- Location: `lib/orchestrator/run-pipeline.ts::executeToolsPhase()`

**Phase 4: KNOWLEDGE**
- Input: Query string (from steps or context)
- Process: RAG search (Supabase/Pinecone) for relevant docs
- Output: Ranked results with snippets and sources
- Location: `lib/knowledge/*`

**Phase 5: RESULT**
- Input: All phase outputs
- Process: LLM integrates results into summary
- Output: `{ ok: boolean; summary: string; data: {...}; error?: {...} }`
- Location: `lib/orchestrator/run-pipeline.ts::executeResultPhase()`

### Event System

Scorpion uses an event emitter to publish phase events:

```typescript
emit({ type: "phase.start", phase: Phase.PLAN, objective: string });
emit({ type: "phase.end", phase: Phase.PLAN, result: PhaseStatus });
emit({ type: "tool.call", toolName: string, input: unknown });
emit({ type: "tool.result", toolName: string, output: unknown });
// ... and more
```

Events are:
- **Streamed to client** (WebSocket or SSE in chat UI)
- **Persisted** (for audit trail, debugging)
- **Used for telemetry** and monitoring

---

## Key Components & Modules

### `lib/orchestrator/run-pipeline.ts` ⭐

The core orchestrator. Implements the Plan→Council→Tools→Result pipeline.

**Key exports:**
```typescript
export async function runPipeline(input: PipelineInput): Promise<ExecutionResult>
// Where PipelineInput includes:
//   - modelPlan, modelCouncil, kbSearch functions
//   - objective, context
//   - emit callback
```

**Responsibilities:**
1. Call `modelPlan()` to generate steps
2. Call `modelCouncil()` to get expert feedback (skip if single step)
3. Select and execute tools via `executeToolsPhase()`
4. Search knowledge base via `kbSearch()`
5. Integrate results into final summary

### `lib/tools/` (Tool Implementations)

Actual tool code. Examples:
- `lib/tools/code-analyzer.ts` – Analyze code structure
- `lib/tools/rag-retriever.ts` – Query knowledge base
- `lib/tools/n8n-executor.ts` – Trigger n8n workflows
- `lib/tools/mcp-client.ts` – Call MCP tools

### `lib/ai-ml/` (LLM Integration)

Abstractions for different LLM providers:
- `lib/ai-ml/openai-client.ts` – OpenAI / Claude API
- `lib/ai-ml/ollama-client.ts` – Local Ollama
- `lib/ai-ml/gemini-client.ts` – Google Gemini
- Each has: `chat()`, `stream()`, `completions()` methods

### `lib/knowledge/` (RAG & Vector Store)

Knowledge base queries:
- `lib/knowledge/rag-search.ts` – Query Supabase/Pinecone
- `lib/knowledge/knowledge-ingestion.ts` – Index new docs
- Stores: Agent schemas, workflow descriptions, project docs, ecosystem info

### `lib/agents/` (Agent Definitions)

Agent specs and metadata:
- `lib/agents/planner.ts` – Planner agent config
- `lib/agents/council-voices.ts` – Council member definitions
- `lib/agents/executor.ts` – Tool executor agent
- Each agent has: name, role, system prompt, capabilities

### `app/api/chat/stream/route.ts` (Chat Streaming)

Main chat endpoint. Orchestrates:
1. Parse incoming request
2. Create context (conversation history, user info)
3. Call `runPipeline()` with streamed emit
4. Push events to client in real-time

---

## Agent Roles & Responsibilities

Scorpion features multiple "expert voices" that discuss plans:

### Planner Agent
- **Role**: Decompose complex requests into actionable steps
- **Input**: User objective, context (docs, project state)
- **Output**: Structured plan with steps and deliverable
- **Prompt location**: `lib/prompts/planner.ts`

### Council Members (Expert Voices)

Each council member specializes:

1. **Architect** – Critiques system design, modularity, scalability
2. **Security** – Reviews safety, access control, data handling
3. **Performance** – Evaluates efficiency, caching, optimization
4. **Pragmatist** – Questions feasibility, timelines, edge cases
5. **Innovator** – Suggests novel approaches, improvements

Each votes: **approve** / **revise** / **request-context**

### Executor Agent
- **Role**: Select and call tools, n8n workflows, RAG queries
- **Input**: Plan steps, tool registry, context
- **Output**: Tool results + metadata

### Knowledge Agent
- **Role**: Retrieve relevant docs/context from RAG
- **Input**: Query string
- **Output**: Ranked results with snippets

---

## Data Flow & Phase Pipeline

### Detailed Execution Flow

```
Client sends: { message: "Refactor the Planner API", conversationId: "..." }

API endpoint (app/api/chat/stream/route.ts):
  1. Validate request, load conversation history
  2. Create execution context
  3. Call runPipeline() with:
     - objective: "Refactor the Planner API"
     - modelPlan: async (objective) → call OpenAI
     - modelCouncil: async (objective, plan) → call Council agents
     - kbSearch: async (query) → Supabase RAG search
     - emit: (event) → send to client via EventSource/WebSocket

runPipeline() (lib/orchestrator/run-pipeline.ts):

  Phase 1: PLAN
    emit({ type: "phase.start", phase: "PLAN" })
    planResult = await modelPlan("Refactor the Planner API")
    // Returns: { steps: ["Analyze current structure", "Identify issues", "Draft new design", "Implement"], deliverable: "Clean, modular Planner" }
    emit({ type: "phase.end", phase: "PLAN", result: planResult })

  Phase 2: COUNCIL
    if (planResult.steps.length > 1) {
      emit({ type: "phase.start", phase: "COUNCIL" })
      councilVotes = await modelCouncil(objective, planText)
      // Returns: { votes: [{agent: "Architect", vote: "approve", note: "..."}], summary: "Plan is solid, proceed" }
      emit({ type: "phase.end", phase: "COUNCIL", result: councilVotes })
    } else {
      skip council (single-step)
    }

  Phase 3: TOOLS
    emit({ type: "phase.start", phase: "TOOLS" })
    for each step in plan:
      selectedTools = toolRegistry.select(step)  // Match tools to step
      for each tool:
        toolResult = await executeTool(tool, context)
        emit({ type: "tool.result", tool: tool.name, output: toolResult })
    emit({ type: "phase.end", phase: "TOOLS", result: toolsResults })

  Phase 4: KNOWLEDGE
    emit({ type: "phase.start", phase: "KNOWLEDGE" })
    kbResults = await kbSearch(objective, { topK: 5 })
    // Returns: [{ id: "...", snippet: "...", source: "..." }]
    emit({ type: "phase.end", phase: "KNOWLEDGE", result: kbResults })

  Phase 5: RESULT
    emit({ type: "phase.start", phase: "RESULT" })
    finalSummary = await modelResult(all phases' outputs)
    emit({ type: "phase.end", phase: "RESULT", result: finalSummary })
    return { ok: true, summary: finalSummary, data: {...} }

Client receives events in order, updates UI in real-time
```

---

## File Paths Quick Reference

### Chat & Streaming
- `app/api/chat/stream/route.ts` – Main streaming endpoint
- `lib/chat/handler.ts` – Chat business logic
- `components/chat/ChatWindow.tsx` – Chat UI

### Planner
- `lib/orchestrator/run-pipeline.ts` – Plan phase logic
- `lib/prompts/planner.ts` – Planner system prompt
- `components/planner/PlannerUI.tsx` – Planner UI

### Council
- `lib/orchestrator/run-pipeline.ts` – Council phase logic
- `lib/agents/council-voices.ts` – Council member definitions
- `lib/prompts/council.ts` – Council voting prompt
- `components/council/CouncilVoting.tsx` – Council UI

### Tools
- `lib/orchestrator/tool-registry.ts` – Tool lookup, matching
- `lib/tools/*.ts` – Tool implementations
- `app/api/tools/*/route.ts` – Tool API endpoints
- `components/tools/ToolSelector.tsx` – Tools UI

### Knowledge & RAG
- `lib/knowledge/rag-search.ts` – RAG query logic
- `lib/knowledge/knowledge-ingestion.ts` – Index documents
- `app/api/knowledge/search/route.ts` – Knowledge endpoint
- `components/knowledge/KnowledgeBase.tsx` – Knowledge UI

### LLM Integration
- `lib/ai-ml/openai-client.ts` – OpenAI/Claude client
- `lib/ai-ml/ollama-client.ts` – Local Ollama client
- `lib/ai-ml/gemini-client.ts` – Google Gemini client
- `lib/ai-ml/llm-router.ts` – Routes requests to best LLM

### Types & Constants
- `packages/shared-types/index.ts` – Shared TypeScript types
- `packages/scorpion-core/types/` – Core type definitions
- `lib/config/` – Configuration (models, endpoints, etc.)

### Database
- `lib/db/queries.ts` – Supabase queries
- `database/schemas/` – PostgreSQL schemas
- `lib/db/migrations.ts` – DB migrations

### Events & Telemetry
- `lib/events/event-bus.ts` – Event emitter
- `lib/telemetry/tracer.ts` – Tracing
- `lib/logging/logger.ts` – Logging

---

## Development Guidelines

### Adding a New Tool

1. **Define the tool** in `lib/tools/my-tool.ts`:
   ```typescript
   export async function myTool(input: MyToolInput): Promise<MyToolOutput> {
     // Implementation
     return { result: "...", metadata: {...} };
   }
   
   export const myToolSchema = {
     name: "my-tool",
     description: "What it does",
     tags: ["keyword1", "keyword2"],
     inputSchema: { /* JSON Schema */ }
   };
   ```

2. **Register the tool** in `lib/orchestrator/tool-registry.ts`:
   ```typescript
   import { myTool, myToolSchema } from "../tools/my-tool";
   
   TOOL_REGISTRY.push(myToolSchema);
   ```

3. **Create an API endpoint** (optional) at `app/api/tools/my-tool/route.ts`:
   ```typescript
   export async function POST(req: Request) {
     const input = await req.json();
     const result = await myTool(input);
     return Response.json(result);
   }
   ```

4. **Add to UI** (optional) in `components/tools/MyToolWidget.tsx`

### Adding a New Agent Voice to Council

1. **Define the agent** in `lib/agents/council-voices.ts`:
   ```typescript
   export const myAgent = {
     name: "MyAgent",
     role: "What they critique",
     systemPrompt: "You are a ...",
     expertise: ["area1", "area2"]
   };
   ```

2. **Update council voting** in `lib/prompts/council.ts`

3. **Test with `./test-council-voting.sh`** (if available)

### Modifying the Pipeline

The pipeline is in `lib/orchestrator/run-pipeline.ts`. When modifying:

1. **Keep phases isolated**: Each phase should have its own function (`executePlanPhase`, etc.)
2. **Emit events**: Use `emit()` callback at phase start/end and for tool calls
3. **Typed payloads**: Use `PhaseStatus`, `ExecutionResult` types
4. **Error handling**: Catch errors, return proper error shape, don't throw silently
5. **Test with**: `./test-pipeline.sh` or relevant unit tests

### Environment Variables

Key `.env.local` variables:

```bash
# LLM Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
GOOGLE_API_KEY=...

# RAG / Vector Store
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE=...
PINECONE_API_KEY=...

# n8n (Remote Orchestration)
N8N_API_URL=https://n8n.example.com
N8N_API_KEY=...

# MCP Tools
MCP_SERVER_URL=...

# Ollama (Local LLM)
OLLAMA_API_URL=http://localhost:11434

# Other
DISCORD_TOKEN=...
STRIPE_API_KEY=...
```

---

## Debugging & Troubleshooting

### Common Issues

#### 1. Chat endpoint hangs or doesn't stream

**Check:**
- `app/api/chat/stream/route.ts` – Is `emit()` being called?
- Browser DevTools → Network → EventSource connection open?
- Check backend logs: `docker compose logs scorpion`

**Fix:**
- Ensure `emit()` callback is passed to `runPipeline()`
- Check LLM provider connectivity (OpenAI, Ollama, etc.)
- Verify `.env.local` has correct API keys

#### 2. Council votes don't appear

**Check:**
- `lib/orchestrator/run-pipeline.ts::executeCouncilPhase()` – Is it being called?
- Plan has multiple steps (single-step skips council)
- Council LLM provider is working

**Fix:**
- Check `lib/agents/council-voices.ts` – Are agents defined?
- Verify `modelCouncil` function is passed to pipeline
- Check for errors in `executeCouncilPhase()` error handling

#### 3. Tools don't execute

**Check:**
- `lib/orchestrator/tool-registry.ts` – Is tool registered?
- Tool matches step keywords (tags)
- Tool function doesn't throw unexpectedly

**Fix:**
- Verify tool is in `TOOL_REGISTRY`
- Check tool tags match plan step keywords
- Add logging to `lib/orchestrator/run-pipeline.ts::executeToolsPhase()`

#### 4. RAG search returns no results

**Check:**
- Supabase connection: `lib/knowledge/rag-search.ts`
- Documents are indexed: `lib/knowledge/knowledge-ingestion.ts`
- Vector embeddings are created

**Fix:**
- Re-index documents: `./scripts/ingest-knowledge.sh`
- Check Supabase schema: `database/schemas/vector_store.sql`
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE` in `.env.local`

#### 5. LLM responses are slow

**Check:**
- Which LLM provider: OpenAI, Ollama, Gemini?
- Check network latency: `curl -w "@-" -o /dev/null -s https://api.openai.com`
- Monitor token usage

**Fix:**
- Switch to faster model (e.g., gpt-4-turbo instead of gpt-4)
- Use local Ollama for faster responses
- Implement caching in `lib/cache.ts`
- Check `lib/ai-ml/llm-router.ts` for optimal routing

#### 6. Events not persisted

**Check:**
- Event bus persisting to DB?
- `lib/events/event-bus.ts` connected to Supabase?
- Check `app/api/events/` endpoint

**Fix:**
- Ensure events table exists: `database/schemas/events.sql`
- Verify DB connection in `.env.local`
- Check middleware: `lib/api-gateway/middleware.ts`

### Useful Commands

```bash
# Start dev server
pnpm dev

# Run specific tool test
pnpm test lib/tools/my-tool.test.ts

# Run pipeline test
pnpm test lib/orchestrator/run-pipeline.test.ts

# Check LLM connectivity
pnpm run test:llm-health

# Ingest new knowledge
pnpm run ingest:knowledge docs/

# View event logs
curl http://localhost:3003/api/events/history

# Stream chat in terminal
curl -N http://localhost:3003/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "Test", "conversationId": "test"}'
```

### Logging & Tracing

Enable structured logging:

```typescript
import { log } from "@/lib/logging/logger";

log.info("Phase started", { phase: "PLAN", objective });
log.debug("Tool matched", { tool: toolName, step });
log.error("Tool failed", { tool: toolName, error: e.message });
```

Enable tracing (if available):

```bash
TRACE_ENABLED=true pnpm dev
```

View traces: Check your telemetry provider (e.g., OpenTelemetry collector).

---

## Summary

**Scorpion is a multi-agent orchestrator with this core loop:**

```
User Request
  → Planner (break down)
  → Council (deliberate)
  → Tools (execute)
  → Knowledge (enrich)
  → Result (summarize)
```

**Key locations:**
- Pipeline: `lib/orchestrator/run-pipeline.ts`
- Tools: `lib/tools/*.ts` + `lib/orchestrator/tool-registry.ts`
- Agents: `lib/agents/*.ts`
- Chat: `app/api/chat/stream/route.ts`
- Knowledge: `lib/knowledge/*.ts`

**When you get stuck:**
1. Check the file path above
2. Look for logging/emit calls
3. Verify `.env.local` has required keys
4. Run `pnpm test` to catch issues early
5. Check this primer again!

---

**Last Updated**: 2025-01-27  
**Repo**: `n8n-cursor` (branch: `scorpion`)  
**Main Contact**: See README.md for deployment & support
