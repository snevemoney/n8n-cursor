import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test the main agent endpoint
    const testQuestion = "What tables are available in my Lightning platform database?"
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/agents/explain-dashboard-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user-id',
        question: testQuestion
      })
    })

    const data = await response.json()

    return NextResponse.json({
      status: 'success',
      testQuestion,
      agentResponse: data.reply || data.error,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Agent test error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json()
    
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/agents/explain-dashboard-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user-id',
        question
      })
    })

    const data = await response.json()

    return NextResponse.json({
      status: 'success',
      question,
      agentResponse: data.reply || data.error,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Agent test error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 