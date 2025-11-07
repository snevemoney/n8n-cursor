# Duplicate Code Consolidation Status

**Last Updated**: 2025-11-06

## ✅ Completed

### Abuse Detection Engine
- **Status**: ✅ Consolidated
- **Location**: `packages/shared-helpers/src/abuse/detection-engine.ts`
- **Removed**: Duplicate files from `apps/lightningflow/web` and `apps/lightningflow/lightning-ui`
- **Updated**: All 6 import locations to use `@lf/shared-helpers`
- **Impact**: ~450 lines of duplicate code eliminated

## ⏸️ Deferred (Requires Larger Refactor)

### Autosave Hook
- **Status**: ⏸️ Deferred
- **Reason**: Depends on app-specific React hooks (`useToaster`, `useModeContext`)
- **Impact**: ~370 lines duplicated
- **Solution Options**:
  1. **Option A**: Move `useToaster` and `useModeContext` to shared package first (bigger refactor)
  2. **Option B**: Extract core autosave logic to shared utility, keep React hook wrappers in apps
  3. **Option C**: Make hook accept dependencies as parameters (breaking change)
- **Recommendation**: Defer until `useToaster` and `useModeContext` are also consolidated

## Notes

- Abuse Detection Engine consolidation was straightforward (no React dependencies)
- Autosave Hook consolidation requires careful consideration of React hook dependencies
- Both implementations are currently working and not causing issues
- Consolidation can be done incrementally as needed

