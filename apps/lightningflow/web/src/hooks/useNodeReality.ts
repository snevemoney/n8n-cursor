/**
 * Lightning Node Reality Hook
 * 
 * Provides real-time Lightning node constraints and validation
 * to prevent impossible operations and educate users about limits.
 * 
 * Senior Architecture: Reality-Aware Design
 */

"use client"

import { useState, useEffect, useCallback } from 'react'
import { useToaster } from './useToaster'

// Lightning Network Constraints
export const LIGHTNING_LIMITS = {
  MAX_PPM: 5000,           // Maximum fee rate in parts per million
  MIN_PPM: 0,              // Minimum fee rate
  DUST_LIMIT: 546,         // Minimum payment amount in sats
  MAX_HTLC_COUNT: 483,     // Maximum HTLCs per channel
  FEE_UPDATE_COOLDOWN: 30 * 60 * 1000, // 30 minutes between fee updates
  MAX_FEE_UPDATES_PER_HOUR: 5,
  MIN_CHANNEL_SIZE: 20000, // Minimum channel size in sats
  MAX_PAYMENT_SIZE: 4294967295, // Max payment size (uint32)
} as const

export interface NodeLiquidity {
  totalBalance: number
  localBalance: number      // Outbound capacity (can send)
  remoteBalance: number     // Inbound capacity (can receive)
  pendingBalance: number
  channelCount: number
  activeChannels: number
  pendingChannels: number
}

export interface ChannelInfo {
  channelId: string
  localBalance: number
  remoteBalance: number
  capacity: number
  active: boolean
  peerAlias: string
  feeRate: number
  lastFeeUpdate?: Date
}

export interface NodeConstraints {
  maxSendable: number
  maxReceivable: number
  canOpenChannels: boolean
  feeUpdateAllowed: boolean
  routingCapable: boolean
}

export interface LiquidityCheck {
  canSend: boolean
  canReceive: boolean
  maxSendAmount: number
  maxReceiveAmount: number
  warnings: string[]
  recommendations: string[]
}

export function useNodeReality() {
  const [liquidity, setLiquidity] = useState<NodeLiquidity | null>(null)
  const [channels, setChannels] = useState<ChannelInfo[]>([])
  const [constraints, setConstraints] = useState<NodeConstraints | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  
  const { warning, error, info } = useToaster()

  // Fetch real node data (would connect to LND/CLN in production)
  const fetchNodeData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // In production, this would call your Lightning node API
      // For now, we'll simulate realistic data
      const mockLiquidity: NodeLiquidity = {
        totalBalance: 1250000,    // 1.25M sats
        localBalance: 750000,     // 750k sats outbound
        remoteBalance: 500000,    // 500k sats inbound
        pendingBalance: 0,
        channelCount: 4,
        activeChannels: 4,
        pendingChannels: 0
      }
      
      const mockChannels: ChannelInfo[] = [
        {
          channelId: '123456789',
          localBalance: 300000,
          remoteBalance: 200000,
          capacity: 500000,
          active: true,
          peerAlias: 'ACINQ',
          feeRate: 1000, // 1000 ppm
          lastFeeUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          channelId: '987654321',
          localBalance: 450000,
          remoteBalance: 300000,
          capacity: 750000,
          active: true,
          peerAlias: 'Bitrefill',
          feeRate: 500,
          lastFeeUpdate: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
        }
      ]
      
      setLiquidity(mockLiquidity)
      setChannels(mockChannels)
      setLastUpdate(new Date())
      
      // Calculate constraints
      const nodeConstraints: NodeConstraints = {
        maxSendable: mockLiquidity.localBalance,
        maxReceivable: mockLiquidity.remoteBalance,
        canOpenChannels: mockLiquidity.totalBalance > LIGHTNING_LIMITS.MIN_CHANNEL_SIZE,
        feeUpdateAllowed: true, // Would check rate limits in production
        routingCapable: mockLiquidity.activeChannels >= 2
      }
      
      setConstraints(nodeConstraints)
      
    } catch (err) {
      error('Failed to fetch node data', {
        description: 'Could not connect to Lightning node'
      })
    } finally {
      setIsLoading(false)
    }
  }, [error])

  // Check if a payment amount is valid
  const checkPaymentLiquidity = useCallback((amount: number, type: 'send' | 'receive'): LiquidityCheck => {
    if (!liquidity || !constraints) {
      return {
        canSend: false,
        canReceive: false,
        maxSendAmount: 0,
        maxReceiveAmount: 0,
        warnings: ['Node data not available'],
        recommendations: ['Refresh node data']
      }
    }

    const warnings: string[] = []
    const recommendations: string[] = []
    
    // Check dust limit
    if (amount < LIGHTNING_LIMITS.DUST_LIMIT) {
      warnings.push(`Amount below dust limit (${LIGHTNING_LIMITS.DUST_LIMIT} sats)`)
      recommendations.push('Increase payment amount or combine with other payments')
    }
    
    // Check maximum payment size
    if (amount > LIGHTNING_LIMITS.MAX_PAYMENT_SIZE) {
      warnings.push('Amount exceeds Lightning Network maximum')
      recommendations.push('Split into multiple smaller payments')
    }

    if (type === 'send') {
      const canSend = amount <= constraints.maxSendable && amount >= LIGHTNING_LIMITS.DUST_LIMIT
      
      if (!canSend && amount > constraints.maxSendable) {
        warnings.push(`Insufficient outbound liquidity (${constraints.maxSendable.toLocaleString()} sats available)`)
        recommendations.push('Open new channels or rebalance existing ones')
      }
      
      // Warn if using most of the liquidity
      if (amount > constraints.maxSendable * 0.9) {
        warnings.push('Using 90%+ of outbound liquidity')
        recommendations.push('Consider keeping some liquidity for routing fees')
      }

      return {
        canSend,
        canReceive: false,
        maxSendAmount: constraints.maxSendable,
        maxReceiveAmount: 0,
        warnings,
        recommendations
      }
    } else {
      const canReceive = amount <= constraints.maxReceivable
      
      if (!canReceive) {
        warnings.push(`Insufficient inbound liquidity (${constraints.maxReceivable.toLocaleString()} sats available)`)
        recommendations.push('Request smaller amount or increase inbound liquidity')
      }

      return {
        canSend: false,
        canReceive,
        maxSendAmount: 0,
        maxReceiveAmount: constraints.maxReceivable,
        warnings,
        recommendations
      }
    }
  }, [liquidity, constraints])

  // Validate fee rate changes
  const validateFeeRate = useCallback((channelId: string, newFeeRate: number): {
    valid: boolean
    warnings: string[]
    recommendations: string[]
  } => {
    const warnings: string[] = []
    const recommendations: string[] = []
    
    // Check fee rate bounds
    if (newFeeRate < LIGHTNING_LIMITS.MIN_PPM || newFeeRate > LIGHTNING_LIMITS.MAX_PPM) {
      return {
        valid: false,
        warnings: [`Fee rate must be between ${LIGHTNING_LIMITS.MIN_PPM} and ${LIGHTNING_LIMITS.MAX_PPM} ppm`],
        recommendations: ['Use a competitive fee rate between 100-2000 ppm']
      }
    }
    
    // Check rate limiting
    const channel = channels.find(c => c.channelId === channelId)
    if (channel?.lastFeeUpdate) {
      const timeSinceUpdate = Date.now() - channel.lastFeeUpdate.getTime()
      if (timeSinceUpdate < LIGHTNING_LIMITS.FEE_UPDATE_COOLDOWN) {
        const remainingTime = Math.ceil((LIGHTNING_LIMITS.FEE_UPDATE_COOLDOWN - timeSinceUpdate) / (60 * 1000))
        return {
          valid: false,
          warnings: [`Fee update cooldown active (${remainingTime} minutes remaining)`],
          recommendations: ['Wait before updating fees again to avoid rate limiting']
        }
      }
    }
    
    // Provide guidance on fee rates
    if (newFeeRate > 2000) {
      warnings.push('High fee rate may discourage routing')
      recommendations.push('Consider lower fees to attract more routing traffic')
    }
    
    if (newFeeRate < 100) {
      warnings.push('Very low fee rate may not be profitable')
      recommendations.push('Ensure fees cover your costs and provide reasonable profit')
    }

    return {
      valid: true,
      warnings,
      recommendations
    }
  }, [channels])

  // Check if a route exists (simplified check)
  const checkRouteExists = useCallback(async (destination: string, amount: number): Promise<{
    exists: boolean
    estimatedFee?: number
    warnings: string[]
  }> => {
    // In production, this would call lncli queryroutes
    // For now, simulate based on liquidity
    
    const liquidityCheck = checkPaymentLiquidity(amount, 'send')
    
    if (!liquidityCheck.canSend) {
      return {
        exists: false,
        warnings: ['No route available - insufficient local liquidity']
      }
    }
    
    // Simulate route probability based on amount
    const routeProbability = amount < 100000 ? 0.95 : amount < 500000 ? 0.8 : 0.6
    const routeExists = Math.random() < routeProbability
    
    return {
      exists: routeExists,
      estimatedFee: routeExists ? Math.ceil(amount * 0.001) : undefined, // 0.1% fee estimate
      warnings: routeExists ? [] : ['No route found - try smaller amount or different timing']
    }
  }, [checkPaymentLiquidity])

  // Get earnings projection based on real data
  const getEarningsProjection = useCallback((): {
    dailyEstimate: number
    monthlyEstimate: number
    confidence: 'low' | 'medium' | 'high'
    factors: string[]
  } => {
    if (!liquidity || !constraints) {
      return {
        dailyEstimate: 0,
        monthlyEstimate: 0,
        confidence: 'low',
        factors: ['Insufficient data']
      }
    }
    
    const factors: string[] = []
    let confidence: 'low' | 'medium' | 'high' = 'medium'
    
    // Base estimate on channel capacity and routing capability
    const totalCapacity = channels.reduce((sum, ch) => sum + ch.capacity, 0)
    const avgFeeRate = channels.reduce((sum, ch) => sum + ch.feeRate, 0) / channels.length
    
    // Estimate daily routing volume (very simplified)
    const estimatedDailyVolume = totalCapacity * 0.1 // 10% of capacity per day
    const dailyEstimate = (estimatedDailyVolume * avgFeeRate) / 1000000 // Convert ppm to sats
    
    factors.push(`${channels.length} active channels`)
    factors.push(`${totalCapacity.toLocaleString()} sats total capacity`)
    factors.push(`${avgFeeRate} ppm average fee rate`)
    
    if (channels.length < 2) {
      confidence = 'low'
      factors.push('Need more channels for reliable routing')
    }
    
    if (!constraints.routingCapable) {
      confidence = 'low'
      factors.push('Node not optimally configured for routing')
    }

    return {
      dailyEstimate: Math.round(dailyEstimate),
      monthlyEstimate: Math.round(dailyEstimate * 30),
      confidence,
      factors
    }
  }, [liquidity, constraints, channels])

  // Refresh data
  const refresh = useCallback(() => {
    fetchNodeData()
  }, [fetchNodeData])

  // Initial load
  useEffect(() => {
    fetchNodeData()
    
    // Set up periodic refresh (every 30 seconds)
    const interval = setInterval(fetchNodeData, 30000)
    return () => clearInterval(interval)
  }, [fetchNodeData])

  return {
    // Data
    liquidity,
    channels,
    constraints,
    isLoading,
    lastUpdate,
    
    // Validation functions
    checkPaymentLiquidity,
    validateFeeRate,
    checkRouteExists,
    getEarningsProjection,
    
    // Actions
    refresh,
    
    // Constants for UI
    LIMITS: LIGHTNING_LIMITS
  }
} 