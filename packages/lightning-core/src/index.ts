/**
 * @lightning-platform/core
 * 
 * Lightning Network integration package
 * 
 * Exports:
 * - LightningService: Simple wrapper compatible with admin app
 * - LNbitsClient: Advanced client with full features
 * - Types: All Lightning-related types
 */

// Export simple service (compatible with admin app)
export { LightningService } from './service';
export type { WalletConfig } from './service';

// Export advanced client
export { LNbitsClient, createLNbitsClient } from './lnbits';
export type {
  LightningInvoice,
  PaymentResult,
  PaymentMetadata,
  VaultRule,
  LNbitsConfig
} from './lnbits';

// Re-export common types for compatibility
export interface LightningConfig {
  apiUrl: string;
  adminKey: string;
}

export interface Invoice {
  paymentHash: string;
  paymentRequest: string;
  amount: number;
  memo: string;
}

export interface PaymentStatus {
  paid: boolean;
  preimage?: string;
  paymentHash: string;
}

export interface WalletBalance {
  balance: number;
  currency: string;
}

