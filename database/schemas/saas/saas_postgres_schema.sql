-- =====================================================
-- Multi-Tenant SaaS PostgreSQL Database Schema
-- Complete schema for production-ready SaaS chatbot
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_jsontoken;

-- =====================================================
-- 1. CORE TENANT MANAGEMENT TABLES
-- =====================================================

-- Main tenants table (matches Google Sheets structure)
CREATE TABLE tenants (
    tenant_id VARCHAR(50) PRIMARY KEY,
    business_name VARCHAR(100),
    admin_email VARCHAR(100),
    prompt TEXT,
    plan_type VARCHAR(50),
    model INTEGER, -- 1=OpenAI, 2=Anthropic, 3=Google
    welcome_message TEXT,
    suggested_prompt1 TEXT,
    suggested_prompt2 TEXT,
    suggested_prompt3 TEXT,
    password_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tenant contacts/leads tracking
CREATE TABLE tenant_contacts (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    contact_type VARCHAR(50), -- 'lead', 'contact', 'booking'
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    business_type VARCHAR(100),
    number_of_employees VARCHAR(50),
    industry VARCHAR(100),
    website_url TEXT,
    goals TEXT,
    status VARCHAR(50),
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Support tickets system
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    ticket_id VARCHAR(50) UNIQUE,
    subject TEXT,
    description TEXT,
    priority VARCHAR(20), -- 'low', 'medium', 'high', 'urgent'
    status VARCHAR(20), -- 'open', 'in_progress', 'resolved', 'closed'
    assigned_to VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- CSAT feedback tracking
CREATE TABLE csat_feedback (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    session_id VARCHAR(100),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Analytics and usage tracking
CREATE TABLE analytics (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    metric_type VARCHAR(50), -- 'chat_session', 'api_call', 'document_upload'
    metric_value DECIMAL(10,2),
    metadata JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Domain management for white-label
CREATE TABLE domains (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    domain_name VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    ssl_enabled BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Owner/admin management
CREATE TABLE owners (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    owner_email VARCHAR(100),
    role VARCHAR(50), -- 'admin', 'owner', 'manager'
    permissions JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Client overview/summary
CREATE TABLE client_overview (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    total_sessions INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    total_documents INTEGER DEFAULT 0,
    last_active TIMESTAMP,
    monthly_usage INTEGER DEFAULT 0,
    plan_limits JSONB,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. ENHANCED DOCUMENT MANAGEMENT (MULTI-TENANT)
-- =====================================================

-- Enhanced document metadata with tenant isolation
CREATE TABLE document_metadata (
    id TEXT PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    title TEXT,
    url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    schema TEXT,
    user_id VARCHAR(50) DEFAULT 'default',
    file_size BIGINT,
    file_type VARCHAR(100),
    processing_status VARCHAR(50) DEFAULT 'pending',
    embedding_status VARCHAR(50) DEFAULT 'pending'
);

-- Enhanced document rows with tenant context
CREATE TABLE document_rows (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    dataset_id TEXT REFERENCES document_metadata(id),
    row_data JSONB,
    user_id VARCHAR(50) DEFAULT 'default',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced vector storage with tenant isolation
CREATE TABLE documents_pg (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    text TEXT,
    metadata JSONB,
    embedding VECTOR(1536),
    user_id VARCHAR(50) DEFAULT 'default',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced chat histories with tenant context
CREATE TABLE n8n_chat_histories (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    session_id VARCHAR(100),
    content TEXT,
    embedding VECTOR(1536),
    metadata JSONB,
    user_id VARCHAR(50) DEFAULT 'default',
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. USER MANAGEMENT & AUTHENTICATION
-- =====================================================

-- User management within tenants
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    user_id VARCHAR(50) UNIQUE NOT NULL,
    user_name VARCHAR(100),
    email VARCHAR(100),
    google_drive_folder_id VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User folder mapping for Google Drive integration
CREATE TABLE user_folder_mapping (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    user_id VARCHAR(50) UNIQUE NOT NULL,
    folder_name VARCHAR(100) NOT NULL,
    google_drive_folder_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Session management
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    session_id VARCHAR(100) UNIQUE,
    user_email VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- =====================================================
-- 4. POSTGRESQL FUNCTIONS FOR MULTI-TENANCY
-- =====================================================

-- Set tenant context function
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_identifier TEXT, user_identifier TEXT DEFAULT 'default')
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', tenant_identifier, true);
    PERFORM set_config('app.current_user_id', user_identifier, true);
END;
$$ LANGUAGE plpgsql;

-- JWT Authentication Functions
CREATE OR REPLACE FUNCTION authenticate_tenant(
    p_tenant_id VARCHAR(50),
    p_password VARCHAR(255)
)
RETURNS TEXT AS $$
DECLARE
    stored_hash TEXT;
    jwt_token TEXT;
    tenant_config RECORD;
BEGIN
    -- Get tenant configuration and password hash
    SELECT password_hash, business_name, admin_email, model, plan_type
    INTO tenant_config
    FROM tenants 
    WHERE tenant_id = p_tenant_id AND is_active = true;
    
    -- Check if tenant exists
    IF tenant_config IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Verify password
    IF crypt(p_password, tenant_config.password_hash) = tenant_config.password_hash THEN
        -- Generate JWT token
        jwt_token := sign(
            json_build_object(
                'tenant_id', p_tenant_id,
                'business_name', tenant_config.business_name,
                'admin_email', tenant_config.admin_email,
                'model', tenant_config.model,
                'plan_type', tenant_config.plan_type,
                'exp', extract(epoch from now() + interval '24 hours'),
                'iat', extract(epoch from now()),
                'iss', 'saas-chatbot-platform'
            ),
            'your-jwt-secret-key-change-in-production'
        );
        
        -- Track login analytics
        PERFORM track_usage(
            p_tenant_id,
            'login_session',
            'tenant_login',
            1.0,
            json_build_object('login_time', now(), 'ip_address', 'unknown')
        );
        
        RETURN jwt_token;
    ELSE
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Validate JWT token function
CREATE OR REPLACE FUNCTION validate_jwt_token(token TEXT)
RETURNS TABLE(
    tenant_id VARCHAR(50),
    business_name VARCHAR(100),
    admin_email VARCHAR(100),
    model INTEGER,
    plan_type VARCHAR(50),
    is_valid BOOLEAN
) AS $$
DECLARE
    payload JSONB;
    current_time BIGINT;
BEGIN
    -- Verify and decode JWT token
    payload := verify(token, 'your-jwt-secret-key-change-in-production');
    
    -- Check if token is expired
    current_time := extract(epoch from now());
    
    IF (payload->>'exp')::BIGINT < current_time THEN
        -- Token expired
        RETURN QUERY SELECT 
            NULL::VARCHAR(50), NULL::VARCHAR(100), NULL::VARCHAR(100), 
            NULL::INTEGER, NULL::VARCHAR(50), false;
        RETURN;
    END IF;
    
    -- Return tenant information
    RETURN QUERY SELECT 
        (payload->>'tenant_id')::VARCHAR(50),
        (payload->>'business_name')::VARCHAR(100),
        (payload->>'admin_email')::VARCHAR(100),
        (payload->>'model')::INTEGER,
        (payload->>'plan_type')::VARCHAR(50),
        true;
END;
$$ LANGUAGE plpgsql;

-- Add tenant function
CREATE OR REPLACE FUNCTION add_tenant(
    p_tenant_id VARCHAR(50),
    p_business_name VARCHAR(100),
    p_admin_email VARCHAR(100),
    p_prompt TEXT,
    p_plan_type VARCHAR(50),
    p_model INTEGER,
    p_welcome_message TEXT,
    p_suggested_prompt1 TEXT,
    p_suggested_prompt2 TEXT,
    p_suggested_prompt3 TEXT,
    p_password VARCHAR(255)
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO tenants (
        tenant_id, business_name, admin_email, prompt, plan_type,
        model, welcome_message, suggested_prompt1, suggested_prompt2,
        suggested_prompt3, password_hash
    )
    VALUES (
        p_tenant_id, p_business_name, p_admin_email, p_prompt, p_plan_type,
        p_model, p_welcome_message, p_suggested_prompt1, p_suggested_prompt2,
        p_suggested_prompt3, crypt(p_password, gen_salt('bf'))
    )
    ON CONFLICT (tenant_id) DO UPDATE SET
        business_name = EXCLUDED.business_name,
        admin_email = EXCLUDED.admin_email,
        prompt = EXCLUDED.prompt,
        plan_type = EXCLUDED.plan_type,
        model = EXCLUDED.model,
        welcome_message = EXCLUDED.welcome_message,
        suggested_prompt1 = EXCLUDED.suggested_prompt1,
        suggested_prompt2 = EXCLUDED.suggested_prompt2,
        suggested_prompt3 = EXCLUDED.suggested_prompt3,
        password_hash = crypt(p_password, gen_salt('bf')),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Get tenant configuration
CREATE OR REPLACE FUNCTION get_tenant_config(p_tenant_id VARCHAR(50))
RETURNS TABLE(
    tenant_id VARCHAR(50),
    business_name VARCHAR(100),
    admin_email VARCHAR(100),
    prompt TEXT,
    plan_type VARCHAR(50),
    model INTEGER,
    welcome_message TEXT,
    suggested_prompt1 TEXT,
    suggested_prompt2 TEXT,
    suggested_prompt3 TEXT,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.tenant_id, t.business_name, t.admin_email, t.prompt, 
           t.plan_type, t.model, t.welcome_message, t.suggested_prompt1,
           t.suggested_prompt2, t.suggested_prompt3, t.is_active
    FROM tenants t
    WHERE t.tenant_id = p_tenant_id AND t.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Track usage function
CREATE OR REPLACE FUNCTION track_usage(
    p_tenant_id VARCHAR(50),
    p_session_id VARCHAR(100),
    p_metric_type VARCHAR(50),
    p_metric_value DECIMAL(10,2),
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO analytics (tenant_id, metric_type, metric_value, metadata)
    VALUES (p_tenant_id, p_metric_type, p_metric_value, p_metadata);
    
    -- Update client overview
    UPDATE client_overview 
    SET monthly_usage = monthly_usage + p_metric_value,
        last_active = NOW(),
        updated_at = NOW()
    WHERE tenant_id = p_tenant_id;
END;
$$ LANGUAGE plpgsql;

-- Get user folder ID function
CREATE OR REPLACE FUNCTION get_user_folder_id(p_tenant_id VARCHAR(50), p_user_id VARCHAR(50))
RETURNS VARCHAR(100) AS $$
DECLARE
    folder_id VARCHAR(100);
BEGIN
    SELECT google_drive_folder_id INTO folder_id
    FROM user_folder_mapping
    WHERE tenant_id = p_tenant_id AND user_id = p_user_id;
    RETURN folder_id;
END;
$$ LANGUAGE plpgsql;

-- Add user function
CREATE OR REPLACE FUNCTION add_user(
    p_tenant_id VARCHAR(50),
    p_user_id VARCHAR(50), 
    p_user_name VARCHAR(100), 
    p_email VARCHAR(100),
    p_folder_name VARCHAR(100), 
    p_google_drive_folder_id VARCHAR(100)
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO users (tenant_id, user_id, user_name, email, google_drive_folder_id)
    VALUES (p_tenant_id, p_user_id, p_user_name, p_email, p_google_drive_folder_id)
    ON CONFLICT (user_id) DO UPDATE SET
        tenant_id = EXCLUDED.tenant_id,
        user_name = EXCLUDED.user_name,
        email = EXCLUDED.email,
        google_drive_folder_id = EXCLUDED.google_drive_folder_id;

    INSERT INTO user_folder_mapping (tenant_id, user_id, folder_name, google_drive_folder_id)
    VALUES (p_tenant_id, p_user_id, p_folder_name, p_google_drive_folder_id)
    ON CONFLICT (user_id) DO UPDATE SET
        tenant_id = EXCLUDED.tenant_id,
        folder_name = EXCLUDED.folder_name,
        google_drive_folder_id = EXCLUDED.google_drive_folder_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. TENANT-ISOLATED VIEWS FOR SECURITY
-- =====================================================

-- Create tenant-isolated views for security
CREATE VIEW tenant_document_metadata AS
SELECT * FROM document_metadata
WHERE tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default');

CREATE VIEW tenant_documents_pg AS
SELECT * FROM documents_pg
WHERE tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default');

CREATE VIEW tenant_document_rows AS
SELECT * FROM document_rows
WHERE tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default');

CREATE VIEW tenant_chat_histories AS
SELECT * FROM n8n_chat_histories
WHERE tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default');

-- =====================================================
-- 6. ROW-LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tenant-specific tables
ALTER TABLE document_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents_pg ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_chat_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE csat_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_folder_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_overview ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant isolation
CREATE POLICY tenant_isolation_document_metadata ON document_metadata
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_document_rows ON document_rows
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_documents_pg ON documents_pg
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_chat_histories ON n8n_chat_histories
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_contacts ON tenant_contacts
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_tickets ON tickets
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_csat ON csat_feedback
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_analytics ON analytics
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_domains ON domains
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_owners ON owners
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_users ON users
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_user_folders ON user_folder_mapping
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_sessions ON user_sessions
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_client_overview ON client_overview
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

-- =====================================================
-- 7. PERFORMANCE INDEXES
-- =====================================================

-- Performance indexes for tenants
CREATE INDEX idx_tenants_admin_email ON tenants(admin_email);
CREATE INDEX idx_tenants_active ON tenants(is_active);
CREATE INDEX idx_tenants_password_hash ON tenants(password_hash);

-- Performance indexes for documents
CREATE INDEX idx_document_metadata_tenant ON document_metadata(tenant_id);
CREATE INDEX idx_document_metadata_user ON document_metadata(user_id);
CREATE INDEX idx_document_rows_tenant ON document_rows(tenant_id);
CREATE INDEX idx_document_rows_dataset ON document_rows(dataset_id);
CREATE INDEX idx_documents_pg_tenant ON documents_pg(tenant_id);
CREATE INDEX idx_documents_pg_user ON documents_pg(user_id);

-- Performance indexes for chat and sessions
CREATE INDEX idx_chat_histories_tenant ON n8n_chat_histories(tenant_id);
CREATE INDEX idx_chat_histories_session ON n8n_chat_histories(session_id);
CREATE INDEX idx_sessions_tenant ON user_sessions(tenant_id);
CREATE INDEX idx_sessions_user_email ON user_sessions(user_email);

-- Performance indexes for analytics and tracking
CREATE INDEX idx_analytics_tenant_time ON analytics(tenant_id, timestamp);
CREATE INDEX idx_analytics_metric_type ON analytics(metric_type);
CREATE INDEX idx_csat_tenant ON csat_feedback(tenant_id);
CREATE INDEX idx_tickets_tenant ON tickets(tenant_id);
CREATE INDEX idx_tickets_status ON tickets(status);

-- Performance indexes for users and folders
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_folder_mapping_tenant ON user_folder_mapping(tenant_id);

-- =====================================================
-- 8. KNOWLEDGE BASE & AVAILABILITY MANAGEMENT
-- =====================================================

-- Knowledge Base Files Table
CREATE TABLE knowledge_base_files (
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
CREATE TABLE tenant_availability (
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
CREATE TABLE website_analytics (
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
CREATE TABLE sync_events (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id),
    event_type VARCHAR(50), -- 'config_update', 'file_upload', 'availability_change'
    event_data JSONB,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE knowledge_base_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY tenant_isolation_knowledge_files ON knowledge_base_files
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_availability ON tenant_availability
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_website_analytics ON website_analytics
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

CREATE POLICY tenant_isolation_sync_events ON sync_events
    FOR ALL TO PUBLIC
    USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

-- Performance indexes for new tables
CREATE INDEX idx_knowledge_files_tenant ON knowledge_base_files(tenant_id);
CREATE INDEX idx_knowledge_files_topic ON knowledge_base_files(topic_name);
CREATE INDEX idx_availability_tenant ON tenant_availability(tenant_id);
CREATE INDEX idx_website_analytics_tenant ON website_analytics(tenant_id);
CREATE INDEX idx_website_analytics_domain ON website_analytics(website_domain);
CREATE INDEX idx_website_analytics_timestamp ON website_analytics(timestamp);
CREATE INDEX idx_sync_events_tenant ON sync_events(tenant_id);
CREATE INDEX idx_sync_events_processed ON sync_events(processed);

-- Functions for Knowledge Base Management
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
-- 9. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample tenant data
INSERT INTO tenants (
    tenant_id, business_name, admin_email, prompt, plan_type, model,
    welcome_message, suggested_prompt1, suggested_prompt2, suggested_prompt3,
    password_hash
) VALUES (
    'sample-tenant-1',
    'Acme Corporation',
    'admin@acme.com',
    'You are a helpful assistant for Acme Corporation. Help customers with their questions about our products and services.',
    'premium',
    1,
    'Welcome to Acme Corporation! How can I help you today?',
    'What products do you offer?',
    'How can I contact support?',
    'What are your business hours?',
    '$2b$10$example_hash_here'
);

-- Insert sample client overview
INSERT INTO client_overview (tenant_id, total_sessions, total_messages, total_documents, plan_limits)
VALUES ('sample-tenant-1', 0, 0, 0, '{"daily_limit": 1000, "monthly_limit": 30000}');

-- Insert sample knowledge base files
INSERT INTO knowledge_base_files (
    tenant_id, topic_id, topic_name, file_name, google_drive_file_id,
    google_drive_url, file_size, mime_type
) VALUES 
('sample-tenant-1', 1, 'Product Information', 'product-catalog.pdf', 'sample_drive_id_1', 
 'https://drive.google.com/file/d/sample_drive_id_1/view', 1024000, 'application/pdf'),
('sample-tenant-1', 2, 'Support Documentation', 'faq-document.docx', 'sample_drive_id_2',
 'https://drive.google.com/file/d/sample_drive_id_2/view', 512000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

-- Insert sample tenant availability
INSERT INTO tenant_availability (
    tenant_id, working_days, working_hours, slot_duration, break_times, timezone,
    min_advance_minutes, max_advance_days
) VALUES (
    'sample-tenant-1',
    '["monday", "tuesday", "wednesday", "thursday", "friday"]'::jsonb,
    '{"start": "09:00", "end": "17:00"}'::jsonb,
    30,
    '{"lunch_start": "12:00", "lunch_end": "13:00"}'::jsonb,
    'America/New_York',
    120,
    30
);

-- =====================================================
-- SCHEMA CREATION COMPLETE
-- =====================================================

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_n8n_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_n8n_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_n8n_user;

