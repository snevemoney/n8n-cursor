import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { toolRegistry } from './tools'
import { enforceTier3HitlGate } from './tools/hitl-gate'
import { enforceAgentRoleGate } from './tools/agent-roles'

/**
 * Tool backend for OpenClaw agents.
 * Tier 3: money / deploy / secrets hard-blocked at this boundary (Telegram lane).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tool, params, agentId } = body as {
      tool: string
      params: Record<string, unknown>
      agentId?: string
    }

    if (!tool) {
      return NextResponse.json({ error: 'Missing tool', code: 'MISSING_TOOL' }, { status: 400 })
    }

    if (!params || typeof params !== 'object') {
      return NextResponse.json({ error: 'Missing or invalid params object', code: 'MISSING_PARAM' }, { status: 400 })
    }

    const gate = enforceTier3HitlGate(tool, params)
    if (gate) {
      try {
        await prisma.systemEvent.create({
          data: {
            type: 'tier3_blocked',
            agentId: agentId ?? 'unknown',
            taskSummary: `${tool}: Tier 3 HITL block`,
            status: 'blocked',
          },
        })
      } catch {
        /* non-fatal */
      }
      return gate
    }

    const roleGate = enforceAgentRoleGate(tool, agentId)
    if (roleGate) {
      try {
        await prisma.systemEvent.create({
          data: {
            type: 'role_blocked',
            agentId: agentId ?? 'unknown',
            taskSummary: `${tool}: role gate block`,
            status: 'blocked',
          },
        })
      } catch {
        /* non-fatal */
      }
      return roleGate
    }

    const handler = toolRegistry[tool]
    if (!handler) {
      return NextResponse.json({ error: `Unknown tool: ${tool}`, code: 'UNKNOWN_TOOL' }, { status: 400 })
    }

    return await handler(params, { prisma, agentId: agentId ?? 'unknown' })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const isTimeout = message.includes('abort')
    console.error('[tools] Error:', error)

    try {
      const body = await request.clone().json().catch(() => ({}))
      await prisma.systemEvent.create({
        data: {
          type: 'tool_error',
          agentId: body.agentId ?? 'unknown',
          taskSummary: `${body.tool ?? 'unknown'}: ${message.slice(0, 500)}`,
          status: 'failed',
        },
      })
    } catch {
      /* non-fatal */
    }

    return NextResponse.json(
      {
        error: isTimeout ? 'Request timed out' : 'Internal server error',
        code: isTimeout ? 'TIMEOUT' : 'INTERNAL_ERROR',
        details: process.env.NODE_ENV !== 'production' ? message : undefined,
      },
      { status: isTimeout ? 504 : 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    tier3: true,
    tools: Object.keys(toolRegistry),
  })
}
