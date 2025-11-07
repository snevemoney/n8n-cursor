import { NextRequest, NextResponse } from 'next/server';
import { getSystemAutomation } from '@/lib/system-automation';
import { getNotificationManager } from '@/lib/notification-manager';

/**
 * GET /api/notifications - Get all unread notifications and pending approvals
 */
export async function GET() {
  try {
    const notificationManager = getNotificationManager();
    
    // Get unread notifications
    const unread = notificationManager.getUnreadNotifications();
    
    // Get pending approvals (dangerous operations requiring human-in-loop)
    const pending = notificationManager.getPendingApprovals();
    
    return NextResponse.json({
      unread,
      pending,
      stats: {
        totalUnread: unread.length,
        totalPending: pending.length,
        critical: unread.filter(n => n.severity === 'critical').length,
        high: unread.filter(n => n.severity === 'high').length
      }
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications - Handle notification actions (read, approve, reject)
 */
export async function POST(request: NextRequest) {
  try {
    const { action, notificationId, approvalId } = await request.json();
    const notificationManager = getNotificationManager();
    
    switch (action) {
      case 'read':
        if (!notificationId) {
          return NextResponse.json(
            { error: 'Missing notificationId' },
            { status: 400 }
          );
        }
        notificationManager.markAsRead(notificationId);
        return NextResponse.json({ success: true });
        
      case 'approve':
        if (!approvalId) {
          return NextResponse.json(
            { error: 'Missing approvalId' },
            { status: 400 }
          );
        }
        const approved = await notificationManager.approveAction(approvalId);
        return NextResponse.json({ success: true, result: approved });
        
      case 'reject':
        if (!approvalId) {
          return NextResponse.json(
            { error: 'Missing approvalId' },
            { status: 400 }
          );
        }
        notificationManager.rejectAction(approvalId);
        return NextResponse.json({ success: true });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Error handling notification action:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to handle action' },
      { status: 500 }
    );
  }
}
