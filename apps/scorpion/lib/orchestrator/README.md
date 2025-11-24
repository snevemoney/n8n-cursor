# Orchestrator Pipeline

This module implements a deterministic pipeline state machine that enforces phase ordering and provides skip reasons for all phases.

## Architecture

### Phases (in order)
1. **PLAN** - Analyzes objective and generates execution plan
2. **COUNCIL** - Expert review (skipped for single-step objectives)
3. **TOOL_SELECT** - Tag-based tool selection
4. **KNOWLEDGE** - Knowledge base search
5. **USER_TOOLS** - User tools enumeration
6. **EXECUTE** - Execute selected tools

### Key Features

- **Enforced Ordering**: Phases must complete in sequence
- **Skip Reasons**: Every phase emits a status (done/skipped/error) with reason
- **Tag-Based Tool Selection**: Tools are selected by intent tags (research, kb, math, etc.)
- **Event Streaming**: All phase events are emitted for UI updates
- **Status Badges**: UI components show ✅ Done / ⏭️ Skipped: reason / ❌ Error

## Usage

### API Endpoint

```typescript
POST /api/ops/pipeline
Body: { objective: string, context?: any }

// Returns SSE stream with events:
// - phase.start
// - phase.end
// - tool.selected
// - kb.query
// - userTools.list
// - exec.result
```

### Registering Tools

Tools are automatically registered on module load. To add a new tool:

```typescript
import { toolRegistry } from "@/lib/orchestrator";

toolRegistry.register({
  name: "my.tool",
  tags: ["research"], // or ["kb"], ["math"], etc.
  description: "Tool description",
  run: async (args) => { /* ... */ }
});
```

### Tool Tags

- `research` - Web research, search, news
- `kb` - Knowledge base operations
- `math` - Calculations, computations
- `media` - Image, video, audio
- `design` - UI/UX, layouts
- `other` - Default fallback

## UI Integration

Use the `PhaseBadge` component to show status:

```tsx
import { PhaseBadge } from "@/components/PhaseBadge";

<PhaseBadge result={phaseResult} />
```

## Example Events

```json
{
  "type": "phase.end",
  "phase": "council",
  "result": {
    "status": "skipped",
    "reason": "single-step objective"
  }
}

{
  "type": "tool.selected",
  "tools": ["research.run"],
  "rationale": "Matched tags: research from objective",
  "matchedCount": 1,
  "installedCount": 27
}
```

