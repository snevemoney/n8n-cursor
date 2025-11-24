-- Service Registry Schema
-- Manages service discovery, health checks, and service mesh

-- Service instances table
CREATE TABLE IF NOT EXISTS service_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Service identification
  service_name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  
  -- Network location
  host VARCHAR(255) NOT NULL,
  port INTEGER NOT NULL,
  protocol VARCHAR(10) NOT NULL CHECK (protocol IN ('http', 'https', 'grpc')),
  
  -- Status
  status VARCHAR(20) DEFAULT 'unknown' CHECK (status IN ('healthy', 'unhealthy', 'unknown')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Timestamps
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(service_name, host, port)
);

-- Service health checks
CREATE TABLE IF NOT EXISTS service_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES service_instances(id) ON DELETE CASCADE,
  
  -- Health status
  status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'unhealthy', 'degraded')),
  checks JSONB NOT NULL, -- Array of health checks
  
  -- Timestamp
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service dependencies (for service mesh)
CREATE TABLE IF NOT EXISTS service_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_service_id UUID NOT NULL REFERENCES service_instances(id) ON DELETE CASCADE,
  to_service_id UUID NOT NULL REFERENCES service_instances(id) ON DELETE CASCADE,
  
  -- Dependency metadata
  dependency_type VARCHAR(50) DEFAULT 'http', -- http, grpc, database, etc.
  required BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(from_service_id, to_service_id),
  CHECK (from_service_id != to_service_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_instances_name ON service_instances(service_name);
CREATE INDEX IF NOT EXISTS idx_service_instances_status ON service_instances(status);
CREATE INDEX IF NOT EXISTS idx_service_instances_heartbeat ON service_instances(last_heartbeat DESC);
CREATE INDEX IF NOT EXISTS idx_service_dependencies_from ON service_dependencies(from_service_id);
CREATE INDEX IF NOT EXISTS idx_service_dependencies_to ON service_dependencies(to_service_id);

