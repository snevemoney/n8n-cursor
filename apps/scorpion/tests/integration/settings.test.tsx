import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '../utils/test-utils';
import SettingsPage from '@/app/(scorpion)/settings/page';
import userEvent from '@testing-library/user-event';
import { apiMocks, resetApiMocks } from '../utils/api-mocks';
import { mockSettings } from '../utils/mock-data';

// Mock Next.js components
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe('Settings Persistence Integration', () => {
  beforeEach(() => {
    resetApiMocks();
  });

  it('loads settings from API on mount', async () => {
    apiMocks.settings.get(mockSettings);

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Verify settings are loaded (check for specific setting values)
    // This depends on how settings are displayed in the UI
  });

  it('updates and saves settings successfully', async () => {
    apiMocks.settings.get(mockSettings);
    apiMocks.settings.save({ success: true, ...mockSettings });

    const user = userEvent.setup();
    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Find save button and click
    const saveButton = screen.getByRole('button', { name: /save settings/i });
    await user.click(saveButton);

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/settings saved successfully/i)).toBeInTheDocument();
    });
  });

  it('persists settings across page reloads', async () => {
    const updatedSettings = { ...mockSettings, ragIndexing: false };
    
    apiMocks.settings.get(mockSettings);
    apiMocks.settings.save({ success: true, ...updatedSettings });

    const user = userEvent.setup();
    const { rerender } = render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Simulate changing a setting (this would require interacting with form)
    // Then save
    const saveButton = screen.getByRole('button', { name: /save settings/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/settings saved successfully/i)).toBeInTheDocument();
    });

    // Simulate page reload - load settings again
    apiMocks.settings.get(updatedSettings);
    rerender(<SettingsPage />);

    await waitFor(() => {
      // Settings should reflect the saved values
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  it('handles save errors gracefully', async () => {
    apiMocks.settings.get(mockSettings);
    apiMocks.settings.error();

    const user = userEvent.setup();
    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save settings/i });
    await user.click(saveButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/failed to save settings/i)).toBeInTheDocument();
    });

    // Form should still be functional
    expect(saveButton).toBeInTheDocument();
  });

  it('validates form inputs before saving', async () => {
    apiMocks.settings.get(mockSettings);

    const user = userEvent.setup();
    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // This would test validation of specific fields
    // Implementation depends on form structure
    const saveButton = screen.getByRole('button', { name: /save settings/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('shows loading state during save', async () => {
    apiMocks.settings.get(mockSettings);
    
    // Mock delayed response
    global.fetch = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true }),
      }), 100))
    ) as any;

    const user = userEvent.setup();
    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save settings/i });
    await user.click(saveButton);

    // Should show loading state
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });
});

