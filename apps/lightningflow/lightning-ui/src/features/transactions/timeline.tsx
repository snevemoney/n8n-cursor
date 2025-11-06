"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { 
  Clock, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'

interface TimelineTransaction {
  id: string
  timestamp: Date
  speed: number
  hops: number
  amount: number
  nodeAlias: string
  success: boolean
}

interface TimelineProps {
  className?: string
  maxDataPoints?: number
  timeWindow?: number // minutes
  autoPlay?: boolean
}

// Generate mock timeline data
const generateTimelineData = (count: number, timeWindow: number): TimelineTransaction[] => {
  const now = new Date()
  const data: TimelineTransaction[] = []
  
  const nodeAliases = [
    'Lightning Labs', 'ACINQ', 'Blockstream', 'Casa Node', 'Tokyo Lightning',
    'Berlin Node', 'Sydney Hub', 'Miami Lightning', 'London Bridge', 'Paris Node'
  ]

  for (let i = 0; i < count; i++) {
    const minutesAgo = Math.random() * timeWindow
    const timestamp = new Date(now.getTime() - minutesAgo * 60 * 1000)
    const hops = Math.floor(Math.random() * 6) + 1
    const baseSpeed = 50 + (hops * 30)
    const variance = Math.random() * 300
    const speed = Math.max(10, baseSpeed + variance)
    
    data.push({
      id: `timeline_tx_${i}`,
      timestamp,
      speed: Math.floor(speed),
      hops,
      amount: Math.floor(Math.random() * 1000000) + 1000,
      nodeAlias: nodeAliases[Math.floor(Math.random() * nodeAliases.length)],
      success: Math.random() > 0.05 // 95% success rate
    })
  }

  return data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
}

export function Timeline({ 
  className = "",
  maxDataPoints = 100,
  timeWindow = 60, // 1 hour
  autoPlay = true
}: TimelineProps) {
  const [transactions, setTransactions] = useState<TimelineTransaction[]>([])
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedTransaction, setSelectedTransaction] = useState<TimelineTransaction | null>(null)

  // Initialize data
  useEffect(() => {
    const initialData = generateTimelineData(maxDataPoints, timeWindow)
    setTransactions(initialData)
  }, [maxDataPoints, timeWindow])

  // Auto-play timeline
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentTime(new Date())
      
      // Add new transaction occasionally
      if (Math.random() < 0.3) {
        const newTransaction = generateTimelineData(1, 0)[0]
        newTransaction.timestamp = new Date()
        
        setTransactions(prev => {
          const updated = [...prev, newTransaction]
          return updated.slice(-maxDataPoints)
        })
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [isPlaying, maxDataPoints])

  // Group transactions by time buckets (5-minute intervals)
  const timelineBuckets = useMemo(() => {
    const bucketSize = 5 * 60 * 1000 // 5 minutes in milliseconds
    const buckets = new Map<number, TimelineTransaction[]>()
    
    transactions.forEach(tx => {
      const bucketKey = Math.floor(tx.timestamp.getTime() / bucketSize) * bucketSize
      if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, [])
      }
      buckets.get(bucketKey)!.push(tx)
    })

    return Array.from(buckets.entries())
      .map(([timestamp, txs]) => ({
        timestamp: new Date(timestamp),
        transactions: txs,
        avgSpeed: txs.reduce((sum, tx) => sum + tx.speed, 0) / txs.length,
        count: txs.length,
        successRate: (txs.filter(tx => tx.success).length / txs.length) * 100
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-20) // Show last 20 buckets
  }, [transactions])

  // Get speed color
  const getSpeedColor = (speed: number) => {
    if (speed <= 100) return '#10b981' // green
    if (speed <= 300) return '#f59e0b' // yellow
    if (speed <= 500) return '#f97316' // orange
    return '#ef4444' // red
  }

  // Get bar height based on transaction count
  const getBarHeight = (count: number) => {
    const maxCount = Math.max(...timelineBuckets.map(b => b.count), 1)
    return Math.max(4, (count / maxCount) * 100)
  }

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    })
  }

  // Reset timeline
  const handleReset = () => {
    const newData = generateTimelineData(maxDataPoints, timeWindow)
    setTransactions(newData)
    setCurrentTime(new Date())
    setSelectedTransaction(null)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transaction Timeline</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 mr-1" />
                ) : (
                  <Play className="h-4 w-4 mr-1" />
                )}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Showing transaction speeds over time • Each bar represents a 5-minute window
          </div>
        </CardContent>
      </Card>

      {/* Timeline Visualization */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            {/* Timeline bars */}
            <div className="flex items-end justify-between h-32 mb-4">
              {timelineBuckets.map((bucket, index) => (
                <div
                  key={bucket.timestamp.getTime()}
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => setSelectedTransaction(bucket.transactions[0])}
                >
                  {/* Bar */}
                  <div
                    className="w-8 rounded-t transition-all duration-200 group-hover:opacity-80"
                    style={{
                      height: `${getBarHeight(bucket.count)}px`,
                      backgroundColor: getSpeedColor(bucket.avgSpeed),
                      minHeight: '4px'
                    }}
                  />
                  
                  {/* Time label */}
                  <div className="text-xs text-muted-foreground mt-2 transform -rotate-45 origin-left">
                    {formatTime(bucket.timestamp)}
                  </div>
                  
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                    <div>{bucket.count} transactions</div>
                    <div>Avg: {Math.round(bucket.avgSpeed)}ms</div>
                    <div>Success: {bucket.successRate.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Speed legend */}
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }}></div>
                <span>Fast (&lt;100ms)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                <span>Medium (100-300ms)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f97316' }}></div>
                <span>Slow (300-500ms)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                <span>Very Slow (&gt;500ms)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Speed</p>
                <p className="text-2xl font-bold">
                  {transactions.length > 0 
                    ? Math.round(transactions.reduce((sum, tx) => sum + tx.speed, 0) / transactions.length)
                    : 0}ms
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-500">
                  {transactions.length > 0 
                    ? ((transactions.filter(tx => tx.success).length / transactions.length) * 100).toFixed(1)
                    : 100}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {transactions
              .slice(-10)
              .reverse()
              .map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-mono text-muted-foreground">
                        {formatTime(transaction.timestamp)}
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
                    <Badge 
                      variant={transaction.success ? "default" : "destructive"}
                      style={{ 
                        backgroundColor: transaction.success ? getSpeedColor(transaction.speed) : undefined 
                      }}
                    >
                      {transaction.speed}ms
                    </Badge>
                    {!transaction.success && (
                      <Badge variant="destructive">Failed</Badge>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Transaction Details */}
      {selectedTransaction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Transaction Details</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTransaction(null)}
              >
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Node</p>
                <p className="font-medium">{selectedTransaction.nodeAlias}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Speed</p>
                <p className="font-mono font-medium" style={{ color: getSpeedColor(selectedTransaction.speed) }}>
                  {selectedTransaction.speed}ms
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Hops</p>
                <p className="font-mono">{selectedTransaction.hops}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-mono">{(selectedTransaction.amount / 1000).toFixed(1)}K sats</p>
              </div>
              <div>
                <p className="text-muted-foreground">Time</p>
                <p className="font-mono">{selectedTransaction.timestamp.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant={selectedTransaction.success ? "default" : "destructive"}>
                  {selectedTransaction.success ? 'Success' : 'Failed'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 