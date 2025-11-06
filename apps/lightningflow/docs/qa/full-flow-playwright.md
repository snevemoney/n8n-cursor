# Full Button & Flow Validation Testing Guide

This document outlines the approach for comprehensive end-to-end testing of the Lightning AI Business Node Platform using Playwright.

## Testing Philosophy

Each test validates the complete flow from UI interaction to backend processing and UI feedback, ensuring that:

1. UI components render correctly
2. User actions trigger appropriate API calls
3. API responses are handled correctly
4. Database records are created/updated as expected
5. User receives appropriate feedback (toast, visual change, etc.)
6. Asynchronous processes complete successfully (if applicable)

## Test Environment Setup

```typescript
// Global test setup
import { test as base } from '@playwright/test';
import { SupabaseClient } from '@supabase/supabase-js';
import { setupMockLightningNode } from '../mocks/lightning';
import { createTestDatabase } from '../utils/test-db';

// Extended test with Lightning platform context
export const test = base.extend({
  // Set up authenticated context
  authenticatedPage: async ({ page }, use) => {
    // Login before tests
    await page.goto('/login');
    await page.fill('[name=email]', process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.fill('[name=password]', process.env.TEST_USER_PASSWORD || 'testpassword');
    await page.click('button[type=submit]');
    await page.waitForURL('/dashboard');
    
    // Use the authenticated page
    await use(page);
  },
  
  // Provide access to Supabase client
  supabase: async ({}, use) => {
    const supabase = createTestDatabase();
    await use(supabase);
    // Clean up test data after tests
    await supabase.rpc('clean_test_data');
  },
  
  // Mock Lightning node
  lightningNode: async ({}, use) => {
    const mockNode = setupMockLightningNode();
    await use(mockNode);
    await mockNode.cleanup();
  }
});

export { expect } from '@playwright/test';
```

## Flows to Test

### 1. Send Payment Flow

```typescript
test('Send Payment flow', async ({ authenticatedPage: page, supabase, lightningNode }) => {
  // 1. UI Render
  await page.goto('/dashboard/send');
  await expect(page.locator('h1:has-text("Send Payment")')).toBeVisible();
  
  // 2. Button Function - Fill form and submit
  await page.fill('[name=invoice]', 'lnbc100n1...');
  await page.click('button:has-text("Send Payment")');
  
  // 3. API Success - Verify API call
  await page.waitForResponse(resp => 
    resp.url().includes('/api/sendPayment') && resp.status() === 200
  );
  
  // 4. Data Effect - Check DB record
  const { data: payment } = await supabase
    .from('payments')
    .select()
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  expect(payment).toBeTruthy();
  expect(payment.status).toBe('completed');
  
  // 5. Feedback - Verify toast appears
  await expect(page.locator('.toast:has-text("Payment sent")')).toBeVisible();
  
  // 6. Async Result - Verify ledger update
  await page.goto('/ledger');
  await expect(page.locator(`[data-payment-id="${payment.id}"]`)).toBeVisible();
});
```

### 2. Generate Invoice Flow

```typescript
test('Generate Invoice flow', async ({ authenticatedPage: page, supabase }) => {
  // 1. UI Render
  await page.goto('/payment-links');
  await expect(page.locator('h1:has-text("Payment Links")')).toBeVisible();
  
  // 2. Button Function - Click Generate Invoice
  await page.click('button:has-text("Generate Invoice")');
  await page.fill('[name=amount]', '1000');
  await page.fill('[name=description]', 'Test Invoice');
  await page.click('button:has-text("Create")');
  
  // 3. API Success - Verify API calls
  const invoiceResponse = await page.waitForResponse(resp => 
    resp.url().includes('/api/invoice') && resp.status() === 200
  );
  const invoiceData = await invoiceResponse.json();
  
  await page.waitForResponse(resp => 
    resp.url().includes('/api/create-lnurl-pay') && resp.status() === 200
  );
  
  // 4. Data Effect - Check DB record
  const { data: invoice } = await supabase
    .from('invoices')
    .select()
    .eq('id', invoiceData.id)
    .single();
  
  expect(invoice).toBeTruthy();
  expect(invoice.amount_sats).toBe(1000);
  
  // 5. Feedback - Verify QR code is visible
  await expect(page.locator('canvas.qr-code')).toBeVisible();
  
  // 6. Verify invoice appears in history
  await expect(page.locator(`[data-invoice-id="${invoice.id}"]`)).toBeVisible();
});
```

### 3. Team Wallet Invite Flow

```typescript
test('Team Wallet Invite Member flow', async ({ authenticatedPage: page, supabase }) => {
  // 1. UI Render
  await page.goto('/team-wallets');
  await expect(page.locator('h1:has-text("Team Wallets")')).toBeVisible();
  
  // 2. Button Function - Click Invite Member
  await page.click('button:has-text("Invite Member")');
  await page.fill('[name=email]', 'newmember@example.com');
  await page.selectOption('[name=role]', 'viewer');
  await page.click('button:has-text("Send Invite")');
  
  // 3. API Success - Verify API call
  const response = await page.waitForResponse(resp => 
    resp.url().includes('/api/wallets/invite') && resp.status() === 200
  );
  const inviteData = await response.json();
  
  // 4. Data Effect - Check DB record
  const { data: invite } = await supabase
    .from('wallet_invites')
    .select()
    .eq('id', inviteData.id)
    .single();
  
  expect(invite).toBeTruthy();
  expect(invite.email).toBe('newmember@example.com');
  expect(invite.role).toBe('viewer');
  
  // 5. Feedback - Verify member appears in list
  await expect(page.locator(`[data-invite-email="newmember@example.com"]`)).toBeVisible();
});
```

### 4. AI Assistant Flow

```typescript
test('AI Assistant flow', async ({ authenticatedPage: page, supabase }) => {
  // 1. UI Render
  await page.goto('/ai-assistant');
  await expect(page.locator('.chat-container')).toBeVisible();
  
  // 2. Button Function - Type and submit message
  await page.fill('.chat-input', 'Generate a payment summary for last week');
  await page.press('.chat-input', 'Enter');
  
  // 3. API Success - Verify API call
  const response = await page.waitForResponse(resp => 
    resp.url().includes('/api/ai/assistant') && resp.status() === 200
  );
  const assistantData = await response.json();
  
  // 4. Data Effect - Check DB record
  const { data: conversation } = await supabase
    .from('ai_conversations')
    .select()
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  expect(conversation).toBeTruthy();
  
  // 5. Feedback - Verify response in chat UI
  await expect(page.locator('.chat-message:has-text("payment summary")')).toBeVisible();
  
  // 6. Verify conversation saved to history
  await page.goto('/ai-assistant/history');
  await expect(page.locator(`[data-conversation-id="${conversation.id}"]`)).toBeVisible();
});
```

### 5. Open Channel Flow

```typescript
test('Open Channel flow', async ({ authenticatedPage: page, supabase, lightningNode }) => {
  // 1. UI Render
  await page.goto('/dashboard');
  
  // 2. Button Function - Open channel modal
  await page.click('button:has-text("Open Channel")');
  await page.fill('[name=peer_pubkey]', '03abc...def');
  await page.fill('[name=local_amount]', '1000000');
  await page.click('button:has-text("Open")');
  
  // 3. API Success - Verify API call
  const response = await page.waitForResponse(resp => 
    resp.url().includes('/api/channels/open') && resp.status() === 200
  );
  const channelData = await response.json();
  
  // 4. Data Effect - Check DB record
  const { data: channel } = await supabase
    .from('channels')
    .select()
    .eq('channel_id', channelData.channel_id)
    .single();
  
  expect(channel).toBeTruthy();
  
  // 5. Feedback - Verify peer/channel summary refresh
  await expect(page.locator(`[data-channel-id="${channel.channel_id}"]`)).toBeVisible();
  
  // 6. Verify channel log
  await page.goto('/channels');
  await expect(page.locator(`[data-channel-id="${channel.channel_id}"]`)).toBeVisible();
});
```

### 6. Analytics Navigation Flow

```typescript
test('Analytics navigation flow', async ({ authenticatedPage: page }) => {
  // 1. UI Render
  await page.goto('/analytics');
  await expect(page.locator('h1:has-text("Analytics")')).toBeVisible();
  
  // 2. Button Function - Navigate tabs
  await page.click('button:has-text("7D")');
  
  // 3. API Success - Verify API calls
  const uptimeResponse = await page.waitForResponse(resp => 
    resp.url().includes('/api/analytics/uptime') && resp.status() === 200
  );
  expect(await uptimeResponse.json()).toBeTruthy();
  
  await page.click('button:has-text("30D")');
  
  const earningsResponse = await page.waitForResponse(resp => 
    resp.url().includes('/api/routing/earnings') && resp.status() === 200
  );
  expect(await earningsResponse.json()).toBeTruthy();
  
  // 4. Verify charts render with data
  await expect(page.locator('.chart-container canvas')).toBeVisible();
});
```

### 7. Node Status Flow

```typescript
test('Node Status flow', async ({ authenticatedPage: page }) => {
  // 1. UI Render - Check topbar
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
});
```

### 8. System Check Flow

```typescript
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
});
```

### 9. Advanced Mode Toggle Flow

```typescript
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
```

## Test Results Format

After running the tests, results should be formatted as:

```
✅ Send Payment: API + ledger update + toast all passed
✅ Invoice Flow: QR and entry created
⚠️ AI Assistant: API OK, but /history not updated
❌ Channel Open: Peer not added, no channel log found
```

## Environment Requirements

- Supabase self-hosted with RLS
- LNbits or LND active (or mocked)
- BullMQ available for job confirmation
- Frontend uses Next.js + Tailwind + shadcn/ui
- All features follow /features/, /api/, /background/ structure 