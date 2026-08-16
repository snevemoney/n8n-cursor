# Planner Prompt Enhancement Summary

## What Was Added

A comprehensive **"DETAILED TOOL DESCRIPTIONS - USAGE GUIDANCE"** section was added to the planner prompt file at `apps/scorpion/lib/prompts/planner.system.txt`, inserted after line 363 (after the tool list, before "User Tools" section).

## Section Content

The new section includes:

### Structure
- Organized by tool categories (Knowledge & Code, Research, File Tracking, System Operations, etc.)
- Each tool has 4 subsections:
  1. **What it does** - Detailed description
  2. **When to use it** - Examples and use cases
  3. **What it returns** - Result format and structure
  4. **How to use it effectively** - Best practices and tips

### Tools Covered

1. **Knowledge & Code Tools**:
   - `kb.search` - RAG/knowledge base search with similarity scores
   - `code.readFile` - File reading with AST parsing and dependency tracking
   - `project.analyze` - Project structure analysis

2. **Research & External Data**:
   - `research.run` - Web research with structured findings and source links

3. **File Tracking**:
   - `files.recent` - Get recently uploaded/accessed files with metadata
   - `ocr.extract` - Extract text from images using OCR

4. **System Operations**:
   - `system.health` - System status and metrics
   - `logs.tail` - Log filtering by time window and level
   - `stats.get` - System statistics

5. **Workflow & Agent Management**:
   - `workflows.trigger/list/get` - n8n workflow management
   - `agents.list/get/deploy` - Agent management

6. **Knowledge Base Management**:
   - `knowledge.list/get` - Knowledge base operations
   - `ontology.search` - Ontology/knowledge graph search

7. **Operations & Status**:
   - `operations.list` - Recent operations
   - `project.status` - Project status
   - `settings.get` - System settings

8. **Notifications**:
   - `notifications.post/list` - Notification management

9. **Backup & LLM Tools**:
   - `backup.create` - Create backups
   - `llm.train/evaluate/experiments.list/models.compare` - LLM operations

10. **Research Start (Async)**:
    - `research.start` - Async research job

### Best Practices Section

The section ends with **"TOOL SELECTION BEST PRACTICES"** covering:
1. Vary your approach
2. Match tools to information needs
3. Use tool-specific features
4. Combine tools strategically
5. Avoid repetition
6. File tracking is special
7. Research requires tools
8. Codebase questions need code

## Key Improvements

1. **Clear Usage Guidance**: Each tool now has explicit "When to use it" guidance
2. **Return Format Documentation**: Clear description of what each tool returns
3. **Best Practices**: Tips for effective tool usage
4. **Common Mistakes Avoided**: Explicit warnings (e.g., "DO NOT use kb.search for file tracking")
5. **Tool Combinations**: Guidance on which tools work well together

## Testing

To test the enhanced planner:

1. **Start the server** (if not already running):
   ```bash
   cd apps/scorpion
   pnpm dev
   ```

2. **Navigate to chat**: http://localhost:3003/chat

3. **Test with various queries**:
   - "What is Scorpion?" (should use code.readFile for README/package.json)
   - "Show me recent files" (should use files.recent, NOT kb.search)
   - "Research Bitcoin news" (should use research.run)
   - "Check system health" (should use system.health)
   - "Explain the architecture" (should use code.readFile with includeAST)

4. **Check the planner output**:
   - Look at the plan reasoning - it should reference tool descriptions
   - Verify tool selection matches the guidance
   - Check that tool parameters are used correctly (includeAST, includeDependencies, etc.)

## File Location

The enhanced prompt is at:
- `apps/scorpion/lib/prompts/planner.system.txt`
- Lines 364-728 contain the new detailed tool descriptions section

## Next Steps

1. Test the planner with various queries
2. Monitor plan quality and tool selection
3. Verify that the descriptions help the planner make better tool choices
4. Adjust descriptions based on observed behavior

