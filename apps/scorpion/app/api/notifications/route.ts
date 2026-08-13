import { NextRequest, NextResponse } from 'next/server';
import { getSystemAutomation } from '@/lib/system-automation';
import { getNotificationManager } from '@/lib/notification-manager';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode, validateRequest } from '@/lib/api-error-handler';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

/**
 * GET /api/notifications - Get all unread notifications and pending approvals
 * Query params:
 *   - homepage=true: Returns format for homepage badge (notifications array)
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const isHomepage = searchParams.get('homepage') === 'true';
  
  const notificationManager = getNotificationManager();
  
  // Get unread notifications
  const unread = notificationManager.getUnreadNotifications();
  
  // Get pending approvals (dangerous operations requiring human-in-loop)
  const pending = notificationManager.getPendingApprovals();
  
  // Homepage format (for NotificationBadge component)
  if (isHomepage) {
    return createSuccessResponse({
      notifications: unread,
      pendingApprovals: pending
    });
  }
  
  // Full format (for notifications page)
  return createSuccessResponse({
    unread,
    pending,
    stats: {
      totalUnread: unread.length,
      totalPending: pending.length,
      critical: unread.filter(n => n.severity === 'critical').length,
      high: unread.filter(n => n.severity === 'high').length
    }
  });
});

const notificationActionSchema = z.object({
  action: z.enum(['read', 'approve', 'reject']),
  notificationId: z.string().optional(),
  approvalId: z.string().optional(),
}).refine(
  (data) => {
    if (data.action === 'read' && !data.notificationId) return false;
    if ((data.action === 'approve' || data.action === 'reject') && !data.approvalId) return false;
    return true;
  },
  {
    message: 'Missing required ID for action',
  }
);

/**
 * POST /api/notifications - Handle notification actions (read, approve, reject)
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateRequest(request, notificationActionSchema);
  if (!validation.success) {
    return validation.error;
  }
  
  const { action, notificationId, approvalId } = validation.data;
  const notificationManager = getNotificationManager();
  
  switch (action) {
    case 'read':
      notificationManager.markAsRead(notificationId!);
      return createSuccessResponse({ success: true });
      
    case 'approve':
      const approved = await notificationManager.approveAction(approvalId!);
      return createSuccessResponse({ success: true, result: approved });
      
    case 'reject':
      notificationManager.rejectAction(approvalId!);
      return createSuccessResponse({ success: true });
      
    default:
      return createErrorResponse(
        ApiErrorCode.INVALID_REQUEST,
        'Invalid action',
        undefined,
        400
      );
  }
});
