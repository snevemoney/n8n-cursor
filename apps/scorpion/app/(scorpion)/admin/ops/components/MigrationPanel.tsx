'use client';

/**
 * Migration Panel Component
 * Power of 10 Rule 3: Focused component for migration operations
 */

import { useState, useEffect } from 'react';
import { Panel, Metric, Button, Badge, useToast, LoadingState, EmptyState, Modal } from '@/components/scorpion';
import { Database, AlertCircle, Eye } from 'lucide-react';
import { DatabaseSetupBanner } from './DatabaseSetupBanner';

interface MigrationJob {
  id: string;
  name: string;
  description: string | null;
  sourceSystem: string;
  targetSystem: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

interface MigrationTask {
  id: string;
  kind: string;
  name: string;
  description: string | null;
  status: string;
  details: any;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  runs: MigrationRun[];
}

interface MigrationRun {
  id: string;
  started_at: string;
  finished_at: string | null;
  result: 'success' | 'error';
  log: string;
  error_message?: string;
}

interface JobDetails {
  job: MigrationJob;
  tasks: MigrationTask[];
}

export function MigrationPanel() {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<MigrationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [runningJobId, setRunningJobId] = useState<string | null>(null);
  const [databaseError, setDatabaseError] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/migration/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.data?.jobs || data.jobs || []);
      } else if (response.status === 500) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error?.message?.includes('does not exist')) {
          setDatabaseError(true);
          showToast('info', 'Database tables not created yet. Run: pnpm tsx scripts/migrate-cost-tracking.ts');
        }
      }
    } catch (error) {
      console.error('Failed to load migration jobs:', error);
      showToast('error', 'Failed to load migration jobs');
    } finally {
      setLoading(false);
    }
  };

  const loadJobDetails = async (jobId: string) => {
    setLoadingDetails(true);
    try {
      const response = await fetch(`/api/migration/jobs/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJobDetails(data.data || data);
      } else {
        throw new Error('Failed to load job details');
      }
    } catch (error) {
      showToast('error', 'Failed to load job details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewDetails = async (jobId: string) => {
    setSelectedJobId(jobId);
    await loadJobDetails(jobId);
  };

  const handleRunJob = async (jobId: string, dryRun: boolean) => {
    setRunningJobId(jobId);
    try {
      const response = await fetch(`/api/migration/jobs/${jobId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun }),
      });

      if (response.ok) {
        showToast(
          'success',
          dryRun ? 'Migration job dry-run completed' : 'Migration job completed'
        );
        await loadJobs();
        if (selectedJobId === jobId) {
          await loadJobDetails(jobId);
        }
      } else {
        throw new Error('Failed to run job');
      }
    } catch (error) {
      showToast('error', 'Failed to run migration job');
    } finally {
      setRunningJobId(null);
    }
  };

  const stats = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'pending').length,
    running: jobs.filter(j => j.status === 'running').length,
    failed: jobs.filter(j => j.status === 'failed').length,
    completed: jobs.filter(j => j.status === 'completed').length,
  };

  if (loading && jobs.length === 0) {
    return <LoadingState text="Loading migration jobs..." skeletonLines={5} />;
  }

  return (
    <div className="space-y-6">
      {databaseError && <DatabaseSetupBanner />}
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Metric
          label="Total Jobs"
          value={stats.total.toString()}
        />
        <Metric
          label="Pending"
          value={stats.pending.toString()}
          valueColor="text-yellow-400"
        />
        <Metric
          label="Running"
          value={stats.running.toString()}
          valueColor="text-blue-400"
        />
        <Metric
          label="Failed"
          value={stats.failed.toString()}
          valueColor="text-red-400"
        />
        <Metric
          label="Completed"
          value={stats.completed.toString()}
          valueColor="text-emerald-400"
        />
      </div>

      {/* Jobs Table */}
      <Panel title="Migration Jobs">
        {jobs.length === 0 ? (
          <EmptyState
            icon={Database}
            title="No migration jobs"
            message="Create a migration job to track modernization efforts"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-xs text-white/60 font-medium py-2 px-3">Job Name</th>
                  <th className="text-xs text-white/60 font-medium py-2 px-3">Source → Target</th>
                  <th className="text-xs text-white/60 font-medium py-2 px-3">Status</th>
                  <th className="text-xs text-white/60 font-medium py-2 px-3">Created</th>
                  <th className="text-xs text-white/60 font-medium py-2 px-3">Last Run</th>
                  <th className="text-xs text-white/60 font-medium py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-3">
                      <div className="text-sm text-white">{job.name}</div>
                      {job.description && (
                        <div className="text-xs text-white/50 mt-1">{job.description}</div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-xs text-white/70">
                      {job.sourceSystem} → {job.targetSystem}
                    </td>
                    <td className="py-2 px-3">
                      <Badge
                        variant={
                          job.status === 'completed' ? 'success' :
                          job.status === 'running' ? 'warning' :
                          job.status === 'failed' ? 'danger' :
                          'default'
                        }
                        size="sm"
                      >
                        {job.status}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-xs text-white/50">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 text-xs text-white/50">
                      {job.startedAt
                        ? new Date(job.startedAt).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewDetails(job.id)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleRunJob(job.id, true)}
                          disabled={runningJobId === job.id}
                        >
                          Dry Run
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleRunJob(job.id, false)}
                          disabled={runningJobId === job.id}
                        >
                          Run
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Job Details Modal */}
      {selectedJobId && (
        <Modal
          open={!!selectedJobId}
          onClose={() => {
            setSelectedJobId(null);
            setJobDetails(null);
          }}
          title={`Migration Job: ${jobDetails?.job.name || selectedJobId}`}
          size="lg"
        >
          {loadingDetails ? (
            <LoadingState text="Loading job details..." skeletonLines={3} />
          ) : jobDetails ? (
            <div className="space-y-6">
              {/* Job Meta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-white/60 mb-1">Source System</div>
                  <div className="text-sm text-white">{jobDetails.job.sourceSystem}</div>
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-1">Target System</div>
                  <div className="text-sm text-white">{jobDetails.job.targetSystem}</div>
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-1">Status</div>
                  <Badge
                    variant={
                      jobDetails.job.status === 'completed' ? 'success' :
                      jobDetails.job.status === 'running' ? 'warning' :
                      jobDetails.job.status === 'failed' ? 'danger' :
                      'default'
                    }
                    size="sm"
                  >
                    {jobDetails.job.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-1">Created</div>
                  <div className="text-sm text-white">
                    {new Date(jobDetails.job.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Tasks List */}
              <div>
                <div className="text-sm font-medium text-white mb-3">Tasks</div>
                <div className="space-y-2">
                  {jobDetails.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="border border-white/10 rounded p-3 bg-white/5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-sm text-white">{task.name}</div>
                          <div className="text-xs text-white/50 mt-1">
                            {task.kind} • {task.status}
                          </div>
                        </div>
                        <Badge
                          variant={
                            task.status === 'completed' ? 'success' :
                            task.status === 'running' ? 'warning' :
                            task.status === 'failed' ? 'danger' :
                            'default'
                          }
                          size="sm"
                        >
                          {task.status}
                        </Badge>
                      </div>

                      {/* Runs List */}
                      {task.runs.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="text-xs text-white/60 mb-2">Runs</div>
                          <div className="space-y-2">
                            {task.runs.map((run) => (
                              <div
                                key={run.id}
                                className="text-xs bg-black/30 rounded p-2"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-white/70">
                                    {new Date(run.started_at).toLocaleString()}
                                  </span>
                                  <Badge
                                    variant={run.result === 'success' ? 'success' : 'danger'}
                                    size="sm"
                                  >
                                    {run.result}
                                  </Badge>
                                </div>
                                {run.log && (
                                  <div className="text-white/50 font-mono text-[10px] mt-1 whitespace-pre-wrap">
                                    {run.log.substring(0, 200)}
                                    {run.log.length > 200 ? '...' : ''}
                                  </div>
                                )}
                                {run.error_message && (
                                  <div className="text-red-400 text-[10px] mt-1">
                                    {run.error_message}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-white/10">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleRunJob(selectedJobId, true)}
                  disabled={runningJobId === selectedJobId}
                >
                  Run Job (Dry Run)
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleRunJob(selectedJobId, false)}
                  disabled={runningJobId === selectedJobId}
                >
                  Run Job
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={AlertCircle}
              title="Failed to load job details"
              message="Please try again"
            />
          )}
        </Modal>
      )}
    </div>
  );
}

