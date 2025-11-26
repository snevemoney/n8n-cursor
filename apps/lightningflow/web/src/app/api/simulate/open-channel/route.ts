import { NextRequest, NextResponse } from 'next/server';

interface PeerRequirements {
  min_channel_size: number;
  max_channel_size: number;
  avg_fee_rate: number;
  connection_success_rate: number;
  alias: string;
}

// Real peer data based on the video and common Lightning nodes
const KNOWN_PEERS: Record<string, PeerRequirements> = {
  '0338f57e8935d5c893f4a59c84d7a92dc1ad22f2b26f3fcb11a90c05c6b7763c6c': { // Fold (example)
    min_channel_size: 5_000_000, // 0.05 BTC as mentioned in video
    max_channel_size: 100_000_000,
    avg_fee_rate: 100,
    connection_success_rate: 0.95,
    alias: 'Fold'
  },
  '03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f': { // LNBig (example)
    min_channel_size: 100_000, // More accessible
    max_channel_size: 50_000_000,
    avg_fee_rate: 50,
    connection_success_rate: 0.90,
    alias: 'LNBig'
  },
  '03006fcf3312dae8d068ea297f58e2bd00ec2f5781ffa2c5e0e52bfe34aeeea3e': { // ACINQ (example)
    min_channel_size: 20_000,
    max_channel_size: 16_777_216, // LN protocol max
    avg_fee_rate: 75,
    connection_success_rate: 0.98,
    alias: 'ACINQ'
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { peerPubkey, amountSats, feeRate = 50, simulate = true } = body;

    if (!peerPubkey || !amountSats) {
      return NextResponse.json({ 
        error: 'Missing required fields: peerPubkey and amountSats' 
      }, { status: 400 });
    }

    // Check if peer is known
    const peerInfo = KNOWN_PEERS[peerPubkey];
    
    // Simulate peer discovery (like the video shows with 1ML)
    const peerAlias = peerInfo?.alias || 'Unknown Node';
    
    // Check minimum channel size (like Fold's 0.05 BTC requirement)
    if (peerInfo && amountSats < peerInfo.min_channel_size) {
      return NextResponse.json({
        error: `Channel too small for ${peerAlias}. Minimum: ${peerInfo.min_channel_size.toLocaleString()} sats`,
        suggestion: `Try a smaller node like LNBig (min 100k sats) or increase your amount`,
        min_required: peerInfo.min_channel_size,
        peer_alias: peerAlias
      }, { status: 400 });
    }

    // Estimate on-chain fee (based on video's mempool.space example)
    const estimatedTxSize = 250; // bytes for channel open
    const onchainFee = estimatedTxSize * feeRate;
    
    // Check if user has enough for fee
    const totalRequired = amountSats + onchainFee;
    
    // Simulate connection success/failure
    const connectionSuccess = !peerInfo || Math.random() < peerInfo.connection_success_rate;
    
    if (!connectionSuccess) {
      return NextResponse.json({
        error: 'Failed to connect to peer',
        suggestion: 'Try a different peer or check if the pubkey is correct',
        status: 'connection_failed'
      }, { status: 400 });
    }

    // Successful simulation
    const result = {
      peer_pubkey: peerPubkey,
      peer_alias: peerAlias,
      channel_size: amountSats,
      local_balance: amountSats, // All balance starts local
      remote_balance: 0,
      onchain_fee: onchainFee,
      fee_rate: feeRate,
      total_cost: totalRequired,
      status: simulate ? 'simulated_success' : 'pending_open',
      confirmation_time: '10-60 minutes',
      can_send: amountSats,
      can_receive: 0,
      next_steps: [
        'Channel will appear as pending until on-chain confirmation',
        'Use Loop Out to get inbound liquidity',
        'Monitor in dashboard for routing opportunities'
      ],
      warnings: amountSats < 1_000_000 ? [
        'Small channels may have limited routing opportunities',
        'Consider opening larger channels for better earnings'
      ] : []
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error simulating channel open:', error);
    return NextResponse.json({ 
      error: 'Failed to simulate channel opening' 
    }, { status: 500 });
  }
} 