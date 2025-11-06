/**
 * LightningService - Simple wrapper compatible with @lightning-platform/core
 * This provides a simple interface that matches the lightningflow admin app expectations
 * Uses direct API calls to LNbits instead of a package dependency
 */

export interface WalletConfig {
  id: string;
  adminKey: string;
  invoiceKey: string;
  name: string;
}

export class LightningService {
  private apiUrl: string;
  private adminKey: string;
  private baseHeaders: Record<string, string>;
  
  constructor(apiUrl: string, adminKey: string) {
    this.apiUrl = apiUrl.replace(/\/$/, '');
    this.adminKey = adminKey;
    this.baseHeaders = {
      'Content-Type': 'application/json',
      'X-Api-Key': adminKey,
    };
  }

  async createWallet(name: string): Promise<WalletConfig> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/wallets`, {
        method: 'POST',
        headers: this.baseHeaders,
        body: JSON.stringify({ name, admin_key: true })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create wallet: ${response.status} - ${errorText}`);
      }

      const wallet = await response.json();
      return {
        id: wallet.id,
        adminKey: wallet.adminkey,
        invoiceKey: wallet.inkey,
        name: name
      };
    } catch (error: any) {
      throw new Error(`Failed to create wallet: ${error.message}`);
    }
  }

  async createInvoice(walletId: string, amount: number, memo: string) {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/payments`, {
        method: 'POST',
        headers: this.baseHeaders,
        body: JSON.stringify({
          out: false,
          amount: amount,
          memo: memo
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create invoice: ${response.status} - ${errorText}`);
      }

      const invoice = await response.json();
      return {
        paymentHash: invoice.payment_hash,
        paymentRequest: invoice.payment_request,
        amount: amount,
        memo: memo
      };
    } catch (error: any) {
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }

  async checkInvoice(paymentHash: string) {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/payments/${paymentHash}`, {
        headers: this.baseHeaders
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { paid: false, paymentHash };
        }
        const errorText = await response.text();
        throw new Error(`Failed to check invoice: ${response.status} - ${errorText}`);
      }

      const status = await response.json();
      return {
        paid: status.paid || false,
        preimage: status.preimage,
        paymentHash: paymentHash
      };
    } catch (error: any) {
      throw new Error(`Failed to check invoice: ${error.message}`);
    }
  }

  async getWalletBalance(walletId: string) {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/wallet`, {
        headers: this.baseHeaders
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get wallet balance: ${response.status} - ${errorText}`);
      }

      const wallet = await response.json();
      return {
        balance: wallet.balance || 0,
        currency: 'sats'
      };
    } catch (error: any) {
      throw new Error(`Failed to get wallet balance: ${error.message}`);
    }
  }

  async payInvoice(walletId: string, bolt11: string) {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/payments`, {
        method: 'POST',
        headers: this.baseHeaders,
        body: JSON.stringify({
          out: true,
          bolt11: bolt11
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to pay invoice: ${response.status} - ${errorText}`);
      }

      const payment = await response.json();
      return {
        paid: true,
        paymentHash: payment.payment_hash,
        preimage: payment.preimage
      };
    } catch (error: any) {
      throw new Error(`Failed to pay invoice: ${error.message}`);
    }
  }
}

