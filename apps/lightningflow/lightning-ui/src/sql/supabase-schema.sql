-- Lightning Platform Schema with RLS Policies
-- This schema defines tables for user profiles, AI usage, and Lightning Network data

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create tenants table for multi-tenant business nodes
CREATE TABLE tenants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT true
);

-- Create tenant_users junction table for multi-tenant access
CREATE TABLE tenant_users (
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
  PRIMARY KEY (tenant_id, user_id)
);

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  
  -- User preferences and settings
  theme TEXT DEFAULT 'dark',
  timezone TEXT DEFAULT 'UTC',
  
  -- Subscription details
  subscription_tier TEXT DEFAULT 'free',
  billing_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  
  -- Node configuration
  node_pubkey TEXT,
  node_alias TEXT,
  node_host TEXT,
  node_type TEXT DEFAULT 'lnd', -- 'lnd', 'c-lightning', 'eclair'
  is_self_hosted BOOLEAN DEFAULT true,
  
  PRIMARY KEY (id)
);

-- Create usage_logs table for tracking AI API calls
CREATE TABLE usage_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  model TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd DECIMAL(10, 6) NOT NULL DEFAULT 0,
  request_hash TEXT
);

-- Create channels table for Lightning Network channels
CREATE TABLE channels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  channel_id TEXT NOT NULL,
  remote_pubkey TEXT NOT NULL,
  alias TEXT,
  capacity BIGINT NOT NULL,
  local_balance BIGINT NOT NULL,
  remote_balance BIGINT NOT NULL,
  commit_fee BIGINT,
  
  is_active BOOLEAN DEFAULT true,
  is_private BOOLEAN DEFAULT false,
  num_updates BIGINT DEFAULT 0,
  
  -- Channel fees
  base_fee_msat BIGINT DEFAULT 1000,
  fee_rate_ppm BIGINT DEFAULT 500,
  
  UNIQUE(user_id, channel_id)
);

-- PAYMENT SYSTEM TABLES

-- Create invoices table with tenant isolation
CREATE TABLE invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  description TEXT NOT NULL,
  amount_sats BIGINT NOT NULL,
  original_amount_sats BIGINT,
  discount_percent INTEGER,
  
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'expired', 'canceled'
  currency TEXT NOT NULL DEFAULT 'SATS',
  payment_method TEXT NOT NULL DEFAULT 'lightning',
  
  lnurl_data JSONB, -- Store LNURL-related data
  reference_id TEXT, -- External reference or invoice number
  expiry_seconds INTEGER DEFAULT 3600, -- Default 1hr expiry
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE(tenant_id, reference_id)
);

-- Create invoice_payments table to track payments for invoices
CREATE TABLE invoice_payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  amount_sats BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  payment_method TEXT NOT NULL,
  
  -- Lightning-specific fields
  payment_request TEXT, -- Lightning invoice
  preimage TEXT,
  payment_hash TEXT,
  
  -- Other payment method data
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create payment_methods table to track configured payment methods per tenant
CREATE TABLE payment_methods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'lightning', 'bank', 'credit', etc.
  is_enabled BOOLEAN DEFAULT true,
  
  -- Configuration for the payment method
  config JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE(tenant_id, type)
);

-- Create payment_webhooks table for tracking Lightning events
CREATE TABLE payment_webhooks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES invoice_payments(id) ON DELETE SET NULL,
  
  event_type TEXT NOT NULL, -- 'invoice.created', 'invoice.settled', etc.
  payload JSONB,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processed', 'failed'
  processed_at TIMESTAMPTZ
);

-- Create payment_analytics table for tracking payment metrics
CREATE TABLE payment_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  date DATE NOT NULL,
  total_invoices INTEGER NOT NULL DEFAULT 0,
  total_amount_sats BIGINT NOT NULL DEFAULT 0,
  completed_invoices INTEGER NOT NULL DEFAULT 0,
  completed_amount_sats BIGINT NOT NULL DEFAULT 0,
  conversion_rate DECIMAL(5, 2),
  
  -- Additional metrics
  metrics JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE(tenant_id, date)
);

-- FEEDBACK TRACKING TABLES

-- Create feedback table for vector search results and tutorial tooltips
CREATE TABLE feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  embedding_id TEXT NOT NULL,
  value TEXT CHECK (value IN ('yes', 'no')) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  context JSONB,
  user_agent TEXT,
  ip_address TEXT
);

-- Create embedding_scores table for tracking quality based on feedback
CREATE TABLE embedding_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  embedding_id TEXT NOT NULL UNIQUE,
  positive_feedback INTEGER DEFAULT 0,
  total_feedback INTEGER DEFAULT 0,
  score NUMERIC(4,3) DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tutorial_progress table for tracking user progress through tutorials
CREATE TABLE tutorial_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tutorial_id TEXT NOT NULL,
  progress_seconds NUMERIC(10,2) DEFAULT 0,
  total_duration_seconds NUMERIC(10,2),
  completion_percentage NUMERIC(5,2) DEFAULT 0,
  completed_at TIMESTAMPTZ,
  last_watched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, tutorial_id)
);

-- ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE embedding_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorial_progress ENABLE ROW LEVEL SECURITY;

-- Tenants RLS policies
CREATE POLICY "Users can view tenants they belong to" ON tenants
  FOR SELECT USING (
    id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update their tenants" ON tenants
  FOR UPDATE USING (
    id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Tenant users RLS policies
CREATE POLICY "Users can view tenant_users for their tenants" ON tenant_users
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  );

-- Invoices RLS policies
CREATE POLICY "Users can view invoices for their tenants" ON invoices
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create invoices for their tenants" ON invoices
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update invoices for their tenants" ON invoices
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  );

-- Invoice payments RLS policies
CREATE POLICY "Users can view payments for their invoices" ON invoice_payments
  FOR SELECT USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE tenant_id IN (
        SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
      )
    )
  );

-- Payment methods RLS policies
CREATE POLICY "Users can view payment methods for their tenants" ON payment_methods
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage payment methods" ON payment_methods
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Payment webhooks RLS policies
CREATE POLICY "Users can view webhooks for their tenants" ON payment_webhooks
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  );

-- Payment analytics RLS policies
CREATE POLICY "Users can view analytics for their tenants" ON payment_analytics
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  );

-- Feedback table policies
CREATE POLICY "Users can submit feedback" ON feedback
FOR INSERT WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);

CREATE POLICY "Users can view own feedback" ON feedback
FOR SELECT USING (
  user_id = auth.uid()
);

CREATE POLICY "Admins can view all feedback" ON feedback
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Embedding scores policies
CREATE POLICY "Anyone can read embedding scores" ON embedding_scores
FOR SELECT USING (true);

CREATE POLICY "System can update embedding scores" ON embedding_scores
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' IN ('admin', 'system')
  )
);

-- Tutorial progress policies
CREATE POLICY "Users can manage own tutorial progress" ON tutorial_progress
FOR ALL USING (user_id = auth.uid());

-- Indexes for feedback tables
CREATE INDEX idx_feedback_embedding_id ON feedback(embedding_id);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_created_at ON feedback(created_at);
CREATE INDEX idx_feedback_value ON feedback(value);

CREATE INDEX idx_embedding_scores_embedding_id ON embedding_scores(embedding_id);
CREATE INDEX idx_embedding_scores_score ON embedding_scores(score DESC);

CREATE INDEX idx_tutorial_progress_user_id ON tutorial_progress(user_id);
CREATE INDEX idx_tutorial_progress_tutorial_id ON tutorial_progress(tutorial_id);
CREATE INDEX idx_tutorial_progress_completion ON tutorial_progress(completion_percentage);

-- Update loop_logs table to include tutorial suggestions
-- Add tutorial_suggestions column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'loop_logs' AND column_name = 'tutorial_suggestions') THEN
    ALTER TABLE loop_logs ADD COLUMN tutorial_suggestions TEXT[];
  END IF;
END $$;

-- TRIGGERS

-- Trigger to set expires_at when creating an invoice
CREATE OR REPLACE FUNCTION set_invoice_expiry()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at := NOW() + (NEW.expiry_seconds * INTERVAL '1 second');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_expires_at
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE PROCEDURE set_invoice_expiry();

-- Trigger to automatically update payment analytics when an invoice is created or updated
CREATE OR REPLACE FUNCTION update_payment_analytics()
RETURNS TRIGGER AS $$
DECLARE
  invoice_date DATE;
  tenant UUID;
BEGIN
  -- Get date and tenant_id
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    invoice_date := DATE(NEW.created_at);
    tenant := NEW.tenant_id;
  ELSE
    invoice_date := DATE(OLD.created_at);
    tenant := OLD.tenant_id;
  END IF;

  -- Upsert into payment_analytics
  INSERT INTO payment_analytics (
    tenant_id, date, 
    total_invoices, total_amount_sats,
    completed_invoices, completed_amount_sats
  )
  SELECT
    tenant, invoice_date,
    COUNT(*), SUM(amount_sats),
    COUNT(*) FILTER (WHERE status = 'completed'), 
    SUM(amount_sats) FILTER (WHERE status = 'completed')
  FROM invoices
  WHERE tenant_id = tenant AND DATE(created_at) = invoice_date
  GROUP BY tenant, invoice_date
  ON CONFLICT (tenant_id, date) DO UPDATE SET
    total_invoices = EXCLUDED.total_invoices,
    total_amount_sats = EXCLUDED.total_amount_sats,
    completed_invoices = EXCLUDED.completed_invoices,
    completed_amount_sats = EXCLUDED.completed_amount_sats,
    conversion_rate = CASE 
      WHEN EXCLUDED.total_invoices > 0 THEN 
        (EXCLUDED.completed_invoices::decimal / EXCLUDED.total_invoices::decimal) * 100
      ELSE NULL
    END,
    updated_at = NOW();

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoice_analytics_update
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE PROCEDURE update_payment_analytics();

-- Function to update embedding scores automatically
CREATE OR REPLACE FUNCTION update_embedding_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate new stats for the embedding
  INSERT INTO embedding_scores (embedding_id, positive_feedback, total_feedback, score)
  SELECT 
    NEW.embedding_id,
    COUNT(*) FILTER (WHERE value = 'yes'),
    COUNT(*),
    COALESCE(
      COUNT(*) FILTER (WHERE value = 'yes')::NUMERIC / NULLIF(COUNT(*), 0),
      0
    )
  FROM feedback 
  WHERE embedding_id = NEW.embedding_id
  ON CONFLICT (embedding_id) 
  DO UPDATE SET
    positive_feedback = EXCLUDED.positive_feedback,
    total_feedback = EXCLUDED.total_feedback,
    score = EXCLUDED.score,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update embedding scores when feedback is added
CREATE TRIGGER update_embedding_score_trigger
  AFTER INSERT ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_embedding_score();

-- Function to upsert tutorial progress
CREATE OR REPLACE FUNCTION upsert_tutorial_progress(
  p_user_id UUID,
  p_tutorial_id TEXT,
  p_progress_seconds NUMERIC,
  p_total_duration_seconds NUMERIC
) RETURNS VOID AS $$
DECLARE
  completion_pct NUMERIC;
BEGIN
  -- Calculate completion percentage
  completion_pct := CASE 
    WHEN p_total_duration_seconds > 0 THEN 
      LEAST(100, (p_progress_seconds / p_total_duration_seconds) * 100)
    ELSE 0 
  END;

  INSERT INTO tutorial_progress (
    user_id, 
    tutorial_id, 
    progress_seconds, 
    total_duration_seconds,
    completion_percentage,
    completed_at,
    last_watched_at
  ) VALUES (
    p_user_id,
    p_tutorial_id,
    p_progress_seconds,
    p_total_duration_seconds,
    completion_pct,
    CASE WHEN completion_pct >= 90 THEN NOW() ELSE NULL END,
    NOW()
  )
  ON CONFLICT (user_id, tutorial_id)
  DO UPDATE SET
    progress_seconds = GREATEST(tutorial_progress.progress_seconds, EXCLUDED.progress_seconds),
    total_duration_seconds = EXCLUDED.total_duration_seconds,
    completion_percentage = GREATEST(tutorial_progress.completion_percentage, EXCLUDED.completion_percentage),
    completed_at = CASE 
      WHEN EXCLUDED.completion_percentage >= 90 AND tutorial_progress.completed_at IS NULL 
      THEN NOW() 
      ELSE tutorial_progress.completed_at 
    END,
    last_watched_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- User management triggers
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the updated_at trigger to all tables
CREATE TRIGGER update_tenants_modtime
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_usage_logs_modtime
  BEFORE UPDATE ON usage_logs
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_channels_modtime
  BEFORE UPDATE ON channels
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_invoices_modtime
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_invoice_payments_modtime
  BEFORE UPDATE ON invoice_payments
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_payment_methods_modtime
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_payment_analytics_modtime
  BEFORE UPDATE ON payment_analytics
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Grants for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON feedback TO authenticated;
GRANT ALL ON embedding_scores TO authenticated;
GRANT ALL ON tutorial_progress TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_tutorial_progress TO authenticated; 