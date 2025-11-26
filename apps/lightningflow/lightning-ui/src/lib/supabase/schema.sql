-- Lightning AI Platform - Reality-Aware Database Schema
-- Tracks Lightning node constraints and prevents impossible operations

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Channel Fee Updates Table (Rate Limiting)
CREATE TABLE IF NOT EXISTS channel_fee_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  old_fee_rate INTEGER NOT NULL,
  new_fee_rate INTEGER NOT NULL,
  peer_alias TEXT,
  channel_capacity BIGINT,
  update_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_fee_rate CHECK (
    new_fee_rate >= 0 AND new_fee_rate <= 5000 AND
    old_fee_rate >= 0 AND old_fee_rate <= 5000
  )
);

-- RLS Policies for channel_fee_updates
ALTER TABLE channel_fee_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fee updates" ON channel_fee_updates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fee updates" ON channel_fee_updates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for rate limiting queries
CREATE INDEX idx_channel_fee_updates_user_channel_time 
ON channel_fee_updates(user_id, channel_id, created_at DESC);

-- Node Liquidity Snapshots Table
CREATE TABLE IF NOT EXISTS node_liquidity_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_balance BIGINT NOT NULL,
  local_balance BIGINT NOT NULL,  -- Outbound capacity
  remote_balance BIGINT NOT NULL, -- Inbound capacity
  pending_balance BIGINT DEFAULT 0,
  channel_count INTEGER NOT NULL,
  active_channels INTEGER NOT NULL,
  pending_channels INTEGER DEFAULT 0,
  routing_capable BOOLEAN DEFAULT FALSE,
  snapshot_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_balances CHECK (
    total_balance >= 0 AND
    local_balance >= 0 AND
    remote_balance >= 0 AND
    pending_balance >= 0 AND
    channel_count >= 0 AND
    active_channels >= 0 AND
    pending_channels >= 0
  )
);

-- RLS Policies for node_liquidity_snapshots
ALTER TABLE node_liquidity_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own liquidity snapshots" ON node_liquidity_snapshots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own liquidity snapshots" ON node_liquidity_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for time-series queries
CREATE INDEX idx_node_liquidity_user_time 
ON node_liquidity_snapshots(user_id, snapshot_at DESC);

-- Channel Information Table
CREATE TABLE IF NOT EXISTS channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  peer_alias TEXT,
  peer_pubkey TEXT,
  capacity BIGINT NOT NULL,
  local_balance BIGINT NOT NULL,
  remote_balance BIGINT NOT NULL,
  fee_rate INTEGER NOT NULL DEFAULT 1000,
  base_fee INTEGER DEFAULT 1000,
  time_lock_delta INTEGER DEFAULT 40,
  min_htlc BIGINT DEFAULT 1000,
  max_htlc BIGINT,
  active BOOLEAN DEFAULT TRUE,
  private BOOLEAN DEFAULT FALSE,
  last_fee_update TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_channel_data CHECK (
    capacity > 0 AND
    local_balance >= 0 AND
    remote_balance >= 0 AND
    fee_rate >= 0 AND fee_rate <= 5000 AND
    base_fee >= 0 AND
    time_lock_delta > 0 AND
    min_htlc > 0
  ),
  
  -- Unique constraint per user
  UNIQUE(user_id, channel_id)
);

-- RLS Policies for channels
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own channels" ON channels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own channels" ON channels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own channels" ON channels
  FOR UPDATE USING (auth.uid() = user_id);

-- Index for channel queries
CREATE INDEX idx_channels_user_active ON channels(user_id, active);
CREATE INDEX idx_channels_user_channel_id ON channels(user_id, channel_id);

-- Payment Attempts Table (Reality Validation Tracking)
CREATE TABLE IF NOT EXISTS payment_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  destination TEXT NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('send', 'receive')),
  status TEXT NOT NULL CHECK (status IN ('validating', 'routing', 'success', 'failed')),
  failure_reason TEXT,
  
  -- Reality checks
  liquidity_check_passed BOOLEAN DEFAULT FALSE,
  route_check_passed BOOLEAN DEFAULT FALSE,
  dust_limit_check_passed BOOLEAN DEFAULT FALSE,
  
  -- Timing
  validation_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validation_completed_at TIMESTAMP WITH TIME ZONE,
  payment_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  estimated_fee BIGINT,
  actual_fee BIGINT,
  route_hops INTEGER,
  
  -- Constraints
  CONSTRAINT valid_payment_amount CHECK (amount > 0),
  CONSTRAINT valid_fees CHECK (
    estimated_fee IS NULL OR estimated_fee >= 0
  ),
  CONSTRAINT valid_timing CHECK (
    validation_completed_at IS NULL OR validation_completed_at >= validation_started_at
  )
);

-- RLS Policies for payment_attempts
ALTER TABLE payment_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment attempts" ON payment_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment attempts" ON payment_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment attempts" ON payment_attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- Index for payment tracking
CREATE INDEX idx_payment_attempts_user_status_time 
ON payment_attempts(user_id, status, validation_started_at DESC);

-- Lightning Constraints Table (System Limits)
CREATE TABLE IF NOT EXISTS lightning_constraints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  constraint_name TEXT NOT NULL UNIQUE,
  constraint_value BIGINT NOT NULL,
  constraint_type TEXT NOT NULL CHECK (constraint_type IN ('limit', 'minimum', 'maximum', 'duration')),
  description TEXT,
  enforced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default Lightning constraints
INSERT INTO lightning_constraints (constraint_name, constraint_value, constraint_type, description) VALUES
  ('MAX_PPM', 5000, 'maximum', 'Maximum fee rate in parts per million'),
  ('MIN_PPM', 0, 'minimum', 'Minimum fee rate in parts per million'),
  ('DUST_LIMIT', 546, 'minimum', 'Minimum payment amount in satoshis'),
  ('MAX_HTLC_COUNT', 483, 'maximum', 'Maximum HTLCs per channel'),
  ('FEE_UPDATE_COOLDOWN', 1800000, 'duration', 'Cooldown between fee updates in milliseconds'),
  ('MAX_FEE_UPDATES_PER_HOUR', 5, 'maximum', 'Maximum fee updates per hour per channel'),
  ('MIN_CHANNEL_SIZE', 20000, 'minimum', 'Minimum channel size in satoshis'),
  ('MAX_PAYMENT_SIZE', 4294967295, 'maximum', 'Maximum payment size in satoshis')
ON CONFLICT (constraint_name) DO NOTHING;

-- No RLS on constraints table (read-only for all users)
CREATE POLICY "Anyone can read lightning constraints" ON lightning_constraints
  FOR SELECT TO authenticated USING (true);

-- Functions for Reality Validation

-- Function to check if fee update is allowed (rate limiting)
CREATE OR REPLACE FUNCTION can_update_channel_fee(
  p_user_id UUID,
  p_channel_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  last_update TIMESTAMP WITH TIME ZONE;
  cooldown_ms BIGINT;
  updates_last_hour INTEGER;
  max_updates_per_hour INTEGER;
BEGIN
  -- Get cooldown period
  SELECT constraint_value INTO cooldown_ms 
  FROM lightning_constraints 
  WHERE constraint_name = 'FEE_UPDATE_COOLDOWN' AND enforced = TRUE;
  
  -- Get max updates per hour
  SELECT constraint_value INTO max_updates_per_hour
  FROM lightning_constraints 
  WHERE constraint_name = 'MAX_FEE_UPDATES_PER_HOUR' AND enforced = TRUE;
  
  -- Check last update time
  SELECT created_at INTO last_update
  FROM channel_fee_updates
  WHERE user_id = p_user_id AND channel_id = p_channel_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Check cooldown
  IF last_update IS NOT NULL AND 
     EXTRACT(EPOCH FROM (NOW() - last_update)) * 1000 < cooldown_ms THEN
    RETURN FALSE;
  END IF;
  
  -- Check hourly limit
  SELECT COUNT(*) INTO updates_last_hour
  FROM channel_fee_updates
  WHERE user_id = p_user_id 
    AND channel_id = p_channel_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  IF updates_last_hour >= max_updates_per_hour THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate payment amount
CREATE OR REPLACE FUNCTION validate_payment_amount(
  p_amount BIGINT,
  p_payment_type TEXT
) RETURNS JSONB AS $$
DECLARE
  dust_limit BIGINT;
  max_payment BIGINT;
  result JSONB;
BEGIN
  -- Get constraints
  SELECT constraint_value INTO dust_limit
  FROM lightning_constraints 
  WHERE constraint_name = 'DUST_LIMIT' AND enforced = TRUE;
  
  SELECT constraint_value INTO max_payment
  FROM lightning_constraints 
  WHERE constraint_name = 'MAX_PAYMENT_SIZE' AND enforced = TRUE;
  
  -- Initialize result
  result := jsonb_build_object(
    'valid', true,
    'warnings', '[]'::jsonb,
    'recommendations', '[]'::jsonb
  );
  
  -- Check dust limit
  IF p_amount < dust_limit THEN
    result := jsonb_set(result, '{valid}', 'false');
    result := jsonb_set(result, '{warnings}', 
      result->'warnings' || jsonb_build_array(
        format('Amount below dust limit (%s sats)', dust_limit)
      )
    );
  END IF;
  
  -- Check maximum
  IF p_amount > max_payment THEN
    result := jsonb_set(result, '{valid}', 'false');
    result := jsonb_set(result, '{warnings}', 
      result->'warnings' || jsonb_build_array(
        'Amount exceeds Lightning Network maximum'
      )
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update channel updated_at timestamp
CREATE OR REPLACE FUNCTION update_channel_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_channel_timestamp
  BEFORE UPDATE ON channels
  FOR EACH ROW
  EXECUTE FUNCTION update_channel_timestamp();

-- View for user's current node status
CREATE OR REPLACE VIEW user_node_status AS
SELECT 
  u.id as user_id,
  COALESCE(SUM(c.capacity), 0) as total_capacity,
  COALESCE(SUM(c.local_balance), 0) as total_local_balance,
  COALESCE(SUM(c.remote_balance), 0) as total_remote_balance,
  COUNT(c.id) as total_channels,
  COUNT(CASE WHEN c.active THEN 1 END) as active_channels,
  COUNT(CASE WHEN NOT c.active THEN 1 END) as inactive_channels,
  CASE WHEN COUNT(CASE WHEN c.active THEN 1 END) >= 2 THEN true ELSE false END as routing_capable,
  MAX(c.updated_at) as last_channel_update
FROM auth.users u
LEFT JOIN channels c ON c.user_id = u.id
GROUP BY u.id;

-- Grant access to the view
GRANT SELECT ON user_node_status TO authenticated;

-- RLS for the view
CREATE POLICY "Users can view their own node status" ON user_node_status
  FOR SELECT USING (auth.uid() = user_id); 