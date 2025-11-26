"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Zap, 
  Wifi, 
  Users, 
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'
import { useNodeStatus } from '@/hooks/useNodeStatus'

interface LiveNodePulseProps {
  className?: string
}

export function LiveNodePulse({ className }: LiveNodePulseProps) {
  const { 
    nodeStatus, 
    isLoading, 
    error, 
    lastUpdated, 
    refresh, 
    isConnected, 
    connectionQuality 
  } = useNodeStatus({
    refreshInterval: 10000, // 10 seconds
    retryAttempts: 3
  })

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'online':
        return {
          color: 'bg-green-500',
          icon: CheckCircle,
          label: 'Online',
          pulse: 'animate-pulse',
          description: 'Your node is healthy and routing'
        }
      case 'syncing':
        return {
          color: 'bg-yellow-500',
          icon: Activity,
          label: 'Syncing',
          pulse: 'animate-bounce',
          description: 'Synchronizing with the network'
        }
      case 'offline':
        return {
          color: 'bg-gray-500',
          icon: XCircle,
          label: 'Offline',
          pulse: '',
          description: 'Node is not responding'
        }
      case 'error':
        return {
          color: 'bg-red-500',
          icon: AlertCircle,
          label: 'Error',
          pulse: 'animate-pulse',
          description: 'Node requires attention'
        }
      default:
        return {
          color: 'bg-gray-400',
          icon: XCircle,
          label: 'Unknown',
          pulse: '',
          description: 'Checking node status...'
        }
    }
  }

  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500'
      case 'good': return 'text-blue-500'
      case 'poor': return 'text-yellow-500'
      case 'offline': return 'text-gray-500'
      default: return 'text-gray-400'
    }
  }

  const statusConfig = getStatusConfig(nodeStatus?.status || 'unknown')
  const StatusIcon = statusConfig.icon

  // Show loading state
  if (isLoading && !nodeStatus) {
    return (
      <Card className={`relative overflow-hidden ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <motion.div
              className="w-4 h-4 rounded-full bg-gray-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <div>
              <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-16 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {/* Background gradient animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-yellow-500/5"
        animate={{
          opacity: nodeStatus?.status === 'online' ? [0.3, 0.6, 0.3] : 0.3
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <CardContent className="p-6 relative z-10">
        {/* Header with node status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {/* Animated status indicator */}
            <motion.div
              className={`w-4 h-4 rounded-full ${statusConfig.color} ${statusConfig.pulse}`}
              animate={nodeStatus?.status === 'online' ? {
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1]
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <div>
              <h3 className="font-semibold text-lg">
                {nodeStatus?.alias || 'Lightning Node'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {error || statusConfig.description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant={nodeStatus?.status === 'online' ? 'default' : 'secondary'}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Node metrics grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Peers */}
          <motion.div
            className="flex items-center space-x-2 p-3 rounded-lg bg-muted/50"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Users className={`w-4 h-4 ${getConnectionQualityColor(connectionQuality)}`} />
            <div>
              <p className="text-sm font-medium">{nodeStatus?.peers || 0}</p>
              <p className="text-xs text-muted-foreground">Peers</p>
            </div>
          </motion.div>

          {/* Channels */}
          <motion.div
            className="flex items-center space-x-2 p-3 rounded-lg bg-muted/50"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Zap className="w-4 h-4 text-yellow-500" />
            <div>
              <p className="text-sm font-medium">{nodeStatus?.channels || 0}</p>
              <p className="text-xs text-muted-foreground">Channels</p>
            </div>
          </motion.div>
        </div>

        {/* Sync progress */}
        <AnimatePresence>
          {nodeStatus?.status === 'syncing' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Sync Progress</span>
                <span className="text-sm text-muted-foreground">
                  {nodeStatus.syncProgress.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={nodeStatus.syncProgress} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Block {nodeStatus.blockHeight.toLocaleString()}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Node info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Wifi className="w-3 h-3" />
            <span>
              {nodeStatus?.type?.toUpperCase() || 'UNKNOWN'} 
              {nodeStatus?.version && ` v${nodeStatus.version}`}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`capitalize ${getConnectionQualityColor(connectionQuality)}`}>
              {connectionQuality}
            </span>
            <span>•</span>
            <span>
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Never updated'}
            </span>
          </div>
        </div>

        {/* Lightning bolt animation overlay */}
        <AnimatePresence>
          {nodeStatus?.status === 'online' && (
            <motion.div
              className="absolute top-4 right-4"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.8, 1.2, 0.8],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
            >
              <Zap className="w-6 h-6 text-yellow-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
} 