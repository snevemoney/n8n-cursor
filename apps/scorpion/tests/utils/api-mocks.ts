import { vi } from 'vitest';

/**
 * Mock API responses for tests
 */

export const mockFetch = vi.fn();

// Helper to setup fetch mock with response
export function mockApiResponse(url: string, response: any, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response),
    headers: new Headers(),
  });
}

// Helper to setup fetch mock with error
export function mockApiError(url: string, error: string, status = 500) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ error, message: error }),
    text: async () => JSON.stringify({ error, message: error }),
  });
}

// Reset mock before each test
export function resetApiMocks() {
  mockFetch.mockClear();
}

// Setup global fetch mock
global.fetch = mockFetch as any;

// Pre-configured API mocks
export const apiMocks = {
  agents: {
    list: () => mockApiResponse('/api/agents', { agents: [] }),
    create: (agent: any) => mockApiResponse('/api/agents', { success: true, agent }, 201),
    get: (id: string) => mockApiResponse(`/api/agents/${id}`, { agent: { id } }),
    error: () => mockApiError('/api/agents', 'Failed to fetch agents', 500),
  },
  settings: {
    get: (settings: any) => mockApiResponse('/api/settings', settings, 200),
    save: (result: any) => mockApiResponse('/api/settings', result || { success: true }, 200),
    error: () => mockApiError('/api/settings', 'Failed to save settings', 500),
  },
  workflows: {
    list: (workflows: any[]) => mockApiResponse('/api/workflows', { workflows }),
    trigger: (workflowId: string) => mockApiResponse(`/api/workflows/${workflowId}/trigger`, { success: true, runId: 'run-123' }),
    error: () => mockApiError('/api/workflows', 'Failed to fetch workflows', 500),
  },
  specializedAgents: {
    execute: (result: any) => mockApiResponse('/api/agents/specialized', { success: true, data: result }),
    error: () => mockApiError('/api/agents/specialized', 'Execution failed', 500),
  },
};

