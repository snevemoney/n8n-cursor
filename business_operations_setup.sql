-- =====================================================
-- Business Operations Setup for Multi-Tenant SaaS
-- =====================================================

-- =====================================================
-- 1. BILLING AND SUBSCRIPTION MANAGEMENT
-- =====================================================

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    plan_name VARCHAR(50) UNIQUE NOT NULL,
    plan_type VARCHAR(20) NOT NULL, -- 'free', 'basic', 'premium', 'enterprise'
    price_monthly DECIMAL(10,2) DEFAULT 0,
    price_yearly DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    features JSONB DEFAULT '{}',
    limits JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tenant subscriptions table
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    plan_id INTEGER REFERENCES subscription_plans(id),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'suspended'
    billing_cycle VARCHAR(10) DEFAULT 'monthly', -- 'monthly', 'yearly'
    current_period_start TIMESTAMP DEFAULT NOW(),
    current_period_end TIMESTAMP DEFAULT NOW() + INTERVAL '1 month',
    trial_end TIMESTAMP NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Billing history table
CREATE TABLE IF NOT EXISTS billing_history (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    subscription_id INTEGER REFERENCES tenant_subscriptions(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_period_start TIMESTAMP NOT NULL,
    billing_period_end TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    stripe_invoice_id VARCHAR(100),
    stripe_payment_intent_id VARCHAR(100),
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    paid_at TIMESTAMP NULL
);

-- Usage-based billing table
CREATE TABLE IF NOT EXISTS usage_billing (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,4) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    billing_period_start TIMESTAMP NOT NULL,
    billing_period_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. SUPPORT AND TICKETING SYSTEM
-- =====================================================

-- Support categories table
CREATE TABLE IF NOT EXISTS support_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    priority_level INTEGER DEFAULT 3, -- 1=critical, 2=high, 3=medium, 4=low
    sla_hours INTEGER DEFAULT 24,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced tickets table (extends existing)
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES support_categories(id);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium';
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(100);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolution_time INTEGER; -- in minutes
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS first_response_time INTEGER; -- in minutes
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Ticket comments table
CREATE TABLE IF NOT EXISTS ticket_comments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(id),
    author_type VARCHAR(20) NOT NULL, -- 'user', 'agent', 'system'
    author_id VARCHAR(100),
    author_name VARCHAR(100),
    comment_text TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge base articles table
CREATE TABLE IF NOT EXISTS knowledge_base_articles (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published', 'archived'
    author_id VARCHAR(100),
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. CUSTOMER SUCCESS METRICS
-- =====================================================

-- Customer health scores table
CREATE TABLE IF NOT EXISTS customer_health_scores (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    score_components JSONB DEFAULT '{}',
    last_calculated TIMESTAMP DEFAULT NOW(),
    trend VARCHAR(20), -- 'improving', 'stable', 'declining'
    risk_level VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Customer onboarding progress table
CREATE TABLE IF NOT EXISTS onboarding_progress (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    step_name VARCHAR(100) NOT NULL,
    step_order INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP NULL,
    completion_percentage INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. BUSINESS FUNCTIONS
-- =====================================================

-- Calculate customer health score
CREATE OR REPLACE FUNCTION calculate_customer_health_score(p_tenant_id VARCHAR(50))
RETURNS INTEGER AS $$
DECLARE
    health_score INTEGER := 0;
    usage_score INTEGER := 0;
    support_score INTEGER := 0;
    engagement_score INTEGER := 0;
    total_sessions INTEGER;
    total_messages INTEGER;
    avg_response_time DECIMAL;
    support_tickets INTEGER;
    csat_score DECIMAL;
    last_activity_days INTEGER;
BEGIN
    -- Get usage metrics
    SELECT 
        COUNT(DISTINCT session_id),
        COUNT(*),
        AVG(response_time_ms)
    INTO total_sessions, total_messages, avg_response_time
    FROM performance_metrics 
    WHERE tenant_id = p_tenant_id 
    AND timestamp > NOW() - INTERVAL '30 days';
    
    -- Get support metrics
    SELECT COUNT(*), AVG(rating)
    INTO support_tickets, csat_score
    FROM tickets t
    LEFT JOIN csat_feedback c ON t.id = c.ticket_id
    WHERE t.tenant_id = p_tenant_id 
    AND t.created_at > NOW() - INTERVAL '30 days';
    
    -- Get last activity
    SELECT EXTRACT(DAYS FROM NOW() - MAX(timestamp))
    INTO last_activity_days
    FROM analytics 
    WHERE tenant_id = p_tenant_id;
    
    -- Calculate component scores (0-25 each)
    -- Usage score (25 points)
    IF total_sessions > 50 THEN usage_score := 25;
    ELSIF total_sessions > 20 THEN usage_score := 20;
    ELSIF total_sessions > 10 THEN usage_score := 15;
    ELSIF total_sessions > 5 THEN usage_score := 10;
    ELSE usage_score := 5;
    END IF;
    
    -- Support score (25 points)
    IF support_tickets = 0 AND csat_score IS NULL THEN support_score := 25;
    ELSIF support_tickets <= 2 AND csat_score >= 4.0 THEN support_score := 20;
    ELSIF support_tickets <= 5 AND csat_score >= 3.0 THEN support_score := 15;
    ELSIF support_tickets <= 10 AND csat_score >= 2.0 THEN support_score := 10;
    ELSE support_score := 5;
    END IF;
    
    -- Engagement score (25 points)
    IF last_activity_days <= 1 THEN engagement_score := 25;
    ELSIF last_activity_days <= 3 THEN engagement_score := 20;
    ELSIF last_activity_days <= 7 THEN engagement_score := 15;
    ELSIF last_activity_days <= 14 THEN engagement_score := 10;
    ELSE engagement_score := 5;
    END IF;
    
    -- Performance score (25 points)
    IF avg_response_time <= 1000 THEN engagement_score := engagement_score + 25;
    ELSIF avg_response_time <= 2000 THEN engagement_score := engagement_score + 20;
    ELSIF avg_response_time <= 3000 THEN engagement_score := engagement_score + 15;
    ELSIF avg_response_time <= 5000 THEN engagement_score := engagement_score + 10;
    ELSE engagement_score := engagement_score + 5;
    END IF;
    
    health_score := usage_score + support_score + engagement_score;
    
    -- Insert or update health score
    INSERT INTO customer_health_scores (tenant_id, health_score, score_components, last_calculated)
    VALUES (
        p_tenant_id, 
        health_score,
        json_build_object(
            'usage_score', usage_score,
            'support_score', support_score,
            'engagement_score', engagement_score,
            'total_sessions', total_sessions,
            'total_messages', total_messages,
            'avg_response_time', avg_response_time,
            'support_tickets', support_tickets,
            'csat_score', csat_score,
            'last_activity_days', last_activity_days
        ),
        NOW()
    )
    ON CONFLICT (tenant_id) DO UPDATE SET
        health_score = EXCLUDED.health_score,
        score_components = EXCLUDED.score_components,
        last_calculated = EXCLUDED.last_calculated;
    
    RETURN health_score;
END;
$$ LANGUAGE plpgsql;

-- Track subscription usage
CREATE OR REPLACE FUNCTION track_subscription_usage(
    p_tenant_id VARCHAR(50),
    p_metric_name VARCHAR(100),
    p_metric_value DECIMAL(10,2),
    p_billing_period_start TIMESTAMP,
    p_billing_period_end TIMESTAMP
)
RETURNS VOID AS $$
DECLARE
    plan_limits JSONB;
    current_usage DECIMAL(10,2);
    limit_value DECIMAL(10,2);
BEGIN
    -- Get plan limits
    SELECT ts.limits INTO plan_limits
    FROM tenant_subscriptions ts
    JOIN subscription_plans sp ON ts.plan_id = sp.id
    WHERE ts.tenant_id = p_tenant_id 
    AND ts.status = 'active';
    
    -- Get current usage for the period
    SELECT COALESCE(SUM(metric_value), 0)
    INTO current_usage
    FROM usage_billing
    WHERE tenant_id = p_tenant_id
    AND metric_name = p_metric_name
    AND billing_period_start = p_billing_period_start
    AND billing_period_end = p_billing_period_end;
    
    -- Check if usage exceeds limits
    IF plan_limits ? p_metric_name THEN
        limit_value := (plan_limits->>p_metric_name)::DECIMAL;
        
        IF current_usage + p_metric_value > limit_value THEN
            -- Log overage
            INSERT INTO usage_billing (
                tenant_id, metric_name, metric_value, unit_price, total_cost,
                billing_period_start, billing_period_end
            )
            VALUES (
                p_tenant_id, p_metric_name, p_metric_value, 0.01, 
                p_metric_value * 0.01, p_billing_period_start, p_billing_period_end
            );
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. BUSINESS ANALYTICS VIEWS
-- =====================================================

-- Revenue analytics view
CREATE VIEW revenue_analytics AS
SELECT 
    DATE_TRUNC('month', bh.created_at) as month,
    COUNT(DISTINCT bh.tenant_id) as active_customers,
    SUM(bh.amount) as total_revenue,
    AVG(bh.amount) as avg_revenue_per_customer,
    COUNT(CASE WHEN bh.status = 'paid' THEN 1 END) as successful_payments,
    COUNT(CASE WHEN bh.status = 'failed' THEN 1 END) as failed_payments
FROM billing_history bh
GROUP BY DATE_TRUNC('month', bh.created_at)
ORDER BY month DESC;

-- Customer success metrics view
CREATE VIEW customer_success_metrics AS
SELECT 
    t.tenant_id,
    t.business_name,
    ts.status as subscription_status,
    sp.plan_name,
    chs.health_score,
    chs.risk_level,
    co.total_sessions,
    co.total_messages,
    co.monthly_usage,
    COUNT(tk.id) as total_tickets,
    AVG(cf.rating) as avg_csat_score,
    MAX(a.timestamp) as last_activity
FROM tenants t
LEFT JOIN tenant_subscriptions ts ON t.tenant_id = ts.tenant_id
LEFT JOIN subscription_plans sp ON ts.plan_id = sp.id
LEFT JOIN customer_health_scores chs ON t.tenant_id = chs.tenant_id
LEFT JOIN client_overview co ON t.tenant_id = co.tenant_id
LEFT JOIN tickets tk ON t.tenant_id = tk.tenant_id
LEFT JOIN csat_feedback cf ON tk.id = cf.ticket_id
LEFT JOIN analytics a ON t.tenant_id = a.tenant_id
GROUP BY t.tenant_id, t.business_name, ts.status, sp.plan_name, 
         chs.health_score, chs.risk_level, co.total_sessions, 
         co.total_messages, co.monthly_usage;

-- =====================================================
-- 6. SAMPLE BUSINESS DATA
-- =====================================================

-- Insert subscription plans
INSERT INTO subscription_plans (plan_name, plan_type, price_monthly, price_yearly, features, limits)
VALUES 
    ('Free', 'free', 0, 0, 
     '{"max_documents": 10, "max_users": 1, "support": "community"}',
     '{"daily_messages": 100, "monthly_messages": 1000}'),
    
    ('Basic', 'basic', 29, 290,
     '{"max_documents": 100, "max_users": 5, "support": "email", "analytics": true}',
     '{"daily_messages": 1000, "monthly_messages": 10000}'),
    
    ('Premium', 'premium', 99, 990,
     '{"max_documents": 1000, "max_users": 25, "support": "priority", "analytics": true, "custom_branding": true}',
     '{"daily_messages": 5000, "monthly_messages": 50000}'),
    
    ('Enterprise', 'enterprise', 299, 2990,
     '{"max_documents": -1, "max_users": -1, "support": "dedicated", "analytics": true, "custom_branding": true, "api_access": true}',
     '{"daily_messages": -1, "monthly_messages": -1}');

-- Insert support categories
INSERT INTO support_categories (category_name, description, priority_level, sla_hours)
VALUES 
    ('Technical Issues', 'Technical problems with the platform', 1, 4),
    ('Billing Questions', 'Questions about billing and payments', 2, 24),
    ('Feature Requests', 'Requests for new features', 3, 72),
    ('General Support', 'General questions and support', 3, 24),
    ('Account Issues', 'Account-related problems', 2, 12);

-- Insert sample tenant subscription
INSERT INTO tenant_subscriptions (tenant_id, plan_id, status, billing_cycle, current_period_start, current_period_end)
VALUES ('ACME_INC', 2, 'active', 'monthly', NOW(), NOW() + INTERVAL '1 month');

-- =====================================================
-- 7. PERFORMANCE INDEXES
-- =====================================================

-- Subscription indexes
CREATE INDEX idx_subscription_plans_type ON subscription_plans(plan_type);
CREATE INDEX idx_tenant_subscriptions_tenant ON tenant_subscriptions(tenant_id);
CREATE INDEX idx_tenant_subscriptions_status ON tenant_subscriptions(status);
CREATE INDEX idx_billing_history_tenant ON billing_history(tenant_id);
CREATE INDEX idx_billing_history_period ON billing_history(billing_period_start, billing_period_end);

-- Support indexes
CREATE INDEX idx_support_categories_active ON support_categories(is_active);
CREATE INDEX idx_tickets_category ON tickets(category_id);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_assigned ON tickets(assigned_to);
CREATE INDEX idx_ticket_comments_ticket ON ticket_comments(ticket_id);
CREATE INDEX idx_knowledge_base_tenant ON knowledge_base_articles(tenant_id);
CREATE INDEX idx_knowledge_base_status ON knowledge_base_articles(status);

-- Business metrics indexes
CREATE INDEX idx_customer_health_scores_tenant ON customer_health_scores(tenant_id);
CREATE INDEX idx_customer_health_scores_risk ON customer_health_scores(risk_level);
CREATE INDEX idx_onboarding_progress_tenant ON onboarding_progress(tenant_id);
CREATE INDEX idx_usage_billing_tenant_period ON usage_billing(tenant_id, billing_period_start, billing_period_end);

-- =====================================================
-- 8. ROW-LEVEL SECURITY FOR BUSINESS TABLES
-- =====================================================

-- Enable RLS on business tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for business tables
CREATE POLICY tenant_isolation_subscriptions ON tenant_subscriptions
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_billing ON billing_history
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_usage_billing ON usage_billing
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_knowledge_base ON knowledge_base_articles
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_health_scores ON customer_health_scores
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_onboarding ON onboarding_progress
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

-- =====================================================
-- BUSINESS OPERATIONS SETUP COMPLETE
-- =====================================================
