-- API Gateway Schema
-- Manages API keys, rate limits, and API analytics

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Key identification
  key_name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE, -- SHA-256 hash of the actual key
  
  -- Access control
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Rate limiting
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  rate_limit_per_day INTEGER DEFAULT 10000,
  
  -- Permissions
  allowed_endpoints TEXT[], -- Array of endpoint patterns (e.g., ['/api/v1/*', '/api/v1/chat'])
  blocked_endpoints TEXT[], -- Array of blocked endpoint patterns
  
  -- Metadata
  created_by VARCHAR(255) DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  
  -- Constraints
  UNIQUE(key_name)
);

-- API Usage tracking
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  
  -- Request details
  endpoint VARCHAR(500) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  
  -- Timing
  request_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_ms INTEGER,
  
  -- Request metadata
  user_agent TEXT,
  ip_address VARCHAR(45),
  request_size INTEGER, -- bytes
  response_size INTEGER, -- bytes
  
  -- Indexes for queries
  INDEX idx_api_usage_key (api_key_id),
  INDEX idx_api_usage_time (request_time),
  INDEX idx_api_usage_endpoint (endpoint)
);

-- Rate limit tracking (for sliding window)
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  
  -- Window type
  window_type VARCHAR(20) NOT NULL, -- 'minute', 'hour', 'day'
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Count
  request_count INTEGER DEFAULT 0,
  
  -- Constraints
  UNIQUE(api_key_id, window_type, window_start)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_api_usage_key_time ON api_usage(api_key_id, request_time DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_window ON api_rate_limits(api_key_id, window_type, window_start DESC);

