-- =====================================================
-- Analytics and Monitoring Setup for Multi-Tenant SaaS
-- =====================================================

-- =====================================================
-- 1. ENHANCED ANALYTICS TABLES
-- =====================================================

-- Real-time metrics table
CREATE TABLE IF NOT EXISTS real_time_metrics (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    metric_unit VARCHAR(20),
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT NOW()
);

-- User behavior events table
CREATE TABLE IF NOT EXISTS user_behavior_events (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    user_id VARCHAR(50),
    session_id VARCHAR(100),
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    event_data JSONB DEFAULT '{}',
    page_url TEXT,
    user_agent TEXT,
    ip_address INET,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    session_id VARCHAR(100),
    operation_type VARCHAR(50), -- 'chat_message', 'document_upload', 'search'
    response_time_ms INTEGER,
    token_usage INTEGER,
    model_used VARCHAR(50),
    success BOOLEAN DEFAULT true,
    error_code VARCHAR(50),
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT NOW()
);

-- API usage tracking table
CREATE TABLE IF NOT EXISTS api_usage (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    endpoint VARCHAR(100),
    method VARCHAR(10),
    status_code INTEGER,
    response_time_ms INTEGER,
    request_size_bytes INTEGER,
    response_size_bytes INTEGER,
    user_agent TEXT,
    ip_address INET,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. ANALYTICS FUNCTIONS
-- =====================================================

-- Track real-time metric
CREATE OR REPLACE FUNCTION track_real_time_metric(
    p_tenant_id VARCHAR(50),
    p_metric_name VARCHAR(100),
    p_metric_value DECIMAL(10,2),
    p_metric_unit VARCHAR(20) DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO real_time_metrics (tenant_id, metric_name, metric_value, metric_unit, metadata)
    VALUES (p_tenant_id, p_metric_name, p_metric_value, p_metric_unit, p_metadata);
END;
$$ LANGUAGE plpgsql;

-- Track user behavior event
CREATE OR REPLACE FUNCTION track_user_behavior(
    p_tenant_id VARCHAR(50),
    p_user_id VARCHAR(50),
    p_session_id VARCHAR(100),
    p_event_type VARCHAR(100),
    p_event_category VARCHAR(50) DEFAULT NULL,
    p_event_data JSONB DEFAULT '{}'::jsonb,
    p_page_url TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_behavior_events (
        tenant_id, user_id, session_id, event_type, event_category,
        event_data, page_url, user_agent, ip_address
    )
    VALUES (
        p_tenant_id, p_user_id, p_session_id, p_event_type, p_event_category,
        p_event_data, p_page_url, p_user_agent, p_ip_address
    );
END;
$$ LANGUAGE plpgsql;

-- Track performance metric
CREATE OR REPLACE FUNCTION track_performance(
    p_tenant_id VARCHAR(50),
    p_session_id VARCHAR(100),
    p_operation_type VARCHAR(50),
    p_response_time_ms INTEGER,
    p_token_usage INTEGER DEFAULT NULL,
    p_model_used VARCHAR(50) DEFAULT NULL,
    p_success BOOLEAN DEFAULT true,
    p_error_code VARCHAR(50) DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO performance_metrics (
        tenant_id, session_id, operation_type, response_time_ms,
        token_usage, model_used, success, error_code, error_message, metadata
    )
    VALUES (
        p_tenant_id, p_session_id, p_operation_type, p_response_time_ms,
        p_token_usage, p_model_used, p_success, p_error_code, p_error_message, p_metadata
    );
END;
$$ LANGUAGE plpgsql;

-- Track API usage
CREATE OR REPLACE FUNCTION track_api_usage(
    p_tenant_id VARCHAR(50),
    p_endpoint VARCHAR(100),
    p_method VARCHAR(10),
    p_status_code INTEGER,
    p_response_time_ms INTEGER,
    p_request_size_bytes INTEGER DEFAULT NULL,
    p_response_size_bytes INTEGER DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO api_usage (
        tenant_id, endpoint, method, status_code, response_time_ms,
        request_size_bytes, response_size_bytes, user_agent, ip_address
    )
    VALUES (
        p_tenant_id, p_endpoint, p_method, p_status_code, p_response_time_ms,
        p_request_size_bytes, p_response_size_bytes, p_user_agent, p_ip_address
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. ANALYTICS VIEWS
-- =====================================================

-- Tenant analytics summary view
CREATE VIEW tenant_analytics_summary AS
SELECT 
    t.tenant_id,
    t.business_name,
    t.plan_type,
    COUNT(DISTINCT ube.session_id) as total_sessions,
    COUNT(ube.id) as total_events,
    COUNT(DISTINCT ube.user_id) as unique_users,
    AVG(pm.response_time_ms) as avg_response_time,
    SUM(pm.token_usage) as total_tokens_used,
    COUNT(CASE WHEN pm.success = true THEN 1 END) as successful_operations,
    COUNT(CASE WHEN pm.success = false THEN 1 END) as failed_operations,
    MAX(rtm.timestamp) as last_activity
FROM tenants t
LEFT JOIN user_behavior_events ube ON t.tenant_id = ube.tenant_id
LEFT JOIN performance_metrics pm ON t.tenant_id = pm.tenant_id
LEFT JOIN real_time_metrics rtm ON t.tenant_id = rtm.tenant_id
GROUP BY t.tenant_id, t.business_name, t.plan_type;

-- Performance metrics by tenant view
CREATE VIEW tenant_performance_metrics AS
SELECT 
    tenant_id,
    operation_type,
    COUNT(*) as operation_count,
    AVG(response_time_ms) as avg_response_time,
    MIN(response_time_ms) as min_response_time,
    MAX(response_time_ms) as max_response_time,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time_ms) as median_response_time,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time,
    SUM(token_usage) as total_tokens,
    AVG(token_usage) as avg_tokens_per_operation,
    COUNT(CASE WHEN success = true THEN 1 END) as success_count,
    COUNT(CASE WHEN success = false THEN 1 END) as failure_count,
    DATE_TRUNC('day', timestamp) as date
FROM performance_metrics
GROUP BY tenant_id, operation_type, DATE_TRUNC('day', timestamp);

-- =====================================================
-- 4. PERFORMANCE INDEXES
-- =====================================================

-- Real-time metrics indexes
CREATE INDEX idx_real_time_metrics_tenant_time ON real_time_metrics(tenant_id, timestamp);
CREATE INDEX idx_real_time_metrics_name ON real_time_metrics(metric_name);
CREATE INDEX idx_real_time_metrics_value ON real_time_metrics(metric_value);

-- User behavior events indexes
CREATE INDEX idx_user_behavior_tenant_time ON user_behavior_events(tenant_id, timestamp);
CREATE INDEX idx_user_behavior_event_type ON user_behavior_events(event_type);
CREATE INDEX idx_user_behavior_session ON user_behavior_events(session_id);
CREATE INDEX idx_user_behavior_user ON user_behavior_events(user_id);

-- Performance metrics indexes
CREATE INDEX idx_performance_tenant_time ON performance_metrics(tenant_id, timestamp);
CREATE INDEX idx_performance_operation ON performance_metrics(operation_type);
CREATE INDEX idx_performance_response_time ON performance_metrics(response_time_ms);
CREATE INDEX idx_performance_success ON performance_metrics(success);

-- API usage indexes
CREATE INDEX idx_api_usage_tenant_time ON api_usage(tenant_id, timestamp);
CREATE INDEX idx_api_usage_endpoint ON api_usage(endpoint);
CREATE INDEX idx_api_usage_status ON api_usage(status_code);
CREATE INDEX idx_api_usage_response_time ON api_usage(response_time_ms);

-- =====================================================
-- 5. ROW-LEVEL SECURITY FOR ANALYTICS
-- =====================================================

-- Enable RLS on analytics tables
ALTER TABLE real_time_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics
CREATE POLICY tenant_isolation_real_time_metrics ON real_time_metrics
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_user_behavior ON user_behavior_events
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_performance ON performance_metrics
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_api_usage ON api_usage
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

-- =====================================================
-- 6. SAMPLE ANALYTICS DATA
-- =====================================================

-- Insert sample real-time metrics
INSERT INTO real_time_metrics (tenant_id, metric_name, metric_value, metric_unit, metadata)
VALUES 
    ('ACME_INC', 'active_users', 15, 'users', '{"source": "dashboard"}'),
    ('ACME_INC', 'messages_per_minute', 3.2, 'messages/min', '{"source": "chat"}'),
    ('ACME_INC', 'avg_response_time', 1250, 'ms', '{"source": "ai_model"}');

-- Insert sample user behavior events
INSERT INTO user_behavior_events (tenant_id, user_id, session_id, event_type, event_category, event_data)
VALUES 
    ('ACME_INC', 'user@acme.com', 'session_123', 'chat_message_sent', 'interaction', '{"message_length": 45}'),
    ('ACME_INC', 'user@acme.com', 'session_123', 'document_uploaded', 'file_action', '{"file_type": "pdf", "file_size": 1024000}');

-- Insert sample performance metrics
INSERT INTO performance_metrics (tenant_id, session_id, operation_type, response_time_ms, token_usage, model_used, success)
VALUES 
    ('ACME_INC', 'session_123', 'chat_message', 1250, 150, 'gpt-4', true),
    ('ACME_INC', 'session_123', 'document_search', 800, 75, 'gpt-4', true);

-- =====================================================
-- ANALYTICS SETUP COMPLETE
-- =====================================================




