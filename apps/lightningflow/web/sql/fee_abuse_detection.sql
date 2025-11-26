-- Fee Abuse Detection System
-- Addresses audit finding: Fee abuse detection needed

-- Channel fee updates tracking table
CREATE TABLE IF NOT EXISTS channel_fee_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  channel_id TEXT NOT NULL,
  old_fee_rate INTEGER NOT NULL CHECK (old_fee_rate >= 0 AND old_fee_rate <= 5000),
  new_fee_rate INTEGER NOT NULL CHECK (new_fee_rate >= 0 AND new_fee_rate <= 5000),
  reason TEXT,
  client_ip INET NOT NULL,
  user_agent TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_channel_fee_updates_user_id (user_id),
  INDEX idx_channel_fee_updates_channel_id (channel_id),
  INDEX idx_channel_fee_updates_created_at (created_at),
  INDEX idx_channel_fee_updates_user_channel (user_id, channel_id)
);

-- Fee abuse alerts table
CREATE TABLE IF NOT EXISTS fee_abuse_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  channel_id TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('rapid_changes', 'excessive_updates', 'suspicious_pattern', 'manipulation_attempt')),
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'reviewed', 'false_positive', 'confirmed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  action_taken TEXT CHECK (action_taken IN ('none', 'warning', 'throttled', 'blocked', 'manual_review')),
  
  -- Indexes
  INDEX idx_fee_abuse_alerts_user_id (user_id),
  INDEX idx_fee_abuse_alerts_channel_id (channel_id),
  INDEX idx_fee_abuse_alerts_status (status),
  INDEX idx_fee_abuse_alerts_alert_type (alert_type),
  INDEX idx_fee_abuse_alerts_confidence (confidence_score)
);

-- Fee update rate limits table
CREATE TABLE IF NOT EXISTS fee_update_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  channel_id TEXT NOT NULL,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  update_count INTEGER NOT NULL DEFAULT 1 CHECK (update_count > 0),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Composite index for efficient lookups
  INDEX idx_fee_rate_limits_user_channel_window (user_id, channel_id, window_start, window_end),
  INDEX idx_fee_rate_limits_blocked (blocked_until),
  
  -- Unique constraint to prevent duplicate windows
  UNIQUE (user_id, channel_id, window_start)
);

-- Enable Row Level Security
ALTER TABLE channel_fee_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_abuse_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_update_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for channel_fee_updates
CREATE POLICY "Users can view own fee updates" ON channel_fee_updates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fee updates" ON channel_fee_updates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- No UPDATE or DELETE for fee updates (immutable audit trail)

-- RLS Policies for fee_abuse_alerts
CREATE POLICY "Users can view own fee abuse alerts" ON fee_abuse_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert fee abuse alerts" ON fee_abuse_alerts
  FOR INSERT WITH CHECK (true);

-- RLS Policies for fee_update_rate_limits
CREATE POLICY "Users can view own fee rate limits" ON fee_update_rate_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage fee rate limits" ON fee_update_rate_limits
  FOR ALL WITH CHECK (true);

-- Functions for fee abuse detection

-- Function to check if fee update is allowed
CREATE OR REPLACE FUNCTION check_fee_update_allowed(
  p_user_id UUID,
  p_channel_id TEXT,
  p_new_fee_rate INTEGER
) RETURNS JSONB AS $$
DECLARE
  last_update RECORD;
  recent_updates INTEGER;
  hourly_updates INTEGER;
  daily_updates INTEGER;
  cooldown_minutes INTEGER := 30;
  max_hourly_updates INTEGER := 5;
  max_daily_updates INTEGER := 20;
  result JSONB;
BEGIN
  -- Check last update time for cooldown
  SELECT created_at, new_fee_rate INTO last_update
  FROM channel_fee_updates
  WHERE user_id = p_user_id AND channel_id = p_channel_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Check cooldown period
  IF last_update.created_at IS NOT NULL AND 
     last_update.created_at > NOW() - (cooldown_minutes || ' minutes')::INTERVAL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'cooldown_active',
      'message', 'Fee update cooldown active. Please wait before updating again.',
      'next_allowed', last_update.created_at + (cooldown_minutes || ' minutes')::INTERVAL
    );
  END IF;
  
  -- Check hourly rate limit
  SELECT COUNT(*) INTO hourly_updates
  FROM channel_fee_updates
  WHERE user_id = p_user_id 
    AND channel_id = p_channel_id
    AND created_at >= NOW() - INTERVAL '1 hour';
  
  IF hourly_updates >= max_hourly_updates THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'hourly_limit_exceeded',
      'message', 'Hourly fee update limit exceeded',
      'updates_made', hourly_updates,
      'limit', max_hourly_updates
    );
  END IF;
  
  -- Check daily rate limit
  SELECT COUNT(*) INTO daily_updates
  FROM channel_fee_updates
  WHERE user_id = p_user_id 
    AND channel_id = p_channel_id
    AND created_at >= NOW() - INTERVAL '24 hours';
  
  IF daily_updates >= max_daily_updates THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'daily_limit_exceeded',
      'message', 'Daily fee update limit exceeded',
      'updates_made', daily_updates,
      'limit', max_daily_updates
    );
  END IF;
  
  -- All checks passed
  RETURN jsonb_build_object(
    'allowed', true,
    'hourly_updates', hourly_updates,
    'daily_updates', daily_updates,
    'last_update', last_update.created_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect fee abuse patterns
CREATE OR REPLACE FUNCTION detect_fee_abuse(
  p_user_id UUID,
  p_channel_id TEXT,
  p_new_fee_rate INTEGER
) RETURNS JSONB AS $$
DECLARE
  recent_updates RECORD;
  fee_changes INTEGER[];
  avg_change DECIMAL;
  max_change INTEGER;
  rapid_changes INTEGER;
  abuse_score DECIMAL := 0.0;
  abuse_reasons JSONB := '[]'::jsonb;
  alert_id UUID;
BEGIN
  -- Get recent fee updates (last 7 days)
  SELECT 
    COUNT(*) as update_count,
    ARRAY_AGG(ABS(new_fee_rate - old_fee_rate) ORDER BY created_at) as fee_changes,
    AVG(ABS(new_fee_rate - old_fee_rate)) as avg_change,
    MAX(ABS(new_fee_rate - old_fee_rate)) as max_change
  INTO recent_updates
  FROM channel_fee_updates
  WHERE user_id = p_user_id 
    AND channel_id = p_channel_id
    AND created_at >= NOW() - INTERVAL '7 days';
  
  -- Check for excessive update frequency
  IF recent_updates.update_count > 50 THEN -- More than 50 updates in 7 days
    abuse_score := abuse_score + 0.4;
    abuse_reasons := abuse_reasons || jsonb_build_array('excessive_update_frequency');
  END IF;
  
  -- Check for rapid fee changes
  SELECT COUNT(*) INTO rapid_changes
  FROM channel_fee_updates
  WHERE user_id = p_user_id 
    AND channel_id = p_channel_id
    AND created_at >= NOW() - INTERVAL '24 hours'
    AND ABS(new_fee_rate - old_fee_rate) > 1000; -- Changes > 1000 ppm
  
  IF rapid_changes > 3 THEN
    abuse_score := abuse_score + 0.3;
    abuse_reasons := abuse_reasons || jsonb_build_array('rapid_fee_changes');
  END IF;
  
  -- Check for oscillating patterns (back and forth changes)
  IF recent_updates.update_count >= 4 THEN
    DECLARE
      oscillations INTEGER := 0;
      i INTEGER;
    BEGIN
      FOR i IN 1..array_length(recent_updates.fee_changes, 1)-2 LOOP
        IF (recent_updates.fee_changes[i] > 500 AND recent_updates.fee_changes[i+1] > 500) THEN
          oscillations := oscillations + 1;
        END IF;
      END LOOP;
      
      IF oscillations > 2 THEN
        abuse_score := abuse_score + 0.3;
        abuse_reasons := abuse_reasons || jsonb_build_array('oscillating_pattern');
      END IF;
    END;
  END IF;
  
  -- Check for extreme fee rates
  IF p_new_fee_rate > 4000 OR p_new_fee_rate = 0 THEN
    abuse_score := abuse_score + 0.2;
    abuse_reasons := abuse_reasons || jsonb_build_array('extreme_fee_rate');
  END IF;
  
  -- Cap abuse score at 1.0
  abuse_score := LEAST(abuse_score, 1.0);
  
  -- Create alert if abuse score is high
  IF abuse_score >= 0.7 THEN
    INSERT INTO fee_abuse_alerts (user_id, channel_id, alert_type, confidence_score, details)
    VALUES (
      p_user_id,
      p_channel_id,
      'suspicious_pattern',
      abuse_score,
      jsonb_build_object(
        'recent_updates', recent_updates.update_count,
        'avg_change', recent_updates.avg_change,
        'max_change', recent_updates.max_change,
        'rapid_changes', rapid_changes,
        'proposed_fee', p_new_fee_rate,
        'reasons', abuse_reasons
      )
    )
    RETURNING id INTO alert_id;
  END IF;
  
  RETURN jsonb_build_object(
    'abuse_score', abuse_score,
    'abuse_reasons', abuse_reasons,
    'recent_updates', recent_updates.update_count,
    'rapid_changes', rapid_changes,
    'requires_review', abuse_score >= 0.7,
    'alert_id', alert_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record fee update with rate limiting
CREATE OR REPLACE FUNCTION record_fee_update(
  p_user_id UUID,
  p_channel_id TEXT,
  p_old_fee_rate INTEGER,
  p_new_fee_rate INTEGER,
  p_reason TEXT,
  p_client_ip INET,
  p_user_agent TEXT
) RETURNS UUID AS $$
DECLARE
  update_id UUID;
  window_start TIMESTAMP WITH TIME ZONE;
  window_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Insert fee update record
  INSERT INTO channel_fee_updates (
    user_id, channel_id, old_fee_rate, new_fee_rate, 
    reason, client_ip, user_agent
  )
  VALUES (
    p_user_id, p_channel_id, p_old_fee_rate, p_new_fee_rate,
    p_reason, p_client_ip, p_user_agent
  )
  RETURNING id INTO update_id;
  
  -- Update rate limiting table
  window_start := DATE_TRUNC('hour', NOW());
  window_end := window_start + INTERVAL '1 hour';
  
  INSERT INTO fee_update_rate_limits (user_id, channel_id, window_start, window_end, update_count)
  VALUES (p_user_id, p_channel_id, window_start, window_end, 1)
  ON CONFLICT (user_id, channel_id, window_start)
  DO UPDATE SET 
    update_count = fee_update_rate_limits.update_count + 1;
  
  RETURN update_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically detect abuse on new fee updates
CREATE OR REPLACE FUNCTION trigger_fee_abuse_detection()
RETURNS TRIGGER AS $$
DECLARE
  abuse_result JSONB;
BEGIN
  -- Run abuse detection
  abuse_result := detect_fee_abuse(NEW.user_id, NEW.channel_id, NEW.new_fee_rate);
  
  -- Log the abuse check result (could be used for analytics)
  -- This could be stored in a separate table or added to metadata
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_fee_abuse_detection
  AFTER INSERT ON channel_fee_updates
  FOR EACH ROW
  EXECUTE FUNCTION trigger_fee_abuse_detection();

-- Function to clean up old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_fee_rate_limits()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM fee_update_rate_limits
  WHERE window_end < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for fee abuse monitoring
CREATE OR REPLACE VIEW fee_abuse_dashboard AS
SELECT 
  cfu.user_id,
  cfu.channel_id,
  COUNT(*) as total_updates,
  COUNT(*) FILTER (WHERE cfu.created_at >= NOW() - INTERVAL '24 hours') as updates_24h,
  COUNT(*) FILTER (WHERE cfu.created_at >= NOW() - INTERVAL '7 days') as updates_7d,
  AVG(ABS(cfu.new_fee_rate - cfu.old_fee_rate)) as avg_fee_change,
  MAX(ABS(cfu.new_fee_rate - cfu.old_fee_rate)) as max_fee_change,
  COUNT(*) FILTER (WHERE ABS(cfu.new_fee_rate - cfu.old_fee_rate) > 1000) as large_changes,
  COUNT(faa.id) as abuse_alerts,
  COUNT(faa.id) FILTER (WHERE faa.status = 'active') as active_alerts,
  MAX(cfu.created_at) as last_update,
  CURRENT_TIMESTAMP as report_generated
FROM channel_fee_updates cfu
LEFT JOIN fee_abuse_alerts faa ON cfu.user_id = faa.user_id AND cfu.channel_id = faa.channel_id
WHERE cfu.created_at >= NOW() - INTERVAL '30 days'
GROUP BY cfu.user_id, cfu.channel_id;

-- Grant necessary permissions
GRANT SELECT ON fee_abuse_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION check_fee_update_allowed(UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION detect_fee_abuse(UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION record_fee_update(UUID, TEXT, INTEGER, INTEGER, TEXT, INET, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_fee_rate_limits() TO service_role;

-- Create indexes for better performance on large datasets
CREATE INDEX IF NOT EXISTS idx_channel_fee_updates_user_channel_time 
ON channel_fee_updates(user_id, channel_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fee_abuse_alerts_user_channel_status 
ON fee_abuse_alerts(user_id, channel_id, status);

-- Add constraints to ensure data integrity
ALTER TABLE channel_fee_updates 
ADD CONSTRAINT check_fee_rate_change 
CHECK (old_fee_rate != new_fee_rate); -- Prevent no-op updates

-- Add a comment explaining the purpose
COMMENT ON TABLE channel_fee_updates IS 'Tracks all Lightning channel fee rate changes for abuse detection and audit purposes';
COMMENT ON TABLE fee_abuse_alerts IS 'Stores alerts generated when suspicious fee update patterns are detected';
COMMENT ON TABLE fee_update_rate_limits IS 'Tracks rate limiting windows for fee updates to prevent abuse'; 