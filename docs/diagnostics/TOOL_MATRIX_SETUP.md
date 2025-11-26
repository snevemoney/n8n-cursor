# Tool Matrix Test Harness - Setup & Usage

## Overview

The Tool Matrix Test Harness exercises all Scorpion tools end-to-end via casual prompts, produces coverage reports, and supports real-time streaming to the chat panel.

## Fixed Issues

### 1. Planner Model Configuration

The planner now uses environment variables with fallback:
- `PLANNER_MODEL` (highest priority)
- `OLLAMA_MODEL` (fallback)
- `llama3.1:8b` (default)

**To fix "model not found" error:**
```bash
# Option 1: Pull the default model
ollama pull llama3.1:8b

# Option 2: Use an existing model
export PLANNER_MODEL=qwen2.5:7b
# or
export OLLAMA_MODEL=qwen2.5:7b

# Check available models
curl http://localhost:11434/api/tags
```

### 2. Missing Tool Scenarios Added

Added scenarios for previously untested tools:
- `kb.search` - Knowledge base search
- `knowledge.get` - Direct KB item retrieval
- `ocr.extract` - Image OCR extraction
- `llm.train` - LLM training (gated by `ALLOW_LLM_TRAIN`)

### 3. SSE Streaming Support

The diagnostics API now supports Server-Sent Events (SSE) for real-time streaming to the chat panel.

## Usage

### CLI Mode

```bash
# Run tool matrix (non-streaming)
pnpm diag:tools

# With custom planner model
PLANNER_MODEL=qwen2.5:7b pnpm diag:tools

# Enable destructive tests
ALLOW_DESTRUCTIVE_TESTS=1 ALLOW_DEPLOY_TESTS=1 ALLOW_LLM_EVAL=1 ALLOW_LLM_TRAIN=1 pnpm diag:tools
```

### API Mode (Non-Streaming)

```bash
# POST to run tests
curl -X POST http://localhost:3003/api/diagnostics/run-tool-matrix \
  -H "Content-Type: application/json" \
  -d '{}'

# GET to load latest report
curl http://localhost:3003/api/diagnostics/run-tool-matrix
```

### API Mode (Streaming for Chat Panel)

```bash
# POST with streaming enabled
curl -X POST http://localhost:3003/api/diagnostics/run-tool-matrix \
  -H "Content-Type: application/json" \
  -d '{"stream": true, "conversationId": "diagnostics-123"}'
```

### UI Integration

To view diagnostics in the chat panel:

1. **Open chat with conversation ID:**
   ```
   /chat?cid=diagnostics-123
   ```

2. **Trigger streaming diagnostics:**
   ```javascript
   fetch('/api/diagnostics/run-tool-matrix', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       stream: true,
       conversationId: 'diagnostics-123'
     })
   });
   ```

3. **The panel will show:**
   - Plan tab: Scenario planning steps
   - Tools tab: Real-time tool calls and results
   - Status: Progress updates for each scenario

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `PLANNER_MODEL` | Planner LLM model | `llama3.1:8b` |
| `OLLAMA_MODEL` | Fallback model | `llama3.1:8b` |
| `OLLAMA_PROVIDER` | Model provider | `ollama` |
| `ALLOW_DESTRUCTIVE_TESTS` | Enable backup.create | `0` |
| `ALLOW_DEPLOY_TESTS` | Enable agent.deploy | `0` |
| `ALLOW_LLM_EVAL` | Enable llm.evaluate | `0` |
| `ALLOW_LLM_TRAIN` | Enable llm.train | `0` |

## Coverage

Current coverage: **~76%** (22/29 tools tested)

**Tested Tools:**
- research.run, research.start
- workflows.list, workflows.get, workflows.trigger
- notifications.post, notifications.list
- agents.list, agents.get
- files.recent, knowledge.list
- system.health, project.status, stats.get
- operations.list, project.analyze
- code.readFile, logs.tail
- settings.get, ontology.search
- llm.experiments.list, llm.models.compare
- **kb.search** (new)
- **knowledge.get** (new)
- **ocr.extract** (new)

**Gated Tools (require env flags):**
- agent.deploy (ALLOW_DEPLOY_TESTS=1)
- backup.create (ALLOW_DESTRUCTIVE_TESTS=1)
- llm.evaluate (ALLOW_LLM_EVAL=1)
- llm.train (ALLOW_LLM_TRAIN=1)

## Reports

Reports are generated at:
- `docs/diagnostics/tool-matrix.json` - Machine-readable report
- `docs/diagnostics/tool-matrix.md` - Human-readable markdown

## Troubleshooting

### Planner Model Not Found

```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# List available models
ollama list

# Pull missing model
ollama pull llama3.1:8b

# Or use existing model
export PLANNER_MODEL=qwen2.5:7b
```

### Tools Not Executing

1. Check tool registry: `apps/scorpion/lib/chat/tools/index.ts`
2. Verify tool handler exists
3. Check forced steps in scenarios match tool signatures
4. Review error logs in report

### SSE Not Streaming

1. Verify `stream: true` in POST request
2. Check browser console for SSE connection errors
3. Ensure conversationId is set
4. Verify chat panel is open with matching conversationId

## Next Steps

To reach 100% coverage:

1. Set environment flags for gated tools
2. Add scenarios for any missing tools
3. Verify all tools work in both planner and forced modes
4. Monitor coverage reports for regressions

