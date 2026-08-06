import { apiPath } from '@/lib/base-path';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

interface NodeStatus {
  status: 'online' | 'syncing' | 'offline' | 'error'
  type: 'lnd' | 'cln' | 'unknown'
  peers: number
  channels: number
  syncProgress: number
  blockHeight: number
  lastUpdate: Date
  version: string
  alias: string
  balance: {
    confirmed: number
    unconfirmed: number
    total: number
  }
  network: 'mainnet' | 'testnet' | 'regtest'
  uptime: number
  errors: string[]
}

interface NodeStatusResponse {
  success: boolean
  data: NodeStatus
  timestamp: string
  error?: string
}

interface UseNodeStatusOptions {
  refreshInterval?: number
  retryAttempts?: number
  retryDelay?: number
}

interface UseNodeStatusReturn {
  nodeStatus: NodeStatus | null
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
  refresh: () => Promise<void>
  isConnected: boolean
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline'
}

export function useNodeStatus(options: UseNodeStatusOptions = {}): UseNodeStatusReturn {
  const {
    refreshInterval = 10000, // 10 seconds
    retryAttempts = 3,
    retryDelay = 2000
  } = options

  const [nodeStatus, setNodeStatus] = useState<NodeStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  // Use refs to avoid dependency issues
  const retryCountRef = useRef(0)
  const isLoadingRef = useRef(true)

  const fetchNodeStatus = useCallback(async (isRetry = false): Promise<void> => {
    try {
      // Only show loading on initial fetch or manual refresh, not on background polls
      if (!isRetry && !nodeStatus) {
        setIsLoading(true)
        isLoadingRef.current = true
      }
      
      const response = await fetch(apiPath('/api/node/status-check'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add cache busting to ensure fresh data
        cache: 'no-cache'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result: NodeStatusResponse = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch node status')
      }

      // Convert lastUpdate string back to Date
      const statusWithDate = {
        ...result.data,
        lastUpdate: new Date(result.data.lastUpdate)
      }

      setNodeStatus(statusWithDate)
      setError(null)
      retryCountRef.current = 0
      setLastUpdated(new Date())
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Node status fetch failed:', errorMessage)
      
      // Implement exponential backoff for retries
      if (retryCountRef.current < retryAttempts) {
        const delay = retryDelay * Math.pow(2, retryCountRef.current)
        retryCountRef.current += 1
        
        setTimeout(() => {
          fetchNodeStatus(true)
        }, delay)
      } else {
        setError(errorMessage)
        // Set offline status if we can't reach the API
        setNodeStatus(prev => prev ? {
          ...prev,
          status: 'offline',
          lastUpdate: new Date(),
          errors: [errorMessage]
        } : null)
      }
    } finally {
      // Only update loading state if this was the initial fetch
      if (!isRetry && !nodeStatus) {
        setIsLoading(false)
        isLoadingRef.current = false
      }
    }
  }, [retryAttempts, retryDelay, nodeStatus])

  // Manual refresh function
  const refresh = useCallback(async (): Promise<void> => {
    retryCountRef.current = 0
    setIsLoading(true)
    isLoadingRef.current = true
    await fetchNodeStatus()
    setIsLoading(false)
    isLoadingRef.current = false
  }, [fetchNodeStatus])

  // Calculate connection quality based on node status and metrics - memoized to prevent flickering
  const connectionQuality = useMemo((): 'excellent' | 'good' | 'poor' | 'offline' => {
    if (!nodeStatus || nodeStatus.status === 'offline') return 'offline'
    if (nodeStatus.status === 'error') return 'offline'
    if (nodeStatus.status === 'syncing') return 'poor'
    
    // Base quality on peers and channels
    const peerScore = Math.min(nodeStatus.peers / 10, 1) // 10+ peers = excellent
    const channelScore = Math.min(nodeStatus.channels / 20, 1) // 20+ channels = excellent
    const avgScore = (peerScore + channelScore) / 2
    
    if (avgScore >= 0.8) return 'excellent'
    if (avgScore >= 0.6) return 'good'
    return 'poor'
  }, [nodeStatus])

  // Determine if node is considered "connected" - also memoized
  const isConnected = useMemo(() => 
    nodeStatus?.status === 'online' || nodeStatus?.status === 'syncing',
    [nodeStatus?.status]
  )

  // Set up polling interval - simplified to avoid dependency issues
  useEffect(() => {
    // Initial fetch
    fetchNodeStatus()

    // Set up interval for regular updates
    const interval = setInterval(() => {
      // Only poll if we're not currently loading
      if (!isLoadingRef.current) {
        fetchNodeStatus(true) // Mark as background poll
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, []) // Empty dependency array to prevent re-creation

  // Handle page visibility changes (pause polling when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isLoadingRef.current) {
        // Refresh immediately when tab becomes visible
        fetchNodeStatus(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (!isLoadingRef.current) {
        fetchNodeStatus(true)
      }
    }

    const handleOffline = () => {
      setError('Network connection lost')
      setNodeStatus(prev => prev ? {
        ...prev,
        status: 'offline',
        errors: ['Network connection lost']
      } : null)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    nodeStatus,
    isLoading,
    error,
    lastUpdated,
    refresh,
    isConnected,
    connectionQuality
  }
} 