-- Sustainability & Carbon Tracking Schema

-- Carbon Emissions
CREATE TABLE IF NOT EXISTS sustainability_emissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    provider TEXT NOT NULL,
    region TEXT NOT NULL,
    emissions_kg_co2 NUMERIC NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    breakdown JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resource_id, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_sustainability_emissions_resource_id ON sustainability_emissions (resource_id);
CREATE INDEX IF NOT EXISTS idx_sustainability_emissions_provider ON sustainability_emissions (provider);
CREATE INDEX IF NOT EXISTS idx_sustainability_emissions_region ON sustainability_emissions (region);
CREATE INDEX IF NOT EXISTS idx_sustainability_emissions_period ON sustainability_emissions (period_start, period_end);

-- Resource Efficiency
CREATE TABLE IF NOT EXISTS sustainability_efficiency (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id TEXT NOT NULL,
    cpu_utilization NUMERIC NOT NULL CHECK (cpu_utilization >= 0 AND cpu_utilization <= 100),
    memory_utilization NUMERIC NOT NULL CHECK (memory_utilization >= 0 AND memory_utilization <= 100),
    storage_utilization NUMERIC NOT NULL CHECK (storage_utilization >= 0 AND storage_utilization <= 100),
    network_utilization NUMERIC NOT NULL CHECK (network_utilization >= 0 AND network_utilization <= 100),
    efficiency_score NUMERIC NOT NULL CHECK (efficiency_score >= 0 AND efficiency_score <= 100),
    recommendations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resource_id, DATE(created_at))
);

CREATE INDEX IF NOT EXISTS idx_sustainability_efficiency_resource_id ON sustainability_efficiency (resource_id);
CREATE INDEX IF NOT EXISTS idx_sustainability_efficiency_score ON sustainability_efficiency (efficiency_score);
CREATE INDEX IF NOT EXISTS idx_sustainability_efficiency_created_at ON sustainability_efficiency (created_at DESC);

-- Sustainability Goals
CREATE TABLE IF NOT EXISTS sustainability_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('carbon_reduction', 'energy_efficiency', 'resource_optimization')),
    target NUMERIC NOT NULL,
    current NUMERIC NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'on_track' CHECK (status IN ('on_track', 'at_risk', 'behind')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sustainability_goals_type ON sustainability_goals (type);
CREATE INDEX IF NOT EXISTS idx_sustainability_goals_status ON sustainability_goals (status);
CREATE INDEX IF NOT EXISTS idx_sustainability_goals_deadline ON sustainability_goals (deadline);

-- Energy Consumption
CREATE TABLE IF NOT EXISTS sustainability_energy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    provider TEXT NOT NULL,
    region TEXT NOT NULL,
    energy_kwh NUMERIC NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('renewable', 'mixed', 'fossil')),
    renewable_percentage NUMERIC NOT NULL CHECK (renewable_percentage >= 0 AND renewable_percentage <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sustainability_energy_resource_id ON sustainability_energy (resource_id);
CREATE INDEX IF NOT EXISTS idx_sustainability_energy_provider ON sustainability_energy (provider);
CREATE INDEX IF NOT EXISTS idx_sustainability_energy_period ON sustainability_energy (period_start, period_end);

