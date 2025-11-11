# LLM Grounding System

The grounding system provides comprehensive context to LLM models about available memory systems, assets, actions, and prompts. This ensures models have proper "grounding" in the system's capabilities and can make informed decisions.

## Overview

The grounding system includes:

1. **Memory Systems** - Short-term, long-term, RAG, vector, SQL, Redis, and local memory
2. **Assets** - Data sources like Asset Registry, Work Orders, Sustainability Metrics, etc.
3. **Actions** - Available operations like query_asset_registry, create_work_order, etc.
4. **Agents** - C-Suite AI agents with roles, capabilities, tools, and memory configurations
5. **Prompts** - System message templates and prompt patterns

## Usage

### Basic Usage with LLM Adapter

```typescript
import { LLMAdapter } from '@scorpion/core/llm';
import { GroundingOptions } from '@scorpion/core/context';

const llm = new LLMAdapter();

// Use grounding in chat
const response = await llm.chat(
  "What maintenance is due this month?",
  "You are a helpful assistant.",
  {
    includeMemory: true,
    includeAssets: true,
    includeActions: true,
    includeAgents: true,
    businessName: "Acme Corp"
  }
);
```

### Using with runModel

```typescript
import { runModel } from '@scorpion/core/llm';

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

### Generate Grounded System Prompt

```typescript
import { generateGroundedSystemPrompt } from '@scorpion/core/context';

const systemPrompt = generateGroundedSystemPrompt({
  basePrompt: "You are a helpful assistant.",
  includeMemory: true,
  includeAssets: true,
  includeActions: true,
  includePrompts: true,
  agentId: "infra-scout",
  businessName: "Acme Corp"
});
```

### Get Specific Information

```typescript
import { 
  getMemorySystem, 
  getAssetSource, 
  getAction, 
  getPromptTemplate 
} from '@scorpion/core/context';

// Get memory system info
const memoryInfo = getMemorySystem('rag');
console.log(memoryInfo?.description);

// Get asset source info
const assetInfo = getAssetSource('Asset Registry');
console.log(assetInfo?.capabilities);

// Get action info
const actionInfo = getAction('query_asset_registry');
console.log(actionInfo?.parameters);

// Get prompt template
const template = getPromptTemplate('Asset Management System Prompt');
console.log(template?.useCases);

// Get agent information
const agentInfo = getAgentInfo('infra-scout');
console.log(agentInfo?.capabilities);

// Get agents by role
const ctoAgents = getAgentsByRole('CTO');
console.log(ctoAgents.map(a => a.name));
```

### Full Grounding Context

```typescript
import { generateGroundingContext } from '@scorpion/core/context';

const context = generateGroundingContext({
  includeMemory: true,
  includeAssets: true,
  includeActions: true,
  includePrompts: true,
  agentId: "infra-scout",
  businessName: "Acme Corp"
});

console.log(context.memory.systems);
console.log(context.assets.sources);
console.log(context.actions.available);
console.log(context.agents.available);
console.log(context.prompts.templates);
```

## Grounding Options

```typescript
interface GroundingOptions {
  basePrompt?: string;           // Base system prompt to enhance
  agentId?: string;              // Agent ID for agent-specific context
  businessName?: string;         // Business name for tenant context
  includeMemory?: boolean;       // Include memory systems (default: true)
  includeAssets?: boolean;        // Include asset sources (default: true)
  includeActions?: boolean;      // Include available actions (default: true)
  includeAgents?: boolean;       // Include available agents (default: true)
  includePrompts?: boolean;      // Include prompt templates (default: true)
}
```

## Memory Systems

Available memory types:

- **short-term**: Conversation-level memory (last 20 items)
- **long-term**: Persistent RAG storage
- **rag**: Retrieval Augmented Generation knowledge base
- **vector**: Vector embeddings for semantic search
- **sql**: Structured PostgreSQL storage
- **redis**: Fast in-memory cache
- **local**: Process-scoped memory

## Asset Sources

Available data sources:

- Asset Registry
- Work Order System
- Sustainability Metrics
- Compliance Database
- Financial Records
- Knowledge Base
- IoT Sensor Data
- Vendor Database
- Tenant Communications
- Incident Reports

## Available Actions

Key actions include:

- `query_asset_registry` - Query asset inventory
- `check_maintenance_schedule` - Find maintenance tasks
- `get_sustainability_metrics` - Access ESG data
- `check_compliance_status` - View permits/licenses
- `get_work_orders` - Track maintenance requests
- `create_work_order` - Create new work orders
- `search_knowledge_base` - Search documentation
- `analyze_financial_data` - Financial analysis
- `get_iot_sensor_data` - Real-time sensor readings
- `send_notification` - Send tenant notifications
- `schedule_maintenance` - Schedule recurring maintenance

## Available Agents

16 C-Suite AI agents organized by role:

**CTO (Chief Technology Officer):**
- `infra-scout` - Infrastructure health monitoring
- `runtime-guardian` - Runtime stability and recovery

**CPO (Chief Product Officer):**
- `flow-mapper` - User flow optimization
- `agent-trainer` - AI agent training and optimization

**CRO (Chief Reality Officer):**
- `reality-checker` - System claim verification
- `plan-aligner` - Roadmap and execution alignment

**CMO (Chief Marketing Officer):**
- `campaign-seeder` - Marketing campaign generation
- `market-sniper` - Market opportunity identification

**CFO (Chief Financial Officer):**
- `forecast-engine` - Financial forecasting
- `fee-auditor` - Lightning Network fee optimization

**CNO (Chief Node Officer):**
- `node-health-bot` - Lightning node monitoring
- `channel-logic` - Channel management optimization

**CCO (Chief Compliance Officer):**
- `rls-enforcer` - Row Level Security enforcement
- `audit-trail-bot` - Audit trail maintenance

**CIO (Chief Intelligence Officer):**
- `rag-debugger` - RAG system optimization
- `learning-vector` - AI learning and knowledge optimization

Each agent includes:
- Role and description
- Capabilities
- Available tools
- Memory configuration
- Schedule and triggers
- Use cases

## Integration with User Context

```typescript
import { getUserContextPrompt } from '@scorpion/core/context';

// Get user context with grounding
const prompt = getUserContextPrompt({
  includeGrounding: true,
  grounding: {
    includeMemory: true,
    includeAssets: true,
    includeActions: true
  }
});
```

## Benefits

1. **Better Decision Making**: Models know what capabilities are available
2. **Accurate Responses**: Models can reference actual data sources
3. **Proper Tool Usage**: Models understand available actions
4. **Consistent Behavior**: Models follow established patterns
5. **Reduced Hallucination**: Models are grounded in real capabilities

## Examples

### Asset Management Assistant

```typescript
const response = await llm.chat(
  "What maintenance is due this month?",
  undefined,
  {
    includeAssets: true,
    includeActions: true,
    businessName: "Acme Corp"
  }
);
```

### RAG-Enhanced Query

```typescript
const response = await llm.chat(
  "Find the HVAC troubleshooting guide",
  undefined,
  {
    includeMemory: true,
    includeAssets: true,
    businessName: "Acme Corp"
  }
);
```

### Agent-Specific Context

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

