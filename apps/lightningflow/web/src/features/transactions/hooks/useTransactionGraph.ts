import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  generateRandomSimulation, 
  logTransactionSpeed, 
  getAvailableNodes,
  type TransactionSimulation,
  type SimulationNode 
} from '../simulate-transaction'

export interface TransactionGraphNode {
  id: string
  alias: string
  capacity: number
  channels: number
  lat?: number
  lng?: number
  isOnline: boolean
  color: string
  size: number
  transactions: number
  avgSpeed: number
  lastSeen: Date
}

export interface TransactionGraphEdge {
  id: string
  source: string
  target: string
  weight: number
  transactions: number
  avgSpeed: number
  totalAmount: number
  color: string
  animated: boolean
}

export interface GraphMetrics {
  totalNodes: number
  onlineNodes: number
  totalTransactions: number
  avgSpeed: number
  networkCapacity: number
  successRate: number
}

export interface UseTransactionGraphOptions {
  autoUpdate?: boolean
  updateInterval?: number
  maxTransactions?: number
  enableSimulation?: boolean
  simulationInterval?: number
}

export interface TransactionGraphState {
  nodes: TransactionGraphNode[]
  edges: TransactionGraphEdge[]
  transactions: TransactionSimulation[]
  metrics: GraphMetrics
  isLoading: boolean
  error: string | null
  lastUpdate: Date | null
}

export function useTransactionGraph(options: UseTransactionGraphOptions = {}) {
  const {
    autoUpdate = true,
    updateInterval = 5000,
    maxTransactions = 100,
    enableSimulation = true,
    simulationInterval = 3000
  } = options

  const [state, setState] = useState<TransactionGraphState>({
    nodes: [],
    edges: [],
    transactions: [],
    metrics: {
      totalNodes: 0,
      onlineNodes: 0,
      totalTransactions: 0,
      avgSpeed: 0,
      networkCapacity: 0,
      successRate: 0
    },
    isLoading: true,
    error: null,
    lastUpdate: null
  })

  // Initialize graph data
  const initializeGraph = useCallback(() => {
    try {
      const simulationNodes = getAvailableNodes()
      const graphNodes: TransactionGraphNode[] = simulationNodes.map(node => ({
        id: node.id,
        alias: node.alias,
        capacity: node.capacity,
        channels: node.channels,
        lat: node.lat,
        lng: node.lng,
        isOnline: node.isOnline,
        color: getNodeColor(node.capacity),
        size: getNodeSize(node.capacity, simulationNodes),
        transactions: 0,
        avgSpeed: 0,
        lastSeen: new Date()
      }))

      setState(prev => ({
        ...prev,
        nodes: graphNodes,
        edges: [],
        isLoading: false,
        lastUpdate: new Date()
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize graph',
        isLoading: false
      }))
    }
  }, [])

  // Add a new transaction to the graph
  const addTransaction = useCallback((simulation: TransactionSimulation) => {
    setState(prev => {
      const updatedTransactions = [simulation, ...prev.transactions].slice(0, maxTransactions)
      
      // Update nodes with transaction data
      const updatedNodes = prev.nodes.map(node => {
        if (node.id === simulation.fromNode.id || node.id === simulation.toNode.id) {
          const nodeTransactions = updatedTransactions.filter(
            tx => tx.fromNode.id === node.id || tx.toNode.id === node.id
          )
          const speeds = nodeTransactions
            .filter(tx => tx.success && tx.actualTime)
            .map(tx => tx.actualTime!)
          
          return {
            ...node,
            transactions: nodeTransactions.length,
            avgSpeed: speeds.length > 0 ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length) : 0,
            lastSeen: new Date()
          }
        }
        return node
      })

      // Update or create edge
      const edgeId = `${simulation.fromNode.id}-${simulation.toNode.id}`
      const existingEdgeIndex = prev.edges.findIndex(edge => 
        edge.id === edgeId || edge.id === `${simulation.toNode.id}-${simulation.fromNode.id}`
      )

      let updatedEdges = [...prev.edges]
      
      if (existingEdgeIndex >= 0) {
        // Update existing edge
        const existingEdge = updatedEdges[existingEdgeIndex]
        const edgeTransactions = updatedTransactions.filter(tx =>
          (tx.fromNode.id === simulation.fromNode.id && tx.toNode.id === simulation.toNode.id) ||
          (tx.fromNode.id === simulation.toNode.id && tx.toNode.id === simulation.fromNode.id)
        )
        
        const edgeSpeeds = edgeTransactions
          .filter(tx => tx.success && tx.actualTime)
          .map(tx => tx.actualTime!)
        
        updatedEdges[existingEdgeIndex] = {
          ...existingEdge,
          weight: edgeTransactions.length,
          transactions: edgeTransactions.length,
          avgSpeed: edgeSpeeds.length > 0 ? Math.round(edgeSpeeds.reduce((a, b) => a + b, 0) / edgeSpeeds.length) : 0,
          totalAmount: edgeTransactions.reduce((sum, tx) => sum + tx.amount, 0),
          color: getEdgeColor(edgeSpeeds.length > 0 ? edgeSpeeds.reduce((a, b) => a + b, 0) / edgeSpeeds.length : 0),
          animated: simulation.success
        }
      } else {
        // Create new edge
        updatedEdges.push({
          id: edgeId,
          source: simulation.fromNode.id,
          target: simulation.toNode.id,
          weight: 1,
          transactions: 1,
          avgSpeed: simulation.actualTime || 0,
          totalAmount: simulation.amount,
          color: getEdgeColor(simulation.actualTime || 0),
          animated: simulation.success
        })
      }

      return {
        ...prev,
        nodes: updatedNodes,
        edges: updatedEdges,
        transactions: updatedTransactions,
        lastUpdate: new Date()
      }
    })
  }, [maxTransactions])

  // Calculate metrics
  const calculateMetrics = useCallback((
    nodes: TransactionGraphNode[], 
    transactions: TransactionSimulation[]
  ): GraphMetrics => {
    const successfulTransactions = transactions.filter(tx => tx.success && tx.actualTime)
    const speeds = successfulTransactions.map(tx => tx.actualTime!)
    
    return {
      totalNodes: nodes.length,
      onlineNodes: nodes.filter(n => n.isOnline).length,
      totalTransactions: transactions.length,
      avgSpeed: speeds.length > 0 ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length) : 0,
      networkCapacity: nodes.reduce((sum, node) => sum + node.capacity, 0),
      successRate: transactions.length > 0 ? (successfulTransactions.length / transactions.length) * 100 : 100
    }
  }, [])

  // Update metrics when data changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      metrics: calculateMetrics(prev.nodes, prev.transactions)
    }))
  }, [state.nodes, state.transactions, calculateMetrics])

  // Auto-update simulation
  useEffect(() => {
    if (!enableSimulation || !autoUpdate) return

    const interval = setInterval(async () => {
      try {
        const simulation = generateRandomSimulation()
        await logTransactionSpeed(simulation)
        addTransaction(simulation)
      } catch (error) {
        console.error('Simulation error:', error)
      }
    }, simulationInterval)

    return () => clearInterval(interval)
  }, [enableSimulation, autoUpdate, simulationInterval, addTransaction])

  // Initialize on mount
  useEffect(() => {
    initializeGraph()
  }, [initializeGraph])

  // Manual refresh
  const refresh = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }))
    initializeGraph()
  }, [initializeGraph])

  // Simulate transaction manually
  const simulateTransaction = useCallback(async () => {
    try {
      const simulation = generateRandomSimulation()
      await logTransactionSpeed(simulation)
      addTransaction(simulation)
      return simulation
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Simulation failed'
      }))
      throw error
    }
  }, [addTransaction])

  // Filter functions
  const getNodesByCapacity = useCallback((minCapacity: number) => {
    return state.nodes.filter(node => node.capacity >= minCapacity)
  }, [state.nodes])

  const getTransactionsBySpeed = useCallback((maxSpeed: number) => {
    return state.transactions.filter(tx => tx.actualTime && tx.actualTime <= maxSpeed)
  }, [state.transactions])

  const getTransactionsByTimeRange = useCallback((startTime: Date, endTime: Date) => {
    return state.transactions.filter(tx => 
      tx.timestamp >= startTime && tx.timestamp <= endTime
    )
  }, [state.transactions])

  // Memoized derived data
  const fastestTransaction = useMemo(() => {
    const successful = state.transactions.filter(tx => tx.success && tx.actualTime)
    return successful.reduce((fastest, tx) => 
      !fastest || (tx.actualTime! < fastest.actualTime!) ? tx : fastest
    , null as TransactionSimulation | null)
  }, [state.transactions])

  const slowestTransaction = useMemo(() => {
    const successful = state.transactions.filter(tx => tx.success && tx.actualTime)
    return successful.reduce((slowest, tx) => 
      !slowest || (tx.actualTime! > slowest.actualTime!) ? tx : slowest
    , null as TransactionSimulation | null)
  }, [state.transactions])

  const topNodes = useMemo(() => {
    return [...state.nodes]
      .sort((a, b) => b.transactions - a.transactions)
      .slice(0, 5)
  }, [state.nodes])

  return {
    // State
    ...state,
    
    // Actions
    refresh,
    simulateTransaction,
    addTransaction,
    
    // Filters
    getNodesByCapacity,
    getTransactionsBySpeed,
    getTransactionsByTimeRange,
    
    // Derived data
    fastestTransaction,
    slowestTransaction,
    topNodes,
    
    // Utilities
    isConnected: state.nodes.length > 0 && !state.error,
    hasTransactions: state.transactions.length > 0
  }
}

// Helper functions
function getNodeColor(capacity: number): string {
  if (capacity >= 100000000) return '#10b981' // green for high capacity
  if (capacity >= 50000000) return '#3b82f6'  // blue for medium capacity
  if (capacity >= 25000000) return '#f59e0b'  // yellow for low capacity
  return '#ef4444' // red for very low capacity
}

function getNodeSize(capacity: number, allNodes: SimulationNode[]): number {
  const maxCapacity = Math.max(...allNodes.map(n => n.capacity))
  const minSize = 0.5
  const maxSize = 2.0
  return minSize + (capacity / maxCapacity) * (maxSize - minSize)
}

function getEdgeColor(avgSpeed: number): string {
  if (avgSpeed <= 100) return '#10b981'  // green for fast
  if (avgSpeed <= 300) return '#f59e0b'  // yellow for medium
  if (avgSpeed <= 500) return '#f97316'  // orange for slow
  return '#ef4444' // red for very slow
} 