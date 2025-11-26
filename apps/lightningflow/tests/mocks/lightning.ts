/**
 * Mock Lightning Node
 * 
 * This module provides a mock implementation of a Lightning node for testing purposes.
 * It simulates the behavior of a real Lightning node without requiring an actual connection.
 */

import { EventEmitter } from 'events';

interface MockInvoice {
  id: string;
  payment_hash: string;
  payment_request: string;
  amount: number;
  description: string;
  status: 'pending' | 'paid' | 'expired';
  created_at: Date;
  expires_at: Date;
}

interface MockChannel {
  channel_id: string;
  remote_pubkey: string;
  capacity: number;
  local_balance: number;
  remote_balance: number;
  active: boolean;
}

interface MockLightningNode {
  // Node info
  getInfo: () => Promise<any>;
  getBalance: () => Promise<{ total_balance: number; confirmed_balance: number; unconfirmed_balance: number }>;
  
  // Invoice operations
  createInvoice: (amount: number, description: string) => Promise<MockInvoice>;
  getInvoice: (paymentHash: string) => Promise<MockInvoice>;
  listInvoices: () => Promise<MockInvoice[]>;
  payInvoice: (paymentRequest: string) => Promise<any>;
  
  // Channel operations
  listChannels: () => Promise<MockChannel[]>;
  openChannel: (pubkey: string, amount: number) => Promise<MockChannel>;
  closeChannel: (channelId: string) => Promise<boolean>;
  
  // Event emitter for simulating payments
  events: EventEmitter;
  
  // Cleanup resources
  cleanup: () => Promise<void>;
}

/**
 * Create a mock Lightning node for testing
 */
export function setupMockLightningNode(): MockLightningNode {
  const invoices: Record<string, MockInvoice> = {};
  const channels: Record<string, MockChannel> = {};
  const events = new EventEmitter();
  
  // Generate a random payment hash
  const generatePaymentHash = () => {
    return Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };
  
  // Generate a mock payment request
  const generatePaymentRequest = (amount: number, hash: string) => {
    return `lnbc${amount}n1p38q3g0sp5d7evpk9g5r9yw4jypj7qvzmc9p39lhjd4xdt8dpl5j' +
      '6wa5hjl8sdqqcqzpgsp5f4c4jsnp5uytgpeyjvd5g3gj0mjnzxf4h4mfmg3y2r3qlsrfvs9qy9qsqf5jlt2g5el' +
      'lkzsxn5mmgzqh5kn0fr7mnwjlh0smx8g42ksmdzlj3xjdlrtzuja7h0vgqus0aadem3mahwwgpj3jmw9uhw3gqj0wnry`;
  };
  
  // Mock node implementation
  const mockNode: MockLightningNode = {
    // Node info
    getInfo: async () => {
      return {
        identity_pubkey: '03abc...mock...pubkey...xyz',
        alias: 'Mock Lightning Node',
        num_active_channels: Object.values(channels).filter(c => c.active).length,
        num_peers: Object.values(channels).length,
        block_height: 700000,
        synced_to_chain: true
      };
    },
    
    getBalance: async () => {
      const totalBalance = Object.values(channels).reduce((sum, channel) => sum + channel.local_balance, 0);
      return {
        total_balance: totalBalance,
        confirmed_balance: totalBalance,
        unconfirmed_balance: 0
      };
    },
    
    // Invoice operations
    createInvoice: async (amount: number, description: string) => {
      const paymentHash = generatePaymentHash();
      const invoice: MockInvoice = {
        id: `invoice_${Date.now()}`,
        payment_hash: paymentHash,
        payment_request: generatePaymentRequest(amount, paymentHash),
        amount,
        description,
        status: 'pending',
        created_at: new Date(),
        expires_at: new Date(Date.now() + 3600 * 1000) // 1 hour expiry
      };
      
      invoices[paymentHash] = invoice;
      return invoice;
    },
    
    getInvoice: async (paymentHash: string) => {
      const invoice = invoices[paymentHash];
      if (!invoice) {
        throw new Error(`Invoice with payment hash ${paymentHash} not found`);
      }
      return invoice;
    },
    
    listInvoices: async () => {
      return Object.values(invoices);
    },
    
    payInvoice: async (paymentRequest: string) => {
      // Simulate payment
      const paymentHash = generatePaymentHash();
      
      // Find any pending invoices and mark one as paid
      const pendingInvoices = Object.values(invoices).filter(i => i.status === 'pending');
      if (pendingInvoices.length > 0) {
        const invoice = pendingInvoices[0];
        invoice.status = 'paid';
        
        // Emit payment event
        events.emit('payment', {
          payment_hash: invoice.payment_hash,
          payment_request: invoice.payment_request,
          amount: invoice.amount,
          status: 'complete'
        });
      }
      
      return {
        payment_hash: paymentHash,
        payment_preimage: generatePaymentHash(),
        payment_route: {
          total_amt: 1000,
          total_fees: 1
        },
        status: 'SUCCEEDED'
      };
    },
    
    // Channel operations
    listChannels: async () => {
      return Object.values(channels);
    },
    
    openChannel: async (pubkey: string, amount: number) => {
      const channelId = `chan_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const channel: MockChannel = {
        channel_id: channelId,
        remote_pubkey: pubkey,
        capacity: amount,
        local_balance: amount,
        remote_balance: 0,
        active: true
      };
      
      channels[channelId] = channel;
      return channel;
    },
    
    closeChannel: async (channelId: string) => {
      if (channels[channelId]) {
        delete channels[channelId];
        return true;
      }
      return false;
    },
    
    // Event emitter for simulating payments
    events,
    
    // Cleanup resources
    cleanup: async () => {
      events.removeAllListeners();
    }
  };
  
  return mockNode;
} 