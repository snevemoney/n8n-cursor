# 🚀 Start Phase 4.1 Here

## You Are Here

✅ Phases 1-3 complete and locked in
✅ Documentation cross-linked
✅ Plan Validator skeleton created
✅ Result Processor prompt ready
✅ Validation checklist ready

**Next**: Extract Plan Validator (~600 lines → `planValidator.ts`)

---

## Quick Start (3 Steps)

### Step 1: Open the Skeleton File

The skeleton already exists with TODOs marking exactly where to move code:

```bash
# View the skeleton
code apps/scorpion/app/api/chat/stream/helpers/planValidator.ts
```

Each function has a `TODO:` comment showing:
- What logic to move
- Where it lives in processStreamStart.ts (line ranges)
- What the function should do

### Step 2: Use Cursor to Fill In the Skeleton

**Option A: Let Cursor auto-fill the TODOs**

1. Open [helpers/planValidator.ts](app/api/chat/stream/helpers/planValidator.ts) in Cursor
2. Use Cursor's "cmd+K" (or Ctrl+K) and paste:

```
Fill in all TODO blocks in this file by extracting the corresponding logic from processStreamStart.ts.

Each TODO comment specifies:
- Which lines to extract from processStreamStart.ts
- What the function should do

Important:
- Move the logic EXACTLY as-is - no refactoring, no cleanup
- Preserve all console.log statements
- Keep all edge case handling
- Use broad types (any) where TypeScript types are unclear

After moving logic into each function, make sure validateAndNormalizePlan() calls them in the correct order:
1. Validate plan structure
2. Normalize steps
3. Inject tools for kb.search-heavy plans
4. Inject code.readFile for codebase questions
5. Correct file paths
6. Enforce system tools
7. Enforce plan rules
8. Apply plan enforcement
```

**Option B: Use the original Cursor prompt** (more detailed)

Use the prompt from [READY_FOR_PHASE_4.md](READY_FOR_PHASE_4.md#53-90) if you want more explicit instructions.

### Step 3: Wire It Up in processStreamStart.ts

After the logic is moved, Cursor should automatically:
1. Add import: `import { validateAndNormalizePlan } from './helpers/planValidator';`
2. Replace the ~600 lines of inline validation with:

```typescript
// After planner phase completes (around line 1415)
const planValidation = validateAndNormalizePlan(plan, {
  intent: finalIntent,
  userMessage,
  isFileQuery,
  historyAnalysis,
  conversationHistory,
});

plan = planValidation.plan;

if (!planValidation.isValid) {
  console.warn('[Plan Validator] Plan validation failed:', planValidation.issues);
  // Keep existing error handling behavior
}

if (planValidation.warnings && planValidation.warnings.length > 0) {
  console.warn('[Plan Validator] Warnings:', planValidation.warnings);
}
```

3. Remove the old inline validation code (~600 lines)

---

## Sanity Checks (After Extraction)

### 1. TypeScript Build
```bash
cd /Users/evenslouis/n8n-cursor
pnpm typecheck
# or
pnpm build
```

### 2. Search for Duplicates
```bash
cd apps/scorpion/app/api/chat/stream

# Should find ZERO results (all moved to helper)
rg "kb\.search-heavy|hasOnlyKbSearch" processStreamStart.ts

# Should find ONE result (the import)
rg "validateAndNormalizePlan" processStreamStart.ts
```

### 3. Console Logs Check
In `planValidator.ts`, verify key logs survived:
- `[Plan Validator]` or `[Chat Stream]` prefixes
- kb.search detection logs
- Path correction logs
- Tool injection logs

---

## Manual Runtime Test (Quick & Dirty)

Hit your dev chat endpoint with these 3 queries:

### Test 1: Normal Query
```
"Explain how the planner and council work together in Scorpion."
```
**Expect**: Same behavior as before, no errors

### Test 2: Codebase Query
```
"Show me the main handler for the chat stream in Scorpion and explain how preflight checks work."
```
**Expect**: Plan includes `code.readFile` steps, file contents appear

### Test 3: Workflow Query
```
"How do n8n workflows get executed in the backend?"
```
**Expect**: File paths corrected (n8n-cursor, not lightningflow), no path errors

If all 3 pass → Phase 4.1 ✅

---

## After Phase 4.1 ✅

1. **Update status**:
   - Edit [PHASE_4_PLAN.md](PHASE_4_PLAN.md) line 5:
     ```markdown
     - [x] 4.1 Plan Validator extracted (~600 lines)
     ```

2. **Commit**:
   ```bash
   git add .
   git commit -m "refactor(phase-4.1): extract planValidator helper

   - Extracted ~600 lines of plan validation logic
   - Created helpers/planValidator.ts with focused functions
   - Replaced inline validation with validateAndNormalizePlan() call
   - No behavior changes, all tests pass"
   ```

3. **Move to Phase 4.2**:
   - Open [PHASE_4_2_CURSOR_PROMPT.md](PHASE_4_2_CURSOR_PROMPT.md)
   - Follow the same process for Result Processor

---

## Files to Know

| File | Purpose |
|------|---------|
| [helpers/planValidator.ts](app/api/chat/stream/helpers/planValidator.ts) | **Skeleton** - Fill in the TODOs |
| [PHASE_4_PLAN.md](PHASE_4_PLAN.md) | Full extraction plan with all details |
| [READY_FOR_PHASE_4.md](READY_FOR_PHASE_4.md) | Original detailed prompt (if needed) |
| [PHASE_4_2_CURSOR_PROMPT.md](PHASE_4_2_CURSOR_PROMPT.md) | Next step after 4.1 |

---

## Troubleshooting

### "TypeScript errors about missing types"
- Keep types broad (`any`) for now - we'll tighten later
- Focus on behavior preservation, not type perfection

### "Can't find the code to move"
- Use the grep patterns in [PHASE_4_PLAN.md](PHASE_4_PLAN.md#L31-L43)
- Line numbers are approximate - search for the patterns instead

### "Console logs disappeared"
- Check both files - some may have moved to `planValidator.ts`
- Update log prefixes from `[Chat Stream]` to `[Plan Validator]` for clarity

### "Tests failing / behavior changed"
- Compare the moved logic line-by-line with the original
- Look for missing edge case handling or conditionals
- Check if variables were renamed during extraction

---

**Ready? Start with Step 1 above!** 🚀

The skeleton is waiting, the TODOs are marked, and Cursor knows what to do.
