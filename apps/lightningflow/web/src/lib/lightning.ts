import { apiPath } from '@/lib/base-path';
import { supabase, getSupabaseAdmin } from './supabase';
import { encodeLnurl } from './lnurl';
import { Database } from './database.types';

// Lightning Network Node Types
export type LightningNodeType = 'lnd' | 'c-lightning' | 'lnbits';

export interface LightningInvoice {
  payment_hash: string;
  payment_request: string;
  preimage?: string;
  expires_at: Date;
  amount_sats: number;
  description: string;
}

export interface LnurlPayParams {
  callback: string;
  minSendable: number;
  maxSendable: number;
  metadata: string;
  commentAllowed?: number;
}

// LNURL-pay response structure
export interface LnurlPayResponse {
  pr: string; // Lightning invoice payment request
  routes: [];
  successAction?: {
    tag: string;
    message?: string;
    url?: string;
  };
}

/**
 * Generate a proper metadata JSON string for LNURL-pay
 */
export function createLnurlMetadata(description: string, imageUrl?: string): string {
  const metadata = [
    ["text/plain", description]
  ];
  
  if (imageUrl) {
    metadata.push(["image/png;base64", imageUrl]);
  }
  
  return JSON.stringify(metadata);
}

/**
 * Create a new Lightning invoice via the backend (LND or LNbits)
 */
export async function createLightningInvoice(
  tenantId: string,
  amount: number,
  description: string,
  expirySeconds: number = 3600
): Promise<LightningInvoice> {
  const response = await fetch(apiPath('/api/lightning/invoice'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tenant_id: tenantId,
      amount_sats: amount,
      description,
      expiry_seconds: expirySeconds,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create invoice');
  }

  return response.json();
}

/**
 * Check Lightning invoice payment status
 */
export async function checkInvoiceStatus(paymentHash: string, tenantId: string): Promise<{
  paid: boolean;
  preimage?: string;
}> {
  const response = await fetch(apiPath(`/api/lightning/invoice/status?payment_hash=${paymentHash}&tenant_id=${tenantId}`));
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to check invoice status');
  }

  return response.json();
}

/**
 * Generate LNURL-pay parameters
 */
export function generateLnurlPayParams(
  invoiceId: string,
  description: string,
  amount: number,
  hostUrl: string = typeof window !== 'undefined' ? window.location.origin : 'https://example.com'
): LnurlPayParams {
  // Create callback URL for the LNURL-pay flow
  const callbackUrl = `${hostUrl}/api/lnurl-pay/callback?invoice_id=${invoiceId}`;
  
  // Create metadata according to spec
  const metadata = createLnurlMetadata(description);
  
  return {
    callback: callbackUrl,
    minSendable: amount * 1000, // Convert to millisats
    maxSendable: amount * 1000, // Convert to millisats
    metadata: metadata,
    commentAllowed: 0 // No comments allowed by default
  };
}

/**
 * Create a complete LNURL-pay URL including bech32 encoding
 */
export function createLnurlPayUrl(
  invoiceId: string,
  description: string,
  amount: number
): string {
  // Get base URL of current site
  const hostUrl = typeof window !== 'undefined' ? window.location.origin : 'https://example.com';
  
  // Generate base URL for LNURL-pay without encoding
  const baseUrl = `${hostUrl}/api/lnurl-pay?invoice_id=${invoiceId}`;
  
  // Encode as bech32 LNURL
  return encodeLnurl(baseUrl);
}

/**
 * Get lightning node info for tenant
 */
export async function getLightningNodeInfo(tenantId: string): Promise<{
  alias: string;
  pubkey: string;
  type: LightningNodeType;
  uri?: string;
}> {
  const response = await fetch(apiPath(`/api/lightning/node-info?tenant_id=${tenantId}`));
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get node info');
  }

  return response.json();
}

/**
 * Check if a tenant has LNURL-pay enabled
 */
export async function isLnurlPayEnabled(tenantId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('is_enabled')
    .eq('tenant_id', tenantId)
    .eq('type', 'lightning')
    .single();
    
  if (error || !data) {
    return false;
  }
  
  return data.is_enabled;
}

/**
 * Update invoice status when payment is received
 * This function should only be called from a secure server context
 */
export async function updateInvoicePaymentStatus(
  paymentHash: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  preimage?: string
): Promise<boolean> {
  // Use admin client to bypass RLS
  const supabaseAdmin = getSupabaseAdmin();
  
  if (!supabaseAdmin) {
    throw new Error('Admin client not available');
  }
  
  // First find the payment record by payment_hash
  const { data: payment, error: paymentError } = await supabaseAdmin
    .from('invoice_payments')
    .select('id, invoice_id')
    .eq('payment_hash', paymentHash)
    .single();
    
  if (paymentError || !payment) {
    console.error('Payment not found:', paymentError);
    return false;
  }
  
  // Update payment status
  const { error: updateError } = await supabaseAdmin
    .from('invoice_payments')
    .update({
      status,
      preimage,
      updated_at: new Date().toISOString()
    })
    .eq('id', payment.id);
    
  if (updateError) {
    console.error('Failed to update payment:', updateError);
    return false;
  }
  
  // If payment is completed, update the invoice status too
  if (status === 'completed') {
    const { error: invoiceUpdateError } = await supabaseAdmin
      .from('invoices')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', payment.invoice_id);
      
    if (invoiceUpdateError) {
      console.error('Failed to update invoice:', invoiceUpdateError);
    }
  }
  
  return true;
} 