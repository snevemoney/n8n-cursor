/**
 * Lightning AI Node Platform - Trust Tile Component
 * 
 * Displays cryptographic proof verification status with Apple-style design
 */

'use client'

import React from 'react'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { CheckCircle, Clock, XCircle, TestTube, Shield } from 'lucide-react'
import { cn } from '../lib/utils'

export type TrustStatus = 'confirmed' | 'pending' | 'failed' | 'testing'

export interface TrustTileProps {
  title: string
  description?: string
  status: TrustStatus
  timestamp?: string
  signature?: string
  className?: string
  onClick?: () => void
}

const statusConfig = {
  confirmed: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    badge: 'Verified',
    badgeVariant: 'default' as const
  },
  pending: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    badge: 'Pending',
    badgeVariant: 'secondary' as const
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badge: 'Failed',
    badgeVariant: 'destructive' as const
  },
  testing: {
    icon: TestTube,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badge: 'Testing',
    badgeVariant: 'outline' as const
  }
}

export function TrustTile({
  title,
  description,
  status,
  timestamp,
  signature,
  className,
  onClick
}: TrustTileProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Card 
      className={cn(
        'transition-all duration-200 hover:shadow-md cursor-pointer',
        config.borderColor,
        config.bgColor,
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={cn('p-2 rounded-full', config.bgColor)}>
              <Icon className={cn('h-4 w-4', config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {title}
                </h3>
                <Badge variant={config.badgeVariant} className="text-xs">
                  {config.badge}
                </Badge>
              </div>
              {description && (
                <p className="text-xs text-gray-600 mt-1">
                  {description}
                </p>
              )}
              {timestamp && (
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(timestamp).toLocaleString()}
                </p>
              )}
              {signature && (
                <div className="mt-2">
                  <div className="flex items-center space-x-1">
                    <Shield className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Signature:</span>
                  </div>
                  <code className="text-xs text-gray-600 font-mono break-all">
                    {signature.length > 32 ? `${signature.slice(0, 32)}...` : signature}
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TrustTile 