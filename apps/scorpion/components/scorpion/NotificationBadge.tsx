'use client';

import { Bell, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  requiresApproval: boolean;
  createdAt: string;
}

export function NotificationBadge() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
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
  };

  const handleApprove = async (id: string) => {
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
  };

  const handleReject = async (id: string) => {
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
  };

  const handleDismiss = async (id: string) => {
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
  };

  if (loading || notifications.length === 0) {
    return null;
  }

  const critical = notifications.filter(n => n.severity === 'critical' || n.requiresApproval);
  const count = critical.length;

  if (count === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {critical.slice(0, 3).map((notif) => (
        <div
          key={notif.id}
          className={`bg-[#0c1014] border rounded-sm p-3 shadow-lg ${
            notif.type === 'danger' ? 'border-red-500/50' :
            notif.type === 'warning' ? 'border-yellow-500/50' :
            notif.type === 'info' ? 'border-blue-500/50' :
            'border-emerald-500/50'
          }`}
        >
          <div className="flex items-start gap-2">
            <div className={`mt-0.5 ${
              notif.type === 'danger' ? 'text-red-400' :
              notif.type === 'warning' ? 'text-yellow-400' :
              notif.type === 'info' ? 'text-blue-400' :
              'text-emerald-400'
            }`}>
              {notif.type === 'danger' ? <AlertTriangle size={16} /> :
               notif.type === 'warning' ? <AlertTriangle size={16} /> :
               notif.type === 'info' ? <Info size={16} /> :
               <CheckCircle size={16} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold mb-1">{notif.title}</div>
              <div className="text-xs text-white/70 mb-2">{notif.message}</div>
              {notif.requiresApproval && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(notif.id)}
                    className="px-2 py-1 text-xs bg-emerald-500/20 border border-emerald-500/50 rounded hover:bg-emerald-500/30 text-emerald-300"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(notif.id)}
                    className="px-2 py-1 text-xs bg-red-500/20 border border-red-500/50 rounded hover:bg-red-500/30 text-red-300"
                  >
                    Reject
                  </button>
                </div>
              )}
              {!notif.requiresApproval && (
                <button
                  onClick={() => handleDismiss(notif.id)}
                  className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded hover:bg-white/10 text-white/60"
                >
                  Dismiss
                </button>
              )}
            </div>
            <button
              onClick={() => handleDismiss(notif.id)}
              className="text-white/30 hover:text-white/60"
            >
              <XCircle size={14} />
            </button>
          </div>
        </div>
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
}

