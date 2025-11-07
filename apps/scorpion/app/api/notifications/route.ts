import { NextRequest, NextResponse } from 'next/server';
import { getNotificationSystem } from '@/lib/notifications';

/**
 * GET /api/notifications - Get notifications
 */
export async function GET(request: NextRequest) {
  try {
    const system = getNotificationSystem();
    const { searchParams } = new URL(request.url);
    const homepage = searchParams.get('homepage') === 'true';

    if (homepage) {
      const notifications = await system.getHomepageNotifications();
      return NextResponse.json({ notifications });
    }

    const unread = system.getUnreadNotifications();
    const pending = system.getPendingApprovals();

    return NextResponse.json({
      unread,
      pending,
      total: unread.length + pending.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications - Create notification or approve/reject
 */
export async function POST(request: NextRequest) {
  try {
    const { action, notificationId, approvalId } = await request.json();
    const system = getNotificationSystem();

    if (action === 'approve' && approvalId) {
      const success = await system.approve(approvalId);
      return NextResponse.json({ success });
    }

    if (action === 'reject' && approvalId) {
      const success = await system.reject(approvalId);
      return NextResponse.json({ success });
    }

    if (action === 'read' && notificationId) {
      await system.markAsRead(notificationId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

