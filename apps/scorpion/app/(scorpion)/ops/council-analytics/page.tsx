'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CouncilStatistics {
  total: number;
  approved: number;
  rejected: number;
  issuesByTag: Record<string, number>;
  issuesBySeverity: Record<number, number>;
  councillorActivity: Record<string, number>;
}

interface CouncilResult {
  id: string;
  timestamp: string;
  approved: boolean;
  allIssues: Array<{
    severity: number;
    tag: string;
    message: string;
    recommendation: string;
    councillorId: string;
  }>;
  councillorOutputs: Array<{
    councillorId: string;
    councillorName: string;
    issues: any[];
    approved: boolean;
  }>;
}

export default function CouncilAnalyticsPage() {
  const [statistics, setStatistics] = useState<CouncilStatistics | null>(null);
  const [recentResults, setRecentResults] = useState<CouncilResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/council/analytics')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setStatistics(data.statistics);
          setRecentResults(data.recentResults || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-neutral-400">Loading council analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="p-6">
        <p className="text-neutral-400">No data available</p>
      </div>
    );
  }

  const approvalRate = statistics.total > 0
    ? ((statistics.approved / statistics.total) * 100).toFixed(1)
    : '0';

  const topIssues = Object.entries(statistics.issuesByTag)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const topCouncillors = Object.entries(statistics.councillorActivity)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Council Analytics Dashboard</h1>
          <p className="text-neutral-400 mt-1">
            Insights into council decision-making and issue detection
          </p>
        </div>
        <Link
          href="/ops"
          className="text-sm text-emerald-400 hover:text-emerald-300"
        >
          ← Back to Operations
        </Link>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
          <p className="text-sm text-neutral-400 mb-1">Total Reviews</p>
          <p className="text-2xl font-bold">{statistics.total}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
          <p className="text-sm text-emerald-400 mb-1">Approved</p>
          <p className="text-2xl font-bold text-emerald-400">{statistics.approved}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-sm text-red-400 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-400">{statistics.rejected}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-sm text-blue-400 mb-1">Approval Rate</p>
          <p className="text-2xl font-bold text-blue-400">{approvalRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues by Tag */}
        <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
          <h2 className="text-lg font-semibold mb-4">Top Issues by Tag</h2>
          <div className="space-y-2">
            {topIssues.length > 0 ? (
              topIssues.map(([tag, count]) => (
                <div key={tag} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300 capitalize">{tag}</span>
                  <span className="text-sm font-semibold text-neutral-100">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-400">No issues recorded</p>
            )}
          </div>
        </div>

        {/* Issues by Severity */}
        <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
          <h2 className="text-lg font-semibold mb-4">Issues by Severity</h2>
          <div className="space-y-2">
            {Object.entries(statistics.issuesBySeverity)
              .sort(([a], [b]) => parseInt(b) - parseInt(a))
              .map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300">
                    Severity {severity}
                    {parseInt(severity) >= 4 && (
                      <span className="ml-2 text-red-400">⚠️ Critical</span>
                    )}
                  </span>
                  <span className="text-sm font-semibold text-neutral-100">{count}</span>
                </div>
              ))}
            {Object.keys(statistics.issuesBySeverity).length === 0 && (
              <p className="text-sm text-neutral-400">No issues recorded</p>
            )}
          </div>
        </div>
      </div>

      {/* Councillor Activity */}
      <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
        <h2 className="text-lg font-semibold mb-4">Councillor Activity</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {topCouncillors.map(([councillorId, count]) => (
            <div key={councillorId} className="text-center">
              <p className="text-sm text-neutral-400 mb-1 capitalize">
                {councillorId.replace(/-/g, ' ')}
              </p>
              <p className="text-xl font-bold text-neutral-100">{count}</p>
            </div>
          ))}
          {topCouncillors.length === 0 && (
            <p className="text-sm text-neutral-400 col-span-full">No activity recorded</p>
          )}
        </div>
      </div>

      {/* Recent Results */}
      <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
        <h2 className="text-lg font-semibold mb-4">Recent Council Results</h2>
        <div className="space-y-3">
          {recentResults.length > 0 ? (
            recentResults.slice(0, 10).map((result) => (
              <div
                key={result.id}
                className="border border-neutral-700 rounded p-3 bg-neutral-900/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-neutral-400">
                    {new Date(result.timestamp).toLocaleString()}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      result.approved
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {result.approved ? 'Approved' : 'Rejected'}
                  </span>
                </div>
                <div className="text-sm text-neutral-300">
                  <p>
                    <strong>Issues:</strong> {result.allIssues.length}
                  </p>
                  {result.allIssues.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {result.allIssues.slice(0, 3).map((issue, idx) => (
                        <p key={idx} className="text-xs text-neutral-400">
                          [{issue.tag}] {issue.message}
                        </p>
                      ))}
                      {result.allIssues.length > 3 && (
                        <p className="text-xs text-neutral-500">
                          +{result.allIssues.length - 3} more issues
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-neutral-400">No recent results</p>
          )}
        </div>
      </div>
    </div>
  );
}

