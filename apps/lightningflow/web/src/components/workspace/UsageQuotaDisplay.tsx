'use client'
import { apiPath } from '@/lib/base-path';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Zap, TrendingUp, RefreshCw } from 'lucide-react'
import { useWorkspace } from '@/lib/workspace-context'

interface UsageStats {
  workspaceId: string
  usedTokens: number
  limit: number
  remaining: number
  isWithinQuota: boolean
  lastReset: string
  percentUsed: number
}

export function UsageQuotaDisplay() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const { currentWorkspace } = useWorkspace()

  const fetchUsageStats = async () => {
    try {
      const response = await fetch(apiPath('/api/quota/check'))
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const refreshStats = async () => {
    setIsRefreshing(true)
    await fetchUsageStats()
  }

  useEffect(() => {
    if (currentWorkspace) {
      fetchUsageStats()
    }
  }, [currentWorkspace])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-2 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Unable to load usage statistics</p>
        </CardContent>
      </Card>
    )
  }

  const getUsageColor = (percent: number) => {
    if (percent >= 90) return 'text-red-600'
    if (percent >= 75) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500'
    if (percent >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Usage Quota
            </CardTitle>
            <CardDescription>
              AI token usage for {currentWorkspace?.name}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStats}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Usage Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Tokens Used</span>
            <span className={getUsageColor(stats.percentUsed)}>
              {formatNumber(stats.usedTokens)} / {formatNumber(stats.limit)}
            </span>
          </div>
          <Progress 
            value={stats.percentUsed} 
            className="h-2"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{stats.percentUsed}% used</span>
            <span>{formatNumber(stats.remaining)} remaining</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {stats.isWithinQuota ? (
            <Badge variant="secondary" className="text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Within Quota
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Quota Exceeded
            </Badge>
          )}
        </div>

        {/* Warning Messages */}
        {stats.percentUsed >= 90 && stats.isWithinQuota && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Approaching Limit</span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              You've used {stats.percentUsed}% of your quota. Consider upgrading your plan.
            </p>
          </div>
        )}

        {!stats.isWithinQuota && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Quota Exceeded</span>
            </div>
            <p className="text-xs text-red-700 mt-1">
              You've exceeded your usage limit. Upgrade your plan to continue using AI features.
            </p>
          </div>
        )}

        {/* Reset Information */}
        <div className="text-xs text-muted-foreground">
          Last reset: {new Date(stats.lastReset).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  )
} 