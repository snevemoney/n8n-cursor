/**
 * Node Status Card Component
 * 
 * Displays live Lightning node health metrics:
 * - Sync status and block height
 * - Connected peers and channel count
 * - Fee rates and liquidity balance
 * - Real-time alerts and recommendations
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Progress } from "../ui/progress"
import { 
  Zap, 
  Wifi, 
  Users, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Gauge,
  TrendingUp,
  Settings,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"

interface NodeStatus {
  isOnline: boolean
  syncStatus: {
    isSynced: boolean
    blockHeight: number
    networkHeight: number
    syncProgress: number
  }
  peers: {
    connected: number
    total: number
    activeChannels: number
  }
  liquidity: {
    localBalance: number
    remoteBalance: number
    totalCapacity: number
    balanceRatio: number
  }
  fees: {
    baseFee: number
    feeRate: number
    lastUpdated: string
  }
  health: {
    score: number
    issues: string[]
    recommendations: string[]
  }
  lastUpdate: string
}

export function NodeStatusCard() {
  const [nodeStatus, setNodeStatus] = useState<NodeStatus>({
    isOnline: true,
    syncStatus: {
      isSynced: true,
      blockHeight: 850245,
      networkHeight: 850245,
      syncProgress: 100
    },
    peers: {
      connected: 15,
      total: 20,
      activeChannels: 8
    },
    liquidity: {
      localBalance: 2500000,
      remoteBalance: 1800000,
      totalCapacity: 4300000,
      balanceRatio: 0.58
    },
    fees: {
      baseFee: 1000,
      feeRate: 0.0001,
      lastUpdated: new Date().toISOString()
    },
    health: {
      score: 92,
      issues: [],
      recommendations: [
        'Consider rebalancing channels for optimal routing',
        'Update fee rates based on recent network activity'
      ]
    },
    lastUpdate: new Date().toISOString()
  })

  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchNodeStatus, 30000) // 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchNodeStatus = async () => {
    try {
      setLoading(true)
      
      // In production, this would call /api/node/status-check
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate some variability in the data
      setNodeStatus(prev => ({
        ...prev,
        peers: {
          ...prev.peers,
          connected: Math.max(10, prev.peers.connected + Math.floor(Math.random() * 3 - 1))
        },
        liquidity: {
          ...prev.liquidity,
          localBalance: prev.liquidity.localBalance + Math.floor(Math.random() * 100000 - 50000),
          balanceRatio: Math.max(0.1, Math.min(0.9, prev.liquidity.balanceRatio + (Math.random() - 0.5) * 0.1))
        },
        health: {
          ...prev.health,
          score: Math.max(80, Math.min(100, prev.health.score + Math.floor(Math.random() * 6 - 3)))
        },
        lastUpdate: new Date().toISOString()
      }))
      
    } catch (error) {
      toast.error('Failed to fetch node status')
    } finally {
      setLoading(false)
    }
  }

  const formatSats = (sats: number): string => {
    if (sats >= 100000000) {
      return `${(sats / 100000000).toFixed(2)} BTC`
    }
    if (sats >= 1000000) {
      return `${(sats / 1000000).toFixed(1)}M sats`
    }
    if (sats >= 1000) {
      return `${(sats / 1000).toFixed(0)}k sats`
    }
    return `${sats} sats`
  }

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getHealthColor = (score: number): string => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthBadgeVariant = (score: number): "default" | "destructive" | "secondary" | "outline" => {
    if (score >= 90) return 'default'
    if (score >= 70) return 'secondary'
    return 'destructive'
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${nodeStatus.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            Lightning Node
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'text-green-600' : 'text-gray-500'}
            >
              <Activity className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchNodeStatus}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Last updated: {formatTime(nodeStatus.lastUpdate)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Health Score */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            <span className="text-sm font-medium">Node Health</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${getHealthColor(nodeStatus.health.score)}`}>
              {nodeStatus.health.score}%
            </span>
            <Badge variant={getHealthBadgeVariant(nodeStatus.health.score)}>
              {nodeStatus.health.score >= 90 ? 'Excellent' :
               nodeStatus.health.score >= 70 ? 'Good' : 'Needs Attention'}
            </Badge>
          </div>
        </div>

        {/* Sync Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Wifi className="h-4 w-4" />
              Sync Status
            </div>
            <div className="flex items-center gap-2">
              {nodeStatus.syncStatus.isSynced ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Clock className="h-4 w-4 text-yellow-600" />
              )}
              <span className="text-xs text-muted-foreground">
                {nodeStatus.syncStatus.blockHeight.toLocaleString()}
              </span>
            </div>
          </div>
          {!nodeStatus.syncStatus.isSynced && (
            <Progress value={nodeStatus.syncStatus.syncProgress} className="h-2" />
          )}
        </div>

        {/* Peers & Channels */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              Peers
            </div>
            <div className="text-lg font-semibold">
              {nodeStatus.peers.connected}
              <span className="text-sm text-muted-foreground font-normal">
                /{nodeStatus.peers.total}
              </span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4" />
              Channels
            </div>
            <div className="text-lg font-semibold">
              {nodeStatus.peers.activeChannels}
              <span className="text-sm text-muted-foreground font-normal"> active</span>
            </div>
          </div>
        </div>

        {/* Liquidity Balance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Liquidity Balance</span>
            <span className="text-xs text-muted-foreground">
              {(nodeStatus.liquidity.balanceRatio * 100).toFixed(1)}% local
            </span>
          </div>
          <div className="space-y-1">
            <Progress value={nodeStatus.liquidity.balanceRatio * 100} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Local: {formatSats(nodeStatus.liquidity.localBalance)}</span>
              <span>Remote: {formatSats(nodeStatus.liquidity.remoteBalance)}</span>
            </div>
          </div>
        </div>

        {/* Fee Settings */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Base Fee</div>
              <div className="text-xs text-muted-foreground">
                {nodeStatus.fees.baseFee} msat
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">
              {(nodeStatus.fees.feeRate * 1000000).toFixed(1)} ppm
            </div>
            <div className="text-xs text-muted-foreground">Fee Rate</div>
          </div>
        </div>

        {/* Recommendations */}
        {nodeStatus.health.recommendations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Recommendations
            </div>
            <div className="space-y-1">
              {nodeStatus.health.recommendations.map((rec, index) => (
                <div key={index} className="text-xs text-muted-foreground p-2 bg-blue-50 rounded border-l-2 border-blue-200">
                  {rec}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issues */}
        {nodeStatus.health.issues.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-red-600">
              <AlertTriangle className="h-4 w-4" />
              Issues
            </div>
            <div className="space-y-1">
              {nodeStatus.health.issues.map((issue, index) => (
                <div key={index} className="text-xs text-red-600 p-2 bg-red-50 rounded border-l-2 border-red-200">
                  {issue}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 