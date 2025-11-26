-- =============================================================================
-- SUPABASE DEPRECIATION RADAR SETUP
-- =============================================================================
-- 
-- This script sets up the depreciation radar views in your Supabase instance.
-- Run this in your Supabase SQL Editor to enable the radar dashboard.
--

-- 1. Create radar_snapshots table
CREATE TABLE IF NOT EXISTS radar_snapshots (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    depreciation_score INTEGER,
    stale_workflows_count INTEGER,
    credential_issues_count INTEGER,
    deadletters_backlog_count INTEGER,
    jobs_bloat_count INTEGER,
    stale_invoices_count INTEGER,
    memory_bloat_count INTEGER,
    tenant_throttle_hits_count INTEGER
);

-- 2. Create demo data views (you can customize these based on your actual data)
CREATE OR REPLACE VIEW v_stale_workflows AS
SELECT 
    'demo-workflow-1' as workflow_id,
    'Demo Workflow 1' as workflow_name,
    '2024-01-01'::date as last_run,
    'stale' as status
UNION ALL
SELECT 
    'demo-workflow-2' as workflow_id,
    'Demo Workflow 2' as workflow_name,
    '2024-01-15'::date as last_run,
    'stale' as status;

CREATE OR REPLACE VIEW v_credential_issues AS
SELECT 
    'demo-cred-1' as credential_id,
    'Demo Credential 1' as credential_name,
    'expired' as issue_type,
    '2024-01-01'::date as issue_date
UNION ALL
SELECT 
    'demo-cred-2' as credential_id,
    'Demo Credential 2' as credential_name,
    'invalid' as issue_type,
    '2024-01-10'::date as issue_date;

CREATE OR REPLACE VIEW v_deadletters_backlog AS
SELECT 
    'demo-deadletter-1' as deadletter_id,
    'Demo Dead Letter 1' as description,
    '2024-01-01'::date as created_at,
    'processing_error' as error_type
UNION ALL
SELECT 
    'demo-deadletter-2' as deadletter_id,
    'Demo Dead Letter 2' as description,
    '2024-01-05'::date as created_at,
    'timeout' as error_type;

CREATE OR REPLACE VIEW v_jobs_bloat AS
SELECT 
    'demo-job-1' as job_id,
    'Demo Job 1' as job_type,
    1000 as result_count,
    '2024-01-01'::date as last_cleanup
UNION ALL
SELECT 
    'demo-job-2' as job_id,
    'Demo Job 2' as job_type,
    2500 as result_count,
    '2024-01-10'::date as last_cleanup;

CREATE OR REPLACE VIEW v_invoices_stale AS
SELECT 
    'demo-invoice-1' as invoice_id,
    'Demo Invoice 1' as description,
    '2024-01-01'::date as created_at,
    'unpaid' as status
UNION ALL
SELECT 
    'demo-invoice-2' as invoice_id,
    'Demo Invoice 2' as description,
    '2024-01-05'::date as created_at,
    'expired' as status;

CREATE OR REPLACE VIEW v_memory_bloat AS
SELECT 
    'demo-table-1' as table_name,
    1000000 as row_count,
    500 as size_mb,
    '2024-01-01'::date as last_cleanup
UNION ALL
SELECT 
    'demo-table-2' as table_name,
    2500000 as row_count,
    1200 as size_mb,
    '2024-01-10'::date as last_cleanup;

CREATE OR REPLACE VIEW v_tenant_throttle_hit AS
SELECT 
    'demo-tenant-1' as tenant_id,
    'Demo Tenant 1' as tenant_name,
    150 as hourly_hits,
    1000 as daily_hits,
    '2024-01-01'::date as last_hit
UNION ALL
SELECT 
    'demo-tenant-2' as tenant_id,
    'Demo Tenant 2' as tenant_name,
    200 as hourly_hits,
    1500 as daily_hits,
    '2024-01-05'::date as last_hit;

-- 3. Create depreciation score view
CREATE OR REPLACE VIEW v_depreciation_score AS
SELECT 
    COALESCE(AVG(depreciation_score), 0) as current_score,
    COUNT(*) as snapshot_count,
    MAX(timestamp) as last_snapshot
FROM radar_snapshots;

-- 4. Insert initial demo snapshot
INSERT INTO radar_snapshots (
    depreciation_score,
    stale_workflows_count,
    credential_issues_count,
    deadletters_backlog_count,
    jobs_bloat_count,
    stale_invoices_count,
    memory_bloat_count,
    tenant_throttle_hits_count
) VALUES (75, 2, 2, 2, 2, 2, 2, 2);

-- 5. Display setup confirmation
SELECT 'Supabase Depreciation Radar Setup Complete!' as status;
SELECT 'Current Depreciation Score:' as metric, current_score FROM v_depreciation_score;
SELECT 'Stale Workflows:' as metric, COUNT(*) as count FROM v_stale_workflows;
SELECT 'Credential Issues:' as metric, COUNT(*) as count FROM v_credential_issues;
