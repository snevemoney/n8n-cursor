# Tool Matrix Test Report

**Generated:** 2025-11-12T03:01:39.602Z
**Node Version:** v22.15.1

## Environment

| Variable | Value |
|---------|-------|
| ALLOW_DESTRUCTIVE_TESTS | not set |
| ALLOW_DEPLOY_TESTS | not set |
| ALLOW_LLM_EVAL | not set |

## Coverage Summary

- **Total Tools:** 29
- **Tools Attempted:** 22
- **Tools Succeeded:** 22
- **Tools Failed:** 0
- **Coverage:** 75.9%

## Tool Statistics

| Tool | Calls | OK | Failed | Avg MS | Last Error |
|------|-------|----|--------|--------|------------|
| knowledge.list | 2 | 2 | 0 | 18 | - |
| research.run | 1 | 1 | 0 | 226 | - |
| workflows.list | 1 | 1 | 0 | 56 | - |
| workflows.get | 1 | 1 | 0 | 373 | - |
| files.recent | 1 | 1 | 0 | 1 | - |
| ontology.search | 1 | 1 | 0 | 134 | - |
| system.health | 1 | 1 | 0 | 209 | - |
| project.status | 1 | 1 | 0 | 192 | - |
| stats.get | 1 | 1 | 0 | 43 | - |
| operations.list | 1 | 1 | 0 | 55 | - |
| code.readFile | 1 | 1 | 0 | 1 | - |
| project.analyze | 1 | 1 | 0 | 167 | - |
| logs.tail | 1 | 1 | 0 | 263 | - |
| agents.list | 1 | 1 | 0 | 242 | - |
| agents.get | 1 | 1 | 0 | 355 | - |
| notifications.post | 1 | 1 | 0 | 86 | - |
| notifications.list | 1 | 1 | 0 | 53 | - |
| settings.get | 1 | 1 | 0 | 57 | - |
| llm.models.compare | 1 | 1 | 0 | 59 | - |
| llm.experiments.list | 1 | 1 | 0 | 71 | - |
| research.start | 1 | 1 | 0 | 37 | - |
| workflows.trigger | 1 | 1 | 0 | 24 | - |

## Scenario Results

| Status | ID | Label | Tools Seen | Notes |
|--------|----|-------|-----------|-------|
| ✓ | latest-news | Latest news (Bitcoin/global) | research.run | Planner error: Planner failed: Ollama error: Ollama request failed: Ollama API error: 404 - {"error":"model \"llama3.1:8b\" not found, try pulling it first"}

Ollama URL: http://localhost:11434
Model: llama3.1:8b

Troubleshooting:
1. Check Ollama is running: `ollama serve`
2. Verify model exists: `ollama list`
3. Test connection: `curl http://localhost:11434/api/tags`; Forced: research.run executed |
| ✓ | explain-workflow | Explain my ElevenLabs workflow on n8ncloud.tech | workflows.list, workflows.get | Planner error: Planner failed: Ollama error: Ollama request failed: Ollama API error: 404 - {"error":"model \"llama3.1:8b\" not found, try pulling it first"}

Ollama URL: http://localhost:11434
Model: llama3.1:8b

Troubleshooting:
1. Check Ollama is running: `ollama serve`
2. Verify model exists: `ollama list`
3. Test connection: `curl http://localhost:11434/api/tags`; Forced: workflows.list executed; Forced: workflows.get executed |
| ✓ | pull-file-rag | Pull my last uploaded file and add it to RAG | files.recent, knowledge.list | Planner error: Planner failed: Ollama error: Ollama request failed: Ollama API error: 404 - {"error":"model \"llama3.1:8b\" not found, try pulling it first"}

Ollama URL: http://localhost:11434
Model: llama3.1:8b

Troubleshooting:
1. Check Ollama is running: `ollama serve`
2. Verify model exists: `ollama list`
3. Test connection: `curl http://localhost:11434/api/tags`; Forced: files.recent executed; Forced: knowledge.list executed |
| ✓ | list-side-hustles | List all my side-hustles | knowledge.list, ontology.search | Planner error: Planner failed: Ollama error: Ollama request failed: Ollama API error: 404 - {"error":"model \"llama3.1:8b\" not found, try pulling it first"}

Ollama URL: http://localhost:11434
Model: llama3.1:8b

Troubleshooting:
1. Check Ollama is running: `ollama serve`
2. Verify model exists: `ollama list`
3. Test connection: `curl http://localhost:11434/api/tags`; Forced: ontology.search executed |
| ✓ | system-health | How healthy is the system right now? | system.health, project.status, stats.get | Planner error: Planner failed: Ollama error: Ollama request failed: Ollama API error: 404 - {"error":"model \"llama3.1:8b\" not found, try pulling it first"}

Ollama URL: http://localhost:11434
Model: llama3.1:8b

Troubleshooting:
1. Check Ollama is running: `ollama serve`
2. Verify model exists: `ollama list`
3. Test connection: `curl http://localhost:11434/api/tags`; Forced: system.health executed; Forced: project.status executed; Forced: stats.get executed |
| ✓ | recent-operations | Show me recent operations | operations.list | Planner error: Planner failed: Ollama error: Ollama request failed: Ollama API error: 404 - {"error":"model \"llama3.1:8b\" not found, try pulling it first"}

Ollama URL: http://localhost:11434
Model: llama3.1:8b

Troubleshooting:
1. Check Ollama is running: `ollama serve`
2. Verify model exists: `ollama list`
3. Test connection: `curl http://localhost:11434/api/tags`; Forced: operations.list executed |
| ✓ | skim-orchestrator | Skim the orchestrator route | code.readFile | Planner error: Planner failed: Ollama error: Ollama request failed: Ollama API error: 404 - {"error":"model \"llama3.1:8b\" not found, try pulling it first"}

Ollama URL: http://localhost:11434
Model: llama3.1:8b

Troubleshooting:
1. Check Ollama is running: `ollama serve`
2. Verify model exists: `ollama list`
3. Test connection: `curl http://localhost:11434/api/tags`; Forced: code.readFile executed |
| ✓ | project-overview | High-level project overview | project.analyze | Planner error: Planner failed: Ollama error: Ollama request failed: Ollama API error: 404 - {"error":"model \"llama3.1:8b\" not found, try pulling it first"}

Ollama URL: http://localhost:11434
Model: llama3.1:8b

Troubleshooting:
1. Check Ollama is running: `ollama serve`
2. Verify model exists: `ollama list`
3. Test connection: `curl http://localhost:11434/api/tags`; Forced: project.analyze executed |
| ✓ | check-logs | Check recent API logs | logs.tail | Planner error: Planner failed: Ollama error: Ollama request failed: Ollama API error: 404 - {"error":"model \"llama3.1:8b\" not found, try pulling it first"}

Ollama URL: http://localhost:11434
Model: llama3.1:8b

Troubleshooting:
1. Check Ollama is running: `ollama serve`
2. Verify model exists: `ollama list`
3. Test connection: `curl http://localhost:11434/api/tags`; Forced: logs.tail executed |
| ✓ | list-agents | List my agents and inspect one | agents.list, agents.get | Planner error: Planner failed: Ollama error: Ollama request failed: Ollama API error: 404 - {"error":"model \"llama3.1:8b\" not found, try pulling it first"}

Ollama URL: http://localhost:11434
Model: llama3.1:8b

Troubleshooting:
1. Check Ollama is running: `ollama serve`
2. Verify model exists: `ollama list`
3. Test connection: `curl http://localhost:11434/api/tags`; Forced: agents.list executed; Forced: agents.get executed |
| — | deploy-agent | Try deploying a sample agent (dry run) | none | Gated by ALLOW_DEPLOY_TESTS |
| ✓ | notify-diagnostics | Notify me that diagnostics ran | notifications.post, notifications.list | Planner error: Planner failed: Ollama error: Ollama request failed: Ollama API error: 404 - {"error":"model \"llama3.1:8b\" not found, try pulling it first"}

Ollama URL: http://localhost:11434
Model: llama3.1:8b

Troubleshooting:
1. Check Ollama is running: `ollama serve`
2. Verify model exists: `ollama list`
3. Test connection: `curl http://localhost:11434/api/tags`; Forced: notifications.post executed; Forced: notifications.list executed |
| ✓ | list-knowledge | List knowledge items | knowledge.list | Planner error: Planner failed: Ollama error: Ollama request failed: Ollama API error: 404 - {"error":"model \"llama3.1:8b\" not found, try pulling it first"}

Ollama URL: http://localhost:11434
Model: llama3.1:8b

Troubleshooting:
1. Check Ollama is running: `ollama serve`
2. Verify model exists: `ollama list`
3. Test connection: `curl http://localhost:11434/api/tags`; Forced: knowledge.list executed |
| ✓ | settings-snapshot | Settings snapshot | settings.get | Planner error: Planner failed: Ollama error: Ollama request failed: Ollama API error: 404 - {"error":"model \"llama3.1:8b\" not found, try pulling it first"}

Ollama URL: http://localhost:11434
Model: llama3.1:8b

Troubleshooting:
1. Check Ollama is running: `ollama serve`
2. Verify model exists: `ollama list`
3. Test connection: `curl http://localhost:11434/api/tags`; Forced: settings.get executed |
| ✓ | compare-models | Compare LLM models (safe) | llm.models.compare | Planner error: Planner failed: Ollama error: Ollama request failed: Ollama API error: 404 - {"error":"model \"llama3.1:8b\" not found, try pulling it first"}

Ollama URL: http://localhost:11434
Model: llama3.1:8b

Troubleshooting:
1. Check Ollama is running: `ollama serve`
2. Verify model exists: `ollama list`
3. Test connection: `curl http://localhost:11434/api/tags`; Forced: llm.models.compare executed |
| ✓ | list-experiments | List LLM experiments | llm.experiments.list | Planner error: Planner failed: Ollama error: Ollama request failed: Ollama API error: 404 - {"error":"model \"llama3.1:8b\" not found, try pulling it first"}

Ollama URL: http://localhost:11434
Model: llama3.1:8b

Troubleshooting:
1. Check Ollama is running: `ollama serve`
2. Verify model exists: `ollama list`
3. Test connection: `curl http://localhost:11434/api/tags`; Forced: llm.experiments.list executed |
| — | evaluate-prompt | Evaluate a tiny prompt (if enabled) | none | Gated by ALLOW_LLM_EVAL |
| ✓ | start-research | Start a research job | research.start | Planner error: Planner failed: Ollama error: Ollama request failed: Ollama API error: 404 - {"error":"model \"llama3.1:8b\" not found, try pulling it first"}

Ollama URL: http://localhost:11434
Model: llama3.1:8b

Troubleshooting:
1. Check Ollama is running: `ollama serve`
2. Verify model exists: `ollama list`
3. Test connection: `curl http://localhost:11434/api/tags`; Forced: research.start executed |
| ✓ | trigger-workflow | Trigger a workflow (if exists) | workflows.trigger | Planner error: Planner failed: Ollama error: Ollama request failed: Ollama API error: 404 - {"error":"model \"llama3.1:8b\" not found, try pulling it first"}

Ollama URL: http://localhost:11434
Model: llama3.1:8b

Troubleshooting:
1. Check Ollama is running: `ollama serve`
2. Verify model exists: `ollama list`
3. Test connection: `curl http://localhost:11434/api/tags`; Forced: workflows.trigger executed |
| — | backup-create | Backup (destructive, gated) | none | Gated by ALLOW_DESTRUCTIVE_TESTS |
