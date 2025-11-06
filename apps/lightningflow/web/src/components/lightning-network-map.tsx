"use client"

import { useState, useEffect, useRef } from 'react'
import { ForceGraph2D } from './custom-force-graph'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  Network, 
  Zap, 
  Filter, 
  Info,
  ExternalLink,
  Activity,
  Globe,
  TrendingUp,
  Users,
  Eye,
  EyeOff,
  Layers,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'

interface Node {
  id: string
  name: string
  alias?: string
  capacity: number
  channels: number
  type: 'yours' | 'major-hub' | 'exchange' | 'wallet' | 'routing' | 'merchant'
  country?: string
  uptime?: number
  fee_rate?: number
  x?: number
  y?: number
  fx?: number
  fy?: number
}

interface Link {
  source: string
  target: string
  capacity: number
  fee_rate: number
  active: boolean
  last_update?: number
}

interface GraphData {
  nodes: Node[]
  links: Link[]
}

interface NetworkStats {
  totalNodes: number
  totalChannels: number
  totalCapacity: number
  avgChannelSize: number
  yourNodeRank: number
}

export function LightningNetworkMap() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] })
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'hubs' | 'exchanges' | 'high-capacity'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null)
  const [viewMode, setViewMode] = useState<'topology' | 'geographic'>('topology')
  const [showLabels, setShowLabels] = useState(true)
  const [showChannels, setShowChannels] = useState(true)
  const [isAnimating, setIsAnimating] = useState(true)
  const [particleSpeed, setParticleSpeed] = useState(0.004)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showStats, setShowStats] = useState(true)
  const graphRef = useRef<any>()

  // Generate realistic Lightning Network data
  useEffect(() => {
    const generateRealisticData = (): { data: GraphData; stats: NetworkStats } => {
      const nodes: Node[] = []
      
      // Your node (center of the network)
      nodes.push({
        id: 'your-node',
        name: 'Your Lightning Node',
        alias: 'LightningAI-Node',
        capacity: 75000000, // 0.75 BTC
        channels: 18,
        type: 'yours',
        country: 'United States',
        uptime: 99.9,
        fee_rate: 500,
        fx: 0, // Fixed position at center
        fy: 0
      })

      // Major Lightning hubs and exchanges
      const majorNodes = [
        { name: 'ACINQ', alias: 'ACINQ', capacity: 2500000000, channels: 450, type: 'major-hub', country: 'France', uptime: 99.95, fee_rate: 100 },
        { name: 'LN+', alias: 'LN-Plus', capacity: 1800000000, channels: 380, type: 'major-hub', country: 'Germany', uptime: 99.8, fee_rate: 150 },
        { name: 'Bitfinex', alias: 'Bitfinex-LN', capacity: 3200000000, channels: 280, type: 'exchange', country: 'Hong Kong', uptime: 99.7, fee_rate: 200 },
        { name: 'River Financial', alias: 'River', capacity: 1200000000, channels: 220, type: 'exchange', country: 'United States', uptime: 99.9, fee_rate: 300 },
        { name: 'Kraken', alias: 'Kraken-Lightning', capacity: 2800000000, channels: 320, type: 'exchange', country: 'United States', uptime: 99.6, fee_rate: 250 },
        { name: 'Voltage', alias: 'Voltage-Cloud', capacity: 900000000, channels: 180, type: 'routing', country: 'United States', uptime: 99.95, fee_rate: 400 },
        { name: 'Amboss', alias: 'Amboss-Space', capacity: 650000000, channels: 160, type: 'routing', country: 'Austria', uptime: 99.8, fee_rate: 350 },
        { name: 'LN Markets', alias: 'LNMarkets', capacity: 800000000, channels: 140, type: 'exchange', country: 'France', uptime: 99.5, fee_rate: 300 },
      ]

      // Wallet providers
      const walletNodes = [
        { name: 'Wallet of Satoshi', alias: 'WoS', capacity: 1500000000, channels: 200, type: 'wallet', country: 'Australia', uptime: 99.9, fee_rate: 0 },
        { name: 'Breez', alias: 'Breez-LSP', capacity: 600000000, channels: 150, type: 'wallet', country: 'Israel', uptime: 99.7, fee_rate: 0 },
        { name: 'Phoenix', alias: 'Phoenix-ACINQ', capacity: 800000000, channels: 120, type: 'wallet', country: 'France', uptime: 99.8, fee_rate: 0 },
        { name: 'Muun', alias: 'Muun-Wallet', capacity: 400000000, channels: 80, type: 'wallet', country: 'Argentina', uptime: 99.6, fee_rate: 0 },
      ]

      // Merchant nodes
      const merchantNodes = [
        { name: 'BTCPay Server', alias: 'BTCPay-Hub', capacity: 300000000, channels: 95, type: 'merchant', country: 'Netherlands', uptime: 99.4, fee_rate: 1000 },
        { name: 'OpenNode', alias: 'OpenNode-Pay', capacity: 450000000, channels: 110, type: 'merchant', country: 'United States', uptime: 99.7, fee_rate: 800 },
        { name: 'Strike', alias: 'Strike-Global', capacity: 700000000, channels: 130, type: 'merchant', country: 'United States', uptime: 99.8, fee_rate: 0 },
      ]

      // Add all nodes with proper positioning
      let nodeIndex = 1
      const allNodeTypes = [
        { nodes: majorNodes, radius: 200 },
        { nodes: walletNodes, radius: 350 },
        { nodes: merchantNodes, radius: 500 }
      ]

      allNodeTypes.forEach(({ nodes: nodeGroup, radius }) => {
        nodeGroup.forEach((nodeData, i) => {
          const angle = (i / nodeGroup.length) * 2 * Math.PI
          nodes.push({
            id: `node-${nodeIndex}`,
            name: nodeData.name,
            alias: nodeData.alias,
            capacity: nodeData.capacity,
            channels: nodeData.channels,
            type: nodeData.type as Node['type'],
            country: nodeData.country,
            uptime: nodeData.uptime,
            fee_rate: nodeData.fee_rate,
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
          })
          nodeIndex++
        })
      })

      // Generate realistic links
      const links: Link[] = []
      
      // Connect your node to major hubs (direct connections)
      const majorHubIds = nodes.filter(n => n.type === 'major-hub').map(n => n.id)
      majorHubIds.forEach(hubId => {
        links.push({
          source: 'your-node',
          target: hubId,
          capacity: Math.floor(Math.random() * 20000000) + 5000000, // 0.05-0.25 BTC
          fee_rate: Math.floor(Math.random() * 500) + 100,
          active: Math.random() > 0.05,
          last_update: Date.now() - Math.floor(Math.random() * 3600000)
        })
      })

      // Connect your node to some exchanges
      const exchangeIds = nodes.filter(n => n.type === 'exchange').map(n => n.id).slice(0, 3)
      exchangeIds.forEach(exchangeId => {
        links.push({
          source: 'your-node',
          target: exchangeId,
          capacity: Math.floor(Math.random() * 15000000) + 3000000,
          fee_rate: Math.floor(Math.random() * 800) + 200,
          active: Math.random() > 0.1,
          last_update: Date.now() - Math.floor(Math.random() * 7200000)
        })
      })

      // Create hub-to-hub connections (backbone)
      for (let i = 0; i < majorHubIds.length; i++) {
        for (let j = i + 1; j < majorHubIds.length; j++) {
          if (Math.random() > 0.3) { // 70% chance of connection
            links.push({
              source: majorHubIds[i],
              target: majorHubIds[j],
              capacity: Math.floor(Math.random() * 100000000) + 50000000, // 0.5-1.5 BTC
              fee_rate: Math.floor(Math.random() * 200) + 50,
              active: Math.random() > 0.02,
              last_update: Date.now() - Math.floor(Math.random() * 1800000)
            })
          }
        }
      }

      // Connect hubs to wallets and merchants
      const hubIds = nodes.filter(n => n.type === 'major-hub' || n.type === 'exchange').map(n => n.id)
      const serviceIds = nodes.filter(n => n.type === 'wallet' || n.type === 'merchant').map(n => n.id)
      
      serviceIds.forEach(serviceId => {
        // Each service connects to 2-4 hubs
        const numConnections = Math.floor(Math.random() * 3) + 2
        const shuffledHubs = [...hubIds].sort(() => Math.random() - 0.5).slice(0, numConnections)
        
        shuffledHubs.forEach(hubId => {
          links.push({
            source: hubId,
            target: serviceId,
            capacity: Math.floor(Math.random() * 30000000) + 10000000,
            fee_rate: Math.floor(Math.random() * 1000) + 100,
            active: Math.random() > 0.08,
            last_update: Date.now() - Math.floor(Math.random() * 5400000)
          })
        })
      })

      const data = { nodes, links }
      
      // Calculate network statistics
      const totalCapacity = links.reduce((sum, link) => sum + link.capacity, 0)
      const stats: NetworkStats = {
        totalNodes: nodes.length,
        totalChannels: links.length,
        totalCapacity,
        avgChannelSize: totalCapacity / links.length,
        yourNodeRank: 12 // Simulated rank based on capacity
      }

      return { data, stats }
    }

    setTimeout(() => {
      const { data, stats } = generateRealisticData()
      setGraphData(data)
      setNetworkStats(stats)
      setIsLoading(false)
    }, 1500)
  }, [])

  const filteredData = {
    nodes: graphData.nodes.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (node.alias && node.alias.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesFilter = 
        filterType === 'all' ||
        (filterType === 'hubs' && (node.type === 'yours' || node.type === 'major-hub')) ||
        (filterType === 'exchanges' && (node.type === 'yours' || node.type === 'exchange')) ||
        (filterType === 'high-capacity' && node.capacity > 500000000)
      
      return matchesSearch && matchesFilter
    }),
    links: graphData.links.filter(link => {
      const sourceExists = graphData.nodes.some(n => n.id === link.source)
      const targetExists = graphData.nodes.some(n => n.id === link.target)
      return sourceExists && targetExists && link.active
    })
  }

  const getNodeColor = (node: Node) => {
    switch (node.type) {
      case 'yours': return '#f59e0b' // Amber
      case 'major-hub': return '#3b82f6' // Blue
      case 'exchange': return '#10b981' // Green
      case 'wallet': return '#8b5cf6' // Purple
      case 'routing': return '#06b6d4' // Cyan
      case 'merchant': return '#f97316' // Orange
      default: return '#6b7280' // Gray
    }
  }

  const getLinkColor = (link: Link) => {
    if (!link.active) return '#ef4444' // Red for inactive
    if (link.capacity > 50000000) return '#10b981' // Green for high capacity
    if (link.capacity > 20000000) return '#f59e0b' // Amber for medium capacity
    return '#6b7280' // Gray for low capacity
  }

  const getLinkWidth = (link: Link) => {
    const baseWidth = Math.sqrt(link.capacity / 5000000)
    return Math.max(1, Math.min(8, baseWidth))
  }

  const handleNodeClick = (node: any) => {
    setSelectedNode(node)
  }

  const handleZoomIn = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom()
      const newZoom = currentZoom * 1.2
      setZoomLevel(newZoom)
      graphRef.current.zoom(newZoom, 1000)
    }
  }

  const handleZoomOut = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom()
      const newZoom = currentZoom * 0.8
      setZoomLevel(newZoom)
      graphRef.current.zoom(newZoom, 1000)
    }
  }

  const handleZoomToFit = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(1000)
      setZoomLevel(1)
    }
  }

  const formatBTC = (sats: number) => {
    return (sats / 100000000).toFixed(3) + ' BTC'
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  if (isLoading) {
    return (
      <Card className="w-full h-[700px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Lightning Network Map
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[600px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div className="space-y-2">
              <p className="text-lg font-medium">Loading Lightning Network</p>
              <p className="text-sm text-muted-foreground">Discovering nodes and channels...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <Card className="h-[calc(100vh-3rem)] bg-slate-800/50 border-slate-700 backdrop-blur-sm shadow-2xl">
        <CardHeader className="pb-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Network className="h-7 w-7 text-white" />
              </div>
                <div>
                <CardTitle className="text-3xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Lightning Network Topology
                </CardTitle>
                <p className="text-slate-400 mt-1">
                  Real-time network visualization and analysis
                </p>
              </div>
                </div>
            
            <div className="flex items-center gap-3">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'topology' | 'geographic')}>
                <TabsList className="bg-slate-700 border-slate-600">
                  <TabsTrigger value="topology" className="flex items-center gap-2 data-[state=active]:bg-slate-600">
                    <Network className="h-4 w-4" />
                    Topology
                  </TabsTrigger>
                  <TabsTrigger value="geographic" className="flex items-center gap-2 data-[state=active]:bg-slate-600">
                    <Globe className="h-4 w-4" />
                    Geographic
                  </TabsTrigger>
                </TabsList>
              </Tabs>
                </div>
              </div>
        </CardHeader>

        <CardContent className="flex-1 flex gap-6 h-[calc(100%-8rem)]">
          {/* Enhanced Sidebar */}
          <div className="w-80 space-y-6">
            {/* Search with enhanced styling */}
              <div className="space-y-3">
              <Label htmlFor="search" className="text-slate-300 font-medium">Search Nodes</Label>
                <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Search by name or alias..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                  />
                </div>
              </div>

            {/* Enhanced Filter */}
              <div className="space-y-3">
              <Label className="text-slate-300 font-medium">Filter by Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'all', label: 'All', icon: Network, color: 'bg-slate-600 hover:bg-slate-500' },
                  { key: 'hubs', label: 'Hubs', icon: Users, color: 'bg-blue-600 hover:bg-blue-500' },
                  { key: 'exchanges', label: 'Exchanges', icon: TrendingUp, color: 'bg-green-600 hover:bg-green-500' },
                  { key: 'high-capacity', label: 'High Cap', icon: Zap, color: 'bg-purple-600 hover:bg-purple-500' }
                ].map(({ key, label, icon: Icon, color }) => (
                  <Button
                    key={key}
                    variant={filterType === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(key as any)}
                    className={`flex items-center gap-2 transition-all duration-200 ${
                      filterType === key 
                        ? color 
                        : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </Button>
                ))}
              </div>
              </div>

            {/* Enhanced Controls */}
            <div className="space-y-3">
              <Label className="text-slate-300 font-medium">Visualization Controls</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleZoomIn}
                  className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleZoomOut}
                  className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleZoomToFit}
                  className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Animation Controls */}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAnimating(!isAnimating)}
                  className={`${isAnimating ? 'bg-green-600 hover:bg-green-500' : 'bg-slate-700/50 border-slate-600'} text-white`}
                >
                  {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isAnimating ? 'Pause' : 'Play'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowLabels(!showLabels)}
                  className={`${showLabels ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-700/50 border-slate-600'} text-white`}
                >
                  {showLabels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  Labels
                </Button>
              </div>
            </div>

            {/* Enhanced Network Stats */}
            {networkStats && showStats && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300 font-medium">Network Statistics</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowStats(false)}
                    className="text-slate-400 hover:text-slate-300"
                  >
                    <EyeOff className="h-4 w-4" />
                  </Button>
                  </div>
                <div className="space-y-3 text-sm bg-slate-700/30 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Nodes:</span>
                    <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                      {formatNumber(networkStats.totalNodes)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Channels:</span>
                    <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                      {formatNumber(networkStats.totalChannels)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Capacity:</span>
                    <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                      {formatBTC(networkStats.totalCapacity)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Avg Channel Size:</span>
                    <Badge variant="secondary" className="bg-orange-600/20 text-orange-300">
                      {formatBTC(networkStats.avgChannelSize)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Your Node Rank:</span>
                    <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-300">
                      #{networkStats.yourNodeRank}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Legend */}
            <div className="space-y-3">
              <Label className="text-slate-300 font-medium">Node Types</Label>
              <div className="space-y-2 text-sm bg-slate-700/30 rounded-lg p-4">
                {[
                  { type: 'yours', label: 'Your Node', color: '#f59e0b' },
                  { type: 'major-hub', label: 'Major Hubs', color: '#3b82f6' },
                  { type: 'exchange', label: 'Exchanges', color: '#10b981' },
                  { type: 'wallet', label: 'Wallet Services', color: '#8b5cf6' },
                  { type: 'routing', label: 'Routing Nodes', color: '#06b6d4' },
                  { type: 'merchant', label: 'Merchants', color: '#f97316' }
                ].map(({ type, label, color }) => (
                  <div key={type} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                    <span className="text-slate-300">{label}</span>
                  </div>
                ))}
                  </div>
                  </div>

            {/* Enhanced Channel Status Legend */}
            <div className="space-y-3">
              <Label className="text-slate-300 font-medium">Channel Status</Label>
              <div className="space-y-2 text-sm bg-slate-700/30 rounded-lg p-4">
                {[
                  { status: 'high', label: 'High Capacity (>0.5 BTC)', color: '#10b981' },
                  { status: 'medium', label: 'Medium Capacity (>0.2 BTC)', color: '#f59e0b' },
                  { status: 'standard', label: 'Standard Capacity', color: '#6b7280' },
                  { status: 'inactive', label: 'Inactive Channel', color: '#ef4444' }
                ].map(({ status, label, color }) => (
                  <div key={status} className="flex items-center gap-3">
                    <div className="w-6 h-1 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                    <span className="text-slate-300">{label}</span>
                  </div>
                ))}
              </div>
              </div>

            {/* Enhanced Selected Node Details */}
              {selectedNode && (
              <Card className="bg-slate-700/50 border-slate-600">
                  <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-3">
                      <div 
                      className="w-4 h-4 rounded-full shadow-lg" 
                        style={{ backgroundColor: getNodeColor(selectedNode) }}
                      />
                    <span className="text-white">{selectedNode.alias || selectedNode.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Type:</span>
                    <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                      {selectedNode.type.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Capacity:</span>
                    <span className="text-white font-medium">{formatBTC(selectedNode.capacity)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Channels:</span>
                    <span className="text-white font-medium">{formatNumber(selectedNode.channels)}</span>
                  </div>
                  {selectedNode.country && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Country:</span>
                      <span className="text-white">{selectedNode.country}</span>
                      </div>
                    )}
                  {selectedNode.uptime !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Uptime:</span>
                      <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                        {selectedNode.uptime.toFixed(1)}%
                      </Badge>
                    </div>
                  )}
                  {selectedNode.fee_rate !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Base Fee:</span>
                      <span className="text-white">{selectedNode.fee_rate} msat</span>
                      </div>
                    )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4 bg-slate-600/50 border-slate-500 text-white hover:bg-slate-500"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                      View on Explorer
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

          {/* Enhanced Graph */}
          <div className="flex-1 h-[700px] border border-slate-600 rounded-xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 relative overflow-hidden shadow-2xl">
              <ForceGraph2D
                ref={graphRef}
                graphData={filteredData}
                nodeId="id"
                nodeLabel={(node: any) => `
                <div style="background: linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95)); color: white; padding: 12px; border-radius: 8px; font-size: 13px; border: 1px solid rgba(59,130,246,0.3); box-shadow: 0 8px 32px rgba(0,0,0,0.3); backdrop-filter: blur(8px);">
                  <div style="font-weight: 600; margin-bottom: 4px; color: #60a5fa;">${node.name}</div>
                  ${node.alias ? `<div style="color: #94a3b8; font-size: 11px; margin-bottom: 2px;">${node.alias}</div>` : ''}
                  <div style="color: #cbd5e1; font-size: 11px;">Type: ${node.type.replace('-', ' ')}</div>
                  <div style="color: #cbd5e1; font-size: 11px;">Capacity: ${formatBTC(node.capacity)}</div>
                  <div style="color: #cbd5e1; font-size: 11px;">Channels: ${formatNumber(node.channels)}</div>
                  ${node.uptime ? `<div style="color: #10b981; font-size: 11px;">Uptime: ${node.uptime.toFixed(1)}%</div>` : ''}
                  </div>
                `}
                nodeColor={getNodeColor}
                nodeRelSize={8}
                nodeVal={(node: any) => {
                  const baseSize = Math.sqrt(node.capacity / 10000000)
                return Math.max(6, Math.min(25, baseSize))
                }}
                linkColor={getLinkColor}
                linkWidth={getLinkWidth}
              linkDirectionalParticles={isAnimating ? 3 : 0}
              linkDirectionalParticleSpeed={particleSpeed}
              linkDirectionalParticleWidth={3}
                linkDirectionalParticleColor={getLinkColor}
                onNodeClick={handleNodeClick}
              backgroundColor="transparent"
                width={undefined}
                height={700}
              warmupTicks={150}
              cooldownTicks={300}
              cooldownTime={20000}
            />
            
            {/* Enhanced Overlay info */}
            <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-md border border-slate-600 rounded-xl p-4 text-sm shadow-xl">
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <Activity className="h-4 w-4" />
                <span className="font-medium">Network Active</span>
                </div>
              <div className="text-xs text-slate-400 mt-2">
                <div className="flex gap-4">
                  <span>{filteredData.nodes.length} nodes</span>
                  <span>•</span>
                  <span>{filteredData.links.length} channels</span>
                </div>
              </div>
            </div>

            {/* Zoom level indicator */}
            <div className="absolute bottom-4 right-4 bg-slate-800/90 backdrop-blur-md border border-slate-600 rounded-lg p-2 text-xs text-slate-400">
              Zoom: {Math.round(zoomLevel * 100)}%
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 