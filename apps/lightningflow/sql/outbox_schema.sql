-- Outbox Pattern Database Schema
-- This ensures reliable event delivery from LFA to n8n

-- Outbox events table
CREATE TABLE IF NOT EXISTS outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data JSONB NOT NULL,
  source TEXT NOT NULL DEFAULT 'lfa',
  version TEXT NOT NULL DEFAULT '1',
  correlation_id UUID,
  user_id UUID,
  business_node_id UUID,
  
  -- Delivery tracking
  delivery_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (delivery_status IN ('pending', 'delivering', 'delivered', 'failed', 'dead_letter')),
  delivery_attempts INTEGER NOT NULL DEFAULT 0,
  last_delivery_error TEXT,
  delivered_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_outbox_events_status ON outbox_events(delivery_status);
CREATE INDEX IF NOT EXISTS idx_outbox_events_type ON outbox_events(type);
CREATE INDEX IF NOT EXISTS idx_outbox_events_user ON outbox_events(user_id);
CREATE INDEX IF NOT EXISTS idx_outbox_events_correlation ON outbox_events(correlation_id);
CREATE INDEX IF NOT EXISTS idx_outbox_events_created ON outbox_events(created_at);

-- Dead letter queue table
CREATE TABLE IF NOT EXISTS dead_letter_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_event_id UUID NOT NULL REFERENCES outbox_events(id),
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  failure_reason TEXT NOT NULL,
  failure_count INTEGER NOT NULL DEFAULT 1,
  last_failure_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Recovery tracking
  retry_after TIMESTAMPTZ,
  manual_review_required BOOLEAN DEFAULT FALSE,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT
);

-- Event delivery history table
CREATE TABLE IF NOT EXISTS event_delivery_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES outbox_events(id),
  delivery_attempt INTEGER NOT NULL,
  status TEXT NOT NULL,
  response_code INTEGER,
  response_body TEXT,
  error_message TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workflow execution tracking table
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id TEXT NOT NULL,
  workflow_name TEXT NOT NULL,
  execution_id TEXT NOT NULL,
  event_id UUID REFERENCES outbox_events(id),
  correlation_id UUID,
  user_id UUID,
  business_node_id UUID,
  
  -- Execution status
  status TEXT NOT NULL DEFAULT 'running' 
    CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  -- Results
  result_data JSONB,
  error_message TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Commands executed table (for idempotency)
CREATE TABLE IF NOT EXISTS executed_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key TEXT NOT NULL UNIQUE,
  command_action TEXT NOT NULL,
  command_payload JSONB NOT NULL,
  source TEXT NOT NULL,
  workflow_id TEXT,
  execution_id TEXT,
  correlation_id UUID,
  
  -- Execution results
  success BOOLEAN NOT NULL,
  result_data JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  
  -- Metadata
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

-- Indexes for commands
CREATE INDEX IF NOT EXISTS idx_executed_commands_key ON executed_commands(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_executed_commands_action ON executed_commands(command_action);
CREATE INDEX IF NOT EXISTS idx_executed_commands_workflow ON executed_commands(workflow_id);
CREATE INDEX IF NOT EXISTS idx_executed_commands_expires ON executed_commands(expires_at);

-- Cleanup function for expired commands
CREATE OR REPLACE FUNCTION cleanup_expired_commands()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM executed_commands 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to create outbox event
CREATE OR REPLACE FUNCTION create_outbox_event(
  p_type TEXT,
  p_data JSONB,
  p_correlation_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_business_node_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO outbox_events (
    type, 
    data, 
    correlation_id, 
    user_id, 
    business_node_id
  ) VALUES (
    p_type, 
    p_data, 
    p_correlation_id, 
    p_user_id, 
    p_business_node_id
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark event as delivered
CREATE OR REPLACE FUNCTION mark_event_delivered(
  p_event_id UUID,
  p_workflow_id TEXT DEFAULT NULL,
  p_execution_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE outbox_events 
  SET 
    delivery_status = 'delivered',
    delivered_at = NOW(),
    updated_at = NOW()
  WHERE id = p_event_id;
  
  -- Record delivery history
  INSERT INTO event_delivery_history (
    event_id, 
    delivery_attempt, 
    status, 
    delivered_at
  ) VALUES (
    p_event_id, 
    (SELECT delivery_attempts FROM outbox_events WHERE id = p_event_id),
    'delivered',
    NOW()
  );
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to mark event delivery failed
CREATE OR REPLACE FUNCTION mark_event_delivery_failed(
  p_event_id UUID,
  p_error_message TEXT,
  p_response_code INTEGER DEFAULT NULL,
  p_response_body TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE outbox_events 
  SET 
    delivery_status = CASE 
      WHEN delivery_attempts >= 5 THEN 'dead_letter'
      ELSE 'failed'
    END,
    delivery_attempts = delivery_attempts + 1,
    last_delivery_error = p_error_message,
    updated_at = NOW()
  WHERE id = p_event_id;
  
  -- Record delivery history
  INSERT INTO event_delivery_history (
    event_id, 
    delivery_attempt, 
    status, 
    response_code, 
    response_body, 
    error_message
  ) VALUES (
    p_event_id, 
    (SELECT delivery_attempts FROM outbox_events WHERE id = p_event_id),
    'failed',
    p_response_code,
    p_response_body,
    p_error_message
  );
  
  -- Move to dead letter if max attempts reached
  IF (SELECT delivery_attempts FROM outbox_events WHERE id = p_event_id) >= 5 THEN
    INSERT INTO dead_letter_events (
      original_event_id,
      event_type,
      event_data,
      failure_reason
    ) VALUES (
      p_event_id,
      (SELECT type FROM outbox_events WHERE id = p_event_id),
      (SELECT data FROM outbox_events WHERE id = p_event_id),
      p_error_message
    );
  END IF;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to get pending events for delivery
CREATE OR REPLACE FUNCTION get_pending_events(
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  occurred_at TIMESTAMPTZ,
  data JSONB,
  correlation_id UUID,
  user_id UUID,
  business_node_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oe.id,
    oe.type,
    oe.occurred_at,
    oe.data,
    oe.correlation_id,
    oe.user_id,
    oe.business_node_id
  FROM outbox_events oe
  WHERE oe.delivery_status = 'pending'
  ORDER BY oe.created_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to check command idempotency
CREATE OR REPLACE FUNCTION check_command_idempotency(
  p_idempotency_key TEXT
)
RETURNS TABLE (
  exists BOOLEAN,
  success BOOLEAN,
  result_data JSONB,
  error_message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TRUE as exists,
    ec.success,
    ec.result_data,
    ec.error_message
  FROM executed_commands ec
  WHERE ec.idempotency_key = p_idempotency_key
  AND ec.expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, FALSE, NULL::JSONB, NULL::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to record command execution
CREATE OR REPLACE FUNCTION record_command_execution(
  p_idempotency_key TEXT,
  p_command_action TEXT,
  p_command_payload JSONB,
  p_source TEXT,
  p_workflow_id TEXT DEFAULT NULL,
  p_execution_id TEXT DEFAULT NULL,
  p_correlation_id UUID DEFAULT NULL,
  p_success BOOLEAN,
  p_result_data JSONB DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_execution_time_ms INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  command_id UUID;
BEGIN
  INSERT INTO executed_commands (
    idempotency_key,
    command_action,
    command_payload,
    source,
    workflow_id,
    execution_id,
    correlation_id,
    success,
    result_data,
    error_message,
    execution_time_ms
  ) VALUES (
    p_idempotency_key,
    p_command_action,
    p_command_payload,
    p_source,
    p_workflow_id,
    p_execution_id,
    p_correlation_id,
    p_success,
    p_result_data,
    p_error_message,
    p_execution_time_ms
  ) RETURNING id INTO command_id;
  
  RETURN command_id;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to cleanup expired commands (runs daily)
-- This would typically be done with pg_cron or similar
-- For now, we'll create a manual cleanup function

-- Grant permissions (adjust as needed for your setup)
GRANT SELECT, INSERT, UPDATE ON outbox_events TO lfa_app;
GRANT SELECT, INSERT, UPDATE ON dead_letter_events TO lfa_app;
GRANT SELECT, INSERT ON event_delivery_history TO lfa_app;
GRANT SELECT, INSERT ON workflow_executions TO lfa_app;
GRANT SELECT, INSERT ON executed_commands TO lfa_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO lfa_app;

-- Create a view for monitoring
CREATE OR REPLACE VIEW outbox_monitoring AS
SELECT 
  delivery_status,
  COUNT(*) as event_count,
  MIN(created_at) as oldest_event,
  MAX(created_at) as newest_event,
  AVG(EXTRACT(EPOCH FROM (NOW() - created_at))) as avg_age_seconds
FROM outbox_events
GROUP BY delivery_status;

-- Create a view for dead letter analysis
CREATE OR REPLACE VIEW dead_letter_analysis AS
SELECT 
  dle.event_type,
  COUNT(*) as failure_count,
  MAX(dle.failure_count) as max_attempts,
  MIN(dle.last_failure_at) as first_failure,
  MAX(dle.last_failure_at) as last_failure,
  STRING_AGG(DISTINCT dle.failure_reason, '; ') as failure_reasons
FROM dead_letter_events dle
GROUP BY dle.event_type
ORDER BY failure_count DESC;
