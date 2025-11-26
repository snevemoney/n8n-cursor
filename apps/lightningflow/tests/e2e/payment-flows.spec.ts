import { test, expect } from '../utils/test-setup';

test.describe('Payment Flows', () => {
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
  
  test('Invoice Payment Webhook flow', async ({ authenticatedPage: page, supabase, lightningNode }) => {
    // 1. Create an invoice first
    await page.goto('/payment-links');
    await page.click('button:has-text("Generate Invoice")');
    await page.fill('[name=amount]', '2000');
    await page.fill('[name=description]', 'Test Payment Webhook');
    await page.click('button:has-text("Create")');
    
    const invoiceResponse = await page.waitForResponse(resp => 
      resp.url().includes('/api/invoice') && resp.status() === 200
    );
    const invoiceData = await invoiceResponse.json();
    
    // 2. Simulate webhook payment via API
    const webhookResponse = await page.request.post('/api/webhooks/lightning', {
      data: {
        payment_hash: invoiceData.payment_hash,
        preimage: 'test-preimage-123',
        amount: 2000,
        fee: 0,
        memo: 'Test Payment Webhook',
        time: Date.now() / 1000,
        bolt11: invoiceData.payment_request,
        checking_id: invoiceData.payment_hash,
        extra: {
          tenant_id: invoiceData.tenant_id,
          invoice_id: invoiceData.id
        }
      }
    });
    
    expect(webhookResponse.ok()).toBeTruthy();
    
    // 3. Verify DB record updated
    const { data: updatedInvoice } = await supabase
      .from('invoices')
      .select()
      .eq('id', invoiceData.id)
      .single();
    
    expect(updatedInvoice).toBeTruthy();
    expect(updatedInvoice.status).toBe('completed');
    
    // 4. Verify payment record created
    const { data: payment } = await supabase
      .from('invoice_payments')
      .select()
      .eq('invoice_id', invoiceData.id)
      .single();
    
    expect(payment).toBeTruthy();
    expect(payment.status).toBe('completed');
    
    // 5. Verify UI updated (if on invoice detail page)
    await page.goto(`/payment-links/${invoiceData.id}`);
    await expect(page.locator('.payment-status:has-text("Paid")')).toBeVisible();
  });
}); 