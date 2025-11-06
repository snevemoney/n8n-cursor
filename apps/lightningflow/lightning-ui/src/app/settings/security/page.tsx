"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { TrustCenter } from "../../../components/ui/trust-center"
import { TrustInfo } from "../../../components/ui/trust-info"
import { useSmartRedirect } from "../../../hooks/useSmartRedirect"
import {
  Shield,
  Lock,
  Key,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
  RefreshCw
} from "lucide-react"

export default function SecuritySettingsPage() {
  const { goTo } = useSmartRedirect({ context: 'security-settings' })

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-green-900/30 p-2 rounded-full">
          <Shield className="h-6 w-6 text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Security Center</h1>
          <p className="text-gray-400">Trust center and cryptographic proofs</p>
        </div>
      </div>

      {/* Security Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Security Status
            <Badge className="bg-green-900/30 text-green-400 border-green-700/50">
              Secure
            </Badge>
          </CardTitle>
          <CardDescription>
            Your Lightning node security overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="font-medium text-green-400">Wallet Encrypted</div>
              <div className="text-sm text-gray-400">AES-256 encryption</div>
            </div>
            <div className="text-center p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
              <Lock className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="font-medium text-green-400">TLS Enabled</div>
              <div className="text-sm text-gray-400">Secure connections</div>
            </div>
            <div className="text-center p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
              <Key className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="font-medium text-green-400">Macaroons Active</div>
              <div className="text-sm text-gray-400">API authentication</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Center */}
      <div className="mb-8">
        <TrustCenter />
      </div>

      {/* Trust Information */}
      <div className="mb-8">
        <TrustInfo 
          verified={true}
          timestamp={Date.now()}
          hash="abc123def456..."
          signature="sig_abc123..."
          signerIdentity="Node Security System"
          proofId="proof_sec_001"
          executedBy="Security Center"
          showDetails={true}
          size="md"
        />
      </div>

      {/* Security Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Security Actions
          </CardTitle>
          <CardDescription>
            Manage your node's security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => goTo('/trust-center')}
            >
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="font-medium">View Trust Center</span>
              </div>
              <span className="text-sm text-gray-400">
                Detailed cryptographic proofs and verification
              </span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
            >
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span className="font-medium">Export Certificates</span>
              </div>
              <span className="text-sm text-gray-400">
                Download TLS certificates and macaroons
              </span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span className="font-medium">Rotate Macaroons</span>
              </div>
              <span className="text-sm text-gray-400">
                Generate new API authentication tokens
              </span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
            >
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="font-medium">Change Wallet Password</span>
              </div>
              <span className="text-sm text-gray-400">
                Update wallet encryption password
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 