import { createClient } from '@/lib/supabase/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface LightningChannelInfo {
  channel_id: string;
  peer_pubkey: string;
  peer_alias?: string;
  local_balance: number;
  remote_balance: number;
  capacity: number;
  active: boolean;
  base_fee_msat: number;
  fee_rate_ppm: number;
  last_forward_at?: string;
}

interface ForwardingEvent {
  timestamp_ns: string;
  chan_id_in: string;
  chan_id_out: string;
  amt_in_msat: string;
  amt_out_msat: string;
  fee_msat: string;
}

export class ChannelMonitor {
  private supabase: any;
  private userId: string;
  
  constructor(userId: string) {
    this.supabase = createClient();
    this.userId = userId;
  }

  /**
   * Fetch channel information from LND
   */
  async fetchChannelsFromLND(): Promise<LightningChannelInfo[]> {
    try {
      // Use lncli to get channel list
      const { stdout: channelsOutput } = await execAsync('lncli listchannels --active_only=false');
      const channelsData = JSON.parse(channelsOutput);
      
      // Get node info for aliases
      const { stdout: nodeInfoOutput } = await execAsync('lncli getnodeinfo --include_channels=false');
      const nodeInfo = JSON.parse(nodeInfoOutput);
      
      // Get fee information
      const { stdout: feeOutput } = await execAsync('lncli feebudget');
      const feeData = JSON.parse(feeOutput);
      
      const channels: LightningChannelInfo[] = channelsData.channels.map((channel: any) => ({
        channel_id: channel.chan_id,
        peer_pubkey: channel.remote_pubkey,
        peer_alias: channel.peer_alias || 'Unknown',
        local_balance: parseInt(channel.local_balance),
        remote_balance: parseInt(channel.remote_balance),
        capacity: parseInt(channel.capacity),
        active: channel.active,
        base_fee_msat: channel.local_chan_reserve_sat || 1000,
        fee_rate_ppm: channel.fee_per_kw || 1000,
        last_forward_at: undefined // Will be populated from forwarding history
      }));

      return channels;
    } catch (error) {
      console.error('Failed to fetch channels from LND:', error);
      return [];
    }
  }

  /**
   * Fetch recent forwarding events for channels
   */
  async fetchForwardingHistory(): Promise<Map<string, string>> {
    try {
      // Get forwarding history from last 24 hours
      const yesterday = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
      const { stdout } = await execAsync(`lncli fwdinghistory --start_time=${yesterday} --max_events=1000`);
      const forwardingData = JSON.parse(stdout);
      
      // Map channel_id to last forward timestamp
      const lastForwards = new Map<string, string>();
      
      forwardingData.forwarding_events?.forEach((event: ForwardingEvent) => {
        const timestamp = new Date(parseInt(event.timestamp_ns) / 1000000).toISOString();
        
        // Update last forward time for both incoming and outgoing channels
        if (event.chan_id_in) {
          const existing = lastForwards.get(event.chan_id_in);
          if (!existing || timestamp > existing) {
            lastForwards.set(event.chan_id_in, timestamp);
          }
        }
        
        if (event.chan_id_out) {
          const existing = lastForwards.get(event.chan_id_out);
          if (!existing || timestamp > existing) {
            lastForwards.set(event.chan_id_out, timestamp);
          }
        }
      });
      
      return lastForwards;
    } catch (error) {
      console.error('Failed to fetch forwarding history:', error);
      return new Map();
    }
  }

  /**
   * Update channel states in database
   */
  async updateChannelStates(channels: LightningChannelInfo[]): Promise<void> {
    const forwardingHistory = await this.fetchForwardingHistory();
    
    for (const channel of channels) {
      const lastForwardAt = forwardingHistory.get(channel.channel_id);
      
      try {
        await this.supabase
          .from('live_channels')
          .upsert({
            user_id: this.userId,
            channel_id: channel.channel_id,
            peer_pubkey: channel.peer_pubkey,
            peer_alias: channel.peer_alias,
            local_balance: channel.local_balance,
            remote_balance: channel.remote_balance,
            capacity: channel.capacity,
            active: channel.active,
            base_fee_msat: channel.base_fee_msat,
            fee_rate_ppm: channel.fee_rate_ppm,
            last_forward_at: lastForwardAt,
            last_update_at: new Date().toISOString()
          }, {
            onConflict: 'channel_id'
          });
      } catch (error) {
        console.error(`Failed to update channel ${channel.channel_id}:`, error);
      }
    }
  }

  /**
   * Record capacity history snapshot
   */
  async recordCapacitySnapshot(): Promise<void> {
    try {
      await this.supabase.rpc('record_channel_capacity_snapshot');
    } catch (error) {
      console.error('Failed to record capacity snapshot:', error);
    }
  }

  /**
   * Check for and create alerts
   */
  async checkAndCreateAlerts(channels: LightningChannelInfo[]): Promise<void> {
    for (const channel of channels) {
      const localRatio = channel.local_balance / channel.capacity;
      
      // Check for imbalance alerts
      if (localRatio < 0.2) {
        await this.createAlert(
          channel.channel_id,
          'imbalance',
          'warning',
          'Channel Low on Local Balance',
          `Channel ${channel.peer_alias} has only ${(localRatio * 100).toFixed(1)}% local balance`,
          'Consider rebalancing to increase local balance for outbound payments',
          { local_ratio: localRatio, balance_score: 'low_local' }
        );
      } else if (localRatio > 0.8) {
        await this.createAlert(
          channel.channel_id,
          'imbalance',
          'warning',
          'Channel High on Local Balance',
          `Channel ${channel.peer_alias} has ${(localRatio * 100).toFixed(1)}% local balance`,
          'Consider rebalancing to increase remote balance for inbound payments',
          { local_ratio: localRatio, balance_score: 'high_local' }
        );
      }
      
      // Check for inactive channels
      const forwardingHistory = await this.fetchForwardingHistory();
      const lastForward = forwardingHistory.get(channel.channel_id);
      
      if (channel.active && (!lastForward || 
          new Date(lastForward) < new Date(Date.now() - 48 * 60 * 60 * 1000))) {
        await this.createAlert(
          channel.channel_id,
          'inactive',
          'info',
          'Channel Inactive',
          `Channel ${channel.peer_alias} has not forwarded payments in 48+ hours`,
          'Check peer connectivity or consider adjusting fees',
          { 
            hours_inactive: lastForward ? 
              Math.floor((Date.now() - new Date(lastForward).getTime()) / (1000 * 60 * 60)) : 
              null 
          }
        );
      }
      
      // Check for fee optimization opportunities
      if (channel.fee_rate_ppm > 5000 && localRatio > 0.7) {
        await this.createAlert(
          channel.channel_id,
          'fee_opportunity',
          'info',
          'High Fee Rate Opportunity',
          `Channel ${channel.peer_alias} has high fees (${channel.fee_rate_ppm} ppm) with good liquidity`,
          'Consider lowering fees to attract more routing traffic',
          { fee_rate_ppm: channel.fee_rate_ppm, local_ratio: localRatio }
        );
      }
    }
  }

  /**
   * Create an alert if it doesn't already exist
   */
  async createAlert(
    channelId: string,
    alertType: string,
    severity: string,
    title: string,
    message: string,
    recommendedAction: string,
    alertData: any
  ): Promise<void> {
    try {
      // Check if similar alert already exists (avoid spam)
      const { data: existingAlert } = await this.supabase
        .from('channel_alerts')
        .select('id')
        .eq('channel_id', channelId)
        .eq('alert_type', alertType)
        .eq('resolved', false)
        .gte('triggered_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Within last hour
        .single();

      if (existingAlert) {
        return; // Don't create duplicate alert
      }

      await this.supabase
        .from('channel_alerts')
        .insert({
          user_id: this.userId,
          channel_id: channelId,
          alert_type: alertType,
          severity,
          title,
          message,
          recommended_action: recommendedAction,
          alert_data: alertData
        });
    } catch (error) {
      console.error(`Failed to create alert for channel ${channelId}:`, error);
    }
  }

  /**
   * Main monitoring loop
   */
  async runMonitoring(): Promise<void> {
    console.log(`Starting channel monitoring for user ${this.userId}...`);
    
    try {
      // Fetch current channel states from Lightning node
      const channels = await this.fetchChannelsFromLND();
      
      if (channels.length === 0) {
        console.log('No channels found or failed to fetch channels');
        return;
      }
      
      console.log(`Found ${channels.length} channels to monitor`);
      
      // Update channel states in database
      await this.updateChannelStates(channels);
      
      // Record capacity snapshot for trending
      await this.recordCapacitySnapshot();
      
      // Check for alerts
      await this.checkAndCreateAlerts(channels);
      
      console.log('Channel monitoring completed successfully');
    } catch (error) {
      console.error('Channel monitoring failed:', error);
    }
  }
}

/**
 * Main function to run monitoring for all users
 */
export async function runChannelMonitoring(): Promise<void> {
  const supabase = createClient();
  
  try {
    // Get all users who have channels to monitor
    const { data: allUsers, error } = await supabase
      .from('live_channels')
      .select('user_id');
    
    if (error) {
      console.error('Failed to fetch users for monitoring:', error);
      return;
    }
    
    // Deduplicate user IDs
    const uniqueUserIds = Array.from(new Set(allUsers?.map(u => u.user_id) || []));
    const users = uniqueUserIds.map(user_id => ({ user_id }));
    
    // Run monitoring for each user
    for (const userRecord of users) {
      const monitor = new ChannelMonitor(userRecord.user_id);
      await monitor.runMonitoring();
      
      // Small delay between users to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error('Failed to run channel monitoring:', error);
  }
}

/**
 * Express/Next.js API handler for manual monitoring trigger
 */
export async function handleMonitoringRequest(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const monitor = new ChannelMonitor(userId);
    await monitor.runMonitoring();
    
    return {
      success: true,
      message: 'Channel monitoring completed successfully'
    };
  } catch (error) {
    console.error('Manual monitoring failed:', error);
    return {
      success: false,
      message: `Monitoring failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
} 