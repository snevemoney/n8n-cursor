import { createClient } from '@supabase/supabase-js'

// Types for transaction simulation
export interface SimulationNode {
  id: string
  alias: string
  publicKey: string
  capacity: number
  channels: number
  lat?: number
  lng?: number
  isOnline: boolean
  fees: {
    baseFee: number
    feeRate: number
  }
}

export interface SimulationRoute {
  nodes: SimulationNode[]
  totalFees: number
  totalDelay: number
  hops: number
  probability: number
}

export interface TransactionSimulation {
  id: string
  fromNode: SimulationNode
  toNode: SimulationNode
  amount: number
  routes: SimulationRoute[]
  selectedRoute: SimulationRoute
  estimatedTime: number
  actualTime?: number
  success: boolean
  timestamp: Date
}

export interface TransactionSpeedRecord {
  id?: string
  node_id: string
  node_alias: string
  milliseconds: number
  hops: number
  amount: number
  inbound: boolean
  outbound: boolean
  completed_at: string
  route_nodes: string[]
  fees_paid: number
  success: boolean
}

// Mock Lightning Network topology
const mockNodes: SimulationNode[] = [
  {
    id: 'lightning_labs',
    alias: 'Lightning Labs',
    publicKey: '03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f',
    capacity: 50000000,
    channels: 150,
    lat: 37.7749,
    lng: -122.4194,
    isOnline: true,
    fees: { baseFee: 1, feeRate: 0.000001 }
  },
  {
    id: 'acinq',
    alias: 'ACINQ',
    publicKey: '03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f',
    capacity: 75000000,
    channels: 200,
    lat: 48.8566,
    lng: 2.3522,
    isOnline: true,
    fees: { baseFee: 1, feeRate: 0.000001 }
  },
  {
    id: 'blockstream',
    alias: 'Blockstream',
    publicKey: '03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f',
    capacity: 100000000,
    channels: 300,
    lat: 51.5074,
    lng: -0.1278,
    isOnline: true,
    fees: { baseFee: 2, feeRate: 0.000002 }
  },
  {
    id: 'casa_node',
    alias: 'Casa Node',
    publicKey: '03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f',
    capacity: 25000000,
    channels: 80,
    lat: 40.7128,
    lng: -74.0060,
    isOnline: true,
    fees: { baseFee: 1, feeRate: 0.000001 }
  },
  {
    id: 'tokyo_lightning',
    alias: 'Tokyo Lightning',
    publicKey: '03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f',
    capacity: 60000000,
    channels: 120,
    lat: 35.6762,
    lng: 139.6503,
    isOnline: true,
    fees: { baseFee: 1, feeRate: 0.000001 }
  },
  {
    id: 'berlin_node',
    alias: 'Berlin Node',
    publicKey: '03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f',
    capacity: 40000000,
    channels: 90,
    lat: 52.5200,
    lng: 13.4050,
    isOnline: true,
    fees: { baseFee: 1, feeRate: 0.000001 }
  }
]

// Initialize Supabase client (optional - for real database integration)
let supabase: any = null

export function initializeSupabase(supabaseUrl: string, supabaseKey: string) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

// Calculate geographic distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Find possible routes between two nodes
export function findRoutes(fromNodeId: string, toNodeId: string, maxHops: number = 6): SimulationRoute[] {
  const fromNode = mockNodes.find(n => n.id === fromNodeId)
  const toNode = mockNodes.find(n => n.id === toNodeId)
  
  if (!fromNode || !toNode) {
    throw new Error('Node not found')
  }

  const routes: SimulationRoute[] = []
  
  // Generate multiple possible routes
  for (let i = 0; i < 3; i++) {
    const hops = Math.min(Math.floor(Math.random() * maxHops) + 1, mockNodes.length - 1)
    const routeNodes: SimulationNode[] = [fromNode]
    
    // Add intermediate nodes
    const availableNodes = mockNodes.filter(n => n.id !== fromNodeId && n.id !== toNodeId && n.isOnline)
    for (let j = 0; j < hops - 1; j++) {
      if (availableNodes.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableNodes.length)
        const intermediateNode = availableNodes.splice(randomIndex, 1)[0]
        routeNodes.push(intermediateNode)
      }
    }
    
    routeNodes.push(toNode)
    
    // Calculate route metrics
    let totalFees = 0
    let totalDelay = 0
    
    for (let j = 0; j < routeNodes.length - 1; j++) {
      const currentNode = routeNodes[j]
      const nextNode = routeNodes[j + 1]
      
      // Calculate fees
      totalFees += currentNode.fees.baseFee
      
      // Calculate delay based on distance and node capacity
      if (currentNode.lat && currentNode.lng && nextNode.lat && nextNode.lng) {
        const distance = calculateDistance(currentNode.lat, currentNode.lng, nextNode.lat, nextNode.lng)
        const baseDelay = Math.max(10, distance * 0.5) // Base delay from distance
        const capacityFactor = Math.max(0.5, currentNode.capacity / 100000000) // Higher capacity = lower delay
        totalDelay += baseDelay / capacityFactor
      } else {
        totalDelay += 50 + Math.random() * 100 // Random delay if no coordinates
      }
    }
    
    // Calculate success probability
    const probability = Math.max(0.7, 1 - (hops * 0.05) - (totalFees / 1000 * 0.01))
    
    routes.push({
      nodes: routeNodes,
      totalFees: Math.round(totalFees),
      totalDelay: Math.round(totalDelay),
      hops: routeNodes.length - 1,
      probability: Math.round(probability * 100) / 100
    })
  }
  
  // Sort routes by a combination of delay, fees, and probability
  routes.sort((a, b) => {
    const scoreA = a.totalDelay + (a.totalFees * 10) - (a.probability * 100)
    const scoreB = b.totalDelay + (b.totalFees * 10) - (b.probability * 100)
    return scoreA - scoreB
  })
  
  return routes
}

// Simulate a transaction
export function simulateTransaction(
  fromNodeId: string, 
  toNodeId: string, 
  amount: number
): TransactionSimulation {
  const fromNode = mockNodes.find(n => n.id === fromNodeId)
  const toNode = mockNodes.find(n => n.id === toNodeId)
  
  if (!fromNode || !toNode) {
    throw new Error('Node not found')
  }

  const routes = findRoutes(fromNodeId, toNodeId)
  const selectedRoute = routes[0] // Use the best route
  
  // Simulate actual execution
  const estimatedTime = selectedRoute.totalDelay
  const variance = estimatedTime * 0.3 // 30% variance
  const actualTime = Math.max(10, estimatedTime + (Math.random() - 0.5) * variance)
  
  // Determine success based on probability
  const success = Math.random() < selectedRoute.probability
  
  return {
    id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    fromNode,
    toNode,
    amount,
    routes,
    selectedRoute,
    estimatedTime: Math.round(estimatedTime),
    actualTime: Math.round(actualTime),
    success,
    timestamp: new Date()
  }
}

// Log transaction speed to database
export async function logTransactionSpeed(simulation: TransactionSimulation): Promise<void> {
  if (!simulation.success || !simulation.actualTime) {
    return // Only log successful transactions
  }

  const record: TransactionSpeedRecord = {
    node_id: simulation.fromNode.id,
    node_alias: simulation.fromNode.alias,
    milliseconds: simulation.actualTime,
    hops: simulation.selectedRoute.hops,
    amount: simulation.amount,
    inbound: true,
    outbound: true,
    completed_at: simulation.timestamp.toISOString(),
    route_nodes: simulation.selectedRoute.nodes.map(n => n.alias),
    fees_paid: simulation.selectedRoute.totalFees,
    success: simulation.success
  }

  if (supabase) {
    try {
      const { error } = await supabase
        .from('transaction_speeds')
        .insert([record])
      
      if (error) {
        console.error('Error logging transaction speed:', error)
      }
    } catch (err) {
      console.error('Database error:', err)
    }
  } else {
    // If no Supabase connection, just log to console
    console.log('Transaction speed logged:', record)
  }
}

// Generate random simulation
export function generateRandomSimulation(): TransactionSimulation {
  const onlineNodes = mockNodes.filter(n => n.isOnline)
  const fromNode = onlineNodes[Math.floor(Math.random() * onlineNodes.length)]
  const toNode = onlineNodes[Math.floor(Math.random() * onlineNodes.length)]
  
  if (fromNode.id === toNode.id) {
    // If same node selected, pick a different one
    const otherNodes = onlineNodes.filter(n => n.id !== fromNode.id)
    const differentToNode = otherNodes[Math.floor(Math.random() * otherNodes.length)]
    return simulateTransaction(fromNode.id, differentToNode.id, Math.floor(Math.random() * 1000000) + 1000)
  }
  
  return simulateTransaction(fromNode.id, toNode.id, Math.floor(Math.random() * 1000000) + 1000)
}

// Get all available nodes
export function getAvailableNodes(): SimulationNode[] {
  return mockNodes.filter(n => n.isOnline)
}

// Get node by ID
export function getNodeById(nodeId: string): SimulationNode | undefined {
  return mockNodes.find(n => n.id === nodeId)
}

// Batch simulate multiple transactions
export async function batchSimulate(count: number): Promise<TransactionSimulation[]> {
  const simulations: TransactionSimulation[] = []
  
  for (let i = 0; i < count; i++) {
    const simulation = generateRandomSimulation()
    simulations.push(simulation)
    
    // Log to database if available
    await logTransactionSpeed(simulation)
    
    // Small delay to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return simulations
}

// Export mock data for testing
export { mockNodes } 