/**
 * Lightning Payment Webhook Endpoint
 * 
 * Handles payment notifications from LNbits for:
 * - Real-time payment status updates
 * - Invoice settlement notifications
 * - Payment failure notifications
 * - Comprehensive logging and audit trails
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../../../../lib/logger';
import { logProof } from '../../../../core/crypto/proofLog';
import { createClient } from '@/lib/supabase/server';

// Webhook payload types
interface LightningWebhookPayload {
  checking_id: string;
  payment_hash: string;
  payment_request?: string;
  amount: number;
  fee?: number;
  memo: string;
  time: number;
  bolt11: string;
  preimage?: string;
  pending: boolean;
  extra?: Record<string, any>;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify webhook authenticity (basic security)
    const webhookSecret = process.env.LNBITS_WEBHOOK_SECRET;
    if (webhookSecret) {
      const providedSecret = request.headers.get('x-webhook-secret');
      if (providedSecret !== webhookSecret) {
        logger.logAPI('warn', 'Invalid webhook secret provided', {
          method: 'POST',
          path: '/api/webhooks/lightning',
          statusCode: 401
        }, {
          category: 'lightning',
          providedSecret: providedSecret ? 'provided' : 'missing'
        });
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const payload: LightningWebhookPayload = await request.json();

    logger.logAPI('info', 'Received Lightning webhook notification', {
      method: 'POST',
      path: '/api/webhooks/lightning',
      statusCode: 200
    }, {
      category: 'lightning',
      checking_id: payload.checking_id,
      payment_hash: payload.payment_hash,
      amount: payload.amount,
      pending: payload.pending
    });

    // Determine payment status
    const status = payload.pending ? 'pending' : 'completed';
    const isIncoming = !payload.payment_request; // Incoming payments don't have payment_request

    // Initialize userId outside try block
    let userId = 'system';

    // TODO: Update payment status in Supabase database
    try {
      const supabase = createClient();
      
      // 1. Finding the payment record by checking_id or payment_hash
      let paymentRecord = null;

      // First, try to find in LNURL withdrawal sessions
      const { data: withdrawalSession } = await supabase
        .from('lnurl_withdraw_sessions')
        .select('*')
        .eq('payment_hash', payload.payment_hash)
        .single();

      if (withdrawalSession) {
        paymentRecord = {
          type: 'withdrawal',
          record: withdrawalSession
        };
        userId = withdrawalSession.user_id;
      }

      // If not found, check invoices table
      if (!paymentRecord) {
        const { data: invoice } = await supabase
          .from('invoices')
          .select('*')
          .eq('payment_hash', payload.payment_hash)
          .single();

        if (invoice) {
          paymentRecord = {
            type: 'invoice',
            record: invoice
          };
          userId = invoice.user_id;
        }
      }

      // If not found, check payments table
      if (!paymentRecord) {
        const { data: payment } = await supabase
          .from('payments')
          .select('*')
          .or(`checking_id.eq.${payload.checking_id},payment_hash.eq.${payload.payment_hash}`)
          .single();

        if (payment) {
          paymentRecord = {
            type: 'payment',
            record: payment
          };
          userId = payment.user_id;
        }
      }

      // 2. Updating the status, preimage, and settlement time
      if (paymentRecord) {
        const updateData = {
          status: payload.pending ? 'pending' : 'completed',
          payment_preimage: payload.preimage,
          settled_at: payload.pending ? null : new Date().toISOString(),
          fee_paid_msat: payload.fee || 0
        };

        if (paymentRecord.type === 'withdrawal') {
          await supabase
            .from('lnurl_withdraw_sessions')
            .update(updateData)
            .eq('payment_hash', payload.payment_hash);
        } else if (paymentRecord.type === 'invoice') {
          await supabase
            .from('invoices')
            .update(updateData)
            .eq('payment_hash', payload.payment_hash);
        } else if (paymentRecord.type === 'payment') {
          await supabase
            .from('payments')
            .update(updateData)
            .eq('payment_hash', payload.payment_hash);
        }

        // 3. Triggering business logic for completed payments
        if (!payload.pending) {
          // Record analytics event
          await supabase
            .from('user_analytics')
            .insert({
              user_id: userId,
              event_type: isIncoming ? 'lightning_received' : 'lightning_sent',
              event_data: {
                payment_hash: payload.payment_hash,
                amount_sats: Math.floor(payload.amount / 1000),
                fee_msat: payload.fee || 0,
                memo: payload.memo,
                payment_type: paymentRecord.type
              },
              created_at: new Date().toISOString()
            });

          // Update user balance cache if exists
          if (isIncoming) {
            // For incoming payments, update balance
            const balanceChange = Math.floor(payload.amount / 1000); // Convert msat to sats
            await supabase
              .from('user_balances')
              .upsert({
                user_id: userId,
                balance_sats: balanceChange,
                last_updated: new Date().toISOString()
              }, {
                onConflict: 'user_id',
                ignoreDuplicates: false
              });
          }

          // Send notification if enabled
          const { data: userSettings } = await supabase
            .from('user_settings')
            .select('lightning_notifications')
            .eq('user_id', userId)
            .single();

          if (userSettings?.lightning_notifications !== false) {
            // Queue notification (you could implement this with a job queue)
            await supabase
              .from('notification_queue')
              .insert({
                user_id: userId,
                type: isIncoming ? 'lightning_received' : 'lightning_sent',
                title: isIncoming ? 'Lightning Payment Received' : 'Lightning Payment Sent',
                message: `${isIncoming ? 'Received' : 'Sent'} ${Math.floor(payload.amount / 1000)} sats`,
                data: {
                  payment_hash: payload.payment_hash,
                  amount_sats: Math.floor(payload.amount / 1000)
                },
                created_at: new Date().toISOString()
              });
          }
        }

        logger.logSystem('info', 'Payment status updated successfully', {
          paymentHash: payload.payment_hash,
          userId,
          status: payload.pending ? 'pending' : 'completed',
          paymentType: paymentRecord.type,
          amount: payload.amount
        });

      } else {
        // Payment not found in our database - log for investigation
        logger.logSystem('warn', 'Webhook received for unknown payment', {
          paymentHash: payload.payment_hash,
          checkingId: payload.checking_id,
          amount: payload.amount,
          memo: payload.memo
        });
        
        // Create orphaned payment record for manual reconciliation
        await supabase
          .from('orphaned_payments')
          .insert({
            payment_hash: payload.payment_hash,
            checking_id: payload.checking_id,
            amount_msat: payload.amount,
            fee_msat: payload.fee || 0,
            memo: payload.memo,
            preimage: payload.preimage,
            is_incoming: isIncoming,
            status: payload.pending ? 'pending' : 'completed',
            webhook_received_at: new Date().toISOString(),
            raw_payload: JSON.stringify(payload)
          });
      }

    } catch (dbError) {
      logger.logSystem('error', 'Failed to update payment status in database', {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
        paymentHash: payload.payment_hash,
        checkingId: payload.checking_id
      });
      
      // Don't fail the webhook - LNbits will retry
      // But log the failure for manual processing
    }

    // Update the proof log with actual user ID
    await logProof({
      action: isIncoming ? 'lightning_invoice_settled' : 'lightning_payment_confirmed',
      user_id: userId,
      payload_json: JSON.stringify({
        checking_id: payload.checking_id,
        payment_hash: payload.payment_hash,
        amount: payload.amount,
        fee: payload.fee || 0,
        status: status,
        preimage: payload.preimage,
        memo: payload.memo,
        is_incoming: isIncoming
      }),
      timestamp: Date.now()
    });

    logger.logAPI('info', 'Lightning webhook processed successfully', {
      method: 'POST',
      path: '/api/webhooks/lightning',
      statusCode: 200
    }, {
      checkingId: payload.checking_id,
      status: status,
      isIncoming: isIncoming,
      category: 'lightning'
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown webhook error';
    
    logger.logAPI('error', 'Failed to process Lightning webhook', {
      method: 'POST',
      path: '/api/webhooks/lightning',
      statusCode: 500
    }, {
      error: errorMessage,
      category: 'lightning'
    });

    return NextResponse.json({
      success: false,
      error: 'Webhook processing failed'
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'healthy',
    service: 'lightning-webhook',
    timestamp: new Date().toISOString()
  }, { status: 200 });
} 