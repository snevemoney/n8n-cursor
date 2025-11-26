import { test, expect } from '@playwright/test';

// Lightning AI Platform - E2E Test Suite
// Tests critical user flows and Lightning functionality

test.describe('Lightning AI Platform - Core Flows', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
  });

  test('should load dashboard successfully', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for key dashboard elements
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('[data-testid="balance-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-actions"]')).toBeVisible();
    
    // Verify mock banner is present
    await expect(page.locator('text=Mock Mode')).toBeVisible();
  });

  test('should navigate through onboarding flow', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Check onboarding page loads
    await expect(page.locator('h1')).toContainText('Welcome');
    
    // Test navigation through steps (if multi-step)
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }
  });

  test('should access receive payments page', async ({ page }) => {
    await page.goto('/receive');
    
    // Check for payment method selection
    await expect(page.locator('text=Lightning Network')).toBeVisible();
    await expect(page.locator('text=Payment Methods')).toBeVisible();
    
    // Test amount input
    const amountInput = page.locator('input[type="number"]');
    if (await amountInput.isVisible()) {
      await amountInput.fill('1000');
      await expect(amountInput).toHaveValue('1000');
    }
  });

  test('should access send payments page', async ({ page }) => {
    await page.goto('/send');
    
    // Check for send payment form
    await expect(page.locator('text=Send Payment')).toBeVisible();
    
    // Test invoice input (if present)
    const invoiceInput = page.locator('textarea, input[placeholder*="invoice"]');
    if (await invoiceInput.isVisible()) {
      await invoiceInput.fill('lnbc1000n1...');
    }
  });

  test('should display transaction history', async ({ page }) => {
    await page.goto('/transactions');
    
    // Check for transaction list
    await expect(page.locator('text=Transaction History')).toBeVisible();
    
    // Look for transaction items or empty state
    const transactionItems = page.locator('[data-testid="transaction-item"]');
    const emptyState = page.locator('text=No transactions');
    
    await expect(transactionItems.first().or(emptyState)).toBeVisible();
  });

  test('should access AI assistant', async ({ page }) => {
    await page.goto('/ai-assistant');
    
    // Check AI assistant interface
    await expect(page.locator('text=AI Assistant')).toBeVisible();
    
    // Test chat input (if present)
    const chatInput = page.locator('input[placeholder*="message"], textarea[placeholder*="message"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('Hello, can you help me?');
    }
  });

  test('should access lightning intelligence', async ({ page }) => {
    await page.goto('/lightning-intelligence');
    
    // Check Lightning Intelligence page
    await expect(page.locator('text=Lightning Intelligence')).toBeVisible();
  });

  test('should access payment links', async ({ page }) => {
    await page.goto('/payment-links');
    
    // Check payment links interface
    await expect(page.locator('text=Payment Links')).toBeVisible();
    
    // Test create payment link button
    const createButton = page.locator('button:has-text("Create")');
    if (await createButton.isVisible()) {
      await expect(createButton).toBeEnabled();
    }
  });

  test('should access settings page', async ({ page }) => {
    await page.goto('/settings');
    
    // Check settings page
    await expect(page.locator('text=Settings')).toBeVisible();
    
    // Test system health link
    const systemHealthLink = page.locator('a[href="/settings/system-health"]');
    if (await systemHealthLink.isVisible()) {
      await systemHealthLink.click();
      await expect(page.locator('text=System Health')).toBeVisible();
    }
  });

  test('should handle lightning test harness', async ({ page }) => {
    await page.goto('/lightning-test');
    
    // Check test harness interface
    await expect(page.locator('text=Lightning Test')).toBeVisible();
    
    // Test mock payment button
    const mockPaymentButton = page.locator('button:has-text("Mock Payment")');
    if (await mockPaymentButton.isVisible()) {
      await mockPaymentButton.click();
      
      // Check for success message or result
      await expect(page.locator('text=Success, text=Completed')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display analytics dashboard', async ({ page }) => {
    await page.goto('/analytics');
    
    // Check analytics interface
    await expect(page.locator('text=Analytics')).toBeVisible();
    
    // Test earnings analytics link
    const earningsLink = page.locator('a[href="/analytics/earnings"]');
    if (await earningsLink.isVisible()) {
      await earningsLink.click();
      await expect(page.locator('text=Earnings')).toBeVisible();
    }
  });

  test('should handle API endpoints', async ({ page }) => {
    // Test system check API
    const systemCheckResponse = await page.request.get('/api/system-check');
    expect(systemCheckResponse.status()).toBe(200);
    
    // Test Lightning node info API
    const nodeInfoResponse = await page.request.get('/api/lightning/node-info');
    expect(nodeInfoResponse.status()).toBe(200);
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Check mobile navigation
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
    }
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test 404 page
    await page.goto('/non-existent-page');
    await expect(page.locator('text=404, text=Not Found')).toBeVisible();
    
    // Test back to dashboard link
    const backLink = page.locator('a[href="/dashboard"]');
    if (await backLink.isVisible()) {
      await backLink.click();
      await expect(page.locator('text=Dashboard')).toBeVisible();
    }
  });
}); 