-- Data Governance Schema
-- Policies, access control, retention, and audit logging

-- Data Assets Registry
CREATE TABLE IF NOT EXISTS data_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    resource_type TEXT NOT NULL, -- 'rag_document' | 'event' | 'workflow' | 'secret' | 'conversation' | etc.
    resource_id TEXT NOT NULL, -- Foreign key or opaque ID
    sensitivity TEXT NOT NULL DEFAULT 'medium' CHECK (sensitivity IN ('low', 'medium', 'high', 'secret')),
    owner_user_id TEXT, -- NULL for system-owned
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resource_type, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_data_assets_resource_type ON data_assets (resource_type);
CREATE INDEX IF NOT EXISTS idx_data_assets_resource_id ON data_assets (resource_id);
CREATE INDEX IF NOT EXISTS idx_data_assets_owner ON data_assets (owner_user_id);
CREATE INDEX IF NOT EXISTS idx_data_assets_sensitivity ON data_assets (sensitivity);

-- Governance Policies
CREATE TABLE IF NOT EXISTS governance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    scope TEXT NOT NULL CHECK (scope IN ('global', 'project', 'tenant')),
    config_json JSONB NOT NULL DEFAULT '{}'::jsonb, -- Rules: allowed actions, roles, retention, etc.
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_governance_policies_scope ON governance_policies (scope);
CREATE INDEX IF NOT EXISTS idx_governance_policies_enabled ON governance_policies (enabled);

-- Policy Bindings (who/what can access what)
CREATE TABLE IF NOT EXISTS policy_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID NOT NULL REFERENCES governance_policies(id) ON DELETE CASCADE,
    principal_type TEXT NOT NULL CHECK (principal_type IN ('user', 'role', 'tenant')),
    principal_id TEXT NOT NULL,
    asset_id UUID REFERENCES data_assets(id) ON DELETE CASCADE, -- NULL = global binding
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(policy_id, principal_type, principal_id, asset_id)
);

CREATE INDEX IF NOT EXISTS idx_policy_bindings_policy_id ON policy_bindings (policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_bindings_principal ON policy_bindings (principal_type, principal_id);
CREATE INDEX IF NOT EXISTS idx_policy_bindings_asset_id ON policy_bindings (asset_id);

-- Access Logs (audit trail)
CREATE TABLE IF NOT EXISTS access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actor_user_id TEXT, -- NULL for system actions
    action TEXT NOT NULL CHECK (action IN ('read', 'write', 'delete', 'export', 'share', 'admin')),
    asset_id UUID REFERENCES data_assets(id) ON DELETE SET NULL,
    resource_type TEXT,
    resource_id TEXT,
    result TEXT NOT NULL CHECK (result IN ('allowed', 'denied')),
    context_json JSONB DEFAULT '{}'::jsonb, -- IP, agent, workflow id, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON access_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_actor ON access_logs (actor_user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_action ON access_logs (action);
CREATE INDEX IF NOT EXISTS idx_access_logs_asset_id ON access_logs (asset_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_result ON access_logs (result);
CREATE INDEX IF NOT EXISTS idx_access_logs_resource ON access_logs (resource_type, resource_id);

-- Retention Rules
CREATE TABLE IF NOT EXISTS retention_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    asset_type TEXT NOT NULL, -- 'rag_document' | 'event' | 'workflow' | etc.
    retention_days INTEGER NOT NULL,
    hard_delete BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE = delete, FALSE = archive/soft delete
    config_json JSONB DEFAULT '{}'::jsonb,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_retention_rules_asset_type ON retention_rules (asset_type);
CREATE INDEX IF NOT EXISTS idx_retention_rules_enabled ON retention_rules (enabled);

