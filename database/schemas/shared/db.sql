-- LightningFlow AI Database Schema
-- Canonical database schema for LightningFlow AI system
-- This file is the single source of truth for database structure

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE agent_type AS ENUM ('research', 'content', 'automation', 'analysis');
CREATE TYPE agent_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE webhook_event_type AS ENUM ('payment_received', 'payment_sent', 'invoice_created', 'invoice_paid');
CREATE TYPE environment_type AS ENUM ('int', 'staging', 'prod');

-- Create tenants table for multi-tenant support
CREATE TABLE tenants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT true,
  subscription_tier subscription_tier DEFAULT 'free',
  billing_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create tenant_users junction table for multi-tenant access
CREATE TABLE tenant_users (
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
  PRIMARY KEY (tenant_id, user_id)
);

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  
  -- User preferences and settings
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
  timezone TEXT DEFAULT 'UTC',
  
  -- Subscription details
  subscription_tier subscription_tier DEFAULT 'free',
  billing_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  
  -- Node configuration
  node_pubkey TEXT,
  node_alias TEXT,
  node_host TEXT,
  node_port INTEGER,
  node_macaroon TEXT,
  node_tls_cert TEXT,
  
  -- Feature flags and preferences
  feature_flags JSONB DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0
);

-- Create payments table
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Payment details
  amount_sats INTEGER NOT NULL CHECK (amount_sats > 0),
  description TEXT,
  status payment_status DEFAULT 'pending',
  
  -- Lightning Network details
  payment_hash TEXT UNIQUE,
  payment_preimage TEXT,
  payment_route JSONB,
  fees_sats INTEGER DEFAULT 0,
  
  -- Recipient information
  recipient TEXT,
  recipient_pubkey TEXT,
  
  -- Timing
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0
);

-- Create invoices table
CREATE TABLE invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Invoice details
  amount_sats INTEGER NOT NULL CHECK (amount_sats > 0),
  description TEXT,
  status payment_status DEFAULT 'pending',
  
  -- Lightning Network details
  payment_request TEXT UNIQUE,
  payment_hash TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  
  -- Timing
  paid_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  webhook_url TEXT
);

-- Create AI agents table
CREATE TABLE ai_agents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Agent details
  agent_type agent_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status agent_status DEFAULT 'pending',
  
  -- Task configuration
  task_type TEXT NOT NULL,
  parameters JSONB DEFAULT '{}'::jsonb,
  model TEXT,
  
  -- Execution details
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Results
  result_summary TEXT,
  result_data JSONB,
  error_message TEXT,
  
  -- Resource usage
  tokens_used INTEGER,
  cost_sats INTEGER,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  retry_count INTEGER DEFAULT 0
);

-- Create webhooks table
CREATE TABLE webhooks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Webhook details
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT,
  active BOOLEAN DEFAULT true,
  
  -- Event filtering
  event_types TEXT[] DEFAULT '{}',
  filters JSONB DEFAULT '{}'::jsonb,
  
  -- Statistics
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  last_request_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create webhook_events table for audit trail
CREATE TABLE webhook_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE NOT NULL,
  
  -- Event details
  event_type webhook_event_type NOT NULL,
  event_data JSONB NOT NULL,
  
  -- Delivery details
  delivery_status TEXT DEFAULT 'pending', -- 'pending', 'delivered', 'failed', 'retrying'
  delivery_attempts INTEGER DEFAULT 0,
  last_delivery_attempt TIMESTAMPTZ,
  next_delivery_attempt TIMESTAMPTZ,
  
  -- Response details
  response_status INTEGER,
  response_body TEXT,
  response_headers JSONB,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create feature_flags table for runtime configuration
CREATE TABLE feature_flags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Flag details
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('boolean', 'string', 'number')),
  default_value JSONB NOT NULL,
  
  -- Environment-specific values
  int_value JSONB,
  staging_value JSONB,
  prod_value JSONB,
  
  -- Metadata
  sunset_on TIMESTAMPTZ,
  deprecation_notice TEXT,
  requires_restart BOOLEAN DEFAULT false,
  affects_performance BOOLEAN DEFAULT false,
  security_sensitive BOOLEAN DEFAULT false,
  
  -- Audit
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

-- Create audit_log table for system audit trail
CREATE TABLE audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Event details
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  
  -- Actor information
  user_id UUID REFERENCES profiles(id),
  tenant_id UUID REFERENCES tenants(id),
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  
  -- Resource information
  resource_type TEXT,
  resource_id UUID,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create system_health table for health check history
CREATE TABLE system_health (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Health check details
  check_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
  response_time_ms INTEGER,
  
  -- Service details
  service_name TEXT,
  service_version TEXT,
  environment environment_type,
  
  -- Error details
  error_message TEXT,
  error_code TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_amount_sats ON payments(amount_sats);
CREATE INDEX idx_payments_payment_hash ON payments(payment_hash);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);
CREATE INDEX idx_invoices_payment_request ON invoices(payment_request);
CREATE INDEX idx_invoices_payment_hash ON invoices(payment_hash);

CREATE INDEX idx_ai_agents_user_id ON ai_agents(user_id);
CREATE INDEX idx_ai_agents_tenant_id ON ai_agents(tenant_id);
CREATE INDEX idx_ai_agents_agent_type ON ai_agents(agent_type);
CREATE INDEX idx_ai_agents_status ON ai_agents(status);
CREATE INDEX idx_ai_agents_created_at ON ai_agents(created_at);

CREATE INDEX idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX idx_webhooks_tenant_id ON webhooks(tenant_id);
CREATE INDEX idx_webhooks_active ON webhooks(active);

CREATE INDEX idx_webhook_events_webhook_id ON webhook_events(webhook_id);
CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at);
CREATE INDEX idx_webhook_events_delivery_status ON webhook_events(delivery_status);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_tenant_id ON audit_log(tenant_id);
CREATE INDEX idx_audit_log_event_type ON audit_log(event_type);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_resource_type ON audit_log(resource_type);
CREATE INDEX idx_audit_log_resource_id ON audit_log(resource_id);

CREATE INDEX idx_system_health_check_type ON system_health(check_type);
CREATE INDEX idx_system_health_status ON system_health(status);
CREATE INDEX idx_system_health_created_at ON system_health(created_at);
CREATE INDEX idx_system_health_service_name ON system_health(service_name);

-- Create RLS policies
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments" ON payments
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for invoices
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own invoices" ON invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for AI agents
CREATE POLICY "Users can view own AI agents" ON ai_agents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI agents" ON ai_agents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI agents" ON ai_agents
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for webhooks
CREATE POLICY "Users can view own webhooks" ON webhooks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own webhooks" ON webhooks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own webhooks" ON webhooks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own webhooks" ON webhooks
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for webhook events
CREATE POLICY "Users can view own webhook events" ON webhook_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM webhooks 
      WHERE webhooks.id = webhook_events.webhook_id 
      AND webhooks.user_id = auth.uid()
    )
  );

-- RLS Policies for audit log (read-only for users)
CREATE POLICY "Users can view own audit log" ON audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for tenant_users
CREATE POLICY "Users can view tenant memberships" ON tenant_users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Tenant owners can manage memberships" ON tenant_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tenant_users tu
      WHERE tu.tenant_id = tenant_users.tenant_id
      AND tu.user_id = auth.uid()
      AND tu.role = 'owner'
    )
  );

-- RLS Policies for tenants
CREATE POLICY "Users can view tenant details" ON tenants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tenant_users
      WHERE tenant_users.tenant_id = tenants.id
      AND tenant_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant owners can update tenant" ON tenants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tenant_users
      WHERE tenant_users.tenant_id = tenants.id
      AND tenant_users.user_id = auth.uid()
      AND tenant_users.role = 'owner'
    )
  );

-- Create functions for common operations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON ai_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for audit logging
CREATE OR REPLACE FUNCTION log_audit_event(
  p_event_type TEXT,
  p_event_data JSONB,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO audit_log (
    event_type,
    event_data,
    user_id,
    tenant_id,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    p_event_type,
    p_event_data,
    auth.uid(),
    (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid() LIMIT 1),
    p_resource_type,
    p_resource_id,
    p_metadata
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for health check logging
CREATE OR REPLACE FUNCTION log_health_check(
  p_check_type TEXT,
  p_status TEXT,
  p_response_time_ms INTEGER DEFAULT NULL,
  p_service_name TEXT DEFAULT NULL,
  p_service_version TEXT DEFAULT NULL,
  p_environment environment_type DEFAULT 'int',
  p_error_message TEXT DEFAULT NULL,
  p_error_code TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  health_id UUID;
BEGIN
  INSERT INTO system_health (
    check_type,
    status,
    response_time_ms,
    service_name,
    service_version,
    environment,
    error_message,
    error_code,
    metadata
  ) VALUES (
    p_check_type,
    p_status,
    p_response_time_ms,
    p_service_name,
    p_service_version,
    p_environment,
    p_error_message,
    p_error_code,
    p_metadata
  ) RETURNING id INTO health_id;
  
  RETURN health_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create views for common queries
CREATE VIEW user_payment_summary AS
SELECT 
  p.user_id,
  COUNT(*) as total_payments,
  COUNT(*) FILTER (WHERE p.status = 'completed') as completed_payments,
  COUNT(*) FILTER (WHERE p.status = 'failed') as failed_payments,
  SUM(p.amount_sats) FILTER (WHERE p.status = 'completed') as total_amount_sats,
  AVG(p.amount_sats) FILTER (WHERE p.status = 'completed') as avg_amount_sats,
  MAX(p.created_at) as last_payment_at
FROM payments p
GROUP BY p.user_id;

CREATE VIEW tenant_payment_summary AS
SELECT 
  p.tenant_id,
  COUNT(*) as total_payments,
  COUNT(*) FILTER (WHERE p.status = 'completed') as completed_payments,
  COUNT(*) FILTER (WHERE p.status = 'failed') as failed_payments,
  SUM(p.amount_sats) FILTER (WHERE p.status = 'completed') as total_amount_sats,
  AVG(p.amount_sats) FILTER (WHERE p.status = 'completed') as avg_amount_sats,
  MAX(p.created_at) as last_payment_at
FROM payments p
WHERE p.tenant_id IS NOT NULL
GROUP BY p.tenant_id;

CREATE VIEW ai_agent_summary AS
SELECT 
  a.user_id,
  a.agent_type,
  COUNT(*) as total_tasks,
  COUNT(*) FILTER (WHERE a.status = 'completed') as completed_tasks,
  COUNT(*) FILTER (WHERE a.status = 'failed') as failed_tasks,
  AVG(a.duration_seconds) FILTER (WHERE a.status = 'completed') as avg_duration_seconds,
  SUM(a.tokens_used) FILTER (WHERE a.status = 'completed') as total_tokens_used,
  SUM(a.cost_sats) FILTER (WHERE a.status = 'completed') as total_cost_sats,
  MAX(a.created_at) as last_task_at
FROM ai_agents a
GROUP BY a.user_id, a.agent_type;

-- Create materialized views for analytics (refresh periodically)
CREATE MATERIALIZED VIEW daily_payment_analytics AS
SELECT 
  DATE(created_at) as payment_date,
  COUNT(*) as total_payments,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_payments,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_payments,
  SUM(amount_sats) FILTER (WHERE status = 'completed') as total_amount_sats,
  AVG(amount_sats) FILTER (WHERE status = 'completed') as avg_amount_sats,
  SUM(fees_sats) FILTER (WHERE status = 'completed') as total_fees_sats
FROM payments
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at)
ORDER BY payment_date DESC;

CREATE UNIQUE INDEX ON daily_payment_analytics (payment_date);

-- Create function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_payment_analytics;
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job to refresh analytics (requires pg_cron extension)
-- SELECT cron.schedule('refresh-analytics', '0 2 * * *', 'SELECT refresh_analytics_views();');

-- Insert default feature flags
INSERT INTO feature_flags (name, description, flag_type, default_value, int_value, staging_value, prod_value) VALUES
('NEW_DASHBOARD', 'Enable the new dashboard UI', 'boolean', 'false', 'true', 'false', 'false'),
('AI_SECTIONS', 'Enable AI-powered sections in the UI', 'boolean', 'true', 'true', 'true', 'true'),
('BOOST_BUSINESS', 'Enable business boost features', 'boolean', 'false', 'true', 'false', 'false'),
('EARNINGS_ANALYTICS', 'Enable earnings analytics dashboard', 'boolean', 'true', 'true', 'true', 'true'),
('PAYMENT_HISTORY', 'Enable detailed payment history', 'boolean', 'true', 'true', 'true', 'true'),
('SETTINGS_CENTER', 'Enable centralized settings management', 'boolean', 'true', 'true', 'true', 'true'),
('AI_AGENT_RESEARCH', 'Enable AI research agent functionality', 'boolean', 'false', 'true', 'false', 'false'),
('AI_AGENT_CONTENT', 'Enable AI content generation agent', 'boolean', 'false', 'true', 'false', 'false'),
('AI_AGENT_AUTOMATION', 'Enable AI automation agent', 'boolean', 'false', 'true', 'false', 'false'),
('MULTI_TENANT', 'Enable multi-tenant support', 'boolean', 'false', 'true', 'false', 'false'),
('ADVANCED_ANALYTICS', 'Enable advanced analytics features', 'boolean', 'false', 'true', 'false', 'false'),
('REAL_TIME_NOTIFICATIONS', 'Enable real-time notifications via WebSocket', 'boolean', 'true', 'true', 'true', 'true'),
('WEBHOOK_VALIDATION', 'Enable strict webhook signature validation', 'boolean', 'true', 'true', 'true', 'true'),
('RATE_LIMITING', 'Enable API rate limiting', 'boolean', 'true', 'true', 'true', 'true'),
('MAINTENANCE_MODE', 'Enable maintenance mode (read-only)', 'boolean', 'false', 'false', 'false', 'false'),
('DEBUG_LOGGING', 'Enable debug-level logging', 'boolean', 'false', 'true', 'false', 'false'),
('PERFORMANCE_MONITORING', 'Enable performance monitoring and metrics', 'boolean', 'true', 'true', 'true', 'true'),
('AUTO_BACKUP', 'Enable automatic database backups', 'boolean', 'true', 'false', 'true', 'true'),
('MAX_CONCURRENT_JOBS', 'Maximum number of concurrent background jobs', 'number', '8', '4', '8', '16'),
('PAYMENT_TIMEOUT_SECONDS', 'Payment timeout in seconds', 'number', '300', '60', '300', '300'),
('CACHE_TTL_SECONDS', 'Default cache TTL in seconds', 'number', '3600', '300', '1800', '3600'),
('MAX_PAYMENT_AMOUNT_SATS', 'Maximum payment amount in satoshis', 'number', '10000000', '1000000', '10000000', '10000000'),
('MIN_PAYMENT_AMOUNT_SATS', 'Minimum payment amount in satoshis', 'number', '1', '1', '1', '1'),
('DEFAULT_TIMEZONE', 'Default timezone for the application', 'string', 'UTC', 'UTC', 'UTC', 'UTC'),
('LOG_LEVEL', 'Application log level', 'string', 'info', 'debug', 'info', 'warn'),
('API_VERSION', 'API version to use', 'string', 'v1', 'v1', 'v1', 'v1'),
('FEATURE_ROLLOUT_PERCENTAGE', 'Percentage of users to include in feature rollouts', 'number', '100', '100', '100', '10');

-- Create comments for documentation
COMMENT ON TABLE tenants IS 'Multi-tenant business nodes with subscription management';
COMMENT ON TABLE profiles IS 'User profiles with Lightning Network node configuration';
COMMENT ON TABLE payments IS 'Lightning Network payments with full audit trail';
COMMENT ON TABLE invoices IS 'Lightning Network invoices for receiving payments';
COMMENT ON TABLE ai_agents IS 'AI agent tasks and execution history';
COMMENT ON TABLE webhooks IS 'Webhook endpoints for external integrations';
COMMENT ON TABLE webhook_events IS 'Webhook delivery audit trail';
COMMENT ON TABLE feature_flags IS 'Runtime feature flag configuration';
COMMENT ON TABLE audit_log IS 'System audit trail for compliance';
COMMENT ON TABLE system_health IS 'Health check history and monitoring';

COMMENT ON COLUMN payments.amount_sats IS 'Amount in satoshis (integer, never use float for currency)';
COMMENT ON COLUMN payments.fees_sats IS 'Routing fees in satoshis';
COMMENT ON COLUMN invoices.amount_sats IS 'Amount in satoshis (integer, never use float for currency)';
COMMENT ON COLUMN ai_agents.cost_sats IS 'AI agent cost in satoshis';
COMMENT ON COLUMN feature_flags.default_value IS 'Default flag value (JSONB for type flexibility)';
COMMENT ON COLUMN feature_flags.int_value IS 'Integration environment flag value';
COMMENT ON COLUMN feature_flags.staging_value IS 'Staging environment flag value';
COMMENT ON COLUMN feature_flags.prod_value IS 'Production environment flag value';








