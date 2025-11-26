/**
 * Lightning AI Platform - Wallet Control Center
 * Main wallet management interface
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { useRouter } from "next/navigation"
import { 
  Wallet,
  Eye,
  EyeOff,
  Copy,
  Send,
  Download,
  Settings,
  Shield,
  Activity,
  CheckCircle,
  AlertTriangle,
  QrCode,
  Plus,
  Minus,
  ArrowRight,
  DollarSign,
  Zap,
  Lock,
  Key,
  Database
} from "lucide-react"
import { toast } from "sonner"

interface WalletMetrics {
  totalBalance: number
  onchainBalance: number
  lightningBalance: number
  pendingBalance: number
  channelCapacity: number
  lockedBalance: number
}

export default function WalletPage() {
  const router = useRouter()
  const [showBalance, setShowBalance] = useState(true)
  const [metrics] = useState<WalletMetrics>({
    totalBalance: 1250000,
    onchainBalance: 500000,
    lightningBalance: 750000,
    pendingBalance: 25000,
    channelCapacity: 1800000,
    lockedBalance: 800000
  })

  const formatSats = (sats: number) => {
    if (sats >= 100000) {
      return `${(sats / 100000).toFixed(1)}M`
    }
    if (sats >= 1000) {
      return `${(sats / 1000).toFixed(0)}k`
    }
    return sats.toString()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wallet</h1>
          <p className="text-muted-foreground mt-2">Manage your Bitcoin and Lightning funds</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBalance(!showBalance)}
          >
            {showBalance ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showBalance ? 'Hide' : 'Show'} Balance
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/settings/wallet')}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-foreground">
                  {showBalance ? `${formatSats(metrics.totalBalance)} sats` : '••••••••'}
                </p>
                <p className="text-muted-foreground mt-2">≈ $247.50 USD</p>
              </div>

              {/* Balance Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium">On-chain</span>
                    </div>
                    <span className="text-sm font-medium">
                      {showBalance ? `${formatSats(metrics.onchainBalance)} sats` : '••••'}
                    </span>
                  </div>
                  <Progress 
                    value={(metrics.onchainBalance / metrics.totalBalance) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Lightning</span>
                    </div>
                    <span className="text-sm font-medium">
                      {showBalance ? `${formatSats(metrics.lightningBalance)} sats` : '••••'}
                    </span>
                  </div>
                  <Progress 
                    value={(metrics.lightningBalance / metrics.totalBalance) * 100} 
                    className="h-2"
                  />
                </div>
              </div>

              {showBalance && metrics.pendingBalance > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <span className="text-sm font-medium">{formatSats(metrics.pendingBalance)} sats</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Wallet Encrypted</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Yes
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Backup Status</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Multi-sig</span>
              <Badge variant="secondary">Optional</Badge>
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => router.push('/settings/security')}>
              <Lock className="h-4 w-4 mr-2" />
              Security Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/payments/send')}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <Send className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Send</h3>
                <p className="text-xs text-muted-foreground">Send Bitcoin payment</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/payments/receive')}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Receive</h3>
                <p className="text-xs text-muted-foreground">Generate QR code</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/payments/history')}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">History</h3>
                <p className="text-xs text-muted-foreground">View transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/settings/backup')}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Database className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Backup</h3>
                <p className="text-xs text-muted-foreground">Secure backup</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Lightning Channels
            </CardTitle>
            <CardDescription>Channel capacity and liquidity overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Capacity</span>
              <span className="text-sm font-medium">
                {showBalance ? `${formatSats(metrics.channelCapacity)} sats` : '••••'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Available (Local)</span>
              <span className="text-sm font-medium">
                {showBalance ? `${formatSats(metrics.lightningBalance)} sats` : '••••'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Locked (Remote)</span>
              <span className="text-sm font-medium">
                {showBalance ? `${formatSats(metrics.lockedBalance)} sats` : '••••'}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Local Balance</span>
                <span>Remote Balance</span>
              </div>
              <Progress 
                value={(metrics.lightningBalance / metrics.channelCapacity) * 100} 
                className="h-2"
              />
            </div>
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Open Channel
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Wallet Information
            </CardTitle>
            <CardDescription>Node and wallet identifiers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Node Public Key</p>
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <code className="text-xs font-mono flex-1 overflow-hidden">
                  02a1b2c3d4e5f6...789abc
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard('02a1b2c3d4e5f6789abc')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Wallet Address</p>
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <code className="text-xs font-mono flex-1 overflow-hidden">
                  bc1q...abc123
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard('bc1qabc123')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <QrCode className="h-4 w-4 mr-2" />
                Show QR
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => router.push('/settings/wallet')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/payments/history')}>
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent transactions</p>
            <p className="text-sm">Your wallet activity will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 