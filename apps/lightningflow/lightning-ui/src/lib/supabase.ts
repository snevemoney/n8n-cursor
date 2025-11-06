import { createClient } from '@supabase/supabase-js';

// Establish type-safe Supabase client for better DX
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Server-side admin client (for background jobs, etc.)
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Client-side user client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Use server-side client with caution - bypasses RLS
export const getSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client is not available. Check your environment variables.');
  }
  return supabaseAdmin;
};

// Helper to create authenticated Supabase client with user token
export const getSupabaseClient = (accessToken: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
};

// Database helpers

/**
 * Get the current user's active tenant ID
 * @param userId The current authenticated user ID
 * @returns The user's active tenant ID or undefined
 */
export async function getUserTenant(userId: string): Promise<string | undefined> {
  if (!userId) return undefined;
  
  const { data } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', userId)
    .limit(1)
    .single();
    
  return data?.tenant_id;
}

/**
 * Get invoice by ID with RLS (only if user has access)
 */
export async function getInvoice(invoiceId: string) {
  return supabase
    .from('invoices')
    .select(`
      *,
      invoice_payments(*)
    `)
    .eq('id', invoiceId)
    .single();
}

/**
 * Get recent invoices for current user/tenant
 */
export async function getRecentInvoices(limit = 10) {
  return supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
}

/**
 * Create a new invoice
 */
export async function createInvoice(
  userId: string,
  tenantId: string,
  data: {
    description: string;
    amount_sats: number;
    original_amount_sats?: number;
    discount_percent?: number;
    currency: string;
    metadata?: any;
  }
) {
  return supabase
    .from('invoices')
    .insert({
      user_id: userId,
      tenant_id: tenantId,
      ...data
    })
    .select()
    .single();
}

/**
 * Create a payment record for an invoice
 */
export async function createPayment(
  invoiceId: string,
  data: {
    amount_sats: number;
    payment_method: string;
    payment_request?: string;
    metadata?: any;
  }
) {
  return supabase
    .from('invoice_payments')
    .insert({
      invoice_id: invoiceId,
      ...data
    })
    .select()
    .single();
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  data?: {
    preimage?: string;
    payment_hash?: string;
    metadata?: any;
  }
) {
  return supabase
    .from('invoice_payments')
    .update({
      status,
      ...(data || {}),
      updated_at: new Date().toISOString()
    })
    .eq('id', paymentId)
    .select()
    .single();
}

/**
 * Get payment analytics for a date range
 */
export async function getPaymentAnalytics(
  tenantId: string,
  startDate: string,
  endDate: string
) {
  return supabase
    .from('payment_analytics')
    .select('*')
    .eq('tenant_id', tenantId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });
}

// Create a Supabase client for use in app components
export const supabaseApp = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
); 