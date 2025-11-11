import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '../../utils/test-utils';
import { CommandBar } from '@/components/observability/CommandBar';
import userEvent from '@testing-library/user-event';
import { resetApiMocks, mockApiResponse, mockApiError } from '../../utils/api-mocks';

describe('CommandBar', () => {
  beforeEach(() => {
    resetApiMocks();
    window.alert = vi.fn();
  });

  it('opens and closes modal', async () => {
    const user = userEvent.setup();
    render(<CommandBar />);

    // Initially closed - should show button
    const openButton = screen.getByRole('button', { name: /commands/i });
    expect(openButton).toBeInTheDocument();
    expect(screen.queryByText('Command Center')).not.toBeInTheDocument();

    // Open modal
    await user.click(openButton);
    expect(screen.getByText('Command Center')).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByRole('button', { name: /✕/i });
    await user.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Command Center')).not.toBeInTheDocument();
    });
  });

  it('shows confirmation for dangerous actions', async () => {
    const user = userEvent.setup();
    render(<CommandBar />);

    // Open modal
    const openButton = screen.getByRole('button', { name: /commands/i });
    await user.click(openButton);

    // Click dangerous command (restart)
    const restartButton = screen.getByRole('button', { name: /restart worker/i });
    await user.click(restartButton);

    // Should show confirmation buttons
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('executes non-dangerous commands immediately', async () => {
    mockApiResponse('/api/telemetry/socket', { message: 'Command executed successfully' });

    const user = userEvent.setup();
    render(<CommandBar />);

    // Open modal
    const openButton = screen.getByRole('button', { name: /commands/i });
    await user.click(openButton);

    // Click non-dangerous command (replay)
    const replayButton = screen.getByRole('button', { name: /replay run/i });
    await user.click(replayButton);

    // Should execute immediately without confirmation
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Command executed successfully');
    });
  });

  it('executes command after confirmation', async () => {
    mockApiResponse('/api/telemetry/socket', { message: 'Worker restarted' });

    const user = userEvent.setup();
    render(<CommandBar />);

    // Open modal
    const openButton = screen.getByRole('button', { name: /commands/i });
    await user.click(openButton);

    // Click dangerous command
    const restartButton = screen.getByRole('button', { name: /restart worker/i });
    await user.click(restartButton);

    // Confirm
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Worker restarted');
    });
  });

  it('cancels confirmation', async () => {
    const user = userEvent.setup();
    render(<CommandBar />);

    // Open modal
    const openButton = screen.getByRole('button', { name: /commands/i });
    await user.click(openButton);

    // Click dangerous command
    const restartButton = screen.getByRole('button', { name: /restart worker/i });
    await user.click(restartButton);

    // Cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Should go back to normal state
    expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /restart worker/i })).toBeInTheDocument();
  });

  it('handles command execution errors', async () => {
    mockApiError('/api/telemetry/socket', 'Command failed', 500);

    const user = userEvent.setup();
    render(<CommandBar />);

    // Open modal
    const openButton = screen.getByRole('button', { name: /commands/i });
    await user.click(openButton);

    // Execute command
    const replayButton = screen.getByRole('button', { name: /replay run/i });
    await user.click(replayButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Command failed');
    });
  });

  it('disables buttons while executing', async () => {
    // Mock delayed response
    global.fetch = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ message: 'Success' }),
      }), 100))
    ) as any;

    const user = userEvent.setup();
    render(<CommandBar />);

    // Open modal
    const openButton = screen.getByRole('button', { name: /commands/i });
    await user.click(openButton);

    // Execute command
    const replayButton = screen.getByRole('button', { name: /replay run/i });
    await user.click(replayButton);

    // Buttons should be disabled during execution
    const buttons = screen.getAllByRole('button');
    const runButtons = buttons.filter(btn => btn.textContent === 'Run');
    runButtons.forEach(btn => {
      expect(btn).toBeDisabled();
    });
  });

  it('displays all commands', async () => {
    const user = userEvent.setup();
    render(<CommandBar />);

    // Open modal
    const openButton = screen.getByRole('button', { name: /commands/i });
    await user.click(openButton);

    // Check all commands are displayed
    expect(screen.getByText('Restart Worker')).toBeInTheDocument();
    expect(screen.getByText('Drain Queue')).toBeInTheDocument();
    expect(screen.getByText('Replay Run')).toBeInTheDocument();
  });
});

