"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Switch } from "../../../components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog"
import { useSmartRedirect } from "../../../hooks/useSmartRedirect"
import {
  Database,
  Wallet,
  Key,
  Shield,
  Zap,
  Settings,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Network,
  Plus,
  CheckCircle2,
  X
} from "lucide-react"

export default function WalletSettingsPage() {
  const { goTo } = useSmartRedirect({ context: 'wallet-settings' })

  // Mock channel data
  const channels = [
    {
      id: "ch_1",
      alias: "ACINQ",
      pubkey: "03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f",
      capacity: 500000,
      localBalance: 320000,
      remoteBalance: 180000,
      status: "active",
      type: "public"
    },
    {
      id: "ch_2",
      alias: "Bitfinex",
      pubkey: "033d8656219478701227199cbd6f670335c8d408a92ae88b962c49d4dc0e83e025",
      capacity: 1000000,
      localBalance: 450000,
      remoteBalance: 550000,
      status: "active",
      type: "public"
    },
    {
      id: "ch_3",
      alias: "LN+",
      pubkey: "02df5ffe895c778e10f7742a6c5b8a0cefbe9465df58b92fadeb883752c8107c65",
      capacity: 250000,
      localBalance: 120000,
      remoteBalance: 130000,
      status: "inactive",
      type: "private"
    }
  ]

  // Helper function to get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-green-900/30 text-green-500 rounded-full text-xs">
            <CheckCircle2 className="h-3 w-3" />
            <span>Active</span>
          </div>
        );
      case 'inactive':
        return (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full text-xs">
            <X className="h-3 w-3" />
            <span>Inactive</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-900/30 text-amber-500 rounded-full text-xs">
            <AlertTriangle className="h-3 w-3" />
            <span>Pending</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full text-xs">
            <span>Unknown</span>
          </div>
        );
    }
  };

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-900/30 p-2 rounded-full">
          <Database className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Wallet Settings</h1>
          <p className="text-gray-400">Configure your Lightning node and wallet</p>
        </div>
      </div>

      <Tabs defaultValue="node" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="node">Node Config</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Node Configuration */}
        <TabsContent value="node" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Lightning Node Status
              </CardTitle>
              <CardDescription>
                Current node information and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Node Alias</Label>
                  <Input value="Lightning Business Node" />
                </div>
                <div className="space-y-2">
                  <Label>Node Color</Label>
                  <Input value="#3b82f6" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Node Public Key</Label>
                <div className="flex gap-2">
                  <Input 
                    value="03a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890"
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">Online</div>
                  <div className="text-sm text-gray-400">Status</div>
                </div>
                <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">8</div>
                  <div className="text-sm text-gray-400">Active Channels</div>
                </div>
                <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">99.8%</div>
                  <div className="text-sm text-gray-400">Uptime</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wallet Configuration */}
        <TabsContent value="wallet" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-green-500" />
                Wallet Configuration
              </CardTitle>
              <CardDescription>
                Manage your Lightning wallet settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-confirm payments under 1000 sats</Label>
                    <p className="text-sm text-gray-400">Skip confirmation for small payments</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable fee bumping</Label>
                    <p className="text-sm text-gray-400">Automatically increase fees for stuck transactions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Backup wallet on changes</Label>
                    <p className="text-sm text-gray-400">Create backup after each transaction</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="space-y-2">
                  <Label>Default Fee Rate (sat/vB)</Label>
                  <Input type="number" defaultValue="10" />
                  <p className="text-sm text-gray-400">Fee rate for on-chain transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channel Management */}
        <TabsContent value="channels" className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Network className="h-5 w-5 text-purple-500" />
                Lightning Channels
              </h2>
              <p className="text-gray-400 text-sm">Manage your Lightning Network payment channels</p>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-1" />
                  Open Channel
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800">
                <DialogHeader>
                  <DialogTitle>Open New Channel</DialogTitle>
                  <DialogDescription>
                    Create a new Lightning Network payment channel with a peer
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Node Public Key</label>
                    <Input
                      placeholder="03864ef025fde8fb587d989186ce6a4a186..."
                      className="bg-gray-800/70 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Channel Capacity</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="500000"
                        className="bg-gray-800/70 border-gray-700"
                      />
                      <Button variant="outline" className="border-gray-700 bg-gray-800/50">
                        sats
                      </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" className="border-gray-700">Cancel</Button>
                  <Button className="bg-purple-600 hover:bg-purple-700">Open Channel</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Channel Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gray-800/80 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,750,000 <span className="text-sm font-normal text-muted-foreground">sats</span></div>
                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-purple-500 w-[52%]"></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>52% Local</span>
                  <span>48% Remote</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Active Channels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{channels.filter(c => c.status === 'active').length}</div>
                <div className="text-sm text-muted-foreground">of {channels.length} total</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Routing Fees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,450 <span className="text-sm font-normal text-muted-foreground">sats</span></div>
                <div className="text-sm text-muted-foreground">This month</div>
              </CardContent>
            </Card>
          </div>

          {/* Channels List */}
          <div className="space-y-4">
            {channels.map((channel) => (
              <Card key={channel.id} className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{channel.alias}</div>
                      {getStatusBadge(channel.status)}
                      <Badge variant="outline" className="text-xs">
                        {channel.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Intl.NumberFormat().format(channel.capacity)} sats
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Local: {new Intl.NumberFormat().format(channel.localBalance)} sats</span>
                      <span className="text-gray-400">Remote: {new Intl.NumberFormat().format(channel.remoteBalance)} sats</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${(channel.localBalance / channel.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500 font-mono">
                    {channel.pubkey.substring(0, 20)}...
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Channel Policies */}
        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-500" />
                Channel Policies
              </CardTitle>
              <CardDescription>
                Configure channel policies and automation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Base Fee (msat)</Label>
                  <Input type="number" defaultValue="1000" />
                </div>
                <div className="space-y-2">
                  <Label>Default Fee Rate (ppm)</Label>
                  <Input type="number" defaultValue="500" />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-rebalance channels</Label>
                    <p className="text-sm text-gray-400">Automatically rebalance when needed</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Accept zero-conf channels</Label>
                    <p className="text-sm text-gray-400">Allow channels without confirmations</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                Advanced Settings
                <Badge variant="destructive">Danger Zone</Badge>
              </CardTitle>
              <CardDescription>
                Advanced configuration options - use with caution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="font-medium text-red-400">Wallet Recovery</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">
                    Export your wallet seed phrase for recovery purposes
                  </p>
                  <Button variant="destructive" size="sm">
                    <Key className="h-4 w-4 mr-2" />
                    Export Seed Phrase
                  </Button>
                </div>

                <div className="p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="h-4 w-4 text-yellow-400" />
                    <span className="font-medium text-yellow-400">Reset Node</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">
                    Reset node configuration to defaults
                  </p>
                  <Button variant="outline" size="sm">
                    Reset Configuration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 