-- Master Orchestration System Database Schema
-- This schema supports the fully connected professional workflow system

-- Master Analytics Table - Stores orchestration-level analytics
CREATE TABLE IF NOT EXISTS master_analytics (
  id SERIAL PRIMARY KEY,
  master_request_id VARCHAR(255) UNIQUE NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  
  -- Request metadata
  primary_service VARCHAR(100) NOT NULL,
  sub_service VARCHAR(100),
  user_id VARCHAR(255),
  service_tier VARCHAR(50) DEFAULT 'basic',
  priority VARCHAR(50) DEFAULT 'normal',
  
  -- Workflow execution results
  workflow_executions JSONB,
  
  -- Performance metrics
  total_execution_time INTEGER,
  total_tokens_used INTEGER,
  success_rate DECIMAL(5,4),
  workflows_executed INTEGER,
  
  -- Business metrics
  service_tier_usage VARCHAR(50),
  feature_utilization INTEGER,
  user_engagement VARCHAR(50),
  
  -- Quality metrics
  overall_success BOOLEAN,
  average_response_size INTEGER,
  error_count INTEGER,
  
  -- System status
  analytics_stored BOOLEAN DEFAULT false,
  notifications_sent BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Content Creations Table - Stores AI-generated content
CREATE TABLE IF NOT EXISTS content_creations (
  id SERIAL PRIMARY KEY,
  request_id VARCHAR(255) UNIQUE NOT NULL,
  master_request_id VARCHAR(255),
  content_type VARCHAR(100) NOT NULL,
  topic TEXT NOT NULL,
  user_id VARCHAR(255),
  service_tier VARCHAR(50) DEFAULT 'basic',
  generated_content TEXT,
  optimization_recommendations TEXT,
  word_count INTEGER,
  platforms TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign key to master analytics
  FOREIGN KEY (master_request_id) REFERENCES master_analytics(master_request_id) ON DELETE SET NULL
);

-- Support Tickets Table - Stores support interactions
CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  request_id VARCHAR(255) UNIQUE NOT NULL,
  master_request_id VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  priority VARCHAR(50) DEFAULT 'normal',
  urgency VARCHAR(50) DEFAULT 'medium',
  user_id VARCHAR(255),
  service_tier VARCHAR(50) DEFAULT 'basic',
  query TEXT NOT NULL,
  context TEXT,
  support_response TEXT,
  quality_score DECIMAL(3,1),
  platform VARCHAR(100),
  device VARCHAR(100),
  browser VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign key to master analytics
  FOREIGN KEY (master_request_id) REFERENCES master_analytics(master_request_id) ON DELETE SET NULL
);

-- Enhanced Research Reports Table - Stores comprehensive research data
CREATE TABLE IF NOT EXISTS research_reports (
  id SERIAL PRIMARY KEY,
  request_id VARCHAR(255) UNIQUE NOT NULL,
  master_request_id VARCHAR(255),
  question TEXT NOT NULL,
  research_data JSONB,
  quality_score DECIMAL(3,1),
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign key to master analytics
  FOREIGN KEY (master_request_id) REFERENCES master_analytics(master_request_id) ON DELETE SET NULL
);

-- Enhanced Conversations Table - Stores AI SaaS interactions
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  request_id VARCHAR(255) UNIQUE NOT NULL,
  master_request_id VARCHAR(255),
  user_id VARCHAR(255),
  session_id VARCHAR(255),
  action_type VARCHAR(50),
  user_input TEXT,
  ai_response TEXT,
  service_tier VARCHAR(50),
  tokens_used INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign key to master analytics
  FOREIGN KEY (master_request_id) REFERENCES master_analytics(master_request_id) ON DELETE SET NULL
);

-- Enhanced Usage Analytics Table - Stores detailed usage metrics
CREATE TABLE IF NOT EXISTS usage_analytics (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  action_type VARCHAR(50),
  service_tier VARCHAR(50),
  tokens_consumed INTEGER,
  response_time_ms INTEGER,
  success BOOLEAN,
  master_request_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign key to master analytics
  FOREIGN KEY (master_request_id) REFERENCES master_analytics(master_request_id) ON DELETE SET NULL
);

-- Workflow Performance Table - Stores individual workflow metrics
CREATE TABLE IF NOT EXISTS workflow_performance (
  id SERIAL PRIMARY KEY,
  master_request_id VARCHAR(255) NOT NULL,
  workflow_name VARCHAR(255) NOT NULL,
  execution_time INTEGER,
  success BOOLEAN,
  tokens_used INTEGER,
  response_size INTEGER,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign key to master analytics
  FOREIGN KEY (master_request_id) REFERENCES master_analytics(master_request_id) ON DELETE CASCADE
);

-- User Sessions Table - Tracks user engagement across workflows
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(255),
  service_tier VARCHAR(50),
  start_time TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW(),
  total_requests INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  success_rate DECIMAL(5,4) DEFAULT 0,
  active BOOLEAN DEFAULT true
);

-- API Rate Limiting Table - Manages API usage and limits
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  service_tier VARCHAR(50) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  requests_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  reset_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, service_tier, endpoint)
);

-- Create indexes for better performance
CREATE INDEX idx_master_analytics_request_id ON master_analytics(master_request_id);
CREATE INDEX idx_master_analytics_user_id ON master_analytics(user_id);
CREATE INDEX idx_master_analytics_timestamp ON master_analytics(timestamp);
CREATE INDEX idx_master_analytics_service ON master_analytics(primary_service);

CREATE INDEX idx_content_creations_request_id ON content_creations(request_id);
CREATE INDEX idx_content_creations_master_request_id ON content_creations(master_request_id);
CREATE INDEX idx_content_creations_content_type ON content_creations(content_type);

CREATE INDEX idx_support_tickets_request_id ON support_tickets(request_id);
CREATE INDEX idx_support_tickets_master_request_id ON support_tickets(master_request_id);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);

CREATE INDEX idx_research_reports_request_id ON research_reports(request_id);
CREATE INDEX idx_research_reports_master_request_id ON research_reports(master_request_id);

CREATE INDEX idx_conversations_request_id ON conversations(request_id);
CREATE INDEX idx_conversations_master_request_id ON conversations(master_request_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);

CREATE INDEX idx_usage_analytics_user_id ON usage_analytics(user_id);
CREATE INDEX idx_usage_analytics_master_request_id ON usage_analytics(master_request_id);
CREATE INDEX idx_usage_analytics_action_type ON usage_analytics(action_type);

CREATE INDEX idx_workflow_performance_master_request_id ON workflow_performance(master_request_id);
CREATE INDEX idx_workflow_performance_workflow_name ON workflow_performance(workflow_name);

CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);

CREATE INDEX idx_api_rate_limits_user_id ON api_rate_limits(user_id);
CREATE INDEX idx_api_rate_limits_endpoint ON api_rate_limits(endpoint);

-- Insert sample data for testing
INSERT INTO master_analytics (
  master_request_id, 
  primary_service, 
  sub_service, 
  user_id, 
  service_tier, 
  workflow_executions, 
  total_execution_time, 
  total_tokens_used, 
  success_rate, 
  workflows_executed,
  overall_success
) VALUES (
  'master_1703123456_sample',
  'ai-saas',
  'chat',
  'test_user_001',
  'premium',
  '[{"workflow_name": "ai-saas-master-scaffold", "success": true, "execution_time": 2500, "tokens_used": 1200}]',
  2500,
  1200,
  1.0,
  1,
  true
) ON CONFLICT (master_request_id) DO NOTHING;

-- Create views for common analytics queries
CREATE OR REPLACE VIEW workflow_success_rates AS
SELECT 
  workflow_name,
  COUNT(*) as total_executions,
  COUNT(CASE WHEN success THEN 1 END) as successful_executions,
  ROUND(COUNT(CASE WHEN success THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL * 100, 2) as success_rate,
  AVG(execution_time) as avg_execution_time,
  AVG(tokens_used) as avg_tokens_used
FROM workflow_performance
GROUP BY workflow_name
ORDER BY success_rate DESC;

CREATE OR REPLACE VIEW user_engagement_summary AS
SELECT 
  user_id,
  service_tier,
  COUNT(DISTINCT master_request_id) as total_requests,
  SUM(total_tokens_used) as total_tokens,
  AVG(success_rate) as avg_success_rate,
  AVG(total_execution_time) as avg_response_time,
  MAX(timestamp) as last_activity
FROM master_analytics
WHERE user_id != 'anonymous'
GROUP BY user_id, service_tier
ORDER BY total_requests DESC;

CREATE OR REPLACE VIEW service_usage_analytics AS
SELECT 
  primary_service,
  service_tier,
  COUNT(*) as request_count,
  AVG(total_execution_time) as avg_execution_time,
  AVG(total_tokens_used) as avg_tokens_used,
  AVG(success_rate) as avg_success_rate,
  COUNT(DISTINCT user_id) as unique_users
FROM master_analytics
GROUP BY primary_service, service_tier
ORDER BY request_count DESC;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
