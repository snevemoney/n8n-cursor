import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
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

// Mock createLnurlMetadata function
function createLnurlMetadata(description: string): string {
  return JSON.stringify([["text/plain", description]]);
}

// Lightning Node Configuration
const LIGHTNING_NODE_URL = process.env.LIGHTNING_NODE_URL || '';
const LIGHTNING_API_KEY = process.env.LIGHTNING_API_KEY || '';

// Mark route as dynamic to prevent static generation issues
export const dynamic = 'force-dynamic';

/**
 * GET /api/lnurl-pay/callback
 * LNURL-pay callback endpoint that returns data and creates an invoice when called
 * Follows the LNURL-pay spec: https://github.com/lnurl/luds/blob/luds/06.md
 */
export async function GET(req: NextRequest) {
  try {
    // Return mock response if Supabase not configured
    if (!supabase) {
      const url = new URL(req.url);
      const invoiceId = url.searchParams.get('invoice_id');
      const amount = url.searchParams.get('amount');

      if (!invoiceId) {
        return NextResponse.json({ 
          status: 'ERROR',
          reason: 'Missing invoice_id parameter'
        }, { status: 400 });
      }

      // If this is the initial request without amount, return LNURL-pay parameters
      if (!amount) {
        return NextResponse.json({
          callback: `${url.origin}${url.pathname}?invoice_id=${invoiceId}`,
          minSendable: 1000000, // 1000 sats in millisats
          maxSendable: 1000000, // 1000 sats in millisats
          metadata: JSON.stringify([["text/plain", "Mock LNURL payment"]]),
          tag: 'payRequest',
          mode: 'mock'
        });
      }

      // Return mock Lightning invoice
      return NextResponse.json({
        pr: 'lnbc1000n1p3w9g57pp5mock-lnurl-payment-request',
        routes: [],
        successAction: {
          tag: 'message',
          message: 'Mock payment received! Thank you.'
        },
        mode: 'mock'
      });
    }

    // Get query parameters
    const url = new URL(req.url);
    const invoiceId = url.searchParams.get('invoice_id');
    const amount = url.searchParams.get('amount'); // amount in millisats from the wallet
    
    if (!invoiceId) {
      return NextResponse.json({ 
        status: 'ERROR',
        reason: 'Missing invoice_id parameter'
      }, { status: 400 });
    }
    
    // Get the invoice from the database
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();
      
    if (invoiceError || !invoice) {
      return NextResponse.json({ 
        status: 'ERROR',
        reason: 'Invoice not found'
      }, { status: 404 });
    }
    
    // Check if invoice is already paid or expired
    if (invoice.status === 'completed') {
      return NextResponse.json({ 
        status: 'ERROR',
        reason: 'Invoice already paid'
      }, { status: 400 });
    }
    
    if (invoice.status === 'expired' || (invoice.expires_at && new Date(invoice.expires_at) < new Date())) {
      return NextResponse.json({ 
        status: 'ERROR',
        reason: 'Invoice expired'
      }, { status: 400 });
    }
    
    // If this is the initial request without amount, return LNURL-pay parameters
    if (!amount) {
      const metadata = createLnurlMetadata(invoice.description);
      
      return NextResponse.json({
        callback: `${url.origin}${url.pathname}?invoice_id=${invoiceId}`,
        minSendable: invoice.amount_sats * 1000, // Convert to millisats
        maxSendable: invoice.amount_sats * 1000, // Convert to millisats
        metadata,
        tag: 'payRequest',
      });
    }
    
    // If amount is provided, validate it
    const amountSats = parseInt(amount, 10) / 1000; // Convert millisats to sats
    const expectedAmount = invoice.amount_sats;
    
    if (Math.abs(amountSats - expectedAmount) > 1) { // Allow for rounding errors
      return NextResponse.json({ 
        status: 'ERROR',
        reason: `Amount mismatch: expected ${expectedAmount} sats, got ${amountSats} sats`
      }, { status: 400 });
    }
    
    // Create the actual Lightning invoice
    const invoiceResponse = await fetch(`${LIGHTNING_NODE_URL}/api/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': LIGHTNING_API_KEY
      },
      body: JSON.stringify({
        out: false,
        amount: expectedAmount,
        memo: invoice.description,
        expiry: 300, // Short expiry for LNURL (5 minutes)
        webhook: `${url.origin}/api/webhooks/lightning`,
        extra: {
          invoice_id: invoice.id,
          tenant_id: invoice.tenant_id,
          lnurl_callback: true
        }
      })
    });
    
    if (!invoiceResponse.ok) {
      const errorText = await invoiceResponse.text();
      console.error('Failed to create Lightning invoice:', errorText);
      
      return NextResponse.json({ 
        status: 'ERROR',
        reason: 'Failed to create Lightning invoice'
      }, { status: 500 });
    }
    
    const lnInvoice = await invoiceResponse.json();
    
    // Update the payments table with the new payment request
    const { error: paymentError } = await supabase
      .from('invoice_payments')
      .insert({
        invoice_id: invoice.id,
        amount_sats: expectedAmount,
        payment_method: 'lightning',
        payment_request: lnInvoice.payment_request,
        payment_hash: lnInvoice.payment_hash,
        status: 'pending'
      });
      
    if (paymentError) {
      console.error('Failed to store payment record:', paymentError);
    }
    
    // Update the lnurl_data in the invoice
    await supabase
      .from('invoices')
      .update({
        lnurl_data: {
          ...invoice.lnurl_data,
          lnurl_payment_hash: lnInvoice.payment_hash,
          lnurl_amount: expectedAmount
        }
      })
      .eq('id', invoice.id);
    
    // Return the Lightning invoice to the wallet
    return NextResponse.json({
      pr: lnInvoice.payment_request,
      routes: [],
      successAction: {
        tag: 'message',
        message: 'Payment received! Thank you.'
      }
    });
    
  } catch (error: any) {
    console.error('Error processing LNURL-pay callback:', error);
    return NextResponse.json({ 
      status: 'ERROR',
      reason: `Server error: ${error.message}`
    }, { status: 500 });
  }
} 