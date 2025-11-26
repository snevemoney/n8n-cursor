-- LightningFlow AI - Side-Hustle Data Models
-- Supports multi-tenant side-hustle workflows (e.g., voice agent → Google Sheets)

-- =============================================================================
-- TENANTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    
    -- Business details
    business_type VARCHAR(100),
    industry VARCHAR(100),
    website VARCHAR(500),
    
    -- Contact information
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_name VARCHAR(255),
    
    -- Integration settings
    google_sheets_id VARCHAR(255),
    google_sheets_name VARCHAR(255),
    webhook_url VARCHAR(500),
    webhook_secret VARCHAR(255),
    
    -- Rate limiting
    rate_limit_per_hour INTEGER DEFAULT 1000,
    rate_limit_per_day INTEGER DEFAULT 10000,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$'),
    CONSTRAINT valid_email CHECK (contact_email ~ '^[^@]+@[^@]+\.[^@]+$')
);

-- =============================================================================
-- MAPPINGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Source data mapping
    source_field VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) DEFAULT 'string' CHECK (source_type IN ('string', 'number', 'boolean', 'date', 'json')),
    source_required BOOLEAN DEFAULT false,
    source_default TEXT,
    
    -- Target mapping
    target_field VARCHAR(255) NOT NULL,
    target_type VARCHAR(50) DEFAULT 'string' CHECK (target_type IN ('string', 'number', 'boolean', 'date', 'json')),
    target_required BOOLEAN DEFAULT false,
    target_default TEXT,
    
    -- Transformation rules
    transform_rule TEXT, -- JSON string for complex transformations
    validation_regex VARCHAR(500),
    validation_message TEXT,
    
    -- Ordering
    sort_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    UNIQUE(tenant_id, name),
    UNIQUE(tenant_id, source_field)
);

-- =============================================================================
-- SIDE-HUSTLE JOBS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS side_hustle_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    job_type VARCHAR(100) NOT NULL, -- 'voice_transcript', 'data_import', 'webhook_process'
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    
    -- Input data
    input_data JSONB,
    input_metadata JSONB,
    
    -- Processing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    processing_time_ms INTEGER,
    
    -- Output data
    output_data JSONB,
    output_metadata JSONB,
    
    -- Error handling
    error_message TEXT,
    error_code VARCHAR(100),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Rate limiting tracking
    rate_limit_bucket VARCHAR(100), -- For tracking rate limits
    rate_limit_hit BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT valid_processing_time CHECK (processing_time_ms >= 0),
    CONSTRAINT valid_retry_count CHECK (retry_count >= 0 AND retry_count <= max_retries)
);

-- =============================================================================
-- SIDE-HUSTLE RESULTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS side_hustle_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES side_hustle_jobs(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Result data
    result_type VARCHAR(100) NOT NULL, -- 'google_sheets_row', 'webhook_response', 'file_upload'
    result_data JSONB,
    result_metadata JSONB,
    
    -- External references
    external_id VARCHAR(255), -- Google Sheets row ID, file URL, etc.
    external_url VARCHAR(500),
    
    -- Status
    success BOOLEAN NOT NULL,
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- =============================================================================
-- RATE LIMITING TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    bucket_key VARCHAR(255) NOT NULL, -- e.g., 'hourly:2024-12-15:14', 'daily:2024-12-15'
    bucket_type VARCHAR(50) NOT NULL, -- 'hourly', 'daily', 'monthly'
    bucket_start TIMESTAMP WITH TIME ZONE NOT NULL,
    bucket_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Counters
    request_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    
    -- Limits
    limit_value INTEGER NOT NULL,
    limit_exceeded BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(tenant_id, bucket_key),
    CONSTRAINT valid_bucket_times CHECK (bucket_start < bucket_end),
    CONSTRAINT valid_counts CHECK (request_count >= 0 AND success_count >= 0 AND error_count >= 0)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Tenants
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON tenants(created_at);

-- Mappings
CREATE INDEX IF NOT EXISTS idx_mappings_tenant_id ON mappings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mappings_source_field ON mappings(source_field);
CREATE INDEX IF NOT EXISTS idx_mappings_sort_order ON mappings(tenant_id, sort_order);

-- Jobs
CREATE INDEX IF NOT EXISTS idx_side_hustle_jobs_tenant_id ON side_hustle_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_side_hustle_jobs_status ON side_hustle_jobs(status);
CREATE INDEX IF NOT EXISTS idx_side_hustle_jobs_created_at ON side_hustle_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_side_hustle_jobs_job_type ON side_hustle_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_side_hustle_jobs_rate_limit_bucket ON side_hustle_jobs(rate_limit_bucket);

-- Results
CREATE INDEX IF NOT EXISTS idx_side_hustle_results_job_id ON side_hustle_results(job_id);
CREATE INDEX IF NOT EXISTS idx_side_hustle_results_tenant_id ON side_hustle_results(tenant_id);
CREATE INDEX IF NOT EXISTS idx_side_hustle_results_result_type ON side_hustle_results(result_type);
CREATE INDEX IF NOT EXISTS idx_side_hustle_results_external_id ON side_hustle_results(external_id);

-- Rate Limits
CREATE INDEX IF NOT EXISTS idx_rate_limits_tenant_id ON rate_limits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_bucket_key ON rate_limits(bucket_key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_bucket_start ON rate_limits(bucket_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_limit_exceeded ON rate_limits(limit_exceeded);

-- =============================================================================
-- VIEWS FOR COMMON QUERIES
-- =============================================================================

-- Tenant summary with job counts
CREATE OR REPLACE VIEW v_tenant_summary AS
SELECT 
    t.id,
    t.name,
    t.slug,
    t.status,
    t.business_type,
    t.industry,
    t.contact_email,
    t.rate_limit_per_hour,
    t.rate_limit_per_day,
    t.created_at,
    
    -- Job statistics
    COUNT(DISTINCT j.id) as total_jobs,
    COUNT(DISTINCT CASE WHEN j.status = 'completed' THEN j.id END) as completed_jobs,
    COUNT(DISTINCT CASE WHEN j.status = 'failed' THEN j.id END) as failed_jobs,
    COUNT(DISTINCT CASE WHEN j.status = 'pending' THEN j.id END) as pending_jobs,
    
    -- Rate limiting status
    MAX(rl.limit_exceeded) as rate_limit_exceeded,
    MAX(rl.request_count) as current_hourly_requests
    
FROM tenants t
LEFT JOIN side_hustle_jobs j ON t.id = j.tenant_id
LEFT JOIN rate_limits rl ON t.id = rl.tenant_id 
    AND rl.bucket_type = 'hourly' 
    AND rl.bucket_start >= NOW() - INTERVAL '1 hour'
GROUP BY t.id, t.name, t.slug, t.status, t.business_type, t.industry, t.contact_email, t.rate_limit_per_hour, t.rate_limit_per_day, t.created_at;

-- Recent job activity
CREATE OR REPLACE VIEW v_recent_job_activity AS
SELECT 
    j.id,
    j.tenant_id,
    t.name as tenant_name,
    j.job_type,
    j.status,
    j.input_data,
    j.output_data,
    j.error_message,
    j.processing_time_ms,
    j.created_at,
    j.started_at,
    j.completed_at
FROM side_hustle_jobs j
JOIN tenants t ON j.tenant_id = t.id
WHERE j.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY j.created_at DESC;

-- Rate limit status
CREATE OR REPLACE VIEW v_rate_limit_status AS
SELECT 
    t.id as tenant_id,
    t.name as tenant_name,
    t.rate_limit_per_hour,
    t.rate_limit_per_day,
    
    -- Current hourly usage
    COALESCE(hourly_usage.request_count, 0) as current_hourly_requests,
    COALESCE(hourly_usage.limit_exceeded, false) as hourly_limit_exceeded,
    
    -- Current daily usage
    COALESCE(daily_usage.request_count, 0) as current_daily_requests,
    COALESCE(daily_usage.limit_exceeded, false) as daily_limit_exceeded,
    
    -- Usage percentages
    CASE 
        WHEN t.rate_limit_per_hour > 0 THEN 
            ROUND((COALESCE(hourly_usage.request_count, 0)::DECIMAL / t.rate_limit_per_hour) * 100, 2)
        ELSE 0 
    END as hourly_usage_percent,
    
    CASE 
        WHEN t.rate_limit_per_day > 0 THEN 
            ROUND((COALESCE(daily_usage.request_count, 0)::DECIMAL / t.rate_limit_per_day) * 100, 2)
        ELSE 0 
    END as daily_usage_percent

FROM tenants t
LEFT JOIN LATERAL (
    SELECT 
        tenant_id,
        request_count,
        limit_exceeded
    FROM rate_limits 
    WHERE bucket_type = 'hourly' 
        AND bucket_start >= NOW() - INTERVAL '1 hour'
        AND tenant_id = t.id
    LIMIT 1
) hourly_usage ON true
LEFT JOIN LATERAL (
    SELECT 
        tenant_id,
        request_count,
        limit_exceeded
    FROM rate_limits 
    WHERE bucket_type = 'daily' 
        AND bucket_start >= NOW() - INTERVAL '1 day'
        AND tenant_id = t.id
    LIMIT 1
) daily_usage ON true
WHERE t.status = 'active';

-- =============================================================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- =============================================================================

-- Function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_tenant_id UUID,
    p_bucket_type VARCHAR(50),
    p_limit_value INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    v_bucket_key VARCHAR(255);
    v_bucket_start TIMESTAMP WITH TIME ZONE;
    v_bucket_end TIMESTAMP WITH TIME ZONE;
    v_current_count INTEGER;
    v_limit_exceeded BOOLEAN;
BEGIN
    -- Calculate bucket boundaries
    CASE p_bucket_type
        WHEN 'hourly' THEN
            v_bucket_start := date_trunc('hour', NOW());
            v_bucket_end := v_bucket_start + INTERVAL '1 hour';
            v_bucket_key := 'hourly:' || to_char(v_bucket_start, 'YYYY-MM-DD:HH24');
        WHEN 'daily' THEN
            v_bucket_start := date_trunc('day', NOW());
            v_bucket_end := v_bucket_start + INTERVAL '1 day';
            v_bucket_key := 'daily:' || to_char(v_bucket_start, 'YYYY-MM-DD');
        WHEN 'monthly' THEN
            v_bucket_start := date_trunc('month', NOW());
            v_bucket_end := v_bucket_start + INTERVAL '1 month';
            v_bucket_key := 'monthly:' || to_char(v_bucket_start, 'YYYY-MM');
        ELSE
            RAISE EXCEPTION 'Invalid bucket type: %', p_bucket_type;
    END CASE;
    
    -- Get or create rate limit record
    INSERT INTO rate_limits (tenant_id, bucket_key, bucket_type, bucket_start, bucket_end, limit_value)
    VALUES (p_tenant_id, v_bucket_key, p_bucket_type, v_bucket_start, v_bucket_end, p_limit_value)
    ON CONFLICT (tenant_id, bucket_key) DO UPDATE SET
        request_count = rate_limits.request_count + 1,
        updated_at = NOW()
    RETURNING request_count, limit_exceeded INTO v_current_count, v_limit_exceeded;
    
    -- Check if limit exceeded
    IF v_current_count > p_limit_value THEN
        UPDATE rate_limits 
        SET limit_exceeded = true, updated_at = NOW()
        WHERE tenant_id = p_tenant_id AND bucket_key = v_bucket_key;
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to create a new tenant with default mappings
CREATE OR REPLACE FUNCTION create_tenant_with_defaults(
    p_name VARCHAR(255),
    p_slug VARCHAR(100),
    p_description TEXT DEFAULT NULL,
    p_business_type VARCHAR(100) DEFAULT NULL,
    p_industry VARCHAR(100) DEFAULT NULL,
    p_contact_email VARCHAR(255) DEFAULT NULL,
    p_contact_phone VARCHAR(50) DEFAULT NULL,
    p_contact_name VARCHAR(255) DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_tenant_id UUID;
    v_default_mappings JSONB;
BEGIN
    -- Create tenant
    INSERT INTO tenants (
        name, slug, description, business_type, industry, 
        contact_email, contact_phone, contact_name, created_by
    ) VALUES (
        p_name, p_slug, p_description, p_business_type, p_industry,
        p_contact_email, p_contact_phone, p_contact_name, p_created_by
    ) RETURNING id INTO v_tenant_id;
    
    -- Default mappings for voice agent → Google Sheets
    v_default_mappings := '[
        {"source_field": "caller_number", "target_field": "Phone Number", "source_type": "string", "target_type": "string", "source_required": true, "sort_order": 1},
        {"source_field": "call_duration", "target_field": "Duration (seconds)", "source_type": "number", "target_type": "number", "source_required": false, "sort_order": 2},
        {"source_field": "call_intent", "target_field": "Intent", "source_type": "string", "target_type": "string", "source_required": false, "sort_order": 3},
        {"source_field": "call_summary", "target_field": "Summary", "source_type": "string", "target_type": "string", "source_required": false, "sort_order": 4},
        {"source_field": "call_notes", "target_field": "Notes", "source_type": "string", "target_type": "string", "source_required": false, "sort_order": 5},
        {"source_field": "recording_url", "target_field": "Recording URL", "source_type": "string", "target_type": "string", "source_required": false, "sort_order": 6},
        {"source_field": "timestamp", "target_field": "Date & Time", "source_type": "date", "target_type": "date", "source_required": true, "sort_order": 7}
    ]'::JSONB;
    
    -- Insert default mappings
    INSERT INTO mappings (
        tenant_id, name, description, source_field, source_type, source_required,
        target_field, target_type, target_required, sort_order, created_by
    )
    SELECT 
        v_tenant_id,
        'Default ' || (value->>'source_field')::TEXT,
        'Auto-generated mapping for ' || (value->>'source_field')::TEXT,
        value->>'source_field',
        (value->>'source_type')::VARCHAR(50),
        (value->>'source_required')::BOOLEAN,
        value->>'target_field',
        (value->>'target_type')::VARCHAR(50),
        false,
        (value->>'sort_order')::INTEGER,
        p_created_by
    FROM jsonb_array_elements(v_default_mappings);
    
    RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mappings_updated_at BEFORE UPDATE ON mappings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_side_hustle_jobs_updated_at BEFORE UPDATE ON side_hustle_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at BEFORE UPDATE ON rate_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SAMPLE DATA (for development)
-- =============================================================================

-- Insert sample tenant if not exists
INSERT INTO tenants (name, slug, description, business_type, industry, contact_email, rate_limit_per_hour, rate_limit_per_day)
VALUES (
    'Sample Business',
    'sample-business',
    'A sample business for testing side-hustle workflows',
    'Consulting',
    'Technology',
    'sample@example.com',
    100,
    1000
) ON CONFLICT (slug) DO NOTHING;

-- Get the sample tenant ID for mappings
DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'sample-business';
    
    IF v_tenant_id IS NOT NULL THEN
        -- Insert sample mappings if they don't exist
        INSERT INTO mappings (tenant_id, name, description, source_field, source_type, source_required, target_field, target_type, target_required, sort_order)
        VALUES 
            (v_tenant_id, 'Phone Number', 'Caller phone number', 'caller_number', 'string', true, 'Phone Number', 'string', true, 1),
            (v_tenant_id, 'Duration', 'Call duration in seconds', 'call_duration', 'number', false, 'Duration (seconds)', 'number', false, 2),
            (v_tenant_id, 'Intent', 'Call intent classification', 'call_intent', 'string', false, 'Intent', 'string', false, 3),
            (v_tenant_id, 'Summary', 'Call summary', 'call_summary', 'string', false, 'Summary', 'string', false, 4),
            (v_tenant_id, 'Notes', 'Additional notes', 'call_notes', 'string', false, 'Notes', 'string', false, 5),
            (v_tenant_id, 'Recording', 'Call recording URL', 'recording_url', 'string', false, 'Recording URL', 'string', false, 6),
            (v_tenant_id, 'Timestamp', 'Call timestamp', 'timestamp', 'date', true, 'Date & Time', 'date', true, 7)
        ON CONFLICT (tenant_id, name) DO NOTHING;
    END IF;
END $$;
