import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '../../utils/test-utils';
import CreateAgentPage from '@/app/(scorpion)/agents/create/page';
import userEvent from '@testing-library/user-event';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('AgentCreationForm', () => {
  beforeEach(() => {
    // Mock window.alert
    window.alert = vi.fn();
  });

  it('renders template selection step', () => {
    render(<CreateAgentPage />);

    expect(screen.getByText('Create New Agent')).toBeInTheDocument();
    expect(screen.getByText('Step 1: Choose a Template')).toBeInTheDocument();
    expect(screen.getByText('Content Creator')).toBeInTheDocument();
    expect(screen.getByText('Research Assistant')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<CreateAgentPage />);

    // Select a template
    const contentTemplate = screen.getByText('Content Creator').closest('button');
    await user.click(contentTemplate!);

    // Try to submit without agent name
    const createButton = screen.getByRole('button', { name: /create agent/i });
    expect(createButton).toBeDisabled();
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup();
    render(<CreateAgentPage />);

    // Select template
    const contentTemplate = screen.getByText('Content Creator').closest('button');
    await user.click(contentTemplate!);

    // Fill agent name
    const nameInput = screen.getByPlaceholderText('My Awesome Agent');
    await user.type(nameInput, 'Test Agent');

    // Submit form
    const createButton = screen.getByRole('button', { name: /create agent/i });
    expect(createButton).not.toBeDisabled();
    
    await user.click(createButton);

    // Wait for alert (simulated API call)
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Test Agent'));
    }, { timeout: 3000 });
  });

  it('handles template selection and navigation', async () => {
    const user = userEvent.setup();
    render(<CreateAgentPage />);

    // Select template
    const researchTemplate = screen.getByText('Research Assistant').closest('button');
    await user.click(researchTemplate!);

    // Should show configuration step
    expect(screen.getByText('Step 2: Configure Your Agent')).toBeInTheDocument();
    expect(screen.getByText('Research Assistant')).toBeInTheDocument();

    // Go back to templates
    const backButton = screen.getByRole('button', { name: /back to templates/i });
    await user.click(backButton);

    // Should show template selection again
    expect(screen.getByText('Step 1: Choose a Template')).toBeInTheDocument();
  });

  it('handles cancel action', async () => {
    const user = userEvent.setup();
    render(<CreateAgentPage />);

    // Select template and fill name
    const template = screen.getByText('Content Creator').closest('button');
    await user.click(template!);

    const nameInput = screen.getByPlaceholderText('My Awesome Agent');
    await user.type(nameInput, 'Test Agent');

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Should reset to template selection
    expect(screen.getByText('Step 1: Choose a Template')).toBeInTheDocument();
  });

  it('shows loading state during creation', async () => {
    const user = userEvent.setup();
    render(<CreateAgentPage />);

    // Select template and fill name
    const template = screen.getByText('Content Creator').closest('button');
    await user.click(template!);

    const nameInput = screen.getByPlaceholderText('My Awesome Agent');
    await user.type(nameInput, 'Test Agent');

    // Submit
    const createButton = screen.getByRole('button', { name: /create agent/i });
    await user.click(createButton);

    // Should show loading state
    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(createButton).toBeDisabled();
  });
});

