# 🦂 SCORPION PRIMER – SHORT VERSION (Paste This)

Paste this into a new chat with any AI (Google Antigravity, Gemini, Claude, etc.) to bring it up to speed on Scorpion:

---

```
SCORPION PRIMER – CONTEXT FOR THIS AI

You are helping me work on Scorpion, my personal AI operating system and agent orchestration platform.

HIGH-LEVEL VISION
  • Scorpion is my central AI brain (Next.js local app + KVM2 remote services)
  • It orchestrates: Agents, tools, n8n workflows, RAG (Supabase/Pinecone), MCP tools
  • Long-term: Powers SaaS products (AgentPilot, BitBrain, LightningFlow), but focus now is Scorpion itself

REPO / TECH STACK
  • Monorepo: Turborepo + pnpm
  • Main app: apps/scorpion (Next.js App Router, TypeScript + React)
  • Remote: n8n on KVM2 (workflows, LLMs, automation)
  • Packages: scorpion-core/, agent-factory/, shared-types/, shared-helpers/

CORE SCORPION CONCEPTS – THE PIPELINE
  The heart of Scorpion is Plan → Council → Tools → Result:
  
  1. PLANNER: Takes user request, breaks into steps
  2. COUNCIL: Multiple expert agents discuss/critique the plan
  3. TOOLS: Execute tools, n8n workflows, RAG queries
  4. KNOWLEDGE: Retrieve context from RAG (vector store)
  5. RESULT: LLM integrates all results into summary
  
  Flow: Request → Plan breakdown → Council votes → Tool execution → Knowledge enrichment → Final summary

WHEN YOU SEE FILE PATHS
  • apps/scorpion/app/api/chat/stream/route.ts — Main chat endpoint
  • apps/scorpion/lib/orchestrator/run-pipeline.ts — Core pipeline (Plan→Council→Tools→Result)
  • apps/scorpion/lib/tools/*.ts — Individual tool implementations
  • apps/scorpion/lib/agents/*.ts — Agent definitions (Planner, Council, Executor)
  • apps/scorpion/lib/knowledge/*.ts — RAG, vector store, knowledge retrieval
  • apps/scorpion/lib/ai-ml/*.ts — LLM integrations (OpenAI, Ollama, Gemini, etc.)
  • apps/scorpion/components/* — React UI components
  • packages/* — Shared types, helpers, utils

ARCHITECTURAL GOALS
  ✓ Keep Scorpion modular (avoid monolithic files)
  ✓ Prefer lib/, packages/, utils/ helpers over inline logic
  ✓ Respect existing flows (don't remove MCP/n8n/RAG hooks)
  ✓ Move toward: Clean event-driven architecture
  ✓ TypeScript-first, strong typing

HOW TO WORK WITH ME
  1. Ask for or find the relevant file(s)
  2. Summarize what it currently does
  3. Identify improvements (structure, typing, responsibility split)
  4. Keep behavior consistent (don't change business logic silently)
  5. Show full functions/components you modify (not tiny line patches)
  6. Explain important invariants (e.g., "Plan always has X shape")

YOUR JOB
  Help evolve Scorpion into a clean, modular, multi-agent AI OS that orchestrates tools/workflows (n8n, MCP, RAG) without breaking current structure.

I will now send specific files, errors, or tasks.
```

---

## How to Use

1. **Start a new chat** with the AI (Google Antigravity, Gemini, etc.)
2. **Paste the section above** (between the triple backticks) as your first message
3. **Immediately follow** with:
   - "Here's the file I'm working on:" + code snippet, OR
   - "Here's the error:" + error log + relevant file
4. **Reference this primer** in follow-ups like: "This is in the Planner phase, which is in `lib/orchestrator/run-pipeline.ts`"

---

## For Longer Contexts

If you need more detail, reference the **Master Primer**:

```
See docs/SCORPION_PRIMER.md for:
  - Full architecture explanation
  - Complete file structure map
  - Agent roles and responsibilities
  - Detailed execution flow diagrams
  - Development guidelines (add tools, agents, modify pipeline)
  - Debugging & troubleshooting guide
```

---

**Updated**: 2025-01-27
