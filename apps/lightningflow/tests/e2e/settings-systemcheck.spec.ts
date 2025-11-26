import { test, expect } from '../utils/test-setup';

test.describe('Settings and System Check Flows', () => {
  test('Advanced Mode Toggle flow', async ({ authenticatedPage: page }) => {
    // 1. UI Render
    await page.goto('/settings');
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
    
    // 2. Button Function - Toggle advanced mode off if on
    const advancedModeSwitch = page.locator('[data-testid="advanced-mode-toggle"]');
    const isChecked = await advancedModeSwitch.isChecked();
    
    if (isChecked) {
      await advancedModeSwitch.click();
      // Wait for localStorage to update
      await page.waitForFunction(() => {
        return !JSON.parse(localStorage.getItem('userSettings') || '{}').advancedMode;
      });
    }
    
    // 3. Verify Console is not accessible
    await page.goto('/console');
    await expect(page.locator('text=Advanced Mode Required')).toBeVisible();
    
    // 4. Go back and toggle advanced mode on
    await page.goto('/settings');
    await advancedModeSwitch.click();
    
    // 5. Verify localStorage updated
    await page.waitForFunction(() => {
      return JSON.parse(localStorage.getItem('userSettings') || '{}').advancedMode;
    });
    
    // 6. Verify Console is now accessible
    await page.goto('/console');
    await expect(page.locator('h1:has-text("Console")')).toBeVisible();
  });

  test('System Check flow', async ({ authenticatedPage: page }) => {
    // 1. UI Render
    await page.goto('/settings/system-health');
    await expect(page.locator('h1:has-text("System Health")')).toBeVisible();
    
    // 2. Button Function - Run system check
    await page.click('button:has-text("Run System Check")');
    
    // 3. API Success - Verify API call
    const response = await page.waitForResponse(resp => 
      resp.url().includes('/api/system-check') && resp.status() === 200
    );
    const checkResults = await response.json();
    
    // 4. Verify results display
    await expect(page.locator('.system-check-results')).toBeVisible();
    
    // 5. Verify status badges for each flow
    for (const key of Object.keys(checkResults.results)) {
      await expect(page.locator(`[data-check-name="${key}"]`)).toBeVisible();
    }
    
    // 6. Verify history tab shows the new result
    await page.click('button:has-text("History")');
    
    // The newest result should be at the top of the list
    const timestamp = new Date(checkResults.timestamp).toLocaleString();
    await expect(page.locator(`.system-check-history-item:first-child:has-text("${timestamp}")`)).toBeVisible();
  });

  test('Node Status Badge flow', async ({ authenticatedPage: page }) => {
    // 1. UI Render - Check topbar on any page
    await page.goto('/dashboard');
    
    // 2. Verify status badge
    const statusBadge = page.locator('.node-status-badge');
    await expect(statusBadge).toBeVisible();
    
    // 3. API Success - Verify API call
    const response = await page.waitForResponse(resp => 
      resp.url().includes('/api/node/status') && resp.status() === 200
    );
    const statusData = await response.json();
    
    // 4. Verify badge color matches status
    if (statusData.online) {
      await expect(statusBadge).toHaveClass(/bg-green/);
    } else {
      await expect(statusBadge).toHaveClass(/bg-red/);
    }
    
    // 5. Click badge to see details
    await statusBadge.click();
    await expect(page.locator('.node-status-modal')).toBeVisible();
    
    // 6. Verify modal shows detailed status information
    await expect(page.locator('.node-status-modal:has-text("Node Status")')).toBeVisible();
    
    // Should contain balance information
    await expect(page.locator('.node-status-modal:has-text("Balance")')).toBeVisible();
    
    // Should have a close button
    await page.click('.node-status-modal button:has-text("Close")');
    await expect(page.locator('.node-status-modal')).not.toBeVisible();
  });
  
  test('Dark Mode Toggle flow', async ({ authenticatedPage: page }) => {
    // 1. UI Render
    await page.goto('/settings');
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
    
    // 2. Button Function - Toggle dark mode
    const darkModeSwitch = page.locator('[data-testid="dark-mode-toggle"]');
    
    // Get current theme
    const isDarkMode = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    
    // Toggle the theme
    await darkModeSwitch.click();
    
    // 3. Verify theme changed in localStorage and DOM
    await page.waitForFunction((currentMode) => {
      const newMode = document.documentElement.classList.contains('dark');
      return newMode !== currentMode;
    }, isDarkMode);
    
    // 4. Verify UI elements reflect the theme change
    const newIsDarkMode = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    
    // Dark mode should affect background color
    if (newIsDarkMode) {
      await expect(page.locator('body')).toHaveCSS('background-color', /rgb\(17, 24, 39\)/); // dark background
    } else {
      await expect(page.locator('body')).toHaveCSS('background-color', /rgb\(255, 255, 255\)/); // light background
    }
    
    // 5. Toggle back
    await darkModeSwitch.click();
    
    // Verify reverted to original state
    await page.waitForFunction((expectedMode) => {
      return document.documentElement.classList.contains('dark') === expectedMode;
    }, isDarkMode);
  });
}); 