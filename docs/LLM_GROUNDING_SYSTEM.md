# LLM Grounding System - Complete Documentation

## Overview

The LLM Grounding System provides comprehensive context to your LLM models about:
- **Memory Systems**: How to store and retrieve information
- **Assets**: Available data sources and their capabilities
- **Actions**: Tools and operations the model can perform
- **Prompts**: System message templates and patterns

This ensures your models have proper "grounding" in the system's capabilities and can make informed decisions.

## What Was Created

### Core Files

1. **`packages/scorpion-core/src/context/grounding.ts`** - Main grounding system
   - Memory systems definitions
   - Asset sources catalog
   - Available actions list
   - Prompt templates
   - Context generation functions

2. **`packages/scorpion-core/src/context/examples.ts`** - Usage examples
   - 7 practical examples showing different use cases

3. **`packages/scorpion-core/src/context/README.md`** - Documentation
   - Complete usage guide
   - API reference
   - Integration examples

### Integration Points

1. **LLM Adapter** (`packages/scorpion-core/src/llm/modelAdapter.ts`)
   - Added `grounding` parameter to `LLMRequest`
   - Automatic grounding application in `runModel()`
   - Enhanced `LLMAdapter.chat()` with grounding support

2. **User Context** (`packages/scorpion-core/src/context/userProfile.ts`)
   - Optional grounding integration in `getUserContextPrompt()`

3. **Exports** (`packages/scorpion-core/src/context/index.ts`)
   - All grounding functions exported for easy access

## Quick Start

### Basic Usage

```typescript
import { LLMAdapter } from '@scorpion/core';
import { GroundingOptions } from '@scorpion/core/context';

const llm = new LLMAdapter();

const response = await llm.chat(
  "What maintenance is due this month?",
  "You are a helpful assistant.",
  {
    includeMemory: true,
    includeAssets: true,
    includeActions: true,
    businessName: "Acme Corp"
  }
);
```

### With runModel

```typescript
import { runModel } from '@scorpion/core';

const response = await runModel({
  prompt: "Show me energy consumption data",
  system: "You are an asset management assistant.",
  grounding: {
    includeAssets: true,
    includeActions: true,
    businessName: "Acme Corp"
  }
});
```

## Memory Systems

The system documents 7 memory types:

1. **short-term** - Conversation-level memory (last 20 items)
2. **long-term** - Persistent RAG storage
3. **rag** - Retrieval Augmented Generation knowledge base
4. **vector** - Vector embeddings for semantic search
5. **sql** - Structured PostgreSQL storage
6. **redis** - Fast in-memory cache
7. **local** - Process-scoped memory

Each memory system includes:
- Description
- Capabilities
- Usage guidelines
- Retention policy
- Access patterns

## Asset Sources

10 documented data sources:

1. Asset Registry
2. Work Order System
3. Sustainability Metrics
4. Compliance Database
5. Financial Records
6. Knowledge Base
7. IoT Sensor Data
8. Vendor Database
9. Tenant Communications
10. Incident Reports

Each asset source includes:
- Type (database, API, file, etc.)
- Description
- Data types available
- Access method
- Capabilities

## Available Actions

11 documented actions:

1. `query_asset_registry` - Query asset inventory
2. `check_maintenance_schedule` - Find maintenance tasks
3. `get_sustainability_metrics` - Access ESG data
4. `check_compliance_status` - View permits/licenses
5. `get_work_orders` - Track maintenance requests
6. `create_work_order` - Create new work orders
7. `search_knowledge_base` - Search documentation
8. `analyze_financial_data` - Financial analysis
9. `get_iot_sensor_data` - Real-time sensor readings
10. `send_notification` - Send tenant notifications
11. `schedule_maintenance` - Schedule recurring maintenance

Each action includes:
- Category (query, create, update, etc.)
- Description
- Parameters
- Return values
- Examples

## Prompt Templates

5 prompt templates:

1. Asset Management System Prompt
2. Enhanced System Message
3. Agent Registry System Prompt
4. RAG Context Injection
5. Multi-Tenant Context

Each template includes:
- Type (system, user, agent)
- Description
- Template with variables
- Use cases

## API Reference

### Core Functions

#### `generateGroundedSystemPrompt(options?)`
Generates a system prompt with grounding context.

```typescript
const prompt = generateGroundedSystemPrompt({
  basePrompt: "You are a helpful assistant.",
  includeMemory: true,
  includeAssets: true,
  includeActions: true,
  businessName: "Acme Corp"
});
```

#### `generateGroundingContext(options?)`
Generates full grounding context object.

```typescript
const context = generateGroundingContext({
  includeMemory: true,
  includeAssets: true,
  includeActions: true,
  includePrompts: true
});
```

#### `getMemorySystem(type)`
Get information about a specific memory system.

```typescript
const ragInfo = getMemorySystem('rag');
```

#### `getAssetSource(name)`
Get information about a specific asset source.

```typescript
const assetInfo = getAssetSource('Asset Registry');
```

#### `getAction(name)`
Get information about a specific action.

```typescript
const actionInfo = getAction('query_asset_registry');
```

#### `getPromptTemplate(name)`
Get a specific prompt template.

```typescript
const template = getPromptTemplate('Asset Management System Prompt');
```

## Grounding Options

```typescript
interface GroundingOptions {
  basePrompt?: string;           // Base system prompt to enhance
  agentId?: string;              // Agent ID for agent-specific context
  businessName?: string;         // Business name for tenant context
  includeMemory?: boolean;       // Include memory systems (default: true)
  includeAssets?: boolean;       // Include asset sources (default: true)
  includeActions?: boolean;      // Include available actions (default: true)
  includePrompts?: boolean;      // Include prompt templates (default: true)
}
```

## Benefits

1. **Better Decision Making**: Models know what capabilities are available
2. **Accurate Responses**: Models can reference actual data sources
3. **Proper Tool Usage**: Models understand available actions
4. **Consistent Behavior**: Models follow established patterns
5. **Reduced Hallucination**: Models are grounded in real capabilities

## Integration Examples

### With User Context

```typescript
import { getUserContextPrompt } from '@scorpion/core/context';

const prompt = getUserContextPrompt({
  includeGrounding: true,
  grounding: {
    includeMemory: true,
    includeAssets: true,
    includeActions: true
  }
});
```

### With Agent Registry

```typescript
const response = await llm.chat(
  "Check system health",
  undefined,
  {
    agentId: "infra-scout",
    includeMemory: true,
    includeActions: true
  }
);
```

### Conditional Grounding

```typescript
function getGroundingForTask(task: string): GroundingOptions {
  let grounding: GroundingOptions = { includeMemory: true };
  
  if (task.includes('query') || task.includes('data')) {
    grounding.includeAssets = true;
  }
  
  if (task.includes('create') || task.includes('update')) {
    grounding.includeActions = true;
  }
  
  return grounding;
}
```

## Next Steps

1. **Use grounding in your LLM calls** - Add grounding options to improve model responses
2. **Customize for your use case** - Add your own memory systems, assets, or actions
3. **Integrate with agents** - Use agent-specific grounding for specialized assistants
4. **Monitor effectiveness** - Track how grounding improves response quality

## Files Modified

- `packages/scorpion-core/src/context/grounding.ts` - Created
- `packages/scorpion-core/src/context/examples.ts` - Created
- `packages/scorpion-core/src/context/README.md` - Created
- `packages/scorpion-core/src/context/index.ts` - Updated
- `packages/scorpion-core/src/llm/modelAdapter.ts` - Updated
- `packages/scorpion-core/src/context/userProfile.ts` - Updated

## Testing

See `packages/scorpion-core/src/context/examples.ts` for comprehensive usage examples.

All functions are fully typed and include error handling for optional dependencies.

