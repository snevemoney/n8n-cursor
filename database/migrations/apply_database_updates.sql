-- =====================================================
-- Database Update Script for Multi-Tenant SaaS
-- Apply this to your existing PostgreSQL database
-- =====================================================

-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_jsontoken;

-- =====================================================
-- 1. ADD MISSING TABLES
-- =====================================================

-- Knowledge Base Files Table
CREATE TABLE IF NOT EXISTS knowledge_base_files (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    topic_id INTEGER,
    topic_name VARCHAR(100),
    file_name VARCHAR(255),
    google_drive_file_id VARCHAR(255),
    google_drive_url TEXT,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Tenant Availability Table
CREATE TABLE IF NOT EXISTS tenant_availability (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) UNIQUE NOT NULL REFERENCES tenants(tenant_id),
    working_days JSONB NOT NULL,
    working_hours JSONB NOT NULL,
    slot_duration INTEGER NOT NULL DEFAULT 30,
    break_times JSONB,
    timezone VARCHAR(100) NOT NULL DEFAULT 'UTC',
    min_advance_minutes INTEGER NOT NULL DEFAULT 120,
    max_advance_days INTEGER NOT NULL DEFAULT 30,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Website Analytics Table (for data mining)
CREATE TABLE IF NOT EXISTS website_analytics (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    website_domain VARCHAR(255),
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    session_id VARCHAR(100),
    event_type VARCHAR(50), -- 'page_view', 'widget_load', 'chat_start', etc.
    event_data JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Real-time Sync Events Table
CREATE TABLE IF NOT EXISTS sync_events (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    event_type VARCHAR(50), -- 'config_update', 'file_upload', 'availability_change'
    event_data JSONB,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE knowledge_base_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. CREATE RLS POLICIES
-- =====================================================

-- Create RLS policies for new tables
DROP POLICY IF EXISTS tenant_isolation_knowledge_files ON knowledge_base_files;
CREATE POLICY tenant_isolation_knowledge_files ON knowledge_base_files
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

DROP POLICY IF EXISTS tenant_isolation_availability ON tenant_availability;
CREATE POLICY tenant_isolation_availability ON tenant_availability
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

DROP POLICY IF EXISTS tenant_isolation_website_analytics ON website_analytics;
CREATE POLICY tenant_isolation_website_analytics ON website_analytics
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

DROP POLICY IF EXISTS tenant_isolation_sync_events ON sync_events;
CREATE POLICY tenant_isolation_sync_events ON sync_events
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

-- =====================================================
-- 4. CREATE PERFORMANCE INDEXES
-- =====================================================

-- Performance indexes for new tables
CREATE INDEX IF NOT EXISTS idx_knowledge_files_tenant ON knowledge_base_files(tenant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_files_topic ON knowledge_base_files(topic_name);
CREATE INDEX IF NOT EXISTS idx_availability_tenant ON tenant_availability(tenant_id);
CREATE INDEX IF NOT EXISTS idx_website_analytics_tenant ON website_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_website_analytics_domain ON website_analytics(website_domain);
CREATE INDEX IF NOT EXISTS idx_website_analytics_timestamp ON website_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_sync_events_tenant ON sync_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sync_events_processed ON sync_events(processed);

-- =====================================================
-- 5. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function for Knowledge Base Management
CREATE OR REPLACE FUNCTION add_knowledge_file(
    p_tenant_id VARCHAR(50),
    p_topic_id INTEGER,
    p_topic_name VARCHAR(100),
    p_file_name VARCHAR(255),
    p_google_drive_file_id VARCHAR(255),
    p_google_drive_url TEXT,
    p_file_size BIGINT,
    p_mime_type VARCHAR(100)
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO knowledge_base_files (
        tenant_id, topic_id, topic_name, file_name,
        google_drive_file_id, google_drive_url, file_size, mime_type
    )
    VALUES (
        p_tenant_id, p_topic_id, p_topic_name, p_file_name,
        p_google_drive_file_id, p_google_drive_url, p_file_size, p_mime_type
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get knowledge base files for a tenant
CREATE OR REPLACE FUNCTION get_tenant_knowledge_files(p_tenant_id VARCHAR(50))
RETURNS TABLE(
    id INTEGER,
    topic_id INTEGER,
    topic_name VARCHAR(100),
    file_name VARCHAR(255),
    google_drive_url TEXT,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT kbf.id, kbf.topic_id, kbf.topic_name, kbf.file_name,
           kbf.google_drive_url, kbf.file_size, kbf.mime_type, kbf.uploaded_at
    FROM knowledge_base_files kbf
    WHERE kbf.tenant_id = p_tenant_id
    ORDER BY kbf.topic_name, kbf.uploaded_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to update tenant availability
CREATE OR REPLACE FUNCTION update_tenant_availability(
    p_tenant_id VARCHAR(50),
    p_working_days JSONB,
    p_working_hours JSONB,
    p_slot_duration INTEGER,
    p_break_times JSONB DEFAULT NULL,
    p_timezone VARCHAR(100) DEFAULT 'UTC',
    p_min_advance_minutes INTEGER DEFAULT 120,
    p_max_advance_days INTEGER DEFAULT 30
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO tenant_availability (
        tenant_id, working_days, working_hours, slot_duration,
        break_times, timezone, min_advance_minutes, max_advance_days
    )
    VALUES (
        p_tenant_id, p_working_days, p_working_hours, p_slot_duration,
        p_break_times, p_timezone, p_min_advance_minutes, p_max_advance_days
    )
    ON CONFLICT (tenant_id) DO UPDATE SET
        working_days = EXCLUDED.working_days,
        working_hours = EXCLUDED.working_hours,
        slot_duration = EXCLUDED.slot_duration,
        break_times = EXCLUDED.break_times,
        timezone = EXCLUDED.timezone,
        min_advance_minutes = EXCLUDED.min_advance_minutes,
        max_advance_days = EXCLUDED.max_advance_days,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get tenant availability
CREATE OR REPLACE FUNCTION get_tenant_availability(p_tenant_id VARCHAR(50))
RETURNS TABLE(
    working_days JSONB,
    working_hours JSONB,
    slot_duration INTEGER,
    break_times JSONB,
    timezone VARCHAR(100),
    min_advance_minutes INTEGER,
    max_advance_days INTEGER,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT ta.working_days, ta.working_hours, ta.slot_duration,
           ta.break_times, ta.timezone, ta.min_advance_minutes,
           ta.max_advance_days, ta.updated_at
    FROM tenant_availability ta
    WHERE ta.tenant_id = p_tenant_id;
END;
$$ LANGUAGE plpgsql;

-- Function to track website analytics
CREATE OR REPLACE FUNCTION track_website_analytics(
    p_tenant_id VARCHAR(50),
    p_website_domain VARCHAR(255),
    p_page_url TEXT,
    p_referrer TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_session_id VARCHAR(100) DEFAULT NULL,
    p_event_type VARCHAR(50),
    p_event_data JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO website_analytics (
        tenant_id, website_domain, page_url, referrer,
        user_agent, session_id, event_type, event_data
    )
    VALUES (
        p_tenant_id, p_website_domain, p_page_url, p_referrer,
        p_user_agent, p_session_id, p_event_type, p_event_data
    );
END;
$$ LANGUAGE plpgsql;

-- Function to notify sync events
CREATE OR REPLACE FUNCTION notify_sync_event(
    p_tenant_id VARCHAR(50),
    p_event_type VARCHAR(50),
    p_event_data JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO sync_events (tenant_id, event_type, event_data)
    VALUES (p_tenant_id, p_event_type, p_event_data);
    
    -- Notify via PostgreSQL NOTIFY (for real-time updates)
    PERFORM pg_notify('sync_events', json_build_object(
        'tenant_id', p_tenant_id,
        'event_type', p_event_type,
        'event_data', p_event_data
    )::text);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. INSERT SAMPLE DATA FOR ACME_INC TENANT
-- =====================================================

-- Insert ACME_INC tenant if it doesn't exist
INSERT INTO tenants (
    tenant_id, business_name, admin_email, prompt, plan_type, model,
    welcome_message, suggested_prompt1, suggested_prompt2, suggested_prompt3,
    password_hash
) VALUES (
    'ACME_INC',
    'ACME Corporation',
    'admin@acme.com',
    'You are a helpful assistant for ACME Corporation. Help customers with their questions about our products and services.',
    'premium',
    1,
    'Welcome to ACME Corporation! How can I help you today?',
    'What products do you offer?',
    'How can I contact support?',
    'What are your business hours?',
    crypt('acme_corp_2024_hash', gen_salt('bf'))
) ON CONFLICT (tenant_id) DO UPDATE SET
    business_name = EXCLUDED.business_name,
    admin_email = EXCLUDED.admin_email,
    prompt = EXCLUDED.prompt,
    plan_type = EXCLUDED.plan_type,
    model = EXCLUDED.model,
    welcome_message = EXCLUDED.welcome_message,
    suggested_prompt1 = EXCLUDED.suggested_prompt1,
    suggested_prompt2 = EXCLUDED.suggested_prompt2,
    suggested_prompt3 = EXCLUDED.suggested_prompt3,
    password_hash = crypt('acme_corp_2024_hash', gen_salt('bf')),
    updated_at = NOW();

-- Insert ACME_INC client overview
INSERT INTO client_overview (tenant_id, total_sessions, total_messages, total_documents, plan_limits)
VALUES ('ACME_INC', 0, 0, 0, '{"daily_limit": 1000, "monthly_limit": 30000}')
ON CONFLICT (tenant_id) DO UPDATE SET
    total_sessions = EXCLUDED.total_sessions,
    total_messages = EXCLUDED.total_messages,
    total_documents = EXCLUDED.total_documents,
    plan_limits = EXCLUDED.plan_limits,
    updated_at = NOW();

-- Insert sample knowledge base files for ACME_INC
INSERT INTO knowledge_base_files (
    tenant_id, topic_id, topic_name, file_name, google_drive_file_id,
    google_drive_url, file_size, mime_type
) VALUES 
('ACME_INC', 1, 'Product Information', 'acme-product-catalog.pdf', 'acme_drive_id_1', 
 'https://drive.google.com/file/d/acme_drive_id_1/view', 1024000, 'application/pdf'),
('ACME_INC', 2, 'Support Documentation', 'acme-faq.docx', 'acme_drive_id_2',
 'https://drive.google.com/file/d/acme_drive_id_2/view', 512000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
('ACME_INC', 3, 'Pricing Information', 'acme-pricing-sheet.xlsx', 'acme_drive_id_3',
 'https://drive.google.com/file/d/acme_drive_id_3/view', 256000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
ON CONFLICT DO NOTHING;

-- Insert sample tenant availability for ACME_INC
INSERT INTO tenant_availability (
    tenant_id, working_days, working_hours, slot_duration, break_times, timezone,
    min_advance_minutes, max_advance_days
) VALUES (
    'ACME_INC',
    '["monday", "tuesday", "wednesday", "thursday", "friday"]'::jsonb,
    '{"start": "09:00", "end": "17:00"}'::jsonb,
    30,
    '{"lunch_start": "12:00", "lunch_end": "13:00"}'::jsonb,
    'America/New_York',
    120,
    30
) ON CONFLICT (tenant_id) DO UPDATE SET
    working_days = EXCLUDED.working_days,
    working_hours = EXCLUDED.working_hours,
    slot_duration = EXCLUDED.slot_duration,
    break_times = EXCLUDED.break_times,
    timezone = EXCLUDED.timezone,
    min_advance_minutes = EXCLUDED.min_advance_minutes,
    max_advance_days = EXCLUDED.max_advance_days,
    updated_at = NOW();

-- =====================================================
-- DATABASE UPDATE COMPLETE
-- =====================================================

-- Verify the updates
SELECT 'Database update completed successfully!' as status;

-- Show new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('knowledge_base_files', 'tenant_availability', 'website_analytics', 'sync_events')
ORDER BY table_name;
