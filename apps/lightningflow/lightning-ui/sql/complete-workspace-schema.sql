-- =============================================
-- COMPLETE WORKSPACE SCHEMA FOR LIGHTNING AI SAAS
-- =============================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- =============================================
-- CORE TABLES
-- =============================================

-- Workspaces table
create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  settings jsonb default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enhanced profiles table
alter table profiles add column if not exists workspace_id uuid references workspaces(id);
alter table profiles add column if not exists role text default 'viewer' check (role in ('owner', 'editor', 'viewer'));
alter table profiles add column if not exists last_active_workspace_id uuid references workspaces(id);
alter table profiles add column if not exists is_admin boolean default false;
alter table profiles add column if not exists is_bot boolean default false;

-- Workspace invites table
create table if not exists workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  email text not null,
  role text default 'viewer' check (role in ('owner', 'editor', 'viewer')),
  token text generated always as (encode(sha256((email || workspace_id::text)::bytea), 'hex')) stored,
  created_at timestamp with time zone default now(),
  accepted boolean default false,
  unique(email, workspace_id)
);

-- Workspace usage tracking
create table if not exists workspace_usage (
  workspace_id uuid primary key references workspaces(id) on delete cascade,
  used_tokens integer default 0,
  used_api_calls integer default 0,
  used_storage_mb integer default 0,
  last_reset timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Invoices table (workspace-scoped)
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  amount_sats integer not null,
  memo text,
  payment_hash text,
  payment_request text,
  status text default 'pending' check (status in ('pending', 'paid', 'expired', 'cancelled')),
  created_at timestamp with time zone default now(),
  paid_at timestamp with time zone
);

-- AI assistants table (workspace-scoped)
create table if not exists ai_assistants (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  name text not null,
  description text,
  openai_assistant_id text,
  prompt_template text,
  settings jsonb default '{}',
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Usage logs table (workspace-scoped)
create table if not exists usage_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  action text not null,
  resource_type text,
  resource_id text,
  tokens_used integer default 0,
  cost_sats integer default 0,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Bot test results table (admin-scoped)
create table if not exists bot_test_results (
  id uuid primary key default gen_random_uuid(),
  test_name text not null,
  status text not null check (status in ('running', 'passed', 'failed', 'error')),
  duration_ms integer,
  error_message text,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Admin event log table
create table if not exists admin_event_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id) on delete cascade not null,
  action text not null,
  target_type text,
  target_id text,
  details jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to increment workspace usage
create or replace function increment_workspace_usage(workspace_id uuid, token_count integer)
returns void as $$
begin
  insert into workspace_usage (workspace_id, used_tokens)
  values (workspace_id, token_count)
  on conflict (workspace_id)
  do update set used_tokens = workspace_usage.used_tokens + token_count;
end;
$$ language plpgsql;

-- Function to delete workspace with cascade
create or replace function delete_workspace_cascade(workspace_id uuid)
returns void as $$
begin
  -- Delete all related data
  delete from usage_logs where workspace_id = delete_workspace_cascade.workspace_id;
  delete from ai_assistants where workspace_id = delete_workspace_cascade.workspace_id;
  delete from invoices where workspace_id = delete_workspace_cascade.workspace_id;
  delete from workspace_usage where workspace_id = delete_workspace_cascade.workspace_id;
  delete from workspace_invites where workspace_id = delete_workspace_cascade.workspace_id;
  
  -- Remove users from workspace
  update profiles set workspace_id = null, role = 'viewer' 
  where workspace_id = delete_workspace_cascade.workspace_id;
  
  -- Finally delete the workspace
  delete from workspaces where id = delete_workspace_cascade.workspace_id;
end;
$$ language plpgsql;

-- Function to handle new user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  -- Create profile for new user
  insert into profiles (id, email, workspace_id, role)
  values (new.id, new.email, null, 'viewer')
  on conflict (id) do nothing;
  
  return new;
end;
$$ language plpgsql;

-- Trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
alter table workspaces enable row level security;
alter table profiles enable row level security;
alter table workspace_invites enable row level security;
alter table workspace_usage enable row level security;
alter table invoices enable row level security;
alter table ai_assistants enable row level security;
alter table usage_logs enable row level security;
alter table bot_test_results enable row level security;
alter table admin_event_log enable row level security;

-- Workspaces policies
create policy "Users can view their workspace" on workspaces
  for select using (
    id = (select workspace_id from profiles where id = auth.uid())
  );

create policy "Owners can update their workspace" on workspaces
  for update using (
    id = (select workspace_id from profiles where id = auth.uid() and role = 'owner')
  );

create policy "Owners can delete their workspace" on workspaces
  for delete using (
    id = (select workspace_id from profiles where id = auth.uid() and role = 'owner')
  );

-- Profiles policies
create policy "Users can view profiles in their workspace" on profiles
  for select using (
    workspace_id = (select workspace_id from profiles where id = auth.uid())
    or id = auth.uid()
  );

create policy "Users can update their own profile" on profiles
  for update using (id = auth.uid());

create policy "Owners and editors can update member roles" on profiles
  for update using (
    workspace_id = (select workspace_id from profiles where id = auth.uid() and role in ('owner', 'editor'))
  );

-- Workspace invites policies
create policy "Members can view invites for their workspace" on workspace_invites
  for select using (
    workspace_id = (select workspace_id from profiles where id = auth.uid())
  );

create policy "Owners and editors can manage invites" on workspace_invites
  for all using (
    workspace_id = (select workspace_id from profiles where id = auth.uid() and role in ('owner', 'editor'))
  );

-- Workspace usage policies
create policy "Members can view their workspace usage" on workspace_usage
  for select using (
    workspace_id = (select workspace_id from profiles where id = auth.uid())
  );

create policy "System can update workspace usage" on workspace_usage
  for all using (true);

-- Invoices policies
create policy "Members can view invoices in their workspace" on invoices
  for select using (
    workspace_id = (select workspace_id from profiles where id = auth.uid())
  );

create policy "Owners and editors can manage invoices" on invoices
  for all using (
    workspace_id = (select workspace_id from profiles where id = auth.uid() and role in ('owner', 'editor'))
  );

-- AI assistants policies
create policy "Members can view assistants in their workspace" on ai_assistants
  for select using (
    workspace_id = (select workspace_id from profiles where id = auth.uid())
  );

create policy "Owners and editors can manage assistants" on ai_assistants
  for all using (
    workspace_id = (select workspace_id from profiles where id = auth.uid() and role in ('owner', 'editor'))
  );

-- Usage logs policies
create policy "Members can view usage logs in their workspace" on usage_logs
  for select using (
    workspace_id = (select workspace_id from profiles where id = auth.uid())
  );

create policy "System can insert usage logs" on usage_logs
  for insert with check (true);

-- Bot test results policies (admin only)
create policy "Only admins can view bot test results" on bot_test_results
  for select using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Only admins can manage bot test results" on bot_test_results
  for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- Admin event log policies (admin only)
create policy "Only admins can view admin event log" on admin_event_log
  for select using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Only admins can insert admin events" on admin_event_log
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

create index if not exists idx_profiles_workspace_id on profiles(workspace_id);
create index if not exists idx_profiles_role on profiles(role);
create index if not exists idx_workspace_invites_email on workspace_invites(email);
create index if not exists idx_workspace_invites_token on workspace_invites(token);
create index if not exists idx_invoices_workspace_id on invoices(workspace_id);
create index if not exists idx_invoices_status on invoices(status);
create index if not exists idx_usage_logs_workspace_id on usage_logs(workspace_id);
create index if not exists idx_usage_logs_created_at on usage_logs(created_at);
create index if not exists idx_ai_assistants_workspace_id on ai_assistants(workspace_id);

-- =============================================
-- SAMPLE DATA (OPTIONAL)
-- =============================================

-- Insert default workspace
insert into workspaces (id, name, slug, description) 
values (
  '00000000-0000-0000-0000-000000000000',
  'Default Workspace',
  'default',
  'Default workspace for new users'
) on conflict (id) do nothing;

-- =============================================
-- ENVIRONMENT VARIABLES NEEDED
-- =============================================

/*
Required environment variables:

# OpenAI Keys (workspace-specific or default)
OPENAI_KEY_DEFAULT=your-default-openai-key
OPENAI_KEY_[workspace-id]=workspace-specific-key

# LNbits Keys (workspace-specific or default)
LNBITS_KEY_DEFAULT=your-default-lnbits-key
LNBITS_KEY_[workspace-id]=workspace-specific-key
LNBITS_URL=https://legend.lnbits.com

# Admin Configuration
NEXT_PUBLIC_ADMIN_UID=your-admin-user-id
ADMIN_BYPASS=true  # for development only

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourapp.com
*/ 