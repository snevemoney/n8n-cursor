-- Migration & Modernization Schema
-- Tracks code refactors, data migrations, and modernization tasks

-- Migration Jobs
CREATE TABLE IF NOT EXISTS migration_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    source_system TEXT NOT NULL, -- 'local' | 'kvm2' | 'legacy_n8n' | 'legacy_rag' | 'codebase' | etc.
    target_system TEXT NOT NULL, -- 'scorpion_cloud' | 'n8ncloud' | 'modernized' | etc.
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    config_json JSONB DEFAULT '{}'::jsonb, -- Details of what to migrate
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_migration_jobs_status ON migration_jobs (status);
CREATE INDEX IF NOT EXISTS idx_migration_jobs_source_system ON migration_jobs (source_system);
CREATE INDEX IF NOT EXISTS idx_migration_jobs_target_system ON migration_jobs (target_system);
CREATE INDEX IF NOT EXISTS idx_migration_jobs_created_at ON migration_jobs (created_at DESC);

-- Migration Tasks (individual steps within a job)
CREATE TABLE IF NOT EXISTS migration_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES migration_jobs(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('schema_refactor', 'data_migration', 'workflow_import', 'file_split', 'code_refactor')),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
    details_json JSONB DEFAULT '{}'::jsonb, -- Task-specific configuration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_migration_tasks_job_id ON migration_tasks (job_id);
CREATE INDEX IF NOT EXISTS idx_migration_tasks_kind ON migration_tasks (kind);
CREATE INDEX IF NOT EXISTS idx_migration_tasks_status ON migration_tasks (status);

-- Migration Runs (execution history for tasks)
CREATE TABLE IF NOT EXISTS migration_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES migration_tasks(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE,
    result TEXT NOT NULL CHECK (result IN ('success', 'error', 'skipped')),
    log TEXT, -- Execution log
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_migration_runs_task_id ON migration_runs (task_id);
CREATE INDEX IF NOT EXISTS idx_migration_runs_result ON migration_runs (result);
CREATE INDEX IF NOT EXISTS idx_migration_runs_started_at ON migration_runs (started_at DESC);

