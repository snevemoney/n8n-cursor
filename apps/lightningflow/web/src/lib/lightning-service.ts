import { createHash } from 'crypto';
import axios from 'axios';

/**
 * Interface for standard Lightning Network operations
 * This provides a consistent API regardless of the underlying implementation
 * (LND, Core Lightning, Eclair, etc.)
 */
interface LightningService {
  // Invoice operations
  createInvoice: (options: CreateInvoiceOptions) => Promise<Invoice>;
  getInvoice: (paymentHash: string) => Promise<Invoice>;
  listInvoices: (options?: ListInvoicesOptions) => Promise<Invoice[]>;
  
  // Payment operations
  decodePaymentRequest: (options: { request: string }) => Promise<DecodedPaymentRequest>;
  payViaPaymentRequest: (options: PaymentOptions) => Promise<PaymentResult>;
  listPayments: (options?: ListPaymentsOptions) => Promise<Payment[]>;
  
  // Channel operations
  listChannels: () => Promise<Channel[]>;
  openChannel: (options: OpenChannelOptions) => Promise<Channel>;
  closeChannel: (options: CloseChannelOptions) => Promise<ChannelCloseResult>;
  
  // Node operations
  getNodeInfo: () => Promise<NodeInfo>;
  getNetworkInfo: () => Promise<NetworkInfo>;
  
  // Forwarding/Routing operations
  listForwardingEvents: (options?: ListForwardingOptions) => Promise<ForwardingEvent[]>;
  setChannelFee: (options: SetChannelFeeOptions) => Promise<void>;
}

// Type definitions

interface CreateInvoiceOptions {
  tokens: number;
  description: string;
  expires_at?: string | Date;
  is_private?: boolean;
}

interface Invoice {
  id: string; // payment_hash
  request: string; // encoded payment request
  description: string;
  tokens: number;
  is_confirmed: boolean;
  confirmed_at?: string;
  expires_at: string;
  received_mtokens?: string;
}

interface ListInvoicesOptions {
  limit?: number;
  is_confirmed?: boolean;
  created_after?: string | Date;
  created_before?: string | Date;
}

interface DecodedPaymentRequest {
  id: string; // payment_hash
  chain_address?: string;
  cltv_delta?: number;
  description: string;
  description_hash?: string;
  destination: string;
  expires_at: string;
  features?: Record<string, unknown>;
  mtokens?: string;
  payment?: string;
  routes?: Array<{
    base_fee_mtokens?: string;
    channel?: string;
    cltv_delta?: number;
    fee_rate?: number;
    public_key: string;
  }>[];
  tokens: number;
}

interface PaymentOptions {
  request: string;
  max_fee?: number;
  timeout_seconds?: number;
  fee_limit_msat?: number;
}

interface PaymentResult {
  id: string; // payment_hash
  is_confirmed: boolean;
  is_failed?: boolean;
  fee?: number;
  fee_mtokens?: string;
  mtokens?: string;
  hops?: Array<{
    channel: string;
    channel_capacity: number;
    fee_mtokens: string;
    forward_mtokens: string;
    public_key: string;
    timeout: number;
  }>;
  payment?: string; // preimage
  timeout_seconds?: number;
  tokens?: number;
}

interface Channel {
  id: string;
  capacity: number;
  local_balance: number;
  remote_balance: number;
  remote_pubkey: string;
  commit_fee: number;
  is_active: boolean;
  is_private: boolean;
  is_closing: boolean;
  is_opening: boolean;
  total_satoshis_sent: number;
  total_satoshis_received: number;
  updates?: number;
  base_fee_msat?: number;
  fee_rate_per_mil?: number;
}

interface OpenChannelOptions {
  local_tokens: number;
  partner_public_key: string;
  chain_fee_tokens_per_vbyte?: number;
  give_tokens?: number;
  is_private?: boolean;
}

interface CloseChannelOptions {
  id: string; // channel_id
  is_force_close?: boolean;
  target_fee_per_vbyte?: number;
}

interface ChannelCloseResult {
  transaction_id: string;
  transaction_vout: number;
}

interface NodeInfo {
  alias: string;
  color?: string;
  public_key: string;
  is_synced_to_chain?: boolean;
  is_synced_to_graph?: boolean;
  peers_count?: number;
  active_channels_count?: number;
  pending_channels_count?: number;
  version?: string;
}

interface NetworkInfo {
  average_channel_size?: number;
  channel_count?: number;
  max_channel_size?: number;
  median_channel_size?: number;
  min_channel_size?: number;
  node_count?: number;
  total_capacity?: number;
}

interface ListForwardingOptions {
  after?: string;
  before?: string;
  limit?: number;
}

interface ForwardingEvent {
  created_at: string;
  fee: number;
  fee_mtokens: string;
  incoming_channel: string;
  mtokens: string;
  outgoing_channel: string;
  tokens: number;
}

interface SetChannelFeeOptions {
  id?: string; // channel_id
  base_fee_msat?: number;
  fee_rate_per_mil?: number;
  global?: boolean;
}

interface Payment {
  id: string; // payment_hash
  created_at: string;
  destination: string;
  fee?: number;
  hops?: string[];
  mtokens?: string;
  request?: string; // payment request
  safe_fee?: number;
  safe_tokens?: number;
  status: 'SUCCEEDED' | 'FAILED' | 'PENDING';
  tokens?: number;
}

interface ListPaymentsOptions {
  limit?: number;
  created_after?: string;
  created_before?: string;
  include_failed?: boolean;
}

/**
 * LND implementation of the Lightning Service
 */
class LndService implements LightningService {
  private readonly host: string;
  private readonly macaroon: string;
  private readonly httpClient: any;

  constructor(host: string, macaroon: string) {
    this.host = host;
    this.macaroon = macaroon;
    
    this.httpClient = axios.create({
      baseURL: host,
      headers: {
        'Grpc-Metadata-macaroon': macaroon
      }
    });
  }
  
  async createInvoice(options: CreateInvoiceOptions): Promise<Invoice> {
    try {
      const { tokens, description, expires_at, is_private } = options;
      
      // Calculate expiry in seconds from now
      let expiry = 3600; // Default 1 hour
      if (expires_at) {
        const expiryDate = typeof expires_at === 'string' ? new Date(expires_at) : expires_at;
        const secondsFromNow = Math.floor((expiryDate.getTime() - Date.now()) / 1000);
        expiry = Math.max(secondsFromNow, 60); // Minimum 60 seconds
      }
      
      const response = await this.httpClient.post('/v1/invoices', {
        value: tokens,
        memo: description,
        expiry,
        private: is_private || false
      });
      
      const { payment_request, r_hash } = response.data;
      const paymentHash = Buffer.from(r_hash, 'base64').toString('hex');
      
      return {
        id: paymentHash,
        request: payment_request,
        description,
        tokens,
        is_confirmed: false,
        expires_at: new Date(Date.now() + expiry * 1000).toISOString()
      };
    } catch (error) {
      console.error('LND createInvoice error:', error);
      throw new Error(`Failed to create invoice: ${(error as Error).message}`);
    }
  }
  
  async getInvoice(paymentHash: string): Promise<Invoice> {
    try {
      const response = await this.httpClient.get(`/v1/invoice/${paymentHash}`);
      const { memo, value, settled, creation_date, settle_date, payment_request, expiry } = response.data;
      
      const createdAt = new Date(Number(creation_date) * 1000);
      const expiresAt = new Date(createdAt.getTime() + Number(expiry) * 1000);
      
      return {
        id: paymentHash,
        request: payment_request,
        description: memo,
        tokens: Number(value),
        is_confirmed: settled,
        confirmed_at: settled ? new Date(Number(settle_date) * 1000).toISOString() : undefined,
        expires_at: expiresAt.toISOString()
      };
    } catch (error) {
      console.error('LND getInvoice error:', error);
      throw new Error(`Failed to get invoice: ${(error as Error).message}`);
    }
  }
  
  async listInvoices(options: ListInvoicesOptions = {}): Promise<Invoice[]> {
    try {
      const { limit = 100, is_confirmed, created_after, created_before } = options;
      
      let params: any = { num_max_invoices: limit };
      
      if (is_confirmed !== undefined) {
        params.index_offset = 0;
        params.reversed = true;
      }
      
      const response = await this.httpClient.get('/v1/invoices', { params });
      
      let invoices = response.data.invoices.map((inv: any) => ({
        id: Buffer.from(inv.r_hash, 'base64').toString('hex'),
        request: inv.payment_request,
        description: inv.memo,
        tokens: Number(inv.value),
        is_confirmed: inv.settled,
        confirmed_at: inv.settled ? new Date(Number(inv.settle_date) * 1000).toISOString() : undefined,
        expires_at: new Date(Number(inv.creation_date) * 1000 + Number(inv.expiry) * 1000).toISOString(),
        received_mtokens: inv.amt_paid_msat
      }));
      
      // Filter by confirmation status if specified
      if (is_confirmed !== undefined) {
        invoices = invoices.filter((inv: Invoice) => inv.is_confirmed === is_confirmed);
      }
      
      // Filter by creation date if specified
      if (created_after) {
        const afterDate = typeof created_after === 'string' ? new Date(created_after) : created_after;
        invoices = invoices.filter((inv: Invoice) => new Date(inv.expires_at) > afterDate);
      }
      
      if (created_before) {
        const beforeDate = typeof created_before === 'string' ? new Date(created_before) : created_before;
        invoices = invoices.filter((inv: Invoice) => new Date(inv.expires_at) < beforeDate);
      }
      
      return invoices;
    } catch (error) {
      console.error('LND listInvoices error:', error);
      throw new Error(`Failed to list invoices: ${(error as Error).message}`);
    }
  }
  
  async decodePaymentRequest(options: { request: string }): Promise<DecodedPaymentRequest> {
    try {
      const response = await this.httpClient.get('/v1/payreq/' + encodeURIComponent(options.request));
      const { description, destination, payment_hash, num_satoshis, timestamp, expiry } = response.data;
      
      const expiresAt = new Date((Number(timestamp) + Number(expiry)) * 1000);
      
      return {
        id: payment_hash,
        description,
        destination,
        tokens: Number(num_satoshis),
        expires_at: expiresAt.toISOString()
      };
    } catch (error) {
      console.error('LND decodePaymentRequest error:', error);
      throw new Error(`Failed to decode payment request: ${(error as Error).message}`);
    }
  }
  
  async payViaPaymentRequest(options: PaymentOptions): Promise<PaymentResult> {
    try {
      const { request, max_fee = 100, timeout_seconds = 60, fee_limit_msat } = options;
      
      const params: any = {
        payment_request: request,
        timeout_seconds,
      };
      
      if (max_fee) {
        params.fee_limit = { fixed: max_fee };
      }
      
      if (fee_limit_msat) {
        params.fee_limit = { fixed_msat: fee_limit_msat };
      }
      
      const response = await this.httpClient.post('/v1/channels/transactions', params);
      const { payment_hash, payment_preimage, payment_route } = response.data;
      
      let fee = 0;
      let hops: any[] = [];
      
      if (payment_route) {
        fee = Number(payment_route.total_fees);
        hops = payment_route.hops.map((hop: any) => ({
          channel: hop.chan_id,
          channel_capacity: Number(hop.chan_capacity),
          fee_mtokens: hop.fee_msat,
          forward_mtokens: hop.amt_to_forward_msat,
          public_key: hop.pub_key,
          timeout: hop.expiry
        }));
      }
      
      return {
        id: payment_hash,
        is_confirmed: true,
        fee,
        payment: payment_preimage,
        hops
      };
    } catch (error) {
      console.error('LND payViaPaymentRequest error:', error);
      
      return {
        id: '',
        is_confirmed: false,
        is_failed: true
      };
    }
  }
  
  async listPayments(options: ListPaymentsOptions = {}): Promise<Payment[]> {
    try {
      const { limit = 100, include_failed = false } = options;
      
      const params: any = {
        max_payments: limit,
        include_incomplete: include_failed
      };
      
      const response = await this.httpClient.get('/v1/payments', { params });
      
      return response.data.payments.map((payment: any) => ({
        id: payment.payment_hash,
        created_at: new Date(Number(payment.creation_date) * 1000).toISOString(),
        destination: payment.path[payment.path.length - 1],
        fee: Number(payment.fee),
        hops: payment.path,
        request: payment.payment_request,
        status: payment.status,
        tokens: Number(payment.value)
      }));
    } catch (error) {
      console.error('LND listPayments error:', error);
      throw new Error(`Failed to list payments: ${(error as Error).message}`);
    }
  }
  
  async listChannels(): Promise<Channel[]> {
    try {
      const response = await this.httpClient.get('/v1/channels');
      
      return response.data.channels.map((channel: any) => ({
        id: channel.chan_id,
        capacity: Number(channel.capacity),
        local_balance: Number(channel.local_balance),
        remote_balance: Number(channel.remote_balance),
        remote_pubkey: channel.remote_pubkey,
        commit_fee: Number(channel.commit_fee),
        is_active: channel.active,
        is_private: channel.private,
        is_closing: false,
        is_opening: false,
        total_satoshis_sent: Number(channel.total_satoshis_sent),
        total_satoshis_received: Number(channel.total_satoshis_received),
        updates: Number(channel.num_updates),
        base_fee_msat: channel.policy?.fee_base_msat,
        fee_rate_per_mil: channel.policy?.fee_rate_milli_msat
      }));
    } catch (error) {
      console.error('LND listChannels error:', error);
      throw new Error(`Failed to list channels: ${(error as Error).message}`);
    }
  }
  
  async openChannel(options: OpenChannelOptions): Promise<Channel> {
    try {
      const { local_tokens, partner_public_key, chain_fee_tokens_per_vbyte, give_tokens = 0, is_private = false } = options;
      
      const params: any = {
        node_pubkey_string: partner_public_key,
        local_funding_amount: local_tokens,
        push_sat: give_tokens,
        private: is_private
      };
      
      if (chain_fee_tokens_per_vbyte) {
        params.sat_per_byte = chain_fee_tokens_per_vbyte;
      }
      
      const response = await this.httpClient.post('/v1/channels', params);
      
      // Since opening a channel is async, we return a placeholder
      return {
        id: '0', // We don't have the ID yet
        capacity: local_tokens,
        local_balance: local_tokens - give_tokens,
        remote_balance: give_tokens,
        remote_pubkey: partner_public_key,
        commit_fee: 0,
        is_active: false,
        is_private,
        is_closing: false,
        is_opening: true,
        total_satoshis_sent: 0,
        total_satoshis_received: 0
      };
    } catch (error) {
      console.error('LND openChannel error:', error);
      throw new Error(`Failed to open channel: ${(error as Error).message}`);
    }
  }
  
  async closeChannel(options: CloseChannelOptions): Promise<ChannelCloseResult> {
    try {
      const { id, is_force_close = false, target_fee_per_vbyte } = options;
      
      // Parse channel point from channel ID
      const [txid_str, output_index] = id.split(':');
      
      const params: any = {
        force: is_force_close,
        channel_point: {
          funding_txid_str: txid_str,
          output_index: parseInt(output_index, 10)
        }
      };
      
      if (target_fee_per_vbyte) {
        params.sat_per_byte = target_fee_per_vbyte;
      }
      
      const response = await this.httpClient.post('/v1/channels/close', params);
      
      return {
        transaction_id: response.data.closing_txid,
        transaction_vout: parseInt(output_index, 10)
      };
    } catch (error) {
      console.error('LND closeChannel error:', error);
      throw new Error(`Failed to close channel: ${(error as Error).message}`);
    }
  }
  
  async getNodeInfo(): Promise<NodeInfo> {
    try {
      const response = await this.httpClient.get('/v1/getinfo');
      const { alias, identity_pubkey, color, synced_to_chain, synced_to_graph, version } = response.data;
      
      const channelsResponse = await this.httpClient.get('/v1/channels');
      const pendingResponse = await this.httpClient.get('/v1/channels/pending');
      const peersResponse = await this.httpClient.get('/v1/peers');
      
      return {
        alias,
        public_key: identity_pubkey,
        color,
        is_synced_to_chain: synced_to_chain,
        is_synced_to_graph: synced_to_graph,
        active_channels_count: channelsResponse.data.channels.length,
        pending_channels_count: pendingResponse.data.pending_open_channels.length,
        peers_count: peersResponse.data.peers.length,
        version
      };
    } catch (error) {
      console.error('LND getNodeInfo error:', error);
      throw new Error(`Failed to get node info: ${(error as Error).message}`);
    }
  }
  
  async getNetworkInfo(): Promise<NetworkInfo> {
    try {
      const response = await this.httpClient.get('/v1/graph/info');
      const { num_channels, num_nodes, max_channel_size, min_channel_size, avg_channel_size, median_channel_size, total_network_capacity } = response.data;
      
      return {
        channel_count: num_channels,
        node_count: num_nodes,
        max_channel_size: Number(max_channel_size),
        min_channel_size: Number(min_channel_size),
        average_channel_size: Number(avg_channel_size),
        median_channel_size: Number(median_channel_size),
        total_capacity: Number(total_network_capacity)
      };
    } catch (error) {
      console.error('LND getNetworkInfo error:', error);
      throw new Error(`Failed to get network info: ${(error as Error).message}`);
    }
  }
  
  async listForwardingEvents(options: ListForwardingOptions = {}): Promise<ForwardingEvent[]> {
    try {
      const { after, before, limit = 100 } = options;
      
      let params: any = {
        max_events: limit,
        index_offset: 0
      };
      
      if (after) {
        params.start_time = typeof after === 'string' ? Math.floor(new Date(after).getTime() / 1000) : Math.floor((after as Date).getTime() / 1000);
      }
      
      if (before) {
        params.end_time = typeof before === 'string' ? Math.floor(new Date(before).getTime() / 1000) : Math.floor((before as Date).getTime() / 1000);
      }
      
      const response = await this.httpClient.get('/v1/switch', { params });
      
      return response.data.forwarding_events.map((event: any) => ({
        created_at: new Date(Number(event.timestamp) * 1000).toISOString(),
        fee: Number(event.fee),
        fee_mtokens: event.fee_msat,
        incoming_channel: event.chan_id_in,
        outgoing_channel: event.chan_id_out,
        mtokens: event.amt_out_msat,
        tokens: Number(event.amt_out)
      }));
    } catch (error) {
      console.error('LND listForwardingEvents error:', error);
      throw new Error(`Failed to list forwarding events: ${(error as Error).message}`);
    }
  }
  
  async setChannelFee(options: SetChannelFeeOptions): Promise<void> {
    try {
      const { id, base_fee_msat = 1000, fee_rate_per_mil = 1, global = false } = options;
      
      let params: any = {
        base_fee_msat: base_fee_msat.toString(),
        fee_rate: fee_rate_per_mil / 1000000
      };
      
      if (!global && id) {
        const [txid_str, output_index] = id.split(':');
        params.chan_point = {
          funding_txid_str: txid_str,
          output_index: parseInt(output_index, 10)
        };
      }
      
      await this.httpClient.post('/v1/chanpolicy', params);
    } catch (error) {
      console.error('LND setChannelFee error:', error);
      throw new Error(`Failed to set channel fee: ${(error as Error).message}`);
    }
  }
}

// Placeholder for a Core Lightning implementation
class CoreLightningService implements LightningService {
  // Implementation would go here similar to LndService
  // ...
  
  // For now, we'll use placeholders that throw "not implemented" errors
  
  async createInvoice(options: CreateInvoiceOptions): Promise<Invoice> {
    throw new Error('Not implemented for Core Lightning');
  }
  
  async getInvoice(paymentHash: string): Promise<Invoice> {
    throw new Error('Not implemented for Core Lightning');
  }
  
  async listInvoices(options?: ListInvoicesOptions): Promise<Invoice[]> {
    throw new Error('Not implemented for Core Lightning');
  }
  
  async decodePaymentRequest(options: { request: string }): Promise<DecodedPaymentRequest> {
    throw new Error('Not implemented for Core Lightning');
  }
  
  async payViaPaymentRequest(options: PaymentOptions): Promise<PaymentResult> {
    throw new Error('Not implemented for Core Lightning');
  }
  
  async listPayments(options?: ListPaymentsOptions): Promise<Payment[]> {
    throw new Error('Not implemented for Core Lightning');
  }
  
  async listChannels(): Promise<Channel[]> {
    throw new Error('Not implemented for Core Lightning');
  }
  
  async openChannel(options: OpenChannelOptions): Promise<Channel> {
    throw new Error('Not implemented for Core Lightning');
  }
  
  async closeChannel(options: CloseChannelOptions): Promise<ChannelCloseResult> {
    throw new Error('Not implemented for Core Lightning');
  }
  
  async getNodeInfo(): Promise<NodeInfo> {
    throw new Error('Not implemented for Core Lightning');
  }
  
  async getNetworkInfo(): Promise<NetworkInfo> {
    throw new Error('Not implemented for Core Lightning');
  }
  
  async listForwardingEvents(options?: ListForwardingOptions): Promise<ForwardingEvent[]> {
    throw new Error('Not implemented for Core Lightning');
  }
  
  async setChannelFee(options: SetChannelFeeOptions): Promise<void> {
    throw new Error('Not implemented for Core Lightning');
  }
}

// Factory function to create the appropriate Lightning implementation
function createLightningService(type: 'lnd' | 'c-lightning' = 'lnd'): LightningService {
  if (type === 'lnd') {
    const host = process.env.LND_REST_API_URL || 'https://127.0.0.1:8080';
    const macaroon = process.env.LND_MACAROON || '';
    
    return new LndService(host, macaroon);
  } else if (type === 'c-lightning') {
    return new CoreLightningService();
  }
  
  throw new Error(`Unsupported Lightning implementation type: ${type}`);
}

// Export the service instance
export const lnService = createLightningService(); 