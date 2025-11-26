import { NextRequest, NextResponse } from 'next/server'

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

// Stable mock data that doesn't change randomly
let mockNodeData = {
  peers: 12,
  channels: 8,
  balance: {
    confirmed: 1250000,
    unconfirmed: 5000,
    total: 1255000
  },
  blockHeight: 825847,
  uptime: 86400 * 3, // 3 days
  lastBlockUpdate: Date.now()
}

// Mock LND/CLN detection and status checking
async function detectNodeType(): Promise<'lnd' | 'cln' | 'unknown'> {
  try {
    // In production, this would check for actual node processes
    // For now, we'll simulate LND detection
    const hasLND = process.env.LND_GRPC_HOST || process.env.LND_REST_HOST
    const hasCLN = process.env.CLN_GRPC_HOST || process.env.CLN_REST_HOST
    
    if (hasLND) return 'lnd'
    if (hasCLN) return 'cln'
    
    // Default to LND for demo
    return 'lnd'
  } catch (error) {
    console.error('Node detection failed:', error)
    return 'unknown'
  }
}

async function getLNDStatus(): Promise<Partial<NodeStatus>> {
  try {
    // Simulate gradual changes instead of random jumps
    const now = Date.now()
    
    // Update block height every ~10 minutes (600 seconds)
    if (now - mockNodeData.lastBlockUpdate > 600000) {
      mockNodeData.blockHeight += 1
      mockNodeData.lastBlockUpdate = now
    }
    
    // Occasionally add small balance changes (simulate earnings)
    if (Math.random() < 0.1) {
      mockNodeData.balance.confirmed += Math.floor(Math.random() * 100) + 10
      mockNodeData.balance.total = mockNodeData.balance.confirmed + mockNodeData.balance.unconfirmed
    }
    
    // Very rarely change peer/channel count
    if (Math.random() < 0.02) {
      mockNodeData.peers += Math.random() > 0.5 ? 1 : -1
      mockNodeData.peers = Math.max(5, Math.min(20, mockNodeData.peers))
    }
    
    const data = {
      status: 'online' as NodeStatus['status'],
      peers: mockNodeData.peers,
      channels: mockNodeData.channels,
      syncProgress: 100,
      blockHeight: mockNodeData.blockHeight,
      version: '0.17.4-beta',
      alias: process.env.NODE_ALIAS || 'MyLightningNode',
      balance: { ...mockNodeData.balance },
      network: 'mainnet' as const,
      uptime: mockNodeData.uptime + Math.floor((now - mockNodeData.lastBlockUpdate) / 1000),
      errors: []
    }
    
    // Very rarely simulate syncing state (only 1% chance)
    if (Math.random() < 0.01) {
      data.status = 'syncing'
      data.syncProgress = Math.floor(Math.random() * 10) + 90 // 90-99%
    }
    
    return data
  } catch (error) {
    console.error('LND status check failed:', error)
    return {
      status: 'error',
      errors: ['Failed to connect to LND node']
    }
  }
}

async function getCLNStatus(): Promise<Partial<NodeStatus>> {
  try {
    // Use similar stable data for CLN
    return {
      status: 'online' as const,
      peers: mockNodeData.peers,
      channels: mockNodeData.channels,
      syncProgress: 100,
      blockHeight: mockNodeData.blockHeight,
      version: '23.11.2',
      alias: process.env.NODE_ALIAS || 'MyCLNNode',
      balance: { ...mockNodeData.balance },
      network: 'mainnet' as const,
      uptime: mockNodeData.uptime,
      errors: []
    }
  } catch (error) {
    console.error('CLN status check failed:', error)
    return {
      status: 'error',
      errors: ['Failed to connect to CLN node']
    }
  }
}

async function getNodeStatus(): Promise<NodeStatus> {
  const nodeType = await detectNodeType()
  
  let nodeData: Partial<NodeStatus>
  
  switch (nodeType) {
    case 'lnd':
      nodeData = await getLNDStatus()
      break
    case 'cln':
      nodeData = await getCLNStatus()
      break
    default:
      nodeData = {
        status: 'offline',
        errors: ['No Lightning node detected']
      }
  }
  
  // Merge with defaults
  const status: NodeStatus = {
    status: 'offline',
    type: nodeType,
    peers: 0,
    channels: 0,
    syncProgress: 0,
    blockHeight: 0,
    lastUpdate: new Date(),
    version: 'unknown',
    alias: 'Unknown Node',
    balance: {
      confirmed: 0,
      unconfirmed: 0,
      total: 0
    },
    network: 'mainnet',
    uptime: 0,
    errors: [],
    ...nodeData
  }
  
  return status
}

export async function GET(request: NextRequest) {
  try {
    const status = await getNodeStatus()
    
    return NextResponse.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Node status check failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to check node status',
      data: {
        status: 'error',
        type: 'unknown',
        peers: 0,
        channels: 0,
        syncProgress: 0,
        blockHeight: 0,
        lastUpdate: new Date(),
        version: 'unknown',
        alias: 'Error',
        balance: { confirmed: 0, unconfirmed: 0, total: 0 },
        network: 'mainnet',
        uptime: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }, { status: 500 })
  }
}

// Health check endpoint for monitoring
export async function HEAD(request: NextRequest) {
  try {
    const status = await getNodeStatus()
    
    if (status.status === 'online') {
      return new NextResponse(null, { status: 200 })
    } else {
      return new NextResponse(null, { status: 503 })
    }
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
} 