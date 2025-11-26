# Ready for Phase 4: Plan Validator Extraction

## Status: ✅ LOCKED AND LOADED

All Phase 1-3 work is complete, documented, and cross-linked. The codebase is ready for Phase 4.1.

---

## What's Done

### ✅ Phase 1-3 Complete
- 16 modular files created
- 1,530 lines extracted
- 264 lines net reduction
- All documentation in place

### ✅ Documentation Locked In
- [ARCHITECTURE.md](ARCHITECTURE.md) - Complete system architecture
- [PHASE_1_2_3_REFACTORING_REPORT.md](PHASE_1_2_3_REFACTORING_REPORT.md) - Detailed phase report
- [PHASE_4_PLAN.md](PHASE_4_PLAN.md) - Step-by-step extraction guide

### ✅ Breadcrumbs Added
- `processStreamStart.ts` header links to all architecture docs
- `ARCHITECTURE.md` cross-links to all related documentation

---

## What's Next: Phase 4.1 - Plan Validator

**Target**: Extract ~600 lines of plan validation logic into `helpers/planValidator.ts`

**Why This First**:
- ✅ Pure logic - minimal side effects
- ✅ Clear boundaries - easy to extract
- ✅ Low risk - straightforward testing
- ✅ High impact - removes complex validation from main flow

**Grep Patterns to Find the Code**:

```bash
# From project root
cd apps/scorpion/app/api/chat/stream

# Find plan validation logic
rg "plan validation|normalizePlanSteps|enforcePlanRules" processStreamStart.ts -n

# Find kb.search injection
rg "kb\.search-heavy|hasOnlyKbSearch" processStreamStart.ts -n

# Find path correction
rg "FIX INCORRECT FILE PATHS" processStreamStart.ts -n

# Find plan enforcement
rg "applyPlanEnforcement|enforcePlanRules" processStreamStart.ts -n
```

**Expected Line Ranges** (approximate):
- Lines ~1430-1480: Core plan validation
- Lines ~1900-2100: Tool injection for kb.search-heavy plans
- Lines ~1960-2070: Code.readFile injection for codebase questions
- Lines ~2100-2400: File path corrections
- Lines ~2410-2470: System health/logs enforcement

---

## Ready-to-Use Cursor Prompt

Copy this into Cursor to start Phase 4.1:

```
You are working in apps/scorpion/app/api/chat/stream/processStreamStart.ts.

Goal: Extract all "plan validation / normalization" logic into a new helper module, without changing behavior.

Steps:

1. Scan processStreamStart.ts for all logic that:
   - inspects or modifies the planner's output (plan/steps),
   - enforces rules on steps,
   - normalizes steps or paths,
   - rejects or fixes invalid plans.
   This code usually appears AFTER the planner phase and BEFORE the executor phase.

2. Create a new file:
   apps/scorpion/app/api/chat/stream/helpers/planValidator.ts

   In that file, create:

   - export interface PlanValidationResult {
       plan: any;            // keep existing type for now
       issues: string[];
       isValid: boolean;
       warnings?: string[];
     }

   - export interface PlanValidationOptions {
       intent: ScorpionIntent;
       userMessage: string;
       isFileQuery?: boolean;
       historyAnalysis?: any;
     }

   - export function validateAndNormalizePlan(
       rawPlan: any,
       options: PlanValidationOptions
     ): PlanValidationResult {
       // Move all pure plan-validation / normalization logic here.
       // NO streaming, NO direct SSE calls, NO logging side effects if possible.
     }

3. Replace the inline plan-validation code in processStreamStart.ts with a single call:

   import { validateAndNormalizePlan } from './helpers/planValidator';

   const validation = validateAndNormalizePlan(plan, {
     intent: finalIntent,
     userMessage,
     isFileQuery,
     historyAnalysis,
   });
   plan = validation.plan;
   // preserve any existing behavior when plan is invalid (early returns, errors, etc.)

4. Important constraints:
   - Do NOT change existing behavior or thrown errors.
   - Preserve all current edge cases.
   - If you must keep a console.log, keep it but move it into the helper.
   - Keep types broad (any) where exact types are unclear; we'll tighten later.

5. After refactor:
   - Ensure processStreamStart.ts still compiles.
   - Ensure there are no unused imports.
   - Do NOT refactor other helpers or phases in this pass.
```

---

## File Structure After Phase 4.1

```
apps/scorpion/app/api/chat/stream/
├── helpers/
│   ├── planValidator.ts         ← NEW (~650 lines)
│   ├── planExecutor.ts          ← existing
│   ├── legacyExecutor.ts        ← existing
│   ├── ragIntegration.ts        ← existing
│   └── ... (other helpers)
└── processStreamStart.ts         ← ~3,900 lines (reduced from ~4,500)
```

---

## Success Criteria

- [ ] Plan validation logic extracted to `planValidator.ts`
- [ ] `processStreamStart.ts` imports and uses the helper
- [ ] No TypeScript compilation errors
- [ ] No behavior changes (exact same plan output)
- [ ] Console logs preserved for debugging
- [ ] ~600 lines removed from main file

---

## After Phase 4.1

Continue with:
1. **Phase 4.2**: Result Processor (~500 lines)
2. **Phase 4.3**: Summarizer Context Builder (~1,000 lines)

See [PHASE_4_PLAN.md](PHASE_4_PLAN.md) for full details.

---

**Status**: Ready to execute Phase 4.1
**Next Action**: Run the Cursor prompt above
**Estimated Time**: 30-45 minutes
