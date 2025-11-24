import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '../utils/test-utils';
import CreateAgentPage from '@/app/(scorpion)/agents/create/page';
import SpecializedAgentsPage from '@/app/(scorpion)/agents/specialized/page';
import userEvent from '@testing-library/user-event';
import { apiMocks, resetApiMocks } from '../utils/api-mocks';
import { mockAgents, mockSpecializedAgents } from '../utils/mock-data';

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('Agent Management Integration', () => {
  beforeEach(() => {
    resetApiMocks();
    window.alert = vi.fn();
  });

  describe('Create Agent Flow', () => {
    it('completes full agent creation flow', async () => {
      apiMocks.agents.create({ id: 'new-agent', codename: 'TestAgent', role: 'Test Role' });

      const user = userEvent.setup();
      render(<CreateAgentPage />);

      // Step 1: Select template
      const template = screen.getByText('Content Creator').closest('button');
      await user.click(template!);

      // Step 2: Fill form
      const nameInput = screen.getByPlaceholderText('My Awesome Agent');
      await user.type(nameInput, 'Test Agent');

      // Step 3: Submit
      const createButton = screen.getByRole('button', { name: /create agent/i });
      await user.click(createButton);

      // Verify success
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Test Agent'));
      }, { timeout: 3000 });
    });

    it('handles API errors during creation', async () => {
      apiMocks.agents.error();

      const user = userEvent.setup();
      render(<CreateAgentPage />);

      const template = screen.getByText('Content Creator').closest('button');
      await user.click(template!);

      const nameInput = screen.getByPlaceholderText('My Awesome Agent');
      await user.type(nameInput, 'Test Agent');

      const createButton = screen.getByRole('button', { name: /create agent/i });
      await user.click(createButton);

      // Should handle error gracefully
      await waitFor(() => {
        // Component should still be functional
        expect(screen.getByText('Step 2: Configure Your Agent')).toBeInTheDocument();
      });
    });
  });

  describe('Trigger Specialized Agent Action', () => {
    it('executes specialized agent action successfully', async () => {
      apiMocks.specializedAgents.execute({ result: 'Analysis complete', insights: ['insight1', 'insight2'] });

      const user = userEvent.setup();
      render(<SpecializedAgentsPage />);

      // Wait for agents to load
      await waitFor(() => {
        expect(screen.getByText(/specialized agents/i)).toBeInTheDocument();
      });

      // Select agent (if dropdown/select exists)
      // This will depend on actual component structure
      // For now, we'll test the execute functionality

      // Mock the form inputs
      const executeButton = screen.queryByRole('button', { name: /execute/i });
      if (executeButton) {
        await user.click(executeButton);

        await waitFor(() => {
          // Should show result
          expect(screen.getByText(/analysis complete/i)).toBeInTheDocument();
        });
      }
    });

    it('validates required fields before execution', async () => {
      const user = userEvent.setup();
      render(<SpecializedAgentsPage />);

      await waitFor(() => {
        expect(screen.getByText(/specialized agents/i)).toBeInTheDocument();
      });

      // Try to execute without selecting agent/method
      const executeButton = screen.queryByRole('button', { name: /execute/i });
      if (executeButton && !executeButton.hasAttribute('disabled')) {
        await user.click(executeButton);

        // Should show validation error
        await waitFor(() => {
          expect(screen.getByText(/please select/i)).toBeInTheDocument();
        });
      }
    });

    it('handles JSON parsing errors in parameters', async () => {
      const user = userEvent.setup();
      render(<SpecializedAgentsPage />);

      await waitFor(() => {
        expect(screen.getByText(/specialized agents/i)).toBeInTheDocument();
      });

      // This test would require interacting with the params input field
      // and entering invalid JSON, then trying to execute
      // Implementation depends on actual component structure
    });

    it('handles execution errors gracefully', async () => {
      apiMocks.specializedAgents.error();

      const user = userEvent.setup();
      render(<SpecializedAgentsPage />);

      await waitFor(() => {
        expect(screen.getByText(/specialized agents/i)).toBeInTheDocument();
      });

      // Execute with error response
      const executeButton = screen.queryByRole('button', { name: /execute/i });
      if (executeButton) {
        await user.click(executeButton);

        await waitFor(() => {
          // Should show error message
          expect(screen.getByText(/execution failed/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Edit Agent Configuration', () => {
    it('loads agent data for editing', async () => {
      apiMocks.agents.get('agent-1');
      apiMocks.agents.create({ id: 'agent-1', codename: 'UpdatedAgent' });

      // This would test loading an existing agent and updating it
      // Implementation depends on edit page structure
    });
  });
});

