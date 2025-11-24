import { NextRequest } from 'next/server';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';
import { updateAgentStatus, getAgentById } from '@/lib/agent-storage';
import { councilMembers } from '@scorpion/core';

// In-memory status cache for council members (static agents)
const councilMemberStatusCache = new Map<string, 'active' | 'standby' | 'offline'>();

/**
 * Generate agent ID from name
 */
function generateAgentId(name: string, index: number): string {
  const prefixes = ['E', 'A', 'P', 'S', 'N', 'S', 'C', 'O'];
  const prefix = prefixes[index] || 'X';
  const num = (index + 1).toString().padStart(3, '0');
  return `${prefix}-${num}`;
}

/**
 * POST /api/agents/[id]/run - Activate an agent
 */
export const POST = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  
  // Check if it's a stored agent
  const storedAgent = await getAgentById(id);
  if (storedAgent) {
    const updated = await updateAgentStatus(id, 'active');
    if (!updated) {
      return createErrorResponse(
        ApiErrorCode.NOT_FOUND,
        'Agent not found',
        { id },
        404
      );
    }
    return createSuccessResponse({
      id: updated.id,
      codename: updated.name,
      status: updated.status,
      message: `Agent "${updated.name}" activated successfully`
    });
  }
  
  // Check if it's a council member (static agent)
  const memberIndex = councilMembers.findIndex((m, idx) => {
    const agentId = generateAgentId(m.name, idx);
    return agentId === id;
  });
  
  if (memberIndex === -1) {
    return createErrorResponse(
      ApiErrorCode.NOT_FOUND,
      'Agent not found',
      { id },
      404
    );
  }
  
  // For static council members, update status in cache
  councilMemberStatusCache.set(id, 'active');
  
  return createSuccessResponse({
    id,
    codename: councilMembers[memberIndex].name,
    status: 'active',
    message: `Agent "${councilMembers[memberIndex].name}" activated successfully`
  });
});

