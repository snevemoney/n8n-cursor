-- LightningFlow AI Depreciation Radar
-- Run this on your Supabase/Postgres to create monitoring views

-- Snapshot table for time-series tracking
create table if not exists radar_snapshots(
  id uuid primary key default gen_random_uuid(),
  taken_at timestamptz default now(),
  env text,
  stale_workflows int,
  credential_issues int,
  deadletters int,
  jobs_old int,
  results_old int,
  invoices_stale int,
  memory_bloat int
);

-- Workflows not executed recently (disabled or forgotten)
create or replace view v_stale_workflows as
select 
  w.id, 
  w.name, 
  w.active, 
  coalesce(max(e.started_at), timestamp '1970-01-01') as last_run_at,
  now() - coalesce(max(e.started_at), timestamp '1970-01-01') as age,
  case 
    when w.active = true then 'active_stale'
    else 'inactive_stale'
  end as status
from workflows w
left join executions e on e.workflow_id = w.id
group by w.id, w.name, w.active
having now() - coalesce(max(e.started_at), timestamp '1970-01-01') > interval '14 days';

-- Credentials drifting (duplicate names, never used, or near expiry)
create or replace view v_credential_issues as
with base as (
  select 
    c.id, 
    c.name, 
    c.type, 
    c.updated_at,
    now() - c.updated_at as age,
    (select count(*) from executions e
       join execution_nodes n on n.execution_id = e.id
       where n.credential_name = c.name
       and e.started_at > now() - interval '30 days') as uses_30d
  from credentials c
)
select 
  *,
  case 
    when uses_30d = 0 then 'unused_30d'
    when age > interval '90 days' then 'old_credential'
    else 'duplicate_name'
  end as issue_type
from base
where uses_30d = 0
   or age > interval '90 days'
   or name in (select name from credentials group by name having count(*) > 1);

-- Dead letters piling up
create or replace view v_deadletters_backlog as
select 
  env, 
  count(*) as dl_count, 
  min(created_at) as oldest, 
  now() - min(created_at) as oldest_age,
  case 
    when count(*) > 100 then 'critical'
    when count(*) > 50 then 'warning'
    when count(*) > 0 then 'info'
    else 'ok'
  end as severity
from dead_letters
group by env
having count(*) > 0;

-- Jobs & job_results bloat
create or replace view v_jobs_bloat as
select
  (select count(*) from jobs where created_at < now() - interval '30 days') as old_jobs,
  (select count(*) from job_results where created_at < now() - interval '30 days') as old_results,
  case 
    when (select count(*) from jobs where created_at < now() - interval '30 days') > 1000 then 'critical'
    when (select count(*) from jobs where created_at < now() - interval '30 days') > 500 then 'warning'
    else 'ok'
  end as severity;

-- Lightning: unpaid/expired invoices lingering
create or replace view v_invoices_stale as
select 
  id, 
  ext_id, 
  status, 
  created_at, 
  now() - created_at as age,
  case 
    when status = 'pending' and now() - created_at > interval '7 days' then 'expired_pending'
    when status = 'expired' then 'expired_status'
    else 'other'
  end as issue_type
from invoices
where status in ('pending','expired')
  and created_at < now() - interval '7 days';

-- Memory growth without pruning
create or replace view v_memory_bloat as
select 
  count(*) as entries_90d_plus,
  case 
    when count(*) > 1000 then 'critical'
    when count(*) > 500 then 'warning'
    else 'ok'
  end as severity
from agent_memory
where created_at < now() - interval '90 days';

-- Side-hustle specific: tenant throttling issues
create or replace view v_tenant_throttle_hit as
select 
  t.name as tenant_name,
  t.api_key,
  t.rate_per_min,
  count(dl.id) as throttle_violations_7d,
  case 
    when count(dl.id) > 10 then 'critical'
    when count(dl.id) > 5 then 'warning'
    else 'info'
  end as severity
from tenants t
left join dead_letters dl on dl.workflow = 'sidehustle-router' 
  and dl.payload->>'tenant_id' = t.id::text
  and dl.created_at > now() - interval '7 days'
group by t.id, t.name, t.api_key, t.rate_per_min
having count(dl.id) > 0;

-- Overall depreciation score (0-100, higher = more stale)
create or replace view v_depreciation_score as
select 
  (select count(*) from v_stale_workflows) as stale_workflows,
  (select count(*) from v_credential_issues) as credential_issues,
  (select coalesce(sum(dl_count), 0) from v_deadletters_backlog) as total_deadletters,
  (select old_jobs from v_jobs_bloat) as old_jobs,
  (select entries_90d_plus from v_memory_bloat) as old_memory,
  (select count(*) from v_invoices_stale) as stale_invoices,
  case 
    when (select count(*) from v_stale_workflows) > 10 then 25
    when (select count(*) from v_stale_workflows) > 5 then 15
    when (select count(*) from v_stale_workflows) > 0 then 5
    else 0
  end +
  case 
    when (select count(*) from v_credential_issues) > 5 then 25
    when (select count(*) from v_credential_issues) > 2 then 15
    when (select count(*) from v_credential_issues) > 0 then 10
    else 0
  end +
  case 
    when (select coalesce(sum(dl_count), 0) from v_deadletters_backlog) > 100 then 25
    when (select coalesce(sum(dl_count), 0) from v_deadletters_backlog) > 50 then 15
    when (select coalesce(sum(dl_count), 0) from v_deadletters_backlog) > 10 then 10
    else 0
  end +
  case 
    when (select old_jobs from v_jobs_bloat) > 1000 then 15
    when (select old_jobs from v_jobs_bloat) > 500 then 10
    when (select old_jobs from v_jobs_bloat) > 100 then 5
    else 0
  end +
  case 
    when (select entries_90d_plus from v_memory_bloat) > 1000 then 10
    when (select entries_90d_plus from v_memory_bloat) > 500 then 5
    else 0
  end as depreciation_score;

-- Indexes for performance
create index if not exists idx_radar_snapshots_taken_at on radar_snapshots(taken_at);
create index if not exists idx_radar_snapshots_env on radar_snapshots(env);
create index if not exists idx_dead_letters_created_at on dead_letters(created_at);
create index if not exists idx_jobs_created_at on jobs(created_at);
create index if not exists idx_job_results_created_at on job_results(created_at);
create index if not exists idx_invoices_created_at on invoices(created_at);
create index if not exists idx_agent_memory_created_at on agent_memory(created_at);
