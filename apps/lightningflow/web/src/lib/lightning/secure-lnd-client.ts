import { spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

interface LNDConfig {
  lndDir?: string;
  network?: 'mainnet' | 'testnet' | 'regtest';
  tlsCertPath?: string;
  macaroonPath?: string;
  rpcServer?: string;
}

interface ChannelInfo {
  chan_id: string;
  remote_pubkey: string;
  peer_alias: string;
  local_balance: string;
  remote_balance: string;
  capacity: string;
  active: boolean;
  fee_per_kw?: string;
  local_chan_reserve_sat?: string;
}

interface ForwardingHistoryResponse {
  forwarding_events: Array<{
    timestamp_ns: string;
    chan_id_in: string;
    chan_id_out: string;
    amt_in_msat: string;
    amt_out_msat: string;
    fee_msat: string;
  }>;
}

export class SecureLNDClient {
  private config: LNDConfig;
  private readonly COMMAND_TIMEOUT = 30000; // 30 seconds
  private readonly MAX_EVENTS = 1000;

  constructor(config: LNDConfig = {}) {
    this.config = {
      lndDir: config.lndDir || process.env.LND_DIR || path.join(process.env.HOME || '', '.lnd'),
      network: config.network || 'mainnet',
      tlsCertPath: config.tlsCertPath,
      macaroonPath: config.macaroonPath,
      rpcServer: config.rpcServer || 'localhost:10009',
      ...config
    };
  }

  /**
   * Safely execute lncli command with input validation and timeout
   */
  private async executeLNCLI(args: string[]): Promise<string> {
    // Validate arguments to prevent injection
    for (const arg of args) {
      if (!/^[a-zA-Z0-9._\-=:\/]+$/.test(arg)) {
        throw new Error(`Invalid argument: ${arg}`);
      }
    }

    const baseArgs = ['lncli'];
    
    // Add network flag if not mainnet
    if (this.config.network !== 'mainnet') {
      baseArgs.push(`--network=${this.config.network}`);
    }

    // Add TLS cert path if specified
    if (this.config.tlsCertPath) {
      baseArgs.push(`--tlscertpath=${this.config.tlsCertPath}`);
    }

    // Add macaroon path if specified
    if (this.config.macaroonPath) {
      baseArgs.push(`--macaroonpath=${this.config.macaroonPath}`);
    }

    // Add RPC server if specified
    if (this.config.rpcServer && this.config.rpcServer !== 'localhost:10009') {
      baseArgs.push(`--rpcserver=${this.config.rpcServer}`);
    }

    const fullArgs = [...baseArgs, ...args];

    return new Promise((resolve, reject) => {
      const process = spawn(fullArgs[0], fullArgs.slice(1), {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: this.COMMAND_TIMEOUT
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`lncli command failed: ${stderr || 'Unknown error'}`));
        }
      });

      process.on('error', (error) => {
        reject(new Error(`Failed to execute lncli: ${error.message}`));
      });

      // Handle timeout
      setTimeout(() => {
        process.kill();
        reject(new Error('lncli command timed out'));
      }, this.COMMAND_TIMEOUT);
    });
  }

  /**
   * Get node information
   */
  async getInfo(): Promise<any> {
    const output = await this.executeLNCLI(['getinfo']);
    return JSON.parse(output);
  }

  /**
   * List channels with input validation
   */
  async listChannels(activeOnly: boolean = false): Promise<{ channels: ChannelInfo[] }> {
    const args = ['listchannels'];
    if (activeOnly) {
      args.push('--active_only=true');
    } else {
      args.push('--active_only=false');
    }

    const output = await this.executeLNCLI(args);
    return JSON.parse(output);
  }

  /**
   * Get forwarding history with validation
   */
  async getForwardingHistory(startTime?: number, maxEvents?: number): Promise<ForwardingHistoryResponse> {
    const args = ['fwdinghistory'];
    
    if (startTime !== undefined) {
      // Validate timestamp (must be positive integer)
      if (!Number.isInteger(startTime) || startTime < 0) {
        throw new Error('Invalid start_time: must be positive integer');
      }
      args.push(`--start_time=${startTime}`);
    }

    if (maxEvents !== undefined) {
      // Validate max events (must be between 1 and 10000)
      if (!Number.isInteger(maxEvents) || maxEvents < 1 || maxEvents > 10000) {
        throw new Error('Invalid max_events: must be integer between 1 and 10000');
      }
      args.push(`--max_events=${maxEvents}`);
    } else {
      args.push(`--max_events=${this.MAX_EVENTS}`);
    }

    const output = await this.executeLNCLI(args);
    return JSON.parse(output);
  }

  /**
   * Get fee report
   */
  async getFeeReport(): Promise<any> {
    const output = await this.executeLNCLI(['feereport']);
    return JSON.parse(output);
  }

  /**
   * Update channel policy with validation
   */
  async updateChannelPolicy(options: {
    chanPoint: string;
    baseFee?: number;
    feeRate?: number;
    timeLockDelta?: number;
  }): Promise<any> {
    const { chanPoint, baseFee, feeRate, timeLockDelta } = options;

    // Validate channel point format
    if (!/^[a-f0-9]{64}:\d+$/i.test(chanPoint)) {
      throw new Error('Invalid channel point format');
    }

    const args = ['updatechanpolicy', `--chan_point=${chanPoint}`];

    if (baseFee !== undefined) {
      if (!Number.isInteger(baseFee) || baseFee < 0 || baseFee > 1000000) {
        throw new Error('Invalid base_fee: must be integer between 0 and 1000000');
      }
      args.push(`--base_fee_msat=${baseFee}`);
    }

    if (feeRate !== undefined) {
      if (typeof feeRate !== 'number' || feeRate < 0 || feeRate > 1) {
        throw new Error('Invalid fee_rate: must be number between 0 and 1');
      }
      args.push(`--fee_rate=${feeRate}`);
    }

    if (timeLockDelta !== undefined) {
      if (!Number.isInteger(timeLockDelta) || timeLockDelta < 1 || timeLockDelta > 2016) {
        throw new Error('Invalid time_lock_delta: must be integer between 1 and 2016');
      }
      args.push(`--time_lock_delta=${timeLockDelta}`);
    }

    const output = await this.executeLNCLI(args);
    return JSON.parse(output);
  }

  /**
   * Validate LND connection and permissions
   */
  async validateConnection(): Promise<{ valid: boolean; error?: string }> {
    try {
      const info = await this.getInfo();
      
      // Basic validation
      if (!info.identity_pubkey || !info.version) {
        return { valid: false, error: 'Invalid node response' };
      }

      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      };
    }
  }

  /**
   * Get safe channel information for monitoring
   */
  async getChannelsForMonitoring(): Promise<{
    channels: Array<{
      channel_id: string;
      peer_pubkey: string;
      peer_alias: string;
      local_balance: number;
      remote_balance: number;
      capacity: number;
      active: boolean;
      base_fee_msat: number;
      fee_rate_ppm: number;
    }>;
    lastUpdate: string;
  }> {
    const [channelsData, feeData] = await Promise.all([
      this.listChannels(),
      this.getFeeReport().catch(() => ({ channel_fees: [] }))
    ]);

    const feeMap = new Map();
    if (feeData.channel_fees) {
      feeData.channel_fees.forEach((fee: any) => {
        feeMap.set(fee.chan_id, fee);
      });
    }

    const channels = channelsData.channels.map(channel => {
      const feeInfo = feeMap.get(channel.chan_id) || {};
      
      return {
        channel_id: channel.chan_id,
        peer_pubkey: channel.remote_pubkey,
        peer_alias: channel.peer_alias || 'Unknown',
        local_balance: parseInt(channel.local_balance, 10),
        remote_balance: parseInt(channel.remote_balance, 10),
        capacity: parseInt(channel.capacity, 10),
        active: channel.active,
        base_fee_msat: feeInfo.base_fee_msat || 1000,
        fee_rate_ppm: Math.round((feeInfo.fee_rate || 0.000001) * 1000000)
      };
    });

    return {
      channels,
      lastUpdate: new Date().toISOString()
    };
  }
}

// Export a singleton instance with environment-based configuration
export const lndClient = new SecureLNDClient({
  lndDir: process.env.LND_DIR,
  network: (process.env.LND_NETWORK as 'mainnet' | 'testnet' | 'regtest') || 'mainnet',
  tlsCertPath: process.env.LND_TLS_CERT_PATH,
  macaroonPath: process.env.LND_MACAROON_PATH,
  rpcServer: process.env.LND_RPC_SERVER
}); 