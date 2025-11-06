-- LNURL Withdrawal Security Enhancement
-- Addresses audit findings: LNURL sessions need brute-force hardening, withdrawal fraud alerting

-- LNURL withdrawal sessions table
CREATE TABLE IF NOT EXISTS lnurl_withdraw_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  k1 TEXT UNIQUE NOT NULL, -- Secure k1 secret (64 chars hex)
  amount_sats BIGINT NOT NULL CHECK (amount_sats > 0),
  description TEXT NOT NULL DEFAULT 'Lightning withdrawal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0 CHECK (attempts >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired', 'blocked')),
  client_ip INET NOT NULL,
  user_agent TEXT NOT NULL,
  payment_request TEXT, -- Stored when withdrawal is executed
  payment_hash TEXT, -- Lightning payment hash
  completed_at TIMESTAMP WITH TIME ZONE,
  fraud_score DECIMAL(3,2) DEFAULT 0.0 CHECK (fraud_score >= 0.0 AND fraud_score <= 1.0),
  fraud_reasons JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Withdrawal fraud alerts table
CREATE TABLE IF NOT EXISTS withdrawal_fraud_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES lnurl_withdraw_sessions(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('high_frequency', 'suspicious_pattern', 'amount_anomaly', 'ip_mismatch', 'device_change')),
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'reviewed', 'false_positive', 'confirmed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  action_taken TEXT CHECK (action_taken IN ('none', 'blocked', 'limited', 'manual_review'))
);

-- Withdrawal rate limiting table
CREATE TABLE IF NOT EXISTS withdrawal_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_ip INET NOT NULL,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  attempt_count INTEGER DEFAULT 1 CHECK (attempt_count > 0),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance and security
CREATE INDEX IF NOT EXISTS idx_lnurl_withdraw_sessions_user_id ON lnurl_withdraw_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_lnurl_withdraw_sessions_k1 ON lnurl_withdraw_sessions(k1);
CREATE INDEX IF NOT EXISTS idx_lnurl_withdraw_sessions_status ON lnurl_withdraw_sessions(status);
CREATE INDEX IF NOT EXISTS idx_lnurl_withdraw_sessions_expires_at ON lnurl_withdraw_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_lnurl_withdraw_sessions_client_ip ON lnurl_withdraw_sessions(client_ip);
CREATE INDEX IF NOT EXISTS idx_lnurl_withdraw_sessions_created_at ON lnurl_withdraw_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_withdrawal_fraud_alerts_user_id ON withdrawal_fraud_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_fraud_alerts_session_id ON withdrawal_fraud_alerts(session_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_fraud_alerts_status ON withdrawal_fraud_alerts(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_fraud_alerts_confidence ON withdrawal_fraud_alerts(confidence_score);

CREATE INDEX IF NOT EXISTS idx_withdrawal_rate_limits_user_id ON withdrawal_rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_rate_limits_client_ip ON withdrawal_rate_limits(client_ip);
CREATE INDEX IF NOT EXISTS idx_withdrawal_rate_limits_window ON withdrawal_rate_limits(window_start, window_end);

-- Row Level Security (RLS) policies
ALTER TABLE lnurl_withdraw_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own withdrawal sessions
CREATE POLICY "Users can view own withdrawal sessions" ON lnurl_withdraw_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdrawal sessions" ON lnurl_withdraw_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own withdrawal sessions" ON lnurl_withdraw_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can view their own fraud alerts
CREATE POLICY "Users can view own fraud alerts" ON withdrawal_fraud_alerts
  FOR SELECT USING (auth.uid() = user_id);

-- Only system can insert fraud alerts
CREATE POLICY "System can insert fraud alerts" ON withdrawal_fraud_alerts
  FOR INSERT WITH CHECK (true);

-- Users can view their own rate limits
CREATE POLICY "Users can view own rate limits" ON withdrawal_rate_limits
  FOR SELECT USING (auth.uid() = user_id);

-- System can manage rate limits
CREATE POLICY "System can manage rate limits" ON withdrawal_rate_limits
  FOR ALL WITH CHECK (true);

-- Functions for withdrawal security

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_withdrawal_sessions()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE lnurl_withdraw_sessions 
  SET status = 'expired'
  WHERE status = 'pending' 
    AND expires_at < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check withdrawal rate limits
CREATE OR REPLACE FUNCTION check_withdrawal_rate_limit(
  p_user_id UUID,
  p_client_ip INET,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 60
) RETURNS JSONB AS $$
DECLARE
  window_start TIMESTAMP WITH TIME ZONE;
  current_attempts INTEGER;
  is_blocked BOOLEAN;
  result JSONB;
BEGIN
  window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Count attempts in current window
  SELECT COUNT(*) INTO current_attempts
  FROM lnurl_withdraw_sessions
  WHERE user_id = p_user_id
    AND client_ip = p_client_ip
    AND created_at >= window_start;
  
  -- Check if blocked
  is_blocked := current_attempts >= p_max_attempts;
  
  -- Update or insert rate limit record
  INSERT INTO withdrawal_rate_limits (user_id, client_ip, window_start, window_end, attempt_count, blocked_until)
  VALUES (
    p_user_id, 
    p_client_ip, 
    window_start, 
    window_start + (p_window_minutes || ' minutes')::INTERVAL,
    current_attempts + 1,
    CASE WHEN is_blocked THEN NOW() + INTERVAL '1 hour' ELSE NULL END
  )
  ON CONFLICT (user_id, client_ip, window_start) 
  DO UPDATE SET 
    attempt_count = withdrawal_rate_limits.attempt_count + 1,
    blocked_until = CASE WHEN EXCLUDED.attempt_count >= p_max_attempts THEN NOW() + INTERVAL '1 hour' ELSE withdrawal_rate_limits.blocked_until END,
    updated_at = NOW();
  
  result := jsonb_build_object(
    'allowed', NOT is_blocked,
    'attempts', current_attempts,
    'max_attempts', p_max_attempts,
    'window_minutes', p_window_minutes,
    'reset_at', window_start + (p_window_minutes || ' minutes')::INTERVAL
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect withdrawal fraud patterns
CREATE OR REPLACE FUNCTION detect_withdrawal_fraud(
  p_user_id UUID,
  p_amount_sats BIGINT,
  p_client_ip INET
) RETURNS JSONB AS $$
DECLARE
  recent_withdrawals INTEGER;
  total_amount_24h BIGINT;
  ip_changes INTEGER;
  avg_amount DECIMAL;
  fraud_score DECIMAL := 0.0;
  fraud_reasons JSONB := '[]'::jsonb;
  alert_type TEXT;
BEGIN
  -- Check withdrawal frequency (last 24 hours)
  SELECT COUNT(*), COALESCE(SUM(amount_sats), 0), AVG(amount_sats)
  INTO recent_withdrawals, total_amount_24h, avg_amount
  FROM lnurl_withdraw_sessions
  WHERE user_id = p_user_id
    AND created_at >= NOW() - INTERVAL '24 hours'
    AND status IN ('used', 'pending');
  
  -- Check IP address changes (last 7 days)
  SELECT COUNT(DISTINCT client_ip) INTO ip_changes
  FROM lnurl_withdraw_sessions
  WHERE user_id = p_user_id
    AND created_at >= NOW() - INTERVAL '7 days';
  
  -- High frequency detection
  IF recent_withdrawals > 10 THEN
    fraud_score := fraud_score + 0.3;
    fraud_reasons := fraud_reasons || jsonb_build_array('high_frequency_withdrawals');
  END IF;
  
  -- Large amount anomaly
  IF avg_amount > 0 AND p_amount_sats > (avg_amount * 5) THEN
    fraud_score := fraud_score + 0.4;
    fraud_reasons := fraud_reasons || jsonb_build_array('amount_anomaly');
  END IF;
  
  -- IP address changes
  IF ip_changes > 3 THEN
    fraud_score := fraud_score + 0.2;
    fraud_reasons := fraud_reasons || jsonb_build_array('multiple_ip_addresses');
  END IF;
  
  -- Large total amount in 24h
  IF total_amount_24h > 1000000 THEN -- 1M sats
    fraud_score := fraud_score + 0.3;
    fraud_reasons := fraud_reasons || jsonb_build_array('high_volume_24h');
  END IF;
  
  -- Cap fraud score at 1.0
  fraud_score := LEAST(fraud_score, 1.0);
  
  -- Create fraud alert if score is high
  IF fraud_score >= 0.7 THEN
    INSERT INTO withdrawal_fraud_alerts (user_id, alert_type, confidence_score, details)
    VALUES (
      p_user_id,
      'suspicious_pattern',
      fraud_score,
      jsonb_build_object(
        'amount_sats', p_amount_sats,
        'recent_withdrawals', recent_withdrawals,
        'total_amount_24h', total_amount_24h,
        'ip_changes', ip_changes,
        'client_ip', p_client_ip,
        'reasons', fraud_reasons
      )
    );
  END IF;
  
  RETURN jsonb_build_object(
    'fraud_score', fraud_score,
    'fraud_reasons', fraud_reasons,
    'recent_withdrawals', recent_withdrawals,
    'total_amount_24h', total_amount_24h,
    'ip_changes', ip_changes,
    'requires_review', fraud_score >= 0.7
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically detect fraud on new withdrawal sessions
CREATE OR REPLACE FUNCTION trigger_withdrawal_fraud_detection()
RETURNS TRIGGER AS $$
DECLARE
  fraud_result JSONB;
BEGIN
  -- Run fraud detection
  fraud_result := detect_withdrawal_fraud(NEW.user_id, NEW.amount_sats, NEW.client_ip);
  
  -- Update the session with fraud score
  NEW.fraud_score := (fraud_result->>'fraud_score')::DECIMAL;
  NEW.fraud_reasons := fraud_result->'fraud_reasons';
  
  -- Block session if fraud score is too high
  IF NEW.fraud_score >= 0.8 THEN
    NEW.status := 'blocked';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_withdrawal_fraud_detection
  BEFORE INSERT ON lnurl_withdraw_sessions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_withdrawal_fraud_detection();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_withdrawal_rate_limits_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_withdrawal_rate_limits_timestamp
  BEFORE UPDATE ON withdrawal_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_withdrawal_rate_limits_timestamp();

-- Create a view for withdrawal security monitoring
CREATE OR REPLACE VIEW withdrawal_security_dashboard AS
SELECT 
  ws.user_id,
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE ws.status = 'pending') as pending_sessions,
  COUNT(*) FILTER (WHERE ws.status = 'used') as completed_sessions,
  COUNT(*) FILTER (WHERE ws.status = 'blocked') as blocked_sessions,
  COUNT(*) FILTER (WHERE ws.fraud_score >= 0.7) as high_risk_sessions,
  SUM(ws.amount_sats) FILTER (WHERE ws.status = 'used') as total_withdrawn_sats,
  AVG(ws.fraud_score) as avg_fraud_score,
  COUNT(DISTINCT ws.client_ip) as unique_ips,
  MAX(ws.created_at) as last_withdrawal_attempt,
  COUNT(wfa.id) as fraud_alerts
FROM lnurl_withdraw_sessions ws
LEFT JOIN withdrawal_fraud_alerts wfa ON ws.user_id = wfa.user_id
WHERE ws.created_at >= NOW() - INTERVAL '30 days'
GROUP BY ws.user_id;

-- Grant necessary permissions
GRANT SELECT ON withdrawal_security_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_withdrawal_sessions() TO service_role;
GRANT EXECUTE ON FUNCTION check_withdrawal_rate_limit(UUID, INET, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION detect_withdrawal_fraud(UUID, BIGINT, INET) TO authenticated; 