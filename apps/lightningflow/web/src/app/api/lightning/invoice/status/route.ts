import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { assertSupabase } from '@/lib/supabase-server';

// Safe Supabase client creation with fallbacks
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
    console.warn('Supabase not configured - using mock mode');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

const supabase = createSupabaseClient();

// Mark route as dynamic to prevent static generation issues
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Return mock response if Supabase not configured
    if (!supabase) {
      const { searchParams } = new URL(request.url);
      const invoiceId = searchParams.get('invoice_id');

      return NextResponse.json({
        success: true,
        invoice: {
          id: invoiceId || 'mock-invoice-id',
          status: 'pending',
          amount_sats: 1000,
          description: 'Mock invoice',
          payment_hash: 'mock-payment-hash',
          payment_request: 'lnbc1000n1p3w9g57pp5mock-payment-request',
          expires_at: new Date(Date.now() + 3600000).toISOString(),
          created_at: new Date().toISOString()
        },
        mode: 'mock'
      });
    }

    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoice_id');

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // Get invoice status from database
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (error || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      invoice
    });

  } catch (error) {
    console.error('Invoice status error:', error);
    return NextResponse.json(
      { error: 'Failed to get invoice status' },
      { status: 500 }
    );
  }
}
