/**
 * LNbits Integration Usage Examples
 * 
 * Demonstrates how to use the Lightning AI Business Node Platform's
 * LNbits integration with cryptographic enforcement and comprehensive logging.
 */

import { lnbitsClient } from '../lnbits';
import { logger } from '../logger';

// Example 1: Creating a Lightning Invoice
export async function createLightningInvoiceExample() {
  try {
    const userId = 'user_123';
    const amount = 10000; // 10,000 sats
    const memo = 'Payment for AI services';
    const expiry = 3600; // 1 hour

    console.log('Creating Lightning invoice...');
    
    const result = await lnbitsClient.createInvoice(amount, memo, userId, expiry);
    
    console.log('Invoice created successfully:');
    console.log('- Payment Request:', result.invoice.payment_request);
    console.log('- Payment Hash:', result.invoice.payment_hash);
    console.log('- Checking ID:', result.invoice.checking_id);
    console.log('- Amount:', result.invoice.amount, 'sats');
    console.log('- Cryptographic Proof:', result.metadata.cryptographic_proof);
    
    return result;
  } catch (error) {
    console.error('Failed to create invoice:', error);
    throw error;
  }
}

// Example 2: Sending a Lightning Payment
export async function sendLightningPaymentExample() {
  try {
    const userId = 'user_123';
    const paymentRequest = 'lnbc100u1p3...'; // Lightning invoice
    const memo = 'Payment to vendor';

    console.log('Sending Lightning payment...');
    
    const result = await lnbitsClient.sendPayment(paymentRequest, userId, memo);
    
    console.log('Payment sent successfully:');
    console.log('- Payment ID:', result.payment.checking_id);
    console.log('- Payment Hash:', result.payment.payment_hash);
    console.log('- Preimage:', result.payment.payment_preimage);
    console.log('- Fee:', result.payment.fee, 'sats');
    console.log('- Amount:', result.metadata.amount, 'sats');
    console.log('- Vault Routed:', result.metadata.vault_routed);
    console.log('- Cryptographic Proof:', result.metadata.cryptographic_proof);
    
    return result;
  } catch (error) {
    console.error('Failed to send payment:', error);
    throw error;
  }
}

// Example 3: Checking Payment Status
export async function checkPaymentStatusExample() {
  try {
    const checkingId = 'payment_checking_id_123';
    
    console.log('Checking payment status...');
    
    const status = await lnbitsClient.checkPaymentStatus(checkingId);
    
    if (status) {
      console.log('Payment status:');
      console.log('- Status:', 'Completed'); // Payment exists means it's completed
      console.log('- Amount:', status.amount, 'sats');
      console.log('- Fee:', status.fee, 'sats');
      console.log('- Payment Hash:', status.payment_hash);
      if (status.payment_preimage) {
        console.log('- Preimage:', status.payment_preimage);
      }
    } else {
      console.log('Payment not found');
    }
    
    return status;
  } catch (error) {
    console.error('Failed to check payment status:', error);
    throw error;
  }
}

// Example 4: Getting Wallet Balance
export async function getWalletBalanceExample() {
  try {
    console.log('Getting wallet balance...');
    
    const balance = await lnbitsClient.getBalance();
    
    console.log('Wallet balance:', balance.balance, 'sats');
    
    return balance;
  } catch (error) {
    console.error('Failed to get wallet balance:', error);
    throw error;
  }
}

// Example 5: Getting Payment History
export async function getPaymentHistoryExample() {
  try {
    const limit = 10;
    
    console.log('Getting payment history...');
    
    const payments = await lnbitsClient.getPaymentHistory(limit);
    
    console.log(`Found ${payments.length} payments:`);
    payments.forEach((payment, index) => {
      console.log(`${index + 1}. ${payment.memo || 'No memo'}`);
      console.log(`   Amount: ${payment.amount} sats`);
      console.log(`   Fee: ${payment.fee} sats`);
      console.log(`   Status: Completed`); // Payment exists means it's completed
      console.log(`   Hash: ${payment.payment_hash}`);
      console.log('');
    });
    
    return payments;
  } catch (error) {
    console.error('Failed to get payment history:', error);
    throw error;
  }
}

// Example 6: Using the API Endpoint
export async function sendPaymentViaAPIExample() {
  try {
    const paymentData = {
      payment_request: 'lnbc100u1p3...', // Lightning invoice
      memo: 'API payment test',
      user_id: 'user_123',
      max_fee_sats: 100,
      timeout_seconds: 60
    };

    console.log('Sending payment via API...');
    
    const response = await fetch('/api/sendPayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your_jwt_token'
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Payment sent successfully via API:');
      console.log('- Payment ID:', result.payment_id);
      console.log('- Payment Hash:', result.payment_hash);
      console.log('- Fee:', result.fee_sats, 'sats');
      console.log('- Amount:', result.amount_sats, 'sats');
      console.log('- Metadata:', result.metadata);
    } else {
      console.error('Payment failed:', result.error);
      console.error('Error Code:', result.error_code);
    }
    
    return result;
  } catch (error) {
    console.error('Failed to send payment via API:', error);
    throw error;
  }
}

// Example 7: Checking Payment Status via API
export async function checkPaymentStatusViaAPIExample() {
  try {
    const paymentId = 'payment_checking_id_123';
    
    console.log('Checking payment status via API...');
    
    const response = await fetch(`/api/sendPayment?payment_id=${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer your_jwt_token'
      }
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Payment status retrieved via API:');
      console.log('- Payment:', result.payment);
    } else {
      console.error('Failed to get payment status:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Failed to check payment status via API:', error);
    throw error;
  }
}

// Example 8: Complete Payment Flow with Error Handling
export async function completePaymentFlowExample() {
  try {
    const userId = 'user_123';
    
    // Step 1: Check wallet balance
    console.log('Step 1: Checking wallet balance...');
    const balance = await lnbitsClient.getBalance();
    console.log(`Current balance: ${balance.balance} sats`);
    
    if (balance.balance < 1000) {
      throw new Error('Insufficient balance for payment');
    }
    
    // Step 2: Create an invoice (for demonstration)
    console.log('Step 2: Creating test invoice...');
    const invoice = await lnbitsClient.createInvoice(
      1000, 
      'Test payment flow', 
      userId
    );
    console.log(`Invoice created: ${invoice.invoice.payment_request}`);
    
    // Step 3: Send payment to the invoice
    console.log('Step 3: Sending payment...');
    const payment = await lnbitsClient.sendPayment(
      invoice.invoice.payment_request,
      userId,
      'Self-payment test'
    );
    console.log(`Payment sent: ${payment.payment.checking_id}`);
    
    // Step 4: Check payment status
    console.log('Step 4: Checking payment status...');
    const status = await lnbitsClient.checkPaymentStatus(payment.payment.checking_id);
    console.log(`Payment status: ${status ? 'Completed' : 'Not Found'}`); // Payment exists means it's completed
    
    // Step 5: Get updated balance
    console.log('Step 5: Getting updated balance...');
    const newBalance = await lnbitsClient.getBalance();
    console.log(`New balance: ${newBalance.balance} sats`);
    
    console.log('Payment flow completed successfully!');
    
    return {
      invoice,
      payment,
      status,
      balanceBefore: balance.balance,
      balanceAfter: newBalance.balance
    };
    
  } catch (error) {
    console.error('Payment flow failed:', error);
    throw error;
  }
}

// Example 9: Environment Configuration Check
export function checkLNbitsConfigurationExample() {
  console.log('Checking LNbits configuration...');
  
  const requiredEnvVars = [
    'LNBITS_URL',
    'LNBITS_ADMIN_KEY',
    'LNBITS_INVOICE_KEY',
    'LNBITS_READ_KEY',
    'LNBITS_WALLET_ID'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`- ${varName}`);
    });
    return false;
  }
  
  console.log('LNbits configuration is complete!');
  console.log('- URL:', process.env.LNBITS_URL);
  console.log('- Wallet ID:', process.env.LNBITS_WALLET_ID);
  console.log('- Admin Key:', process.env.LNBITS_ADMIN_KEY ? 'Set' : 'Missing');
  console.log('- Invoice Key:', process.env.LNBITS_INVOICE_KEY ? 'Set' : 'Missing');
  console.log('- Read Key:', process.env.LNBITS_READ_KEY ? 'Set' : 'Missing');
  
  return true;
}

// Example 10: Error Handling Patterns
export async function errorHandlingExample() {
  try {
    // This will fail with insufficient balance
    const result = await lnbitsClient.sendPayment(
      'lnbc1000000u1p3...', // Large amount invoice
      'user_123',
      'This will fail'
    );
    
    console.log('Unexpected success:', result);
    
  } catch (error) {
    if (error instanceof Error) {
      console.log('Handling payment error:');
      console.log('- Error message:', error.message);
      
      // Handle specific error types
      if (error.message.includes('insufficient')) {
        console.log('- Error type: Insufficient funds');
        console.log('- Suggested action: Add funds to wallet');
      } else if (error.message.includes('route')) {
        console.log('- Error type: No route found');
        console.log('- Suggested action: Try again later or different amount');
      } else if (error.message.includes('timeout')) {
        console.log('- Error type: Payment timeout');
        console.log('- Suggested action: Retry with longer timeout');
      } else {
        console.log('- Error type: Unknown');
        console.log('- Suggested action: Check logs and contact support');
      }
    }
  }
}

// Export all examples for easy testing
export const examples = {
  createInvoice: createLightningInvoiceExample,
  sendPayment: sendLightningPaymentExample,
  checkStatus: checkPaymentStatusExample,
  getBalance: getWalletBalanceExample,
  getHistory: getPaymentHistoryExample,
  sendViaAPI: sendPaymentViaAPIExample,
  checkStatusViaAPI: checkPaymentStatusViaAPIExample,
  completeFlow: completePaymentFlowExample,
  checkConfig: checkLNbitsConfigurationExample,
  errorHandling: errorHandlingExample
}; 