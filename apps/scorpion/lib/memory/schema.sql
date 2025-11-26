-- Long-term Memory Schema
-- Stores personality, preferences, and learned behaviors

CREATE TABLE IF NOT EXISTS long_term_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Scope/category
  scope VARCHAR(50) NOT NULL DEFAULT 'global',
  
  -- Memory content
  content TEXT NOT NULL,
  
  -- Weight (1-5, higher = more important)
  weight INTEGER DEFAULT 1 CHECK (weight >= 1 AND weight <= 5),
  
  -- Tags for filtering
  tags JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  
  -- Indexes
  INDEX idx_memory_scope (scope),
  INDEX idx_memory_weight (weight DESC),
  INDEX idx_memory_tags (tags)
);

-- Chat Feedback Schema
-- Stores user feedback on Scorpion's responses

CREATE TABLE IF NOT EXISTS chat_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Conversation tracking
  conversation_id VARCHAR(255),
  message_id VARCHAR(255),
  
  -- Feedback
  rating VARCHAR(10) NOT NULL CHECK (rating IN ('good', 'bad')),
  tags JSONB DEFAULT '[]'::jsonb, -- e.g., ["too_safe", "not_deep_enough"]
  
  -- Optional comment
  comment TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_feedback_conversation (conversation_id),
  INDEX idx_feedback_rating (rating),
  INDEX idx_feedback_tags (tags),
  INDEX idx_feedback_created (created_at DESC)
);

