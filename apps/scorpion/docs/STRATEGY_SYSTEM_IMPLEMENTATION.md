# Scorpion Strategy System Implementation

This document describes the new strategic intelligence system added to Scorpion, transforming it from a reactive tool orchestrator into a strategic advisor with pattern recognition, self-improvement, and next-best-action capabilities.

## Overview

The strategy system implements 8 core improvements based on business intelligence principles:

1. **Strategy First** - Every action starts from the user's goal
2. **Advisor Intelligence** - Pattern recognition + strategic trade-offs
3. **Next-Best-Action Engine** - Always presents what should happen next
4. **Similarity Intelligence** - Reuses past missions and patterns
5. **Self-Improving Loop** - Learns from errors and patterns
6. **Simplicity Rule** - Prefers smallest working solutions
7. **Guardrails** - Prevents hallucination and tool spam
8. **Jarvis Mode** - Single-user, no permission checks

## Architecture

```
┌────────────────────────┐
│      USER (EVENS)      │
└───────────┬────────────┘
            │
  Scorpion UI <-->│<--> Chat Brain
            │
┌───────────┴──────────────────────────┐
│         SCORPION CORE               │
├──────────────────┬──────────────────┤
│  Strategic Layer │ Intelligence Layer│
│  (What & Why)    │  (How & Patterns) │
├──────────────────┼──────────────────┤
│ - Strategy Engine│ - Similarity      │
│ - Advisor Options│   Retrieval      │
│ - Next-Best-Action│ - Pattern Extract│
│ - Risk Scanner   │ - Case-Based      │
│                  │   Reasoning       │
└──────────────────┴──────────────────┘
            │
    ┌───────┴────────┐
    │ Orchestrator   │
    │ (Planning →    │
    │  Tools → Exec) │
    └───────┬────────┘
            │
┌───────────┴──────────────────────────┐
│         Tools Layer                  │
│ (file.read, code.search, etc.)       │
└──────────────────────────────────────┘
```

## Files Created

### Core Types
- `apps/scorpion/server/types/strategy.ts` - All strategy-related TypeScript types

### Strategy Engines
- `apps/scorpion/server/strategy/nextBestAction.ts` - Next-Best-Action computation engine
- `apps/scorpion/server/strategy/similarityEngine.ts` - Similarity retrieval and mission matching

### Self-Improvement
- `apps/scorpion/server/orchestrator/selfImprovement.ts` - Signal logging and patch report generation

### Integration
- `apps/scorpion/server/orchestrator/strategyHandler.ts` - Main integration wrapper
- `apps/scorpion/server/orchestrator/strategyIntegration.example.ts` - Usage examples

### Frontend
- `apps/scorpion/app/(scorpion)/components/NextBestActionCard.tsx` - UI component for displaying NBA

### Documentation
- `apps/scorpion/lib/orchestrator/scorpion-principles.md` - Operating principles document

### Updated Files
- `apps/scorpion/lib/prompts/planner.system.txt` - Updated with strategic advisor directives
- `apps/scorpion/server/types/events.ts` - Added `EV_NextBestAction` event type

## Usage

### Basic Integration

```typescript
import { handleScorpionStrategy, createContextSnapshot } from '@/server/orchestrator/strategyHandler';
import { MissionPhase } from '@/server/types/strategy';

// In your chat handler, after planner phase:
const snapshot = createContextSnapshot(
  userMessage,
  conversationHistory,
  'PLAN' as MissionPhase,
  plan?.objective,
  toolsUsed,
  missionId,
);

const strategy = await handleScorpionStrategy(snapshot);

// Send Next-Best-Action to frontend
send({
  type: 'next-best-action',
  data: strategy.nextBestAction,
});
```

### Logging Improvement Signals

```typescript
import { logCommonFailures } from '@/server/orchestrator/strategyHandler';

// Wrap tool execution
try {
  const result = await executeTool(toolName, args);
} catch (error) {
  logCommonFailures(error, {
    toolName,
    missionId,
    tag: 'tool-execution',
  });
  throw error;
}
```

### Generating Patch Reports

```typescript
import { analyzeSignalsIntoPatchReport } from '@/server/orchestrator/selfImprovement';

// Periodically (e.g., every 10 missions)
const report = analyzeSignalsIntoPatchReport(missionCount);
console.log('Patch suggestions:', report.suggestions);
```

## Next Steps

### 1. Implement Mission Log Store

The similarity engine currently uses a stub. Implement a real storage backend:

```typescript
// Option 1: File-based (simple)
import { FileBasedMissionLogStore } from '@/server/strategy/similarityEngine';
const store = new FileBasedMissionLogStore('./data/missions.json');

// Option 2: Supabase/Postgres (recommended)
class SupabaseMissionLogStore implements MissionLogStore {
  async searchSimilarMissions(query: string, opts?: { limit?: number }) {
    // Use vector similarity search or text matching
  }
  
  async logSuccessfulMission(payload: {...}) {
    // Insert into missions table
  }
}
```

### 2. Wire into Chat Stream Route

Add strategy computation to `apps/scorpion/app/api/chat/stream/route.ts`:

```typescript
// After planner phase
const strategy = await handleScorpionStrategy(
  createContextSnapshot(
    userMessage,
    conversationHistory,
    'PLAN',
    context.plan?.objective,
    [],
    conversationId,
  ),
);

// Send NBA event
send({
  type: 'next-best-action',
  conversationId,
  payload: strategy.nextBestAction,
});
```

### 3. Display NBA in Frontend

Add the NextBestActionCard component to your chat UI:

```tsx
import { NextBestActionCard } from '@/app/(scorpion)/components/NextBestActionCard';

// In your chat component
{nextBestAction && (
  <NextBestActionCard nba={nextBestAction} />
)}
```

### 4. Add Admin Endpoint for Patch Reports

Create an admin route to view improvement signals:

```typescript
// apps/scorpion/app/api/admin/patch-report/route.ts
import { analyzeSignalsIntoPatchReport, getImprovementSignals } from '@/server/orchestrator/selfImprovement';

export async function GET() {
  const signals = getImprovementSignals();
  const report = analyzeSignalsIntoPatchReport(signals.length);
  return NextResponse.json({ signals, report });
}
```

## Key Features

### Next-Best-Action Engine

Automatically computes the optimal next step based on:
- Goal clarity score
- Current mission phase
- Plan existence
- Tool usage history

Returns structured recommendations with:
- Title and description
- Concrete steps
- Rationale
- Suggested tools
- Risk assessment

### Similarity Intelligence

Finds similar past missions using:
- User message content
- Plan summaries
- Domain tags

Helps Scorpion:
- Reuse successful patterns
- Avoid repeating mistakes
- Learn from experience

### Self-Improvement Loop

Tracks and analyzes:
- Tool failures
- High latency operations
- Missing features
- Broken flows
- User corrections

Generates patch reports with:
- Categorized suggestions
- Concrete recommendations
- Related signal IDs

## Principles

See `apps/scorpion/lib/orchestrator/scorpion-principles.md` for the complete operating principles document.

Key principles:
- **Strategy First** - Always identify goal before acting
- **Advisor Intelligence** - Present options, not just answers
- **Simplicity** - Smallest working solution
- **Self-Awareness** - Track and learn from patterns
- **Jarvis Mode** - Single-user, no permission checks

## Testing

To test the system:

1. **Test NBA computation:**
```typescript
const snapshot = createContextSnapshot(
  "What is Scorpion?",
  [{ role: 'user', content: "What is Scorpion?" }],
  'PLAN',
  undefined,
  [],
);
const nba = computeNextBestAction(snapshot);
console.log(nba);
```

2. **Test signal logging:**
```typescript
logImprovementSignal({
  type: 'TOOL_FAILURE',
  message: 'Test tool failure',
  tag: 'test',
  severity: 3,
});
```

3. **Test patch report:**
```typescript
const report = analyzeSignalsIntoPatchReport(1);
console.log(report.suggestions);
```

## Future Enhancements

- [ ] Vector embeddings for similarity search
- [ ] Persistent signal storage (currently in-memory)
- [ ] Automatic patch application via n8n workflows
- [ ] Real-time NBA updates during execution
- [ ] Mission success/failure tracking
- [ ] Pattern library for common mission types

