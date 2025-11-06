import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface RebalancerSettings {
  enabled: boolean;
  min_imbalance_ratio: number;
  max_fee_per_rebalance: number;
  rebalance_frequency_hours: number;
  ai_suggestions_enabled: boolean;
  auto_fee_updates: boolean;
  confidence_threshold: number;
}

interface ChannelState {
  channel_id: string;
  peer_alias: string;
  local_balance: number;
  remote_balance: number;
  fee_rate: number;
  base_fee: number;
  capacity: number;
}

interface RebalanceResult {
  success: boolean;
  command: string;
  output: string;
  error?: string;
  cost_sats?: number;
  execution_time_ms: number;
}

export class LightningRebalancer {
  private settings: RebalancerSettings;
  private userId: string;

  constructor(settings: RebalancerSettings, userId: string) {
    this.settings = settings;
    this.userId = userId;
  }

  /**
   * Analyze channel and determine if rebalancing is needed
   */
  analyzeChannel(channel: ChannelState): {
    needsRebalance: boolean;
    direction: 'inbound' | 'outbound' | null;
    imbalanceRatio: number;
    recommendation: string;
  } {
    const totalCapacity = channel.local_balance + channel.remote_balance;
    const localRatio = channel.local_balance / totalCapacity;
    
    let needsRebalance = false;
    let direction: 'inbound' | 'outbound' | null = null;
    let recommendation = 'Channel is balanced';

    if (localRatio < this.settings.min_imbalance_ratio) {
      needsRebalance = true;
      direction = 'inbound';
      recommendation = `Channel is ${(localRatio * 100).toFixed(1)}% local - needs inbound liquidity`;
    } else if (localRatio > (1 - this.settings.min_imbalance_ratio)) {
      needsRebalance = true;
      direction = 'outbound';
      recommendation = `Channel is ${(localRatio * 100).toFixed(1)}% local - needs outbound liquidity`;
    }

    return {
      needsRebalance,
      direction,
      imbalanceRatio: localRatio,
      recommendation
    };
  }

  /**
   * Generate AI-powered rebalancing suggestion
   */
  async generateAISuggestion(channel: ChannelState, analysis: any): Promise<{
    reasoning: string;
    confidence: number;
    recommendedAmount: number;
    maxFee: number;
  }> {
    // This would integrate with your OpenAI assistant
    // For now, using heuristic-based logic
    
    const totalCapacity = channel.local_balance + channel.remote_balance;
    const targetBalance = totalCapacity * 0.5; // Aim for 50/50 balance
    const currentImbalance = Math.abs(channel.local_balance - targetBalance);
    
    let reasoning = '';
    let confidence = 0.8;
    let recommendedAmount = Math.floor(currentImbalance * 0.8); // Conservative approach
    let maxFee = Math.min(this.settings.max_fee_per_rebalance, recommendedAmount * 0.02);

    if (analysis.direction === 'inbound') {
      reasoning = `Channel has ${(analysis.imbalanceRatio * 100).toFixed(1)}% local balance. ` +
                 `Recommend ${recommendedAmount} sat inbound rebalance to improve routing capacity.`;
    } else if (analysis.direction === 'outbound') {
      reasoning = `Channel has ${(analysis.imbalanceRatio * 100).toFixed(1)}% local balance. ` +
                 `Recommend ${recommendedAmount} sat outbound rebalance to improve receiving capacity.`;
    }

    // Adjust confidence based on channel history, fees, etc.
    if (channel.capacity < 1000000) confidence -= 0.1; // Lower confidence for small channels
    if (maxFee > recommendedAmount * 0.01) confidence += 0.1; // Higher confidence if we can afford good fees

    return {
      reasoning,
      confidence: Math.max(0.5, Math.min(1.0, confidence)),
      recommendedAmount,
      maxFee
    };
  }

  /**
   * Execute rebalance command
   */
  async executeRebalance(
    channel: ChannelState,
    direction: 'inbound' | 'outbound',
    amount: number,
    maxFee: number
  ): Promise<RebalanceResult> {
    const startTime = Date.now();
    
    // Generate command based on your Lightning implementation (BOS, LND, etc.)
    const command = this.generateRebalanceCommand(channel, direction, amount, maxFee);
    
    try {
      const { stdout, stderr } = await execAsync(command, { timeout: 300000 }); // 5 min timeout
      const executionTime = Date.now() - startTime;
      
      // Parse output to extract cost
      const costMatch = stdout.match(/fee:\s*(\d+)/i);
      const cost_sats = costMatch ? parseInt(costMatch[1]) : undefined;
      
      return {
        success: true,
        command,
        output: stdout,
        cost_sats,
        execution_time_ms: executionTime
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      return {
        success: false,
        command,
        output: error.stdout || '',
        error: error.stderr || error.message,
        execution_time_ms: executionTime
      };
    }
  }

  /**
   * Update channel fees
   */
  async updateChannelFees(
    channel: ChannelState,
    newFeeRate: number,
    newBaseFee: number
  ): Promise<RebalanceResult> {
    const startTime = Date.now();
    
    const command = this.generateFeeUpdateCommand(channel, newFeeRate, newBaseFee);
    
    try {
      const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
      const executionTime = Date.now() - startTime;
      
      return {
        success: true,
        command,
        output: stdout,
        execution_time_ms: executionTime
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      return {
        success: false,
        command,
        output: error.stdout || '',
        error: error.stderr || error.message,
        execution_time_ms: executionTime
      };
    }
  }

  /**
   * Log action to audit system
   */
  async logAction(
    channel: ChannelState,
    actionType: string,
    triggerSource: string,
    result: RebalanceResult,
    aiSuggestion?: any,
    beforeState?: any,
    afterState?: any
  ): Promise<void> {
    try {
      await fetch('/api/channel/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_id: channel.channel_id,
          peer_alias: channel.peer_alias,
          action_type: actionType,
          trigger_source: triggerSource,
          command_executed: result.command,
          result_output: result.output,
          success: result.success,
          error_message: result.error,
          cost_sats: result.cost_sats,
          execution_time_ms: result.execution_time_ms,
          ai_reasoning: aiSuggestion?.reasoning,
          confidence_score: aiSuggestion?.confidence,
          before_state: beforeState,
          after_state: afterState
        })
      });
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  }

  /**
   * Generate rebalance command (customize for your Lightning implementation)
   */
  private generateRebalanceCommand(
    channel: ChannelState,
    direction: 'inbound' | 'outbound',
    amount: number,
    maxFee: number
  ): string {
    // Example for BOS (Balance of Satoshis)
    if (direction === 'inbound') {
      return `bos rebalance --in ${channel.channel_id} --amount ${amount} --max_fee ${maxFee} --timeout 300`;
    } else {
      return `bos rebalance --out ${channel.channel_id} --amount ${amount} --max_fee ${maxFee} --timeout 300`;
    }
    
    // Example for LND circular rebalance
    // return `lncli sendpayment --pay_req=${invoice} --amt=${amount} --fee_limit=${maxFee}`;
  }

  /**
   * Generate fee update command
   */
  private generateFeeUpdateCommand(
    channel: ChannelState,
    feeRate: number,
    baseFee: number
  ): string {
    // Example for LND
    const feeRateDecimal = feeRate / 1_000_000; // Convert ppm to decimal
    return `lncli updatechanpolicy --base_fee_msat=${baseFee} --fee_rate=${feeRateDecimal} --chan_point=${channel.channel_id}`;
    
    // Example for CLN
    // return `lightning-cli setchannel ${channel.channel_id} ${feeRate} ${baseFee}`;
  }

  /**
   * Main rebalancing workflow
   */
  async processChannel(channel: ChannelState): Promise<boolean> {
    if (!this.settings.enabled) {
      return false;
    }

    const analysis = this.analyzeChannel(channel);
    
    if (!analysis.needsRebalance) {
      return false;
    }

    let aiSuggestion;
    let shouldProceed = true;

    if (this.settings.ai_suggestions_enabled) {
      aiSuggestion = await this.generateAISuggestion(channel, analysis);
      
      if (aiSuggestion.confidence < this.settings.confidence_threshold) {
        await this.logAction(
          channel,
          'ai_suggestion_rejected',
          'ai',
          {
            success: false,
            command: 'N/A',
            output: `AI confidence ${aiSuggestion.confidence} below threshold ${this.settings.confidence_threshold}`,
            execution_time_ms: 0
          },
          aiSuggestion
        );
        return false;
      }
    }

    if (shouldProceed && analysis.direction) {
      const beforeState = {
        local_balance: channel.local_balance,
        remote_balance: channel.remote_balance,
        fee_rate: channel.fee_rate,
        base_fee: channel.base_fee
      };

      const result = await this.executeRebalance(
        channel,
        analysis.direction,
        aiSuggestion?.recommendedAmount || 100000,
        aiSuggestion?.maxFee || this.settings.max_fee_per_rebalance
      );

      await this.logAction(
        channel,
        'rebalance',
        this.settings.ai_suggestions_enabled ? 'ai' : 'threshold',
        result,
        aiSuggestion,
        beforeState
      );

      return result.success;
    }

    return false;
  }
}

/**
 * Utility function to create and run rebalancer
 */
export async function runRebalancer(
  channels: ChannelState[],
  settings: RebalancerSettings,
  userId: string
): Promise<{ processed: number; successful: number }> {
  const rebalancer = new LightningRebalancer(settings, userId);
  
  let processed = 0;
  let successful = 0;

  for (const channel of channels) {
    try {
      const result = await rebalancer.processChannel(channel);
      processed++;
      if (result) successful++;
      
      // Small delay between operations to avoid overwhelming the node
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to process channel ${channel.channel_id}:`, error);
    }
  }

  return { processed, successful };
} 