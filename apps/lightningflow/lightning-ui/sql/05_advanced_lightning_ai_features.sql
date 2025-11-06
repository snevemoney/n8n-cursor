-- Advanced Lightning AI Features Schema
-- Supports: Vector RAG, Analytics, Fee Optimization, Tutorial Management

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- ======================
-- 1. TUTORIAL & CONTENT MANAGEMENT
-- ======================

-- Enhanced tutorials table with vector embeddings
CREATE TABLE IF NOT EXISTS tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'markdown' CHECK (content_type IN ('markdown', 'video', 'interactive')),
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category TEXT NOT NULL, -- 'lightning', 'fee-management', 'channels', 'troubleshooting'
  tags TEXT[], -- For flexible categorization
  estimated_read_time INTEGER, -- in minutes
  video_url TEXT,
  video_duration INTEGER, -- in seconds
  tooltip_markers JSONB, -- Stores timestamp-based tooltips for videos
  prerequisites TEXT[], -- Array of tutorial IDs
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  helpful_votes INTEGER DEFAULT 0,
  unhelpful_votes INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector embeddings for tutorials (for RAG)
CREATE TABLE IF NOT EXISTS tutorial_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutorial_id UUID REFERENCES tutorials(id) ON DELETE CASCADE,
  content_chunk TEXT NOT NULL, -- Chunked content for better embeddings
  chunk_index INTEGER NOT NULL, -- Order of chunks
  embedding vector(1536), -- OpenAI ada-002 embeddings
  metadata JSONB, -- Additional context (section, subsection, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vector similarity search index
CREATE INDEX IF NOT EXISTS tutorial_embeddings_vector_idx 
ON tutorial_embeddings USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- ======================
-- 2. LOOP ERROR ANALYSIS & RAG
-- ======================

-- Enhanced loop embeddings for error explanation
CREATE TABLE IF NOT EXISTS loop_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL, -- 'channel_liquidity', 'routing_failure', 'fee_insufficient'
  error_message TEXT NOT NULL,
  solution_text TEXT,
  tutorial_ids UUID[], -- References to related tutorials
  agent_action_suggestions JSONB, -- Automated recovery steps
  embedding vector(1536),
  success_rate FLOAT DEFAULT 0.0, -- How often this solution works
  confidence_score FLOAT DEFAULT 0.0,
  context_metadata JSONB, -- Channel info, node status, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector index for loop embeddings
CREATE INDEX IF NOT EXISTS loop_embeddings_vector_idx 
ON loop_embeddings USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 50);

-- ======================
-- 3. ANALYTICS & USER BEHAVIOR
-- ======================

-- Onboarding funnel tracking
CREATE TABLE IF NOT EXISTS onboarding_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL, -- Track single onboarding session
  step_name TEXT NOT NULL, -- 'welcome', 'node_setup', 'first_channel', 'first_payment'
  step_index INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'skipped', 'dropped', 'error')),
  time_spent_seconds INTEGER, -- Time spent on this step
  error_details JSONB, -- If status is 'error'
  metadata JSONB, -- Step-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector search feedback tracking
CREATE TABLE IF NOT EXISTS vector_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  search_type TEXT NOT NULL, -- 'tutorial', 'error', 'general'
  match_id UUID, -- References tutorial_embeddings.id or loop_embeddings.id
  match_rank INTEGER, -- Position in search results (1st, 2nd, etc.)
  helpful BOOLEAN NOT NULL, -- true = helpful, false = not helpful
  additional_feedback TEXT, -- Optional text feedback
  context_metadata JSONB, -- Page, error details, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User interaction tracking
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'search', 'tutorial_view', 'agent_action', 'loop_step'
  target_id UUID, -- ID of the thing they interacted with
  target_type TEXT NOT NULL, -- 'tutorial', 'loop_embedding', 'agent'
  action TEXT NOT NULL, -- 'view', 'like', 'execute', 'dismiss'
  result TEXT, -- 'success', 'failure', 'incomplete'
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================
-- 4. CHANNEL ECONOMICS & FEE OPTIMIZATION
-- ======================

-- Advanced channel statistics for fee optimization
CREATE TABLE IF NOT EXISTS channel_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL, -- LND channel ID
  short_channel_id TEXT,
  peer_pubkey TEXT NOT NULL,
  peer_alias TEXT,
  
  -- Channel basics
  capacity_sats BIGINT NOT NULL,
  local_balance_sats BIGINT NOT NULL,
  remote_balance_sats BIGINT NOT NULL,
  
  -- Fee settings
  current_fee_base_msat BIGINT DEFAULT 1000,
  current_fee_ppm INTEGER DEFAULT 1000,
  suggested_fee_ppm INTEGER,
  
  -- Routing performance
  forwards_24h INTEGER DEFAULT 0,
  forwards_7d INTEGER DEFAULT 0,
  forwards_30d INTEGER DEFAULT 0,
  sats_routed_24h BIGINT DEFAULT 0,
  sats_routed_7d BIGINT DEFAULT 0,
  sats_routed_30d BIGINT DEFAULT 0,
  revenue_24h_msat BIGINT DEFAULT 0,
  revenue_7d_msat BIGINT DEFAULT 0,
  revenue_30d_msat BIGINT DEFAULT 0,
  
  -- Rebalancing economics
  last_rebalance_attempt TIMESTAMP WITH TIME ZONE,
  avg_rebalance_cost_ppm INTEGER DEFAULT 0,
  successful_rebalances INTEGER DEFAULT 0,
  failed_rebalances INTEGER DEFAULT 0,
  
  -- Channel tier classification
  tier TEXT DEFAULT 'unknown' CHECK (tier IN ('tier1_high_throughput', 'tier2_dormant', 'tier3_symbiotic', 'unknown')),
  tier_last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Activity tracking
  last_forward_block INTEGER,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, channel_id)
);

-- Forward event tracking for detailed analytics
CREATE TABLE IF NOT EXISTS forward_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id_in TEXT NOT NULL,
  channel_id_out TEXT NOT NULL,
  amount_msat BIGINT NOT NULL,
  fee_msat BIGINT NOT NULL,
  timestamp_ns BIGINT NOT NULL, -- LND timestamp
  settled BOOLEAN DEFAULT true,
  failure_reason TEXT, -- If not settled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================
-- 5. AI AGENT SYSTEM
-- ======================

-- Agent definitions and configurations
CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'fee_optimizer', 'rebalancer', 'troubleshooter', 'content_creator'
  description TEXT,
  configuration JSONB NOT NULL, -- Agent-specific settings
  is_active BOOLEAN DEFAULT true,
  triggers JSONB, -- When this agent should run
  last_run TIMESTAMP WITH TIME ZONE,
  total_runs INTEGER DEFAULT 0,
  success_rate FLOAT DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent execution logs
CREATE TABLE IF NOT EXISTS agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_event TEXT, -- What caused this execution
  input_data JSONB,
  output_data JSONB,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failure', 'timeout')),
  error_message TEXT,
  execution_time_ms INTEGER,
  cost_tokens INTEGER,
  cost_usd DECIMAL(10,6),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ======================
-- 6. INDEXES AND PERFORMANCE
-- ======================

-- Analytics indexes
CREATE INDEX IF NOT EXISTS onboarding_events_user_session_idx ON onboarding_events(user_id, session_id, created_at);
CREATE INDEX IF NOT EXISTS onboarding_events_step_idx ON onboarding_events(step_name, status, created_at);
CREATE INDEX IF NOT EXISTS vector_feedback_query_idx ON vector_feedback(query_text, helpful, created_at);
CREATE INDEX IF NOT EXISTS user_interactions_user_type_idx ON user_interactions(user_id, interaction_type, created_at);

-- Channel stats indexes
CREATE INDEX IF NOT EXISTS channel_stats_user_channel_idx ON channel_stats(user_id, channel_id);
CREATE INDEX IF NOT EXISTS channel_stats_tier_idx ON channel_stats(tier, last_activity);
CREATE INDEX IF NOT EXISTS channel_stats_revenue_idx ON channel_stats(revenue_7d_msat DESC);
CREATE INDEX IF NOT EXISTS forward_events_channel_time_idx ON forward_events(channel_id_in, channel_id_out, created_at);

-- Tutorial indexes
CREATE INDEX IF NOT EXISTS tutorials_category_published_idx ON tutorials(category, is_published, created_at);
CREATE INDEX IF NOT EXISTS tutorials_difficulty_idx ON tutorials(difficulty, is_published);
CREATE INDEX IF NOT EXISTS tutorial_embeddings_tutorial_idx ON tutorial_embeddings(tutorial_id, chunk_index);

-- Agent system indexes
CREATE INDEX IF NOT EXISTS ai_agents_type_active_idx ON ai_agents(type, is_active);
CREATE INDEX IF NOT EXISTS agent_executions_agent_status_idx ON agent_executions(agent_id, status, created_at);

-- ======================
-- 7. ROW LEVEL SECURITY (RLS)
-- ======================

-- Enable RLS on all tables
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorial_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE loop_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE vector_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE forward_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user data isolation
CREATE POLICY "Users can only access their own tutorials" ON tutorials
FOR ALL USING (tenant_id = auth.uid() OR (is_published = true AND tenant_id IS NULL));

CREATE POLICY "Users can only access their own tutorial embeddings" ON tutorial_embeddings
FOR ALL USING (EXISTS (
  SELECT 1 FROM tutorials t 
  WHERE t.id = tutorial_embeddings.tutorial_id 
  AND (t.tenant_id = auth.uid() OR t.is_published = true)
));

CREATE POLICY "Users can only access their own onboarding events" ON onboarding_events
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own feedback" ON vector_feedback
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own interactions" ON user_interactions
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own channel stats" ON channel_stats
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own forward events" ON forward_events
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own agents" ON ai_agents
FOR ALL USING (tenant_id = auth.uid());

CREATE POLICY "Users can only access their own agent executions" ON agent_executions
FOR ALL USING (user_id = auth.uid());

-- Public read access for loop embeddings (shared knowledge base)
CREATE POLICY "Loop embeddings are publicly readable" ON loop_embeddings
FOR SELECT USING (true);

-- Only authenticated users can insert/update loop embeddings
CREATE POLICY "Authenticated users can manage loop embeddings" ON loop_embeddings
FOR ALL USING (auth.role() = 'authenticated');

-- ======================
-- 8. TRIGGERS & FUNCTIONS
-- ======================

-- Auto-update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_tutorials_updated_at BEFORE UPDATE ON tutorials
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loop_embeddings_updated_at BEFORE UPDATE ON loop_embeddings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channel_stats_updated_at BEFORE UPDATE ON channel_stats
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON ai_agents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-increment view count for tutorials
CREATE OR REPLACE FUNCTION increment_tutorial_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tutorials 
  SET view_count = view_count + 1 
  WHERE id = NEW.target_id AND NEW.interaction_type = 'tutorial_view';
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER increment_tutorial_views 
AFTER INSERT ON user_interactions
FOR EACH ROW EXECUTE FUNCTION increment_tutorial_view_count();

-- ======================
-- 9. VECTOR SEARCH FUNCTIONS
-- ======================

-- Enhanced tutorial search with relevance scoring
CREATE OR REPLACE FUNCTION search_tutorials(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 10,
  filter_category text DEFAULT NULL,
  filter_difficulty text DEFAULT NULL
)
RETURNS TABLE (
  tutorial_id uuid,
  title text,
  summary text,
  category text,
  difficulty text,
  similarity float,
  chunk_content text,
  chunk_index int
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.summary,
    t.category,
    t.difficulty,
    1 - (te.embedding <=> query_embedding) as similarity,
    te.content_chunk,
    te.chunk_index
  FROM tutorial_embeddings te
  JOIN tutorials t ON te.tutorial_id = t.id
  WHERE 
    (te.embedding <=> query_embedding) < (1 - match_threshold)
    AND t.is_published = true
    AND (filter_category IS NULL OR t.category = filter_category)
    AND (filter_difficulty IS NULL OR t.difficulty = filter_difficulty)
  ORDER BY te.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Enhanced loop error search with context
CREATE OR REPLACE FUNCTION search_loop_solutions(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.75,
  match_count int DEFAULT 5,
  min_success_rate float DEFAULT 0.3
)
RETURNS TABLE (
  id uuid,
  error_type text,
  solution_text text,
  similarity float,
  success_rate float,
  confidence_score float,
  tutorial_ids uuid[],
  agent_suggestions jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    le.id,
    le.error_type,
    le.solution_text,
    1 - (le.embedding <=> query_embedding) as similarity,
    le.success_rate,
    le.confidence_score,
    le.tutorial_ids,
    le.agent_action_suggestions
  FROM loop_embeddings le
  WHERE 
    (le.embedding <=> query_embedding) < (1 - match_threshold)
    AND le.success_rate >= min_success_rate
  ORDER BY 
    (le.embedding <=> query_embedding),
    le.success_rate DESC,
    le.confidence_score DESC
  LIMIT match_count;
END;
$$; 