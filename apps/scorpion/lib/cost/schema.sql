-- Cost Tracking Schema
-- Financial governance for Scorpion ecosystem
-- Based on Cloud Digital Leader cost management principles

-- Resource hierarchy: Organization → Product → Environment → Service
CREATE TABLE IF NOT EXISTS cost_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Resource hierarchy
  organization VARCHAR(100) NOT NULL DEFAULT 'scorpion-systems',
  product VARCHAR(100) NOT NULL, -- agentpilot, bitbrain, scorpion-core, r-d
  environment VARCHAR(20) NOT NULL, -- dev, staging, prod
  service VARCHAR(100) NOT NULL, -- n8n, api, db, web-ui, etc.
  
  -- Resource details
  resource_type VARCHAR(50) NOT NULL, -- vps, container, api-call, storage, etc.
  resource_id VARCHAR(255), -- External ID (VPS ID, container name, etc.)
  resource_name VARCHAR(255),
  
  -- Cost tracking
  estimated_monthly_cost DECIMAL(10, 2) DEFAULT 0,
  actual_monthly_cost DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Metadata
  provider VARCHAR(100), -- kvm2, fly-io, vercel, openai, etc.
  region VARCHAR(100),
  tags JSONB DEFAULT '{}',
  
  -- Lifecycle
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  UNIQUE(organization, product, environment, service, resource_id)
);

-- Cost usage records (daily/hourly tracking)
CREATE TABLE IF NOT EXISTS cost_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES cost_resources(id) ON DELETE CASCADE,
  
  -- Time period
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  period_type VARCHAR(20) NOT NULL, -- hourly, daily, monthly
  
  -- Usage metrics
  compute_hours DECIMAL(10, 2) DEFAULT 0,
  storage_gb DECIMAL(10, 2) DEFAULT 0,
  bandwidth_gb DECIMAL(10, 2) DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  llm_tokens INTEGER DEFAULT 0,
  
  -- Cost
  cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for queries
CREATE INDEX IF NOT EXISTS idx_cost_usage_resource ON cost_usage(resource_id);
CREATE INDEX IF NOT EXISTS idx_cost_usage_period ON cost_usage(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_cost_usage_period_type ON cost_usage(period_type, period_start);

-- Budgets per product/environment
CREATE TABLE IF NOT EXISTS cost_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Budget scope
  organization VARCHAR(100) NOT NULL DEFAULT 'scorpion-systems',
  product VARCHAR(100), -- NULL = organization-wide
  environment VARCHAR(20), -- NULL = all environments
  
  -- Budget details
  budget_name VARCHAR(255) NOT NULL,
  monthly_budget DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Alerts
  warning_threshold DECIMAL(5, 2) DEFAULT 80.0, -- Percentage
  alert_threshold DECIMAL(5, 2) DEFAULT 100.0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(organization, product, environment, budget_name)
);

-- Budget alerts (when thresholds are hit)
CREATE TABLE IF NOT EXISTS cost_budget_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES cost_budgets(id) ON DELETE CASCADE,
  
  -- Alert details
  alert_type VARCHAR(20) NOT NULL, -- warning, exceeded
  current_spend DECIMAL(10, 2) NOT NULL,
  budget_amount DECIMAL(10, 2) NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL,
  
  -- Status
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by VARCHAR(255),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for budget alerts
CREATE INDEX IF NOT EXISTS idx_budget_alerts_budget ON cost_budget_alerts(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_created ON cost_budget_alerts(created_at);

-- Quotas (hard limits)
CREATE TABLE IF NOT EXISTS cost_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Quota scope
  organization VARCHAR(100) NOT NULL DEFAULT 'scorpion-systems',
  product VARCHAR(100), -- NULL = organization-wide
  environment VARCHAR(20), -- NULL = all environments
  
  -- Quota details
  quota_name VARCHAR(255) NOT NULL,
  quota_type VARCHAR(50) NOT NULL, -- vps-count, storage-gb, api-calls, llm-tokens, etc.
  limit_value DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(20), -- count, gb, calls, tokens, etc.
  
  -- Current usage (cached, updated periodically)
  current_usage DECIMAL(10, 2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(organization, product, environment, quota_name)
);

-- Helper view: Current month costs by product
CREATE OR REPLACE VIEW cost_summary_current_month AS
SELECT 
  cr.organization,
  cr.product,
  cr.environment,
  SUM(cu.cost) as total_cost,
  COUNT(DISTINCT cr.id) as resource_count,
  SUM(cu.compute_hours) as total_compute_hours,
  SUM(cu.storage_gb) as total_storage_gb,
  SUM(cu.api_calls) as total_api_calls,
  SUM(cu.llm_tokens) as total_llm_tokens
FROM cost_resources cr
LEFT JOIN cost_usage cu ON cu.resource_id = cr.id
WHERE cu.period_start >= DATE_TRUNC('month', NOW())
  AND cu.period_end <= DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
  AND cr.deleted_at IS NULL
GROUP BY cr.organization, cr.product, cr.environment;

-- Helper view: Budget vs actual
CREATE OR REPLACE VIEW cost_budget_vs_actual AS
SELECT 
  cb.organization,
  cb.product,
  cb.environment,
  cb.budget_name,
  cb.monthly_budget,
  COALESCE(csm.total_cost, 0) as actual_spend,
  CASE 
    WHEN cb.monthly_budget > 0 
    THEN (COALESCE(csm.total_cost, 0) / cb.monthly_budget * 100)
    ELSE 0
  END as percentage_used,
  CASE 
    WHEN COALESCE(csm.total_cost, 0) >= cb.monthly_budget THEN 'exceeded'
    WHEN COALESCE(csm.total_cost, 0) >= (cb.monthly_budget * cb.warning_threshold / 100) THEN 'warning'
    ELSE 'ok'
  END as status
FROM cost_budgets cb
LEFT JOIN cost_summary_current_month csm 
  ON cb.organization = csm.organization
  AND COALESCE(cb.product, '') = COALESCE(csm.product, '')
  AND COALESCE(cb.environment, '') = COALESCE(csm.environment, '')
WHERE cb.is_active = TRUE;

