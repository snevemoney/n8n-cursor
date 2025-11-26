-- Real-Time Channel Monitoring Schema
-- Tracks live channel states, capacity changes, and generates alerts

create table if not exists live_channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  channel_id text not null unique,
  peer_pubkey text not null,
  peer_alias text,
  
  -- Current state
  local_balance bigint not null,
  remote_balance bigint not null,
  capacity bigint not null,
  active boolean default true,
  
  -- Calculated metrics
  local_ratio decimal(5,4) generated always as (local_balance::decimal / nullif(capacity, 0)) stored,
  balance_score text generated always as (
    case 
      when (local_balance::decimal / nullif(capacity, 0)) between 0.3 and 0.7 then 'balanced'
      when (local_balance::decimal / nullif(capacity, 0)) < 0.2 then 'low_local'
      when (local_balance::decimal / nullif(capacity, 0)) > 0.8 then 'high_local'
      else 'moderate'
    end
  ) stored,
  
  -- Fee settings
  base_fee_msat bigint default 1000,
  fee_rate_ppm integer default 1000,
  
  -- Monitoring metadata
  last_forward_at timestamptz,
  last_update_at timestamptz default timezone('utc', now()),
  created_at timestamptz default timezone('utc', now()),
  
  -- Constraints
  constraint valid_balances check (local_balance >= 0 and remote_balance >= 0),
  constraint valid_capacity check (capacity = local_balance + remote_balance)
);

-- Channel alerts and warnings
create table if not exists channel_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  channel_id text references live_channels(channel_id) on delete cascade,
  alert_type text check (alert_type in ('imbalance', 'inactive', 'fee_opportunity', 'capacity_change', 'peer_offline')) not null,
  severity text check (severity in ('info', 'warning', 'critical')) not null default 'info',
  
  -- Alert details
  title text not null,
  message text not null,
  recommended_action text,
  
  -- State tracking
  acknowledged boolean default false,
  resolved boolean default false,
  
  -- Metadata
  triggered_at timestamptz default timezone('utc', now()),
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  
  -- Alert data (JSON for flexibility)
  alert_data jsonb
);

-- Channel capacity history for trending
create table if not exists channel_capacity_history (
  id uuid primary key default gen_random_uuid(),
  channel_id text not null,
  local_balance bigint not null,
  remote_balance bigint not null,
  capacity bigint not null,
  recorded_at timestamptz default timezone('utc', now()),
  
  -- Daily partitioning for performance
  constraint valid_recorded_at check (recorded_at >= '2024-01-01'::timestamptz)
) partition by range (recorded_at);

-- Create partitions for current and next month
create table channel_capacity_history_2024_12 partition of channel_capacity_history
  for values from ('2024-12-01') to ('2025-01-01');

create table channel_capacity_history_2025_01 partition of channel_capacity_history
  for values from ('2025-01-01') to ('2025-02-01');

-- Indexes for performance
create index if not exists idx_live_channels_user on live_channels (user_id);
create index if not exists idx_live_channels_balance_score on live_channels (balance_score) where active = true;
create index if not exists idx_live_channels_last_forward on live_channels (last_forward_at) where active = true;

create index if not exists idx_channel_alerts_user_unresolved on channel_alerts (user_id, triggered_at desc) 
  where resolved = false;
create index if not exists idx_channel_alerts_type_severity on channel_alerts (alert_type, severity);

create index if not exists idx_capacity_history_channel_time on channel_capacity_history (channel_id, recorded_at desc);

-- Row Level Security
alter table live_channels enable row level security;
alter table channel_alerts enable row level security;
alter table channel_capacity_history enable row level security;

create policy "Users can only access their own channels"
on live_channels for all using (auth.uid() = user_id);

create policy "Users can only access their own alerts"
on channel_alerts for all using (auth.uid() = user_id);

create policy "Users can only access their own capacity history"
on channel_capacity_history for all using (
  exists (
    select 1 from live_channels 
    where live_channels.channel_id = channel_capacity_history.channel_id 
    and live_channels.user_id = auth.uid()
  )
);

-- Views for dashboard analytics
create or replace view view_channel_health_summary as
select
  user_id,
  count(*) as total_channels,
  count(*) filter (where active = true) as active_channels,
  count(*) filter (where balance_score = 'balanced') as balanced_channels,
  count(*) filter (where balance_score in ('low_local', 'high_local')) as imbalanced_channels,
  count(*) filter (where last_forward_at < now() - interval '24 hours') as inactive_channels,
  sum(capacity) as total_capacity,
  sum(local_balance) as total_local_balance,
  avg(local_ratio) as avg_local_ratio
from live_channels
group by user_id;

-- View for urgent alerts needing attention
create or replace view view_urgent_alerts as
select
  ca.*,
  lc.peer_alias,
  lc.capacity,
  lc.local_ratio
from channel_alerts ca
join live_channels lc on ca.channel_id = lc.channel_id
where ca.resolved = false 
  and ca.severity in ('warning', 'critical')
order by ca.triggered_at desc;

-- Function to create alerts automatically
create or replace function create_channel_alert(
  p_user_id uuid,
  p_channel_id text,
  p_alert_type text,
  p_severity text,
  p_title text,
  p_message text,
  p_recommended_action text default null,
  p_alert_data jsonb default null
) returns uuid as $$
declare
  alert_id uuid;
begin
  -- Check if similar alert already exists (avoid spam)
  if exists (
    select 1 from channel_alerts 
    where channel_id = p_channel_id 
      and alert_type = p_alert_type 
      and resolved = false
      and triggered_at > now() - interval '1 hour'
  ) then
    return null; -- Don't create duplicate alerts within 1 hour
  end if;
  
  insert into channel_alerts (
    user_id,
    channel_id,
    alert_type,
    severity,
    title,
    message,
    recommended_action,
    alert_data
  ) values (
    p_user_id,
    p_channel_id,
    p_alert_type,
    p_severity,
    p_title,
    p_message,
    p_recommended_action,
    p_alert_data
  ) returning id into alert_id;
  
  return alert_id;
end;
$$ language plpgsql security definer;

-- Trigger to create alerts on channel state changes
create or replace function trigger_channel_alerts() returns trigger as $$
begin
  -- Imbalance alert
  if new.balance_score in ('low_local', 'high_local') and 
     (old.balance_score is null or old.balance_score not in ('low_local', 'high_local')) then
    perform create_channel_alert(
      new.user_id,
      new.channel_id,
      'imbalance',
      'warning',
      'Channel Imbalanced',
      format('Channel %s is %s (%.1f%% local)', new.peer_alias, new.balance_score, new.local_ratio * 100),
      'Consider rebalancing this channel',
      jsonb_build_object('local_ratio', new.local_ratio, 'balance_score', new.balance_score)
    );
  end if;
  
  -- Inactive channel alert
  if new.last_forward_at < now() - interval '48 hours' and 
     new.active = true and 
     (old.last_forward_at is null or old.last_forward_at >= now() - interval '48 hours') then
    perform create_channel_alert(
      new.user_id,
      new.channel_id,
      'inactive',
      'info',
      'Channel Inactive',
      format('Channel %s has not forwarded payments in 48+ hours', new.peer_alias),
      'Check peer connectivity or consider fee adjustments',
      jsonb_build_object('hours_inactive', extract(epoch from (now() - new.last_forward_at)) / 3600)
    );
  end if;
  
  return new;
end;
$$ language plpgsql;

create trigger trigger_channel_alerts_on_update
  after update on live_channels
  for each row
  execute procedure trigger_channel_alerts();

-- Function to record capacity history (call from monitoring cron)
create or replace function record_channel_capacity_snapshot() returns void as $$
begin
  insert into channel_capacity_history (channel_id, local_balance, remote_balance, capacity)
  select channel_id, local_balance, remote_balance, capacity
  from live_channels
  where active = true;
end;
$$ language plpgsql; 