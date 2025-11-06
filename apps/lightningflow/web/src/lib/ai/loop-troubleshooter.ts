interface LoopFailure {
  log: string;
  error_type: string;
  amount_sats: number;
  max_routing_fee: number;
  hops_attempted?: number;
  duration_minutes?: number;
}

interface TroubleshootingSuggestion {
  issue: string;
  explanation: string;
  immediate_actions: string[];
  cli_commands?: string[];
  prevention_tips: string[];
  success_probability: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export class LoopTroubleshooter {
  static analyzeFaiiure(failure: LoopFailure): TroubleshootingSuggestion {
    const { log, amount_sats, max_routing_fee, hops_attempted } = failure;

    // Pattern matching based on video errors
    if (log.includes('failed to find a path to destination') || log.includes('no route')) {
      return {
        issue: 'No Route Found',
        explanation: `Your node couldn't find a path to the Loop server with ${amount_sats.toLocaleString()} sats. This usually means the network lacks channels with enough liquidity for your payment amount.`,
        immediate_actions: [
          'Try a smaller amount (start with 250k sats)',
          'Increase max routing fee to 10,000+ sats',
          'Wait 10-15 minutes and try again',
          'Connect to peers closer to Loop server'
        ],
        cli_commands: [
          `loop out --amt=250000 --max_swap_routing_fee=10000`,
          `lncli queryroutes --dest=<LOOP_PUBKEY> --amt=${Math.floor(amount_sats / 2)}`,
          `lncli listchannels | grep -E "active|remote_balance"`
        ],
        prevention_tips: [
          'Open channels to well-connected nodes like ACINQ, LNBig',
          'Monitor 1ML.com to find nodes with paths to Loop',
          'Keep multiple active channels for better routing'
        ],
        success_probability: amount_sats > 1_000_000 ? 0.3 : 0.7,
        difficulty: 'medium'
      };
    }

    if (log.includes('incorrect payment details') || log.includes('payment details')) {
      return {
        issue: 'Invalid Payment Data',
        explanation: 'Ride the Lightning or your wallet sent malformed payment data to the Loop server. This is often a GUI bug that can be bypassed with CLI.',
        immediate_actions: [
          'Switch to command line interface',
          'Check your Loop client version',
          'Restart your Lightning node',
          'Verify Loop server connectivity'
        ],
        cli_commands: [
          `loop out --amt=${amount_sats} --max_swap_routing_fee=${Math.max(max_routing_fee, 10000)}`,
          `loop quote out ${amount_sats}`,
          `lncli getinfo | grep version`
        ],
        prevention_tips: [
          'Use CLI for critical operations',
          'Keep Loop client updated',
          'Test with small amounts first'
        ],
        success_probability: 0.8,
        difficulty: 'easy'
      };
    }

    if (log.includes('insufficient funds') || log.includes('insufficient liquidity')) {
      return {
        issue: 'Insufficient Channel Liquidity',
        explanation: 'One or more channels in your routing path ran out of local balance during the payment attempt.',
        immediate_actions: [
          'Check your channel balances',
          'Try routing through different channels',
          'Reduce the loop amount',
          'Add more funds to channels'
        ],
        cli_commands: [
          `lncli listchannels`,
          `lncli channelbalance`,
          `loop out --amt=${Math.floor(amount_sats * 0.8)} --max_swap_routing_fee=${max_routing_fee}`
        ],
        prevention_tips: [
          'Monitor channel balances regularly',
          'Keep some local balance for routing',
          'Use automatic rebalancing tools'
        ],
        success_probability: 0.6,
        difficulty: 'medium'
      };
    }

    if (log.includes('fee exceeds maximum') || log.includes('routing fee')) {
      return {
        issue: 'Routing Fees Too High',
        explanation: 'The network path to Loop server requires higher fees than your maximum. Network congestion or long routing paths increase costs.',
        immediate_actions: [
          'Increase max_swap_routing_fee parameter',
          'Wait for lower network congestion',
          'Try smaller amounts',
          'Connect to nodes closer to Loop'
        ],
        cli_commands: [
          `loop out --amt=${amount_sats} --max_swap_routing_fee=${max_routing_fee * 2}`,
          `lncli feereport`,
          `lncli queryroutes --dest=<LOOP_PUBKEY> --amt=${amount_sats} --fee_limit=${max_routing_fee * 2}`
        ],
        prevention_tips: [
          'Set realistic fee budgets (1-5% of amount)',
          'Monitor network fee trends',
          'Use during low-congestion periods'
        ],
        success_probability: 0.9,
        difficulty: 'easy'
      };
    }

    if (log.includes('timeout') || log.includes('timed out')) {
      return {
        issue: 'Payment Timeout',
        explanation: 'The payment took too long to complete, often due to slow routing or unresponsive peers in the path.',
        immediate_actions: [
          'Try again immediately',
          'Use shorter timeout values',
          'Check peer connectivity',
          'Switch to better-connected peers'
        ],
        cli_commands: [
          `lncli listpeers | grep online`,
          `loop out --amt=${amount_sats} --max_swap_routing_fee=${max_routing_fee}`,
          `lncli describegraph | grep -A5 -B5 <PEER_PUBKEY>`
        ],
        prevention_tips: [
          'Connect to reliable, always-online peers',
          'Avoid routing through mobile/part-time nodes',
          'Keep good peer relationships'
        ],
        success_probability: 0.7,
        difficulty: 'medium'
      };
    }

    // Generic/unknown error
    return {
      issue: 'Unknown Loop Failure',
      explanation: 'Loop out failed for an unrecognized reason. This could be network issues, server problems, or configuration errors.',
      immediate_actions: [
        'Check Loop server status',
        'Verify your node connectivity',
        'Try with minimal amount (250k sats)',
        'Check system logs for more details'
      ],
      cli_commands: [
        `loop terms`,
        `lncli getinfo`,
        `lncli getnetworkinfo`,
        `loop out --amt=250000 --max_swap_routing_fee=10000`
      ],
      prevention_tips: [
        'Monitor Loop server announcements',
        'Keep Lightning node healthy',
        'Test regularly with small amounts'
      ],
      success_probability: 0.5,
      difficulty: 'hard'
    };
  }

  static generateReport(failure: LoopFailure): string {
    const suggestion = this.analyzeFaiiure(failure);
    
    return `
🔍 **Loop Out Troubleshooting Report**

**Issue:** ${suggestion.issue}
**Difficulty:** ${suggestion.difficulty.toUpperCase()}
**Success Probability:** ${Math.round(suggestion.success_probability * 100)}%

**What Happened:**
${suggestion.explanation}

**Immediate Actions:**
${suggestion.immediate_actions.map(action => `• ${action}`).join('\n')}

**CLI Commands to Try:**
\`\`\`bash
${suggestion.cli_commands?.join('\n') || 'No specific commands available'}
\`\`\`

**Prevention for Next Time:**
${suggestion.prevention_tips.map(tip => `• ${tip}`).join('\n')}

**From the Video:** Similar issues occurred when routing through 9+ hops to Loop server. The video creator succeeded by using CLI instead of GUI and setting --max_swap_routing_fee=10000.
    `.trim();
  }

  static suggestAlternatives(failure: LoopFailure): string[] {
    const alternatives = [
      'Try Lightning Terminal GUI instead of CLI',
      'Use Pool marketplace for channel liquidity',
      'Consider manual rebalancing instead of Loop',
      'Connect to Loop-adjacent peers first',
      'Wait for better network conditions'
    ];

    // Filter based on failure type
    if (failure.log.includes('no route')) {
      return alternatives.filter(alt => 
        alt.includes('Pool') || alt.includes('peers') || alt.includes('conditions')
      );
    }

    if (failure.log.includes('payment details')) {
      return alternatives.filter(alt => 
        alt.includes('Terminal') || alt.includes('manual')
      );
    }

    return alternatives.slice(0, 3);
  }
}

// Helper function for API routes
export function explainLoopFailure(log: string, context?: any): TroubleshootingSuggestion {
  const failure: LoopFailure = {
    log,
    error_type: 'unknown',
    amount_sats: context?.amount_sats || 250_000,
    max_routing_fee: context?.max_routing_fee || 0,
    hops_attempted: context?.hops_attempted,
    duration_minutes: context?.duration_minutes
  };

  return LoopTroubleshooter.analyzeFaiiure(failure);
} 