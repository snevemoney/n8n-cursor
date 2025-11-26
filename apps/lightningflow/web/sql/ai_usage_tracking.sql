-- AI Usage Tracking with RLS Policy Binding
-- Addresses audit finding: OpenAI integration requires RLS policy binding

-- AI usage logs table with comprehensive tracking
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL CHECK (prompt_tokens >= 0),
  completion_tokens INTEGER NOT NULL CHECK (completion_tokens >= 0),
  total_tokens INTEGER GENERATED ALWAYS AS (prompt_tokens + completion_tokens) STORED,
  estimated_cost DECIMAL(10,6) NOT NULL DEFAULT 0.0 CHECK (estimated_cost >= 0),
  request_type TEXT NOT NULL CHECK (request_type IN ('chat', 'embedding', 'completion')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_ai_usage_logs_user_id (user_id),
  INDEX idx_ai_usage_logs_created_at (created_at),
  INDEX idx_ai_usage_logs_model (model),
  INDEX idx_ai_usage_logs_request_type (request_type)
);

-- User AI quotas and limits table
CREATE TABLE IF NOT EXISTS ai_user_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  monthly_token_limit INTEGER NOT NULL DEFAULT 10000 CHECK (monthly_token_limit > 0),
  current_month_usage INTEGER NOT NULL DEFAULT 0 CHECK (current_month_usage >= 0),
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_cost_usd DECIMAL(10,2) NOT NULL DEFAULT 0.0 CHECK (total_cost_usd >= 0),
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  blocked_reason TEXT,
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_ai_user_quotas_user_id (user_id),
  INDEX idx_ai_user_quotas_subscription_tier (subscription_tier),
  INDEX idx_ai_user_quotas_is_blocked (is_blocked)
);

-- AI request rate limiting table
CREATE TABLE IF NOT EXISTS ai_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1 CHECK (request_count > 0),
  token_count INTEGER NOT NULL DEFAULT 0 CHECK (token_count >= 0),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Composite index for efficient lookups
  INDEX idx_ai_rate_limits_user_window (user_id, window_start, window_end),
  INDEX idx_ai_rate_limits_blocked (blocked_until)
);

-- AI abuse detection alerts
CREATE TABLE IF NOT EXISTS ai_abuse_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('rate_limit_exceeded', 'quota_exceeded', 'suspicious_pattern', 'cost_anomaly')),
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'reviewed', 'false_positive', 'confirmed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  action_taken TEXT CHECK (action_taken IN ('none', 'warning', 'throttled', 'blocked', 'manual_review')),
  
  -- Indexes
  INDEX idx_ai_abuse_alerts_user_id (user_id),
  INDEX idx_ai_abuse_alerts_status (status),
  INDEX idx_ai_abuse_alerts_alert_type (alert_type),
  INDEX idx_ai_abuse_alerts_confidence (confidence_score)
);

-- Enable Row Level Security on all tables
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_user_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_abuse_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_usage_logs
CREATE POLICY "Users can view own AI usage logs" ON ai_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI usage logs" ON ai_usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- No UPDATE or DELETE for usage logs (immutable audit trail)

-- RLS Policies for ai_user_quotas
CREATE POLICY "Users can view own AI quotas" ON ai_user_quotas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI quotas" ON ai_user_quotas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI quotas" ON ai_user_quotas
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for ai_rate_limits
CREATE POLICY "Users can view own AI rate limits" ON ai_rate_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage AI rate limits" ON ai_rate_limits
  FOR ALL WITH CHECK (true); -- System needs full access for rate limiting

-- RLS Policies for ai_abuse_alerts
CREATE POLICY "Users can view own AI abuse alerts" ON ai_abuse_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert AI abuse alerts" ON ai_abuse_alerts
  FOR INSERT WITH CHECK (true);

-- Functions for AI usage management

-- Function to check if user can make AI request
CREATE OR REPLACE FUNCTION check_ai_request_allowed(
  p_user_id UUID,
  p_estimated_tokens INTEGER DEFAULT 100
) RETURNS JSONB AS $$
DECLARE
  user_quota RECORD;
  current_usage INTEGER;
  rate_limit_check RECORD;
  result JSONB;
BEGIN
  -- Get or create user quota record
  SELECT * INTO user_quota
  FROM ai_user_quotas
  WHERE user_id = p_user_id;
  
  IF user_quota IS NULL THEN
    -- Create default quota for new user
    INSERT INTO ai_user_quotas (user_id, subscription_tier, monthly_token_limit)
    VALUES (p_user_id, 'free', 10000)
    RETURNING * INTO user_quota;
  END IF;
  
  -- Check if user is blocked
  IF user_quota.is_blocked AND (user_quota.blocked_until IS NULL OR user_quota.blocked_until > NOW()) THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'user_blocked',
      'message', COALESCE(user_quota.blocked_reason, 'Account temporarily blocked'),
      'blocked_until', user_quota.blocked_until
    );
  END IF;
  
  -- Reset monthly usage if needed
  IF user_quota.last_reset_date < DATE_TRUNC('month', CURRENT_DATE) THEN
    UPDATE ai_user_quotas
    SET current_month_usage = 0,
        last_reset_date = DATE_TRUNC('month', CURRENT_DATE),
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    user_quota.current_month_usage := 0;
  END IF;
  
  -- Check monthly quota
  IF user_quota.current_month_usage + p_estimated_tokens > user_quota.monthly_token_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'quota_exceeded',
      'message', 'Monthly token quota exceeded',
      'current_usage', user_quota.current_month_usage,
      'limit', user_quota.monthly_token_limit,
      'estimated_tokens', p_estimated_tokens
    );
  END IF;
  
  -- Check rate limits (requests per hour)
  SELECT COUNT(*) as request_count INTO rate_limit_check
  FROM ai_rate_limits
  WHERE user_id = p_user_id
    AND window_start >= NOW() - INTERVAL '1 hour';
  
  -- Rate limit based on subscription tier
  DECLARE
    max_requests_per_hour INTEGER;
  BEGIN
    CASE user_quota.subscription_tier
      WHEN 'enterprise' THEN max_requests_per_hour := 1000;
      WHEN 'pro' THEN max_requests_per_hour := 200;
      ELSE max_requests_per_hour := 60; -- free tier
    END CASE;
    
    IF rate_limit_check.request_count >= max_requests_per_hour THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'rate_limit_exceeded',
        'message', 'Hourly request limit exceeded',
        'requests_made', rate_limit_check.request_count,
        'limit', max_requests_per_hour
      );
    END IF;
  END;
  
  -- All checks passed
  RETURN jsonb_build_object(
    'allowed', true,
    'current_usage', user_quota.current_month_usage,
    'limit', user_quota.monthly_token_limit,
    'remaining_tokens', user_quota.monthly_token_limit - user_quota.current_month_usage,
    'subscription_tier', user_quota.subscription_tier
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record AI usage
CREATE OR REPLACE FUNCTION record_ai_usage(
  p_user_id UUID,
  p_model TEXT,
  p_prompt_tokens INTEGER,
  p_completion_tokens INTEGER,
  p_estimated_cost DECIMAL,
  p_request_type TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  usage_id UUID;
  total_tokens INTEGER;
BEGIN
  total_tokens := p_prompt_tokens + p_completion_tokens;
  
  -- Insert usage log
  INSERT INTO ai_usage_logs (
    user_id, model, prompt_tokens, completion_tokens, 
    estimated_cost, request_type, metadata
  )
  VALUES (
    p_user_id, p_model, p_prompt_tokens, p_completion_tokens,
    p_estimated_cost, p_request_type, p_metadata
  )
  RETURNING id INTO usage_id;
  
  -- Update user quota
  UPDATE ai_user_quotas
  SET current_month_usage = current_month_usage + total_tokens,
      total_cost_usd = total_cost_usd + p_estimated_cost,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Record rate limit entry
  INSERT INTO ai_rate_limits (user_id, window_start, window_end, request_count, token_count)
  VALUES (
    p_user_id,
    DATE_TRUNC('hour', NOW()),
    DATE_TRUNC('hour', NOW()) + INTERVAL '1 hour',
    1,
    total_tokens
  )
  ON CONFLICT (user_id, window_start, window_end)
  DO UPDATE SET
    request_count = ai_rate_limits.request_count + 1,
    token_count = ai_rate_limits.token_count + total_tokens;
  
  RETURN usage_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect AI usage abuse
CREATE OR REPLACE FUNCTION detect_ai_abuse(
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  recent_usage RECORD;
  hourly_requests INTEGER;
  daily_cost DECIMAL;
  abuse_score DECIMAL := 0.0;
  abuse_reasons JSONB := '[]'::jsonb;
  alert_id UUID;
BEGIN
  -- Check recent usage patterns
  SELECT 
    COUNT(*) as request_count,
    SUM(total_tokens) as total_tokens,
    SUM(estimated_cost) as total_cost,
    AVG(estimated_cost) as avg_cost
  INTO recent_usage
  FROM ai_usage_logs
  WHERE user_id = p_user_id
    AND created_at >= NOW() - INTERVAL '24 hours';
  
  -- Check hourly request rate
  SELECT COUNT(*) INTO hourly_requests
  FROM ai_usage_logs
  WHERE user_id = p_user_id
    AND created_at >= NOW() - INTERVAL '1 hour';
  
  -- High frequency requests
  IF hourly_requests > 100 THEN
    abuse_score := abuse_score + 0.4;
    abuse_reasons := abuse_reasons || jsonb_build_array('high_frequency_requests');
  END IF;
  
  -- Unusual cost patterns
  IF recent_usage.total_cost > 50.0 THEN -- $50 in 24 hours
    abuse_score := abuse_score + 0.3;
    abuse_reasons := abuse_reasons || jsonb_build_array('high_daily_cost');
  END IF;
  
  -- Excessive token usage
  IF recent_usage.total_tokens > 500000 THEN -- 500k tokens in 24 hours
    abuse_score := abuse_score + 0.3;
    abuse_reasons := abuse_reasons || jsonb_build_array('excessive_token_usage');
  END IF;
  
  -- Cap abuse score at 1.0
  abuse_score := LEAST(abuse_score, 1.0);
  
  -- Create alert if abuse score is high
  IF abuse_score >= 0.7 THEN
    INSERT INTO ai_abuse_alerts (user_id, alert_type, confidence_score, details)
    VALUES (
      p_user_id,
      'suspicious_pattern',
      abuse_score,
      jsonb_build_object(
        'hourly_requests', hourly_requests,
        'daily_cost', recent_usage.total_cost,
        'daily_tokens', recent_usage.total_tokens,
        'reasons', abuse_reasons
      )
    )
    RETURNING id INTO alert_id;
  END IF;
  
  RETURN jsonb_build_object(
    'abuse_score', abuse_score,
    'abuse_reasons', abuse_reasons,
    'hourly_requests', hourly_requests,
    'daily_cost', recent_usage.total_cost,
    'daily_tokens', recent_usage.total_tokens,
    'requires_review', abuse_score >= 0.7,
    'alert_id', alert_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically detect abuse on new usage logs
CREATE OR REPLACE FUNCTION trigger_ai_abuse_detection()
RETURNS TRIGGER AS $$
DECLARE
  abuse_result JSONB;
BEGIN
  -- Run abuse detection for high-value requests
  IF NEW.estimated_cost > 1.0 OR NEW.total_tokens > 10000 THEN
    abuse_result := detect_ai_abuse(NEW.user_id);
    
    -- Log the abuse check result in metadata
    NEW.metadata := NEW.metadata || jsonb_build_object(
      'abuse_check', abuse_result
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ai_abuse_detection
  BEFORE INSERT ON ai_usage_logs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_ai_abuse_detection();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_quota_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_quota_timestamp
  BEFORE UPDATE ON ai_user_quotas
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_quota_timestamp();

-- Create views for monitoring and analytics

-- AI usage dashboard view
CREATE OR REPLACE VIEW ai_usage_dashboard AS
SELECT 
  aul.user_id,
  COUNT(*) as total_requests,
  SUM(aul.total_tokens) as total_tokens,
  SUM(aul.estimated_cost) as total_cost,
  AVG(aul.estimated_cost) as avg_cost_per_request,
  COUNT(DISTINCT aul.model) as models_used,
  COUNT(*) FILTER (WHERE aul.created_at >= NOW() - INTERVAL '24 hours') as requests_24h,
  SUM(aul.total_tokens) FILTER (WHERE aul.created_at >= NOW() - INTERVAL '24 hours') as tokens_24h,
  SUM(aul.estimated_cost) FILTER (WHERE aul.created_at >= NOW() - INTERVAL '24 hours') as cost_24h,
  auq.subscription_tier,
  auq.monthly_token_limit,
  auq.current_month_usage,
  auq.is_blocked,
  COUNT(aaa.id) as abuse_alerts
FROM ai_usage_logs aul
LEFT JOIN ai_user_quotas auq ON aul.user_id = auq.user_id
LEFT JOIN ai_abuse_alerts aaa ON aul.user_id = aaa.user_id AND aaa.status = 'active'
WHERE aul.created_at >= NOW() - INTERVAL '30 days'
GROUP BY aul.user_id, auq.subscription_tier, auq.monthly_token_limit, auq.current_month_usage, auq.is_blocked;

-- Grant necessary permissions
GRANT SELECT ON ai_usage_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION check_ai_request_allowed(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION record_ai_usage(UUID, TEXT, INTEGER, INTEGER, DECIMAL, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION detect_ai_abuse(UUID) TO authenticated;

-- Create initial quota records for existing users
INSERT INTO ai_user_quotas (user_id, subscription_tier, monthly_token_limit)
SELECT 
  id,
  COALESCE(subscription_tier, 'free'),
  CASE 
    WHEN subscription_tier = 'enterprise' THEN 1000000
    WHEN subscription_tier = 'pro' THEN 100000
    ELSE 10000
  END
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM ai_user_quotas)
ON CONFLICT (user_id) DO NOTHING; 