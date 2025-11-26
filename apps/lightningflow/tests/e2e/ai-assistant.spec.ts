import { test, expect } from '../utils/test-setup';

test.describe('AI Assistant Flows', () => {
  test('AI Assistant chat flow', async ({ authenticatedPage: page, supabase }) => {
    // 1. UI Render
    await page.goto('/ai-assistant');
    await expect(page.locator('.chat-container')).toBeVisible();
    
    // 2. Button Function - Type and submit message
    const testMessage = 'Generate a payment summary for last week';
    await page.fill('.chat-input', testMessage);
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
    expect(conversation.messages).toContainEqual(
      expect.objectContaining({ role: 'user', content: testMessage })
    );
    
    // 5. Feedback - Verify response in chat UI
    // Wait for AI response to appear in the UI
    await page.waitForSelector('.chat-message.ai');
    
    // Check that the message appears in the chat
    const userMessage = await page.locator('.chat-message.user').first().textContent();
    expect(userMessage).toContain(testMessage);
    
    // Check that there's an AI response
    await expect(page.locator('.chat-message.ai')).toBeVisible();
    
    // 6. Verify conversation saved to history
    await page.goto('/ai-assistant/history');
    await expect(page.locator(`[data-conversation-id="${conversation.id}"]`)).toBeVisible();
  });
  
  test('AI Assistant generates invoice flow', async ({ authenticatedPage: page, supabase }) => {
    // 1. UI Render
    await page.goto('/ai-assistant');
    await expect(page.locator('.chat-container')).toBeVisible();
    
    // 2. Button Function - Ask AI to create invoice
    const testMessage = 'Create an invoice for 1000 sats for web development';
    await page.fill('.chat-input', testMessage);
    await page.press('.chat-input', 'Enter');
    
    // 3. API Success - Verify API calls
    // First the AI assistant API
    await page.waitForResponse(resp => 
      resp.url().includes('/api/ai/assistant') && resp.status() === 200
    );
    
    // Then the invoice creation API (triggered by the AI)
    const invoiceResponse = await page.waitForResponse(resp => 
      resp.url().includes('/api/invoice') && resp.status() === 200
    );
    const invoiceData = await invoiceResponse.json();
    
    // 4. Data Effect - Check DB records
    // Verify invoice was created
    const { data: invoice } = await supabase
      .from('invoices')
      .select()
      .eq('id', invoiceData.id)
      .single();
    
    expect(invoice).toBeTruthy();
    expect(invoice.amount_sats).toBe(1000);
    expect(invoice.description).toContain('web development');
    
    // 5. Feedback - Verify invoice card appears in chat
    await expect(page.locator('.invoice-card')).toBeVisible();
    await expect(page.locator('.invoice-card .qr-code')).toBeVisible();
    
    // 6. Verify invoice can be paid
    // Click copy button to get payment request
    await page.click('.invoice-card .copy-button');
    
    // Verify toast appears
    await expect(page.locator('.toast:has-text("Copied")')).toBeVisible();
  });
  
  test('AI Assistant analytics flow', async ({ authenticatedPage: page, supabase }) => {
    // 1. UI Render
    await page.goto('/ai-assistant');
    await expect(page.locator('.chat-container')).toBeVisible();
    
    // 2. Button Function - Ask for analytics
    const testMessage = 'Show me analytics for my node performance last month';
    await page.fill('.chat-input', testMessage);
    await page.press('.chat-input', 'Enter');
    
    // 3. API Success - Verify multiple API calls
    // First the AI assistant API
    await page.waitForResponse(resp => 
      resp.url().includes('/api/ai/assistant') && resp.status() === 200
    );
    
    // Then analytics APIs
    await page.waitForResponse(resp => 
      resp.url().includes('/api/analytics') && resp.status() === 200
    );
    
    // 4. Feedback - Verify chart appears in response
    await page.waitForSelector('.ai-generated-chart');
    await expect(page.locator('.ai-generated-chart')).toBeVisible();
    
    // 5. Verify insights text appears
    const aiResponse = await page.locator('.chat-message.ai').last().textContent();
    expect(aiResponse).toContain('performance');
  });
}); 