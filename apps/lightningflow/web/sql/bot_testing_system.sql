-- Lightning Platform Bot Testing System Schema
-- Creates tables for automated bot testing, QA monitoring, and self-healing analytics

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bot test logs - comprehensive test execution tracking
CREATE TABLE IF NOT EXISTS bot_test_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_name TEXT NOT NULL, -- 'adminBot', 'userBot', 'qaBot'
  user_role TEXT NOT NULL, -- 'admin', 'user', 'qa', 'affiliate'
  test_route TEXT NOT NULL, -- '/dashboard', '/admin', '/simulator'
  test_type TEXT NOT NULL CHECK (test_type IN ('ui', 'api', 'flow', 'integration', 'performance')),
  test_result TEXT NOT NULL CHECK (test_result IN ('pass', 'fail', 'warning', 'skip')),
  execution_time_ms INTEGER DEFAULT 0,
  
  -- Detailed test data
  test_details JSONB DEFAULT '{}', -- Test-specific data
  error_detail JSONB DEFAULT '{}', -- Error info if failed
  screenshots TEXT[] DEFAULT '{}', -- Screenshot URLs
  network_requests JSONB DEFAULT '[]', -- API calls made during test
  performance_metrics JSONB DEFAULT '{}', -- Page load times, etc.
  
  -- Environment and context
  test_environment TEXT DEFAULT 'development', -- 'development', 'staging', 'production'
  browser_info JSONB DEFAULT '{}', -- Browser type, version, viewport
  user_agent TEXT,
  test_session_id UUID,
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  run_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bot test sessions - groups of tests run together
CREATE TABLE IF NOT EXISTS bot_test_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_name TEXT NOT NULL, -- 'nightly-full', 'pr-smoke', 'release-regression'
  trigger_type TEXT CHECK (trigger_type IN ('manual', 'cron', 'ci', 'webhook')),
  git_commit_hash TEXT,
  git_branch TEXT DEFAULT 'main',
  
  -- Session metrics
  total_tests INTEGER DEFAULT 0,
  passed_tests INTEGER DEFAULT 0,
  failed_tests INTEGER DEFAULT 0,
  warning_tests INTEGER DEFAULT 0,
  skipped_tests INTEGER DEFAULT 0,
  
  -- Timing
  session_duration_ms INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Results
  overall_status TEXT CHECK (overall_status IN ('running', 'passed', 'failed', 'partial')),
  failure_threshold DECIMAL(3,2) DEFAULT 0.1, -- Fail if >10% tests fail
  
  -- Metadata
  triggered_by TEXT, -- 'github-actions', 'manual:admin', 'cron'
  environment_config JSONB DEFAULT '{}'
);

-- Bot patch logs - track autonomous self-healing patches
CREATE TABLE IF NOT EXISTS bot_patch_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patch_id TEXT UNIQUE NOT NULL,
  patch_type TEXT NOT NULL CHECK (patch_type IN ('selector_fix', 'timeout_increase', 'dom_repair', 'api_retry', 'layout_fix')),
  description TEXT NOT NULL,
  
  -- Patch content and metadata
  patch_content TEXT NOT NULL, -- The actual patch code
  confidence DECIMAL(3,2) NOT NULL, -- AI confidence in patch (0.0-1.0)
  test_targets TEXT[] NOT NULL, -- Which test routes this patch targets
  rollback_code TEXT, -- Code to rollback the patch if needed
  
  -- Application tracking
  status TEXT CHECK (status IN ('generated', 'applied', 'tested', 'successful', 'failed', 'rolled_back')) DEFAULT 'generated',
  applied_at TIMESTAMPTZ,
  tested_at TIMESTAMPTZ,
  
  -- Results tracking
  test_success BOOLEAN, -- Did test pass after patch?
  rerun_count INTEGER DEFAULT 0, -- How many times was test rerun
  side_effects JSONB DEFAULT '{}', -- Any unintended consequences
  
  -- Related data
  original_test_log_id UUID REFERENCES bot_test_logs(id),
  validation_test_log_id UUID REFERENCES bot_test_logs(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bot user accounts - test user management
CREATE TABLE IF NOT EXISTS bot_test_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  bot_role TEXT NOT NULL, -- 'admin', 'user', 'qa', 'affiliate'
  
  -- Permissions and access
  test_permissions JSONB DEFAULT '{}',
  workspace_id UUID REFERENCES workspaces(id),
  is_active BOOLEAN DEFAULT true,
  
  -- Test data state
  test_data_state JSONB DEFAULT '{}', -- Current state for consistent testing
  reset_data_on_test BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used TIMESTAMPTZ
);

-- Bot test scenarios - reusable test definitions
CREATE TABLE IF NOT EXISTS bot_test_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_name TEXT UNIQUE NOT NULL,
  description TEXT,
  bot_type TEXT NOT NULL, -- 'adminBot', 'userBot', 'qaBot'
  
  -- Test configuration
  test_steps JSONB NOT NULL, -- Array of test steps
  expected_outcomes JSONB DEFAULT '{}',
  setup_requirements JSONB DEFAULT '{}',
  cleanup_actions JSONB DEFAULT '{}',
  
  -- Execution settings
  timeout_seconds INTEGER DEFAULT 60,
  retry_count INTEGER DEFAULT 2,
  priority INTEGER DEFAULT 5, -- 1=highest, 10=lowest
  
  -- Dependencies
  depends_on TEXT[], -- Other scenario names this depends on
  blocks TEXT[], -- Scenarios this scenario blocks
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  created_by TEXT,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bot failure analysis - AI-driven failure analysis
CREATE TABLE IF NOT EXISTS bot_failure_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_log_id UUID REFERENCES bot_test_logs(id),
  session_id UUID REFERENCES bot_test_sessions(id),
  
  -- Failure classification
  failure_category TEXT CHECK (failure_category IN ('ui_regression', 'api_error', 'performance', 'data_issue', 'environment', 'flaky')),
  severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  
  -- AI Analysis
  ai_analysis JSONB DEFAULT '{}',
  suggested_fixes TEXT[],
  similar_failures UUID[], -- References to similar past failures
  confidence_score DECIMAL(3,2), -- AI confidence in analysis
  
  -- Human review
  human_review_status TEXT CHECK (human_review_status IN ('pending', 'confirmed', 'disputed', 'resolved')),
  human_notes TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  
  -- Self-healing attempts
  self_heal_attempted BOOLEAN DEFAULT false,
  self_heal_success BOOLEAN,
  self_heal_details JSONB DEFAULT '{}',
  applied_patch_id TEXT REFERENCES bot_patch_logs(patch_id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bot performance metrics - track system performance during tests
CREATE TABLE IF NOT EXISTS bot_performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_log_id UUID REFERENCES bot_test_logs(id),
  
  -- Page performance
  page_load_time_ms INTEGER,
  first_contentful_paint_ms INTEGER,
  largest_contentful_paint_ms INTEGER,
  cumulative_layout_shift DECIMAL(5,3),
  
  -- API performance
  api_response_times JSONB DEFAULT '{}', -- {"/api/endpoint": 250}
  api_error_rates JSONB DEFAULT '{}',
  
  -- Resource usage
  memory_usage_mb INTEGER,
  cpu_usage_percent DECIMAL(5,2),
  network_requests_count INTEGER,
  total_transfer_kb INTEGER,
  
  -- Browser metrics
  js_errors INTEGER DEFAULT 0,
  console_warnings INTEGER DEFAULT 0,
  network_errors INTEGER DEFAULT 0,
  
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bot alert rules - configurable alerting
CREATE TABLE IF NOT EXISTS bot_alert_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_name TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Trigger conditions
  failure_threshold DECIMAL(3,2) DEFAULT 0.1, -- Alert if >10% tests fail
  consecutive_failures INTEGER DEFAULT 3,
  performance_threshold INTEGER, -- Alert if page load > X ms
  
  -- Alert channels
  alert_channels JSONB DEFAULT '{}', -- {"discord": "webhook_url", "slack": "webhook"}
  severity_mapping JSONB DEFAULT '{}',
  
  -- Timing
  cooldown_minutes INTEGER DEFAULT 30, -- Minimum time between alerts
  last_triggered TIMESTAMPTZ,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bot_test_logs_bot_name ON bot_test_logs(bot_name);
CREATE INDEX IF NOT EXISTS idx_bot_test_logs_test_result ON bot_test_logs(test_result);
CREATE INDEX IF NOT EXISTS idx_bot_test_logs_run_at ON bot_test_logs(run_at);
CREATE INDEX IF NOT EXISTS idx_bot_test_logs_session_id ON bot_test_logs(test_session_id);
CREATE INDEX IF NOT EXISTS idx_bot_test_sessions_status ON bot_test_sessions(overall_status);
CREATE INDEX IF NOT EXISTS idx_bot_test_sessions_started_at ON bot_test_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_bot_failure_analysis_category ON bot_failure_analysis(failure_category);
CREATE INDEX IF NOT EXISTS idx_bot_performance_metrics_test_log_id ON bot_performance_metrics(test_log_id);
CREATE INDEX IF NOT EXISTS idx_bot_patch_logs_status ON bot_patch_logs(status);
CREATE INDEX IF NOT EXISTS idx_bot_patch_logs_patch_type ON bot_patch_logs(patch_type);
CREATE INDEX IF NOT EXISTS idx_bot_patch_logs_applied_at ON bot_patch_logs(applied_at);

-- Enable Row Level Security
ALTER TABLE bot_test_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_test_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_test_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_failure_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_patch_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Bot test logs: Allow system access
CREATE POLICY "Allow system access to bot test logs" ON bot_test_logs
  FOR ALL USING (true); -- System-level access for bots

-- Bot test sessions: Allow system access
CREATE POLICY "Allow system access to bot test sessions" ON bot_test_sessions
  FOR ALL USING (true);

-- Bot patch logs: Allow system access
CREATE POLICY "Allow system access to bot patch logs" ON bot_patch_logs
  FOR ALL USING (true);

-- Bot test users: Restrict to system access
CREATE POLICY "System access only for bot test users" ON bot_test_users
  FOR ALL USING (true);

-- Functions

-- Calculate session success rate
CREATE OR REPLACE FUNCTION calculate_session_success_rate(session_id_param UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_tests INTEGER;
  passed_tests INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_tests
  FROM bot_test_logs
  WHERE test_session_id = session_id_param;
  
  IF total_tests = 0 THEN
    RETURN 0.0;
  END IF;
  
  SELECT COUNT(*) INTO passed_tests
  FROM bot_test_logs
  WHERE test_session_id = session_id_param AND test_result = 'pass';
  
  RETURN (passed_tests::DECIMAL / total_tests) * 100;
END;
$$ LANGUAGE plpgsql;

-- Get patch effectiveness analytics
CREATE OR REPLACE FUNCTION get_patch_effectiveness(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  patch_type TEXT,
  total_patches BIGINT,
  successful_patches BIGINT,
  success_rate DECIMAL,
  avg_confidence DECIMAL,
  avg_rerun_count DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    logs.patch_type,
    COUNT(*)::BIGINT as total_patches,
    COUNT(*) FILTER (WHERE logs.test_success = true)::BIGINT as successful_patches,
    (COUNT(*) FILTER (WHERE logs.test_success = true)::DECIMAL / COUNT(*)) * 100 as success_rate,
    AVG(logs.confidence)::DECIMAL as avg_confidence,
    AVG(logs.rerun_count)::DECIMAL as avg_rerun_count
  FROM bot_patch_logs logs
  WHERE logs.applied_at > NOW() - INTERVAL '%s days' 
  GROUP BY logs.patch_type
  ORDER BY success_rate DESC;
END;
$$ LANGUAGE plpgsql;

-- Get bot test analytics
CREATE OR REPLACE FUNCTION get_bot_test_analytics(days_back INTEGER DEFAULT 7)
RETURNS TABLE (
  bot_name TEXT,
  total_tests BIGINT,
  success_rate DECIMAL,
  avg_execution_time DECIMAL,
  failure_trends JSONB,
  patches_applied BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    logs.bot_name,
    COUNT(*)::BIGINT as total_tests,
    (COUNT(*) FILTER (WHERE logs.test_result = 'pass')::DECIMAL / COUNT(*)) * 100 as success_rate,
    AVG(logs.execution_time_ms)::DECIMAL as avg_execution_time,
    jsonb_build_object(
      'recent_failures', COUNT(*) FILTER (WHERE logs.test_result = 'fail' AND logs.run_at > NOW() - INTERVAL '24 hours'),
      'critical_failures', COUNT(*) FILTER (WHERE failure.severity = 'critical'),
      'self_healed', COUNT(*) FILTER (WHERE failure.self_heal_attempted = true)
    ) as failure_trends,
    COUNT(DISTINCT failure.applied_patch_id) FILTER (WHERE failure.applied_patch_id IS NOT NULL)::BIGINT as patches_applied
  FROM bot_test_logs logs
  LEFT JOIN bot_failure_analysis failure ON failure.test_log_id = logs.id
  WHERE logs.run_at > NOW() - INTERVAL '%s days' 
  GROUP BY logs.bot_name
  ORDER BY success_rate DESC;
END;
$$ LANGUAGE plpgsql;

-- Auto-trigger self-healing function
CREATE OR REPLACE FUNCTION trigger_self_healing()
RETURNS TRIGGER AS $$
DECLARE
  recent_failures INTEGER;
  bot_name_var TEXT;
  test_route_var TEXT;
BEGIN
  -- Only trigger on test failures
  IF NEW.test_result != 'fail' THEN
    RETURN NEW;
  END IF;

  bot_name_var := NEW.bot_name;
  test_route_var := NEW.test_route;

  -- Count recent failures for same bot + route
  SELECT COUNT(*) INTO recent_failures
  FROM bot_test_logs
  WHERE bot_name = bot_name_var
    AND test_route = test_route_var
    AND test_result = 'fail'
    AND run_at > NOW() - INTERVAL '1 hour';

  -- Trigger self-healing after 3 failures
  IF recent_failures >= 3 THEN
    -- Insert notification for self-healing trigger
    INSERT INTO bot_failure_analysis (
      test_log_id,
      failure_category,
      severity,
      ai_analysis,
      self_heal_attempted
    ) VALUES (
      NEW.id,
      'auto_detected',
      'medium',
      jsonb_build_object(
        'trigger_reason', 'consecutive_failures',
        'failure_count', recent_failures,
        'auto_heal_eligible', true
      ),
      false
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update session statistics trigger
CREATE OR REPLACE FUNCTION update_session_statistics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE bot_test_sessions
  SET 
    total_tests = (
      SELECT COUNT(*) FROM bot_test_logs 
      WHERE test_session_id = NEW.test_session_id
    ),
    passed_tests = (
      SELECT COUNT(*) FROM bot_test_logs 
      WHERE test_session_id = NEW.test_session_id AND test_result = 'pass'
    ),
    failed_tests = (
      SELECT COUNT(*) FROM bot_test_logs 
      WHERE test_session_id = NEW.test_session_id AND test_result = 'fail'
    ),
    warning_tests = (
      SELECT COUNT(*) FROM bot_test_logs 
      WHERE test_session_id = NEW.test_session_id AND test_result = 'warning'
    ),
    skipped_tests = (
      SELECT COUNT(*) FROM bot_test_logs 
      WHERE test_session_id = NEW.test_session_id AND test_result = 'skip'
    )
  WHERE id = NEW.test_session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_session_statistics
  AFTER INSERT ON bot_test_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_session_statistics();

CREATE TRIGGER trigger_auto_heal
  AFTER INSERT ON bot_test_logs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_self_healing();

-- Insert default bot users
INSERT INTO bot_test_users (email, password_hash, display_name, bot_role, test_permissions) VALUES 
('sneve1@bot.dev', '$2a$10$example_hash', 'Admin Bot User', 'admin', '{"admin_access": true, "full_dashboard": true}'),
('testuser1@bot.dev', '$2a$10$example_hash', 'Standard Bot User', 'user', '{"user_dashboard": true, "simulator": true}'),
('quality@bot.dev', '$2a$10$example_hash', 'QA Bot User', 'qa', '{"tutorials": true, "ai_assistant": true}')
ON CONFLICT (email) DO NOTHING;

-- Insert default test scenarios
INSERT INTO bot_test_scenarios (scenario_name, description, bot_type, test_steps, priority, tags) VALUES 
('admin_dashboard_load', 'Test admin dashboard loads and shows key metrics', 'adminBot', 
 '[{"action": "navigate", "url": "/admin"}, {"action": "check_element", "selector": "[data-testid=\"revenue-card\"]"}, {"action": "check_text", "contains": "MRR"}]', 
 1, ARRAY['admin', 'dashboard', 'smoke']),
('user_simulator_access', 'Test user can access simulator and perform loop out', 'userBot',
 '[{"action": "navigate", "url": "/dashboard/simulator"}, {"action": "click", "selector": "[data-testid=\"loop-out-button\"]"}, {"action": "wait_for", "selector": ".simulation-results"}]',
 2, ARRAY['user', 'simulator', 'core']),
('ai_assistant_query', 'Test AI assistant responds to Lightning questions', 'qaBot',
 '[{"action": "navigate", "url": "/ai-assistant"}, {"action": "type", "selector": "[data-testid=\"ai-input\"]", "text": "What is a loop out?"}, {"action": "click", "selector": "[data-testid=\"send-button\"]"}, {"action": "wait_for", "selector": ".assistant-response"}]',
 3, ARRAY['ai', 'assistant', 'integration'])
ON CONFLICT (scenario_name) DO NOTHING;

-- Insert default alert rules
INSERT INTO bot_alert_rules (rule_name, description, failure_threshold, alert_channels) VALUES 
('critical_system_failure', 'Alert when >20% of tests fail', 0.20, '{"discord": "webhook_url", "severity": "critical"}'),
('performance_degradation', 'Alert when page load times exceed 5 seconds', 0.05, '{"slack": "webhook_url", "severity": "warning"}'),
('self_heal_failure', 'Alert when self-healing patches fail repeatedly', 0.10, '{"discord": "webhook_url", "severity": "high"}')
ON CONFLICT (rule_name) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE bot_test_logs IS 'Comprehensive logging of bot test executions';
COMMENT ON TABLE bot_test_sessions IS 'Groups of tests run together with session-level metrics';
COMMENT ON TABLE bot_test_users IS 'Dedicated test user accounts for bot testing';
COMMENT ON TABLE bot_test_scenarios IS 'Reusable test scenario definitions';
COMMENT ON TABLE bot_failure_analysis IS 'AI-driven analysis of test failures';
COMMENT ON TABLE bot_performance_metrics IS 'Performance metrics captured during tests';
COMMENT ON TABLE bot_alert_rules IS 'Configurable alerting rules for test failures';
COMMENT ON TABLE bot_patch_logs IS 'Tracking of autonomous self-healing patches';

COMMENT ON FUNCTION calculate_session_success_rate(UUID) IS 'Calculates success rate for a test session';
COMMENT ON FUNCTION get_bot_test_analytics(INTEGER) IS 'Returns comprehensive bot test analytics for specified time period';
COMMENT ON FUNCTION get_patch_effectiveness(INTEGER) IS 'Returns self-healing patch effectiveness metrics';
COMMENT ON FUNCTION trigger_self_healing() IS 'Auto-triggers self-healing after consecutive failures'; 