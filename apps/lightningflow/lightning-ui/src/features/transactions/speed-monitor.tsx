"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Progress } from '../../components/ui/progress'
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  BarChart3,
  RefreshCw,
  Filter
} from 'lucide-react'

interface TransactionSpeed {
  id: string
  nodeId: string
  nodeAlias: string
  milliseconds: number
  hops: number
  amount: number
  inbound: boolean
  outbound: boolean
  completedAt: Date
  route: string[]
}

interface SpeedMetrics {
  fastest: number
  slowest: number
  average: number
  median: number
  p95: number
  totalTransactions: number
  successRate: number
}

interface SpeedMonitorProps {
  className?: string
  autoRefresh?: boolean
  refreshInterval?: number
  maxDataPoints?: number
}

// Mock data for demonstration
const generateMockTransaction = (): TransactionSpeed => {
  const nodeAliases = [
    'Lightning Labs', 'ACINQ', 'Blockstream', 'Casa Node', 'Tokyo Lightning',
    'Berlin Node', 'Sydney Hub', 'Miami Lightning', 'London Bridge', 'Paris Node'
  ]
  
  const randomAlias = nodeAliases[Math.floor(Math.random() * nodeAliases.length)]
  const hops = Math.floor(Math.random() * 6) + 1
  const baseSpeed = 50 + (hops * 30) // Base speed increases with hops
  const variance = Math.random() * 200 // Add some variance
  const speed = Math.max(10, baseSpeed + variance)
  
  return {
    id: `tx_${Date.now()}_${Math.random()}`,
    nodeId: `node_${randomAlias.replace(/\s+/g, '_').toLowerCase()}`,
    nodeAlias: randomAlias,
    milliseconds: Math.floor(speed),
    hops,
    amount: Math.floor(Math.random() * 1000000) + 1000,
    inbound: Math.random() > 0.5,
    outbound: Math.random() > 0.5,
    completedAt: new Date(),
    route: Array.from({ length: hops }, (_, i) => `hop_${i + 1}`)
  }
}

export function SpeedMonitor({ 
  className = "",
  autoRefresh = true,
  refreshInterval = 2000,
  maxDataPoints = 50
}: SpeedMonitorProps) {
  const [transactions, setTransactions] = useState<TransactionSpeed[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'fast' | 'slow'>('all')
  const [sortBy, setSortBy] = useState<'time' | 'speed' | 'hops'>('time')

  // Generate initial data
  useEffect(() => {
    const initialData = Array.from({ length: 20 }, () => generateMockTransaction())
    setTransactions(initialData)
  }, [])

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setTransactions(prev => {
        const newTransaction = generateMockTransaction()
        const updated = [newTransaction, ...prev].slice(0, maxDataPoints)
        return updated
      })
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, maxDataPoints])

  // Calculate metrics
  const metrics = useMemo((): SpeedMetrics => {
    if (transactions.length === 0) {
      return {
        fastest: 0,
        slowest: 0,
        average: 0,
        median: 0,
        p95: 0,
        totalTransactions: 0,
        successRate: 100
      }
    }

    const speeds = transactions.map(t => t.milliseconds).sort((a, b) => a - b)
    const sum = speeds.reduce((acc, speed) => acc + speed, 0)
    
    return {
      fastest: speeds[0],
      slowest: speeds[speeds.length - 1],
      average: Math.round(sum / speeds.length),
      median: speeds[Math.floor(speeds.length / 2)],
      p95: speeds[Math.floor(speeds.length * 0.95)],
      totalTransactions: transactions.length,
      successRate: 98.5 // Mock success rate
    }
  }, [transactions])

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions]

    // Apply filter
    if (filter === 'fast') {
      filtered = filtered.filter(t => t.milliseconds <= metrics.average)
    } else if (filter === 'slow') {
      filtered = filtered.filter(t => t.milliseconds > metrics.average)
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'speed':
          return a.milliseconds - b.milliseconds
        case 'hops':
          return a.hops - b.hops
        case 'time':
        default:
          return b.completedAt.getTime() - a.completedAt.getTime()
      }
    })

    return filtered
  }, [transactions, filter, sortBy, metrics.average])

  // Get speed color
  const getSpeedColor = (speed: number) => {
    if (speed <= 100) return 'text-green-500'
    if (speed <= 300) return 'text-yellow-500'
    if (speed <= 500) return 'text-orange-500'
    return 'text-red-500'
  }

  // Get speed badge variant
  const getSpeedBadge = (speed: number) => {
    if (speed <= 100) return 'default'
    if (speed <= 300) return 'secondary'
    if (speed <= 500) return 'outline'
    return 'destructive'
  }

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  // Manual refresh
  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      const newTransaction = generateMockTransaction()
      setTransactions(prev => [newTransaction, ...prev].slice(0, maxDataPoints))
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fastest</p>
                <p className="text-2xl font-bold text-green-500">{metrics.fastest}ms</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average</p>
                <p className="text-2xl font-bold">{metrics.average}ms</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">95th Percentile</p>
                <p className="text-2xl font-bold text-orange-500">{metrics.p95}ms</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-500">{metrics.successRate}%</p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Speed Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Speed Distribution</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Fast (&lt;100ms)</p>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={(transactions.filter(t => t.milliseconds < 100).length / transactions.length) * 100} 
                    className="flex-1"
                  />
                  <span className="text-green-500 font-mono">
                    {transactions.filter(t => t.milliseconds < 100).length}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Medium (100-500ms)</p>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={(transactions.filter(t => t.milliseconds >= 100 && t.milliseconds <= 500).length / transactions.length) * 100} 
                    className="flex-1"
                  />
                  <span className="text-yellow-500 font-mono">
                    {transactions.filter(t => t.milliseconds >= 100 && t.milliseconds <= 500).length}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Slow (&gt;500ms)</p>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={(transactions.filter(t => t.milliseconds > 500).length / transactions.length) * 100} 
                    className="flex-1"
                  />
                  <span className="text-red-500 font-mono">
                    {transactions.filter(t => t.milliseconds > 500).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Transactions</span>
            <div className="flex items-center space-x-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'fast' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('fast')}
              >
                Fast
              </Button>
              <Button
                variant={filter === 'slow' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('slow')}
              >
                Slow
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredTransactions.slice(0, 20).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono text-muted-foreground">
                      {formatTime(transaction.completedAt)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{transaction.nodeAlias}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.hops} hops • {(transaction.amount / 1000).toFixed(1)}K sats
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getSpeedBadge(transaction.milliseconds)}>
                    {transaction.milliseconds}ms
                  </Badge>
                  <div className="flex space-x-1">
                    {transaction.inbound && (
                      <Badge variant="outline" className="text-xs">IN</Badge>
                    )}
                    {transaction.outbound && (
                      <Badge variant="outline" className="text-xs">OUT</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 