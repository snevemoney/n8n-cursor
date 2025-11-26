import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Safe Supabase client creation with fallbacks
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
    console.warn('Supabase not configured - using mock mode');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

const supabase = createSupabaseClient();

interface ChannelOptimizationRequest {
  channelId?: string; // If not provided, optimize all channels
  strategy?: 'aggressive' | 'conservative' | 'balanced';
  maxFeePpm?: number;
  minFeePpm?: number;
  considerRebalanceCost?: boolean;
}

interface ChannelTier {
  tier: 'tier1_high_throughput' | 'tier2_dormant' | 'tier3_symbiotic' | 'unknown';
  strategy: {
    baseFeeStrategy: 'high' | 'medium' | 'low' | 'dynamic';
    rebalanceFrequency: 'aggressive' | 'moderate' | 'conservative';
    feeAdjustmentRate: number; // Percentage change per adjustment
  };
}

interface OptimizationResult {
  channelId: string;
  currentFeePpm: number;
  suggestedFeePpm: number;
  reasoning: string;
  tier: string;
  expectedImpact: {
    routingVolumeChange: number;
    revenueChange: number;
    rebalanceCostChange: number;
  };
}

/**
 * Channel Fee Optimizer API
 * 
 * Implements the dynamic fee optimization strategy:
 * - Tier-based fee management (Tier 1: High-throughput, Tier 2: Dormant, Tier 3: Symbiotic)
 * - Routing-aware fee adjustments
 * - Rebalancing cost consideration
 * - Machine learning-based recommendations
 */
export async function POST(request: NextRequest) {
  try {
    // Return mock response if Supabase not configured
    if (!supabase) {
      const {
        channelId,
        strategy = 'balanced'
      }: ChannelOptimizationRequest = await request.json();

      const mockResults: OptimizationResult[] = [
        {
          channelId: channelId || 'mock-channel-1',
          currentFeePpm: 1000,
          suggestedFeePpm: 1200,
          reasoning: 'Mock optimization: Increase fees to boost revenue',
          tier: 'tier1_high_throughput',
          expectedImpact: {
            routingVolumeChange: -5,
            revenueChange: 15,
            rebalanceCostChange: 0
          }
        },
        {
          channelId: 'mock-channel-2',
          currentFeePpm: 2000,
          suggestedFeePpm: 1500,
          reasoning: 'Mock optimization: Reduce fees to attract routing',
          tier: 'tier2_dormant',
          expectedImpact: {
            routingVolumeChange: 25,
            revenueChange: 10,
            rebalanceCostChange: -200
          }
        }
      ];

      return NextResponse.json({
        success: true,
        optimizationResults: channelId ? mockResults.slice(0, 1) : mockResults,
        summary: {
          strategy,
          totalChannels: channelId ? 1 : 2,
          channelsOptimized: channelId ? 1 : 2,
          averageFeeChange: 12.5,
          expectedRevenueIncrease: channelId ? 15 : 25,
        },
        timestamp: new Date().toISOString(),
        mode: 'mock'
      });
    }

    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    const {
      channelId,
      strategy = 'balanced',
      maxFeePpm = 5000,
      minFeePpm = 1,
      considerRebalanceCost = true
    }: ChannelOptimizationRequest = await request.json();

    // Fetch channel data for optimization
    let channelQuery = supabase
      .from('channel_stats')
      .select('*')
      .eq('user_id', userId);

    if (channelId) {
      channelQuery = channelQuery.eq('channel_id', channelId);
    }

    const { data: channels, error: channelError } = await channelQuery;

    if (channelError) {
      throw new Error(`Failed to fetch channel data: ${channelError.message}`);
    }

    if (!channels || channels.length === 0) {
      return NextResponse.json(
        { error: 'No channels found for optimization' },
        { status: 404 }
      );
    }

    // Optimize each channel
    const optimizationResults: OptimizationResult[] = [];
    
    for (const channel of channels) {
      const result = await optimizeChannel(channel, {
        strategy,
        maxFeePpm,
        minFeePpm,
        considerRebalanceCost,
      });
      
      optimizationResults.push(result);
      
      // Update suggested fee in database
      await supabase
        .from('channel_stats')
        .update({ 
          suggested_fee_ppm: result.suggestedFeePpm,
          tier_last_calculated: new Date().toISOString(),
        })
        .eq('id', channel.id);
    }

    // Calculate overall impact
    const totalImpact = optimizationResults.reduce(
      (acc, result) => ({
        totalChannels: acc.totalChannels + 1,
        averageFeeChange: acc.averageFeeChange + ((result.suggestedFeePpm - result.currentFeePpm) / result.currentFeePpm) * 100,
        expectedRevenueIncrease: acc.expectedRevenueIncrease + result.expectedImpact.revenueChange,
        channelsOptimized: acc.channelsOptimized + (result.suggestedFeePpm !== result.currentFeePpm ? 1 : 0),
      }),
      { totalChannels: 0, averageFeeChange: 0, expectedRevenueIncrease: 0, channelsOptimized: 0 }
    );

    totalImpact.averageFeeChange = totalImpact.averageFeeChange / totalImpact.totalChannels;

    return NextResponse.json({
      success: true,
      optimizationResults,
      summary: {
        strategy,
        totalChannels: totalImpact.totalChannels,
        channelsOptimized: totalImpact.channelsOptimized,
        averageFeeChange: Math.round(totalImpact.averageFeeChange * 100) / 100,
        expectedRevenueIncrease: Math.round(totalImpact.expectedRevenueIncrease),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Fee optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize channel fees' },
      { status: 500 }
    );
  }
}

/**
 * Optimize fees for a single channel
 */
async function optimizeChannel(
  channel: any,
  options: {
    strategy: string;
    maxFeePpm: number;
    minFeePpm: number;
    considerRebalanceCost: boolean;
  }
): Promise<OptimizationResult> {
  // Determine channel tier based on activity
  const tier = determineChannelTier(channel);
  const tierStrategy = getTierStrategy(tier);
  
  // Current metrics
  const currentFeePpm = channel.current_fee_ppm || 1000;
  const routingVolume7d = channel.sats_routed_7d || 0;
  const revenue7d = channel.revenue_7d_msat || 0;
  const lastActivity = new Date(channel.last_activity);
  const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
  
  let suggestedFeePpm = currentFeePpm;
  let reasoning = '';

  // Strategy-based optimization
  switch (tier) {
    case 'tier1_high_throughput':
      // High-volume peers: optimize for volume vs revenue balance
      if (routingVolume7d > 1000000) { // > 1M sats/week
        if (revenue7d / routingVolume7d < 0.001) { // Low revenue per sat
          suggestedFeePpm = Math.min(currentFeePpm * 1.2, options.maxFeePpm);
          reasoning = 'High volume, low revenue rate - increasing fees to optimize revenue';
        } else if (daysSinceActivity > 1) {
          suggestedFeePpm = Math.max(currentFeePpm * 0.9, options.minFeePpm);
          reasoning = 'Reduced recent activity - lowering fees to attract routing';
        }
      } else {
        reasoning = 'High-throughput channel performing within targets';
      }
      break;

    case 'tier2_dormant':
      // Dormant channels: aggressive fee reduction to stimulate activity
      if (daysSinceActivity > 7) {
        suggestedFeePpm = Math.max(currentFeePpm * 0.5, options.minFeePpm);
        reasoning = 'Dormant channel - aggressively reducing fees to stimulate routing';
      } else if (daysSinceActivity > 3) {
        suggestedFeePpm = Math.max(currentFeePpm * 0.8, options.minFeePpm);
        reasoning = 'Low activity - reducing fees to encourage routing';
      }
      break;

    case 'tier3_symbiotic':
      // Symbiotic channels: moderate, stable fees
      if (routingVolume7d > 0) {
        const revenueRate = revenue7d / routingVolume7d;
        if (revenueRate < 0.0005) {
          suggestedFeePpm = Math.min(currentFeePpm * 1.1, options.maxFeePpm);
          reasoning = 'Symbiotic channel with low revenue rate - modest fee increase';
        } else if (revenueRate > 0.002) {
          suggestedFeePpm = Math.max(currentFeePpm * 0.95, options.minFeePpm);
          reasoning = 'Symbiotic channel with high revenue rate - slight fee reduction for volume';
        }
      }
      break;

    default:
      // Unknown tier: conservative approach
      if (daysSinceActivity > 14) {
        suggestedFeePpm = Math.max(currentFeePpm * 0.7, options.minFeePpm);
        reasoning = 'Unknown tier with long inactivity - reducing fees';
      }
  }

  // Rebalancing cost consideration
  if (options.considerRebalanceCost && channel.avg_rebalance_cost_ppm > 0) {
    const minProfitableFeePpm = channel.avg_rebalance_cost_ppm * 1.5; // 50% profit margin
    if (suggestedFeePpm < minProfitableFeePpm) {
      suggestedFeePpm = minProfitableFeePpm;
      reasoning += ` (Adjusted for rebalancing cost: ${channel.avg_rebalance_cost_ppm} ppm)`;
    }
  }

  // Strategy modifications
  switch (options.strategy) {
    case 'aggressive':
      if (tier === 'tier2_dormant') {
        suggestedFeePpm = Math.max(suggestedFeePpm * 0.8, options.minFeePpm);
      } else {
        suggestedFeePpm = Math.min(suggestedFeePpm * 1.1, options.maxFeePpm);
      }
      break;
    case 'conservative':
      const change = suggestedFeePpm - currentFeePpm;
      suggestedFeePpm = currentFeePpm + (change * 0.5); // 50% of suggested change
      break;
  }

  // Ensure within bounds
  suggestedFeePpm = Math.max(options.minFeePpm, Math.min(options.maxFeePpm, suggestedFeePpm));
  suggestedFeePpm = Math.round(suggestedFeePpm);

  // Calculate expected impact
  const expectedImpact = calculateExpectedImpact(channel, currentFeePpm, suggestedFeePpm);

  if (suggestedFeePpm === currentFeePpm) {
    reasoning = reasoning || 'Channel fees are already optimized';
  }

  return {
    channelId: channel.channel_id,
    currentFeePpm,
    suggestedFeePpm,
    reasoning,
    tier,
    expectedImpact,
  };
}

/**
 * Determine channel tier based on activity patterns
 */
function determineChannelTier(channel: any): string {
  const routingVolume7d = channel.sats_routed_7d || 0;
  const forwards7d = channel.forwards_7d || 0;
  const lastActivity = new Date(channel.last_activity);
  const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

  // Tier 1: High-throughput (frequent, high-volume routing)
  if (routingVolume7d > 500000 && forwards7d > 10 && daysSinceActivity < 3) {
    return 'tier1_high_throughput';
  }

  // Tier 2: Dormant (little to no recent activity)
  if (daysSinceActivity > 7 || (routingVolume7d < 10000 && forwards7d < 2)) {
    return 'tier2_dormant';
  }

  // Tier 3: Symbiotic (moderate, consistent activity)
  if (routingVolume7d > 10000 && forwards7d > 2) {
    return 'tier3_symbiotic';
  }

  return 'unknown';
}

/**
 * Get optimization strategy for tier
 */
function getTierStrategy(tier: string): ChannelTier['strategy'] {
  const strategies: Record<string, ChannelTier['strategy']> = {
    tier1_high_throughput: {
      baseFeeStrategy: 'dynamic',
      rebalanceFrequency: 'aggressive',
      feeAdjustmentRate: 0.1, // 10%
    },
    tier2_dormant: {
      baseFeeStrategy: 'low',
      rebalanceFrequency: 'conservative',
      feeAdjustmentRate: 0.3, // 30%
    },
    tier3_symbiotic: {
      baseFeeStrategy: 'medium',
      rebalanceFrequency: 'moderate',
      feeAdjustmentRate: 0.15, // 15%
    },
    unknown: {
      baseFeeStrategy: 'medium',
      rebalanceFrequency: 'conservative',
      feeAdjustmentRate: 0.1, // 10%
    },
  };

  return strategies[tier] || strategies.unknown;
}

/**
 * Calculate expected impact of fee change
 */
function calculateExpectedImpact(
  channel: any,
  currentFeePpm: number,
  suggestedFeePpm: number
): OptimizationResult['expectedImpact'] {
  const feeChangeRatio = suggestedFeePpm / currentFeePpm;
  const currentVolume7d = channel.sats_routed_7d || 0;
  const currentRevenue7d = channel.revenue_7d_msat || 0;

  // Simple elasticity model (you could make this more sophisticated)
  const volumeElasticity = -0.5; // 1% fee increase = 0.5% volume decrease
  const volumeChangePercent = (feeChangeRatio - 1) * volumeElasticity * 100;
  
  const expectedNewVolume = currentVolume7d * (1 + volumeChangePercent / 100);
  const expectedNewRevenue = expectedNewVolume * (suggestedFeePpm / 1000000); // Convert ppm to ratio
  
  return {
    routingVolumeChange: Math.round((expectedNewVolume - currentVolume7d) / 1000), // In thousands of sats
    revenueChange: Math.round(expectedNewRevenue - (currentRevenue7d / 1000)), // In sats
    rebalanceCostChange: 0, // Would need more complex modeling
  };
}

/**
 * GET endpoint for fee optimization analysis
 */
export async function GET(request: NextRequest) {
  try {
    // Return mock response if Supabase not configured
    if (!supabase) {
      const { searchParams } = new URL(request.url);
      const channelId = searchParams.get('channelId');

      const mockAnalysis = [
        {
          channelId: channelId || 'mock-channel-1',
          currentTier: 'tier1_high_throughput',
          metrics: {
            currentFeePpm: 1000,
            suggestedFeePpm: 1200,
            routingVolume7d: 500000,
            revenue7d: 500,
            daysSinceActivity: 1,
            rebalanceCostPpm: 50,
          },
          recommendations: {
            shouldOptimize: true,
            priority: 'medium',
          }
        },
        {
          channelId: 'mock-channel-2',
          currentTier: 'tier2_dormant',
          metrics: {
            currentFeePpm: 2000,
            suggestedFeePpm: 1500,
            routingVolume7d: 5000,
            revenue7d: 10,
            daysSinceActivity: 10,
            rebalanceCostPpm: 100,
          },
          recommendations: {
            shouldOptimize: true,
            priority: 'high',
          }
        }
      ];

      const filteredAnalysis = channelId ? mockAnalysis.slice(0, 1) : mockAnalysis;

      return NextResponse.json({
        success: true,
        channels: filteredAnalysis,
        summary: {
          totalChannels: filteredAnalysis.length,
          channelsNeedingOptimization: filteredAnalysis.length,
          tierDistribution: {
            tier1_high_throughput: channelId ? 1 : 1,
            tier2_dormant: channelId ? 0 : 1,
          },
        },
        mode: 'mock'
      });
    }

    const { searchParams } = new URL(request.url);
    const userId = request.headers.get('x-user-id');
    const channelId = searchParams.get('channelId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    // Fetch channel statistics for analysis
    let query = supabase
      .from('channel_stats')
      .select('*')
      .eq('user_id', userId);

    if (channelId) {
      query = query.eq('channel_id', channelId);
    }

    const { data: channels, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch channels: ${error.message}`);
    }

    // Analyze each channel without making changes
    const analysis = channels?.map(channel => ({
      channelId: channel.channel_id,
      currentTier: determineChannelTier(channel),
      metrics: {
        currentFeePpm: channel.current_fee_ppm,
        suggestedFeePpm: channel.suggested_fee_ppm,
        routingVolume7d: channel.sats_routed_7d,
        revenue7d: channel.revenue_7d_msat,
        daysSinceActivity: Math.floor((Date.now() - new Date(channel.last_activity).getTime()) / (1000 * 60 * 60 * 24)),
        rebalanceCostPpm: channel.avg_rebalance_cost_ppm,
      },
      recommendations: {
        shouldOptimize: channel.current_fee_ppm !== channel.suggested_fee_ppm,
        priority: channel.tier === 'tier2_dormant' ? 'high' : 'medium',
      }
    })) || [];

    return NextResponse.json({
      success: true,
      channels: analysis,
      summary: {
        totalChannels: analysis.length,
        channelsNeedingOptimization: analysis.filter(c => c.recommendations.shouldOptimize).length,
        tierDistribution: analysis.reduce((acc, channel) => {
          acc[channel.currentTier] = (acc[channel.currentTier] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    });

  } catch (error) {
    console.error('Fee analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze channel fees' },
      { status: 500 }
    );
  }
} 