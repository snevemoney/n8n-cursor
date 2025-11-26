-- Feedback tracking for vector search results and tutorial tooltips
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  embedding_id TEXT NOT NULL,
  value TEXT CHECK (value IN ('yes', 'no')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  context JSONB,
  user_agent TEXT,
  ip_address TEXT
);

-- Embedding quality scores based on feedback
CREATE TABLE IF NOT EXISTS embedding_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  embedding_id TEXT NOT NULL UNIQUE,
  positive_feedback INTEGER DEFAULT 0,
  total_feedback INTEGER DEFAULT 0,
  score NUMERIC(4,3) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_embedding_id ON feedback(embedding_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_value ON feedback(value);

CREATE INDEX IF NOT EXISTS idx_embedding_scores_embedding_id ON embedding_scores(embedding_id);
CREATE INDEX IF NOT EXISTS idx_embedding_scores_score ON embedding_scores(score DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE embedding_scores ENABLE ROW LEVEL SECURITY;

-- Feedback policies
-- Users can insert their own feedback (or anonymous feedback)
CREATE POLICY "Users can submit feedback" ON feedback
FOR INSERT WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback" ON feedback
FOR SELECT USING (
  user_id = auth.uid()
);

-- Admin users can view all feedback (add admin role check as needed)
CREATE POLICY "Admins can view all feedback" ON feedback
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Embedding scores policies
-- Anyone can read embedding scores (for improving search results)
CREATE POLICY "Anyone can read embedding scores" ON embedding_scores
FOR SELECT USING (true);

-- Only system/admin can update embedding scores
CREATE POLICY "System can update embedding scores" ON embedding_scores
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' IN ('admin', 'system')
  )
);

-- Function to update embedding scores automatically
CREATE OR REPLACE FUNCTION update_embedding_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate new stats for the embedding
  INSERT INTO embedding_scores (embedding_id, positive_feedback, total_feedback, score)
  SELECT 
    NEW.embedding_id,
    COUNT(*) FILTER (WHERE value = 'yes'),
    COUNT(*),
    COALESCE(
      COUNT(*) FILTER (WHERE value = 'yes')::NUMERIC / NULLIF(COUNT(*), 0),
      0
    )
  FROM feedback 
  WHERE embedding_id = NEW.embedding_id
  ON CONFLICT (embedding_id) 
  DO UPDATE SET
    positive_feedback = EXCLUDED.positive_feedback,
    total_feedback = EXCLUDED.total_feedback,
    score = EXCLUDED.score,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update embedding scores when feedback is added
CREATE TRIGGER update_embedding_score_trigger
  AFTER INSERT ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_embedding_score();

-- Tutorial progress tracking (optional enhancement)
CREATE TABLE IF NOT EXISTS tutorial_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tutorial_id TEXT NOT NULL,
  progress_seconds NUMERIC(10,2) DEFAULT 0,
  total_duration_seconds NUMERIC(10,2),
  completion_percentage NUMERIC(5,2) DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, tutorial_id)
);

-- Tutorial progress policies
ALTER TABLE tutorial_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tutorial progress" ON tutorial_progress
FOR ALL USING (user_id = auth.uid());

-- Indexes for tutorial progress
CREATE INDEX IF NOT EXISTS idx_tutorial_progress_user_id ON tutorial_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_progress_tutorial_id ON tutorial_progress(tutorial_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_progress_completion ON tutorial_progress(completion_percentage);

-- Function to upsert tutorial progress
CREATE OR REPLACE FUNCTION upsert_tutorial_progress(
  p_user_id UUID,
  p_tutorial_id TEXT,
  p_progress_seconds NUMERIC,
  p_total_duration_seconds NUMERIC
) RETURNS VOID AS $$
DECLARE
  completion_pct NUMERIC;
BEGIN
  -- Calculate completion percentage
  completion_pct := CASE 
    WHEN p_total_duration_seconds > 0 THEN 
      LEAST(100, (p_progress_seconds / p_total_duration_seconds) * 100)
    ELSE 0 
  END;

  INSERT INTO tutorial_progress (
    user_id, 
    tutorial_id, 
    progress_seconds, 
    total_duration_seconds,
    completion_percentage,
    completed_at,
    last_watched_at
  ) VALUES (
    p_user_id,
    p_tutorial_id,
    p_progress_seconds,
    p_total_duration_seconds,
    completion_pct,
    CASE WHEN completion_pct >= 90 THEN NOW() ELSE NULL END,
    NOW()
  )
  ON CONFLICT (user_id, tutorial_id)
  DO UPDATE SET
    progress_seconds = GREATEST(tutorial_progress.progress_seconds, EXCLUDED.progress_seconds),
    total_duration_seconds = EXCLUDED.total_duration_seconds,
    completion_percentage = GREATEST(tutorial_progress.completion_percentage, EXCLUDED.completion_percentage),
    completed_at = CASE 
      WHEN EXCLUDED.completion_percentage >= 90 AND tutorial_progress.completed_at IS NULL 
      THEN NOW() 
      ELSE tutorial_progress.completed_at 
    END,
    last_watched_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Grants for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON feedback TO authenticated;
GRANT ALL ON embedding_scores TO authenticated;
GRANT ALL ON tutorial_progress TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_tutorial_progress TO authenticated; 