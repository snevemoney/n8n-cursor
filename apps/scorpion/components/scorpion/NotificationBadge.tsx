'use client';

import { Bell, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import { Alert, Button } from './index';

interface Notification {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  requiresApproval: boolean;
  createdAt: string;
}

export const NotificationBadge = memo(function NotificationBadge() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false); // Start false so component renders immediately

  const loadNotifications = useCallback(async () => {
    // Only load when tab is visible
    if (document.visibilityState !== 'visible') return;
    
    try {
      const response = await fetch('/api/notifications?homepage=true');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Defer data fetch to avoid blocking render
    // Don't include callbacks in deps to prevent re-render loops
    const loadData = () => {
      loadNotifications();
    };
    
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(loadData, { timeout: 0 }); // Immediate - no delay
    } else {
      setTimeout(loadData, 0); // Immediate fallback
    }
    // Refresh every 30 seconds, but only when tab is visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadNotifications();
      }
    }, 30 * 1000);
    
    // Refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadNotifications();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - callback is stable, don't recreate effect

  const handleApprove = useCallback(async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', approvalId: id })
      });
      await loadNotifications();
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  }, [loadNotifications]);

  const handleReject = useCallback(async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', approvalId: id })
      });
      await loadNotifications();
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  }, [loadNotifications]);

  const handleDismiss = useCallback(async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read', notificationId: id })
      });
      await loadNotifications();
    } catch (error) {
      console.error('Failed to dismiss:', error);
    }
  }, [loadNotifications]);

  if (loading || notifications.length === 0) {
    return null;
  }

  const critical = notifications.filter(n => n.severity === 'critical' || n.requiresApproval);
  const count = critical.length;

  if (count === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md" suppressHydrationWarning>
      {critical.slice(0, 3).map((notif) => (
        <Alert
          key={notif.id}
          variant={notif.type === 'danger' ? 'danger' : notif.type === 'warning' ? 'warning' : notif.type === 'info' ? 'info' : 'success'}
          title={notif.title}
          message={notif.message}
          onClose={() => handleDismiss(notif.id)}
          action={
            notif.requiresApproval ? (
              <div className="flex gap-2 mt-2">
                <Button variant="success" size="sm" onClick={() => handleApprove(notif.id)}>
                  Approve
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleReject(notif.id)}>
                  Reject
                </Button>
              </div>
            ) : undefined
          }
          className="shadow-lg"
        />
      ))}
      {count > 3 && (
        <Link
          href="/notifications"
          className="block text-center text-xs text-white/60 hover:text-white/80 bg-white/5 border border-white/10 rounded p-2"
        >
          View all {count} notifications
        </Link>
      )}
    </div>
  );
});

