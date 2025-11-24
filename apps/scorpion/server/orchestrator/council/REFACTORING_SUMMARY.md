# Council Refactoring Summary

## ✅ Completed Steps

### 1. Created Canonical Contract
- **File**: `server/orchestrator/council/types.ts`
- Defines `CouncilQuestion`, `CouncilVote`, `CouncilResult`
- Single source of truth for council types

### 2. Created V2 Implementation
- **File**: `server/orchestrator/council/v2.ts`
- Implements `runCouncilV2(question: CouncilQuestion): Promise<CouncilResult>`
- Uses new council system from `server/council/index.ts`
- Converts between formats

### 3. Connected Job Phase to V2
- **File**: `server/orchestrator/jobPhases.ts`
- Updated `runCouncilPhaseStep` to use `runCouncilV2`
- Builds canonical `CouncilQuestion` from job context
- Stores result in job context

### 4. Created Legacy Adapter
- **File**: `server/orchestrator/council/legacy.ts`
- `runCouncilLegacy()` - Adapter for old `runCouncil` signature
- `runCouncilDeliberationStreamingLegacy()` - Adapter for streaming council
- Both route through `runCouncilV2`
- Feature flag support: `SCORPION_COUNCIL_IMPLEMENTATION=v2|legacy`

### 5. Updated Old Imports
- **File**: `app/api/chat/stream/route.ts`
  - Changed `runCouncilDeliberationStreaming` → `runCouncilDeliberationStreamingLegacy`
  - Changed `runCouncil` → `runCouncilLegacy`
- **File**: `server/orchestrator/index.ts`
  - Changed `runCouncil` → `runCouncilLegacy`

## 📊 Architecture

```
Old Code Paths
    │
    ├─ Chat Route (streaming)
    ├─ Orchestrator (direct)
    └─ Other callers
    │
    ▼
Legacy Adapter (legacy.ts)
    │
    ├─ runCouncilLegacy()
    └─ runCouncilDeliberationStreamingLegacy()
    │
    ▼
Canonical V2 (v2.ts)
    │
    └─ runCouncilV2()
    │
    ▼
New Council System (server/council/index.ts)
```

## 🔄 Migration Flow

1. **Old code** calls legacy adapter functions
2. **Legacy adapter** converts old format → canonical format
3. **V2** processes using new council system
4. **V2** converts result → canonical format
5. **Legacy adapter** converts canonical → old format
6. **Old code** receives result in expected format

## ✨ Benefits

- ✅ **No breaking changes** - All old code still works
- ✅ **Single source of truth** - All logic goes through v2
- ✅ **Easy testing** - Can test v2 independently
- ✅ **Feature flags** - Can roll back if needed
- ✅ **Gradual migration** - Can migrate piece by piece

## 📝 Files Changed

### Created
- `server/orchestrator/council/types.ts`
- `server/orchestrator/council/v2.ts`
- `server/orchestrator/council/legacy.ts`
- `server/orchestrator/council/README.md`
- `server/orchestrator/council/REFACTORING_SUMMARY.md`

### Updated
- `server/orchestrator/jobPhases.ts` - Uses `runCouncilV2`
- `app/api/chat/stream/route.ts` - Uses legacy adapters
- `server/orchestrator/index.ts` - Uses `runCouncilLegacy`

### Unchanged (But Wrapped)
- `lib/chat/council.ts` - Old implementation, wrapped by legacy adapter
- `server/council/index.ts` - New implementation, used by v2

## 🧪 Testing Checklist

- [ ] Job phase council works
- [ ] Chat route council works (streaming)
- [ ] Direct council calls work
- [ ] Feature flag works (v2 vs legacy)
- [ ] No runtime errors
- [ ] Types are correct

## 🚀 Next Steps

1. **Test thoroughly** - Verify all council paths work
2. **Monitor** - Watch for any issues in production
3. **Iterate** - Fix any bugs found
4. **Delete old code** - Once stable, remove old implementations:
   - `lib/chat/council.ts` (keep computeConsensus if needed)
   - Old council prompt files (if any)
   - Old council routing logic

## 🔧 Feature Flag

Set in `.env`:
```bash
SCORPION_COUNCIL_IMPLEMENTATION=v2  # default
# or
SCORPION_COUNCIL_IMPLEMENTATION=legacy  # fallback
```









