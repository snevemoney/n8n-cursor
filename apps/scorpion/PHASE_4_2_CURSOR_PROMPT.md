# Phase 4.2: Result Processor - Cursor Prompt

## Ready-to-Paste Prompt

Copy this into Cursor after Phase 4.1 is complete:

```
You are working in apps/scorpion/app/api/chat/stream/processStreamStart.ts.

Goal: Extract all "result extraction and formatting" logic into a new helper module, without changing behavior.

Steps:

1. Scan processStreamStart.ts for all logic that:
   - Extracts tool results from the results array
   - Filters results by tool type (code.readFile, kb.search, research.run, system.health, logs.tail, etc.)
   - Formats or transforms result data
   - Extracts knowledge hits, research sources, or tool outputs
   This code usually appears AFTER the executor phase and BEFORE the summarizer phase (around lines 3000-3200).

2. Create a new file:
   apps/scorpion/app/api/chat/stream/helpers/resultProcessor.ts

   In that file, create:

   - export interface ProcessedResults {
       codeReadResults: Array<{
         path: string;
         content: string;
         ast?: any;
         dependencies?: string[];
         language: string;
       }>;
       knowledgeHits: Array<any>;
       researchResults: Array<any>;
       researchSources: Array<{
         title: string;
         url: string;
         snippet?: string;
       }>;
       systemHealthResults: Array<any>;
       logsResults: Array<any>;
       projectAnalyzeResults: Array<any>;
       filesRecentResults: Array<any>;
     }

   - export function processExecutionResults(params: {
       results: any[];
       plan: any;
     }): ProcessedResults {
       // Move all result extraction/formatting logic here.
       // NO streaming, NO SSE calls.
       // Pure data transformation.
     }

   You'll need to extract and move these helper functions:
   - extractKnowledgeHits(results)
   - extractResearchResults(results, plan)
   - formatResearchSources(researchResults)
   - prioritizeKnowledgeHits(knowledgeHits, userMessage)

3. Replace the inline result processing code in processStreamStart.ts with a single call:

   import { processExecutionResults } from './helpers/resultProcessor';

   const processedResults = processExecutionResults({
     results,
     plan,
   });

   // Then destructure the results:
   const {
     codeReadResults,
     knowledgeHits,
     researchResults,
     researchSources,
     systemHealthResults,
     logsResults,
     projectAnalyzeResults,
     filesRecentResults,
   } = processedResults;

4. Important constraints:
   - Do NOT change existing behavior or data structures.
   - Preserve all current filtering logic exactly as-is.
   - Keep console.log statements for debugging.
   - Keep types broad (any) where exact types are unclear.
   - The helper should be a pure function - input → output, no side effects.

5. After refactor:
   - Ensure processStreamStart.ts still compiles.
   - Ensure there are no unused imports.
   - Do NOT refactor other helpers or phases in this pass.
   - Verify that all result variables (codeReadResults, knowledgeHits, etc.) are still populated correctly.

Target line ranges (approximate):
- Lines ~3003-3035: Code read results extraction
- Lines ~3038-3042: Knowledge hits extraction (calls extractKnowledgeHits)
- Lines ~3041-3068: Research results extraction (calls extractResearchResults, formatResearchSources)
- Lines ~3070-3080: Knowledge search query extraction
- Lines ~3080-3160: Tool result extraction (system.health, logs.tail, project.analyze, files.recent)
```

---

## Pre-Flight Check Before Running

Before pasting the prompt into Cursor:

1. **Verify Phase 4.1 is complete**:
   - [ ] `planValidator.ts` exists and exports `validateAndNormalizePlan`
   - [ ] `processStreamStart.ts` calls `validateAndNormalizePlan()`
   - [ ] TypeScript compiles without errors
   - [ ] Manual smoke test passed (3 query types)

2. **Search for target code** (to confirm line ranges):
   ```bash
   cd apps/scorpion/app/api/chat/stream

   # Find result extraction logic
   rg "codeReadResults|extractKnowledgeHits|extractResearchResults" processStreamStart.ts -n | head -20

   # Find result filtering
   rg "filter.*code\.readFile|filter.*system\.health" processStreamStart.ts -n | head -10

   # Find research source formatting
   rg "formatResearchSources|researchSources.*title" processStreamStart.ts -n | head -10
   ```

3. **Expected line ranges** (update if different):
   - Code read results: ~3003-3035
   - Knowledge hits: ~3038-3042
   - Research results: ~3041-3068
   - System health results: ~3083-3100
   - Logs results: ~3101-3117
   - Project analyze results: ~3119-3126
   - Files recent results: ~3129-3149

---

## Post-Extraction Validation

After Cursor completes the extraction:

### 1. TypeScript Check
```bash
pnpm typecheck
# or
pnpm build
```

### 2. Import Check
In `processStreamStart.ts`, verify:
- [ ] `import { processExecutionResults } from './helpers/resultProcessor';` exists
- [ ] Old imports for `extractKnowledgeHits`, `extractResearchResults`, `formatResearchSources` removed (if they were separate)
- [ ] All result variables still declared: `codeReadResults`, `knowledgeHits`, `researchResults`, etc.

### 3. Logic Check
Search for duplicates or leftovers:
```bash
# Should find ZERO results (all moved to helper)
rg "results\.filter.*code\.readFile" processStreamStart.ts

# Should find ONE result (the call to processExecutionResults)
rg "processExecutionResults" processStreamStart.ts
```

### 4. Console Logs Check
In `resultProcessor.ts`, verify key debug logs survived:
- `[Chat Stream] Total results collected:`
- `[Chat Stream] Extracted code.readFile result:`
- `[Chat Stream] Research extraction:`

---

## Manual Runtime Test

Same 3 query types as Phase 4.1:

1. **Normal query** - "Explain the chat pipeline"
   - Verify: No errors, answer quality unchanged

2. **Codebase query** - "Show me the main chat handler in Scorpion"
   - Verify: `codeReadResults` populated, file contents appear in summary

3. **Research query** - "What are the latest TypeScript 5.5 features?"
   - Verify: `researchSources` populated, sources appear in answer

---

## Success Criteria

- [ ] `resultProcessor.ts` created with `processExecutionResults()` function
- [ ] `processStreamStart.ts` calls the helper (single line)
- [ ] ~500 lines removed from main file
- [ ] TypeScript compiles
- [ ] No duplicate logic left in processStreamStart.ts
- [ ] All result variables still populated correctly
- [ ] Manual tests pass

---

## Expected Impact

| Metric | Before 4.2 | After 4.2 | Change |
|--------|-----------|----------|---------|
| **processStreamStart.ts** | ~3,900 lines | ~3,450 lines | -450 lines |
| **New file** | - | resultProcessor.ts (~550 lines) | +550 lines |
| **Net reduction** | - | - | ~450 lines |

---

**Next Step**: After 4.2 completes, move to Phase 4.3 (Summarizer Context Builder)
