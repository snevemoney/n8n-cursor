/**
 * Lightning AI Platform - Security Center
 * Trust center and security proofs
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { useRouter } from "next/navigation"
import { 
  Shield,
  CheckCircle,
  AlertTriangle,
  Lock,
  Key,
  Eye,
  FileText,
  Download,
  Copy,
  ExternalLink,
  Fingerprint,
  Server,
  Globe,
  Database,
  Zap,
  Settings,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"

interface SecurityMetrics {
  overallScore: number
  walletSecurity: number
  networkSecurity: number
  dataSecurity: number
  accessControl: number
}

export default function SecurityPage() {
  const router = useRouter()
  const [metrics] = useState<SecurityMetrics>({
    overallScore: 95,
    walletSecurity: 98,
    networkSecurity: 92,
    dataSecurity: 96,
    accessControl: 94
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-100"
    if (score >= 70) return "bg-yellow-100"
    return "bg-red-100"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Security Center</h1>
          <p className="text-muted-foreground mt-2">Trust center and security proofs</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Scan
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/settings/security')}>
            <Settings className="h-4 w-4 mr-2" />
            Security Settings
          </Button>
        </div>
      </div>

      {/* Security Score Overview */}
      <Card className={`border-2 ${metrics.overallScore >= 90 ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'} dark:bg-opacity-10`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${getScoreColor(metrics.overallScore)}`}>
            <Shield className="h-6 w-6" />
            Overall Security Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-4xl font-bold ${getScoreColor(metrics.overallScore)}`}>
                {metrics.overallScore}%
              </p>
              <p className="text-muted-foreground mt-1">
                {metrics.overallScore >= 90 ? 'Excellent Security' : 
                 metrics.overallScore >= 70 ? 'Good Security' : 'Needs Improvement'}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${getScoreBg(metrics.overallScore)}`}>
              {metrics.overallScore >= 90 ? 
                <CheckCircle className={`h-12 w-12 ${getScoreColor(metrics.overallScore)}`} /> :
                <AlertTriangle className={`h-12 w-12 ${getScoreColor(metrics.overallScore)}`} />
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lock className="h-4 w-4" />
              Wallet Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{metrics.walletSecurity}%</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <Progress value={metrics.walletSecurity} className="h-2" />
              <p className="text-xs text-muted-foreground">Encryption, backup, multi-sig</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4" />
              Network Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{metrics.networkSecurity}%</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <Progress value={metrics.networkSecurity} className="h-2" />
              <p className="text-xs text-muted-foreground">TLS, Tor, VPN protection</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Database className="h-4 w-4" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{metrics.dataSecurity}%</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <Progress value={metrics.dataSecurity} className="h-2" />
              <p className="text-xs text-muted-foreground">Encryption at rest</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Key className="h-4 w-4" />
              Access Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{metrics.accessControl}%</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <Progress value={metrics.accessControl} className="h-2" />
              <p className="text-xs text-muted-foreground">2FA, permissions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Security Features
            </CardTitle>
            <CardDescription>Active security measures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Lock className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Wallet Encryption</p>
                  <p className="text-sm text-muted-foreground">AES-256 encryption</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Database className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Automatic Backup</p>
                  <p className="text-sm text-muted-foreground">Daily encrypted backups</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Globe className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">TLS Encryption</p>
                  <p className="text-sm text-muted-foreground">All connections secured</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Fingerprint className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium">2FA Authentication</p>
                  <p className="text-sm text-muted-foreground">Optional setup</p>
                </div>
              </div>
              <Badge variant="secondary">Optional</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Security Certificates
            </CardTitle>
            <CardDescription>Cryptographic proofs and certificates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Node Certificate</p>
              <div className="flex items-center gap-2 p-3 bg-muted rounded">
                <div className="flex-1">
                  <p className="text-xs font-mono">SHA256: a1b2c3d4e5f6...</p>
                  <p className="text-xs text-muted-foreground">Valid until: Dec 2024</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard('a1b2c3d4e5f6')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Wallet Signature</p>
              <div className="flex items-center gap-2 p-3 bg-muted rounded">
                <div className="flex-1">
                  <p className="text-xs font-mono">PGP: 7A8B9C0D...</p>
                  <p className="text-xs text-muted-foreground">Verified signature</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard('7A8B9C0D')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                Verify
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Audit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Security Audit Log
          </CardTitle>
          <CardDescription>Recent security events and checks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Security scan completed</p>
                  <p className="text-sm text-muted-foreground">All systems secure</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">2 minutes ago</p>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Lock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Wallet backup verified</p>
                  <p className="text-sm text-muted-foreground">Backup integrity confirmed</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">1 hour ago</p>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Lightning network security check</p>
                  <p className="text-sm text-muted-foreground">Channel security verified</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">6 hours ago</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <Button variant="outline" className="w-full" onClick={() => router.push('/trust-center')}>
              View Trust Center
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Security Recommendations
          </CardTitle>
          <CardDescription>Improve your security posture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Fingerprint className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-900 dark:text-blue-100">Enable 2FA</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Add two-factor authentication for enhanced account security
                </p>
                <Button size="sm" className="mt-2" onClick={() => router.push('/settings/security')}>
                  Set up 2FA
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900 dark:text-green-100">Regular Backups</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your wallet is automatically backed up daily
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 