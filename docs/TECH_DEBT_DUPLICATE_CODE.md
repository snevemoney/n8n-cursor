# Duplicate Code Analysis

**Status**: Identified for future consolidation  
**Priority**: Medium  
**Risk**: Low (code works, just duplicated)

## Identified Duplicates

### 1. Abuse Detection Engine
**Files**:
- `apps/lightningflow/web/src/lib/abuse/detection-engine.ts`
- `apps/lightningflow/lightning-ui/src/lib/abuse/detection-engine.ts`

**Status**: Identical implementations  
**Impact**: ~450 lines duplicated  
**Solution**: Move to `packages/shared-helpers/src/abuse/detection-engine.ts`

### 2. Autosave Hook
**Files**:
- `apps/lightningflow/web/src/hooks/useAutosave.ts`
- `apps/lightningflow/lightning-ui/src/hooks/useAutosave.ts`

**Status**: Identical implementations  
**Impact**: ~370 lines duplicated  
**Solution**: Move to `packages/shared-helpers/src/hooks/useAutosave.ts`

## Consolidation Plan

### Phase 1: Create Shared Package Structure
```bash
packages/shared-helpers/src/
├── abuse/
│   └── detection-engine.ts
└── hooks/
    └── useAutosave.ts
```

### Phase 2: Update Imports
- Update `apps/lightningflow/web` to import from `@shared-helpers`
- Update `apps/lightningflow/lightning-ui` to import from `@shared-helpers`
- Remove duplicate files

### Phase 3: Verify
- Run typecheck
- Run tests
- Verify functionality

## Benefits

- **Reduced maintenance**: Single source of truth
- **Consistency**: Both apps use same logic
- **Smaller bundle**: No duplicate code
- **Easier updates**: Fix once, works everywhere

## Notes

- These duplicates were identified during tech debt cleanup
- Consolidation can be done incrementally
- Both implementations are currently working
- No breaking changes required

