"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { 
  Globe, 
  Map, 
  Activity, 
  Clock, 
  Zap, 
  Play, 
  Settings,
  BarChart3,
  Network,
  TrendingUp,
  RefreshCw
} from 'lucide-react'

import { Globe3DCanvas } from './components/Globe3DCanvas'
import { SpeedMonitor } from './speed-monitor'
import { Timeline } from './timeline'
import { useTransactionGraph } from './hooks/useTransactionGraph'
import { 
  generateRandomSimulation, 
  logTransactionSpeed,
  getAvailableNodes,
  type TransactionSimulation 
} from './simulate-transaction'

interface LightningTransactionIntelligenceProps {
  className?: string
  defaultView?: 'globe' | 'map' | 'speed' | 'timeline'
  autoSimulate?: boolean
}

export function LightningTransactionIntelligence({
  className = "",
  defaultView = 'globe',
  autoSimulate = true
}: LightningTransactionIntelligenceProps) {
  const [activeView, setActiveView] = useState(defaultView)
  const [isSimulating, setIsSimulating] = useState(autoSimulate)
  const [simulationCount, setSimulationCount] = useState(0)
  const [recentSimulations, setRecentSimulations] = useState<TransactionSimulation[]>([])

  // Use the transaction graph hook
  const {
    nodes,
    edges,
    transactions,
    metrics,
    isLoading,
    error,
    lastUpdate,
    refresh,
    simulateTransaction,
    fastestTransaction,
    slowestTransaction,
    topNodes,
    isConnected,
    hasTransactions
  } = useTransactionGraph({
    autoUpdate: isSimulating,
    enableSimulation: isSimulating,
    simulationInterval: 3000,
    maxTransactions: 100
  })

  // Manual simulation
  const handleSimulateTransaction = async () => {
    try {
      const simulation = await simulateTransaction()
      setRecentSimulations(prev => [simulation, ...prev].slice(0, 10))
      setSimulationCount(prev => prev + 1)
    } catch (error) {
      console.error('Simulation failed:', error)
    }
  }

  // Batch simulation
  const handleBatchSimulation = async (count: number = 5) => {
    for (let i = 0; i < count; i++) {
      await handleSimulateTransaction()
      // Small delay between simulations
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  // Format capacity for display
  const formatCapacity = (sats: number) => {
    if (sats >= 100000000) return `${(sats / 100000000).toFixed(1)} BTC`
    if (sats >= 1000000) return `${(sats / 1000000).toFixed(1)}M sats`
    if (sats >= 1000) return `${(sats / 1000).toFixed(1)}K sats`
    return `${sats} sats`
  }

  // Convert graph nodes to globe format
  const globeNodes = nodes.map(node => ({
    id: node.id,
    alias: node.alias,
    lat: node.lat || 0,
    lng: node.lng || 0,
    capacity: node.capacity,
    channels: node.channels,
    color: node.color,
    isOnline: node.isOnline,
    lastSeen: node.lastSeen
  }))

  // Convert transactions to globe arcs
  const globeTransactions = transactions
    .filter(tx => tx.success && tx.fromNode.lat && tx.fromNode.lng && tx.toNode.lat && tx.toNode.lng)
    .slice(0, 20) // Show only recent transactions
    .map(tx => ({
      id: tx.id,
      startLat: tx.fromNode.lat!,
      startLng: tx.fromNode.lng!,
      endLat: tx.toNode.lat!,
      endLng: tx.toNode.lng!,
      amount: tx.amount,
      timestamp: tx.timestamp,
      hops: tx.selectedRoute.hops,
      speed: tx.actualTime || 0,
      color: tx.fromNode.id === 'lightning_labs' ? '#ff6b35' : '#00d4aa'
    }))

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lightning Transaction Intelligence</h1>
          <p className="text-muted-foreground mt-1">
            Real-time Lightning Network transaction monitoring and analysis
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={isSimulating ? "default" : "outline"}
            onClick={() => setIsSimulating(!isSimulating)}
          >
            {isSimulating ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-pulse" />
                Live
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Network Status</p>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Online Nodes</p>
              <p className="text-lg font-bold">{metrics.onlineNodes}/{metrics.totalNodes}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="text-lg font-bold">{metrics.totalTransactions}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Avg Speed</p>
              <p className="text-lg font-bold">{metrics.avgSpeed}ms</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-lg font-bold text-green-500">{metrics.successRate.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Last Update</p>
              <p className="text-sm font-mono">
                {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="globe" className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>Globe View</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center space-x-2">
            <Map className="w-4 h-4" />
            <span>Network Map</span>
          </TabsTrigger>
          <TabsTrigger value="speed" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Speed Monitor</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Timeline</span>
          </TabsTrigger>
        </TabsList>

        {/* Globe View */}
        <TabsContent value="globe" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>3D Lightning Network Globe</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSimulateTransaction}
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Simulate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBatchSimulation(5)}
                  >
                    <Network className="w-4 h-4 mr-1" />
                    Batch (5x)
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] w-full">
                <Globe3DCanvas
                  nodes={globeNodes}
                  transactions={globeTransactions}
                  autoRotate={true}
                  showTransactionPaths={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Map View */}
        <TabsContent value="map" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>2D Network Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] w-full flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center">
                  <Map className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">2D Network Map</p>
                  <p className="text-muted-foreground">Coming soon - Interactive 2D network topology</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Speed Monitor View */}
        <TabsContent value="speed" className="space-y-6">
          <SpeedMonitor 
            autoRefresh={isSimulating}
            refreshInterval={2000}
            maxDataPoints={50}
          />
        </TabsContent>

        {/* Timeline View */}
        <TabsContent value="timeline" className="space-y-6">
          <Timeline 
            maxDataPoints={100}
            timeWindow={60}
            autoPlay={isSimulating}
          />
        </TabsContent>
      </Tabs>

      {/* Quick Stats & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Simulations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Simulations</span>
              <Badge variant="outline">{simulationCount} total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recentSimulations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No simulations yet. Click "Simulate" to start.
                </p>
              ) : (
                recentSimulations.map((sim) => (
                  <div
                    key={sim.id}
                    className="flex items-center justify-between p-2 border rounded text-sm"
                  >
                    <div>
                      <p className="font-medium">{sim.fromNode.alias} → {sim.toNode.alias}</p>
                      <p className="text-muted-foreground">
                        {formatCapacity(sim.amount)} • {sim.selectedRoute.hops} hops
                      </p>
                    </div>
                    <Badge variant={sim.success ? "default" : "destructive"}>
                      {sim.actualTime || 0}ms
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Nodes */}
        <Card>
          <CardHeader>
            <CardTitle>Top Nodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topNodes.slice(0, 5).map((node, index) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between p-2 border rounded text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <p className="font-medium">{node.alias}</p>
                      <p className="text-muted-foreground">
                        {formatCapacity(node.capacity)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono">{node.transactions} txs</p>
                    <p className="text-muted-foreground">{node.avgSpeed}ms avg</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Highlights */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fastestTransaction && (
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-600">Fastest Transaction</span>
                  </div>
                  <p className="text-sm">
                    {fastestTransaction.fromNode.alias} → {fastestTransaction.toNode.alias}
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    {fastestTransaction.actualTime}ms
                  </p>
                </div>
              )}

              {slowestTransaction && (
                <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-orange-600" />
                    <span className="font-medium text-orange-600">Slowest Transaction</span>
                  </div>
                  <p className="text-sm">
                    {slowestTransaction.fromNode.alias} → {slowestTransaction.toNode.alias}
                  </p>
                  <p className="text-lg font-bold text-orange-600">
                    {slowestTransaction.actualTime}ms
                  </p>
                </div>
              )}

              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Network className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-600">Network Capacity</span>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {formatCapacity(metrics.networkCapacity)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 