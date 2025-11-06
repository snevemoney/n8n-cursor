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
  Users
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
      graphRef.current.zoom(1.5, 400)
    }
  }

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(0.75, 400)
    }
  }

  const handleZoomToFit = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50)
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
    <div className="w-full space-y-6">
      {/* Network Statistics */}
      {networkStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Network className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Nodes</p>
                  <p className="text-2xl font-bold">{formatNumber(networkStats.totalNodes)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-amber-600" />
                <div>
                  <p className="text-sm font-medium">Channels</p>
                  <p className="text-2xl font-bold">{formatNumber(networkStats.totalChannels)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Total Capacity</p>
                  <p className="text-2xl font-bold">{formatBTC(networkStats.totalCapacity)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Avg Channel</p>
                  <p className="text-2xl font-bold">{formatBTC(networkStats.avgChannelSize)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Your Rank</p>
                  <p className="text-2xl font-bold">#{networkStats.yourNodeRank}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Lightning Network Topology
            <Badge variant="secondary" className="ml-auto">Live</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col xl:flex-row gap-6">
            {/* Controls */}
            <div className="xl:w-80 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="search">Search Nodes</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name or alias..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Filter by Type</Label>
                <Tabs value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="hubs">Hubs</TabsTrigger>
                  </TabsList>
                  <TabsList className="grid w-full grid-cols-2 mt-2">
                    <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
                    <TabsTrigger value="high-capacity">High Cap</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleZoomToFit}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Enhanced Legend */}
              <div className="space-y-3">
                <Label>Node Types</Label>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span>Your Node</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Major Hubs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Exchanges</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span>Wallet Services</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                    <span>Routing Nodes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span>Merchants</span>
                  </div>
                </div>
                
                <Label className="mt-4">Channel Status</Label>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-green-500"></div>
                    <span>High Capacity (&gt;0.5 BTC)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-amber-500"></div>
                    <span>Medium Capacity (&gt;0.2 BTC)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-gray-500"></div>
                    <span>Standard Capacity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-red-500"></div>
                    <span>Inactive Channel</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Node Details */}
              {selectedNode && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getNodeColor(selectedNode) }}
                      />
                      Node Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <strong>Name:</strong> {selectedNode.name}
                    </div>
                    {selectedNode.alias && (
                      <div>
                        <strong>Alias:</strong> {selectedNode.alias}
                      </div>
                    )}
                    <div>
                      <strong>Type:</strong> 
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {selectedNode.type.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <strong>Capacity:</strong> {formatBTC(selectedNode.capacity)}
                    </div>
                    <div>
                      <strong>Channels:</strong> {formatNumber(selectedNode.channels)}
                    </div>
                    {selectedNode.country && (
                      <div>
                        <strong>Country:</strong> {selectedNode.country}
                      </div>
                    )}
                    {selectedNode.uptime && (
                      <div>
                        <strong>Uptime:</strong> {selectedNode.uptime.toFixed(1)}%
                      </div>
                    )}
                    {selectedNode.fee_rate !== undefined && (
                      <div>
                        <strong>Base Fee:</strong> {selectedNode.fee_rate} msat
                      </div>
                    )}
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View on Explorer
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Graph */}
            <div className="flex-1 h-[700px] border rounded-lg bg-background relative overflow-hidden">
              <ForceGraph2D
                ref={graphRef}
                graphData={filteredData}
                nodeId="id"
                nodeLabel={(node: any) => `
                  <div style="background: rgba(0,0,0,0.8); color: white; padding: 8px; border-radius: 4px; font-size: 12px;">
                    <strong>${node.name}</strong><br/>
                    ${node.alias ? `Alias: ${node.alias}<br/>` : ''}
                    Type: ${node.type.replace('-', ' ')}<br/>
                    Capacity: ${formatBTC(node.capacity)}<br/>
                    Channels: ${formatNumber(node.channels)}<br/>
                    ${node.uptime ? `Uptime: ${node.uptime.toFixed(1)}%` : ''}
                  </div>
                `}
                nodeColor={getNodeColor}
                nodeRelSize={8}
                nodeVal={(node: any) => {
                  const baseSize = Math.sqrt(node.capacity / 10000000)
                  return Math.max(4, Math.min(20, baseSize))
                }}
                linkColor={getLinkColor}
                linkWidth={getLinkWidth}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.004}
                linkDirectionalParticleWidth={2}
                linkDirectionalParticleColor={getLinkColor}
                onNodeClick={handleNodeClick}
                backgroundColor="#fafafa"
                width={undefined}
                height={700}
                warmupTicks={100}
                cooldownTicks={200}
                cooldownTime={15000}
              />
              
              {/* Overlay info */}
              <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm border rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2 text-green-600">
                  <Activity className="h-4 w-4" />
                  <span>Network Active</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {filteredData.nodes.length} nodes • {filteredData.links.length} channels
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 