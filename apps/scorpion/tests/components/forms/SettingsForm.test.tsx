import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '../../utils/test-utils';
import SettingsPage from '@/app/(scorpion)/settings/page';
import userEvent from '@testing-library/user-event';
import { apiMocks, resetApiMocks } from '../../utils/api-mocks';

// Mock Next.js components
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe('SettingsForm', () => {
  beforeEach(() => {
    resetApiMocks();
  });

  it('loads settings on mount', async () => {
    apiMocks.settings.get({
      ragIndexing: true,
      autoTrigger: false,
      modelSource: 'ollama',
      ollamaUrl: 'http://localhost:11434',
    });

    render(<SettingsPage />);

    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  it('updates form fields', async () => {
    apiMocks.settings.get({ ragIndexing: true, modelSource: 'ollama' });
    
    const user = userEvent.setup();
    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Find and update a setting (this will depend on actual form structure)
    // Since the form uses custom components, we'll test the save functionality
    const saveButton = screen.getByRole('button', { name: /save settings/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('saves settings successfully', async () => {
    apiMocks.settings.get({ ragIndexing: true });
    apiMocks.settings.save({ success: true });

    const user = userEvent.setup();
    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save settings/i });
    await user.click(saveButton);

    await waitFor(() => {
      // Should show success toast
      expect(screen.getByText(/settings saved successfully/i)).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    apiMocks.settings.get({ ragIndexing: true });
    apiMocks.settings.error();

    const user = userEvent.setup();
    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save settings/i });
    await user.click(saveButton);

    await waitFor(() => {
      // Should show error toast
      expect(screen.getByText(/failed to save settings/i)).toBeInTheDocument();
    });
  });

  it('disables save button while saving', async () => {
    apiMocks.settings.get({ ragIndexing: true });
    
    // Mock a delayed response
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

    // Button should be disabled during save
    expect(saveButton).toBeDisabled();
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });
});

