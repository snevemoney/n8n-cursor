-- =====================================================
-- SAAS MASTER DATABASE SETUP
-- This script sets up saas_chatbot as the master database
-- and ensures proper tenant isolation
-- =====================================================

-- 1. Update saas_chatbot files to be platform-wide (no specific tenant)
UPDATE document_metadata 
SET tenant_id = 'PLATFORM_MASTER', user_id = 'platform_admin'
WHERE title LIKE '%saas_chatbot%';

-- 2. Create a special tenant for platform master data
INSERT INTO tenants (tenant_id, business_name, admin_email, prompt, plan_type, model, welcome_message, suggested_prompt1, suggested_prompt2, suggested_prompt3, is_active)
VALUES (
    'PLATFORM_MASTER',
    'Platform Master Database',
    'admin@yourplatform.com',
    'You are the master database assistant. Help manage platform-wide data and tenant configurations.',
    'enterprise',
    1,
    'Welcome to the Platform Master Database. How can I help you manage the platform?',
    'Show me all tenants',
    'What are the platform statistics?',
    'Help me configure a new tenant',
    true
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
    is_active = EXCLUDED.is_active;

-- 3. Create platform admin user
INSERT INTO users (user_id, user_name, tenant_id, is_active)
VALUES (
    'admin@yourplatform.com',
    'Platform Administrator',
    'PLATFORM_MASTER',
    true
) ON CONFLICT (user_id, tenant_id) DO UPDATE SET
    user_name = EXCLUDED.user_name,
    is_active = EXCLUDED.is_active;

-- 4. Create function to get tenant-specific knowledge base
CREATE OR REPLACE FUNCTION get_tenant_knowledge_base(p_tenant_id VARCHAR(50))
RETURNS TABLE(
    file_id TEXT,
    file_title TEXT,
    file_url TEXT,
    file_type TEXT,
    created_at TIMESTAMP,
    row_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dm.id as file_id,
        dm.title as file_title,
        dm.url as file_url,
        dm.schema as file_type,
        dm.created_at,
        COUNT(dr.id) as row_count
    FROM document_metadata dm
    LEFT JOIN document_rows dr ON dm.id = dr.dataset_id
    WHERE dm.tenant_id = p_tenant_id
    GROUP BY dm.id, dm.title, dm.url, dm.schema, dm.created_at
    ORDER BY dm.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to add file to tenant knowledge base
CREATE OR REPLACE FUNCTION add_file_to_tenant_knowledge_base(
    p_tenant_id VARCHAR(50),
    p_file_id TEXT,
    p_file_title TEXT,
    p_file_url TEXT,
    p_file_type TEXT,
    p_user_id VARCHAR(50) DEFAULT 'system'
)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    -- Insert document metadata
    INSERT INTO document_metadata (id, title, url, schema, tenant_id, user_id, created_at)
    VALUES (p_file_id, p_file_title, p_file_url, p_file_type, p_tenant_id, p_user_id, NOW())
    ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        url = EXCLUDED.url,
        schema = EXCLUDED.schema,
        tenant_id = EXCLUDED.tenant_id,
        user_id = EXCLUDED.user_id;
    
    result := 'File ' || p_file_title || ' added to tenant ' || p_tenant_id || ' knowledge base';
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to get platform master data
CREATE OR REPLACE FUNCTION get_platform_master_data()
RETURNS TABLE(
    tenant_id VARCHAR(50),
    business_name VARCHAR(100),
    admin_email VARCHAR(100),
    plan_type VARCHAR(50),
    is_active BOOLEAN,
    file_count BIGINT,
    total_users BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tenant_id,
        t.business_name,
        t.admin_email,
        t.plan_type,
        t.is_active,
        COUNT(DISTINCT dm.id) as file_count,
        COUNT(DISTINCT u.user_id) as total_users
    FROM tenants t
    LEFT JOIN document_metadata dm ON t.tenant_id = dm.tenant_id
    LEFT JOIN users u ON t.tenant_id = u.tenant_id
    WHERE t.tenant_id != 'PLATFORM_MASTER'
    GROUP BY t.tenant_id, t.business_name, t.admin_email, t.plan_type, t.is_active
    ORDER BY t.business_name;
END;
$$ LANGUAGE plpgsql;

-- 7. Create RLS policies for tenant isolation
ALTER TABLE document_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_rows ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS document_metadata_tenant_isolation ON document_metadata;
DROP POLICY IF EXISTS document_rows_tenant_isolation ON document_rows;

-- Create new policies
CREATE POLICY document_metadata_tenant_isolation ON document_metadata
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant_id', true) OR 
        tenant_id = 'PLATFORM_MASTER' OR
        current_setting('app.current_tenant_id', true) = 'PLATFORM_MASTER'
    );

CREATE POLICY document_rows_tenant_isolation ON document_rows
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant_id', true) OR 
        tenant_id = 'PLATFORM_MASTER' OR
        current_setting('app.current_tenant_id', true) = 'PLATFORM_MASTER'
    );

-- 8. Insert sample knowledge base files for each tenant
INSERT INTO knowledge_base_files (tenant_id, topic_name, file_name, google_drive_file_id, google_drive_url, file_size, mime_type, uploaded_at)
VALUES 
    ('ACME_INC', 'Company Policies', 'ACME Policies.pdf', 'sample_file_id_1', 'https://drive.google.com/file/d/sample_file_id_1', 1024000, 'application/pdf', NOW()),
    ('ACME_INC', 'Product Catalog', 'ACME Products.xlsx', 'sample_file_id_2', 'https://drive.google.com/file/d/sample_file_id_2', 512000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', NOW()),
    ('sample-tenant-1', 'Service Manual', 'Service Manual.pdf', 'sample_file_id_3', 'https://drive.google.com/file/d/sample_file_id_3', 2048000, 'application/pdf', NOW()),
    ('test-tenant-123', 'Training Materials', 'Training Guide.docx', 'sample_file_id_4', 'https://drive.google.com/file/d/sample_file_id_4', 768000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', NOW())
ON CONFLICT DO NOTHING;

-- 9. Create view for tenant dashboard
CREATE OR REPLACE VIEW tenant_dashboard AS
SELECT 
    t.tenant_id,
    t.business_name,
    t.admin_email,
    t.plan_type,
    t.is_active,
    COUNT(DISTINCT dm.id) as total_files,
    COUNT(DISTINCT dr.id) as total_rows,
    COUNT(DISTINCT u.user_id) as total_users,
    COUNT(DISTINCT kbf.id) as knowledge_base_files,
    MAX(dm.created_at) as last_file_upload
FROM tenants t
LEFT JOIN document_metadata dm ON t.tenant_id = dm.tenant_id
LEFT JOIN document_rows dr ON dm.id = dr.dataset_id
LEFT JOIN users u ON t.tenant_id = u.tenant_id
LEFT JOIN knowledge_base_files kbf ON t.tenant_id = kbf.tenant_id
WHERE t.tenant_id != 'PLATFORM_MASTER'
GROUP BY t.tenant_id, t.business_name, t.admin_email, t.plan_type, t.is_active;

-- 10. Create function to validate tenant file upload
CREATE OR REPLACE FUNCTION validate_tenant_file_upload(
    p_tenant_id VARCHAR(50),
    p_file_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    tenant_exists BOOLEAN;
    file_exists BOOLEAN;
BEGIN
    -- Check if tenant exists
    SELECT EXISTS(SELECT 1 FROM tenants WHERE tenant_id = p_tenant_id AND is_active = true) INTO tenant_exists;
    
    -- Check if file already exists for this tenant
    SELECT EXISTS(SELECT 1 FROM document_metadata WHERE id = p_file_id AND tenant_id = p_tenant_id) INTO file_exists;
    
    RETURN tenant_exists AND NOT file_exists;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'SAAS Master Database Setup Complete!' as status;
