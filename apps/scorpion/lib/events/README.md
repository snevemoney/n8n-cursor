# Scorpion Event System

Event-driven architecture foundation for cloud-native patterns.

## Overview

The event system implements Pub/Sub patterns from Cloud Digital Leader principles:
- **Decoupled services** - Components communicate via events, not direct calls
- **Event-driven functions** - FaaS-style handlers that react to events
- **Observable system** - All events are logged and can be queried
- **Cost-aware** - Events track resource usage for cost management

## Quick Start

### Emit an Event

```typescript
import { emitEvent } from '@/lib/events/event-bus';
import type { WorkflowFailedEvent } from '@/lib/events/types';

// Emit a workflow failure event
await emitEvent({
  id: crypto.randomUUID(),
  type: 'workflow.failed',
  severity: 'error',
  timestamp: new Date().toISOString(),
  source: 'n8n-workflow',
  environment: 'prod',
  data: {
    workflowId: 'workflow-123',
    workflowName: 'Data Processing Pipeline',
    error: 'Connection timeout',
    errorCode: 'TIMEOUT',
  },
});
```

### Subscribe to Events

```typescript
import { getEventBus } from '@/lib/events/event-bus';

const bus = getEventBus();

// Subscribe to specific event types
const unsubscribe = bus.subscribe('workflow.failed', async (event) => {
  console.log('Workflow failed:', event.data.workflowName);
  // Handle the failure
});

// Subscribe to all events
const unsubscribeAll = bus.subscribeAll((event) => {
  console.log('Event:', event.type);
});

// Clean up
unsubscribe();
```

### Initialize Handlers

```typescript
import { initializeEventHandlers } from '@/lib/events/handlers';

// In your app initialization
initializeEventHandlers();
```

## Event Types

See `types.ts` for complete event definitions:

- **Agent Events**: `agent.run.started`, `agent.run.completed`, `agent.run.failed`
- **Workflow Events**: `workflow.started`, `workflow.failed`
- **Tool Events**: `tool.request`, `tool.response`, `tool.failed`
- **System Events**: `system.alert`, `system.error`
- **Cost Events**: `cost.threshold.warning`, `cost.resource.created`

## Architecture

```
┌─────────────────────────────────────────┐
│         Event Producers                 │
│  (n8n, agents, tools, system)          │
└──────────────┬──────────────────────────┘
               │ emit events
               ▼
┌─────────────────────────────────────────┐
│         Event Bus                       │
│  (Pub/Sub pattern)                      │
└──────────────┬──────────────────────────┘
               │ distribute
               ▼
┌─────────────────────────────────────────┐
│         Event Handlers                  │
│  (cost tracking, alerts, logging)      │
└─────────────────────────────────────────┘
```

## Future Enhancements

- [ ] Database persistence (Postgres events table)
- [ ] Redis Streams for higher throughput
- [ ] Event replay capability
- [ ] Event filtering and querying
- [ ] Event aggregation and analytics

