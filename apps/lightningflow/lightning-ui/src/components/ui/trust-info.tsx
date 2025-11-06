"use client"

import { useState } from "react"
import { Badge } from "./badge"
import { Button } from "./button"
import { Card, CardContent } from "./card"
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  Clock, 
  Hash, 
  Download, 
  Eye,
  Copy,
  Check
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "../../lib/utils"

export interface TrustInfoProps {
  verified: boolean
  timestamp?: number
  hash?: string
  signature?: string
  signerIdentity?: string
  proofId?: string
  executedBy?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  onExportProof?: () => void
}

export function TrustInfo({
  verified,
  timestamp,
  hash,
  signature,
  signerIdentity,
  proofId,
  executedBy,
  className,
  size = 'md',
  showDetails = false,
  onExportProof
}: TrustInfoProps) {
  const [showFullDetails, setShowFullDetails] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      toast.success(`${type} copied to clipboard`)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      toast.error(`Failed to copy ${type}`)
    }
  }

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleString()
  }

  const truncateHash = (hashStr: string, length: number = 8) => {
    return `${hashStr.slice(0, length)}...${hashStr.slice(-length)}`
  }

  const getTrustLevel = () => {
    if (verified && hash && signature) return 'high'
    if (verified) return 'medium'
    return 'low'
  }

  const trustLevel = getTrustLevel()

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  if (size === 'sm' && !showDetails) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {verified ? (
          <ShieldCheck className={cn("text-green-500", iconSize[size])} />
        ) : (
          <ShieldX className={cn("text-gray-400", iconSize[size])} />
        )}
        <Badge 
          variant={verified ? "default" : "secondary"}
          className={cn(
            "text-xs px-1.5 py-0.5",
            verified ? "bg-green-900/30 text-green-400 border-green-700/50" : "bg-gray-800/50 text-gray-400"
          )}
        >
          {verified ? "Signed" : "Unsigned"}
        </Badge>
        {executedBy && (
          <span className="text-xs text-gray-500">by {executedBy}</span>
        )}
      </div>
    )
  }

  return (
    <Card className={cn("border-gray-800 bg-gray-900/50", className)}>
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Trust Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {verified ? (
                <ShieldCheck className={cn("text-green-500", iconSize[size])} />
              ) : (
                <ShieldX className={cn("text-gray-400", iconSize[size])} />
              )}
              <Badge 
                variant={verified ? "default" : "secondary"}
                className={cn(
                  verified ? "bg-green-900/30 text-green-400 border-green-700/50" : "bg-gray-800/50 text-gray-400"
                )}
              >
                {verified ? "Cryptographically Signed" : "Unsigned Action"}
              </Badge>
              {trustLevel === 'high' && (
                <Badge variant="outline" className="bg-blue-900/30 text-blue-400 border-blue-700/50 text-xs">
                  High Trust
                </Badge>
              )}
            </div>
            
            {showDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullDetails(!showFullDetails)}
                className="h-6 px-2"
              >
                <Eye className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {timestamp && (
              <div className="flex items-center gap-1 text-gray-400">
                <Clock className="h-3 w-3" />
                <span>{formatTimestamp(timestamp)}</span>
              </div>
            )}
            
            {executedBy && (
              <div className="text-gray-400">
                <span className="text-gray-500">Executed by:</span> {executedBy}
              </div>
            )}
            
            {signerIdentity && (
              <div className="text-gray-400">
                <span className="text-gray-500">Signer:</span> {signerIdentity}
              </div>
            )}
            
            {proofId && (
              <div className="text-gray-400">
                <span className="text-gray-500">Proof ID:</span> {truncateHash(proofId, 6)}
              </div>
            )}
          </div>

          {/* Hash Display */}
          {hash && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-gray-500">
                  <Hash className="h-3 w-3" />
                  <span className="text-xs">Hash:</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(hash, 'Hash')}
                  className="h-5 px-1"
                >
                  {copied === 'Hash' ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <div className="font-mono text-xs text-gray-300 bg-gray-800/50 p-1 rounded border">
                {showFullDetails ? hash : truncateHash(hash)}
              </div>
            </div>
          )}

          {/* Signature Display (only when showing full details) */}
          {signature && showFullDetails && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Signature:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(signature, 'Signature')}
                  className="h-5 px-1"
                >
                  {copied === 'Signature' ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <div className="font-mono text-xs text-gray-300 bg-gray-800/50 p-1 rounded border max-h-20 overflow-y-auto">
                {signature}
              </div>
            </div>
          )}

          {/* Actions */}
          {onExportProof && (
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={onExportProof}
                className="h-6 px-2 text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Export Proof
              </Button>
            </div>
          )}

          {/* Trust Explanation */}
          {!verified && (
            <div className="text-xs text-amber-400 bg-amber-900/20 p-2 rounded border border-amber-700/30">
              ⚠️ This action was not cryptographically signed. Consider enabling signing for enhanced security.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for inline use
export function TrustBadge({ 
  verified, 
  executedBy, 
  className 
}: { 
  verified: boolean
  executedBy?: string
  className?: string 
}) {
  return (
    <TrustInfo
      verified={verified}
      executedBy={executedBy}
      size="sm"
      className={className}
    />
  )
} 