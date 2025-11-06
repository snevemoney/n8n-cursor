/**
 * Channel Rebalancing API
 * Manages automated channel rebalancing
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { withRateLimit, defaultRateLimit } from '@/lib/middleware/rate-limiter'

interface RebalanceRequest {
  channelId?: string
  autoMode?: boolean
  maxFeePpm?: number
  targetBalance?: number // 0.5 = 50/50 balance
}

interface ChannelInfo {
  channelId: string
  localBalance: number
  remoteBalance: number
  capacity: number
  currentRatio: number
  isActive: boolean
  peerAlias?: string
}

interface RebalanceResult {
  success: boolean
  channelId: string
  oldBalance: number
  newBalance: number
  feesPaid: number
  method: 'loop_out' | 'submarine_swap' | 'circular_rebalance'
  transactionId?: string
}

async function getSupabaseClient(req: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set() {},
        remove() {}
      }
    }
  )
}

async function getChannelData(userId: string, channelId?: string): Promise<ChannelInfo[]> {
  // Mock data for development - in production, this would call LND gRPC
  const mockChannels: ChannelInfo[] = [
    {
      channelId: 'chan_001',
      localBalance: 250000,
      remoteBalance: 750000,
      capacity: 1000000,
      currentRatio: 0.25,
      isActive: true,
      peerAlias: 'WalletOfSatoshi'
    },
    {
      channelId: 'chan_002', 
      localBalance: 800000,
      remoteBalance: 200000,
      capacity: 1000000,
      currentRatio: 0.80,
      isActive: true,
      peerAlias: 'LNBig'
    },
    {
      channelId: 'chan_003',
      localBalance: 480000,
      remoteBalance: 520000,
      capacity: 1000000,
      currentRatio: 0.48,
      isActive: true,
      peerAlias: 'Bitrefill'
    }
  ]

  if (channelId) {
    return mockChannels.filter(c => c.channelId === channelId)
  }

  return mockChannels
}

async function executeRebalance(
  channel: ChannelInfo, 
  targetBalance: number = 0.5,
  maxFeePpm: number = 1000
): Promise<RebalanceResult> {
  // Simulate rebalancing logic
  const targetLocal = channel.capacity * targetBalance
  const currentLocal = channel.localBalance
  const difference = Math.abs(targetLocal - currentLocal)
  
  // Determine rebalance method based on difference
  let method: 'loop_out' | 'submarine_swap' | 'circular_rebalance'
  let feesPaid: number
  
  if (difference > 500000) {
    method = 'loop_out'
    feesPaid = Math.floor(difference * 0.003) // 0.3% fee
  } else if (difference > 100000) {
    method = 'submarine_swap'
    feesPaid = Math.floor(difference * 0.002) // 0.2% fee
  } else {
    method = 'circular_rebalance'
    feesPaid = Math.floor(difference * 0.001) // 0.1% fee
  }

  // Simulate transaction
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`

  return {
    success: true,
    channelId: channel.channelId,
    oldBalance: channel.currentRatio,
    newBalance: targetBalance,
    feesPaid,
    method,
    transactionId
  }
}

async function findUnbalancedChannels(channels: ChannelInfo[], threshold: number = 0.2): Promise<ChannelInfo[]> {
  return channels.filter(channel => {
    const ratio = channel.currentRatio
    return ratio < threshold || ratio > (1 - threshold)
  })
}

async function handler(req: NextRequest) {
  try {
    const supabase = await getSupabaseClient(req)
    
    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (req.method === 'GET') {
      // Get channel rebalance status
      const { searchParams } = new URL(req.url)
      const channelId = searchParams.get('channel_id')
      
      const channels = await getChannelData(user.id, channelId || undefined)
      const unbalancedChannels = await findUnbalancedChannels(channels)
      
      return NextResponse.json({
        channels,
        unbalancedChannels,
        recommendations: unbalancedChannels.map(channel => ({
          channelId: channel.channelId,
          currentRatio: channel.currentRatio,
          recommendedTarget: 0.5,
          estimatedFee: Math.floor(Math.abs(channel.capacity * 0.5 - channel.localBalance) * 0.002),
          priority: channel.currentRatio < 0.1 || channel.currentRatio > 0.9 ? 'high' : 'medium'
        }))
      })
    }

    if (req.method === 'POST') {
      const body: RebalanceRequest = await req.json()
      const { 
        channelId, 
        autoMode = false, 
        maxFeePpm = 1000, 
        targetBalance = 0.5 
      } = body

      let results: RebalanceResult[] = []

      if (autoMode) {
        // Auto-rebalance all unbalanced channels
        const channels = await getChannelData(user.id)
        const unbalancedChannels = await findUnbalancedChannels(channels)
        
        for (const channel of unbalancedChannels) {
          const result = await executeRebalance(channel, targetBalance, maxFeePpm)
          results.push(result)
        }
      } else if (channelId) {
        // Rebalance specific channel
        const channels = await getChannelData(user.id, channelId)
        if (channels.length === 0) {
          return NextResponse.json(
            { error: 'Channel not found' },
            { status: 404 }
          )
        }

        const result = await executeRebalance(channels[0], targetBalance, maxFeePpm)
        results.push(result)
      } else {
        return NextResponse.json(
          { error: 'Either channelId or autoMode=true is required' },
          { status: 400 }
        )
      }

      // Log rebalance operations
      for (const result of results) {
        await supabase
          .from('channel_rebalance_logs')
          .insert({
            user_id: user.id,
            channel_id: result.channelId,
            old_balance: result.oldBalance,
            new_balance: result.newBalance,
            fees_paid: result.feesPaid,
            method: result.method,
            transaction_id: result.transactionId,
            success: result.success
          })
      }

      return NextResponse.json({
        success: true,
        results,
        totalFees: results.reduce((sum, r) => sum + r.feesPaid, 0),
        channelsRebalanced: results.length
      })
    }

    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )

  } catch (error) {
    console.error('Channel rebalance error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Apply rate limiting
export const GET = withRateLimit(handler, defaultRateLimit)
export const POST = withRateLimit(handler, defaultRateLimit) 