/**
 * Lightning Network Interface
 * Provides abstraction for interacting with Lightning Network nodes (LNbits/LND)
 */

import { encodeLnurl } from '../lnurl';

// Lightning Node Configuration
const LIGHTNING_NODE_URL = process.env.LIGHTNING_NODE_URL || '';
const LIGHTNING_API_KEY = process.env.LIGHTNING_API_KEY || '';
const LNBITS_ADMIN_KEY = process.env.LNBITS_ADMIN_KEY || '';
const LNBITS_INVOICE_READ_KEY = process.env.LNBITS_INVOICE_READ_KEY || '';
const WEBHOOK_URL = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/lightning` : '';

// Interfaces
export interface LightningInvoice {
  payment_hash: string;
  payment_request: string;
  checking_id: string;
  lnurl_response?: string;
  success?: boolean;
  error?: string;
}

export interface InvoiceStatus {
  paid: boolean;
  preimage?: string;
  details?: {
    fee: number;
    path?: string[];
    memo?: string;
    [key: string]: any;
  };
}

/**
 * Creates a Lightning invoice using LNbits
 */
export async function createLightningInvoice(
  amount: number,
  description: string = 'Lightning AI Platform Invoice',
  expiry: number = 3600,
  webhook?: string
): Promise<LightningInvoice> {
  try {
    const response = await fetch(`${LIGHTNING_NODE_URL}/api/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': LIGHTNING_API_KEY
      },
      body: JSON.stringify({
        out: false,
        amount,
        memo: description,
        webhook: webhook || WEBHOOK_URL,
        // Internal reference for webhook handling
        extra: {
          tag: 'lightning-platform',
          source: 'invoice',
          description
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error creating invoice: ${error}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Failed to create Lightning invoice:', error);
    throw new Error(`Failed to create Lightning invoice: ${error.message}`);
  }
}

/**
 * Check invoice payment status
 */
export async function checkInvoiceStatus(paymentHash: string): Promise<InvoiceStatus> {
  try {
    const response = await fetch(`${LIGHTNING_NODE_URL}/api/v1/payments/${paymentHash}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': LNBITS_INVOICE_READ_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Error checking invoice: ${await response.text()}`);
    }

    const data = await response.json();
    return {
      paid: data.paid,
      preimage: data.preimage,
      details: data.details || {}
    };
  } catch (error: any) {
    console.error('Failed to check invoice status:', error);
    throw new Error(`Failed to check invoice status: ${error.message}`);
  }
}

/**
 * Create an LNURL for a payment
 */
export async function createLnurlPay(
  amount: number,
  description: string,
  metadata?: any,
  callback?: string
): Promise<string> {
  // Generate a unique reference ID
  const referenceId = generateReferenceId();
  
  // In a real implementation, we would store this reference in the database
  // along with the amount, description, and metadata
  
  // Create a callback URL with the reference ID
  const callbackUrl = callback || `${process.env.NEXT_PUBLIC_APP_URL}/api/lnurl-pay/${referenceId}`;
  
  // Encode the callback URL as an LNURL
  return encodeLnurl(callbackUrl);
}

/**
 * Generate a unique reference ID for LNURL
 */
function generateReferenceId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Pay a Lightning invoice
 */
export async function payLightningInvoice(bolt11: string, maxFee: number = 10): Promise<any> {
  try {
    const response = await fetch(`${LIGHTNING_NODE_URL}/api/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': LNBITS_ADMIN_KEY
      },
      body: JSON.stringify({
        out: true,
        bolt11,
        fee_limit_msat: maxFee * 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Error paying invoice: ${await response.text()}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Failed to pay Lightning invoice:', error);
    throw new Error(`Failed to pay Lightning invoice: ${error.message}`);
  }
}

/**
 * Get node info
 */
export async function getNodeInfo(): Promise<any> {
  try {
    const response = await fetch(`${LIGHTNING_NODE_URL}/api/v1/wallet`, {
      method: 'GET',
      headers: {
        'X-Api-Key': LNBITS_ADMIN_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Error getting node info: ${await response.text()}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Failed to get node info:', error);
    throw new Error(`Failed to get node info: ${error.message}`);
  }
} 