/**
 * Notification Manager - Human-in-the-loop for dangerous operations
 * Manages notifications and approval workflows
 */

interface Notification {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  requiresApproval: boolean;
  createdAt: string;
  readAt?: string;
}

interface PendingApproval {
  id: string;
  type: 'dangerous-action' | 'system-change' | 'data-modification' | 'workflow-change';
  description: string;
  impact: string;
  requiresApproval: boolean;
  createdAt: string;
  action: () => Promise<any>; // The actual action to execute on approval
}

export class NotificationManager {
  private notifications: Notification[] = [];
  private pendingApprovals: PendingApproval[] = [];

  /**
   * Add a notification
   */
  notify(
    type: Notification['type'],
    severity: Notification['severity'],
    title: string,
    message: string,
    requiresApproval = false
  ): string {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type,
      severity,
      title,
      message,
      requiresApproval,
      createdAt: new Date().toISOString()
    };
    
    this.notifications.push(notification);
    console.log(`[NotificationManager] ${severity.toUpperCase()}: ${title} - ${message}`);
    
    return notification.id;
  }

  /**
   * Request approval for a dangerous operation
   */
  requestApproval(
    type: PendingApproval['type'],
    description: string,
    impact: string,
    action: () => Promise<any>
  ): string {
    const approval: PendingApproval = {
      id: `approval-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type,
      description,
      impact,
      requiresApproval: true,
      createdAt: new Date().toISOString(),
      action
    };
    
    this.pendingApprovals.push(approval);
    
    // Also create a notification
    this.notify(
      'danger',
      'critical',
      'Action Requires Approval',
      `${description} - ${impact}`,
      true
    );
    
    return approval.id;
  }

  /**
   * Approve and execute a pending action
   */
  async approveAction(approvalId: string): Promise<any> {
    const approvalIndex = this.pendingApprovals.findIndex(a => a.id === approvalId);
    if (approvalIndex === -1) {
      throw new Error(`Approval ${approvalId} not found`);
    }
    
    const approval = this.pendingApprovals[approvalIndex];
    
    try {
      // Execute the approved action
      const result = await approval.action();
      
      // Remove from pending
      this.pendingApprovals.splice(approvalIndex, 1);
      
      // Notify success
      this.notify(
        'success',
        'medium',
        'Action Approved & Executed',
        `${approval.description} completed successfully`
      );
      
      console.log(`[NotificationManager] Approved and executed: ${approval.description}`);
      return result;
    } catch (error: any) {
      this.notify(
        'danger',
        'high',
        'Action Failed After Approval',
        `${approval.description} failed: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Reject a pending action
   */
  rejectAction(approvalId: string): void {
    const approvalIndex = this.pendingApprovals.findIndex(a => a.id === approvalId);
    if (approvalIndex === -1) {
      throw new Error(`Approval ${approvalId} not found`);
    }
    
    const approval = this.pendingApprovals[approvalIndex];
    this.pendingApprovals.splice(approvalIndex, 1);
    
    this.notify(
      'info',
      'low',
      'Action Rejected',
      `${approval.description} was rejected by user`
    );
    
    console.log(`[NotificationManager] Rejected: ${approval.description}`);
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.readAt = new Date().toISOString();
    }
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.readAt);
  }

  /**
   * Get pending approvals
   */
  getPendingApprovals(): Omit<PendingApproval, 'action'>[] {
    // Return pending approvals without the action function (for serialization)
    return this.pendingApprovals.map(({ action, ...rest }) => rest);
  }

  /**
   * Get all notifications (for admin/debug)
   */
  getAllNotifications(): Notification[] {
    return this.notifications;
  }

  /**
   * Clear old read notifications
   */
  clearOldNotifications(daysToKeep = 7): number {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);
    
    const initialCount = this.notifications.length;
    this.notifications = this.notifications.filter(n => {
      if (!n.readAt) return true; // Keep unread
      return new Date(n.readAt) > cutoff; // Keep recent read
    });
    
    const removed = initialCount - this.notifications.length;
    console.log(`[NotificationManager] Cleared ${removed} old notifications`);
    return removed;
  }
}

// Singleton instance
let notificationManagerInstance: NotificationManager | null = null;

export function getNotificationManager(): NotificationManager {
  if (!notificationManagerInstance) {
    notificationManagerInstance = new NotificationManager();
  }
  return notificationManagerInstance;
}

