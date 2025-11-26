/**
 * Lightning Payment API Endpoint
 * 
 * Secure Lightning Network payment processing with:
 * - Cryptographic enforcement via signAndExecute()
 * - LNbits integration with vault routing
 * - Comprehensive error handling and validation
 * - Full payment metadata for dashboard
 * - Supabase logging and audit trails
 */

import { NextRequest, NextResponse } from 'next/server';
import { lnbitsClient, PaymentMetadata } from '../../../lib/lnbits';
import { apiValidator } from '../../../api/validate';
import { logger } from '../../../lib/logger';
import { logProof } from '../../../core/crypto/proofLog';

// Request validation schema
interface SendPaymentRequest {
  payment_request: string;
  memo?: string;
  user_id: string;
  max_fee_sats?: number;
  timeout_seconds?: number;
}

// Response types
interface SendPaymentResponse {
  success: boolean;
  payment_id?: string;
  payment_hash?: string;
  preimage?: string;
  fee_sats?: number;
  amount_sats?: number;
  metadata?: PaymentMetadata;
  error?: string;
  error_code?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<SendPaymentResponse>> {
  try {
    // Validate request and extract user info
    const validation = await apiValidator.performSecurityCheck(request, 'authenticated');
    if (!validation.passed) {
      return NextResponse.json({
        success: false,
        error: validation.reason || 'Authentication failed',
        error_code: 'VALIDATION_FAILED'
      }, { status: 401 });
    }

    const body: SendPaymentRequest = await request.json();

    // Validate required fields using the validator
    const fieldValidation = apiValidator.validateRequest(body, [
      { field: 'payment_request', type: 'string', required: true, humanName: 'Payment Request' },
      { field: 'user_id', type: 'string', required: true, humanName: 'User ID' },
      { field: 'memo', type: 'string', required: false, humanName: 'Memo' },
      { field: 'max_fee_sats', type: 'number', required: false, min: 0, humanName: 'Maximum Fee' },
      { field: 'timeout_seconds', type: 'number', required: false, min: 1, max: 300, humanName: 'Timeout' }
    ]);

    if (!fieldValidation.isValid) {
      const firstError = fieldValidation.errors[0];
      return NextResponse.json({
        success: false,
        error: firstError.humanMessage,
        error_code: firstError.code
      }, { status: 400 });
    }

    // Use sanitized data
    const sanitizedData = fieldValidation.sanitizedData;

    // Validate Lightning invoice format
    if (!sanitizedData.payment_request.toLowerCase().startsWith('lnbc') && 
        !sanitizedData.payment_request.toLowerCase().startsWith('lntb') &&
        !sanitizedData.payment_request.toLowerCase().startsWith('lnbcrt')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid Lightning payment request format',
        error_code: 'INVALID_PAYMENT_REQUEST'
      }, { status: 400 });
    }

    logger.logAPI('info', 'Processing Lightning payment request', {
      method: 'POST',
      path: '/api/sendPayment',
      statusCode: 200
    }, {
      userId: sanitizedData.user_id,
      memo: sanitizedData.memo,
      maxFee: sanitizedData.max_fee_sats,
      amount: sanitizedData.amount_sats
    });

    // Decode invoice first to validate and get amount
    let decodedInvoice;
    try {
      decodedInvoice = await lnbitsClient.decodeInvoice(sanitizedData.payment_request);
    } catch (error) {
      logger.logAPI('error', 'Failed to decode Lightning invoice', {
        method: 'POST',
        path: '/api/sendPayment',
        statusCode: 400
      }, {
        error: error instanceof Error ? error.message : 'Unknown error',
        invoice: sanitizedData.payment_request.substring(0, 20) + '...'
      });

      return NextResponse.json({
        success: false,
        error: 'Invalid or expired Lightning invoice',
        error_code: 'INVALID_INVOICE'
      }, { status: 400 });
    }

    const amountSats = Math.floor(decodedInvoice.amount_msat / 1000);

    // Validate amount limits
    if (amountSats <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Payment amount must be greater than 0',
        error_code: 'INVALID_AMOUNT'
      }, { status: 400 });
    }

    // Check maximum amount limits (configurable)
    const maxPaymentSats = parseInt(process.env.MAX_PAYMENT_SATS || '1000000'); // 1M sats default
    if (amountSats > maxPaymentSats) {
      return NextResponse.json({
        success: false,
        error: `Payment amount exceeds maximum limit of ${maxPaymentSats} sats`,
        error_code: 'AMOUNT_TOO_LARGE'
      }, { status: 400 });
    }

    // Check wallet balance
    let walletBalance;
    try {
      const balanceResult = await lnbitsClient.getBalance();
      walletBalance = balanceResult.balance;
    } catch (error) {
      logger.logAPI('error', 'Failed to check wallet balance', {
        method: 'POST',
        path: '/api/sendPayment',
        statusCode: 500
      }, {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: sanitizedData.user_id
      });

      return NextResponse.json({
        success: false,
        error: 'Unable to verify wallet balance',
        error_code: 'BALANCE_CHECK_FAILED'
      }, { status: 500 });
    }

    // Estimate fee (1% of amount as rough estimate)
    const estimatedFeeSats = Math.max(1, Math.floor(amountSats * 0.01));
    const totalRequired = amountSats + estimatedFeeSats;

    if (walletBalance < totalRequired) {
      return NextResponse.json({
        success: false,
        error: `Insufficient balance. Required: ${totalRequired} sats, Available: ${walletBalance} sats`,
        error_code: 'INSUFFICIENT_BALANCE'
      }, { status: 400 });
    }

    // Check fee limits if specified
    if (sanitizedData.max_fee_sats && estimatedFeeSats > sanitizedData.max_fee_sats) {
      return NextResponse.json({
        success: false,
        error: `Estimated fee (${estimatedFeeSats} sats) exceeds maximum fee limit (${sanitizedData.max_fee_sats} sats)`,
        error_code: 'FEE_TOO_HIGH'
      }, { status: 400 });
    }

    // Log payment attempt
    await logProof({
      action: 'lightning_payment_attempt',
      user_id: sanitizedData.user_id,
      payload_json: JSON.stringify({
        amount_sats: amountSats,
        estimated_fee: estimatedFeeSats,
        memo: sanitizedData.memo,
        payment_hash: decodedInvoice.payment_hash,
        destination: decodedInvoice.destination
      }),
      timestamp: Date.now()
    });

    // Execute payment through LNbits with cryptographic signing
    let paymentResult;
    try {
      paymentResult = await lnbitsClient.sendPayment(
        sanitizedData.payment_request,
        sanitizedData.user_id,
        sanitizedData.memo
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown payment error';
      
      logger.logAPI('error', 'Lightning payment failed', {
        method: 'POST',
        path: '/api/sendPayment',
        statusCode: 500
      }, {
        error: errorMessage,
        userId: sanitizedData.user_id,
        payment_hash: decodedInvoice?.payment_hash
      });

      // Log failed payment
      await logProof({
        action: 'lightning_payment_failed',
        user_id: sanitizedData.user_id,
        payload_json: JSON.stringify({
          amount_sats: amountSats,
          error: errorMessage,
          payment_hash: decodedInvoice.payment_hash
        }),
        timestamp: Date.now()
      });

      // Determine error type and return appropriate response
      if (errorMessage.includes('insufficient')) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient funds for payment',
          error_code: 'INSUFFICIENT_FUNDS'
        }, { status: 400 });
      } else if (errorMessage.includes('route') || errorMessage.includes('path')) {
        return NextResponse.json({
          success: false,
          error: 'No route found to destination',
          error_code: 'NO_ROUTE'
        }, { status: 400 });
      } else if (errorMessage.includes('timeout')) {
        return NextResponse.json({
          success: false,
          error: 'Payment timed out',
          error_code: 'PAYMENT_TIMEOUT'
        }, { status: 408 });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Payment failed',
          error_code: 'PAYMENT_FAILED'
        }, { status: 500 });
      }
    }

    // Payment successful - return comprehensive metadata
    const response: SendPaymentResponse = {
      success: true,
      payment_id: paymentResult.payment.checking_id,
      payment_hash: paymentResult.payment.payment_hash,
      preimage: paymentResult.payment.payment_preimage,
      fee_sats: paymentResult.payment.fee,
      amount_sats: amountSats,
      metadata: paymentResult.metadata
    };

    logger.logAPI('info', 'Lightning payment completed successfully', {
      method: 'POST',
      path: '/api/sendPayment',
      statusCode: 200
    }, {
      userId: sanitizedData.user_id,
      amount: amountSats,
      payment_hash: decodedInvoice?.payment_hash,
      fee: paymentResult.payment.fee || 0
    });

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    
    logger.logAPI('error', 'Unexpected error in sendPayment endpoint', {
      method: 'POST',
      path: '/api/sendPayment',
      statusCode: 500
    }, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      error_code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

// GET endpoint for payment status checking
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('payment_id');

    if (!paymentId) {
      return NextResponse.json({
        success: false,
        error: 'Payment ID is required',
        error_code: 'MISSING_PAYMENT_ID'
      }, { status: 400 });
    }

    // Validate request
    const validation = await apiValidator.performSecurityCheck(request, 'authenticated');
    if (!validation.passed) {
      return NextResponse.json({
        success: false,
        error: validation.reason || 'Authentication failed',
        error_code: 'VALIDATION_FAILED'
      }, { status: 401 });
    }

    // Check payment status
    const paymentStatus = await lnbitsClient.checkPaymentStatus(paymentId);

    if (!paymentStatus) {
      return NextResponse.json({
        success: false,
        error: 'Payment not found',
        error_code: 'PAYMENT_NOT_FOUND'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      payment: paymentStatus
    }, { status: 200 });

  } catch (error) {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('payment_id');
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    
    logger.logAPI('error', 'Error checking payment status', {
      method: 'GET',
      path: '/api/sendPayment',
      statusCode: 500
    }, {
      error: error instanceof Error ? error.message : 'Unknown error',
      paymentId: paymentId || 'unknown'
    });

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      error_code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
} 