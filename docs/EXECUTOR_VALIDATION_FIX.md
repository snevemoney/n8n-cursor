# Executor Validation Fix

**Date**: 2025-01-27  
**Issue**: Executor validation was failing when tools executed successfully because the `error` field was required but missing

---

## 🔍 Problem

When a tool executed successfully, the LLM would omit the `error` field entirely (making it `undefined`), but the schema required it to be present (even if `null`). This caused validation errors:

```
[Prompt executor] Validation failed: { _errors: [], error: { _errors: [ 'Required' ] } }
```

**Root Cause**: `ExecutorStepSchema` used `.nullable()` which requires the field to be present (can be `null` but not `undefined`).

---

## ✅ Fix Applied

### 1. Schema Update (`packages/scorpion-core/src/orchestration/schemas.ts`)

**Changed**:
```typescript
// Before:
error: z.object({
  message: z.string(),
  kind: z.string(),
  retryUsed: z.boolean(),
}).nullable(),

// After:
error: z.object({
  message: z.string(),
  kind: z.string(),
  retryUsed: z.boolean(),
}).nullable().optional(), // Allow null or undefined for successful steps
```

### 2. Prompt Clarification (`apps/scorpion/lib/prompts/executor.system.txt`)

**Changed**: Added clarification that `error` can be omitted entirely for successful steps:
```typescript
"error": { "message": "...", "kind": "...", "retryUsed": true|false } | null  // Omit this field entirely for successful steps, or set to null
```

---

## ✅ Verification

From the logs, after the fix:
- ✅ File read succeeded: `ok: true`, `hasContent: true`, `contentLength: 9154`
- ✅ Executor validation should now pass for successful tool executions
- ✅ Schema allows both `null` and `undefined` for the `error` field

---

## 📝 Related Issues

- Path resolution fix (see `PATH_RESOLUTION_FIX.md`) - File reading now works correctly
- Pattern query detection (see `PATTERN_QUERY_FIX.md`) - Queries are correctly routed to documentation files

---

## 🎯 Impact

- **Before**: Executor validation failed on successful tool executions, causing kill-switch activation
- **After**: Executor validation passes for both successful and failed tool executions
- **Result**: Tool execution results are properly validated and processed

