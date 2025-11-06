-- Add missing tables for new workflows (18-20)
-- Using VARCHAR(50) for tenant_id to match existing tenants table

-- Refund Management Tables
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID,
    subscription_id UUID,
    tenant_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    requested_by UUID,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    rejected_reason TEXT,
    rejected_at TIMESTAMPTZ,
    refunded_amount DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refunds_tenant_id ON refunds(tenant_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_invoice_id ON refunds(invoice_id);

-- Error Logs
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(50),
    user_id UUID,
    level VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    stack TEXT,
    metadata JSONB,
    recovered BOOLEAN DEFAULT false,
    recovery_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_error_logs_tenant_id ON error_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_recovered ON error_logs(recovered);
CREATE INDEX IF NOT EXISTS idx_error_logs_level ON error_logs(level);

-- Circuit Breakers
CREATE TABLE IF NOT EXISTS circuit_breakers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(100) NOT NULL,
    tenant_id VARCHAR(50),
    state VARCHAR(50) DEFAULT 'closed',
    failure_count INTEGER DEFAULT 0,
    last_failure_time TIMESTAMPTZ,
    failure_threshold INTEGER DEFAULT 5,
    timeout_ms INTEGER DEFAULT 60000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    UNIQUE(service_name, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_circuit_breakers_tenant_id ON circuit_breakers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_circuit_breakers_state ON circuit_breakers(state);

-- Retry Configurations
CREATE TABLE IF NOT EXISTS retry_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(100) NOT NULL,
    tenant_id VARCHAR(50),
    max_retries INTEGER DEFAULT 3,
    base_delay_ms INTEGER DEFAULT 1000,
    max_delay_ms INTEGER DEFAULT 10000,
    exponential_backoff BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    UNIQUE(service_name, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_retry_configs_tenant_id ON retry_configs(tenant_id);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    tenant_id VARCHAR(50),
    token TEXT NOT NULL UNIQUE,
    refresh_token TEXT UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tenant_id ON sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(50) NOT NULL,
    user_id UUID,
    hashed_key TEXT NOT NULL UNIQUE,
    key_name VARCHAR(255),
    permissions JSONB DEFAULT '["read", "write"]'::jsonb,
    rate_limit INTEGER DEFAULT 1000,
    revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_api_keys_tenant_id ON api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hashed_key ON api_keys(hashed_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_revoked ON api_keys(revoked);

-- Rate Limits
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_key_id UUID,
    ip_address VARCHAR(45),
    user_id UUID,
    tenant_id VARCHAR(50),
    request_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON rate_limits(ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_tenant_id ON rate_limits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_id ON rate_limits(user_id);

-- Backup Schedules
CREATE TABLE IF NOT EXISTS backup_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(50),
    schedule_cron VARCHAR(100),
    description TEXT,
    target_directory TEXT,
    retention_days INTEGER DEFAULT 30,
    active BOOLEAN DEFAULT true,
    last_backup_at TIMESTAMPTZ,
    next_backup_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_backup_schedules_tenant_id ON backup_schedules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_backup_schedules_active ON backup_schedules(active);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID,
    tenant_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending',
    due_date TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    refunded_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Grant permissions
GRANT ALL ON refunds TO postgres;
GRANT ALL ON error_logs TO postgres;
GRANT ALL ON circuit_breakers TO postgres;
GRANT ALL ON retry_configs TO postgres;
GRANT ALL ON api_keys TO postgres;
GRANT ALL ON sessions TO postgres;
GRANT ALL ON rate_limits TO postgres;
GRANT ALL ON backup_schedules TO postgres;
GRANT ALL ON invoices TO postgres;

-- Summary
SELECT 'Database sync complete!' AS status, 
       COUNT(*) AS tables_synced 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('refunds', 'incidents', 'error_logs', 'circuit_breakers', 'retry_configs', 'api_keys', 'sessions', 'rate_limits', 'backup_schedules', 'invoices');
