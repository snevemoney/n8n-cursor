-- Channel Actions Audit Log Schema
-- Tracks all automated and manual Lightning channel operations

create table if not exists channel_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  channel_id text not null,
  peer_alias text,
  action_type text check (action_type in ('rebalance', 'fee_update', 'close', 'open', 'manual_rebalance')) not null,
  trigger_source text check (trigger_source in ('ai', 'manual', 'cron', 'threshold')) not null,
  
  -- Before state
  before_local_balance bigint,
  before_remote_balance bigint,
  before_fee_rate integer,
  before_base_fee integer,
  
  -- After state  
  after_local_balance bigint,
  after_remote_balance bigint,
  after_fee_rate integer,
  after_base_fee integer,
  
  -- Action details
  amount_sats bigint, -- for rebalances
  cost_sats integer, -- rebalance cost
  command_executed text, -- actual CLI command run
  result_output text, -- command output
  success boolean not null default false,
  error_message text,
  
  -- AI decision context
  ai_reasoning text, -- why AI made this decision
  confidence_score decimal(3,2), -- 0.00 to 1.00
  
  -- Metadata
  execution_time_ms integer,
  created_at timestamptz default timezone('utc', now()),
  completed_at timestamptz
);

-- Indexes for performance
create index if not exists idx_channel_actions_user_time on channel_actions (user_id, created_at desc);
create index if not exists idx_channel_actions_channel on channel_actions (channel_id, created_at desc);
create index if not exists idx_channel_actions_type on channel_actions (action_type, success);

-- Row Level Security
alter table channel_actions enable row level security;

create policy "Users can only access their own channel actions"
on channel_actions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- View for dashboard analytics
create or replace view view_channel_performance as
select
  user_id,
  channel_id,
  peer_alias,
  count(*) as total_actions,
  count(*) filter (where success = true) as successful_actions,
  count(*) filter (where action_type = 'rebalance') as rebalance_count,
  count(*) filter (where action_type = 'fee_update') as fee_update_count,
  sum(cost_sats) filter (where action_type = 'rebalance' and success = true) as total_rebalance_cost,
  avg(confidence_score) filter (where trigger_source = 'ai') as avg_ai_confidence,
  max(created_at) as last_action_at
from channel_actions
group by user_id, channel_id, peer_alias;

-- Function to automatically log channel state changes
create or replace function log_channel_action(
  p_user_id uuid,
  p_channel_id text,
  p_peer_alias text,
  p_action_type text,
  p_trigger_source text,
  p_command text,
  p_ai_reasoning text default null,
  p_confidence_score decimal default null
) returns uuid as $$
declare
  action_id uuid;
begin
  insert into channel_actions (
    user_id,
    channel_id, 
    peer_alias,
    action_type,
    trigger_source,
    command_executed,
    ai_reasoning,
    confidence_score
  ) values (
    p_user_id,
    p_channel_id,
    p_peer_alias, 
    p_action_type,
    p_trigger_source,
    p_command,
    p_ai_reasoning,
    p_confidence_score
  ) returning id into action_id;
  
  return action_id;
end;
$$ language plpgsql security definer; 