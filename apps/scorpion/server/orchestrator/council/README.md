# Council System Refactoring

## Overview

This directory contains the canonical council implementation following the adapter pattern. All council logic now routes through a single source of truth.

## Structure

### `types.ts` - Canonical Contract
Defines the single source of truth for council types:
- `CouncilQuestion` - Input to council
- `CouncilVote` - Individual agent vote
- `CouncilResult` - Final council output

### `v2.ts` - Canonical Implementation
The one true council implementation (`runCouncilV2`):
- Uses the new council system from `@/server/council`
- Converts between new and canonical formats
- This is where all council logic lives

### `legacy.ts` - Adapter Layer
Wraps old council entry points:
- `runCouncilLegacy` - Adapter for old `runCouncil` calls
- `runCouncilDeliberationStreamingLegacy` - Adapter for streaming council
- Routes everything through `v2.ts`
- Feature flag support: `SCORPION_COUNCIL_IMPLEMENTATION=v2|legacy`

## Usage

### New Code (Job Phase)
```typescript
import { runCouncilV2 } from '@/server/orchestrator/council/v2';

const question = {
  id: job.id,
  text: input,
  context: { plan, previousTools, ... }
};

const result = await runCouncilV2(question);
```

### Old Code (Legacy Adapter)
```typescript
import { runCouncilLegacy } from '@/server/orchestrator/council/legacy';

// Old signature still works
const result = await runCouncilLegacy({
  goalDescription: '...',
  planSummary: '...',
  // ... old format
});
```

## Migration Status

✅ **Completed:**
- Canonical types defined
- V2 implementation created
- Legacy adapter created
- Job phase updated to use v2
- Chat route updated to use legacy adapter
- Feature flag support added

⏳ **Next Steps:**
- Test all council paths
- Monitor for issues
- Once stable, delete old implementations

## Feature Flag

Set `SCORPION_COUNCIL_IMPLEMENTATION` in `.env`:
- `v2` (default) - Use new council system
- `legacy` - Use old streaming council (fallback)

## Files Updated

1. **Created:**
   - `server/orchestrator/council/types.ts`
   - `server/orchestrator/council/v2.ts`
   - `server/orchestrator/council/legacy.ts`

2. **Updated:**
   - `server/orchestrator/jobPhases.ts` - Now uses `runCouncilV2`
   - `app/api/chat/stream/route.ts` - Now uses legacy adapters

3. **Old Files (Still Exist, But Wrapped):**
   - `lib/chat/council.ts` - Wrapped by legacy adapter
   - `server/council/index.ts` - Used by v2 implementation

## Architecture

```
┌─────────────────────────────────────────┐
│         Old Code Paths                   │
│  (chat route, orchestrator, etc.)        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Legacy Adapter (legacy.ts)         │
│  - runCouncilLegacy()                    │
│  - runCouncilDeliberationStreamingLegacy()│
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Canonical V2 (v2.ts)               │
│  - runCouncilV2()                        │
│  - Single source of truth               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      New Council System                 │
│  (server/council/index.ts)              │
└─────────────────────────────────────────┘
```

## Benefits

1. **Single Source of Truth**: All council logic goes through one implementation
2. **No Breaking Changes**: Old code continues to work via adapters
3. **Easy Testing**: Can test v2 independently
4. **Gradual Migration**: Can migrate piece by piece
5. **Feature Flags**: Can roll back if needed









