import { NextRequest, NextResponse } from 'next/server';
import { getSystemAutomation } from '@/lib/system-automation';
import { getNotificationManager } from '@/lib/notification-manager';

interface SystemControl {
  status: 'running' | 'paused' | 'stopped';
  acceptingNew: boolean;
}

// In-memory system state (could be moved to database)
let systemControl: SystemControl = {
  status: 'running',
  acceptingNew: true
};

/**
 * GET /api/operations/control - Get current system control state
 */
export async function GET() {
  return NextResponse.json(systemControl);
}

/**
 * POST /api/operations/control - Control system operations
 */
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    const notificationManager = getNotificationManager();
    
    switch (action) {
      case 'run':
        systemControl.status = 'running';
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
        return NextResponse.json({
          success: true,
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
        return NextResponse.json(
          { error: 'Invalid action. Valid actions: run, pause, stop, toggle_new' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      status: systemControl
    });
    
  } catch (error: any) {
    console.error('Error controlling operations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to control operations' },
      { status: 500 }
    );
  }
}

