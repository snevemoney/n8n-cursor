import { NextRequest, NextResponse } from 'next/server';

interface LoopOutRequest {
  channelId: string;
  amountSats: number;
  maxRoutingFee?: number;
  confTarget?: number;
  force?: boolean;
}

interface RouteFailure {
  reason: 'no_route' | 'incorrect_payment_details' | 'insufficient_liquidity' | 'timeout' | 'fee_too_high';
  message: string;
  suggestion: string;
  cli_command?: string;
}

// Simulate routing difficulty based on amount (larger = harder)
function calculateRouteSuccess(amountSats: number, maxRoutingFee: number = 0): { success: boolean; hops?: number; failure?: RouteFailure } {
  // From video: 250k sats minimum, 9 hops to Loop server indicates difficulty
  const baseSuccessRate = 0.7;
  const amountPenalty = Math.max(0, (amountSats - 250_000) / 1_000_000) * 0.3;
  const feeBonus = Math.min(0.2, maxRoutingFee / 10_000); // Better success with higher fees
  
  const successRate = Math.max(0.1, baseSuccessRate - amountPenalty + feeBonus);
  const success = Math.random() < successRate;
  
  const hops = Math.floor(Math.random() * 8) + 3; // 3-10 hops like video
  
  if (!success) {
    const failures: RouteFailure[] = [
      {
        reason: 'no_route',
        message: 'failed to find a path to destination',
        suggestion: 'Try lowering the amount or connecting to more peers closer to Loop server',
        cli_command: `loop out --amt=${amountSats} --max_swap_routing_fee=${Math.max(maxRoutingFee, 10000)}`
      },
      {
        reason: 'incorrect_payment_details', 
        message: 'incorrect payment details',
        suggestion: 'Ride the Lightning may have sent invalid data. Try using CLI instead',
        cli_command: `loop out --amt=${amountSats} --max_swap_routing_fee=10000`
      },
      {
        reason: 'insufficient_liquidity',
        message: 'temporary channel failure',
        suggestion: 'One of the routing channels ran out of liquidity. Try again in a few minutes'
      },
      {
        reason: 'fee_too_high',
        message: 'fee exceeds maximum',
        suggestion: 'Increase max_swap_routing_fee parameter'
      }
    ];
    
    const randomFailure = failures[Math.floor(Math.random() * failures.length)];
    return { success: false, failure: randomFailure };
  }
  
  return { success: true, hops };
}

export async function POST(request: NextRequest) {
  try {
    const body: LoopOutRequest = await request.json();
    const { channelId, amountSats, maxRoutingFee = 0, confTarget = 144, force = false } = body;

    if (!channelId || !amountSats) {
      return NextResponse.json({ 
        error: 'Missing required fields: channelId and amountSats' 
      }, { status: 400 });
    }

    // Validate minimum amount (from video)
    if (amountSats < 250_000) {
      return NextResponse.json({
        error: 'Amount too small',
        message: 'Loop service minimum is 250,000 sats',
        min_amount: 250_000
      }, { status: 400 });
    }

    // Estimate fees (based on video estimates)
    const prepayAmount = Math.floor(amountSats * 0.01); // ~1% prepay to prevent DoS
    const estimatedOnchainFee = confTarget <= 6 ? 20_000 : confTarget <= 144 ? 5_000 : 1_500;
    const maxOnchainSweepFee = Math.min(100_000, amountSats * 0.1); // Up to 10% of amount
    
    // Route finding simulation
    const routeResult = calculateRouteSuccess(amountSats, maxRoutingFee);
    
    if (!routeResult.success && !force) {
      const failure = routeResult.failure!;
      
      return NextResponse.json({
        status: 'failed',
        reason: failure.reason,
        message: failure.message,
        suggestion: failure.suggestion,
        cli_command: failure.cli_command,
        duration: '5-30 minutes', // How long it tried before failing
        retry_suggestions: [
          'Increase max routing fee',
          'Try smaller amount',
          'Wait for network conditions to improve',
          'Connect to peers closer to Loop server'
        ]
      }, { status: 400 });
    }

    // Successful loop out simulation
    const totalFees = prepayAmount + estimatedOnchainFee + (maxRoutingFee || 2000);
    const netReceived = amountSats - totalFees;
    
    // Simulate the stages from video: initiated -> preimage_revealed -> completed
    const stages = [
      { stage: 'initiated', duration: '0-5s', description: 'Loop request submitted' },
      { stage: 'htlc_published', duration: '5-30s', description: 'Finding route to Loop server' },
      { stage: 'preimage_revealed', duration: '30s-5min', description: 'Payment sent, waiting for on-chain' },
      { stage: 'success', duration: '10min-24h', description: 'On-chain transaction confirmed' }
    ];

    const result = {
      status: 'success',
      channel_id: channelId,
      amount_sats: amountSats,
      routing_hops: routeResult.hops,
      fees: {
        prepay: prepayAmount,
        routing: maxRoutingFee || 2000,
        onchain_estimate: estimatedOnchainFee,
        max_onchain_sweep: maxOnchainSweepFee,
        total: totalFees
      },
      net_received: netReceived,
      new_remote_balance: amountSats,
      onchain_arrival_time: confTarget <= 6 ? '10-60 minutes' : confTarget <= 144 ? '1-24 hours' : '1-7 days',
      stages,
      current_stage: 'preimage_revealed',
      active_htlc: {
        amount: amountSats,
        destination: 'Loop Server',
        state: 'SUCCEEDED'
      },
      onchain_tx: {
        amount: netReceived,
        confirmations: 0,
        fee_rate: `${Math.ceil(estimatedOnchainFee / 250)} sat/vB`,
        estimated_blocks: confTarget
      },
      monitoring: {
        check_status: 'loop monitor',
        view_htlcs: 'Check Active HTLCs in dashboard',
        cancel_option: stages.find(s => s.stage === 'initiated') ? 'Can cancel if still initiated' : 'Cannot cancel after HTLC published'
      }
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error simulating loop out:', error);
    return NextResponse.json({ 
      error: 'Failed to simulate loop out' 
    }, { status: 500 });
  }
} 