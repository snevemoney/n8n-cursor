-- Create email_events table for tracking email campaign performance
create table if not exists public.email_events (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  type text not null check (type in ('open', 'click')),
  timestamp timestamptz default now(),
  created_at timestamptz default now()
);

-- Create indexes for performance
create index if not exists idx_email_events_workspace_id on public.email_events(workspace_id);
create index if not exists idx_email_events_type on public.email_events(type);
create index if not exists idx_email_events_timestamp on public.email_events(timestamp desc);
create index if not exists idx_email_events_email on public.email_events(email);

-- Enable RLS
alter table public.email_events enable row level security;

-- RLS policies for email_events
create policy "Admin can view all email events"
  on public.email_events for select
  using (
    exists (
      select 1 from public.workspace_members
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Admin can insert email events"
  on public.email_events for insert
  with check (
    exists (
      select 1 from public.workspace_members
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

-- Grant necessary permissions
grant select, insert on public.email_events to authenticated;
grant usage on sequence public.email_events_id_seq to authenticated; 