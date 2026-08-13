import { apiPath } from '@/lib/base-path';
import { supabase } from './supabase';
import { Database } from './database.types';

/**
 * Create a new invoice in the database and return an LNURL
 */
export async function createInvoice(
  tenantId: string,
  data: {
    description: string;
    amount_sats: number;
    original_amount_sats?: number;
    discount_percent?: number;
    currency?: string;
    metadata?: any;
  }
): Promise<{
  id: string;
  lnurl: string;
  payment_hash?: string;
  payment_request?: string;
  amount_sats: number;
  expires_at: string;
}> {
  // First, create the invoice in our database
  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({
      tenant_id: tenantId,
      description: data.description,
      amount_sats: data.amount_sats,
      original_amount_sats: data.original_amount_sats,
      discount_percent: data.discount_percent,
      currency: data.currency || 'SATS',
      payment_method: 'lightning',
      metadata: data.metadata || {},
      status: 'pending',
      expiry_seconds: 3600 // 1 hour expiry
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating invoice:', error);
    throw new Error(`Failed to create invoice: ${error.message}`);
  }

  // Now get the LNURL for this invoice
  const res = await fetch(apiPath(`/api/lnurl-pay?invoice_id=${invoice.id}`));
  if (!res.ok) {
    console.error('Error generating LNURL:', await res.text());
    throw new Error('Failed to generate LNURL');
  }

  const lnurlData = await res.json();
  return {
    id: invoice.id,
    lnurl: lnurlData.lnurl,
    amount_sats: invoice.amount_sats,
    expires_at: invoice.expires_at
  };
}

/**
 * Request an LNURL from the server for a specific invoice
 */
export async function createLnurlPay(invoiceId: string): Promise<string> {
  const res = await fetch(apiPath(`/api/lnurl-pay?invoice_id=${invoiceId}`));
  if (!res.ok) {
    throw new Error('Failed to create LNURL');
  }
  const data: { lnurl: string } = await res.json();
  return data.lnurl;
}

/**
 * Check the status of an invoice
 */
export async function checkInvoiceStatus(
  invoiceId: string,
  tenantId: string
): Promise<{
  paid: boolean;
  status: string;
  invoice?: Database['public']['Tables']['invoices']['Row'];
}> {
  // First check the invoice status in our database
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      invoice_payments(*)
    `)
    .eq('id', invoiceId)
    .eq('tenant_id', tenantId)
    .single();

  if (error) {
    console.error('Error checking invoice status:', error);
    throw new Error(`Failed to check invoice status: ${error.message}`);
  }

  // If the invoice is already marked as completed or expired, return that status
  if (invoice.status === 'completed') {
    return {
      paid: true,
      status: 'completed',
      invoice
    };
  }

  if (invoice.status === 'expired' || (invoice.expires_at && new Date(invoice.expires_at) < new Date())) {
    return {
      paid: false,
      status: 'expired',
      invoice
    };
  }

  // If we have payments with payment_hash, check their status with the Lightning node
  const payments = invoice.invoice_payments || [];
  for (const payment of payments) {
    if (payment.payment_hash) {
      try {
        const res = await fetch(apiPath(`/api/lightning/invoice/status?payment_hash=${payment.payment_hash}&tenant_id=${tenantId}`));
        
        if (!res.ok) {
          console.error('Error checking payment status:', await res.text());
          continue;
        }
        
        const paymentStatus = await res.json();
        
        if (paymentStatus.paid) {
          return {
            paid: true,
            status: 'completed',
            invoice: {
              ...invoice,
              status: 'completed' // Optimistically update
            }
          };
        }
      } catch (err) {
        console.error('Error checking payment with node:', err);
      }
    }
  }

  // If we got here, the invoice is still pending
  return {
    paid: false,
    status: 'pending',
    invoice
  };
}

/**
 * Get recent invoices for a tenant
 */
export async function getRecentInvoices(
  tenantId: string,
  limit: number = 10
): Promise<Database['public']['Tables']['invoices']['Row'][]> {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      invoice_payments(*)
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent invoices:', error);
    throw new Error(`Failed to fetch invoices: ${error.message}`);
  }

  return data || [];
}

/**
 * Get invoice by ID
 */
export async function getInvoice(
  invoiceId: string
): Promise<Database['public']['Tables']['invoices']['Row'] & {
  invoice_payments: Database['public']['Tables']['invoice_payments']['Row'][];
}> {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      invoice_payments(*)
    `)
    .eq('id', invoiceId)
    .single();

  if (error) {
    console.error('Error fetching invoice:', error);
    throw new Error(`Failed to fetch invoice: ${error.message}`);
  }

  return data;
}

/**
 * Mark an invoice as expired (useful for UI-triggered expiry)
 */
export async function expireInvoice(invoiceId: string): Promise<void> {
  const { error } = await supabase
    .from('invoices')
    .update({
      status: 'expired',
      updated_at: new Date().toISOString()
    })
    .eq('id', invoiceId);

  if (error) {
    console.error('Error expiring invoice:', error);
    throw new Error(`Failed to expire invoice: ${error.message}`);
  }
}

/**
 * Get payment analytics for a date range
 */
export async function getPaymentAnalytics(
  tenantId: string,
  startDate: string,
  endDate: string
): Promise<Database['public']['Tables']['payment_analytics']['Row'][]> {
  const { data, error } = await supabase
    .from('payment_analytics')
    .select('*')
    .eq('tenant_id', tenantId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching payment analytics:', error);
    throw new Error(`Failed to fetch payment analytics: ${error.message}`);
  }

  return data || [];
}
