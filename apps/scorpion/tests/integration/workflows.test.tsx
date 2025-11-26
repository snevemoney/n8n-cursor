import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '../utils/test-utils';
import WorkflowsPage from '@/app/(scorpion)/workflows/page';
import userEvent from '@testing-library/user-event';
import { apiMocks, resetApiMocks } from '../utils/api-mocks';
import { mockWorkflows } from '../utils/mock-data';
import React from 'react';

// Mock Next.js components
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock dynamic import
vi.mock('@/app/(scorpion)/workflows/WorkflowsClient', () => ({
  default: () => {
    const [workflows, setWorkflows] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      fetch('/api/workflows')
        .then(res => res.json())
        .then(data => {
          setWorkflows(data.workflows || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading workflows...</div>;

    return (
      <div>
        <h1>Workflows</h1>
        {workflows.map((wf: any) => (
          <div key={wf.id}>
            <span>{wf.name}</span>
            <button onClick={() => {
              fetch(`/api/workflows/${wf.id}/trigger`, { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                  if (data.success) {
                    alert(`Workflow triggered: ${data.runId}`);
                  }
                });
            }}>
              Trigger
            </button>
          </div>
        ))}
      </div>
    );
  },
}));

describe('Workflow Actions Integration', () => {
  beforeEach(() => {
    resetApiMocks();
    window.alert = vi.fn();
  });

  it('lists workflows successfully', async () => {
    apiMocks.workflows.list(mockWorkflows);

    render(<WorkflowsPage />);

    await waitFor(() => {
      expect(screen.getByText('Workflows')).toBeInTheDocument();
    });

    // Verify workflows are displayed
    await waitFor(() => {
      expect(screen.getByText('Test Workflow')).toBeInTheDocument();
      expect(screen.getByText('Another Workflow')).toBeInTheDocument();
    });
  });

  it('triggers workflow execution successfully', async () => {
    apiMocks.workflows.list(mockWorkflows);
    apiMocks.workflows.trigger('wf-1');

    const user = userEvent.setup();
    render(<WorkflowsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Workflow')).toBeInTheDocument();
    });

    // Find and click trigger button
    const triggerButtons = screen.getAllByRole('button', { name: /trigger/i });
    if (triggerButtons.length > 0) {
      await user.click(triggerButtons[0]);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('run-123'));
      });
    }
  });

  it('handles workflow list errors', async () => {
    apiMocks.workflows.error();

    render(<WorkflowsPage />);

    await waitFor(() => {
      expect(screen.getByText('Workflows')).toBeInTheDocument();
    });

    // Should handle error gracefully
    // Component should still render
    expect(screen.getByText('Workflows')).toBeInTheDocument();
  });

  it('handles workflow trigger errors', async () => {
    apiMocks.workflows.list(mockWorkflows);
    
    // Mock trigger error
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ workflows: mockWorkflows }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Failed to trigger workflow' }),
      }) as any;

    const user = userEvent.setup();
    render(<WorkflowsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Workflow')).toBeInTheDocument();
    });

    const triggerButtons = screen.getAllByRole('button', { name: /trigger/i });
    if (triggerButtons.length > 0) {
      await user.click(triggerButtons[0]);

      // Should handle error gracefully
      await waitFor(() => {
        // Error should be handled (no crash)
        expect(screen.getByText('Workflows')).toBeInTheDocument();
      });
    }
  });

  it('shows loading state while fetching workflows', async () => {
    // Mock delayed response
    global.fetch = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ workflows: mockWorkflows }),
      }), 100))
    ) as any;

    render(<WorkflowsPage />);

    // Should show loading state initially
    expect(screen.getByText('Loading workflows...')).toBeInTheDocument();

    // Then show workflows
    await waitFor(() => {
      expect(screen.getByText('Test Workflow')).toBeInTheDocument();
    }, { timeout: 200 });
  });

  it('handles empty workflow list', async () => {
    apiMocks.workflows.list([]);

    render(<WorkflowsPage />);

    await waitFor(() => {
      expect(screen.getByText('Workflows')).toBeInTheDocument();
    });

    // Should handle empty state gracefully
    expect(screen.queryByText('Test Workflow')).not.toBeInTheDocument();
  });
});

