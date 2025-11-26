# 🦂 SCORPION QUICK REFERENCE

**One-pager for fast lookups. Bookmark this.**

---

## Pipeline at a Glance

```
User Request
    ↓
[PLANNER] → Break into steps
    ↓
[COUNCIL] → Multiple agents vote (if multi-step)
    ↓
[TOOLS] → Execute selected tools, workflows, RAG
    ↓
[KNOWLEDGE] → Retrieve relevant context
    ↓
[RESULT] → LLM integrates, summarizes
```

---

## File Locations (Muscle Memory)

| What | Where |
|------|-------|
| **Pipeline core** | `lib/orchestrator/run-pipeline.ts` |
| **Tool registry** | `lib/orchestrator/tool-registry.ts` |
| **Tools impl** | `lib/tools/*.ts` |
| **Agents** | `lib/agents/*.ts` |
| **Agent prompts** | `lib/prompts/*.ts` |
| **RAG/Knowledge** | `lib/knowledge/*.ts` |
| **LLM clients** | `lib/ai-ml/*.ts` |
| **Chat endpoint** | `app/api/chat/stream/route.ts` |
| **Types** | `packages/shared-types/` |
| **Supabase queries** | `lib/db/queries.ts` |
| **Events** | `lib/events/event-bus.ts` |
| **Tests** | `tests/` or `__tests__/` next to source |

---

## Common Tasks

### Add a New Tool

```bash
# 1. Create tool file
cat > apps/scorpion/lib/tools/my-tool.ts << 'EOF'
export async function myTool(input: Input): Promise<Output> {
  // Implementation
  return { ok: true, result: "..." };
}

export const myToolSchema = {
  name: "my-tool",
  description: "What it does",
  tags: ["keyword1", "keyword2"],
  inputSchema: { /* JSON Schema */ }
};
EOF

# 2. Register in registry
# Edit: apps/scorpion/lib/orchestrator/tool-registry.ts
# Add: import { myTool, myToolSchema } from "../tools/my-tool";
# Add: TOOL_REGISTRY.push(myToolSchema);

# 3. Test
pnpm test lib/tools/my-tool.test.ts
```

### Add a Council Agent

```bash
# 1. Edit: apps/scorpion/lib/agents/council-voices.ts
# Add:
export const newAgent: Agent = {
  name: "NewAgent",
  role: "What they critique",
  systemPrompt: "You are a ...",
  expertise: ["area1"]
};

# 2. Edit: apps/scorpion/lib/prompts/council.ts
# Update council prompt to include new agent

# 3. Test
./test-council-voting.sh
```

### Debug Chat Streaming

```bash
# Check if events stream
curl -N -X POST http://localhost:3003/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "conversationId": "test"}'

# Expected: See "data: {event...}" lines streaming
```

### Fix LLM Issues

```bash
# Verify connectivity
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check .env.local has keys:
env | grep -E "OPENAI|ANTHROPIC|GOOGLE|OLLAMA"

# Restart with debug
DEBUG=scorpion:* pnpm dev
```

### Index New Documents for RAG

```bash
cd apps/scorpion
pnpm run ingest:knowledge docs/my-docs/

# Verify indexed
curl "https://your-project.supabase.co/rest/v1/vector_store?select=count()" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE"
```

---

## Environment Variables (Minimal)

```bash
# Required for chat to work
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE=eyJ...

# Optional (if using remote LLM)
OLLAMA_API_URL=http://localhost:11434

# Optional (if using n8n)
N8N_API_URL=https://n8n.example.com
N8N_API_KEY=...
```

---

## Key Types

```typescript
// Phase (enum)
"PLAN" | "COUNCIL" | "TOOLS" | "KNOWLEDGE" | "RESULT"

// Phase Status
{ status: "done" | "skipped" | "error"; payload?: unknown; error?: { code; message } }

// Tool
{ name: string; description: string; tags: string[]; inputSchema: JSONSchema; execute: (input) => Promise<output> }

// Agent
{ name: string; role: string; systemPrompt: string; expertise: string[] }

// Event
{ type: "phase.start" | "phase.end" | "tool.call" | "tool.result"; phase?: string; ... }

// Execution Result
{ ok: boolean; summary: string; data?: { method?; tool?; result?; sources?; hits?; blocks? }; error?: { code; message } }
```

---

## Phase Details

| Phase | Input | Output | Condition |
|-------|-------|--------|-----------|
| **PLAN** | objective, context | `{ steps: [], deliverable: "" }` | Always runs |
| **COUNCIL** | objective, plan | `{ votes: [], summary: "" }` | `steps.length > 1` |
| **TOOLS** | plan steps, registry | `{ results: [], metadata: {} }` | Always runs |
| **KNOWLEDGE** | query string | `{ hits: [], sources: [] }` | If RAG enabled |
| **RESULT** | all phase outputs | `{ ok: true, summary: "", data: {...} }` | Always runs |

---

## Debugging Checklist

✅ **Chat hangs?**
- Check: `.env.local` has `OPENAI_API_KEY`
- Check: `emit()` callback in `app/api/chat/stream/route.ts`
- Test: `curl -N http://localhost:3003/api/chat/stream ...`

✅ **Council missing?**
- Check: Plan has >1 step
- Check: `lib/agents/council-voices.ts` exports agents
- Check: `modelCouncil` passed to `runPipeline()`

✅ **Tools not running?**
- Check: Tool registered in `lib/orchestrator/tool-registry.ts`
- Check: Tool tags match plan step keywords
- Test: `pnpm test lib/tools/my-tool.test.ts`

✅ **RAG empty?**
- Check: `pnpm run ingest:knowledge docs/`
- Check: `SUPABASE_SERVICE_ROLE` in `.env.local`
- Test: `curl "...supabase.co/rest/v1/vector_store?select=count()"`

✅ **Type errors?**
- Run: `pnpm run type-check`
- Check: `packages/shared-types/` has correct types
- Fix: Ensure function signatures match `PipelineInput` etc.

✅ **LLM slow?**
- Check: Using fast model (`gpt-4-turbo`, not `gpt-4`)
- Check: API rate limits not hit
- Try: Local `OLLAMA_API_URL` for testing

---

## Commands

```bash
# Development
pnpm dev                          # Start dev server
pnpm build                        # Build for prod
pnpm test                         # Run all tests
pnpm test lib/tools/my-tool.test.ts  # Single test

# Type safety
pnpm run type-check              # Check all types

# Deployment
pnpm run deploy:prod             # Deploy to production
./scripts/health-check.sh        # Verify services

# Knowledge base
pnpm run ingest:knowledge docs/  # Index documents
pnpm run clear:vectors           # Clear vector store

# Debugging
DEBUG=scorpion:* pnpm dev        # Verbose logging
tail -f /var/log/scorpion.log    # View logs (if available)
```

---

## Useful URLs

| Service | URL | Port |
|---------|-----|------|
| Scorpion App | http://localhost:3003 | 3003 |
| Chat Stream | http://localhost:3003/api/chat/stream | 3003 |
| Knowledge Search | http://localhost:3003/api/knowledge/search | 3003 |
| Supabase Console | https://app.supabase.com | — |
| OpenAI Dashboard | https://platform.openai.com | — |
| n8n (remote) | https://n8n.example.com | — |
| Ollama API | http://localhost:11434 | 11434 |

---

## Architecture Principles (Memorize These)

1. **Pipeline**: Plan → Council → Tools → Knowledge → Result
2. **DI**: Pass dependencies in (don't import globally)
3. **Events**: Emit at key points, persist to DB
4. **Tools**: Registry-based, dynamic selection by tags
5. **Agents**: Role-based, config-driven
6. **Types**: Strong typing, no `any`
7. **Errors**: Catch, log, emit (don't throw silently)
8. **Modularity**: <300 lines per file, one responsibility

---

## Common Patterns

**Register a tool:**
```typescript
import { myTool, myToolSchema } from "../tools/my-tool";
TOOL_REGISTRY.push(myToolSchema);
```

**Emit an event:**
```typescript
emit({ type: "phase.start", phase: "PLAN", objective });
```

**Call an LLM:**
```typescript
const response = await llm.chat({
  system: "You are...",
  user: "Question",
  temperature: 0.7
});
```

**Query RAG:**
```typescript
const results = await kbSearch("my query", { topK: 5 });
```

**Handle errors:**
```typescript
try {
  // ...
} catch (e) {
  log.error("Phase failed", { error: e.message });
  emit({ type: "phase.error", error: { code: "PHASE_FAIL", message: e.message } });
  return { status: "error", error: { code: "PHASE_FAIL", message: e.message } };
}
```

---

## When to Use Each Primer

| Situation | Use |
|-----------|-----|
| **New AI, fresh start** | Short Version (`SCORPION_PRIMER_SHORT.md`) |
| **Detailed understanding** | Master Primer (`SCORPION_PRIMER.md`) |
| **Something's broken** | Debugging Primer (`SCORPION_DEBUGGING_PRIMER.md`) |
| **Designing/refactoring** | Architect's Primer (`SCORPION_ARCHITECTS_PRIMER.md`) |
| **Quick lookup (file, command, type)** | This Quick Reference (you are here) |

---

**Last Updated**: 2025-01-27  
**For detailed info**: See specific primers in `docs/`  
**Questions?** Check the relevant primer or start a fresh chat with the Short Version
