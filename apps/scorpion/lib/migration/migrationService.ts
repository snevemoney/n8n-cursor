// Migration & Modernization Service
// Tracks and executes code refactors, data migrations, and modernization tasks

import { query } from '@/lib/db/client';
import { randomUUID } from 'crypto';
import type {
  MigrationJob,
  MigrationTask,
  MigrationTaskKind,
  MigrationStatus,
  TaskStatus,
  RunResult,
  FileSplitConfig,
} from './types';

export class MigrationService {
  /**
   * Create a migration job with tasks
   */
  async createJob(params: {
    name: string;
    description?: string;
    sourceSystem: string;
    targetSystem: string;
    tasks: Array<{
      kind: MigrationTaskKind;
      name: string;
      description?: string;
      details?: Record<string, unknown>;
    }>;
    config?: Record<string, unknown>;
  }): Promise<string> {
    const jobId = randomUUID();

    // Create job
    await query(
      `INSERT INTO migration_jobs (id, name, description, source_system, target_system, config_json)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        jobId,
        params.name,
        params.description || null,
        params.sourceSystem,
        params.targetSystem,
        JSON.stringify(params.config || {}),
      ]
    );

    // Create tasks
    for (const task of params.tasks) {
      await query(
        `INSERT INTO migration_tasks (id, job_id, kind, name, description, details_json)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          randomUUID(),
          jobId,
          task.kind,
          task.name,
          task.description || null,
          JSON.stringify(task.details || {}),
        ]
      );
    }

    return jobId;
  }

  /**
   * Run a migration job (execute all tasks sequentially)
   */
  async runJob(jobId: string, options?: { dryRun?: boolean }): Promise<void> {
    // Update job status
    await query(
      `UPDATE migration_jobs
       SET status = 'running', started_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [jobId]
    );

    // Load tasks
    const tasksResult = await query(
      `SELECT * FROM migration_tasks
       WHERE job_id = $1
       ORDER BY created_at ASC`,
      [jobId]
    );

    const tasks = tasksResult.rows;

    try {
      for (const task of tasks) {
        if (task.status === 'skipped') {
          continue;
        }

        await this.runTask(task.id, options);
      }

      // Mark job as completed
      await query(
        `UPDATE migration_jobs
         SET status = 'completed', completed_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [jobId]
      );
    } catch (error: any) {
      // Mark job as failed
      await query(
        `UPDATE migration_jobs
         SET status = 'failed', updated_at = NOW()
         WHERE id = $1`,
        [jobId]
      );
      throw error;
    }
  }

  /**
   * Run a single migration task
   */
  async runTask(taskId: string, options?: { dryRun?: boolean }): Promise<void> {
    const taskResult = await query(
      `SELECT * FROM migration_tasks WHERE id = $1`,
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      throw new Error(`Task ${taskId} not found`);
    }

    const task = taskResult.rows[0];
    const runId = randomUUID();

    // Create run record
    await query(
      `INSERT INTO migration_runs (id, task_id, result, log)
       VALUES ($1, $2, 'success', $3)`,
      [runId, taskId, `Starting ${task.kind} task: ${task.name}`]
    );

    // Update task status
    await query(
      `UPDATE migration_tasks
       SET status = 'running', started_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [taskId]
    );

    try {
      let log = `Executing ${task.kind}: ${task.name}\n`;

      // Dispatch based on task kind
      switch (task.kind) {
        case 'file_split':
          log += await this.runFileSplitTask(task, options);
          break;
        case 'schema_refactor':
          log += await this.runSchemaRefactorTask(task, options);
          break;
        case 'data_migration':
          log += await this.runDataMigrationTask(task, options);
          break;
        case 'workflow_import':
          log += await this.runWorkflowImportTask(task, options);
          break;
        case 'code_refactor':
          log += await this.runCodeRefactorTask(task, options);
          break;
        default:
          throw new Error(`Unknown task kind: ${task.kind}`);
      }

      // Update run with success
      await query(
        `UPDATE migration_runs
         SET finished_at = NOW(), result = 'success', log = $1
         WHERE id = $2`,
        [log, runId]
      );

      // Update task as completed
      await query(
        `UPDATE migration_tasks
         SET status = 'completed', completed_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [taskId]
      );
    } catch (error: any) {
      // Update run with error
      await query(
        `UPDATE migration_runs
         SET finished_at = NOW(), result = 'error', error_message = $1, log = $2
         WHERE id = $3`,
        [error.message, error.stack || '', runId]
      );

      // Update task as failed
      await query(
        `UPDATE migration_tasks
         SET status = 'failed', completed_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [taskId]
      );

      throw error;
    }
  }

  // Private task execution methods (Power of 10: keep small)

  private async runFileSplitTask(
    task: any,
    options?: { dryRun?: boolean }
  ): Promise<string> {
    const config = task.details_json as FileSplitConfig;
    let log = `File split task: ${config.sourceFile}\n`;

    if (options?.dryRun) {
      log += `[DRY RUN] Would split ${config.sourceFile} into ${config.targetFiles.length} files\n`;
      return log;
    }

    // For now, this is a placeholder
    // The actual file splitting is done manually/Cursor-assisted
    // This service tracks that it happened
    log += `File split completed (tracked in migration system)\n`;
    log += `Target files: ${config.targetFiles.map(f => f.path).join(', ')}\n`;

    return log;
  }

  private async runSchemaRefactorTask(
    task: any,
    options?: { dryRun?: boolean }
  ): Promise<string> {
    const details = task.details_json as Record<string, unknown>;
    let log = `Schema refactor: ${task.name}\n`;

    if (options?.dryRun) {
      log += `[DRY RUN] Would refactor schema: ${JSON.stringify(details)}\n`;
      return log;
    }

    // Placeholder for schema refactoring logic
    log += `Schema refactor completed\n`;

    return log;
  }

  private async runDataMigrationTask(
    task: any,
    options?: { dryRun?: boolean }
  ): Promise<string> {
    const details = task.details_json as Record<string, unknown>;
    let log = `Data migration: ${task.name}\n`;

    if (options?.dryRun) {
      log += `[DRY RUN] Would migrate data: ${JSON.stringify(details)}\n`;
      return log;
    }

    // Placeholder for data migration logic
    log += `Data migration completed\n`;

    return log;
  }

  private async runWorkflowImportTask(
    task: any,
    options?: { dryRun?: boolean }
  ): Promise<string> {
    const details = task.details_json as Record<string, unknown>;
    let log = `Workflow import: ${task.name}\n`;

    if (options?.dryRun) {
      log += `[DRY RUN] Would import workflow: ${JSON.stringify(details)}\n`;
      return log;
    }

    // Placeholder for workflow import logic
    log += `Workflow import completed\n`;

    return log;
  }

  private async runCodeRefactorTask(
    task: any,
    options?: { dryRun?: boolean }
  ): Promise<string> {
    const details = task.details_json as Record<string, unknown>;
    let log = `Code refactor: ${task.name}\n`;

    if (options?.dryRun) {
      log += `[DRY RUN] Would refactor code: ${JSON.stringify(details)}\n`;
      return log;
    }

    // Placeholder for code refactoring logic
    log += `Code refactor completed\n`;

    return log;
  }

  /**
   * Get migration job status
   */
  async getJobStatus(jobId: string): Promise<MigrationJob | null> {
    const result = await query(
      `SELECT * FROM migration_jobs WHERE id = $1`,
      [jobId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      sourceSystem: row.source_system,
      targetSystem: row.target_system,
      status: row.status,
      config: row.config_json,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      startedAt: row.started_at ? new Date(row.started_at) : undefined,
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    };
  }

  /**
   * List all migration jobs
   */
  async listJobs(): Promise<MigrationJob[]> {
    const result = await query(
      `SELECT * FROM migration_jobs ORDER BY created_at DESC`
    );

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      sourceSystem: row.source_system,
      targetSystem: row.target_system,
      status: row.status,
      config: row.config_json,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      startedAt: row.started_at ? new Date(row.started_at) : undefined,
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    }));
  }
}

// Singleton instance
let migrationServiceInstance: MigrationService | null = null;

export function getMigrationService(): MigrationService {
  if (!migrationServiceInstance) {
    migrationServiceInstance = new MigrationService();
  }
  return migrationServiceInstance;
}

