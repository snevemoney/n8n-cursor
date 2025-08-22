# 🗄️ Database Policies & Security

**Project**: n8n-cursor  
**Last Updated**: $(date +%Y-%m-%d)  
**Status**: 🟡 IN_PROGRESS - Policies being implemented

## 🔐 Row Level Security (RLS) Policies

### Overview
Row Level Security ensures that users can only access data they're authorized to see, even at the database level.

### Core Principles
- **Tenant Isolation**: Every table must be locked by `tenant_id`
- **User Context**: Access based on authenticated user context
- **Default Deny**: All policies default to deny unless explicitly allowed

### Implementation Strategy

#### 1. Base Table Structure
```sql
-- Every table should include these fields
CREATE TABLE example_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX idx_example_table_tenant_id ON example_table(tenant_id);
CREATE INDEX idx_example_table_created_at ON example_table(created_at);
```

#### 2. RLS Policy Template
```sql
-- Enable RLS on table
ALTER TABLE example_table ENABLE ROW LEVEL SECURITY;

-- Create policy for tenant isolation
CREATE POLICY tenant_isolation_policy ON example_table
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Create policy for user context
CREATE POLICY user_context_policy ON example_table
    FOR ALL
    USING (created_by = current_setting('app.current_user_id')::UUID);
```

### Policy Categories

#### Authentication Policies
```sql
-- Ensure user is authenticated
CREATE POLICY auth_required ON sensitive_table
    FOR ALL
    USING (current_setting('app.current_user_id') IS NOT NULL);
```

#### Role-Based Policies
```sql
-- Admin access (full CRUD)
CREATE POLICY admin_access ON admin_table
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = current_setting('app.current_user_id')::UUID
            AND ur.role = 'admin'
        )
    );
```

#### Time-Based Policies
```sql
-- Data retention policy
CREATE POLICY retention_policy ON log_table
    FOR DELETE
    USING (created_at < NOW() - INTERVAL '90 days');
```

## 📊 Audit & Logging

### Audit Trail Implementation

#### 1. Audit Table Structure
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Indexes for performance
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_changed_at ON audit_logs(changed_at);
CREATE INDEX idx_audit_logs_changed_by ON audit_logs(changed_by);
```

#### 2. Audit Trigger Function
```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, operation, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), current_setting('app.current_user_id')::UUID);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, operation, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), current_setting('app.current_user_id')::UUID);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, operation, old_values, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), current_setting('app.current_user_id')::UUID);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

#### 3. Apply Audit to Tables
```sql
-- Example: Apply audit to users table
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

### Logging Strategy

#### Application-Level Logging
```sql
-- Create logging function
CREATE OR REPLACE FUNCTION log_activity(
    activity_type TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
BEGIN
    INSERT INTO activity_logs (activity_type, description, metadata, user_id)
    VALUES (activity_type, description, metadata, current_setting('app.current_user_id')::UUID);
END;
$$ LANGUAGE plpgsql;
```

## 🚀 Migration Strategy

### Migration Tool Selection
**Primary Tool**: [Prisma Migrate | Flyway | Custom SQL | Other]

**Rationale**: [Why this tool was chosen]

### Migration Process

#### 1. Development Workflow
```bash
# Create new migration
make db-migrate NAME="add_user_audit_table"

# Apply migration locally
make db-migrate-up

# Test migration
make db-test

# Rollback if needed
make db-migrate-down
```

#### 2. Migration File Structure
```sql
-- migrations/001_add_user_audit_table.sql
BEGIN;

-- Add new table
CREATE TABLE user_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_user_audit_user_id ON user_audit(user_id);
CREATE INDEX idx_user_audit_created_at ON user_audit(created_at);

-- Enable RLS
ALTER TABLE user_audit ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY user_audit_isolation ON user_audit
    FOR ALL
    USING (
        user_id IN (
            SELECT id FROM users 
            WHERE tenant_id = current_setting('app.current_tenant_id')::UUID
        )
    );

COMMIT;
```

#### 3. Rollback Strategy
```sql
-- Rollback migration
BEGIN;

-- Drop policies
DROP POLICY IF EXISTS user_audit_isolation ON user_audit;

-- Drop table
DROP TABLE IF EXISTS user_audit;

COMMIT;
```

### Migration Best Practices

#### Do's
- [ ] **Always test migrations** in development first
- [ ] **Use transactions** for atomicity
- [ ] **Include rollback scripts** for every migration
- [ ] **Test rollbacks** before deploying
- [ ] **Document breaking changes** clearly
- [ ] **Use descriptive names** for migration files

#### Don'ts
- [ ] **Never modify production** directly
- [ ] **Avoid breaking changes** in production
- [ ] **Don't skip testing** rollback procedures
- [ ] **Avoid large migrations** during peak hours
- [ ] **Don't forget to backup** before migrations

## 🔒 Security Policies

### Data Encryption

#### 1. Column-Level Encryption
```sql
-- Encrypt sensitive columns
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Example: Encrypt SSN
ALTER TABLE users ADD COLUMN ssn_encrypted BYTEA;

-- Encrypt function
CREATE OR REPLACE FUNCTION encrypt_ssn(ssn TEXT, key TEXT)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(ssn, key);
END;
$$ LANGUAGE plpgsql;

-- Decrypt function
CREATE OR REPLACE FUNCTION decrypt_ssn(ssn_encrypted BYTEA, key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(ssn_encrypted, key);
END;
$$ LANGUAGE plpgsql;
```

#### 2. Connection Security
```sql
-- Require SSL connections
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_ciphers = 'HIGH:MEDIUM:+3DES:!aNULL';
ALTER SYSTEM SET ssl_prefer_server_ciphers = on;

-- Reload configuration
SELECT pg_reload_conf();
```

### Access Control

#### 1. User Management
```sql
-- Create application user
CREATE USER app_user WITH PASSWORD 'secure_password';

-- Grant minimal permissions
GRANT CONNECT ON DATABASE n8n_cursor TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- Revoke dangerous permissions
REVOKE CREATE ON SCHEMA public FROM app_user;
REVOKE DROP ON SCHEMA public FROM app_user;
```

#### 2. Connection Pooling
```sql
-- Set connection limits
ALTER USER app_user CONNECTION LIMIT 10;

-- Monitor connections
SELECT usename, count(*) 
FROM pg_stat_activity 
GROUP BY usename;
```

## 📈 Monitoring & Maintenance

### Performance Monitoring

#### 1. Query Performance
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1 second

-- Monitor slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC;
```

#### 2. Table Statistics
```sql
-- Update table statistics
ANALYZE;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY tablename, attname;
```

### Maintenance Tasks

#### 1. Regular Maintenance
```bash
# Add to crontab (daily at 2 AM)
0 2 * * * /path/to/n8n-cursor/scripts/ops/db-maintenance.sh

# Maintenance script should:
# - VACUUM tables
# - ANALYZE tables
# - Check for bloat
# - Monitor disk usage
```

#### 2. Backup Strategy
```bash
# Database backup
make db-backup

# Restore database
make db-restore FILE="backup_file.sql"

# Verify backup integrity
make db-verify FILE="backup_file.sql"
```

## 🧪 Testing & Validation

### Policy Testing

#### 1. RLS Policy Tests
```sql
-- Test tenant isolation
SET app.current_tenant_id = 'tenant-1-uuid';
SELECT * FROM users; -- Should only show tenant 1 users

SET app.current_tenant_id = 'tenant-2-uuid';
SELECT * FROM users; -- Should only show tenant 2 users
```

#### 2. Audit Trail Tests
```sql
-- Test audit logging
INSERT INTO users (name, email) VALUES ('Test User', 'test@example.com');

-- Verify audit log
SELECT * FROM audit_logs WHERE table_name = 'users' ORDER BY changed_at DESC LIMIT 1;
```

### Migration Testing

#### 1. Test Environment
```bash
# Create test database
createdb n8n_cursor_test

# Run migrations
make db-migrate-up ENV=test

# Run tests
make db-test

# Clean up
dropdb n8n_cursor_test
```

#### 2. Rollback Testing
```bash
# Test rollback procedures
make db-migrate-down ENV=test

# Verify rollback success
make db-verify-rollback ENV=test
```

## 📚 Resources & References

### Documentation
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Prisma Migration Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)

### Tools
- **Database Health Check**: `make db-health`
- **Migration Management**: `make db-migrate-help`
- **Backup/Restore**: `make db-backup`, `make db-restore`
- **Policy Testing**: `make db-test-policies`

### Support
- **Database Issues**: [Contact info]
- **Migration Help**: [Contact info]
- **Security Concerns**: [Contact info]

---

## 🔄 Quick Database Commands

```bash
# Check database health
make db-health

# Create backup
make db-backup

# Run migrations
make db-migrate-up

# Test policies
make db-test-policies

# Monitor performance
make db-monitor
```

**Remember**: Database security is critical - test everything thoroughly before production!
