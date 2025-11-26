-- Lightning Platform Templates System Schema
-- Creates tables for industry pack templates, usage tracking, and analytics

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Templates table - stores industry pack configurations
CREATE TABLE IF NOT EXISTS templates (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) CHECK (category IN ('hospitality', 'retail', 'services', 'entertainment', 'professional')),
  difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_setup_time INTEGER DEFAULT 15, -- minutes
  features TEXT[] DEFAULT '{}',
  pricing JSONB DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  tags VARCHAR(50)[] DEFAULT '{}',
  is_popular BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  thumbnail_url TEXT,
  preview_images TEXT[] DEFAULT '{}',
  configuration JSONB NOT NULL,
  payment_flows JSONB DEFAULT '[]',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true
);

-- Template usage logs - tracks when templates are applied, modified, viewed
CREATE TABLE IF NOT EXISTS template_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  template_id VARCHAR(100) REFERENCES templates(id),
  action VARCHAR(20) CHECK (action IN ('applied', 'modified', 'removed', 'viewed')),
  metadata JSONB DEFAULT '{}',
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  -- Tracking
  ip_address INET,
  user_agent TEXT,
  source VARCHAR(20) DEFAULT 'web', -- 'web', 'api', 'cli'
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Template statistics - aggregated stats per template
CREATE TABLE IF NOT EXISTS template_statistics (
  template_id VARCHAR(100) PRIMARY KEY REFERENCES templates(id),
  total_applications INTEGER DEFAULT 0,
  successful_applications INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_modifications INTEGER DEFAULT 0,
  average_setup_time DECIMAL(8,2) DEFAULT 0.0,
  common_customizations JSONB DEFAULT '{}',
  failure_rate DECIMAL(5,2) DEFAULT 0.0,
  last_used TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Template insights - AI-generated insights and recommendations
CREATE TABLE IF NOT EXISTS template_insights (
  template_id VARCHAR(100) PRIMARY KEY REFERENCES templates(id),
  success_rate DECIMAL(5,2) DEFAULT 0.0,
  popular_customizations JSONB DEFAULT '{}',
  setup_time_trends JSONB DEFAULT '[]',
  user_satisfaction DECIMAL(3,2) DEFAULT 0.0,
  recommendations TEXT[] DEFAULT '{}',
  analysis_summary TEXT,
  generated_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User behavior profiles - tracks user template usage patterns
CREATE TABLE IF NOT EXISTS user_behavior_profiles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  behavior_patterns JSONB DEFAULT '{}',
  favorite_templates VARCHAR(100)[] DEFAULT '{}',
  customization_preferences JSONB DEFAULT '{}',
  usage_frequency DECIMAL(10,2) DEFAULT 0.0,
  last_activity TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Template feedback - user ratings and feedback
CREATE TABLE IF NOT EXISTS template_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id VARCHAR(100) REFERENCES templates(id),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  issues TEXT[] DEFAULT '{}',
  improvements TEXT[] DEFAULT '{}',
  would_recommend BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Workspace template applications - tracks which templates are applied to workspaces
CREATE TABLE IF NOT EXISTS workspace_template_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  template_id VARCHAR(100) REFERENCES templates(id),
  applied_at TIMESTAMP DEFAULT NOW(),
  customizations JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'modified', 'removed')),
  
  -- Settings applied from template
  lightning_settings JSONB DEFAULT '{}',
  ui_settings JSONB DEFAULT '{}',
  payment_flows JSONB DEFAULT '[]',
  
  -- Performance tracking
  setup_time_minutes INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(workspace_id, template_id)
);

-- Payment flows table - stores payment flows created from templates
CREATE TABLE IF NOT EXISTS payment_flows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  template_id VARCHAR(100) REFERENCES templates(id),
  flow_id VARCHAR(100) NOT NULL, -- from template
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('invoice', 'lnurl_pay', 'lnurl_withdraw', 'recurring')),
  description TEXT,
  default_amount INTEGER, -- sats
  allow_custom_amount BOOLEAN DEFAULT true,
  expiration_minutes INTEGER DEFAULT 30,
  memo_template TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- Usage stats
  total_payments INTEGER DEFAULT 0,
  total_amount INTEGER DEFAULT 0, -- sats
  last_used TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workspace Lightning settings
CREATE TABLE IF NOT EXISTS workspace_lightning_settings (
  workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  min_payment INTEGER DEFAULT 1000, -- sats
  max_payment INTEGER DEFAULT 1000000, -- sats
  fees_paid_by VARCHAR(20) DEFAULT 'customer' CHECK (fees_paid_by IN ('customer', 'business', 'split')),
  instant_settlement BOOLEAN DEFAULT true,
  privacy_mode BOOLEAN DEFAULT false,
  auto_invoice_generation BOOLEAN DEFAULT true,
  
  -- Fee settings
  base_fee INTEGER DEFAULT 1000, -- msat
  fee_rate DECIMAL(10,8) DEFAULT 0.0001, -- parts per million
  
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workspace UI settings
CREATE TABLE IF NOT EXISTS workspace_ui_settings (
  workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  primary_color VARCHAR(7) DEFAULT '#3B82F6', -- hex color
  logo_url TEXT,
  custom_domain TEXT,
  branding_required BOOLEAN DEFAULT false,
  theme_preset VARCHAR(50) DEFAULT 'default',
  
  -- Payment page customization
  show_qr_code BOOLEAN DEFAULT true,
  show_copy_button BOOLEAN DEFAULT true,
  show_amount_input BOOLEAN DEFAULT true,
  success_message TEXT DEFAULT 'Payment received successfully!',
  
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Channel rebalance logs
CREATE TABLE IF NOT EXISTS channel_rebalance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  channel_id VARCHAR(100) NOT NULL,
  old_balance DECIMAL(5,4) NOT NULL, -- ratio
  new_balance DECIMAL(5,4) NOT NULL, -- ratio
  fees_paid INTEGER NOT NULL, -- sats
  method VARCHAR(50) CHECK (method IN ('loop_out', 'submarine_swap', 'circular_rebalance')),
  transaction_id VARCHAR(100),
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tier verification logs
CREATE TABLE IF NOT EXISTS tier_verification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  feature VARCHAR(100) NOT NULL,
  action VARCHAR(100),
  tier_name VARCHAR(50) NOT NULL,
  access_allowed BOOLEAN NOT NULL,
  violations INTEGER DEFAULT 0,
  warnings INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_template_usage_logs_user_id ON template_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_logs_template_id ON template_usage_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_logs_action ON template_usage_logs(action);
CREATE INDEX IF NOT EXISTS idx_template_usage_logs_created_at ON template_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_templates_industry ON templates(industry);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_popular ON templates(is_popular);
CREATE INDEX IF NOT EXISTS idx_payment_flows_workspace_id ON payment_flows(workspace_id);
CREATE INDEX IF NOT EXISTS idx_payment_flows_type ON payment_flows(type);
CREATE INDEX IF NOT EXISTS idx_workspace_template_applications_workspace_id ON workspace_template_applications(workspace_id);
CREATE INDEX IF NOT EXISTS idx_channel_rebalance_logs_user_id ON channel_rebalance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_tier_verification_logs_user_id ON tier_verification_logs(user_id);

-- Enable Row Level Security
ALTER TABLE template_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_template_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_lightning_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_ui_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_rebalance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_verification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Template usage logs: users can read their own logs
CREATE POLICY "Users can read own template usage logs" ON template_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert template usage logs" ON template_usage_logs
  FOR INSERT WITH CHECK (true);

-- Template feedback: users can manage their own feedback
CREATE POLICY "Users can manage own template feedback" ON template_feedback
  FOR ALL USING (auth.uid() = user_id);

-- User behavior profiles: users can read their own profile
CREATE POLICY "Users can read own behavior profile" ON user_behavior_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Workspace settings: users can manage their workspace settings
CREATE POLICY "Users can manage workspace template applications" ON workspace_template_applications
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage workspace payment flows" ON payment_flows
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage workspace lightning settings" ON workspace_lightning_settings
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage workspace UI settings" ON workspace_ui_settings
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

-- Channel rebalance logs: users can read their own logs
CREATE POLICY "Users can read own rebalance logs" ON channel_rebalance_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert rebalance logs" ON channel_rebalance_logs
  FOR INSERT WITH CHECK (true);

-- Tier verification logs: users can read their own logs
CREATE POLICY "Users can read own tier verification logs" ON tier_verification_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert tier verification logs" ON tier_verification_logs
  FOR INSERT WITH CHECK (true);

-- Functions

-- Update template usage count
CREATE OR REPLACE FUNCTION update_template_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.action = 'applied' AND NEW.success = true THEN
    UPDATE templates 
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for template usage count
CREATE TRIGGER trigger_update_template_usage_count
  AFTER INSERT ON template_usage_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_template_usage_count();

-- Calculate template success rate
CREATE OR REPLACE FUNCTION calculate_template_success_rate(template_id_param VARCHAR)
RETURNS DECIMAL AS $$
DECLARE
  total_applications INTEGER;
  successful_applications INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_applications
  FROM template_usage_logs
  WHERE template_id = template_id_param AND action = 'applied';
  
  IF total_applications = 0 THEN
    RETURN 0.0;
  END IF;
  
  SELECT COUNT(*) INTO successful_applications
  FROM template_usage_logs
  WHERE template_id = template_id_param AND action = 'applied' AND success = true;
  
  RETURN (successful_applications::DECIMAL / total_applications) * 100;
END;
$$ LANGUAGE plpgsql;

-- Get template analytics
CREATE OR REPLACE FUNCTION get_template_analytics(template_id_param VARCHAR DEFAULT NULL)
RETURNS TABLE (
  template_id VARCHAR,
  template_name VARCHAR,
  total_applications BIGINT,
  success_rate DECIMAL,
  average_setup_time DECIMAL,
  total_views BIGINT,
  rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    COALESCE(stats.total_applications, 0)::BIGINT,
    calculate_template_success_rate(t.id),
    COALESCE(stats.average_setup_time, 0.0),
    COALESCE(stats.total_views, 0)::BIGINT,
    t.rating
  FROM templates t
  LEFT JOIN template_statistics stats ON stats.template_id = t.id
  WHERE (template_id_param IS NULL OR t.id = template_id_param)
    AND t.is_active = true
  ORDER BY t.usage_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Update statistics trigger
CREATE OR REPLACE FUNCTION update_template_statistics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO template_statistics (template_id, updated_at)
  VALUES (NEW.template_id, NOW())
  ON CONFLICT (template_id) DO UPDATE SET
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for template statistics
CREATE TRIGGER trigger_update_template_statistics
  AFTER INSERT ON template_usage_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_template_statistics();

-- Triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_templates_updated_at 
  BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_flows_updated_at 
  BEFORE UPDATE ON payment_flows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_template_applications_updated_at 
  BEFORE UPDATE ON workspace_template_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default templates
INSERT INTO templates (id, name, industry, description, category, difficulty, estimated_setup_time, features, pricing, requirements, tags, is_popular, usage_count, rating, configuration, payment_flows) VALUES 
('restaurant-basic', 'Restaurant & Café', 'restaurant', 'Complete payment solution for restaurants with table service, takeout, and delivery', 'hospitality', 'beginner', 15, 
 ARRAY['Table-based QR payments', 'Tip integration (10-25%)', 'Split bill functionality', 'Kitchen receipt printing', 'Delivery tracking', 'Customer feedback collection'],
 '{"basePrice": 0, "currency": "USD"}',
 ARRAY['Lightning node with 1M+ sats capacity', 'POS system integration (optional)', 'Stable internet connection', 'Staff training (30 minutes)'],
 ARRAY['food', 'hospitality', 'tips', 'pos'],
 true, 1247, 4.8,
 '{"businessSettings": {"acceptsCrypto": true, "acceptsFiat": true, "autoInvoiceGeneration": true, "requiresDeposit": false}, "lightningSettings": {"minPayment": 1000, "maxPayment": 1000000, "feesPaidBy": "customer", "instantSettlement": true, "privacyMode": false}, "uiCustomization": {"primaryColor": "#FF6B35", "brandingRequired": false}, "integrations": {"pos": ["Square", "Toast", "Clover"], "accounting": ["QuickBooks", "Xero"], "crm": ["Mailchimp"], "notifications": ["SMS", "Email"]}}',
 '[{"id": "table-payment", "name": "Table Payment", "type": "lnurl_pay", "description": "Customer scans QR code at table to pay bill", "allowCustomAmount": true, "expirationMinutes": 30, "memo": "Table {table_number} - {restaurant_name}"}]'
),
('barbershop-classic', 'Barbershop & Salon', 'barbershop', 'Appointment-based payments with tips and loyalty rewards', 'services', 'beginner', 10,
 ARRAY['Appointment booking with deposits', 'Service-based pricing', 'Tip integration (15-30%)', 'Loyalty points system', 'Stylist selection', 'No-show protection'],
 '{"basePrice": 0, "currency": "USD"}',
 ARRAY['Booking system (Calendly, etc.)', 'Lightning capacity: 500k+ sats', 'Tablet or smartphone', 'Staff Lightning wallet training'],
 ARRAY['salon', 'appointments', 'tips', 'beauty'],
 true, 892, 4.7,
 '{"businessSettings": {"acceptsCrypto": true, "acceptsFiat": true, "autoInvoiceGeneration": true, "requiresDeposit": true, "depositPercentage": 25}, "lightningSettings": {"minPayment": 5000, "maxPayment": 200000, "feesPaidBy": "business", "instantSettlement": true, "privacyMode": true}, "uiCustomization": {"primaryColor": "#8B4513", "brandingRequired": false}, "integrations": {"pos": ["Square"], "accounting": ["QuickBooks"], "crm": ["Calendly", "Acuity"], "notifications": ["SMS"]}}',
 '[{"id": "service-payment", "name": "Service Payment", "type": "invoice", "description": "Payment for completed services", "allowCustomAmount": false, "expirationMinutes": 60, "memo": "{service_name} at {salon_name}"}, {"id": "deposit-payment", "name": "Appointment Deposit", "type": "invoice", "description": "25% deposit to secure appointment", "allowCustomAmount": false, "expirationMinutes": 1440, "memo": "Deposit for {appointment_date} at {salon_name}"}]'
) ON CONFLICT (id) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE templates IS 'Industry pack templates with configurations and metadata';
COMMENT ON TABLE template_usage_logs IS 'Tracks template application, modification, and viewing events';
COMMENT ON TABLE template_statistics IS 'Aggregated statistics for each template';
COMMENT ON TABLE template_insights IS 'AI-generated insights and recommendations for templates';
COMMENT ON TABLE user_behavior_profiles IS 'User behavior patterns and preferences';
COMMENT ON TABLE workspace_template_applications IS 'Tracks which templates are applied to workspaces';
COMMENT ON TABLE payment_flows IS 'Payment flows created from templates';

COMMENT ON FUNCTION calculate_template_success_rate(VARCHAR) IS 'Calculates success rate for a specific template';
COMMENT ON FUNCTION get_template_analytics(VARCHAR) IS 'Returns comprehensive analytics for templates'; 