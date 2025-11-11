'use client';

import { useState, useEffect } from 'react';
import { Panel, DataTable, LoadingState, ErrorState, EmptyState, PageLoadingBar } from '@/components/scorpion';
import { Bell, AlertTriangle, CheckCircle, XCircle, Info, Check, X } from 'lucide-react';

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
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(false); // Start false so page renders immediately
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Defer data fetch aggressively so page renders instantly
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
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setError(null);
      // Only show loading spinner on initial load, not on refresh
      if (notifications.length === 0 && pendingApprovals.length === 0) {
        setLoading(true);
      }
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const result = await response.json();
        const data = result.success && result.data ? result.data : result;
        setNotifications(data.unread || []);
        setPendingApprovals(data.pending || []);
      } else {
        throw new Error(`Failed to load notifications: ${response.statusText}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load notifications');
      console.error('Failed to load notifications:', error);
      setError(error);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'danger': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'info': return <Info className="h-4 w-4 text-blue-400" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      default: return <Bell className="h-4 w-4 text-white/40" />;
    }
  };

  if (loading && notifications.length === 0 && pendingApprovals.length === 0) {
    return (
      <>
        <PageLoadingBar loading={true} />
        <LoadingState fullPage text="Loading notifications..." />
      </>
    );
  }

  if (error && notifications.length === 0 && pendingApprovals.length === 0) {
    return (
      <>
        <PageLoadingBar loading={false} />
      <ErrorState
        error={error}
        onRetry={loadNotifications}
        title="Failed to load notifications"
        fullPage
      />
      </>
    );
  }

  return (
    <>
      <PageLoadingBar loading={loading && notifications.length === 0 && pendingApprovals.length === 0} />
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-1">Notifications</h1>
        <div className="text-sm text-white/40">
          {notifications.length} unread, {pendingApprovals.length} pending approvals
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <Panel title={`Pending Approvals (${pendingApprovals.length})`}>
          <div className="space-y-3">
            {pendingApprovals.map((approval) => (
              <div
                key={approval.id}
                className="bg-red-500/10 border border-red-500/30 rounded-sm p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div>
                      <div className="font-semibold text-red-300">Action Requires Approval</div>
                      <div className="text-xs text-white/60 mt-1">{approval.type}</div>
                    </div>
                  </div>
                  <div className="text-xs text-white/40">
                    {new Date(approval.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-white/80 mb-3">{approval.description}</div>
                <div className="text-xs text-white/60 mb-3">
                  Impact: <span className="text-red-300">{approval.impact}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(approval.id)}
                    className="px-3 py-1.5 text-sm bg-emerald-500/20 border border-emerald-500/50 rounded hover:bg-emerald-500/30 text-emerald-300 flex items-center gap-2"
                  >
                    <Check size={14} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(approval.id)}
                    className="px-3 py-1.5 text-sm bg-red-500/20 border border-red-500/50 rounded hover:bg-red-500/30 text-red-300 flex items-center gap-2"
                  >
                    <X size={14} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {error && (
        <ErrorState
          error={error}
          onRetry={loadNotifications}
          title="Error loading notifications"
          fullPage={false}
        />
      )}

      {/* All Notifications */}
      <Panel title={`All Notifications (${notifications.length})`}>
        {loading ? (
          <LoadingState text="Loading notifications..." />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No unread notifications"
            message="All caught up! No unread notifications to display."
            fullPage={false}
          />
        ) : (
          <DataTable
            columns={[
              { key: 'type', label: 'Type' },
              { key: 'title', label: 'Title' },
              { key: 'message', label: 'Message' },
              { key: 'severity', label: 'Severity' },
              { key: 'created', label: 'Created' },
              { key: 'actions', label: 'Actions' }
            ]}
            data={notifications.map(n => ({
              type: (
                <div className="flex items-center gap-2">
                  {getTypeIcon(n.type)}
                  <span className="text-xs capitalize">{n.type}</span>
                </div>
              ),
              title: n.title,
              message: <div className="text-xs text-white/70 max-w-md">{n.message}</div>,
              severity: (
                <span className={`text-xs ${
                  n.severity === 'critical' ? 'text-red-400' :
                  n.severity === 'high' ? 'text-yellow-400' :
                  n.severity === 'medium' ? 'text-white/60' :
                  'text-white/40'
                }`}>
                  {n.severity}
                </span>
              ),
              created: new Date(n.createdAt).toLocaleString(),
              actions: (
                <button
                  onClick={() => handleDismiss(n.id)}
                  className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded hover:bg-white/10 text-white/60"
                >
                  Dismiss
                </button>
              )
            }))}
          />
        )}
      </Panel>
    </div>
    </>
  );
}

