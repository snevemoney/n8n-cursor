'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Zap, 
  Database, 
  Wifi, 
  HardDrive,
  MemoryStick,
  Shield,
  Activity,
  Clock
} from 'lucide-react'
import { systemCheckRunner, SystemHealthSummary, SystemCheckResult } from '../lib/system-check/runner'
import { systemFixManager, FixResult } from '../lib/system-check/fix'
import { cn } from '../lib/utils'

interface SystemHealthCardProps {
  className?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function SystemHealthCard({ 
  className, 
  autoRefresh = true, 
  refreshInterval = 60000 
}: SystemHealthCardProps) {
  const [healthSummary, setHealthSummary] = useState<SystemHealthSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFixing, setIsFixing] = useState<string | null>(null)
  const [lastFixResults, setLastFixResults] = useState<FixResult[]>([])

  // Load initial health data
  useEffect(() => {
    loadHealthData()
  }, [])

  // Auto-refresh health data
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadHealthData()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  const loadHealthData = async () => {
    try {
      setIsLoading(true)
      const summary = await systemCheckRunner.runAllChecks()
      setHealthSummary(summary)
    } catch (error) {
      console.error('Failed to load health data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFixIssue = async (issue: SystemCheckResult) => {
    try {
      setIsFixing(issue.id)
      const fixResult = await systemFixManager.attemptFix(issue, true)
      
      setLastFixResults(prev => [fixResult, ...prev.slice(0, 4)]) // Keep last 5 results
      
      // Refresh health data after fix attempt
      setTimeout(() => {
        loadHealthData()
      }, 2000)
    } catch (error) {
      console.error('Fix attempt failed:', error)
    } finally {
      setIsFixing(null)
    }
  }

  const getStatusIcon = (status: SystemCheckResult['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: SystemCheckResult['status']) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getCheckIcon = (checkId: string) => {
    switch (checkId) {
      case 'lightning_sync':
        return <Zap className="h-4 w-4" />
      case 'database_connection':
        return <Database className="h-4 w-4" />
      case 'network_connectivity':
        return <Wifi className="h-4 w-4" />
      case 'storage_space':
        return <HardDrive className="h-4 w-4" />
      case 'memory_usage':
        return <MemoryStick className="h-4 w-4" />
      case 'backup_status':
        return <Shield className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const getOverallHealthColor = (status: SystemHealthSummary['overall_status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getHealthProgress = (summary: SystemHealthSummary) => {
    const total = summary.checks_passed + summary.checks_warning + summary.checks_failed
    if (total === 0) return 0
    return Math.round((summary.checks_passed / total) * 100)
  }

  if (isLoading && !healthSummary) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
          <CardDescription>Loading system health status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!healthSummary) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            System Health
          </CardTitle>
          <CardDescription>Failed to load system health data</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadHealthData} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const criticalIssues = healthSummary.results.filter(r => r.status === 'critical')
  const warningIssues = healthSummary.results.filter(r => r.status === 'warning')
  const healthProgress = getHealthProgress(healthSummary)

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
              {getStatusBadge(healthSummary.overall_status)}
            </CardTitle>
            <CardDescription>
              Node uptime: {formatUptime(healthSummary.uptime_seconds / 1000)} • 
              Last check: {healthSummary.last_check.toLocaleTimeString()}
            </CardDescription>
          </div>
          <Button 
            onClick={loadHealthData} 
            variant="ghost" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Health Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Health</span>
            <span className={getOverallHealthColor(healthSummary.overall_status)}>
              {healthProgress}%
            </span>
          </div>
          <Progress value={healthProgress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{healthSummary.checks_passed} healthy</span>
            <span>{healthSummary.checks_warning} warnings</span>
            <span>{healthSummary.checks_failed} critical</span>
          </div>
        </div>

        {/* Critical Issues */}
        {criticalIssues.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-red-600 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Critical Issues ({criticalIssues.length})
            </h4>
            {criticalIssues.map((issue) => (
              <div key={issue.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  {getCheckIcon(issue.id)}
                  <div>
                    <div className="font-medium text-sm">{issue.name}</div>
                    <div className="text-xs text-gray-600">{issue.message}</div>
                  </div>
                </div>
                {issue.auto_fixable && (
                  <Button
                    onClick={() => handleFixIssue(issue)}
                    disabled={isFixing === issue.id}
                    size="sm"
                    variant="destructive"
                  >
                    {isFixing === issue.id ? (
                      <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      'Fix Now'
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Warning Issues */}
        {warningIssues.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-yellow-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Warnings ({warningIssues.length})
            </h4>
            {warningIssues.map((issue) => (
              <div key={issue.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  {getCheckIcon(issue.id)}
                  <div>
                    <div className="font-medium text-sm">{issue.name}</div>
                    <div className="text-xs text-gray-600">{issue.message}</div>
                  </div>
                </div>
                {issue.auto_fixable && (
                  <Button
                    onClick={() => handleFixIssue(issue)}
                    disabled={isFixing === issue.id}
                    size="sm"
                    variant="outline"
                  >
                    {isFixing === issue.id ? (
                      <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      'Fix'
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Recent Fix Results */}
        {lastFixResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Fixes
            </h4>
            {lastFixResults.slice(0, 3).map((fix) => (
              <div key={fix.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                <span>{fix.fix_message}</span>
                <div className="flex items-center gap-2">
                  {fix.fix_successful ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-gray-500">
                    {fix.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All Systems Healthy */}
        {healthSummary.overall_status === 'healthy' && (
          <div className="text-center py-4">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-sm font-medium text-green-600">All Systems Healthy</div>
            <div className="text-xs text-gray-500">
              {healthSummary.checks_passed} checks passed successfully
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 