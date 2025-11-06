-- Schema for Lightning Platform Payment System

-- Tenants table to support multi-tenancy
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users can belong to multiple tenants (for team functionality)
CREATE TABLE IF NOT EXISTS tenant_users (
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (tenant_id, user_id)
);

-- Invoices table with proper security model
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  description TEXT NOT NULL,
  amount_sats BIGINT NOT NULL,
  original_amount_sats BIGINT,
  discount_percent SMALLINT,
  status VARCHAR(50) DEFAULT 'pending',
  currency VARCHAR(10) DEFAULT 'SATS',
  payment_method VARCHAR(50) DEFAULT 'lightning',
  lnurl_data JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice payments (for tracking multiple payment attempts)
CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) NOT NULL,
  amount_sats BIGINT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50) NOT NULL,
  payment_request TEXT,
  preimage TEXT,
  payment_hash TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment method configurations (for supporting various payment methods)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, type)
);

-- Webhooks for payment notifications
CREATE TABLE IF NOT EXISTS payment_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  invoice_id UUID REFERENCES invoices(id),
  payment_id UUID REFERENCES invoice_payments(id),
  event_type VARCHAR(50) NOT NULL,
  payload JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics for payment metrics
CREATE TABLE IF NOT EXISTS payment_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  date DATE NOT NULL,
  total_invoices INTEGER DEFAULT 0,
  total_amount_sats BIGINT DEFAULT 0,
  completed_invoices INTEGER DEFAULT 0,
  completed_amount_sats BIGINT DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, date)
);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_analytics ENABLE ROW LEVEL SECURITY;

-- Tenant policies: users can only view tenants they belong to
CREATE POLICY tenant_select_policy ON tenants
  FOR SELECT USING (
    id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
  );

-- Tenant users policies
CREATE POLICY tenant_users_select_policy ON tenant_users
  FOR SELECT USING (user_id = auth.uid() OR tenant_id IN (
    SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Invoice policies
CREATE POLICY invoices_select_policy ON invoices
  FOR SELECT USING (
    user_id = auth.uid() OR 
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
  );

CREATE POLICY invoices_insert_policy ON invoices
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
  );

CREATE POLICY invoices_update_policy ON invoices
  FOR UPDATE USING (
    user_id = auth.uid() OR
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- Invoice payments policies
CREATE POLICY invoice_payments_select_policy ON invoice_payments
  FOR SELECT USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE 
        user_id = auth.uid() OR 
        tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
    )
  );

-- Payment methods policies
CREATE POLICY payment_methods_select_policy ON payment_methods
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
  );

CREATE POLICY payment_methods_insert_update_policy ON payment_methods
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid() AND role IN ('admin'))
  );

-- Payment webhooks policies
CREATE POLICY payment_webhooks_select_policy ON payment_webhooks
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
  );

-- Analytics policies
CREATE POLICY payment_analytics_select_policy ON payment_analytics
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
  );

-- Functions and Triggers

-- Function to update invoice status when a payment changes
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE invoices SET 
      status = 'completed',
      updated_at = NOW()
    WHERE id = NEW.invoice_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_status_trigger
AFTER UPDATE ON invoice_payments
FOR EACH ROW
WHEN (OLD.status <> NEW.status AND NEW.status = 'completed')
EXECUTE FUNCTION update_invoice_status();

-- Function to update analytics when an invoice is created
CREATE OR REPLACE FUNCTION update_payment_analytics_on_invoice()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update analytics for the day
  INSERT INTO payment_analytics (tenant_id, date, total_invoices, total_amount_sats)
  VALUES (
    NEW.tenant_id, 
    DATE(NEW.created_at AT TIME ZONE 'UTC'),
    1,
    NEW.amount_sats
  )
  ON CONFLICT (tenant_id, date) 
  DO UPDATE SET
    total_invoices = payment_analytics.total_invoices + 1,
    total_amount_sats = payment_analytics.total_amount_sats + NEW.amount_sats,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analytics_on_invoice_trigger
AFTER INSERT ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_payment_analytics_on_invoice();

-- Function to update analytics when a payment is completed
CREATE OR REPLACE FUNCTION update_payment_analytics_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  invoice_tenant_id UUID;
  invoice_date DATE;
BEGIN
  -- Get the tenant ID and date from the invoice
  SELECT tenant_id, DATE(created_at AT TIME ZONE 'UTC')
  INTO invoice_tenant_id, invoice_date
  FROM invoices
  WHERE id = NEW.invoice_id;

  -- Update analytics for completed payments
  UPDATE payment_analytics
  SET 
    completed_invoices = completed_invoices + 1,
    completed_amount_sats = completed_amount_sats + NEW.amount_sats,
    conversion_rate = 
      CASE WHEN total_invoices > 0 
      THEN (completed_invoices + 1)::DECIMAL / total_invoices 
      ELSE 0 END,
    updated_at = NOW()
  WHERE tenant_id = invoice_tenant_id AND date = invoice_date;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analytics_on_payment_trigger
AFTER UPDATE ON invoice_payments
FOR EACH ROW
WHEN (OLD.status <> NEW.status AND NEW.status = 'completed')
EXECUTE FUNCTION update_payment_analytics_on_payment(); 