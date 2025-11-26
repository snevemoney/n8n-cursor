import { NextRequest, NextResponse } from 'next/server'
import { getUserWorkspace } from '@/lib/secure/auth'
import { checkQuota, getUsageStats } from '@/lib/secure/checkQuota'

export async function GET(req: NextRequest) {
  try {
    const { workspaceId } = await getUserWorkspace()
    
    // Get current usage stats
    const stats = await getUsageStats(workspaceId)
    
    // Check if within quota (default 50k tokens)
    const limit = 50000
    const isWithinQuota = stats.used_tokens < limit
    
    return NextResponse.json({
      workspaceId,
      usedTokens: stats.used_tokens,
      limit,
      remaining: Math.max(0, limit - stats.used_tokens),
      isWithinQuota,
      lastReset: stats.last_reset,
      percentUsed: Math.round((stats.used_tokens / limit) * 100)
    })
  } catch (error: any) {
    console.error('Quota check error:', error)
    
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { limit } = await req.json()
    const { workspaceId } = await getUserWorkspace()
    
    await checkQuota(workspaceId, limit || 50000)
    
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Quota check error:', error)
    
    if (error.message.includes('Usage limit exceeded')) {
      return NextResponse.json(
        { error: 'Usage limit exceeded. Upgrade required.' },
        { status: 429 }
      )
    }
    
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 