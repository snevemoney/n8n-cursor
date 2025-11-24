# Scorpion System Prompts

This directory contains all system prompts used by Scorpion's orchestration pipeline.

## Core Orchestration Prompts

1. **`planner.system.txt`** - Main planning and orchestration agent
2. **`council.system.txt`** - Multi-agent deliberation and voting
3. **`summarizer.system.txt`** - Response summarization and final answer generation
4. **`identity.system.txt`** - Identity questions handler (bypasses tools/planner)

## Specialized Role Prompts

### Execution & Routing
5. **`executor.system.txt`** - Tool runner that executes approved plans step-by-step
6. **`tool-router.system.txt`** - Maps user requests to minimal tool sets

### Safety & Quality
7. **`safety-guard.system.txt`** - Policy, privacy, and security evaluation
8. **`style-enforcer.system.txt`** - Tone and output consistency enforcement

### Knowledge & Retrieval
9. **`rag-retriever.system.txt`** - Query rewriting, source selection, and ranking
10. **`knowledge-ingest.system.txt`** - Normalizes raw text/files into clean chunks
11. **`ontology-linker.system.txt`** - Extracts entities and relations for knowledge graph

### Memory & State
12. **`memory-manager.system.txt`** - Long-term memory storage decisions

### Code & Implementation
13. **`implementer.system.txt`** - Produces minimal, safe code changes
14. **`tester.system.txt`** - Creates/extends tests for verification

### Operations & Analysis
15. **`incident-analyst.system.txt`** - Log/metric analysis and RCA
16. **`file-inspector.system.txt`** - Recent files + OCR analysis
17. **`dataframe-analyst.system.txt`** - Table analysis with stats

### Product & Design
18. **`product-manager.system.txt`** - RFC synthesis from needs
19. **`ui-designer.system.txt`** - Component/page specifications

### Resource Management
20. **`budget-governor.system.txt`** - Resource limits and model selection
21. **`dispatcher.system.txt`** - Multi-machine task placement

## Usage

Prompts are loaded via the `getPromptPath()` function:

```typescript
import { readFileSync, existsSync } from 'fs';
import { getPromptPath } from '@/lib/prompts';

const promptPath = getPromptPath('executor.system.txt');
const prompt = readFileSync(promptPath, 'utf-8');
```

## Integration Points

- **Planner → Tool Router → Budget → Dispatcher → Executor → Summarizer**
- **Safety Guard** wraps start/end of pipeline
- **Style Enforcer** applies tone consistency to final output
- **RAG Retriever** enhances knowledge retrieval for project_help intents
- **Memory Manager** decides what to persist from conversations

## Output Formats

All specialized prompts output **STRICT JSON** as specified in each prompt file. This ensures consistent parsing and integration with the orchestration pipeline.

