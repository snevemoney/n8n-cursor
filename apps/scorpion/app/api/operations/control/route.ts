import { NextRequest, NextResponse } from 'next/server';
import { getSystemAutomation } from '@/lib/system-automation';
import { getNotificationManager } from '@/lib/notification-manager';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode, validateRequest } from '@/lib/api-error-handler';
import { requireAuth } from '@/lib/security/auth';
import { z } from 'zod';

interface SystemControl {
  status: 'running' | 'paused' | 'stopped';
  acceptingNew: boolean;
  startedAt?: string; // Track when system started running
}

// In-memory system state (could be moved to database)
let systemControl: SystemControl = {
  status: 'running',
  acceptingNew: true,
  startedAt: new Date().toISOString() // Initialize with current time
};

/**
 * GET /api/operations/control - Get current system control state
 */
export const GET = withErrorHandling(requireAuth(async () => {
  // Calculate runtime if system is running
  let runtime = null;
  if (systemControl.status === 'running' && systemControl.startedAt) {
    const startTime = new Date(systemControl.startedAt).getTime();
    const now = Date.now();
    const diffMs = now - startTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    runtime = { hours, minutes, totalSeconds: Math.floor(diffMs / 1000) };
  }
  
  return createSuccessResponse({
    ...systemControl,
    runtime
  });
}));

const controlActionSchema = z.object({
  action: z.enum(['run', 'pause', 'stop', 'toggle_new'])
});

/**
 * POST /api/operations/control - Control system operations
 */
export const POST = withErrorHandling(requireAuth(async (request: NextRequest) => {
  const validation = await validateRequest(request, controlActionSchema);
  if (!validation.success) {
    return validation.error;
  }
  
  const { action } = validation.data;
  const notificationManager = getNotificationManager();
  
  switch (action) {
    case 'run':
      // Update startedAt when resuming from paused/stopped
      const wasRunning = systemControl.status === 'running';
      systemControl.status = 'running';
      if (!wasRunning) {
        systemControl.startedAt = new Date().toISOString();
      }
      notificationManager.notify(
        'success',
        'medium',
        'System Resumed',
        'All operations resumed successfully'
      );
      console.log('🟢 System resumed');
      break;
      
    case 'pause':
      systemControl.status = 'paused';
      notificationManager.notify(
        'warning',
        'medium',
        'System Paused',
        'All operations temporarily paused. New tasks will queue.'
      );
      console.log('🟡 System paused');
      break;
      
    case 'stop':
      // Stopping is dangerous, require approval
      const approvalId = notificationManager.requestApproval(
        'dangerous-action',
        'Stop all system operations',
        'All running operations will be terminated immediately. Queued tasks will be lost.',
        async () => {
          systemControl.status = 'stopped';
          systemControl.acceptingNew = false;
          console.log('🔴 System stopped');
          return { status: 'stopped' };
        }
      );
      return createSuccessResponse({
        requiresApproval: true,
        approvalId,
        message: 'Stop action requires approval'
      });
      
    case 'toggle_new':
      systemControl.acceptingNew = !systemControl.acceptingNew;
      notificationManager.notify(
        'info',
        'low',
        systemControl.acceptingNew ? 'Accepting New Tasks' : 'Stopped Accepting New Tasks',
        systemControl.acceptingNew 
          ? 'System will now accept new task submissions'
          : 'System will reject new task submissions until re-enabled'
      );
      console.log(`${systemControl.acceptingNew ? '✅' : '🚫'} Accepting new tasks: ${systemControl.acceptingNew}`);
      break;
      
    default:
      return createErrorResponse(
        ApiErrorCode.INVALID_REQUEST,
        'Invalid action. Valid actions: run, pause, stop, toggle_new',
        undefined,
        400
      );
  }
  
  // Calculate runtime for response
  let runtime = null;
  if (systemControl.status === 'running' && systemControl.startedAt) {
    const startTime = new Date(systemControl.startedAt).getTime();
    const now = Date.now();
    const diffMs = now - startTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    runtime = { hours, minutes, totalSeconds: Math.floor(diffMs / 1000) };
  }
  
  return createSuccessResponse({
    status: {
      ...systemControl,
      runtime
    }
  });
}));

