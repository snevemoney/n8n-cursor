'use client';

import React, { useState, useEffect } from 'react';
import { Panel, Button, Badge, Alert, useToast } from '@/components/scorpion';
import { Play, RefreshCw, CheckCircle2, XCircle, Minus } from 'lucide-react';

interface ToolStats {
  calls: number;
  ok: number;
  failed: number;
  msTotal: number;
  avgMs: number;
  lastError?: string;
}

interface Coverage {
  totalTools: number;
  toolsAttempted: number;
  toolsSucceeded: number;
  toolsFailed: number;
  coveragePercent: number;
}

interface Scenario {
  id: string;
  label: string;
  status: 'passed' | 'failed' | 'skipped';
  plannerOk: boolean;
  forcedOk: boolean;
  toolsSeen: string[];
  notes: string[];
}

interface Report {
  timestamp: string;
  coverage: Coverage;
  tools: Record<string, ToolStats>;
  scenarios: Scenario[];
  errors: Array<{
    tool: string;
    message: string;
    count: number;
  }>;
}

function getCoverageColor(percent: number): string {
  return percent >= 90 ? 'text-green-600' : percent >= 70 ? 'text-yellow-600' : 'text-red-600';
}

function getStatusIcon(status: string) {
  if (status === 'passed') {
    return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  }
  if (status === 'failed') {
    return <XCircle className="w-4 h-4 text-red-500" />;
  }
  if (status === 'skipped') {
    return <Minus className="w-4 h-4 text-gray-400" />;
  }
  return null;
}

export default function DiagnosticsPage() {
  const { showToast } = useToast();
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  // Load existing report on mount
  useEffect(() => {
    const loadExistingReport = async () => {
      try {
        const response = await fetch('/api/diagnostics/run-tool-matrix', {
          method: 'GET',
        });
        if (response.ok) {
          const data = await response.json();
          console.log('[Diagnostics] Loaded report:', data);
          if (data.report) {
            setReport(data.report);
          } else {
            console.warn('[Diagnostics] No report in GET response');
          }
        }
      } catch (error) {
        // Silently fail - report might not exist yet
      }
    };
    loadExistingReport();
  }, []);

  const runToolMatrix = async () => {
    setRunning(true);
    setLoading(true);
    try {
      const response = await fetch('/api/diagnostics/run-tool-matrix', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to run tool matrix');
      }

      const data = await response.json();
      console.log('[Diagnostics] Report data:', data);
      if (data.report) {
        setReport(data.report);
        const coveragePercent = data.coverage && data.coverage.coveragePercent ? data.coverage.coveragePercent.toFixed(1) : '0.0';
        showToast('success', `Tool Matrix Complete - Coverage: ${coveragePercent}%`);
      } else {
        console.error('[Diagnostics] No report in response:', data);
        showToast('error', 'Report generated but not returned');
      }
    } catch (error: any) {
      showToast('error', error.message || 'Failed to run tool matrix');
    } finally {
      setRunning(false);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tool Matrix Diagnostics</h1>
          <p className="text-gray-600 mt-2">
            End-to-end test harness for all Scorpion tools
          </p>
        </div>
        <Button
          onClick={runToolMatrix}
          disabled={running}
          className="flex items-center gap-2"
        >
          {running ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Tool Matrix
            </>
          )}
        </Button>
      </div>

      {loading && !report && (
        <Alert variant="info">
          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
          Running tool matrix tests...
        </Alert>
      )}

      {report && (
        <>
          {/* Coverage Summary */}
          <Panel>
            <h2 className="text-xl font-semibold mb-4">Coverage Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="text-sm text-gray-600">Total Tools</div>
                <div className="text-2xl font-bold">{report.coverage.totalTools}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Attempted</div>
                <div className="text-2xl font-bold">{report.coverage.toolsAttempted}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Succeeded</div>
                <div className="text-2xl font-bold text-green-600">
                  {report.coverage.toolsSucceeded}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Failed</div>
                <div className="text-2xl font-bold text-red-600">
                  {report.coverage.toolsFailed}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Coverage</div>
                <div
                  className={`text-2xl font-bold ${getCoverageColor(
                    report.coverage.coveragePercent
                  )}`}
                >
                  {report.coverage.coveragePercent.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Last run: {new Date(report.timestamp).toLocaleString()}
            </div>
          </Panel>

          {/* Tool Statistics */}
          <Panel>
            <h2 className="text-xl font-semibold mb-4">Tool Statistics</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Tool</th>
                    <th className="text-right p-2">Calls</th>
                    <th className="text-right p-2">OK</th>
                    <th className="text-right p-2">Failed</th>
                    <th className="text-right p-2">Avg MS</th>
                    <th className="text-left p-2">Last Error</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report.tools)
                    .sort((a, b) => b[1].calls - a[1].calls)
                    .map(([tool, stats]) => (
                      <tr key={tool} className="border-b">
                        <td className="p-2 font-mono text-xs">{tool}</td>
                        <td className="text-right p-2">{stats.calls}</td>
                        <td className="text-right p-2 text-green-600">{stats.ok}</td>
                        <td className="text-right p-2 text-red-600">{stats.failed}</td>
                        <td className="text-right p-2">{stats.avgMs.toFixed(0)}</td>
                        <td className="p-2 text-xs text-gray-500">
                          {stats.lastError ? (
                            <span title={stats.lastError}>
                              {stats.lastError.slice(0, 50)}...
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Scenario Results */}
          <Panel>
            <h2 className="text-xl font-semibold mb-4">Scenario Results</h2>
            <div className="space-y-2">
              {report.scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="border rounded p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(scenario.status)}
                        <span className="font-semibold">{scenario.label}</span>
                        <Badge variant={scenario.status === 'passed' ? 'success' : scenario.status === 'failed' ? 'error' : 'default'}>
                          {scenario.status}
                        </Badge>
                      </div>
                      {scenario.toolsSeen.length > 0 && (
                        <div className="text-sm text-gray-600 mb-1">
                          Tools: {scenario.toolsSeen.join(', ')}
                        </div>
                      )}
                      {scenario.notes.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {scenario.notes.join('; ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Top Errors */}
          {report.errors.length > 0 && (
            <Panel>
              <h2 className="text-xl font-semibold mb-4">Top Errors</h2>
              <div className="space-y-3">
                {report.errors.slice(0, 10).map((error, idx) => (
                  <Alert key={idx} variant="danger">
                    <div className="font-semibold">{error.tool} ({error.count}x)</div>
                    <div className="text-sm mt-1 font-mono">{error.message}</div>
                  </Alert>
                ))}
              </div>
            </Panel>
          )}
        </>
      )}

      {!report && !loading && (
        <Panel>
          <div className="text-center py-12 text-gray-500">
            <p>No report available. Click "Run Tool Matrix" to generate a report.</p>
          </div>
        </Panel>
      )}
    </div>
  );
}

