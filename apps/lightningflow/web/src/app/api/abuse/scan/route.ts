import { NextRequest, NextResponse } from 'next/server'
import { abuseDetectionEngine, NodeActivity } from '../../../../lib/abuse/detection-engine'

export async function POST(request: NextRequest) {
  try {
    const { nodeIds, timeRange = '24h', scanType = 'full' } = await request.json()

    if (!nodeIds || !Array.isArray(nodeIds)) {
      return NextResponse.json(
        { error: 'nodeIds array is required' },
        { status: 400 }
      )
    }

    // Mock data - in production, this would fetch from Supabase
    const mockActivities: NodeActivity[] = nodeIds.map((nodeId: string, index: number) => ({
      nodeId,
      walletId: `wallet_${nodeId}`,
      userId: `user_${index}`,
      ipAddress: `192.168.1.${100 + index}`,
      deviceFingerprint: index < 3 ? 'device_123' : `device_${index}`, // Simulate shared devices
      transactions: generateMockTransactions(nodeId, timeRange),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random within 30 days
      lastActivity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random within 24 hours
      region: ['US', 'Europe', 'Asia', 'Africa'][index % 4],
      metadata: {
        businessDescription: index === 0 ? 'make money fast with crypto' : 'legitimate business'
      }
    }))

    let result
    if (scanType === 'quick') {
      // Quick scan for immediate decisions
      const recentTransactions = mockActivities[0]?.transactions.slice(-10) || []
      const isAbusive = await abuseDetectionEngine.quickCheck(nodeIds[0], recentTransactions)
      result = {
        isAbusive,
        confidence: isAbusive ? 80 : 20,
        reasons: isAbusive ? ['Suspicious activity detected in quick scan'] : [],
        riskLevel: isAbusive ? 'high' : 'low',
        suggestedAction: isAbusive ? 'review' : 'allow',
        scanType: 'quick'
      }
    } else {
      // Full comprehensive scan
      result = await abuseDetectionEngine.runFullScan(mockActivities)
    }

    // Log the scan for audit purposes
    console.log(`Abuse scan completed for ${nodeIds.length} nodes:`, {
      timestamp: new Date().toISOString(),
      nodeIds,
      result: {
        isAbusive: result.isAbusive,
        confidence: result.confidence,
        riskLevel: result.riskLevel,
        suggestedAction: result.suggestedAction
      }
    })

    // Send alert if high-risk abuse detected
    if (result.riskLevel === 'critical' || result.riskLevel === 'high') {
      await sendAbuseAlert(result, nodeIds)
    }

    return NextResponse.json({
      success: true,
      scan: {
        timestamp: new Date().toISOString(),
        nodeCount: nodeIds.length,
        timeRange,
        scanType
      },
      result
    })

  } catch (error) {
    console.error('Abuse scan error:', error)
    return NextResponse.json(
      { error: 'Internal server error during abuse scan' },
      { status: 500 }
    )
  }
}

// GET endpoint for abuse scan status/history
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const nodeId = searchParams.get('nodeId')
  const limit = parseInt(searchParams.get('limit') || '10')

  try {
    // Mock scan history - in production, fetch from database
    const scanHistory = Array.from({ length: limit }, (_, i) => ({
      id: `scan_${Date.now()}_${i}`,
      nodeId: nodeId || `node_${i}`,
      timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      riskLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
      confidence: Math.floor(Math.random() * 100),
      isAbusive: Math.random() > 0.7,
      reasons: ['Suspicious transaction pattern', 'High reward ratio'][Math.floor(Math.random() * 2)]
    }))

    return NextResponse.json({
      success: true,
      history: scanHistory,
      total: scanHistory.length
    })

  } catch (error) {
    console.error('Error fetching abuse scan history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scan history' },
      { status: 500 }
    )
  }
}

// Helper function to generate mock transaction data
function generateMockTransactions(nodeId: string, timeRange: string) {
  const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 24
  const transactionCount = Math.floor(Math.random() * 50) + 10 // 10-60 transactions
  
  return Array.from({ length: transactionCount }, (_, i) => ({
    id: `tx_${nodeId}_${i}`,
    sourceNodeId: nodeId,
    targetNodeId: `target_${Math.floor(Math.random() * 10)}`,
    amount: Math.floor(Math.random() * 1000000) + 1000, // 1K-1M sats
    fee: Math.floor(Math.random() * 1000) + 10, // 10-1010 sats
    timestamp: new Date(Date.now() - Math.random() * hours * 60 * 60 * 1000),
    type: ['payment', 'routing', 'reward', 'withdrawal'][Math.floor(Math.random() * 4)] as any,
    metadata: {
      region: ['US', 'Europe', 'Asia'][Math.floor(Math.random() * 3)]
    }
  }))
}

// Helper function to send abuse alerts
async function sendAbuseAlert(result: any, nodeIds: string[]) {
  // In production, this would send to Discord, email, or monitoring system
  console.log('🚨 ABUSE ALERT:', {
    timestamp: new Date().toISOString(),
    riskLevel: result.riskLevel,
    confidence: result.confidence,
    nodeIds,
    reasons: result.reasons,
    suggestedAction: result.suggestedAction
  })

  // Example: Send to Discord webhook
  // await fetch(process.env.DISCORD_WEBHOOK_URL, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     embeds: [{
  //       title: '🚨 Abuse Detection Alert',
  //       color: result.riskLevel === 'critical' ? 0xff0000 : 0xff8800,
  //       fields: [
  //         { name: 'Risk Level', value: result.riskLevel, inline: true },
  //         { name: 'Confidence', value: `${result.confidence}%`, inline: true },
  //         { name: 'Nodes', value: nodeIds.join(', '), inline: false },
  //         { name: 'Reasons', value: result.reasons.join('\n'), inline: false }
  //       ],
  //       timestamp: new Date().toISOString()
  //     }]
  //   })
  // })
} 