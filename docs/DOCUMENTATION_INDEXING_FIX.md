# Documentation Indexing and Query Fix

**Date**: 2025-01-27  
**Issue**: SCORPION was not finding documentation files like `MACRO_AND_MICRO_PATTERNS.md` when queried

---

## 🔍 Problem Analysis

1. **Documentation not indexed in essential ingestion**: The `ingestEssential()` method only indexed tech debt and recommendations, skipping documentation files
2. **Planner not preferring code.readFile**: For documentation queries, the planner was using `kb.search` instead of directly reading documentation files
3. **No enforcement for pattern queries**: Pattern/documentation queries weren't being detected and routed to the correct documentation files

---

## ✅ Fixes Implemented

### 1. Enhanced Essential Ingestion (`project-knowledge.ts`)

**Changed**: `ingestEssential()` now includes key documentation files

```typescript
// Now includes:
- Tech debt
- Recommendations  
+ Key documentation files (MACRO_AND_MICRO_PATTERNS.md, PERFORMANCE_OPTIMIZATIONS_COMPLETE.md, etc.)
```

**Key Documentation Patterns Detected**:
- `macro.*micro.*pattern` → `MACRO_AND_MICRO_PATTERNS.md`
- `performance.*optimization` → `PERFORMANCE_OPTIMIZATIONS_COMPLETE.md`
- `orchestrator.*architecture` → `ORCHESTRATOR_ARCHITECTURE.md`
- `workflow.*overview` → `workflows/workflow-overview.md`
- `n8n.*integration` → `N8N_INTEGRATION_GUIDE.md`
- `quick.*start`, `setup`, `guide` → Various setup/guide docs

**Impact**: Key documentation files are now indexed on startup, making them searchable via RAG

---

### 2. Improved Planner Enforcement (`planner-enforcement.ts`)

**Added**: Pattern/documentation query detection and routing

```typescript
// Detects queries like:
- "macro and micro patterns"
- "macro patterns"
- "micro patterns"
- "documentation"
- "performance optimization"
- "orchestrator"
- "workflow overview"
```

**Behavior**: 
- Automatically routes to `code.readFile` instead of `kb.search`
- Selects the correct documentation file based on query keywords
- Falls back to `docs/MACRO_AND_MICRO_PATTERNS.md` for pattern queries

**Impact**: Documentation queries now directly read the relevant files instead of searching RAG

---

### 3. Chat Stream Route Enforcement (`route.ts`)

**Added**: Real-time enforcement for pattern/documentation queries

```typescript
// Detects and enforces:
if ((isPatternQuery || isDocumentationQuery) && plan.plan[0]?.tool === 'kb.search') {
  // Replace kb.search with code.readFile(docPath)
}
```

**Impact**: Even if the planner chooses `kb.search`, the system automatically corrects it to `code.readFile`

---

### 4. Check Script Created (`check-doc-indexing.ts`)

**New Script**: `apps/scorpion/scripts/check-doc-indexing.ts`

**Usage**:
```bash
tsx apps/scorpion/scripts/check-doc-indexing.ts [filename]
```

**Features**:
- Checks if a specific documentation file is indexed
- Shows all documentation items in RAG
- Verifies common documentation files
- Provides indexing statistics

**Example**:
```bash
tsx apps/scorpion/scripts/check-doc-indexing.ts MACRO_AND_MICRO_PATTERNS.md
```

---

## 📊 Expected Results

### Before:
- ❌ "macro and micro patterns" → `kb.search` → No results found
- ❌ Documentation not indexed on startup
- ❌ Planner always used `kb.search` for documentation queries

### After:
- ✅ "macro and micro patterns" → `code.readFile('docs/MACRO_AND_MICRO_PATTERNS.md')` → Direct file read
- ✅ Key documentation indexed on startup
- ✅ Planner prefers `code.readFile` for documentation queries
- ✅ System enforces correct tool even if planner chooses wrong one

---

## 🚀 Next Steps

1. **Run the check script** to verify current indexing:
   ```bash
   tsx apps/scorpion/scripts/check-doc-indexing.ts
   ```

2. **Trigger a full ingestion** (if needed):
   ```bash
   # Via API
   curl -X POST http://localhost:3003/api/project/knowledge
   ```

3. **Test the query**:
   - Ask: "Hello! Can you tell me about the macro and micro patterns in this system?"
   - Expected: SCORPION should now directly read `docs/MACRO_AND_MICRO_PATTERNS.md`

---

## 📝 Files Modified

1. `packages/scorpion-core/src/knowledge/project-knowledge.ts`
   - Enhanced `ingestEssential()` to include key documentation

2. `apps/scorpion/lib/chat/planner-enforcement.ts`
   - Added pattern/documentation query detection
   - Added fallback plans for documentation queries

3. `apps/scorpion/app/api/chat/stream/route.ts`
   - Added enforcement for pattern/documentation queries

4. `apps/scorpion/lib/auto-sync.ts`
   - Updated to handle new return type from `ingestEssential()`

5. `apps/scorpion/scripts/check-doc-indexing.ts` (NEW)
   - Script to check documentation indexing status

---

## ✅ Verification

To verify the fixes work:

1. **Check indexing**:
   ```bash
   tsx apps/scorpion/scripts/check-doc-indexing.ts MACRO_AND_MICRO_PATTERNS.md
   ```

2. **Test query in SCORPION**:
   - Query: "Can you tell me about the macro and micro patterns?"
   - Should see: `code.readFile('docs/MACRO_AND_MICRO_PATTERNS.md')` in the plan
   - Should get: Full response from the documentation file

3. **Check logs**:
   - Look for: `[Chat Stream] Enforcement: pattern/documentation query starting with kb.search - replacing with code.readFile`
   - Look for: `✅ Ingested X key documentation files` in startup logs

---

## 🎯 Summary

All three issues have been fixed:
1. ✅ Documentation is now indexed in essential ingestion
2. ✅ Planner prefers `code.readFile` for documentation queries
3. ✅ System enforces correct tool usage even if planner chooses wrong one

The system should now correctly find and read documentation files like `MACRO_AND_MICRO_PATTERNS.md` when queried! 🎉

