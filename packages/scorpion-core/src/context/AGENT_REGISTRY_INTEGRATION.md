# Agent Registry Integration Guide

This guide shows how to integrate the lightningflow agent registry with the scorpion-core grounding system.

## Overview

The grounding system now supports dependency injection for external agent registries. This allows you to use agent configs from lightningflow or other sources without creating build-time dependencies.

## Basic Integration

### Step 1: Register the Agent Registry

In your app initialization code (e.g., `apps/lightningflow/web/src/app/layout.tsx` or initialization file):

```typescript
import { registerAgentRegistry } from '@scorpion/core/context';
import { getAgent, getActiveAgents } from '@/lib/agents/registry';

// Register the agent registry at app startup
registerAgentRegistry({
  getAgent,
  getActiveAgents
});
```

### Step 2: Use Grounding with Agent Support

Now when you use the grounding system, it will automatically use the registered agent registry:

```typescript
import { generateGroundingContext } from '@scorpion/core/context';

const context = generateGroundingContext({
  includeAgents: true,
  agentId: 'infra-scout', // Will use lightningflow registry if available
  businessName: 'Acme Corp'
});

// Agent info will come from lightningflow registry
console.log(context.agents.available);
```

## Per-Request Registry Override

You can also pass a registry per-request if needed:

```typescript
import { generateGroundingContext, AgentRegistry } from '@scorpion/core/context';
import { getAgent, getActiveAgents } from '@/lib/agents/registry';

const customRegistry: AgentRegistry = {
  getAgent: (id) => {
    // Custom logic here
    return getAgent(id);
  },
  getActiveAgents: () => {
    // Custom filtering
    return getActiveAgents().filter(a => a.active);
  }
};

const context = generateGroundingContext({
  agentRegistry: customRegistry,
  agentId: 'infra-scout'
});
```

## Fallback Behavior

The system gracefully falls back to built-in agent definitions if:
- No registry is registered
- Registry doesn't have the requested agent
- Registry returns empty results

This ensures the grounding system always works, even without external registries.

## Example: Next.js App Router Integration

```typescript
// apps/lightningflow/web/src/lib/grounding-setup.ts
import { registerAgentRegistry } from '@scorpion/core/context';
import { getAgent, getActiveAgents } from '@/lib/agents/registry';

export function setupGrounding() {
  // Register agent registry
  registerAgentRegistry({
    getAgent,
    getActiveAgents
  });
  
  console.log('✅ Agent registry registered with grounding system');
}
```

```typescript
// apps/lightningflow/web/src/app/layout.tsx
import { setupGrounding } from '@/lib/grounding-setup';

// Call setup on app initialization
if (typeof window === 'undefined') {
  // Server-side only
  setupGrounding();
}
```

## Benefits

1. **No Build-Time Dependencies**: The grounding system doesn't import lightningflow code at build time
2. **Flexible**: Can use any agent registry implementation
3. **Graceful Fallback**: Works even without external registries
4. **Type-Safe**: Full TypeScript support with proper interfaces
5. **Optional**: Agent support is completely optional - grounding works without it

## API Reference

### `registerAgentRegistry(registry: AgentRegistry): void`

Registers a global agent registry that will be used by all grounding context generation.

### `generateGroundingContext(options?: {...}): GroundingContext`

Generates grounding context, optionally using the registered agent registry.

Options:
- `agentRegistry?: AgentRegistry` - Override registry for this call
- `agentId?: string` - Specific agent ID to include context for
- `includeAgents?: boolean` - Whether to include agent information (default: true)

### `getAgentInfo(agentId: string): AgentInfo | undefined`

Gets agent information, using external registry if available.

### `getAgentsByRole(role: string): AgentInfo[]`

Gets all agents for a specific role, using external registry if available.

