# 🦂 SCORPION DEBUGGING PRIMER

**Use this when something is broken or behaving oddly.**

This is a specialized version of the Scorpion Primer focused on **diagnostics, logs, and fixes**.

---

## Quick Triage Flowchart

```
Something's broken?
│
├─ Chat doesn't stream?
│  └─ → See: "CHAT STREAMING ISSUES"
│
├─ Council votes missing?
│  └─ → See: "COUNCIL PHASE ISSUES"
│
├─ Tools don't execute?
│  └─ → See: "TOOL EXECUTION ISSUES"
│
├─ RAG returns nothing?
│  └─ → See: "KNOWLEDGE/RAG ISSUES"
│
├─ LLM responses are slow/wrong?
│  └─ → See: "LLM INTEGRATION ISSUES"
│
├─ Events not saved?
│  └─ → See: "EVENT PERSISTENCE ISSUES"
│
└─ TypeScript errors?
   └─ → See: "BUILD & TYPE ISSUES"
```

---

## CHAT STREAMING ISSUES

**Symptoms:**
- Chat endpoint hangs
- No events appear in UI
- Client receives incomplete response

**Step 1: Check Backend Connectivity**

```bash
# Start Scorpion and tail logs
cd apps/scorpion
pnpm dev

# In another terminal, test streaming endpoint
curl -N -X POST http://localhost:3003/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "hello", "conversationId": "test"}' \
  -v

# Expected: See "event: phase.start..." events streaming back
```

**Step 2: Check emit() is wired**

File: `apps/scorpion/app/api/chat/stream/route.ts`

```typescript
// Look for this pattern:
const controller = new ReadableStreamDefaultController();
const encoder = new TextEncoder();

// And in runPipeline call:
await runPipeline({
  objective: message,
  emit: (event) => {
    // THIS is critical - emit must be defined
    const data = `data: ${JSON.stringify(event)}\n\n`;
    controller.enqueue(encoder.encode(data));
  }
});
```

✅ **Fix**: Ensure `emit` callback is passed and called.

**Step 3: Check LLM provider**

```bash
# Test OpenAI connectivity
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Test Ollama connectivity
curl http://localhost:11434/api/tags

# Test Gemini connectivity
curl "https://generativelanguage.googleapis.com/v1/models?key=$GOOGLE_API_KEY"
```

✅ **Fix**: Verify `.env.local` has correct API keys and endpoints.

**Step 4: Check TypeScript compilation**

```bash
cd apps/scorpion
pnpm build

# Look for errors in app/api/chat/stream/route.ts, lib/orchestrator/run-pipeline.ts
```

✅ **Fix**: Resolve any TypeScript errors.

---

## COUNCIL PHASE ISSUES

**Symptoms:**
- Plan appears, but Council phase is skipped
- Council votes don't show up
- Council LLM errors silently

**Step 1: Check Plan has multiple steps**

Council only runs if plan has > 1 step. Single-step objectives skip council.

File: `apps/scorpion/lib/orchestrator/run-pipeline.ts::executeCouncilPhase()`

```typescript
const needsCouncil = planResult.status === "done" && planResult.payload && 
  typeof planResult.payload === 'object' && 'steps' in planResult.payload &&
  Array.isArray(planResult.payload.steps) &&
  planResult.payload.steps.length > 1;

if (!needsCouncil) {
  // Single-step objective - council skips automatically
  emit({ type: "phase.end", phase: Phase.COUNCIL, result: { status: "skipped" } });
  return { status: "skipped", reason: "single-step objective" };
}
```

**Step 2: Check Council agents are defined**

File: `apps/scorpion/lib/agents/council-voices.ts`

```typescript
// Must have council agents exported:
export const councilMembers = [
  { name: "Architect", role: "...", expertise: ["design"] },
  { name: "Security", role: "...", expertise: ["security"] },
  // ... etc
];
```

✅ **Fix**: Ensure all council agents are defined.

**Step 3: Check modelCouncil() function**

File: `apps/scorpion/app/api/chat/stream/route.ts` or `lib/chat/handler.ts`

```typescript
// Must provide:
const modelCouncil = async (objective, plan) => {
  // Call LLM to get council votes
  const response = await llm.chat({
    messages: [
      { role: "system", content: councilSystemPrompt },
      { role: "user", content: `${objective}\n\nPlan:\n${plan}` }
    ]
  });
  
  // Must return: { votes: [...], summary: "..." }
  return parseCouncilResponse(response);
};
```

✅ **Fix**: Ensure `modelCouncil` is defined and passed to `runPipeline()`.

**Step 4: Check Council prompt**

File: `apps/scorpion/lib/prompts/council.ts`

```typescript
// Should ask for structured JSON output like:
// {
//   "votes": [
//     { "agent": "Architect", "vote": "approve", "note": "..." }
//   ],
//   "summary": "..."
// }
```

✅ **Fix**: Ensure prompt asks for proper JSON structure.

**Debug Logging:**

Add to `lib/orchestrator/run-pipeline.ts::executeCouncilPhase()`:

```typescript
console.log("[DEBUG] Council phase - needsCouncil:", needsCouncil);
console.log("[DEBUG] Plan result:", planResult);

try {
  const council = await inp.modelCouncil(inp.objective, planText);
  console.log("[DEBUG] Council response:", JSON.stringify(council, null, 2));
} catch (e) {
  console.error("[ERROR] Council failed:", e);
}
```

---

## TOOL EXECUTION ISSUES

**Symptoms:**
- Tools phase runs but no tools execute
- Tool errors don't show up
- Wrong tools are selected

**Step 1: Check Tool Registry**

File: `apps/scorpion/lib/orchestrator/tool-registry.ts`

```typescript
// Check if your tool is in TOOL_REGISTRY:
const TOOL_REGISTRY = [
  {
    name: "code-analyzer",
    description: "Analyze code structure",
    tags: ["code", "analyze", "refactor"],  // These are keywords matched to plan steps
    inputSchema: { /* ... */ }
  },
  // YOUR TOOL MUST BE HERE
];

// Tools are selected by matching tags to plan steps
// Example: If plan says "analyze the code", tool with tag "analyze" will be selected
```

✅ **Fix**: Add your tool to `TOOL_REGISTRY` with appropriate tags.

**Step 2: Check Tool Function Exists**

File: `apps/scorpion/lib/tools/your-tool.ts`

```typescript
export async function yourTool(input: YourInput): Promise<YourOutput> {
  // Must be async
  // Must not throw (catch and return error shape)
  // Must return proper shape
  try {
    const result = await doWork(input);
    return { ok: true, result };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// Registry uses this to execute:
const toolFn = require(`../tools/${tool.name}`)[camelize(tool.name)];
const result = await toolFn(toolInput);
```

✅ **Fix**: Create tool function with proper name and export.

**Step 3: Check Tool Tags Match Plan**

File: `apps/scorpion/lib/orchestrator/run-pipeline.ts::executeToolsPhase()`

```typescript
// Tool selection logic:
const selectedTools = selectToolsByTags(step);

// Where selectToolsByTags does:
function selectToolsByTags(step: string): Tool[] {
  const keywords = step.toLowerCase().split(/\s+/);
  return TOOL_REGISTRY.filter(tool => 
    tool.tags.some(tag => keywords.includes(tag))
  );
}

// Example:
// Plan step: "Analyze the code structure and refactor for clarity"
// Keywords: ["analyze", "code", "structure", "refactor", ...]
// Matched tools: Those with tags including "analyze", "code", or "refactor"
```

✅ **Fix**: Ensure tool tags match words in plan steps.

**Step 4: Enable Tool Logging**

Add to `lib/orchestrator/run-pipeline.ts::executeToolsPhase()`:

```typescript
console.log("[DEBUG] Step:", step);
console.log("[DEBUG] Selected tools:", selectedTools.map(t => t.name));

for (const tool of selectedTools) {
  console.log(`[DEBUG] Executing ${tool.name}...`);
  try {
    const result = await executeTool(tool, context);
    console.log(`[DEBUG] ${tool.name} result:`, result);
    emit({ type: "tool.result", tool: tool.name, output: result });
  } catch (e) {
    console.error(`[ERROR] ${tool.name} failed:`, e);
  }
}
```

**Step 5: Test Tool Directly**

```bash
# Create test file: apps/scorpion/lib/tools/__tests__/your-tool.test.ts
import { yourTool } from '../your-tool';

test('yourTool works', async () => {
  const result = await yourTool({ /* input */ });
  expect(result.ok).toBe(true);
});

# Run test
pnpm test lib/tools/your-tool.test.ts
```

---

## KNOWLEDGE/RAG ISSUES

**Symptoms:**
- RAG search returns no results
- Knowledge phase doesn't run
- Embeddings not created

**Step 1: Verify Supabase Connection**

```bash
# Test Supabase endpoint
curl https://your-project.supabase.co/rest/v1/vector_store \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE" \
  -H "apikey: $SUPABASE_ANON_KEY"

# Expected: Returns list of vectors
```

File: `.env.local`

```bash
# Verify these are set:
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE=eyJhbGc...
```

✅ **Fix**: Ensure `.env.local` has correct Supabase credentials.

**Step 2: Check Schema Exists**

File: `apps/scorpion/database/schemas/vector_store.sql`

```sql
-- Must have a table like:
CREATE TABLE vector_store (
  id UUID PRIMARY KEY,
  content TEXT,
  embedding vector(1536),  -- For OpenAI embeddings
  source TEXT,
  created_at TIMESTAMP
);

-- And a search function:
CREATE OR REPLACE FUNCTION search_vectors(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
) RETURNS TABLE (id UUID, content TEXT, similarity FLOAT) AS $$
  SELECT id, content, 1 - (embedding <=> query_embedding) as similarity
  FROM vector_store
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$ LANGUAGE SQL;
```

✅ **Fix**: Ensure schema is created in Supabase.

**Step 3: Check Documents Are Indexed**

```bash
# Check document count
curl https://your-project.supabase.co/rest/v1/vector_store?select=count() \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE"

# If count is 0, re-index:
cd apps/scorpion
pnpm run ingest:knowledge docs/

# Verify:
# Should see: "Indexed N documents"
```

**Step 4: Check RAG Search Logic**

File: `apps/scorpion/lib/knowledge/rag-search.ts`

```typescript
export async function ragSearch(
  query: string,
  options?: { topK?: number }
): Promise<Array<{id: string; snippet: string; source: string}>> {
  // Step 1: Embed query
  const queryEmbedding = await embedQuery(query);
  
  // Step 2: Search Supabase
  const { data } = await supabase.rpc('search_vectors', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: options?.topK || 5
  });
  
  // Step 3: Return formatted results
  return data.map(row => ({
    id: row.id,
    snippet: row.content,
    source: row.source
  }));
}
```

✅ **Fix**: Ensure `embedQuery()` and `supabase.rpc()` are working.

**Step 5: Test RAG**

```bash
# Test embedding and search
curl -X POST http://localhost:3003/api/knowledge/search \
  -H "Content-Type: application/json" \
  -d '{"query": "How does the planner work?"}'

# Expected: Returns array of snippets with sources
```

**Debug Logging:**

```typescript
// Add to lib/knowledge/rag-search.ts
console.log("[DEBUG] Query:", query);
console.log("[DEBUG] Query embedding generated");

const results = await supabase.rpc(...);
console.log("[DEBUG] RAG results count:", results.data?.length);
results.data?.forEach((r, i) => {
  console.log(`[DEBUG] Result ${i}:`, r.content.substring(0, 100));
});
```

---

## LLM INTEGRATION ISSUES

**Symptoms:**
- LLM responses are slow
- Wrong model is used
- API rate limits hit
- LLM errors not visible

**Step 1: Check LLM Router**

File: `apps/scorpion/lib/ai-ml/llm-router.ts`

```typescript
// Must have routing logic like:
export function selectLLM(purpose: "plan" | "council" | "execute"): LLMClient {
  switch (purpose) {
    case "plan": return openaiClient;  // Fast, high-quality
    case "council": return openaiClient;  // Multiple calls needed
    case "execute": return ollamaClient;  // Local if available
    default: return openaiClient;
  }
}
```

✅ **Fix**: Ensure correct LLMs are selected for each phase.

**Step 2: Check LLM Clients are Initialized**

File: `apps/scorpion/lib/ai-ml/openai-client.ts` (and others)

```typescript
export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL
});

// On startup, should test:
try {
  await openaiClient.models.list();
  console.log("[INFO] OpenAI connected");
} catch (e) {
  console.error("[ERROR] OpenAI failed:", e.message);
}
```

✅ **Fix**: Add initialization tests and error logging.

**Step 3: Test Each LLM**

```bash
# Test OpenAI
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" | jq .

# Test Ollama
curl http://localhost:11434/api/tags | jq .

# Test Gemini
curl "https://generativelanguage.googleapis.com/v1/models?key=$GOOGLE_API_KEY" | jq .

# Test Claude (via API)
curl https://api.anthropic.com/v1/models \
  -H "Authorization: Bearer $ANTHROPIC_API_KEY" | jq .
```

**Step 4: Monitor Token Usage**

Add to each LLM call:

```typescript
const response = await llm.chat({ /* ... */ });

// Log usage:
console.log("[TELEMETRY] Tokens:", {
  prompt: response.usage.prompt_tokens,
  completion: response.usage.completion_tokens,
  total: response.usage.total_tokens,
  estimated_cost: response.usage.total_tokens * (0.002 / 1000) // Example: $0.002/1K for gpt-3.5
});
```

**Step 5: Check Model Availability**

```bash
# Verify model exists (not deprecated)
curl https://api.openai.com/v1/models/gpt-4-turbo \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check rate limits:
# Look for 429 errors in logs
# Check OpenAI dashboard for usage: https://platform.openai.com/account/usage
```

✅ **Fix**: Use current model names (e.g., `gpt-4-turbo`, `gpt-4-1106-preview`).

---

## EVENT PERSISTENCE ISSUES

**Symptoms:**
- Events not saved to DB
- Event history is empty
- Can't retrieve past events

**Step 1: Check Event Bus**

File: `apps/scorpion/lib/events/event-bus.ts`

```typescript
export class EventBus {
  async emit(event: Event) {
    // Must do TWO things:
    // 1. Send to listeners (clients)
    this.listeners.forEach(cb => cb(event));
    
    // 2. Persist to DB
    await this.persistEvent(event);
  }
  
  private async persistEvent(event: Event) {
    const { data, error } = await supabase
      .from('events')
      .insert([{ event_type: event.type, payload: event, created_at: new Date() }]);
    
    if (error) console.error("[ERROR] Event persist failed:", error);
  }
}
```

✅ **Fix**: Ensure `persistEvent()` is called on every `emit()`.

**Step 2: Check Events Table**

File: `apps/scorpion/database/schemas/events.sql`

```sql
-- Must have table:
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT,
  payload JSONB,
  created_at TIMESTAMP DEFAULT now(),
  INDEX (created_at)
);
```

✅ **Fix**: Ensure schema is created in Supabase.

**Step 3: Check Supabase Connection in EventBus**

```bash
# Test:
curl https://your-project.supabase.co/rest/v1/events?limit=1 \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE"
```

✅ **Fix**: Verify `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE` in `.env.local`.

**Step 4: Query Event History**

```bash
# Get recent events:
curl "https://your-project.supabase.co/rest/v1/events?order=created_at.desc&limit=10" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE"

# Or from API endpoint:
curl http://localhost:3003/api/events/history?conversationId=test
```

✅ **Fix**: Check if events are being inserted.

---

## BUILD & TYPE ISSUES

**Symptoms:**
- `pnpm build` fails
- TypeScript errors in editor
- Type mismatches in components

**Step 1: Run Type Check**

```bash
cd apps/scorpion

# Full type check
pnpm run type-check

# Or just tsc:
npx tsc --noEmit

# Look for errors in:
# - lib/orchestrator/run-pipeline.ts (types must match)
# - app/api/chat/stream/route.ts (Request/Response types)
# - lib/tools/*.ts (Tool input/output types)
```

**Step 2: Check Type Definitions**

File: `packages/shared-types/index.ts`

```typescript
// Must export core types:
export interface Phase {
  PLAN: "PLAN";
  COUNCIL: "COUNCIL";
  TOOLS: "TOOLS";
  KNOWLEDGE: "KNOWLEDGE";
  RESULT: "RESULT";
}

export interface PhaseStatus {
  status: "done" | "skipped" | "error";
  payload?: unknown;
  reason?: string;
  error?: { code: string; message: string };
}

export interface Tool {
  name: string;
  description: string;
  tags: string[];
  inputSchema: JSONSchema;
  execute: (input: unknown) => Promise<unknown>;
}

// All files must use these types consistently
```

✅ **Fix**: Ensure types are consistent across files.

**Step 3: Fix Common Type Errors**

**Error**: `Property 'status' does not exist on type 'never'`

```typescript
// ❌ Wrong:
const result = await runPipeline({...});
if (result.status === "done") { /* ... */ }  // Type error

// ✅ Right:
const result: ExecutionResult = await runPipeline({...});
if (result.ok) {
  console.log(result.summary);
}
```

**Error**: `Parameter 'emit' is implicitly 'any'`

```typescript
// ❌ Wrong:
function runPipeline(config) { /* ... */ }

// ✅ Right:
type Emit = (event: PhaseEvent) => void;
function runPipeline(config: PipelineInput): Promise<ExecutionResult> {
  // config.emit must be of type Emit
}
```

**Step 4: Rebuild**

```bash
cd apps/scorpion

# Clean and rebuild
rm -rf .next
pnpm build

# Or dev mode with auto-fix:
pnpm dev
```

---

## USEFUL DEBUG COMMANDS

```bash
# Start dev with verbose logging
DEBUG=scorpion:* pnpm dev

# Run tests with output
pnpm test -- --reporter=verbose

# Check pipeline type safety
pnpm exec tsc --noEmit --skipLibCheck

# Stream chat in terminal
curl -N -X POST http://localhost:3003/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Debug test",
    "conversationId": "test",
    "context": {}
  }' \
  -v

# Check all environment variables are set
env | grep -E "OPENAI|SUPABASE|N8N|OLLAMA" | sort

# View recent logs (if using structured logging)
tail -f /var/log/scorpion/app.log | grep -E "PLAN|COUNCIL|TOOLS|ERROR"

# Check git status for unsaved changes
git diff apps/scorpion/lib/orchestrator/
```

---

## ESCALATION CHECKLIST

Before giving up, verify:

- [ ] **Env vars**: `.env.local` has all required keys
- [ ] **Connectivity**: Can reach all external services (OpenAI, Supabase, n8n, Ollama)
- [ ] **Logs**: Checked `pnpm dev` output for errors
- [ ] **Types**: Ran `pnpm run type-check` successfully
- [ ] **Database**: Schema exists in Supabase
- [ ] **Restart**: Killed server and `pnpm dev` again
- [ ] **Branches**: On correct branch (`git branch` should show `scorpion`)
- [ ] **Dependencies**: Ran `pnpm install` recently

If still stuck:
1. Create a minimal test case (`pnpm test`)
2. Paste logs + error into a fresh AI chat with the Short Primer
3. Share the specific file and error message

---

**Last Updated**: 2025-01-27  
**For questions**: Check SCORPION_PRIMER.md or reach out to maintainers
