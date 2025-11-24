# Cost Tracking System

Financial governance and cost management for Scorpion ecosystem.

## Overview

Implements Cloud Digital Leader cost management principles:
- **Resource hierarchy** - Organization → Product → Environment → Service
- **Budget monitoring** - Track spend vs budgets, alert on thresholds
- **Quota enforcement** - Hard limits on resources
- **Cost analytics** - Understand where money is going

## Database Setup

Run the schema SQL to create cost tracking tables:

```bash
psql your_database < lib/cost/schema.sql
```

Or manually execute the SQL in your Postgres client.

## Quick Start

### Register a Resource

```typescript
import { getCostTracker } from '@/lib/cost/tracker';

const tracker = getCostTracker();

await tracker.registerResource({
  product: 'agentpilot',
  environment: 'prod',
  service: 'n8n',
  resourceType: 'container',
  resourceId: 'n8n-prod-001',
  resourceName: 'n8n Production',
  provider: 'kvm2',
  estimatedMonthlyCost: 25.00,
  tags: {
    team: 'platform',
    critical: 'yes',
  },
});
```

### Set a Budget

```typescript
await tracker.setBudget({
  product: 'agentpilot',
  environment: 'prod',
  budgetName: 'AgentPilot Production',
  monthlyBudget: 100.00,
  warningThreshold: 80, // Alert at 80%
  alertThreshold: 100, // Critical at 100%
});
```

### Record Usage

```typescript
await tracker.recordUsage('resource-id', {
  computeHours: 24,
  apiCalls: 1000,
  llmTokens: 50000,
  cost: 15.50,
  periodStart: new Date('2025-01-01'),
  periodEnd: new Date('2025-01-02'),
  periodType: 'daily',
});
```

### Check Budgets

```typescript
const budgets = await tracker.getBudgetStatus();
budgets.forEach(budget => {
  if (budget.status === 'warning') {
    console.warn(`Budget ${budget.budgetName} is at ${budget.percentageUsed}%`);
  }
});
```

## API Endpoints

- `GET /api/cost/summary` - Get current month cost summary
- `GET /api/cost/budgets` - Get budget status
- `POST /api/cost/budgets` - Create/update budget

## UI Component

Use the `CostDashboard` component in your Observatory:

```tsx
import { CostDashboard } from '@/components/scorpion/CostDashboard';

<CostDashboard />
```

## Resource Hierarchy

```
scorpion-systems (organization)
├─ agentpilot (product)
│  ├─ prod (environment)
│  │  ├─ n8n (service)
│  │  ├─ api (service)
│  │  └─ db (service)
│  └─ dev (environment)
│     └─ n8n-dev (service)
├─ bitbrain (product)
│  └─ prod
│     └─ analytics-api
└─ scorpion-core (product)
   └─ prod
      ├─ web-ui
      └─ chat-api
```

## Next Steps

1. Run database migrations
2. Register existing resources
3. Set initial budgets
4. Add CostDashboard to Observatory page
5. Wire up usage tracking from actual services

