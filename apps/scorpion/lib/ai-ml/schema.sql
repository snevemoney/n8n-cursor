-- AI/ML Stack Database Schema
-- Stores model metadata, training data, predictions, and transcriptions

-- ML Models Registry
CREATE TABLE IF NOT EXISTS ml_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    tier TEXT NOT NULL CHECK (tier IN ('tier1', 'tier2', 'tier3', 'tier4')),
    provider TEXT NOT NULL,
    algorithm TEXT,
    status TEXT NOT NULL DEFAULT 'training' CHECK (status IN ('training', 'ready', 'failed', 'deprecated')),
    accuracy NUMERIC,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ml_models_name ON ml_models (name);
CREATE INDEX IF NOT EXISTS idx_ml_models_tier ON ml_models (tier);
CREATE INDEX IF NOT EXISTS idx_ml_models_status ON ml_models (status);

-- Training Data
CREATE TABLE IF NOT EXISTS ml_training_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES ml_models(id) ON DELETE CASCADE,
    features JSONB NOT NULL,
    target JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ml_training_data_model_id ON ml_training_data (model_id);

-- Predictions Cache
CREATE TABLE IF NOT EXISTS ml_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES ml_models(id) ON DELETE SET NULL,
    input JSONB NOT NULL,
    prediction JSONB NOT NULL,
    confidence NUMERIC,
    latency_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ml_predictions_model_id ON ml_predictions (model_id);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_created_at ON ml_predictions (created_at DESC);

-- Audio Transcriptions (for Whisper)
CREATE TABLE IF NOT EXISTS ml_transcriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audio_hash TEXT UNIQUE NOT NULL,
    text TEXT NOT NULL,
    language TEXT,
    segments JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ml_transcriptions_audio_hash ON ml_transcriptions (audio_hash);
CREATE INDEX IF NOT EXISTS idx_ml_transcriptions_language ON ml_transcriptions (language);

-- ML Request Logs
CREATE TABLE IF NOT EXISTS ml_request_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task TEXT NOT NULL,
    tier TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT,
    latency_ms INTEGER NOT NULL,
    tokens INTEGER,
    cost_usd NUMERIC,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ml_request_logs_task ON ml_request_logs (task);
CREATE INDEX IF NOT EXISTS idx_ml_request_logs_tier ON ml_request_logs (tier);
CREATE INDEX IF NOT EXISTS idx_ml_request_logs_created_at ON ml_request_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ml_request_logs_success ON ml_request_logs (success);

