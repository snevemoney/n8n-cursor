"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { useSmartRedirect } from "../../../hooks/useSmartRedirect"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Badge } from "../../../components/ui/badge"
import { 
  Network, 
  ArrowLeft,
  Zap,
  Activity,
  Globe,
  Eye,
  Bolt,
  TrendingUp,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import dynamic from "next/dynamic"

// Dynamic import for Lightning Network Monitor to prevent SSR issues
const LightningNetworkMonitor = dynamic(() => import("../../../components/lightning-network-monitor").then(mod => ({ default: mod.LightningNetworkMonitor })), { 
  ssr: false,
  loading: () => <div className="h-96 flex items-center justify-center text-gray-400">Loading Lightning Network Monitor...</div>
});

export default function NetworkMonitorPage() {
  const { goTo } = useSmartRedirect({ context: 'network-monitor' })

  return (
    <div className="px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => goTo('EARNINGS')}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Earnings
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Network className="h-8 w-8 text-purple-500" />
            Lightning Network Monitor
          </h1>
          <p className="text-gray-400 mt-2">
            Interactive real-time visualization of your Lightning Network connections and global payment flows
          </p>
        </div>
      </div>

      {/* Network Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-gray-800 bg-gray-850/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Network Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">Operational</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              All systems running smoothly
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-850/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">98.7%</div>
            <p className="text-sm text-gray-400">
              Payment routing success
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-850/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-500" />
              Connected Peers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">12</div>
            <p className="text-sm text-gray-400">
              Active connections
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-850/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bolt className="h-5 w-5 text-purple-500" />
              Avg Speed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">365ms</div>
            <p className="text-sm text-gray-400">
              Payment processing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Lightning Network Monitor Component */}
      <Card className="rounded-xl border border-gray-800 bg-gray-850/80 shadow-card overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-6 w-6 text-purple-500" />
                Interactive Network Topology
              </CardTitle>
              <CardDescription className="mt-2">
                Watch live Lightning Network payments flow through your node and the global network. 
                Click nodes to explore connections, use controls to simulate payments.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Eye className="h-4 w-4" />
              <span>Live visualization</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <LightningNetworkMonitor />
        </CardContent>
      </Card>

      {/* Network Insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-gray-800 bg-gray-850/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Network Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                <div>
                  <div className="font-medium">Channel Utilization</div>
                  <div className="text-sm text-gray-400">Average activity across channels</div>
                </div>
                <div className="text-2xl font-bold text-blue-400">82%</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                <div>
                  <div className="font-medium">Routing Volume</div>
                  <div className="text-sm text-gray-400">24h forwarded payments</div>
                </div>
                <div className="text-2xl font-bold text-green-400">2.4M sats</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                <div>
                  <div className="font-medium">Network Reach</div>
                  <div className="text-sm text-gray-400">Reachable nodes via channels</div>
                </div>
                <div className="text-2xl font-bold text-purple-400">15,847</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-850/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-500" />
              Global Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-950/30 border border-blue-800/30 rounded-lg">
                <h4 className="font-medium text-blue-100 mb-2">🇺🇸 North America</h4>
                <p className="text-sm text-blue-200">
                  4 connected peers • High liquidity region
                </p>
              </div>
              <div className="p-4 bg-green-950/30 border border-green-800/30 rounded-lg">
                <h4 className="font-medium text-green-100 mb-2">🇪🇺 Europe</h4>
                <p className="text-sm text-green-200">
                  6 connected peers • Primary routing hub
                </p>
              </div>
              <div className="p-4 bg-purple-950/30 border border-purple-800/30 rounded-lg">
                <h4 className="font-medium text-purple-100 mb-2">🌏 Asia-Pacific</h4>
                <p className="text-sm text-purple-200">
                  2 connected peers • Growing market presence
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips and Controls */}
      <Card className="border-gray-800 bg-gray-850/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-yellow-500" />
            How to Use the Network Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-3 bg-gray-900 rounded-lg">
              <div className="font-medium text-yellow-400 mb-1">🎮 Interactive Controls</div>
              <p className="text-sm text-gray-300">
                Use Play/Pause to control live transactions, zoom to explore details
              </p>
            </div>
            <div className="p-3 bg-gray-900 rounded-lg">
              <div className="font-medium text-blue-400 mb-1">⚡ Node Exploration</div>
              <p className="text-sm text-gray-300">
                Click any node to see detailed information and connection stats
              </p>
            </div>
            <div className="p-3 bg-gray-900 rounded-lg">
              <div className="font-medium text-green-400 mb-1">🌍 Global View</div>
              <p className="text-sm text-gray-300">
                Nodes are positioned by geographic location for real-world context
              </p>
            </div>
            <div className="p-3 bg-gray-900 rounded-lg">
              <div className="font-medium text-purple-400 mb-1">📊 Live Activity</div>
              <p className="text-sm text-gray-300">
                Watch real-time payment flows and routing activity across the network
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 