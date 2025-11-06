"use client"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { TrustCenter } from "../../components/ui/trust-center"
import { TrustInfo } from "../../components/ui/trust-info"
import { 
  Shield, 
  Key, 
  Download, 
  History, 
  Bot, 
  Vault,
  ArrowLeft,
  Copy,
  Check,
  FileText,
  Database
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getProofs, exportProofs, getProofStats } from "../../core/crypto/proofLog"

interface NodeInfo {
  publicKey: string
  nodeId: string
  version: string
  uptime: string
}

interface AgentVersion {
  id: string
  name: string
  version: string
  lastUpdated: string
  signatureHash: string
  verified: boolean
}

export default function TrustCenterPage() {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [nodeInfo, setNodeInfo] = useState<NodeInfo | null>(null)
  const [agentVersions, setAgentVersions] = useState<AgentVersion[]>([])
  const [proofStats, setProofStats] = useState<any>(null)

  useEffect(() => {
    loadTrustData()
  }, [])

  const loadTrustData = async () => {
    try {
      setLoading(true)
      
      // Load node info (mock data for now)
      setNodeInfo({
        publicKey: "03a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
        nodeId: "lightning-node-001",
        version: "v1.2.3",
        uptime: "15 days, 4 hours"
      })

      // Load agent versions (mock data)
      setAgentVersions([
        {
          id: "earnings-optimizer",
          name: "Earnings Optimizer",
          version: "v2.1.0",
          lastUpdated: "2024-01-15T10:30:00Z",
          signatureHash: "sha256:a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
          verified: true
        },
        {
          id: "payment-processor",
          name: "Payment Processor",
          version: "v1.8.2",
          lastUpdated: "2024-01-14T16:45:00Z",
          signatureHash: "sha256:b2c3d4e5f6789012345678901234567890123456789012345678901234567890a1",
          verified: true
        },
        {
          id: "vault-manager",
          name: "Vault Manager",
          version: "v1.5.1",
          lastUpdated: "2024-01-13T09:15:00Z",
          signatureHash: "sha256:c3d4e5f6789012345678901234567890123456789012345678901234567890a1b2",
          verified: false
        }
      ])

      // Load proof statistics
      const stats = await getProofStats()
      setProofStats(stats)

    } catch (error) {
      console.error('Failed to load trust data:', error)
      toast.error('Failed to load trust data')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyPublicKey = async () => {
    if (!nodeInfo) return
    
    try {
      await navigator.clipboard.writeText(nodeInfo.publicKey)
      setCopied(true)
      toast.success("Public key copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy public key")
    }
  }

  const handleExportAllLogs = async (format: 'json' | 'csv') => {
    try {
      const data = await exportProofs(format)
      
      // Create download
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `trust-center-export-${Date.now()}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success(`Activity logs exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export logs')
    }
  }

  const handleExportColdVault = () => {
    toast.info("Cold vault export", {
      description: "This would generate a secure backup of your vault keys"
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const truncateHash = (hash: string, length: number = 8) => {
    return `${hash.slice(0, length)}...${hash.slice(-length)}`
  }

  if (loading) {
    return (
      <div className="px-6 py-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-800 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-gray-800 rounded"></div>
            <div className="h-48 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-900/30 p-2 rounded-full">
            <Shield className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Trust Center</h1>
            <p className="text-gray-400">Cryptographic verification and audit trail</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.back()}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Node Public Key */}
        <Card className="border-gray-800 bg-gray-900/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-500" />
              Node Identity
            </CardTitle>
            <CardDescription>
              Your node's cryptographic identity and verification key
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {nodeInfo && (
              <>
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Public Key</div>
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-xs bg-gray-800/50 p-2 rounded border flex-1 break-all">
                      {nodeInfo.publicKey}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyPublicKey}
                      className="shrink-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Node ID</div>
                    <div className="text-white">{nodeInfo.nodeId}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Version</div>
                    <div className="text-white">{nodeInfo.version}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Uptime</div>
                    <div className="text-white">{nodeInfo.uptime}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Status</div>
                    <Badge className="bg-green-900/30 text-green-400 border-green-700/50">
                      Active
                    </Badge>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Trust Statistics */}
        <Card className="border-gray-800 bg-gray-900/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-500" />
              Trust Statistics
            </CardTitle>
            <CardDescription>
              Overview of your cryptographic activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {proofStats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-800/30 rounded">
                  <div className="text-2xl font-bold text-white">{proofStats.totalProofs}</div>
                  <div className="text-xs text-gray-400">Total Actions</div>
                </div>
                <div className="text-center p-3 bg-gray-800/30 rounded">
                  <div className="text-2xl font-bold text-green-400">{proofStats.verifiedProofs}</div>
                  <div className="text-xs text-gray-400">Verified</div>
                </div>
                <div className="text-center p-3 bg-gray-800/30 rounded">
                  <div className="text-2xl font-bold text-blue-400">
                    {Math.round((proofStats.verifiedProofs / proofStats.totalProofs) * 100)}%
                  </div>
                  <div className="text-xs text-gray-400">Trust Rate</div>
                </div>
                <div className="text-center p-3 bg-gray-800/30 rounded">
                  <div className="text-2xl font-bold text-amber-400">{proofStats.recentActivity.length}</div>
                  <div className="text-xs text-gray-400">Recent</div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                No trust data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agent Versions */}
      <Card className="border-gray-800 bg-gray-900/70 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-500" />
            Agent Version History
          </CardTitle>
          <CardDescription>
            Cryptographically signed agent versions and their verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {agentVersions.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded border border-gray-700">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">{agent.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {agent.version}
                    </Badge>
                    {agent.verified ? (
                      <Badge className="bg-green-900/30 text-green-400 border-green-700/50 text-xs">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Unverified
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    Updated: {formatDate(agent.lastUpdated)}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {truncateHash(agent.signatureHash)}
                  </div>
                </div>
                <TrustInfo
                  verified={agent.verified}
                  hash={agent.signatureHash}
                  timestamp={new Date(agent.lastUpdated).getTime()}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Signed Actions */}
      <Card className="border-gray-800 bg-gray-900/70 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-500" />
            Recent Signed Actions
          </CardTitle>
          <CardDescription>
            All cryptographically signed actions with full audit trail
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrustCenter userId="current-user" />
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card className="border-gray-800 bg-gray-900/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-amber-500" />
            Export & Backup
          </CardTitle>
          <CardDescription>
            Export your activity logs and create secure backups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => handleExportAllLogs('json')}
              className="flex items-center gap-2 h-auto p-4 flex-col"
            >
              <FileText className="h-6 w-6 text-blue-400" />
              <div className="text-center">
                <div className="font-medium">Export as JSON</div>
                <div className="text-xs text-gray-400">Machine-readable format</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleExportAllLogs('csv')}
              className="flex items-center gap-2 h-auto p-4 flex-col"
            >
              <FileText className="h-6 w-6 text-green-400" />
              <div className="text-center">
                <div className="font-medium">Export as CSV</div>
                <div className="text-xs text-gray-400">Spreadsheet format</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleExportColdVault}
              className="flex items-center gap-2 h-auto p-4 flex-col"
            >
              <Vault className="h-6 w-6 text-amber-400" />
              <div className="text-center">
                <div className="font-medium">Cold Vault Export</div>
                <div className="text-xs text-gray-400">Secure backup</div>
              </div>
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-blue-900/20 rounded border border-blue-700/30">
            <div className="text-sm text-blue-400 font-medium mb-1">
              🔒 Security Note
            </div>
            <div className="text-xs text-blue-300">
              All exports include cryptographic proofs and can be independently verified. 
              Store backups securely and never share private keys.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 