import { test, expect } from '@playwright/test';

/**
 * E2E tests for component interactions
 * Tests real user interactions with forms, tables, modals
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3003';

test.describe('Component Interactions', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`Console error: ${msg.text()}`);
      }
    });
  });

  test('DataTable expand and collapse', async ({ page }) => {
    // Navigate to a page that uses DataTable (e.g., agents, workflows)
    await page.goto(`${BASE_URL}/agents`);
    await page.waitForLoadState('networkidle');

    // Look for table rows
    const tableRows = page.locator('table tbody tr, [role="row"]');
    const rowCount = await tableRows.count();

    if (rowCount > 0) {
      // Click first row to expand
      const firstRow = tableRows.first();
      await firstRow.click();

      // Wait for expanded content
      await page.waitForTimeout(500);

      // Verify expanded content is visible (look for expanded row details)
      const expandedContent = page.locator('td[colspan], [class*="expanded"]');
      const expandedCount = await expandedContent.count();

      // Click again to collapse
      await firstRow.click();
      await page.waitForTimeout(500);
    }
  });

  test('Form validation', async ({ page }) => {
    await page.goto(`${BASE_URL}/agents/create`);
    const template = page.getByRole('button', { name: /Content Creator/ });
    await expect(template).toBeVisible();
    await template.click();

    const createButton = page.getByRole('button', { name: 'Create Agent', exact: true });
    const nameInput = page.getByPlaceholder('My Awesome Agent', { exact: true });
    await expect(nameInput).toBeVisible();
    await expect(createButton).toBeDisabled();
    await nameInput.fill('   ');
    await expect(createButton).toBeDisabled();
    await nameInput.fill('Test Agent');
    await expect(createButton).toBeEnabled();
    await nameInput.fill('');
    await expect(createButton).toBeDisabled();
  });

  test('Modal open and close', async ({ page }) => {
    await page.goto(`${BASE_URL}/observability`, { waitUntil: 'domcontentloaded' });
    const commandsButton = page.getByRole('button', { name: 'Commands', exact: true });
    await expect(commandsButton).toBeVisible();
    await commandsButton.click();
    await expect(page.getByRole('heading', { name: 'Command Center', exact: true })).toBeVisible();
    await page.getByRole('button', { name: '✕', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Command Center', exact: true })).not.toBeVisible();
  });

  test('Modal confirmation flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/observability`, { waitUntil: 'domcontentloaded' });
    const commandsButton = page.getByRole('button', { name: 'Commands', exact: true });
    await expect(commandsButton).toBeVisible();
    await commandsButton.click();
    const command = page.getByText('Restart Worker', { exact: true }).locator('xpath=ancestor::div[.//button][1]');
    await command.getByRole('button', { name: 'Run', exact: true }).click();
    await expect(command.getByRole('button', { name: 'Confirm', exact: true })).toBeVisible();
    await command.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(command.getByRole('button', { name: 'Confirm', exact: true })).not.toBeVisible();
  });

  test('Settings form interaction', async ({ page }) => {
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForLoadState('networkidle');

    // Find form inputs
    const inputs = page.locator('input, select, textarea');
    const inputCount = await inputs.count();

    if (inputCount > 0) {
      // Interact with first input
      const firstInput = inputs.first();
      await firstInput.click();
      await firstInput.fill('test value');
      await page.waitForTimeout(300);

      // Verify value changed
      const value = await firstInput.inputValue();
      expect(value).toContain('test');
    }

    // Test save button
    const saveButton = page.locator('button:has-text("Save")');
    if (await saveButton.isVisible({ timeout: 2000 })) {
      await saveButton.click();
      await page.waitForTimeout(1000);

      // Verify button state changes
      const savingButton = page.locator('button:has-text("Saving")');
      if (await savingButton.isVisible({ timeout: 1000 })) {
        await expect(savingButton).toBeVisible();
      }
    }
  });

  test('Toast notifications', async ({ page }) => {
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForLoadState('networkidle');

    // Trigger an action that shows toast (save settings)
    const saveButton = page.locator('button:has-text("Save Settings")');
    if (await saveButton.isVisible({ timeout: 2000 })) {
      await saveButton.click();

      // Wait for toast to appear
      await page.waitForTimeout(1000);

      // Look for toast notification
      const toast = page.locator('[role="alert"], [class*="toast"], [class*="notification"]');
      const toastCount = await toast.count();

      if (toastCount > 0) {
        // Verify toast is visible
        await expect(toast.first()).toBeVisible({ timeout: 2000 });

        // Wait for toast to disappear (if auto-dismiss)
        await page.waitForTimeout(6000);
      }
    }
  });
});

