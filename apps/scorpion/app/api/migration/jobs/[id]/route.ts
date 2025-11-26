// Migration Job Details API

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';

/**
 * GET /api/migration/jobs/[id] - Get migration job details with tasks and runs
 */
export const GET = withErrorHandling(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const jobId = params.id;

  // Get job
  const jobResult = await query(
    'SELECT * FROM migration_jobs WHERE id = $1',
    [jobId]
  );

  if (jobResult.rows.length === 0) {
    return createErrorResponse(
      ApiErrorCode.NOT_FOUND,
      'Migration job not found',
      [],
      404
    );
  }

  const job = jobResult.rows[0];

  // Get tasks for this job
  const tasksResult = await query(
    'SELECT * FROM migration_tasks WHERE job_id = $1 ORDER BY created_at ASC',
    [jobId]
  );

  const tasks = tasksResult.rows;

  // Get runs for all tasks
  const taskIds = tasks.map(t => t.id);
  let runs: any[] = [];
  if (taskIds.length > 0) {
    const runsResult = await query(
      `SELECT * FROM migration_runs 
       WHERE task_id = ANY($1::uuid[])
       ORDER BY started_at DESC`,
      [taskIds]
    );
    runs = runsResult.rows;
  }

  // Group runs by task_id
  const runsByTask: Record<string, any[]> = {};
  for (const run of runs) {
    const taskId = run.task_id;
    if (taskId) {
      if (!runsByTask[taskId]) {
        runsByTask[taskId] = [];
      }
      runsByTask[taskId].push(run);
    }
  }

  return createSuccessResponse({
    job: {
      id: job.id,
      name: job.name,
      description: job.description,
      sourceSystem: job.source_system,
      targetSystem: job.target_system,
      status: job.status,
      config: job.config_json,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      startedAt: job.started_at,
      completedAt: job.completed_at,
    },
    tasks: tasks.map(task => ({
      id: task.id,
      kind: task.kind,
      name: task.name,
      description: task.description,
      status: task.status,
      details: task.details_json,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      startedAt: task.started_at,
      completedAt: task.completed_at,
      runs: runsByTask[task.id] || [],
    })),
  });
});

