import { test, expect } from '@playwright/test';

test.describe('LightningFlow UI Integrity', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3002');
  });

  test('should display complete UI shell with sidebar', async ({ page }) => {
    // Check that the main layout is present
    await expect(page.locator('div.flex.min-h-screen')).toBeVisible();
    
    // Check that BusinessSidebar is present
    await expect(page.locator('[data-testid="business-sidebar"]')).toBeVisible();
    
    // Check that header is present
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('h1:has-text("LightningAI Flow")')).toBeVisible();
    
    // Check that main content area is present
    await expect(page.locator('main.flex-1')).toBeVisible();
  });

  test('should have all navigation sections in sidebar', async ({ page }) => {
    // Check Payments Hub section
    await expect(page.locator('text=Payments Hub')).toBeVisible();
    await expect(page.locator('text=Send Payment')).toBeVisible();
    await expect(page.locator('text=Get Paid')).toBeVisible();
    await expect(page.locator('text=Payment History')).toBeVisible();
    
    // Check Node Income section
    await expect(page.locator('text=Node Income')).toBeVisible();
    await expect(page.locator('text=Earnings Overview')).toBeVisible();
    await expect(page.locator('text=Routing Income')).toBeVisible();
    
    // Check Boost Business section
    await expect(page.locator('text=Boost Business')).toBeVisible();
    await expect(page.locator('text=AI Assistants')).toBeVisible();
    await expect(page.locator('text=BTC Training')).toBeVisible();
    
    // Check Control Center section
    await expect(page.locator('text=Control Center')).toBeVisible();
    await expect(page.locator('text=Settings')).toBeVisible();
    await expect(page.locator('text=Security')).toBeVisible();
  });

  test('should navigate to dashboard successfully', async ({ page }) => {
    // Click on Dashboard link
    await page.click('text=Dashboard');
    
    // Should be on dashboard page
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Check that dashboard content is visible
    await expect(page.locator('text=Lightning Business Dashboard')).toBeVisible();
  });

  test('should navigate to payments sections', async ({ page }) => {
    // Test Send Payment
    await page.click('text=Send Payment');
    await expect(page).toHaveURL(/.*payments\/send/);
    
    // Go back and test Get Paid
    await page.goBack();
    await page.click('text=Get Paid');
    await expect(page).toHaveURL(/.*payments\/receive/);
  });

  test('should navigate to settings sections', async ({ page }) => {
    // Test Settings navigation
    await page.click('text=Settings');
    await expect(page).toHaveURL(/.*settings/);
    
    // Check that settings content is visible
    await expect(page.locator('text=Wallet Settings')).toBeVisible();
  });

  test('should display node status indicator', async ({ page }) => {
    // Check that node status is visible in header
    await expect(page.locator('text=Your node is running smoothly')).toBeVisible();
    await expect(page.locator('.bg-green-500')).toBeVisible();
  });

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Sidebar should still be present (may be collapsed)
    await expect(page.locator('[data-testid="business-sidebar"]')).toBeVisible();
    
    // Header should still be visible
    await expect(page.locator('h1:has-text("LightningAI Flow")')).toBeVisible();
  });

  test('should not show basic/fallback UI', async ({ page }) => {
    // Ensure we're not seeing a basic monitoring dashboard
    await expect(page.locator('text=Uptime Kuma')).not.toBeVisible();
    await expect(page.locator('text=Monitor')).not.toBeVisible();
    
    // Ensure we're seeing the full LightningFlow UI
    await expect(page.locator('text=LightningAI Flow')).toBeVisible();
    await expect(page.locator('text=Payments Hub')).toBeVisible();
  });
});

test.describe('UI Self-Check Endpoint', () => {
  test('should return valid self-check data', async ({ request }) => {
    const response = await request.get('http://localhost:3002/__selfcheck');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.hasGlobalsCss).toBe(true);
    expect(data.hasSidebar).toBe(true);
    expect(data.hasDashboard).toBe(true);
    expect(data.hasBusinessSidebar).toBe(true);
    expect(data.hasClientLayout).toBe(true);
  });
});
