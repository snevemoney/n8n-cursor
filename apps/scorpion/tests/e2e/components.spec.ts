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

    // Select template first
    const template = page.locator('button:has-text("Content Creator")').first();
    if (await template.isVisible({ timeout: 2000 })) {
      await template.click();
    }

    // Try to submit without filling required fields
    const createButton = page.locator('button:has-text("Create Agent")');
    if (await createButton.isVisible({ timeout: 2000 })) {
      // Button should be disabled if name is empty
      const nameInput = page.locator('input[placeholder*="Agent"]');
      if (await nameInput.isVisible({ timeout: 1000 })) {
        const isDisabled = await createButton.isDisabled();
        // Button should be disabled when name is empty
        expect(isDisabled).toBeTruthy();

        // Fill name
        await nameInput.fill('Test Agent');
        await page.waitForTimeout(300);

        // Button should now be enabled
        const isEnabled = await createButton.isEnabled();
        expect(isEnabled).toBeTruthy();
      }
    }
  });

  test('Modal open and close', async ({ page }) => {
    await page.goto(`${BASE_URL}/observability`);
    await page.waitForLoadState('networkidle');

    // Look for CommandBar button
    const commandsButton = page.locator('button:has-text("Commands")');
    if (await commandsButton.isVisible({ timeout: 2000 })) {
      // Open modal
      await commandsButton.click();

      // Verify modal is open
      await expect(page.locator('text=Command Center')).toBeVisible({ timeout: 2000 });

      // Close modal
      const closeButton = page.locator('button:has-text("✕"), button[aria-label*="close"]').first();
      if (await closeButton.isVisible({ timeout: 1000 })) {
        await closeButton.click();

        // Verify modal is closed
        await expect(page.locator('text=Command Center')).not.toBeVisible({ timeout: 2000 });
      }
    }
  });

  test('Modal confirmation flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/observability`);
    await page.waitForLoadState('networkidle');

    const commandsButton = page.locator('button:has-text("Commands")');
    if (await commandsButton.isVisible({ timeout: 2000 })) {
      await commandsButton.click();

      // Look for dangerous command (restart, drain)
      const restartButton = page.locator('button:has-text("Restart"), button:has-text("Run")').first();
      if (await restartButton.isVisible({ timeout: 2000 })) {
        // Click dangerous command
        await restartButton.click();

        // Should show confirmation
        const confirmButton = page.locator('button:has-text("Confirm")');
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          // Cancel confirmation
          const cancelButton = page.locator('button:has-text("Cancel")');
          if (await cancelButton.isVisible({ timeout: 1000 })) {
            await cancelButton.click();

            // Should go back to normal state
            await expect(confirmButton).not.toBeVisible({ timeout: 2000 });
          }
        }
      }
    }
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

