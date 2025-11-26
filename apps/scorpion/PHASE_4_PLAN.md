# Phase 4: Helper Extraction - Detailed Plan

## Phase 4 Status

- [x] 4.1 Plan Validator extracted (564 lines → planValidator.ts: 590 lines) ✅
- [x] 4.2 Result Processor extracted (116 lines → resultProcessor.ts: 282 lines) ✅
- [x] 4.3 Summarizer Context Builder extracted (695 lines → summarizerContext.ts: 831 lines) ✅

**Phase 4 Complete!** 🎉 Total reduction: 1,488 lines (-31.2% from baseline)

## Overview

Extract ~2,100 lines of supporting orchestration code into focused helper modules. This will reduce `processStreamStart.ts` from ~4,500 lines to ~2,400 lines (50% reduction from baseline).

## Extraction Order (Recommended)

Execute in this sequence to minimize risk and dependencies:

### 4.1: Plan Validator (~600 lines) ✅ READY TO START
**Difficulty**: Low - Pure logic, minimal side effects
**Risk**: Low - Clear boundaries, easy to test
**Skeleton**: [helpers/planValidator.ts](app/api/chat/stream/helpers/planValidator.ts) already created

### 4.2: Result Processor (~500 lines) ✅ READY AFTER 4.1
**Difficulty**: Medium - Multiple data sources
**Risk**: Low - Read-only operations
**Cursor Prompt**: [PHASE_4_2_CURSOR_PROMPT.md](PHASE_4_2_CURSOR_PROMPT.md) ready to use

### 4.3: Summarizer Context Builder (~1,000 lines)
**Difficulty**: Medium - Complex aggregation
**Risk**: Medium - Many edge cases
**Status**: Cursor prompt will be created after 4.2

---

## 4.1: Plan Validator Extraction (START HERE)

### Target Code Location

**File**: `apps/scorpion/app/api/chat/stream/processStreamStart.ts`

**Search patterns** to find the code:

```bash
# Find plan validation/normalization code
rg "plan validation|normalizePlanSteps|enforcePlanRules|createFallbackPlan" processStreamStart.ts -n

# Find kb.search injection logic
rg "kb\.search-heavy|hasOnlyKbSearch|hasMultipleKbSearch" processStreamStart.ts -n

# Find path correction logic
rg "FIX INCORRECT FILE PATHS|isWorkflowQuestionForPathFix" processStreamStart.ts -n

# Find plan rule enforcement
rg "FRONTIER-LEVEL.*Enforce plan rules|applyPlanEnforcement" processStreamStart.ts -n
```

**Approximate line ranges** (from architecture analysis):
- Lines ~1430-1480: Plan validation and normalization
- Lines ~1900-2100: kb.search-heavy plan detection and tool injection
- Lines ~1960-2070: Codebase question detection and code.readFile injection
- Lines ~2100-2400: File path correction logic
- Lines ~2410-2470: System health and logs query enforcement

### New File Structure

**Create**: `apps/scorpion/app/api/chat/stream/helpers/planValidator.ts`

**Interface design**:

```typescript
import type { Plan, PlanStep, ScorpionIntent } from '@/lib/chat/types';

export interface PlanValidationResult {
  plan: Plan;
  issues: string[];
  isValid: boolean;
  warnings?: string[];
}

export interface PlanValidationOptions {
  intent: ScorpionIntent;
  userMessage: string;
  isFileQuery?: boolean;
  historyAnalysis?: any;
}

/**
 * Validate and normalize a plan from the planner phase
 *
 * This function:
 * 1. Validates plan structure
 * 2. Normalizes plan steps
 * 3. Enforces intent-specific rules
 * 4. Injects missing tools for specific query types
 * 5. Corrects file paths
 *
 * @param rawPlan - Raw plan from planner phase
 * @param options - Validation options (intent, message, etc.)
 * @returns PlanValidationResult with validated/normalized plan
 */
export function validateAndNormalizePlan(
  rawPlan: any,
  options: PlanValidationOptions
): PlanValidationResult {
  // Implementation will be extracted from processStreamStart.ts
  // Pure logic - no SSE streaming, no direct side effects
  // Console logs preserved for debugging
}

/**
 * Helper: Normalize plan steps to ensure required fields
 */
export function normalizePlanSteps(steps: any[]): PlanStep[] {
  // Extract from planHelpers.normalizePlanSteps
}

/**
 * Helper: Detect kb.search-heavy plans and inject appropriate tools
 */
export function injectToolsForKbSearchPlans(
  plan: Plan,
  intent: ScorpionIntent,
  userMessage: string,
  isFileQuery: boolean
): Plan {
  // Extract kb.search detection and tool injection logic
}

/**
 * Helper: Inject code.readFile steps for codebase questions
 */
export function injectCodeReadSteps(
  plan: Plan,
  intent: ScorpionIntent,
  userMessage: string,
  conversationHistory: any[]
): Plan {
  // Extract codebase question detection and code.readFile injection
}

/**
 * Helper: Correct file paths based on question type
 */
export function correctFilePaths(
  plan: Plan,
  userMessage: string
): Plan {
  // Extract path correction logic
}

/**
 * Helper: Enforce system health and logs tools
 */
export function enforceSystemTools(
  plan: Plan,
  userMessage: string
): Plan {
  // Extract system.health and logs.tail enforcement
}
```

### Integration Steps

1. **Create the new file** with interfaces
2. **Copy validation logic** from processStreamStart.ts (preserve exact behavior)
3. **Update processStreamStart.ts** to use the helper:

```typescript
import { validateAndNormalizePlan } from './helpers/planValidator';

// After planner phase completes (around line 1415)
const planValidation = validateAndNormalizePlan(plan, {
  intent: finalIntent,
  userMessage,
  isFileQuery,
  historyAnalysis,
});

plan = planValidation.plan;

if (!planValidation.isValid) {
  console.warn('[Plan Validator] Plan validation failed:', planValidation.issues);
  // Handle invalid plan (keep existing error handling behavior)
}

if (planValidation.warnings && planValidation.warnings.length > 0) {
  console.warn('[Plan Validator] Warnings:', planValidation.warnings);
}
```

4. **Remove old inline validation code** (~600 lines)
5. **Test** - Ensure behavior unchanged

### Validation Checklist

Before committing:
- [ ] Plan structure validation works (invalid plans rejected)
- [ ] Step normalization preserves all fields
- [ ] kb.search-heavy plans get correct tool injection
- [ ] Codebase questions get code.readFile steps
- [ ] File paths corrected for workflow questions
- [ ] System health/logs tools enforced for operational queries
- [ ] No TypeScript errors
- [ ] No unused imports
- [ ] Console logs preserved (debugging aid)

### Expected Impact

- **Lines removed from processStreamStart.ts**: ~600
- **New file**: `planValidator.ts` (~650 lines with comments)
- **Net reduction**: ~550 lines (some imports added)
- **Testability**: High - Pure function, easy to unit test
- **Maintainability**: High - All plan rules in one place

---

## 4.2: Result Processor Extraction (NEXT)

### Target Code Location

**Search patterns**:

```bash
# Find result extraction logic
rg "extractKnowledgeHits|extractResearchResults|formatResearchSources" processStreamStart.ts -n

# Find tool result processing
rg "codeReadResults|systemHealthResults|logsResults|projectAnalyzeResults" processStreamStart.ts -n

# Find result filtering
rg "filter.*code\.readFile|filter.*system\.health|filter.*logs\.tail" processStreamStart.ts -n
```

**Approximate line ranges**:
- Lines ~3000-3150: Code read results extraction
- Lines ~3040-3070: Knowledge hits extraction
- Lines ~3080-3140: System health, logs, project.analyze extraction
- Lines ~3150-3200: Research results and source formatting

### New File Structure

**Create**: `apps/scorpion/app/api/chat/stream/helpers/resultProcessor.ts`

**Interface design**:

```typescript
export interface ProcessedResults {
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

export function processExecutionResults(params: {
  results: any[];
  plan: any;
}): ProcessedResults {
  // Extract all result processing logic
}
```

### Expected Impact

- **Lines removed**: ~500
- **New file**: ~550 lines
- **Net reduction**: ~450 lines

---

## 4.3: Summarizer Context Builder Extraction (LAST)

### Target Code Location

**Search patterns**:

```bash
# Find context building logic
rg "summaryContext|buildComprehensiveContext|TOOL TESTING RESULTS" processStreamStart.ts -n

# Find format-specific builders
rg "isToolTestingRequest|isWhatIsQuestion|isFileQuery.*context" processStreamStart.ts -n

# Find anti-hallucination instructions
rg "CRITICAL.*ONLY.*sources|DO NOT.*hallucinate|You are NOT allowed" processStreamStart.ts -n
```

**Approximate line ranges**:
- Lines ~3165-3200: Summary context initialization
- Lines ~3200-3400: Tool testing results formatting
- Lines ~3400-3600: Knowledge hits prioritization and formatting
- Lines ~3600-3800: Research source formatting
- Lines ~3800-4100: Comprehensive context assembly

### New File Structure

**Create**: `apps/scorpion/app/api/chat/stream/helpers/summarizerContext.ts`

**Interface design**:

```typescript
export interface SummarizerContext {
  conversationHistory: any[];
  plan?: any;
  toolResults?: any[];
  knowledgeHits?: any[];
  researchSources?: any[];
  codeReadResults?: any[];
  systemHealthResults?: any[];
  logsResults?: any[];
  projectAnalyzeResults?: any[];
  filesRecentResults?: any[];
  contextString: string; // Pre-formatted for summarizer
}

export interface ContextBuildOptions {
  userMessage: string;
  questionType: string;
  intent: ScorpionIntent;
  isToolTestingRequest?: boolean;
  isWhatIsQuestion?: boolean;
  isFileQuery?: boolean;
}

export function buildSummarizerContext(
  processedResults: ProcessedResults,
  options: ContextBuildOptions
): SummarizerContext {
  // Extract all context building logic
}
```

### Expected Impact

- **Lines removed**: ~1,000
- **New file**: ~1,100 lines
- **Net reduction**: ~900 lines

---

## Final Outcome (After Phase 4 Complete)

### File Size Progression

| Phase | processStreamStart.ts | Extracted | Net Change |
|-------|----------------------|-----------|------------|
| **Baseline** | 4,764 lines | - | - |
| **Phase 1-3** | ~4,500 lines | 1,530 lines | -264 lines |
| **Phase 4.1** | ~3,900 lines | +650 lines | -600 lines |
| **Phase 4.2** | ~3,450 lines | +550 lines | -450 lines |
| **Phase 4.3** | ~2,550 lines | +1,100 lines | -900 lines |
| **Total** | **~2,550 lines** | **3,830 lines** | **-2,214 lines (46% reduction)** |

### Module Structure (Complete)

```
apps/scorpion/app/api/chat/stream/
├── handlers/
│   ├── identityHandler.ts (120 lines)
│   ├── smallTalkHandler.ts (218 lines)
│   └── userToolHandler.ts (13KB)
├── preflightChecks/
│   ├── safetyGuard.ts (108 lines)
│   ├── toolRouter.ts (173 lines)
│   ├── budgetGovernor.ts (106 lines)
│   └── index.ts (105 lines)
├── phases/
│   ├── plannerPhase.ts (194 lines)
│   ├── councilPhase.ts (117 lines)
│   ├── executorPhase.ts (148 lines)
│   ├── summarizerPhase.ts (136 lines)
│   ├── requestPhase.ts (45 lines)
│   ├── streamPhase.ts (44 lines)
│   └── index.ts (11 lines)
├── helpers/
│   ├── planValidator.ts (650 lines) ← Phase 4.1
│   ├── resultProcessor.ts (550 lines) ← Phase 4.2
│   ├── summarizerContext.ts (1,100 lines) ← Phase 4.3
│   ├── planExecutor.ts (existing)
│   ├── legacyExecutor.ts (existing)
│   ├── ragIntegration.ts (existing)
│   └── ... (other helpers)
└── processStreamStart.ts (~2,550 lines)
```

---

## Success Criteria

### Technical
- [ ] All extractions maintain exact behavior
- [ ] No TypeScript compilation errors
- [ ] All imports cleaned up
- [ ] Console logs preserved for debugging
- [ ] Power of 10 rules compliance maintained

### Quality
- [ ] Each helper has clear interface documentation
- [ ] Complex logic has inline comments
- [ ] Edge cases explicitly handled
- [ ] Error handling preserved

### Testing
- [ ] Manual smoke tests pass
- [ ] Integration tests added (if time permits)
- [ ] No regressions in existing functionality

---

## Next Steps After Phase 4

1. **Add Unit Tests** for all extracted helpers
2. **Integration Tests** for full pipeline
3. **Performance Benchmarking** to measure any latency changes
4. **Phase 2.2** (User Tool Executor) - Now safer with tests in place

---

**Document Version**: 1.0
**Created**: 2025-01-24
**Target Start**: Phase 4.1 (Plan Validator)
