/**
 * Human-in-the-Loop Notification System
 * Notifies user of dangerous actions and requires approval
 */

import { getProactiveIntelligence } from './proactive-intelligence';
import { getOntologyStore } from './shared-stores';

export interface Notification {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  action?: {
    id: string;
    label: string;
    type: 'approve' | 'reject' | 'dismiss';
  };
  requiresApproval: boolean;
  createdAt: string;
  readAt?: string;
  approvedAt?: string;
  dismissedAt?: string;
}

export interface PendingApproval {
  id: string;
  type: 'dangerous-action' | 'system-change' | 'data-modification' | 'workflow-change';
  description: string;
  impact: string;
  requiresApproval: boolean;
  createdAt: string;
}

class NotificationSystem {
  private notifications: Notification[] = [];
  private pendingApprovals: PendingApproval[] = [];
  private notificationQueue: Notification[] = [];
  private checkInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize notification system
   */
  async initialize() {
    console.log('🔔 Initializing notification system...');

    // Load pending notifications from ontology
    await this.loadNotifications();

    // Check for pending approvals (every 30 seconds)
    this.checkInterval = setInterval(() => {
      this.checkPendingApprovals();
      this.checkProactiveActions();
    }, 30 * 1000);

    // Initial check
    await Promise.all([
      this.checkPendingApprovals(),
      this.checkProactiveActions()
    ]);

    console.log('✅ Notification system initialized');
  }

  /**
   * Send notification
   */
  async notify(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    const fullNotification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...notification,
      createdAt: new Date().toISOString()
    };

    this.notifications.push(fullNotification);
    this.notificationQueue.push(fullNotification);

    // Store in ontology
    await this.storeNotification(fullNotification);

    // If requires approval, add to pending approvals
    if (fullNotification.requiresApproval) {
      this.pendingApprovals.push({
        id: fullNotification.id,
        type: 'dangerous-action',
        description: fullNotification.message,
        impact: fullNotification.severity,
        requiresApproval: true,
        createdAt: fullNotification.createdAt
      });
    }

    console.log(`🔔 Notification: ${fullNotification.title} (${fullNotification.severity})`);

    return fullNotification.id;
  }

  /**
   * Request approval for dangerous action
   */
  async requestApproval(
    actionId: string,
    description: string,
    impact: string
  ): Promise<PendingApproval> {
    const approval: PendingApproval = {
      id: `approval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'dangerous-action',
      description,
      impact,
      requiresApproval: true,
      createdAt: new Date().toISOString()
    };

    this.pendingApprovals.push(approval);

    // Send notification
    await this.notify({
      type: 'danger',
      severity: impact as any,
      title: 'Action Requires Approval',
      message: description,
      action: {
        id: approval.id,
        label: 'Review & Approve',
        type: 'approve'
      },
      requiresApproval: true
    });

    return approval;
  }

  /**
   * Approve an action
   */
  async approve(approvalId: string): Promise<boolean> {
    const approval = this.pendingApprovals.find(a => a.id === approvalId);
    if (!approval) {
      return false;
    }

    // Mark as approved
    const notification = this.notifications.find(n => n.id === approvalId);
    if (notification) {
      notification.approvedAt = new Date().toISOString();
      notification.readAt = new Date().toISOString();
    }

    // Remove from pending
    this.pendingApprovals = this.pendingApprovals.filter(a => a.id !== approvalId);

    // Store update
    await this.storeNotification(notification!);

    return true;
  }

  /**
   * Reject an action
   */
  async reject(approvalId: string): Promise<boolean> {
    const approval = this.pendingApprovals.find(a => a.id === approvalId);
    if (!approval) {
      return false;
    }

    // Mark as rejected
    const notification = this.notifications.find(n => n.id === approvalId);
    if (notification) {
      notification.dismissedAt = new Date().toISOString();
      notification.readAt = new Date().toISOString();
    }

    // Remove from pending
    this.pendingApprovals = this.pendingApprovals.filter(a => a.id !== approvalId);

    // Store update
    await this.storeNotification(notification!);

    return true;
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.readAt);
  }

  /**
   * Get notifications requiring action
   */
  getNotificationsRequiringAction(): Notification[] {
    return this.notifications.filter(n => n.requiresApproval && !n.approvedAt && !n.dismissedAt);
  }

  /**
   * Get pending approvals
   */
  getPendingApprovals(): PendingApproval[] {
    return this.pendingApprovals;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.readAt) {
      notification.readAt = new Date().toISOString();
      await this.storeNotification(notification);
    }
  }

  /**
   * Get notifications for homepage/dashboard
   */
  async getHomepageNotifications(): Promise<Notification[]> {
    // Get critical/high severity unread notifications
    const critical = this.notifications
      .filter(n => !n.readAt && (n.severity === 'critical' || n.severity === 'high'))
      .slice(0, 10);

    // Get pending approvals
    const approvals = this.pendingApprovals
      .slice(0, 5)
      .map(approval => {
        const notif = this.notifications.find(n => n.id === approval.id);
        return notif || {
          id: approval.id,
          type: 'danger' as const,
          severity: approval.impact as any,
          title: 'Pending Approval',
          message: approval.description,
          requiresApproval: true,
          createdAt: approval.createdAt
        };
      });

    return [...critical, ...approvals].slice(0, 10);
  }

  // Private methods
  private async checkPendingApprovals(): Promise<void> {
    // Check for stale approvals (older than 24 hours)
    const stale = this.pendingApprovals.filter(a => {
      const age = Date.now() - new Date(a.createdAt).getTime();
      return age > 24 * 60 * 60 * 1000; // 24 hours
    });

    for (const approval of stale) {
      await this.notify({
        type: 'warning',
        severity: 'medium',
        title: 'Stale Approval Request',
        message: `Approval request for "${approval.description}" is still pending`,
        requiresApproval: false
      });
    }
  }

  private async checkProactiveActions(): Promise<void> {
    try {
      const intelligence = getProactiveIntelligence();
      const pendingActions = intelligence.getPendingActions();

      for (const action of pendingActions) {
        // Check if we already have a notification for this action
        const existing = this.pendingApprovals.find(a => a.id === action.id);
        if (!existing) {
          await this.requestApproval(
            action.id,
            action.description,
            action.priority > 5 ? 'high' : 'medium'
          );
        }
      }
    } catch (error) {
      console.error('❌ Failed to check proactive actions:', error);
    }
  }

  private async loadNotifications(): Promise<void> {
    try {
      const ontologyStore = await getOntologyStore();
      const notifications = ontologyStore.query({
        type: 'Notification',
        filters: { readAt: null },
        limit: 100
      });

      for (const notif of notifications) {
        this.notifications.push(notif.data as Notification);
      }
    } catch (error) {
      console.warn('⚠️ Could not load notifications:', error);
    }
  }

  private async storeNotification(notification: Notification): Promise<void> {
    try {
      const ontologyStore = await getOntologyStore();
      await ontologyStore.store({
        id: notification.id,
        type: 'Notification',
        createdAt: new Date(notification.createdAt),
        updatedAt: new Date(notification.readAt || notification.createdAt),
        data: notification
      });
    } catch (error) {
      console.error('❌ Failed to store notification:', error);
    }
  }
}

// Singleton instance
let notificationSystem: NotificationSystem | null = null;

export function getNotificationSystem(): NotificationSystem {
  if (!notificationSystem) {
    notificationSystem = new NotificationSystem();
  }
  return notificationSystem;
}

export async function initializeNotificationSystem() {
  const system = getNotificationSystem();
  await system.initialize();
  return system;
}

