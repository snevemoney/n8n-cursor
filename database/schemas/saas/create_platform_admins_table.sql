-- Create platform_admins table for Google Sheets sync
CREATE TABLE IF NOT EXISTS platform_admins (
    admin_id VARCHAR(50) PRIMARY KEY,
    admin_name VARCHAR(100),
    admin_email VARCHAR(100),
    role VARCHAR(50),
    permissions JSONB,
    last_login TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    notes TEXT
);

-- Add RLS policy for platform admin access
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

-- Allow platform admins to access their own data
CREATE POLICY platform_admins_access ON platform_admins
    FOR ALL USING (true); -- Platform admins can access all admin data

-- Insert sample platform admin data
INSERT INTO platform_admins (admin_id, admin_name, admin_email, role, permissions, notes) VALUES
('PLATFORM_ADMIN_001', 'Platform Admin', 'admin@yourplatform.com', 'super_admin', 
 '{"all": true, "platform_management": true, "tenant_management": true, "user_management": true, "analytics": true, "billing": true, "support": true}', 
 'Main platform administrator')
ON CONFLICT (admin_id) DO UPDATE SET
    admin_name = EXCLUDED.admin_name,
    admin_email = EXCLUDED.admin_email,
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    notes = EXCLUDED.notes;

-- Create function to get platform admin info
CREATE OR REPLACE FUNCTION get_platform_admin(p_admin_email VARCHAR(100))
RETURNS TABLE(
    admin_id VARCHAR(50),
    admin_name VARCHAR(100),
    admin_email VARCHAR(100),
    role VARCHAR(50),
    permissions JSONB,
    last_login TIMESTAMP,
    login_count INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT pa.admin_id, pa.admin_name, pa.admin_email, pa.role, 
           pa.permissions, pa.last_login, pa.login_count, pa.is_active,
           pa.created_at, pa.notes
    FROM platform_admins pa
    WHERE pa.admin_email = p_admin_email AND pa.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Test the function
SELECT 'Platform admins table created successfully!' as status;
SELECT * FROM platform_admins;
