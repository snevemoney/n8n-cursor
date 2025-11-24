# NASA Power of 10 Safety Guidelines - Implementation Plan

## The 10 Rules

1. **No Recursion** - Restrict all code to very simple control flow constructs - no gotos, no setjmp/longjmp, no direct or indirect recursion
2. **Bounded Loops** - All loops must have a fixed upper bound
3. **No Dynamic Allocation** - Do not use dynamic memory allocation after initialization
4. **Small Functions** - No function should be longer than what can be printed on a single sheet of paper (typically 60 lines)
5. **Assertions** - The assertion density should average at least two assertions per function
6. **Minimal Scope** - Declare data objects at the smallest possible level of scope
7. **Check Returns** - Check the return value of all non-void functions, and check the validity of parameters at each function entry
8. **Minimal Preprocessor** - Limit the use of the preprocessor to file inclusion and simple macros
9. **Limited Pointers** - Limit pointer use - no more than one level of dereferencing
10. **Zero Warnings** - Compile with all warnings enabled and fix all warnings

## Implementation Strategy

### Phase 1: Audit Current Code
- [ ] Identify all functions > 60 lines
- [ ] Find all loops without upper bounds
- [ ] Check for recursion (direct or indirect)
- [ ] Find dynamic allocations (new, malloc, etc.)
- [ ] Count assertions per function
- [ ] Check parameter validation
- [ ] Find pointer dereferencing > 1 level
- [ ] Run TypeScript with strictest settings

### Phase 2: Refactor Critical Files
Priority order:
1. `app/api/chat/stream/route.ts` - Main orchestrator (7000+ lines)
2. `server/orchestrator/*.ts` - Core logic
3. `app/(scorpion)/chat/hooks/*.ts` - Client hooks
4. `components/chat/*.tsx` - UI components

### Phase 3: Apply Rules Systematically
For each file:
1. Break down functions > 60 lines
2. Add bounds to all loops
3. Remove recursion
4. Add assertions
5. Minimize scope
6. Validate all parameters
7. Check all return values
8. Limit pointer usage

## Current Status

### Files Already Compliant
- `server/orchestrator/planner.ts` - Uses helpers, bounded loops
- `server/orchestrator/expertRouter.ts` - Small functions, bounded loops

### Files Needing Work
- `app/api/chat/stream/route.ts` - 7000+ lines, needs major refactoring
- Various hook files - Need bounds and assertions

## Tools & Checks

### TypeScript Strict Mode
```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true
}
```

### ESLint Rules
- max-lines-per-function: 60
- max-depth: 4
- no-recursion
- no-dynamic-allocations (where possible)

