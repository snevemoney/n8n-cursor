-- Edge Deployment Schema
-- Manages edge nodes across multiple regions

-- Edge nodes table
CREATE TABLE IF NOT EXISTS edge_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Node identification
  region VARCHAR(50) NOT NULL,
  host VARCHAR(255) NOT NULL,
  port INTEGER NOT NULL,
  protocol VARCHAR(10) NOT NULL CHECK (protocol IN ('http', 'https')),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'standby', 'maintenance')),
  
  -- Performance metrics
  latency INTEGER, -- milliseconds
  capacity INTEGER, -- requests per second
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  last_health_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(region, host, port)
);

-- Edge routes table
CREATE TABLE IF NOT EXISTS edge_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Route definition
  path VARCHAR(500) NOT NULL,
  method VARCHAR(10) NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', '*')),
  
  -- Routing configuration
  target_region VARCHAR(50),
  preferred_regions TEXT[] DEFAULT ARRAY[]::TEXT[],
  fallback_regions TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Caching
  cache_enabled BOOLEAN DEFAULT FALSE,
  cache_ttl INTEGER DEFAULT 3600, -- seconds
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(path, method)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_edge_nodes_region ON edge_nodes(region);
CREATE INDEX IF NOT EXISTS idx_edge_nodes_status ON edge_nodes(status);
CREATE INDEX IF NOT EXISTS idx_edge_nodes_latency ON edge_nodes(latency ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_edge_routes_path ON edge_routes(path);
CREATE INDEX IF NOT EXISTS idx_edge_routes_method ON edge_routes(method);

