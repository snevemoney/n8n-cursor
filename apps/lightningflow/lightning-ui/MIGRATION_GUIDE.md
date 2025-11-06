# 🚀 Senior-Level Architecture Migration Guide

## New Folder Structure

### Before (Flat Structure)
```
web/src/
  app/
    send/page.tsx
    receive/page.tsx
    dashboard/page.tsx
  components/ui/
  lib/
  hooks/
```

### After (Feature-Based Structure)
```
web/src/
  app/
    dashboard/{components,hooks,lib}/
    payments/{send,receive,history}/
    settings/{profile,node,security}/
    agents/{components,hooks,lib}/
  features/
    onboarding/
    payments/
    agents/
  components/ui/{forms,navigation,feedback}/
  lib/{auth,api,crypto,validation}/
  hooks/{ui,data,auth,payments}/
  contexts/
  types/{api,ui,payments}/
```

## Import Changes

### Before
```typescript
import { useSmartRedirect } from '../../hooks/useSmartRedirect'
import { Button } from '../../components/ui/button'
```

### After
```typescript
import { useSmartRedirect } from '@/hooks'
import { Button } from '@/components/ui'
```

## Benefits

1. **Scalability**: Each feature is self-contained
2. **Maintainability**: Related code is co-located
3. **Team Collaboration**: Clear ownership boundaries
4. **Testing**: Easier to test features in isolation
5. **Performance**: Better code splitting opportunities

## Migration Steps

1. Run `./scripts/refactor-structure.sh`
2. Update import paths using find/replace
3. Test all routes and components
4. Update documentation
