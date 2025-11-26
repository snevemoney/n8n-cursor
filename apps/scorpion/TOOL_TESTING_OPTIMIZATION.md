# Tool Testing Optimization

## Problem

When user asked "test all your tools", Scorpion was:
- Checking code files (but not actually testing tools)
- Checking knowledge base (no results)
- Trying to research online (but not actually testing tools)
- Not actually executing any tools

## Solution

Added comprehensive tool testing detection and plan generation that:
1. **Detects tool testing requests** - Recognizes patterns like "test all your tools", "test your tools", etc.
2. **Creates comprehensive test plan** - Generates a plan that tests ALL available tools systematically
3. **Prioritizes research.run** - Tests research.run first (most important for web capabilities)
4. **Tests all tools** - Includes every tool in the registry with appropriate test arguments
5. **Skips council** - Tool testing doesn't need council deliberation

## Implementation

### 1. Intent Classification
**File**: `lib/chat/intent.ts`
- Detects "test all tools" requests
- Returns `project_help` intent to ensure full tool access

### 2. Plan Enforcement
**File**: `lib/chat/planner-enforcement.ts`
- Detects tool testing requests in `enforcePlanRules()`
- Creates comprehensive test plan with all available tools
- Prioritizes tools: research.run first, then others
- Groups tools by category for organized testing

### 3. Tool Testing Plan Structure

The plan includes:
- **Research & Knowledge**: research.run, kb.search, ontology.search, knowledge.list
- **System & Operations**: system.health, stats.get, logs.tail, project.status, project.analyze, operations.list
- **Files & Media**: files.recent, knowledge.get, ocr.extract
- **Workflows & Agents**: workflows.list, workflows.get, agents.list, agents.get, agent.deploy
- **Notifications & Settings**: notifications.list, notifications.post, settings.get
- **Code & Project**: code.readFile, project.analyze
- **LLM Tools**: llm.experiments.list, llm.models.compare, llm.train, llm.evaluate
- **Other**: Any remaining tools

### 4. Test Arguments

Each tool gets appropriate test arguments:
- `research.run`: `{ query: 'Bitcoin news', depth: 'shallow', maxSites: 3 }`
- `kb.search`: `{ query: 'test', limit: 5 }`
- `system.health`: `{}`
- `files.recent`: `{ limit: 5 }`
- etc.

Some tools will fail (like `knowledge.get` with invalid ID), but that's okay - we're testing that the tool executes, not that it succeeds.

## Benefits

1. **Actually Tests Tools** - No more checking code files or knowledge base, actually executes tools
2. **Comprehensive** - Tests ALL available tools, not just a few
3. **Prioritized** - research.run tested first (most important)
4. **Organized** - Tools grouped by category for clarity
5. **Fast** - Skips council deliberation for tool testing

## Usage

User can now say:
- "test all your tools"
- "test your tools"
- "test every tool"
- "test each tool"
- "verify all tools"
- "check all tools"

And Scorpion will actually test all tools systematically!









