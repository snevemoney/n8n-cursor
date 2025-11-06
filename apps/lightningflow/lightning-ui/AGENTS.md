# AI Agents Overview

This project uses a set of lightweight agents to encapsulate common tasks in the Lightning Network dashboard. Each agent exposes a minimal API that is consumed through React hooks or utility functions.

## AI Assistant Agent

**Purpose**: Provide conversational AI features.

- **Hook**: `useAiAssistant` found in `src/hooks/useAiAssistant.ts`.
- **API**: Expects a POST to `/api/ai-assistant` that returns `{ result: string }`. The API route is currently a placeholder and should be implemented separately.
- **UI**: `src/app/ai-assistant/page.tsx` renders a form that sends user prompts to the agent.

### Key Functions
- `sendRequest(payload: AiRequest)` – sends the prompt to the API and stores the result.

### Example
```tsx
const { sendRequest, loading, error, data } = useAiAssistant();
await sendRequest({ prompt: "Hello" });
```

## Dashboard Data Agent

**Purpose**: Fetch Lightning node information for the dashboard.

- **Function**: `fetchDashboardData` in `src/lib/dashboard.ts`.
- **API**: GET `/api/dashboard` returns a `DashboardData` object.
- **Hook integration**: components call `fetchDashboardData` directly or inside custom hooks.

### Key Functions
- `fetchDashboardData()` – retrieves balance, transactions and status for the dashboard view.

### Example
```ts
const data = await fetchDashboardData();
```

## Lightning Payment Agent (Planned)

A future agent will handle sending and receiving Lightning payments.

- The agent would expose hooks such as `useLightningPayment`.
- API routes will interact with a Lightning node (e.g., LND or Core Lightning).
- UI components will show invoices and payment status.

## Extending or Adding Agents

1. **Create a hook or utility** in `src/hooks` or `src/lib` to encapsulate the agent logic.
2. **Add API routes** under `src/app/api` to interface with your backend or Lightning node.
3. **Consume the hook** in your UI components located in `src/app` or `src/components`.
4. **Write tests** under `src/**/__tests__` or alongside hooks using Vitest.
5. Ensure TypeScript `strict` mode compatibility.

## Example Skeleton for a New Agent
```ts
// src/hooks/useMyAgent.ts
import { useState } from 'react';

export function useMyAgent() {
  const [loading, setLoading] = useState(false);
  // ...additional state
  async function act() {
    setLoading(true);
    try {
      const res = await fetch('/api/my-agent');
      // handle result
    } finally {
      setLoading(false);
    }
  }
  return { loading, act };
}
``` 