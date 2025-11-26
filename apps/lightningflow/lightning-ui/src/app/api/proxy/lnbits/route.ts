import { NextRequest, NextResponse } from 'next/server'
import { getUserWorkspace } from '@/lib/secure/auth'
import { proxyLNbits } from '@/lib/secure/lnbitsProxy'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { path, method = 'POST', ...payload } = body
    const { workspaceId } = await getUserWorkspace()

    if (!path) {
      return NextResponse.json(
        { error: 'LNbits API path is required' },
        { status: 400 }
      )
    }

    const data = await proxyLNbits(workspaceId, path, payload, method)
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('LNbits proxy error:', error)
    
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (error.message.includes('not configured')) {
      return NextResponse.json(
        { error: 'LNbits not configured for this workspace' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const path = url.searchParams.get('path')
    const { workspaceId } = await getUserWorkspace()

    if (!path) {
      return NextResponse.json(
        { error: 'LNbits API path is required' },
        { status: 400 }
      )
    }

    const data = await proxyLNbits(workspaceId, path, undefined, 'GET')
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('LNbits proxy error:', error)
    
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