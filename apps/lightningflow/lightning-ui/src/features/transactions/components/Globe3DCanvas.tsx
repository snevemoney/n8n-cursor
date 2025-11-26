"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Globe as GlobeIcon, Zap, Activity, MapPin } from 'lucide-react'

// Dynamically import Globe component to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false })

interface LightningNode {
  id: string
  alias: string
  lat: number
  lng: number
  capacity: number
  channels: number
  color: string
  isOnline: boolean
  lastSeen: Date
}

interface TransactionArc {
  id: string
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  amount: number
  timestamp: Date
  hops: number
  speed: number // milliseconds
  color: string
}

interface Globe3DCanvasProps {
  nodes?: LightningNode[]
  transactions?: TransactionArc[]
  autoRotate?: boolean
  showTransactionPaths?: boolean
  onNodeClick?: (node: LightningNode) => void
  onTransactionClick?: (transaction: TransactionArc) => void
}

// Mock data for demonstration
const mockNodes: LightningNode[] = [
  {
    id: 'node_1',
    alias: 'Lightning Labs',
    lat: 37.7749,
    lng: -122.4194,
    capacity: 50000000,
    channels: 150,
    color: '#ff6b35',
    isOnline: true,
    lastSeen: new Date()
  },
  {
    id: 'node_2', 
    alias: 'ACINQ',
    lat: 48.8566,
    lng: 2.3522,
    capacity: 75000000,
    channels: 200,
    color: '#f7931a',
    isOnline: true,
    lastSeen: new Date()
  },
  {
    id: 'node_3',
    alias: 'Blockstream',
    lat: 51.5074,
    lng: -0.1278,
    capacity: 100000000,
    channels: 300,
    color: '#00d4aa',
    isOnline: true,
    lastSeen: new Date()
  },
  {
    id: 'node_4',
    alias: 'Casa Node',
    lat: 40.7128,
    lng: -74.0060,
    capacity: 25000000,
    channels: 80,
    color: '#9d4edd',
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000)
  },
  {
    id: 'node_5',
    alias: 'Tokyo Lightning',
    lat: 35.6762,
    lng: 139.6503,
    capacity: 60000000,
    channels: 120,
    color: '#06ffa5',
    isOnline: true,
    lastSeen: new Date()
  }
]

const mockTransactions: TransactionArc[] = [
  {
    id: 'tx_1',
    startLat: 37.7749,
    startLng: -122.4194,
    endLat: 48.8566,
    endLng: 2.3522,
    amount: 100000,
    timestamp: new Date(),
    hops: 3,
    speed: 250,
    color: '#ff6b35'
  },
  {
    id: 'tx_2',
    startLat: 51.5074,
    startLng: -0.1278,
    endLat: 35.6762,
    endLng: 139.6503,
    amount: 50000,
    timestamp: new Date(Date.now() - 5000),
    hops: 2,
    speed: 180,
    color: '#00d4aa'
  }
]

export function Globe3DCanvas({
  nodes = mockNodes,
  transactions = mockTransactions,
  autoRotate = true,
  showTransactionPaths = true,
  onNodeClick,
  onTransactionClick
}: Globe3DCanvasProps) {
  const globeRef = useRef<any>()
  const [selectedNode, setSelectedNode] = useState<LightningNode | null>(null)
  const [activeTransactions, setActiveTransactions] = useState<TransactionArc[]>([])
  const [globeReady, setGlobeReady] = useState(false)

  // Animate transactions
  useEffect(() => {
    if (!showTransactionPaths) return

    const interval = setInterval(() => {
      setActiveTransactions(prev => {
        // Remove old transactions (older than 10 seconds)
        const cutoff = Date.now() - 10000
        const filtered = prev.filter(tx => tx.timestamp.getTime() > cutoff)
        
        // Add new random transaction occasionally
        if (Math.random() < 0.3 && nodes.length >= 2) {
          const fromNode = nodes[Math.floor(Math.random() * nodes.length)]
          const toNode = nodes[Math.floor(Math.random() * nodes.length)]
          
          if (fromNode.id !== toNode.id) {
            const newTx: TransactionArc = {
              id: `tx_${Date.now()}`,
              startLat: fromNode.lat,
              startLng: fromNode.lng,
              endLat: toNode.lat,
              endLng: toNode.lng,
              amount: Math.floor(Math.random() * 1000000) + 10000,
              timestamp: new Date(),
              hops: Math.floor(Math.random() * 5) + 1,
              speed: Math.floor(Math.random() * 500) + 100,
              color: fromNode.color
            }
            filtered.push(newTx)
          }
        }
        
        return filtered
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [showTransactionPaths, nodes])

  // Handle node click
  const handleNodeClick = useCallback((node: any) => {
    const lightningNode = node as LightningNode;
    setSelectedNode(lightningNode);
    onNodeClick?.(lightningNode);
  }, [onNodeClick])

  // Handle arc click
  const handleArcClick = useCallback((arc: any) => {
    const transactionArc = arc as TransactionArc;
    onTransactionClick?.(transactionArc);
  }, [onTransactionClick])

  // Format capacity for display
  const formatCapacity = (sats: number) => {
    if (sats >= 100000000) return `${(sats / 100000000).toFixed(1)} BTC`
    if (sats >= 1000000) return `${(sats / 1000000).toFixed(1)}M sats`
    if (sats >= 1000) return `${(sats / 1000).toFixed(1)}K sats`
    return `${sats} sats`
  }

  // Get node size based on capacity
  const getNodeSize = (capacity: number) => {
    const minSize = 0.1
    const maxSize = 0.8
    const maxCapacity = Math.max(...nodes.map(n => n.capacity))
    return minSize + (capacity / maxCapacity) * (maxSize - minSize)
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* Globe Container */}
      <div className="w-full h-full">
        <Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          
          // Node configuration
          pointsData={nodes}
          pointLat="lat"
          pointLng="lng"
          pointColor={(node: any) => node.isOnline ? node.color : '#666666'}
          pointAltitude={(node: any) => getNodeSize(node.capacity)}
          pointRadius={(node: any) => getNodeSize(node.capacity)}
          pointLabel={(node: any) => `
            <div class="bg-black/90 text-white p-2 rounded-lg border border-gray-700 max-w-xs">
              <div class="font-bold text-sm">${node.alias}</div>
              <div class="text-xs text-gray-300 mt-1">
                <div>Capacity: ${formatCapacity(node.capacity)}</div>
                <div>Channels: ${node.channels}</div>
                <div>Status: ${node.isOnline ? 'Online' : 'Offline'}</div>
              </div>
            </div>
          `}
          onPointClick={handleNodeClick}
          
          // Arc configuration for transactions
          arcsData={showTransactionPaths ? activeTransactions : []}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor={(arc: any) => arc.color}
          arcAltitude={0.3}
          arcStroke={0.5}
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={2000}
          arcLabel={(arc: any) => `
            <div class="bg-black/90 text-white p-2 rounded-lg border border-gray-700">
              <div class="font-bold text-sm">Transaction</div>
              <div class="text-xs text-gray-300 mt-1">
                <div>Amount: ${formatCapacity(arc.amount)}</div>
                <div>Hops: ${arc.hops}</div>
                <div>Speed: ${arc.speed}ms</div>
              </div>
            </div>
          `}
          onArcClick={handleArcClick}
          
          // Globe behavior
          enablePointerInteraction={true}
          animateIn={true}
          waitForGlobeReady={true}
          onGlobeReady={() => setGlobeReady(true)}
        />
      </div>

      {/* Loading overlay */}
      {!globeReady && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center">
            <GlobeIcon className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-white text-sm">Loading Lightning Network Globe...</p>
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div className="absolute top-4 left-4 space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (globeRef.current) {
              globeRef.current.controls().autoRotate = !globeRef.current.controls().autoRotate
            }
          }}
          className="bg-black/80 border-gray-700 text-white hover:bg-gray-800"
        >
          <Activity className="w-4 h-4 mr-1" />
          {autoRotate ? 'Stop' : 'Start'} Rotation
        </Button>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-4 right-4 space-y-2">
        <Card className="bg-black/80 border-gray-700 text-white">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>{nodes.filter(n => n.isOnline).length} Online Nodes</span>
            </div>
            <div className="flex items-center space-x-2 text-sm mt-1">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>{activeTransactions.length} Active Transactions</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected node details */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4">
          <Card className="bg-black/90 border-gray-700 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{selectedNode.alias}</span>
                <Badge variant={selectedNode.isOnline ? "default" : "secondary"}>
                  {selectedNode.isOnline ? 'Online' : 'Offline'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Capacity</p>
                  <p className="font-mono">{formatCapacity(selectedNode.capacity)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Channels</p>
                  <p className="font-mono">{selectedNode.channels}</p>
                </div>
                <div>
                  <p className="text-gray-400">Location</p>
                  <p className="font-mono">{selectedNode.lat.toFixed(2)}, {selectedNode.lng.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Last Seen</p>
                  <p className="font-mono">{selectedNode.lastSeen.toLocaleTimeString()}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedNode(null)}
                className="mt-3 bg-transparent border-gray-600 text-white hover:bg-gray-800"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 