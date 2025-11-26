-- Admin System Database Schema
-- This file contains all the database tables and policies needed for the admin system

-- =============================================================================
-- 1. PROFILES TABLE (Enhanced for admin system)
-- =============================================================================

-- Create profiles table with admin and bot flags
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  is_bot BOOLEAN DEFAULT FALSE,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (except admin/bot flags)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();

-- =============================================================================
-- 2. ADMIN EVENT LOG TABLE
-- =============================================================================

-- Table to log all admin-relevant events
CREATE TABLE IF NOT EXISTS admin_event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_event_log_user_id ON admin_event_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_event_log_event_type ON admin_event_log(event_type);
CREATE INDEX IF NOT EXISTS idx_admin_event_log_created_at ON admin_event_log(created_at);

-- RLS for admin event log
ALTER TABLE admin_event_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view event logs
CREATE POLICY "Admins can view event logs" ON admin_event_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Function to log events
CREATE OR REPLACE FUNCTION log_admin_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO admin_event_log (user_id, event_type, event_data, ip_address, user_agent)
  VALUES (p_user_id, p_event_type, p_event_data, p_ip_address, p_user_agent)
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 3. BOT TEST RESULTS TABLE
-- =============================================================================

-- Table to store bot test results
CREATE TABLE IF NOT EXISTS bot_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  configuration JSONB NOT NULL,
  summary JSONB,
  detailed_results JSONB,
  status TEXT CHECK (status IN ('running', 'completed', 'failed')) DEFAULT 'running',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_bot_test_results_admin_user_id ON bot_test_results(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_bot_test_results_status ON bot_test_results(status);
CREATE INDEX IF NOT EXISTS idx_bot_test_results_created_at ON bot_test_results(created_at);

-- RLS for bot test results
ALTER TABLE bot_test_results ENABLE ROW LEVEL SECURITY;

-- Admins can view all bot test results
CREATE POLICY "Admins can view bot test results" ON bot_test_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- =============================================================================
-- 4. API USAGE LOGS TABLE
-- =============================================================================

-- Table to track API usage for monitoring
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  request_body_size INTEGER,
  response_body_size INTEGER,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_endpoint ON api_usage_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs(created_at);

-- RLS for API usage logs
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own API usage
CREATE POLICY "Users can view own API usage" ON api_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all API usage
CREATE POLICY "Admins can view all API usage" ON api_usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- =============================================================================
-- 5. LIGHTNING USAGE LOGS TABLE
-- =============================================================================

-- Table to track Lightning Network usage
CREATE TABLE IF NOT EXISTS lightning_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- 'invoice_created', 'payment_sent', 'channel_opened', etc.
  amount_sats BIGINT,
  fee_sats BIGINT,
  invoice_id TEXT,
  payment_hash TEXT,
  channel_id TEXT,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_lightning_usage_logs_user_id ON lightning_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_lightning_usage_logs_action_type ON lightning_usage_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_lightning_usage_logs_created_at ON lightning_usage_logs(created_at);

-- RLS for Lightning usage logs
ALTER TABLE lightning_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own Lightning usage
CREATE POLICY "Users can view own Lightning usage" ON lightning_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all Lightning usage
CREATE POLICY "Admins can view all Lightning usage" ON lightning_usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- =============================================================================
-- 6. AI USAGE LOGS TABLE
-- =============================================================================

-- Table to track AI API usage
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  model TEXT NOT NULL,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  cost_usd DECIMAL(10, 6),
  request_type TEXT, -- 'chat', 'completion', 'embedding', etc.
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_model ON ai_usage_logs(model);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON ai_usage_logs(created_at);

-- RLS for AI usage logs
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own AI usage
CREATE POLICY "Users can view own AI usage" ON ai_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all AI usage
CREATE POLICY "Admins can view all AI usage" ON ai_usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- =============================================================================
-- 7. ADMIN FUNCTIONS AND VIEWS
-- =============================================================================

-- Function to get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles WHERE is_bot = FALSE),
    'total_bots', (SELECT COUNT(*) FROM profiles WHERE is_bot = TRUE),
    'active_users_24h', (
      SELECT COUNT(*) FROM profiles 
      WHERE is_bot = FALSE 
      AND last_seen_at > NOW() - INTERVAL '24 hours'
    ),
    'total_api_calls_24h', (
      SELECT COUNT(*) FROM api_usage_logs 
      WHERE created_at > NOW() - INTERVAL '24 hours'
    ),
    'total_lightning_txns_24h', (
      SELECT COUNT(*) FROM lightning_usage_logs 
      WHERE created_at > NOW() - INTERVAL '24 hours'
    ),
    'total_ai_requests_24h', (
      SELECT COUNT(*) FROM ai_usage_logs 
      WHERE created_at > NOW() - INTERVAL '24 hours'
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to admins
REVOKE EXECUTE ON FUNCTION get_admin_dashboard_stats() FROM PUBLIC;

-- View for admin user overview
CREATE OR REPLACE VIEW admin_user_overview AS
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.is_admin,
  p.is_bot,
  p.last_seen_at,
  p.created_at,
  COALESCE(api_stats.api_calls_24h, 0) as api_calls_24h,
  COALESCE(ln_stats.lightning_txns_24h, 0) as lightning_txns_24h,
  COALESCE(ai_stats.ai_requests_24h, 0) as ai_requests_24h
FROM profiles p
LEFT JOIN (
  SELECT user_id, COUNT(*) as api_calls_24h
  FROM api_usage_logs
  WHERE created_at > NOW() - INTERVAL '24 hours'
  GROUP BY user_id
) api_stats ON p.id = api_stats.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as lightning_txns_24h
  FROM lightning_usage_logs
  WHERE created_at > NOW() - INTERVAL '24 hours'
  GROUP BY user_id
) ln_stats ON p.id = ln_stats.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as ai_requests_24h
  FROM ai_usage_logs
  WHERE created_at > NOW() - INTERVAL '24 hours'
  GROUP BY user_id
) ai_stats ON p.id = ai_stats.user_id;

-- =============================================================================
-- 8. INITIAL ADMIN USER SETUP
-- =============================================================================

-- Function to make a user admin (to be called manually)
CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Find user by email
  SELECT id INTO user_record FROM auth.users WHERE email = user_email;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Update profile to make admin
  INSERT INTO profiles (id, email, is_admin) 
  VALUES (user_record.id, user_email, TRUE)
  ON CONFLICT (id) 
  DO UPDATE SET is_admin = TRUE, email = user_email;
  
  -- Log the event
  PERFORM log_admin_event(
    user_record.id,
    'admin_status_granted',
    jsonb_build_object('granted_by', 'system', 'email', user_email)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 9. CLEANUP FUNCTIONS
-- =============================================================================

-- Function to clean up old logs (to be run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Clean up old admin event logs
  DELETE FROM admin_event_log 
  WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Clean up old API usage logs
  DELETE FROM api_usage_logs 
  WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
  
  -- Clean up old Lightning usage logs (keep longer for accounting)
  DELETE FROM lightning_usage_logs 
  WHERE created_at < NOW() - INTERVAL '1 day' * (days_to_keep * 2);
  
  -- Clean up old AI usage logs
  DELETE FROM ai_usage_logs 
  WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 10. EXAMPLE USAGE
-- =============================================================================

/*
-- To make a user admin:
SELECT make_user_admin('admin@example.com');

-- To get dashboard stats:
SELECT get_admin_dashboard_stats();

-- To clean up old logs:
SELECT cleanup_old_logs(30); -- Keep 30 days of logs

-- To log an admin event:
SELECT log_admin_event(
  auth.uid(),
  'user_deleted',
  jsonb_build_object('deleted_user_id', 'some-uuid', 'reason', 'admin_action')
);
*/ 