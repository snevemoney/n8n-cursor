import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface ChannelStatus {
  id: string;
  local_balance: number;
  remote_balance: number;
  capacity: number;
  active: boolean;
  peer_alias: string;
}

interface LiquidityStatus {
  status: 'good' | 'low-inbound' | 'low-outbound' | 'imbalanced' | 'no-channels';
  inbound_sats: number;
  outbound_sats: number;
  total_channels: number;
  active_channels: number;
  balance_ratio: number;
  recommendations: Array<{
    action: string;
    provider?: string;
    link?: string;
    amount?: number;
    priority: 'high' | 'medium' | 'low';
    reasoning: string;
  }>;
  issues: string[];
}

async function getUserChannels(userId: string): Promise<ChannelStatus[]> {
  // Mock channel data for now - replace with actual Lightning node integration
  return [
    {
      id: 'chan_1',
      local_balance: 500000,
      remote_balance: 50000,
      capacity: 550000,
      active: true,
      peer_alias: 'WalletOfSatoshi'
    },
    {
      id: 'chan_2', 
      local_balance: 300000,
      remote_balance: 200000,
      capacity: 500000,
      active: true,
      peer_alias: 'Bitfinex'
    }
  ];
}

function analyzeLiquidity(channels: ChannelStatus[]): LiquidityStatus {
  const activeChannels = channels.filter(c => c.active);
  const totalInbound = activeChannels.reduce((sum, c) => sum + c.remote_balance, 0);
  const totalOutbound = activeChannels.reduce((sum, c) => sum + c.local_balance, 0);
  const totalCapacity = totalInbound + totalOutbound;
  
  const balanceRatio = totalCapacity > 0 ? totalOutbound / totalCapacity : 0;
  
  const recommendations = [];
  const issues = [];
  let status: LiquidityStatus['status'] = 'good';

  // Check for no channels
  if (activeChannels.length === 0) {
    status = 'no-channels';
    issues.push('No active channels found');
    recommendations.push({
      action: 'open-channel',
      priority: 'high' as const,
      reasoning: 'You need to open at least one Lightning channel to start earning'
    });
    
    return {
      status,
      inbound_sats: 0,
      outbound_sats: 0,
      total_channels: channels.length,
      active_channels: 0,
      balance_ratio: 0,
      recommendations,
      issues
    };
  }

  // Check for low inbound liquidity (less than 10% inbound)
  if (totalInbound < totalCapacity * 0.1) {
    status = 'low-inbound';
    issues.push('Low inbound liquidity - other nodes cannot route payments through you');
    
    recommendations.push({
      action: 'get-inbound',
      provider: 'Magma',
      link: 'https://magma.money',
      amount: Math.max(100000, totalCapacity * 0.2),
      priority: 'high' as const,
      reasoning: 'Get inbound liquidity to enable others to route payments through your node'
    });
  }

  // Check for very imbalanced channels (>90% outbound)
  if (balanceRatio > 0.9) {
    status = 'imbalanced';
    issues.push('Channels are heavily imbalanced - consider rebalancing');
    
    recommendations.push({
      action: 'rebalance',
      priority: 'medium' as const,
      reasoning: 'Rebalance your channels to improve routing success rates'
    });
  }

  // Check for low outbound (less than 5% outbound)  
  if (totalOutbound < totalCapacity * 0.05) {
    status = 'low-outbound';
    issues.push('Very low outbound liquidity - you cannot send payments');
    
    recommendations.push({
      action: 'add-funds',
      priority: 'medium' as const,
      reasoning: 'Add more Bitcoin to your channels to enable outbound payments'
    });
  }

  return {
    status,
    inbound_sats: totalInbound,
    outbound_sats: totalOutbound,
    total_channels: channels.length,
    active_channels: activeChannels.length,
    balance_ratio: balanceRatio,
    recommendations,
    issues
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has acknowledged liquidity warnings recently
    const { data: userSettings } = await supabase
      .from('user_settings')
      .select('liquidity_warning_acknowledged, last_liquidity_fix')
      .eq('user_id', user.id)
      .single();

    // Get user's channels
    const channels = await getUserChannels(user.id);
    
    // Analyze liquidity status
    const liquidityStatus = analyzeLiquidity(channels);

    // If user recently fixed liquidity, don't show warnings for 24 hours
    const lastFix = userSettings?.last_liquidity_fix;
    const fixedRecently = lastFix && 
      new Date(lastFix).getTime() > Date.now() - (24 * 60 * 60 * 1000);

    if (fixedRecently && liquidityStatus.status !== 'no-channels') {
      liquidityStatus.status = 'good';
      liquidityStatus.issues = [];
    }

    // Log the liquidity check for analytics
    try {
      await supabase.from('liquidity_checks').insert({
        user_id: user.id,
        status: liquidityStatus.status,
        inbound_sats: liquidityStatus.inbound_sats,
        outbound_sats: liquidityStatus.outbound_sats,
        balance_ratio: liquidityStatus.balance_ratio,
        total_channels: liquidityStatus.total_channels,
        active_channels: liquidityStatus.active_channels,
        checked_at: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to log liquidity check:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json(liquidityStatus);

  } catch (error) {
    console.error('Error checking liquidity:', error);
    return NextResponse.json({ 
      error: 'Failed to check liquidity status' 
    }, { status: 500 });
  }
} 