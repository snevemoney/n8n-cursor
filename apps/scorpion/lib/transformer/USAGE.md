# Transformer Architecture Usage Guide

Complete guide for using and validating the transformer orchestrator.

## Quick Start

### 1. Enable Transformer Orchestrator

```bash
# Development
export USE_TRANSFORMER_ORCHESTRATOR=true
export TRANSFORMER_DEBUG=true
export USE_OPENAI_EMBEDDINGS=true

# Or in .env.local
USE_TRANSFORMER_ORCHESTRATOR=true
TRANSFORMER_DEBUG=true
USE_OPENAI_EMBEDDINGS=true
```

### 2. Run Smoke Tests

```bash
cd apps/scorpion
pnpm run test:transformer
```

This will run:
- Tool selection test
- Safe execution test (read-only)
- Council bridge test

### 3. Test in Chat

Send a message in the chat interface. If `USE_TRANSFORMER_ORCHESTRATOR=true`, it will use the transformer pipeline.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `USE_TRANSFORMER_ORCHESTRATOR` | Enable transformer orchestrator | `false` |
| `TRANSFORMER_DEBUG` | Enable debug logging | `false` |
| `USE_OPENAI_EMBEDDINGS` | Use OpenAI for embeddings (otherwise Ollama) | `false` |
| `ENABLE_TRANSFORMER_FOR_USERS` | Comma-separated list of user IDs to enable for | - |
| `SCORPION_SYSTEM_PROMPT` | Override system prompt (optional) | - |

## User-Specific Enablement

For production, enable only for specific users:

```bash
# Enable for specific users
ENABLE_TRANSFORMER_FOR_USERS=evens,admin1,admin2
USE_TRANSFORMER_ORCHESTRATOR=true
```

The code checks:
```typescript
if (userId === "evens" && shouldUseTransformerOrchestration()) {
  // Use transformer
}
```

## Smoke Tests

### Test 1: Tool Selection

Validates that the ResourceIndex can find relevant tools:

```typescript
import { testToolSelection } from '@/lib/transformer/smoke-tests';

await testToolSelection();
```

**Expected Output:**
- Top 5 tools with scores
- Integration plan with chosen tools
- Risk level assessment

### Test 2: Safe Execution

Validates read-only tool execution:

```typescript
import { testSafeExecution } from '@/lib/transformer/smoke-tests';

await testSafeExecution();
```

**Expected Output:**
- Execution results (success/failure)
- Events appended to context
- No destructive operations

### Test 3: Council Bridge

Validates council system integration:

```typescript
import { testCouncilBridge } from '@/lib/transformer/smoke-tests';

await testCouncilBridge();
```

**Expected Output:**
- Multiple head outputs (Architectus, Analytica, etc.)
- Merged integration plan
- Risk assessment

## Debug Logging

When `TRANSFORMER_DEBUG=true`, you'll see:

### Attention Queries
```
[Transformer] Attention Query: {
  query: "import workflow",
  topResults: [
    { id: "tool:workflows.trigger", score: 0.892, ... }
  ]
}
```

### Head Outputs
```
[Transformer] Head Outputs: {
  heads: [
    { name: "planner", priorities: [...], actions: [...] },
    { name: "architectus", priorities: [...], ... }
  ]
}
```

### Decoder Blocks
```
[Transformer] Decoder Block {
  blockNumber: 1,
  context: { query: "...", riskMode: "safe" },
  attention: { topTools: [...], topDocs: [...] },
  heads: [...],
  plan: { stepCount: 3, toolCount: 2 },
  execution: { completed: 3, failed: 0 }
}
```

### Tool Execution
```
[Transformer] Tool Execution: {
  tool: "workflows.list",
  params: ["limit"],
  success: true,
  outputType: "object"
}
```

## Monitoring Checklist

### Before Production

- [ ] Run all smoke tests (`pnpm run test:transformer`)
- [ ] Test with 5-10 real queries
- [ ] Verify embeddings quality (check top results make sense)
- [ ] Verify tool execution works
- [ ] Check that risk mode filtering works
- [ ] Verify council integration (if using)

### In Production

Watch for:
- **Wrong tool selection**: Check attention query logs
- **Tool execution failures**: Check execution logs
- **Council not influencing plan**: Check head outputs
- **Embeddings behaving oddly**: Check similarity scores

### Tuning

If tools are being selected incorrectly:

1. **Check embeddings**: Verify query embeddings match tool descriptions
2. **Adjust scoring**: Modify `cosineSimilarity` threshold in `toolResourceIndex.ts`
3. **Add tags**: Ensure tools have relevant tags in registry

If council isn't influencing:

1. **Check council votes**: Verify `runCouncilDeliberationStreaming` is called
2. **Check head outputs**: Verify votes are converted to `HeadOutput`
3. **Check merge logic**: Verify `mergeHeadOutputs` is combining correctly

## Example Queries to Test

### Read-Only (Safe Mode)
- "What is Scorpion?"
- "List all available tools"
- "Read the chat route code"
- "Analyze n8n workflow schemas"

### Balanced Mode
- "Fix this TypeScript error in the chat route"
- "Scan n8n workflows and show missing tests"
- "Propose a refactor for the orchestrator"

### Exploratory Mode
- "Refactor the entire chat pipeline"
- "Create a new workflow import system"
- "Redesign the council system"

## Troubleshooting

### "No tools selected"
- Check `ResourceIndex` is populated from `toolRegistry`
- Verify embeddings are being generated
- Check attention query logs

### "Tool execution failed"
- Verify tool exists in `tools` registry
- Check tool handler signature matches
- Review error logs for specific tool

### "Council not working"
- Verify `useCouncilSystem: true` is set
- Check `runCouncilDeliberationStreaming` is available
- Review council vote conversion logic

## Architecture Flow

```
User Query
  ↓
Transformer Orchestrator (if enabled)
  ↓
1. Build ScorpionContext (tokenization)
  ↓
2. Query ResourceIndex (attention: Q · K^T)
  ↓
3. Planner + Council Heads (multi-head attention)
  ↓
4. Merge Head Outputs → IntegrationPlan
  ↓
5. Execute Tools (feed-forward)
  ↓
6. Merge State (residual connection)
  ↓
7. Return Reply
```

## Next Steps

1. **Enable in dev**: Set `USE_TRANSFORMER_ORCHESTRATOR=true`
2. **Run tests**: `pnpm run test:transformer`
3. **Test queries**: Try 5-10 real queries
4. **Enable for yourself**: Add your userId to `ENABLE_TRANSFORMER_FOR_USERS`
5. **Monitor**: Watch logs and tune as needed

## Files Reference

- **Integration**: `lib/transformer/chat-integration.ts`
- **Orchestrator**: `lib/transformer/orchestrator-example.ts`
- **Decoder Block**: `server/transformer/decoder-block.ts`
- **Safety**: `lib/transformer/safety.ts`
- **Logging**: `lib/transformer/logging.ts`
- **Smoke Tests**: `lib/transformer/smoke-tests.ts`

