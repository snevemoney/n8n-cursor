import { test, expect } from '../utils/test-setup';

test.describe('Analytics and Channels Flows', () => {
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
    
    // 5. Test date range picker
    await page.click('.date-range-picker button');
    await page.click('button:has-text("Custom Range")');
    
    // Select dates
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    await page.fill('input[name="startDate"]', lastMonth.toISOString().split('T')[0]);
    await page.fill('input[name="endDate"]', today.toISOString().split('T')[0]);
    await page.click('button:has-text("Apply")');
    
    // Verify custom API call
    const customRangeResponse = await page.waitForResponse(resp => 
      resp.url().includes('/api/analytics') && 
      resp.url().includes('start=') && 
      resp.url().includes('end=') && 
      resp.status() === 200
    );
    expect(await customRangeResponse.json()).toBeTruthy();
  });

  test('Channel reports flow', async ({ authenticatedPage: page }) => {
    // 1. UI Render
    await page.goto('/analytics/channels');
    await expect(page.locator('h1:has-text("Channel Performance")')).toBeVisible();
    
    // 2. Verify channels table displays
    await expect(page.locator('.channels-table')).toBeVisible();
    
    // 3. API Success - Verify API calls
    const channelsResponse = await page.waitForResponse(resp => 
      resp.url().includes('/api/channels/performance') && resp.status() === 200
    );
    const channelsData = await channelsResponse.json();
    
    // 4. Verify channels data loaded
    expect(channelsData.channels.length).toBeGreaterThan(0);
    
    // 5. Test filtering
    await page.fill('[placeholder="Search channels"]', channelsData.channels[0].alias);
    
    // Verify filtered results
    const filteredCount = await page.locator('.channel-row').count();
    expect(filteredCount).toBeLessThanOrEqual(channelsData.channels.length);
    
    // 6. Test sorting
    await page.click('th:has-text("Earnings")');
    
    // Verify sorting triggered a re-fetch
    await page.waitForResponse(resp => 
      resp.url().includes('/api/channels/performance') && 
      resp.url().includes('sort=earnings') && 
      resp.status() === 200
    );
  });

  test('Open Channel flow', async ({ authenticatedPage: page, supabase, lightningNode }) => {
    // 1. UI Render
    await page.goto('/channels');
    await expect(page.locator('h1:has-text("Channels")')).toBeVisible();
    
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
    expect(channel.capacity).toBe(1000000);
    
    // 5. Feedback - Verify toast and status update
    await expect(page.locator('.toast:has-text("Channel opening")')).toBeVisible();
    
    // 6. Verify job added to the queue
    await page.goto('/settings/system-health');
    await page.click('button:has-text("Run System Check")');
    
    const systemCheckResponse = await page.waitForResponse(resp => 
      resp.url().includes('/api/system-check') && resp.status() === 200
    );
    const checkResults = await systemCheckResponse.json();
    
    // Channel opening job should be recorded in background jobs check
    expect(checkResults.results.background).toBeTruthy();
  });
  
  test('Channel Management flow', async ({ authenticatedPage: page, lightningNode }) => {
    // 1. Create a mock channel first
    const channel = await lightningNode.openChannel('028abc...def', 2000000);
    
    // 2. UI Render - Go to channels page
    await page.goto('/channels');
    await expect(page.locator('h1:has-text("Channels")')).toBeVisible();
    
    // 3. Verify channel appears in list
    await page.waitForSelector(`[data-channel-id="${channel.channel_id}"]`);
    
    // 4. Test channel detail view
    await page.click(`[data-channel-id="${channel.channel_id}"]`);
    
    // Verify details modal opens
    await expect(page.locator('.channel-details-modal')).toBeVisible();
    
    // 5. Test channel actions
    await page.click('button:has-text("Update Fee Policy")');
    await page.fill('[name=base_fee_msat]', '1000');
    await page.fill('[name=fee_rate]', '500');
    await page.click('button:has-text("Update")');
    
    // Verify API call
    await page.waitForResponse(resp => 
      resp.url().includes('/api/channels/fee-policy') && resp.status() === 200
    );
    
    // 6. Verify toast appears
    await expect(page.locator('.toast:has-text("Fee policy updated")')).toBeVisible();
  });
}); 