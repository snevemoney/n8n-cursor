-- Lightning Platform Referral Program Schema
-- Creates referral tracking system with rewards and analytics

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Referral codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) UNIQUE NOT NULL,
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '1 year'),
  is_active BOOLEAN DEFAULT true,
  max_uses INTEGER DEFAULT NULL, -- NULL = unlimited
  current_uses INTEGER DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Referral events table (tracks signups via referral codes)
CREATE TABLE IF NOT EXISTS referral_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_code_id UUID REFERENCES referral_codes(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Event details
  event_type VARCHAR(50) DEFAULT 'signup', -- 'signup', 'first_payment', 'milestone'
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  converted_at TIMESTAMP, -- When referee made first payment/activation
  
  -- Prevent duplicates
  UNIQUE(referral_code_id, referee_id)
);

-- Referral rewards table (tracks payouts and bonuses)
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_event_id UUID REFERENCES referral_events(id) ON DELETE CASCADE,
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Reward details
  reward_type VARCHAR(50) NOT NULL, -- 'credit', 'discount', 'sats', 'subscription'
  reward_amount DECIMAL(10,2) NOT NULL, -- Amount in USD or sats
  reward_currency VARCHAR(10) DEFAULT 'USD', -- 'USD', 'SATS', 'CREDITS'
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'cancelled'
  paid_at TIMESTAMP,
  payment_reference TEXT, -- Lightning payment hash or transaction ID
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Referral program configuration
CREATE TABLE IF NOT EXISTS referral_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Referrer rewards
  referrer_reward_type VARCHAR(50) DEFAULT 'credit',
  referrer_reward_amount DECIMAL(10,2) DEFAULT 25.00,
  referrer_reward_currency VARCHAR(10) DEFAULT 'USD',
  
  -- Referee rewards  
  referee_reward_type VARCHAR(50) DEFAULT 'discount',
  referee_reward_amount DECIMAL(10,2) DEFAULT 10.00,
  referee_reward_currency VARCHAR(10) DEFAULT 'USD',
  
  -- Program settings
  is_active BOOLEAN DEFAULT true,
  min_referrals_for_bonus INTEGER DEFAULT 5,
  bonus_reward_amount DECIMAL(10,2) DEFAULT 100.00,
  
  -- Fraud prevention
  same_ip_limit INTEGER DEFAULT 3, -- Max referrals from same IP
  cooling_period_hours INTEGER DEFAULT 24,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO referral_config (id) VALUES (uuid_generate_v4()) ON CONFLICT DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_referrer ON referral_codes(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_code ON referral_events(referral_code_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_referee ON referral_events(referee_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_referrer ON referral_events(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_created ON referral_events(created_at);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer ON referral_rewards(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_status ON referral_rewards(status);

-- Enable Row Level Security
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Referral codes: Users can read their own codes, create new ones
CREATE POLICY "Users can read own referral codes" ON referral_codes
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create referral codes" ON referral_codes
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update own referral codes" ON referral_codes
  FOR UPDATE USING (auth.uid() = referrer_id);

-- Referral events: Users can read events they're involved in
CREATE POLICY "Users can read referral events" ON referral_events
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "System can insert referral events" ON referral_events
  FOR INSERT WITH CHECK (true); -- Allow system to insert

-- Referral rewards: Users can read their own rewards
CREATE POLICY "Users can read own rewards" ON referral_rewards
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- Referral config: Everyone can read, only admins can modify
CREATE POLICY "Anyone can read referral config" ON referral_config
  FOR SELECT USING (true);

-- Admin policies (when admin role is implemented)
-- CREATE POLICY "Admins can manage all referrals" ON referral_codes
--   FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Functions

-- Generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  attempts INTEGER := 0;
  max_attempts INTEGER := 10;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    code := upper(substring(md5(random()::text || user_id::text) from 1 for 8));
    
    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM referral_codes WHERE referral_codes.code = generate_referral_code.code) THEN
      RETURN code;
    END IF;
    
    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      RAISE EXCEPTION 'Could not generate unique referral code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create referral code for user
CREATE OR REPLACE FUNCTION create_user_referral_code(user_id UUID)
RETURNS UUID AS $$
DECLARE
  new_code TEXT;
  code_id UUID;
BEGIN
  -- Check if user already has an active code
  SELECT id INTO code_id FROM referral_codes 
  WHERE referrer_id = user_id AND is_active = true
  LIMIT 1;
  
  IF code_id IS NOT NULL THEN
    RETURN code_id;
  END IF;
  
  -- Generate new code
  new_code := generate_referral_code(user_id);
  
  -- Insert new referral code
  INSERT INTO referral_codes (code, referrer_id, created_by)
  VALUES (new_code, user_id, user_id)
  RETURNING id INTO code_id;
  
  RETURN code_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Process referral signup
CREATE OR REPLACE FUNCTION process_referral_signup(
  code_param TEXT,
  referee_id_param UUID,
  ip_address_param INET DEFAULT NULL,
  user_agent_param TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  code_record RECORD;
  config_record RECORD;
  same_ip_count INTEGER;
  result JSONB;
BEGIN
  -- Get referral code details
  SELECT rc.*, p.email as referrer_email 
  FROM referral_codes rc
  JOIN profiles p ON p.id = rc.referrer_id
  WHERE rc.code = code_param 
    AND rc.is_active = true 
    AND (rc.expires_at IS NULL OR rc.expires_at > NOW())
    AND (rc.max_uses IS NULL OR rc.current_uses < rc.max_uses)
  INTO code_record;
  
  IF code_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired referral code');
  END IF;
  
  -- Prevent self-referral
  IF code_record.referrer_id = referee_id_param THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot refer yourself');
  END IF;
  
  -- Get configuration
  SELECT * FROM referral_config WHERE is_active = true LIMIT 1 INTO config_record;
  
  -- Check IP limits if configured
  IF config_record.same_ip_limit > 0 AND ip_address_param IS NOT NULL THEN
    SELECT COUNT(*) FROM referral_events 
    WHERE ip_address = ip_address_param 
      AND created_at > NOW() - INTERVAL '1 day' * config_record.cooling_period_hours / 24
    INTO same_ip_count;
    
    IF same_ip_count >= config_record.same_ip_limit THEN
      RETURN jsonb_build_object('success', false, 'error', 'Too many referrals from this location');
    END IF;
  END IF;
  
  -- Check if already referred
  IF EXISTS (SELECT 1 FROM referral_events WHERE referee_id = referee_id_param) THEN
    RETURN jsonb_build_object('success', false, 'error', 'User already referred');
  END IF;
  
  -- Insert referral event
  INSERT INTO referral_events (
    referral_code_id, referee_id, referrer_id, ip_address, user_agent
  ) VALUES (
    code_record.id, referee_id_param, code_record.referrer_id, ip_address_param, user_agent_param
  );
  
  -- Update code usage count
  UPDATE referral_codes 
  SET current_uses = current_uses + 1, updated_at = NOW()
  WHERE id = code_record.id;
  
  -- Create referral rewards (both referrer and referee)
  -- Referee reward (immediate)
  INSERT INTO referral_rewards (
    referral_event_id, referrer_id, referee_id, 
    reward_type, reward_amount, reward_currency,
    status
  ) 
  SELECT 
    (SELECT id FROM referral_events WHERE referee_id = referee_id_param AND referrer_id = code_record.referrer_id),
    code_record.referrer_id, referee_id_param,
    config_record.referee_reward_type, config_record.referee_reward_amount, config_record.referee_reward_currency,
    'pending';
  
  -- Referrer reward (pending until referee converts)
  INSERT INTO referral_rewards (
    referral_event_id, referrer_id, referee_id,
    reward_type, reward_amount, reward_currency,
    status
  )
  SELECT 
    (SELECT id FROM referral_events WHERE referee_id = referee_id_param AND referrer_id = code_record.referrer_id),
    code_record.referrer_id, referee_id_param,
    config_record.referrer_reward_type, config_record.referrer_reward_amount, config_record.referrer_reward_currency,
    'pending';
  
  result := jsonb_build_object(
    'success', true, 
    'referrer_email', code_record.referrer_email,
    'referee_reward', config_record.referee_reward_amount,
    'referee_reward_type', config_record.referee_reward_type
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get referral analytics for user
CREATE OR REPLACE FUNCTION get_referral_analytics(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  WITH referral_stats AS (
    SELECT 
      COUNT(re.id) as total_referrals,
      COUNT(CASE WHEN re.converted_at IS NOT NULL THEN 1 END) as converted_referrals,
      COALESCE(SUM(CASE WHEN rr.status = 'paid' THEN rr.reward_amount ELSE 0 END), 0) as total_earned,
      COUNT(CASE WHEN re.created_at > NOW() - INTERVAL '30 days' THEN 1 END) as referrals_this_month
    FROM referral_events re
    LEFT JOIN referral_rewards rr ON rr.referral_event_id = re.id AND rr.referrer_id = user_id
    WHERE re.referrer_id = user_id
  )
  SELECT jsonb_build_object(
    'total_referrals', rs.total_referrals,
    'converted_referrals', rs.converted_referrals,
    'conversion_rate', CASE WHEN rs.total_referrals > 0 THEN ROUND((rs.converted_referrals::decimal / rs.total_referrals) * 100, 2) ELSE 0 END,
    'total_earned', rs.total_earned,
    'referrals_this_month', rs.referrals_this_month,
    'referral_code', (SELECT code FROM referral_codes WHERE referrer_id = user_id AND is_active = true LIMIT 1)
  ) FROM referral_stats rs INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers

-- Update referral_codes.updated_at on changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_referral_codes_updated_at 
  BEFORE UPDATE ON referral_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_rewards_updated_at 
  BEFORE UPDATE ON referral_rewards  
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_config_updated_at 
  BEFORE UPDATE ON referral_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create referral code for new users
CREATE OR REPLACE FUNCTION auto_create_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Create referral code for new user (async to avoid blocking signup)
  PERFORM create_user_referral_code(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER auto_create_user_referral_code
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION auto_create_referral_code();

-- Comments for documentation
COMMENT ON TABLE referral_codes IS 'Stores referral codes generated by users';
COMMENT ON TABLE referral_events IS 'Tracks when someone signs up using a referral code';
COMMENT ON TABLE referral_rewards IS 'Manages rewards and payouts for referrals';
COMMENT ON TABLE referral_config IS 'Global configuration for the referral program';

COMMENT ON FUNCTION generate_referral_code(UUID) IS 'Generates a unique 8-character referral code';
COMMENT ON FUNCTION create_user_referral_code(UUID) IS 'Creates or returns existing referral code for a user';
COMMENT ON FUNCTION process_referral_signup(TEXT, UUID, INET, TEXT) IS 'Processes a new signup via referral code';
COMMENT ON FUNCTION get_referral_analytics(UUID) IS 'Returns referral statistics for a user'; 