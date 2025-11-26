-- Automatic Partition Maintenance for channel_capacity_history
-- This prevents the database from breaking when hardcoded partition dates expire

-- Function to create next month's partition
create or replace function create_next_month_partition() returns void as $$
declare
  next_month_start date;
  next_month_end date;
  partition_name text;
  sql_statement text;
begin
  -- Calculate next month's dates
  next_month_start := date_trunc('month', current_date + interval '1 month');
  next_month_end := date_trunc('month', current_date + interval '2 months');
  
  -- Generate partition name
  partition_name := 'channel_capacity_history_' || to_char(next_month_start, 'YYYY_MM');
  
  -- Check if partition already exists
  if not exists (
    select 1 from pg_class 
    where relname = partition_name
  ) then
    -- Create the partition
    sql_statement := format(
      'create table %I partition of channel_capacity_history for values from (%L) to (%L)',
      partition_name,
      next_month_start,
      next_month_end
    );
    
    execute sql_statement;
    
    raise notice 'Created partition: %', partition_name;
  end if;
end;
$$ language plpgsql;

-- Function to drop old partitions (keep last 6 months)
create or replace function cleanup_old_partitions() returns void as $$
declare
  cutoff_date date;
  partition_record record;
  sql_statement text;
begin
  -- Keep data for last 6 months
  cutoff_date := date_trunc('month', current_date - interval '6 months');
  
  -- Find partitions older than cutoff
  for partition_record in
    select schemaname, tablename 
    from pg_tables 
    where tablename like 'channel_capacity_history_%'
      and tablename ~ '^\w+_\d{4}_\d{2}$'
  loop
    -- Extract date from partition name
    declare
      partition_date date;
      date_part text;
    begin
      date_part := regexp_replace(partition_record.tablename, '^channel_capacity_history_', '');
      partition_date := to_date(date_part, 'YYYY_MM');
      
      if partition_date < cutoff_date then
        sql_statement := format('drop table if exists %I', partition_record.tablename);
        execute sql_statement;
        raise notice 'Dropped old partition: %', partition_record.tablename;
      end if;
    exception
      when others then
        raise notice 'Could not process partition: %, error: %', partition_record.tablename, sqlerrm;
    end;
  end loop;
end;
$$ language plpgsql;

-- Create initial partitions for next 3 months
do $$
declare
  i integer;
  month_offset integer;
  partition_start date;
  partition_end date;
  partition_name text;
  sql_statement text;
begin
  for i in 0..2 loop
    month_offset := i;
    partition_start := date_trunc('month', current_date + (month_offset || ' months')::interval);
    partition_end := date_trunc('month', current_date + ((month_offset + 1) || ' months')::interval);
    partition_name := 'channel_capacity_history_' || to_char(partition_start, 'YYYY_MM');
    
    -- Check if partition exists
    if not exists (select 1 from pg_class where relname = partition_name) then
      sql_statement := format(
        'create table %I partition of channel_capacity_history for values from (%L) to (%L)',
        partition_name,
        partition_start,
        partition_end
      );
      execute sql_statement;
      raise notice 'Created partition: %', partition_name;
    end if;
  end loop;
end;
$$;

-- Schedule monthly maintenance (requires pg_cron extension)
-- If pg_cron is not available, run these manually or via external cron
-- select cron.schedule('partition-maintenance', '0 1 1 * *', 'select create_next_month_partition(); select cleanup_old_partitions();'); 