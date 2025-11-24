# Scorpion Intent Bug Analysis

**Date:** 2025-01-27  
**Issue:** Simple greetings like "hi" trigger full project analysis workflows

---

## Root Cause

The chat handler (`apps/scorpion/app/api/chat/stream/route.ts`) has multiple hardcoded logic paths that **always** inject project analysis tools:

### 1. **Hardcoded Project Analysis Replacement** (Lines 1810-1833)
- **Location:** `route.ts:1810-1833`
- **Problem:** ALWAYS replaces `kb.search` with `project.analyze` regardless of message content
- **Code:**
```typescript
if (firstStep.tool === 'kb.search') {
  plan.plan[0] = {
    ...firstStep,
    tool: 'project.analyze',  // ALWAYS replaces with project.analyze
    args: { path: 'apps/scorpion', includeAST: true },
    title: 'Analyze project structure',
  };
}
```

### 2. **Fallback Plan Generator** (Lines 1400-1583)
- **Location:** `route.ts:1400-1583`
- **Problem:** Creates fallback plans with project analysis tools even for casual questions
- **Code:** Adds `project.analyze` steps for "technical" fallback questions without checking if it's actually needed

### 3. **Plan Validation Logic** (Lines 1603-1649)
- **Location:** `route.ts:1603-1649`
- **Problem:** Injects `project.analyze` for workflow/analysis questions without intent check
- **Code:** Replaces `kb.search` with `project.analyze` based on keyword matching only

### 4. **Codebase Question Detection** (Lines 1651-1699)
- **Location:** `route.ts:1651-1699`
- **Problem:** Keyword-based detection treats many messages as "codebase questions" and injects project tools
- **Code:** Uses regex patterns that match too broadly (e.g., "project" matches "project help" but also "hi" if it contains "project")

---

## Impact

- **Greetings** ("hi", "hello") → Triggers project analysis
- **Simple questions** ("what is 2+2?") → May trigger project analysis
- **General Q&A** → Defaults to project analysis tools
- **User experience** → Annoying, illogical, slow

---

## Solution

Implement **intent classification** before planning:

1. **Classify intent** (`small_talk`, `general_question`, `project_help`, `system_debug`)
2. **Gate tools** based on intent (no project tools for small_talk)
3. **Gate planning** based on intent (minimal plan for small_talk)
4. **Remove hardcoded** project.analyze injections
5. **Update planner prompt** to respect intent

---

## Files to Modify

1. `apps/scorpion/app/api/chat/stream/route.ts` - Add intent classifier, gate tools/planning
2. `apps/scorpion/lib/chat/types.ts` - Add `ScorpionIntent` type
3. `apps/scorpion/components/chat/PlanTimeline.tsx` - Show intent in debug tab
4. `apps/scorpion/lib/prompts/planner.system.txt` - Update to respect intent

