'use client';

/**
 * Governance Panel Component
 * Power of 10 Rule 3: Focused component for governance operations
 */

import { useState, useEffect } from 'react';
import { Panel, Metric, Button, Badge, useToast, LoadingState, EmptyState } from '@/components/scorpion';
import { Shield, Clock, Trash2 } from 'lucide-react';
import { DatabaseSetupBanner } from './DatabaseSetupBanner';

interface GovernanceSummary {
  totalAssets: number;
  activePolicies: number;
  accessLogs24h: number;
  retentionRules: number;
  denied24h: number;
}

interface Policy {
  id: string;
  name: string;
  description: string | null;
  scope: 'global' | 'project' | 'tenant';
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface AccessLog {
  id: string;
  timestamp: string;
  actor_user_id: string | null;
  action: string;
  asset_id: string | null;
  resource_type: string | null;
  resource_id: string | null;
  result: 'allowed' | 'denied';
  context_json: any;
}

interface RetentionRule {
  id: string;
  name: string;
  asset_type: string;
  retention_days: number;
  hard_delete: boolean;
  enabled: boolean;
}

export function GovernancePanel() {
  const { showToast } = useToast();
  const [summary, setSummary] = useState<GovernanceSummary | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [retentionRules, setRetentionRules] = useState<RetentionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [enforcingRetention, setEnforcingRetention] = useState(false);
  const [databaseError, setDatabaseError] = useState(false);

  // Filters
  const [logActionFilter, setLogActionFilter] = useState<string>('all');
  const [logResultFilter, setLogResultFilter] = useState<string>('all');
  const [logUserFilter, setLogUserFilter] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryRes, policiesRes, logsRes] = await Promise.all([
        fetch('/api/governance/summary'),
        fetch('/api/governance/policies'),
        fetch('/api/governance/access-logs?limit=50'),
      ]);

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData.data || summaryData);
      } else if (summaryRes.status === 500) {
        const errorData = await summaryRes.json().catch(() => ({}));
        if (errorData.error?.message?.includes('does not exist')) {
          setDatabaseError(true);
          showToast('info', 'Database tables not created yet. Run: pnpm tsx scripts/migrate-cost-tracking.ts');
        }
      }

      if (policiesRes.ok) {
        const policiesData = await policiesRes.json();
        setPolicies(policiesData.data?.policies || policiesData.policies || []);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setAccessLogs(logsData.data?.logs || logsData.logs || []);
      }

      // TODO: Load retention rules when endpoint exists
      setRetentionRules([]);
    } catch (error) {
      console.error('Failed to load governance data:', error);
      showToast('error', 'Failed to load governance data');
    } finally {
      setLoading(false);
    }
  };

  const handleEnforceRetention = async () => {
    setEnforcingRetention(true);
    try {
      const response = await fetch('/api/governance/enforce-retention', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        showToast(
          'success',
          `Retention enforced: ${data.deleted || 0} deleted, ${data.flagged || 0} flagged`
        );
        loadData(); // Refresh summary
      } else {
        throw new Error('Failed to enforce retention');
      }
    } catch (error) {
      showToast('error', 'Failed to enforce retention');
    } finally {
      setEnforcingRetention(false);
    }
  };

  const filteredLogs = accessLogs.filter(log => {
    if (logActionFilter !== 'all' && log.action !== logActionFilter) return false;
    if (logResultFilter !== 'all' && log.result !== logResultFilter) return false;
    if (logUserFilter && !log.actor_user_id?.includes(logUserFilter)) return false;
    return true;
  });

  if (loading && !summary) {
    return <LoadingState text="Loading governance data..." skeletonLines={5} />;
  }

  return (
    <div className="space-y-6">
      {databaseError && <DatabaseSetupBanner />}
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Metric
          label="Total Data Assets"
          value={summary?.totalAssets.toString() || '0'}
        />
        <Metric
          label="Active Policies"
          value={summary?.activePolicies.toString() || '0'}
        />
        <Metric
          label="Access Logs (24h)"
          value={summary?.accessLogs24h.toString() || '0'}
        />
        <Metric
          label="Retention Rules"
          value={summary?.retentionRules.toString() || '0'}
        />
      </div>

      {/* Policies Table */}
      <Panel title="Governance Policies">
        {policies.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="No policies"
            message="Create a policy to start governing data access"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-xs text-white/60 font-medium py-2 px-3">Name</th>
                  <th className="text-xs text-white/60 font-medium py-2 px-3">Scope</th>
                  <th className="text-xs text-white/60 font-medium py-2 px-3">Enabled</th>
                  <th className="text-xs text-white/60 font-medium py-2 px-3">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-3">
                      <div className="text-sm text-white">{policy.name}</div>
                      {policy.description && (
                        <div className="text-xs text-white/50 mt-1">{policy.description}</div>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <Badge variant="default" size="sm">
                        {policy.scope}
                      </Badge>
                    </td>
                    <td className="py-2 px-3">
                      <Badge
                        variant={policy.enabled ? 'success' : 'danger'}
                        size="sm"
                      >
                        {policy.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-xs text-white/50">
                      {new Date(policy.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Access Logs Table */}
      <Panel title="Access Logs (Last 50)">
        <div className="mb-4 space-y-2">
          <div className="flex gap-2 flex-wrap">
            <select
              value={logActionFilter}
              onChange={(e) => setLogActionFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded text-white"
            >
              <option value="all">All Actions</option>
              <option value="read">Read</option>
              <option value="write">Write</option>
              <option value="delete">Delete</option>
              <option value="export">Export</option>
              <option value="share">Share</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={logResultFilter}
              onChange={(e) => setLogResultFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded text-white"
            >
              <option value="all">All Results</option>
              <option value="allowed">Allowed</option>
              <option value="denied">Denied</option>
            </select>
            <input
              type="text"
              placeholder="Filter by user ID..."
              value={logUserFilter}
              onChange={(e) => setLogUserFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded text-white placeholder-white/40 flex-1 min-w-[200px]"
            />
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No access logs"
            message="Access logs will appear here as data is accessed"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-xs text-white/60 font-medium py-2 px-3">Timestamp</th>
                  <th className="text-xs text-white/60 font-medium py-2 px-3">Actor</th>
                  <th className="text-xs text-white/60 font-medium py-2 px-3">Action</th>
                  <th className="text-xs text-white/60 font-medium py-2 px-3">Result</th>
                  <th className="text-xs text-white/60 font-medium py-2 px-3">Asset</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-3 text-xs text-white/70">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-xs text-white/70 font-mono">
                      {log.actor_user_id || 'system'}
                    </td>
                    <td className="py-2 px-3">
                      <Badge variant="default" size="sm">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-2 px-3">
                      <Badge
                        variant={log.result === 'allowed' ? 'success' : 'danger'}
                        size="sm"
                      >
                        {log.result}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-xs text-white/50">
                      {log.resource_type ? `${log.resource_type}:${log.resource_id?.slice(0, 8)}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Retention Overview */}
      <Panel title="Retention Rules">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-white/60">
            Configure retention rules to automatically clean up old data assets
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleEnforceRetention}
            disabled={enforcingRetention}
          >
            {enforcingRetention ? 'Running...' : 'Run Retention Now'}
          </Button>
        </div>

        {retentionRules.length === 0 ? (
          <EmptyState
            icon={Trash2}
            title="No retention rules"
            message="Create retention rules to automatically manage data lifecycle"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-xs text-white/60 font-medium py-2 px-3">Rule Name</th>
                  <th className="text-xs text-white/60 font-medium py-2 px-3">Asset Type</th>
                  <th className="text-xs text-white/60 font-medium py-2 px-3">Retention Days</th>
                  <th className="text-xs text-white/60 font-medium py-2 px-3">Hard Delete</th>
                  <th className="text-xs text-white/60 font-medium py-2 px-3">Enabled</th>
                </tr>
              </thead>
              <tbody>
                {retentionRules.map((rule) => (
                  <tr key={rule.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-3 text-sm text-white">{rule.name}</td>
                    <td className="py-2 px-3 text-xs text-white/70">{rule.asset_type}</td>
                    <td className="py-2 px-3 text-xs text-white/70">{rule.retention_days} days</td>
                    <td className="py-2 px-3">
                      <Badge variant={rule.hard_delete ? 'danger' : 'warning'} size="sm">
                        {rule.hard_delete ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    <td className="py-2 px-3">
                      <Badge variant={rule.enabled ? 'success' : 'danger'} size="sm">
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

