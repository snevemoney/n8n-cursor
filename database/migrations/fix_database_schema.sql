-- Fix missing columns in existing tables
-- Add created_at to tenant_contacts
ALTER TABLE tenant_contacts 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Add is_active to sessions
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add occurred_at to error_logs
ALTER TABLE error_logs 
ADD COLUMN IF NOT EXISTS occurred_at TIMESTAMPTZ DEFAULT NOW();

-- Add operation_type to retry_configs
ALTER TABLE retry_configs 
ADD COLUMN IF NOT EXISTS operation_type TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_contacts_created_at ON tenant_contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_error_logs_occurred_at ON error_logs(occurred_at);

-- Summary
SELECT 'Database schema fixes applied!' AS status, 
       COUNT(*) AS tables_updated 
FROM information_schema.columns 
WHERE table_name IN ('tenant_contacts', 'sessions', 'error_logs', 'retry_configs')
  AND column_name IN ('created_at', 'is_active', 'occurred_at', 'operation_type');
