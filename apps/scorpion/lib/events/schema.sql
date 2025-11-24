-- Events Table Schema
-- Stores all events emitted by the event bus for persistence and querying

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY,
  
  -- Event identification
  type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL, -- info, warn, error, critical
  
  -- Timestamps
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Event source
  source VARCHAR(100),
  environment VARCHAR(20), -- dev, staging, prod
  
  -- Event data (flexible JSONB for different event types)
  data JSONB NOT NULL DEFAULT '{}',
  
  -- Metadata (request IDs, user IDs, etc.)
  metadata JSONB DEFAULT '{}'
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_severity ON events(severity);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source);
CREATE INDEX IF NOT EXISTS idx_events_environment ON events(environment);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_events_type_timestamp ON events(type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_events_severity_timestamp ON events(severity, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_events_source_timestamp ON events(source, timestamp DESC);

-- GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_events_data_gin ON events USING GIN (data);
CREATE INDEX IF NOT EXISTS idx_events_metadata_gin ON events USING GIN (metadata);

-- Partitioning by month (optional, for high-volume scenarios)
-- CREATE TABLE events_2025_01 PARTITION OF events
--   FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

