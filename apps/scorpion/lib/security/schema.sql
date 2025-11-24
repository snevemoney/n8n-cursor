-- Security Schema
-- Manages encrypted secrets storage

-- Secrets table
CREATE TABLE IF NOT EXISTS secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secret_key VARCHAR(255) UNIQUE NOT NULL,
  encrypted_value JSONB NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_secrets_key ON secrets(secret_key);
CREATE INDEX IF NOT EXISTS idx_secrets_tags ON secrets USING GIN(tags);

