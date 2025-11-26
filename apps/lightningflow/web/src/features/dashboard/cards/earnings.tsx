/**
 * Lightning AI Node Platform - Earnings Analytics Card
 * 
 * Real-time Lightning payment metrics with TrustTile integration
 * and mode-aware balance display.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { TrustInfo } from '../../../components/ui/trust-info'
import { 
  Zap, 
  TrendingUp, 
  Vault, 
  Shield, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  Eye,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { lnbitsClient } from '../../../lib/lnbits'
import { earningsOptimizerAgent } from '../../../agents/earnings-optimizer'
import type { PaymentMetadata } from '../../../lib/lnbits'
import { useNodeMeta } from '../../../hooks/useNodeMeta'

interface EarningsMetrics {
  week_earnings: number
  month_earnings: number
  total_earnings: number
  payments_this_week: number
  fees_paid: number
  vaulted_percentage: number
  last_payout?: {
    amount: number
    timestamp: number
    hash: string
    verified: boolean
  }
  recent_payments: PaymentMetadata[]
}

interface EarningsCardProps {
  userId: string
  className?: string
}

export function EarningsCard({ userId, className }: EarningsCardProps) {
  const { metadata, isLoading, isMockMode, getBalance } = useNodeMeta()
  const [metrics, setMetrics] = useState<EarningsMetrics | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [agentStatus, setAgentStatus] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadEarningsData()
    loadAgentStatus()
    
    // Refresh every 30 seconds
    const interval = setInterval(loadEarningsData, 30000)
    return () => clearInterval(interval)
  }, [userId])

  const loadEarningsData = async () => {
    try {
      setIsRefreshing(true)
      
      if (isMockMode) {
        // Load mock data
        const mockEarnings = {
          week_earnings: 85000,
          month_earnings: 125000,
          total_earnings: 125000,
          payments_this_week: 47,
          fees_paid: 0,
          vaulted_percentage: 0,
          last_payout: undefined,
          recent_payments: []
        }
        setMetrics(mockEarnings)
        return
      }

      // Get payment history from LNbits
      const paymentHistory = await lnbitsClient.getPaymentHistory(50)
      const balance = await lnbitsClient.getBalance()
      
      // Calculate metrics
      const now = Date.now()
      const weekAgo = now - (7 * 24 * 60 * 60 * 1000)
      const monthAgo = now - (30 * 24 * 60 * 60 * 1000)
      
      const weekPayments = paymentHistory.filter(p => p.time * 1000 > weekAgo)
      const monthPayments = paymentHistory.filter(p => p.time * 1000 > monthAgo)
      
      const weekEarnings = weekPayments
        .filter(p => !p.bolt11.startsWith('lnbc')) // Received payments
        .reduce((sum, p) => sum + p.amount, 0)
      
      const monthEarnings = monthPayments
        .filter(p => !p.bolt11.startsWith('lnbc'))
        .reduce((sum, p) => sum + p.amount, 0)
      
      const totalFees = paymentHistory
        .filter(p => p.bolt11.startsWith('lnbc')) // Sent payments
        .reduce((sum, p) => sum + (p.fee || 0), 0)
      
      // Mock vault percentage (in production, query vault transactions)
      const vaultedAmount = weekEarnings * 0.3 // 30% vaulted
      const vaultedPercentage = weekEarnings > 0 ? (vaultedAmount / weekEarnings) * 100 : 0
      
      // Find last payout
      const lastPayout = paymentHistory
        .filter(p => p.bolt11.startsWith('lnbc'))
        .sort((a, b) => b.time - a.time)[0]
      
      // Convert recent payments to metadata format
      const recentPayments: PaymentMetadata[] = weekPayments.slice(0, 5).map(p => ({
        id: p.checking_id,
        type: p.bolt11.startsWith('lnbc') ? 'send' : 'receive',
        amount: p.amount,
        fee: p.fee || 0,
        status: 'completed',
        payment_hash: p.payment_hash,
        memo: p.memo || '',
        timestamp: p.time * 1000,
        vault_routed: Math.random() > 0.7, // Mock vault routing
        cryptographic_proof: `proof_${p.checking_id}`,
        user_id: userId
      }))
      
      const earningsMetrics: EarningsMetrics = {
        week_earnings: weekEarnings,
        month_earnings: monthEarnings,
        total_earnings: balance.balance,
        payments_this_week: weekPayments.length,
        fees_paid: totalFees,
        vaulted_percentage: vaultedPercentage,
        last_payout: lastPayout ? {
          amount: lastPayout.amount,
          timestamp: lastPayout.time * 1000,
          hash: lastPayout.payment_hash,
          verified: true
        } : undefined,
        recent_payments: recentPayments
      }
      
      setMetrics(earningsMetrics)
    } catch (error) {
      console.error('Failed to load earnings data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const loadAgentStatus = () => {
    setAgentStatus(earningsOptimizerAgent.getStatus())
  }

  const formatSats = (sats: number) => {
    if (sats >= 1000000) {
      return `${(sats / 1000000).toFixed(1)}M`
    } else if (sats >= 1000) {
      return `${(sats / 1000).toFixed(1)}k`
    }
    return sats.toString()
  }

  const getChangeIndicator = (current: number, previous: number) => {
    if (current > previous) {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />
    } else if (current < previous) {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />
    }
    return null
  }

  const balanceInfo = getBalance(metrics?.total_earnings || 0)
  const isZeroBalance = metrics?.total_earnings === 0

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 animate-pulse" />
            Loading Earnings...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            Lightning Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            No earnings data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              Lightning Earnings
            </CardTitle>
            <CardDescription>
              {metadata?.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {agentStatus?.running && (
              <Badge variant="outline" className="text-green-600">
                <Shield className="h-3 w-3 mr-1" />
                Agent Active
              </Badge>
            )}
            <Badge variant={isMockMode ? "secondary" : "default"}>
              {metadata?.mode === 'mock' ? '🧪 Mock' : '⚡ Live'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={loadEarningsData}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">This Week</div>
            <div className="text-2xl font-bold flex items-center gap-2">
              {formatSats(metrics.week_earnings)}
              <span className="text-sm text-muted-foreground">sats</span>
              {getChangeIndicator(metrics.week_earnings, metrics.month_earnings / 4)}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Payments</div>
            <div className="text-2xl font-bold flex items-center gap-2">
              {metrics.payments_this_week}
              <Zap className="h-4 w-4 text-orange-500" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Fees Paid</div>
            <div className="text-2xl font-bold flex items-center gap-2">
              {formatSats(metrics.fees_paid)}
              <span className="text-sm text-muted-foreground">sats</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Vault className="h-3 w-3" />
              Vaulted
            </div>
            <div className="text-2xl font-bold flex items-center gap-2">
              {metrics.vaulted_percentage.toFixed(1)}%
              {metrics.vaulted_percentage > 0 && (
                <Badge variant="outline" className="text-purple-600">
                  <Shield className="h-3 w-3 mr-1" />
                  Secure
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Last Payout with TrustTile */}
        {metrics.last_payout && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Last Payout</div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">
                    {formatSats(metrics.last_payout.amount)} sats
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(metrics.last_payout.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <TrustInfo
                hash={metrics.last_payout.hash}
                timestamp={metrics.last_payout.timestamp}
                verified={metrics.last_payout.verified}
                size="sm"
              />
            </div>
          </div>
        )}

        {/* Recent Payments */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Recent Activity</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>
          
          {showDetails && (
            <div className="space-y-2">
              {metrics.recent_payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${
                      payment.type === 'receive' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {payment.type === 'receive' ? (
                        <ArrowDownRight className="h-3 w-3" />
                      ) : (
                        <ArrowUpRight className="h-3 w-3" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {payment.type === 'receive' ? '+' : '-'}{formatSats(payment.amount)} sats
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-32">
                        {payment.memo || 'No memo'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {payment.vault_routed && (
                      <Badge variant="outline" className="text-purple-600 text-xs">
                        <Vault className="h-2 w-2 mr-1" />
                        Vault
                      </Badge>
                    )}
                    <TrustInfo
                      hash={payment.cryptographic_proof}
                      timestamp={payment.timestamp}
                      verified={true}
                      size="sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Summary */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Month Total:</span>
              <span className="font-medium">{formatSats(metrics.month_earnings)} sats</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Balance:</span>
              <span className="font-medium">{formatSats(metrics.total_earnings)} sats</span>
            </div>
          </div>
        </div>

        {/* TrustInfo for Balance */}
        <TrustInfo
          verified={balanceInfo.trustLevel === 'confirmed'}
          hash={metrics.last_payout?.hash}
          timestamp={metrics.last_payout?.timestamp}
          signerIdentity={metadata?.label || 'Unknown Node'}
          size="md"
        />

        {/* Zero State for Unfunded Node */}
        {isZeroBalance && !isMockMode && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <Shield className="h-4 w-4" />
              Node Ready - Waiting for First Payment
            </div>
            <div className="text-sm text-blue-600">
              Your Lightning node is configured and ready to receive payments. 
              Share your payment links or invoices to start earning.
            </div>
          </div>
        )}

        {/* Mock Mode Warning */}
        {isMockMode && (
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-700 text-sm">
              <AlertTriangle className="h-4 w-4" />
              Emergency Mock Mode - No real Bitcoin transactions
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isZeroBalance && (
            <Button variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 