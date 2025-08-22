-- Tenants table
create table if not exists tenants(
  id uuid primary key default gen_random_uuid(),
  name text not null
);

-- Example data table
create table if not exists projects(
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  name text not null,
  created_by uuid not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table projects enable row level security;

-- Auth helpers (Supabase)
create or replace function auth.uid() returns uuid
language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;

-- Policies: tenant isolation
create policy "tenant can read its projects"
  on projects for select using (tenant_id::text = current_setting('request.jwt.claim.tenant_id', true));

create policy "tenant can insert"
  on projects for insert with check (tenant_id::text = current_setting('request.jwt.claim.tenant_id', true));

create policy "tenant can update own"
  on projects for update using (tenant_id::text = current_setting('request.jwt.claim.tenant_id', true));

-- Optional audit
create extension if not exists pgaudit;
