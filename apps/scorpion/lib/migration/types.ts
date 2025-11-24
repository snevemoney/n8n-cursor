// Migration & Modernization Type Definitions

export type MigrationTaskKind =
  | 'schema_refactor'
  | 'data_migration'
  | 'workflow_import'
  | 'file_split'
  | 'code_refactor';

export type MigrationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export type RunResult = 'success' | 'error' | 'skipped';

export interface MigrationJob {
  id: string;
  name: string;
  description?: string;
  sourceSystem: string;
  targetSystem: string;
  status: MigrationStatus;
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface MigrationTask {
  id: string;
  jobId: string;
  kind: MigrationTaskKind;
  name: string;
  description?: string;
  status: TaskStatus;
  details: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface MigrationRun {
  id: string;
  taskId: string;
  startedAt: Date;
  finishedAt?: Date;
  result: RunResult;
  log?: string;
  errorMessage?: string;
  metadata: Record<string, unknown>;
}

export interface FileSplitConfig {
  sourceFile: string;
  targetFiles: Array<{
    path: string;
    description: string;
    maxLines?: number;
  }>;
  preserveImports?: boolean;
  extractHelpers?: boolean;
}

