-- Tools table for storing AI-generated business tools
CREATE TABLE IF NOT EXISTS tools (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN (
    'uploader',
    'tracker', 
    'payment_link',
    'invoice_builder',
    'reminder_bot',
    'contract_signer',
    'status_board',
    'booking_scheduler',
    'team_wallet'
  )),
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  industry TEXT CHECK (industry IN (
    'auto_finance',
    'restaurant',
    'freelance',
    'consulting',
    'retail',
    'healthcare',
    'real_estate',
    'education',
    'general'
  )),
  public BOOLEAN NOT NULL DEFAULT false,
  share_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tool usage logs for tracking and analytics
CREATE TABLE IF NOT EXISTS tool_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN (
    'created',
    'viewed',
    'used',
    'shared',
    'updated',
    'deleted'
  )),
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tool versions for rollback capability
CREATE TABLE IF NOT EXISTS tool_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  config JSONB NOT NULL,
  changes_summary TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tool_id, version_number)
);

-- AI conversation history for context
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  industry TEXT,
  role TEXT,
  messages JSONB NOT NULL DEFAULT '[]',
  tools_created TEXT[] DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tools_user_id ON tools(user_id);
CREATE INDEX IF NOT EXISTS idx_tools_type ON tools(type);
CREATE INDEX IF NOT EXISTS idx_tools_industry ON tools(industry);
CREATE INDEX IF NOT EXISTS idx_tools_public ON tools(public) WHERE public = true;
CREATE INDEX IF NOT EXISTS idx_tools_created_at ON tools(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tool_usage_logs_tool_id ON tool_usage_logs(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_logs_user_id ON tool_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_logs_action ON tool_usage_logs(action);
CREATE INDEX IF NOT EXISTS idx_tool_usage_logs_created_at ON tool_usage_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tool_versions_tool_id ON tool_versions(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_versions_version ON tool_versions(tool_id, version_number DESC);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session_id ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_updated_at ON ai_conversations(updated_at DESC);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Tools policies
CREATE POLICY "Users can view their own tools" ON tools
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public tools" ON tools
  FOR SELECT USING (public = true);

CREATE POLICY "Users can insert their own tools" ON tools
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tools" ON tools
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tools" ON tools
  FOR DELETE USING (auth.uid() = user_id);

-- Tool usage logs policies
CREATE POLICY "Users can view their own usage logs" ON tool_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage logs" ON tool_usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tool versions policies
CREATE POLICY "Users can view versions of their tools" ON tool_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tools 
      WHERE tools.id = tool_versions.tool_id 
      AND tools.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions of their tools" ON tool_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tools 
      WHERE tools.id = tool_versions.tool_id 
      AND tools.user_id = auth.uid()
    )
  );

-- AI conversations policies
CREATE POLICY "Users can view their own conversations" ON ai_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" ON ai_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON ai_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" ON ai_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_tools_updated_at 
  BEFORE UPDATE ON tools 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at 
  BEFORE UPDATE ON ai_conversations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create tool version on update
CREATE OR REPLACE FUNCTION create_tool_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create version if config actually changed
  IF OLD.config IS DISTINCT FROM NEW.config THEN
    INSERT INTO tool_versions (tool_id, version_number, config, created_by)
    VALUES (
      NEW.id,
      COALESCE((
        SELECT MAX(version_number) + 1 
        FROM tool_versions 
        WHERE tool_id = NEW.id
      ), 1),
      NEW.config,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-create versions
CREATE TRIGGER create_tool_version_trigger
  AFTER UPDATE ON tools
  FOR EACH ROW EXECUTE FUNCTION create_tool_version();

-- Function to log tool usage
CREATE OR REPLACE FUNCTION log_tool_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO tool_usage_logs (tool_id, user_id, action, metadata)
    VALUES (NEW.id, NEW.user_id, 'created', jsonb_build_object('tool_type', NEW.type));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO tool_usage_logs (tool_id, user_id, action, metadata)
    VALUES (NEW.id, NEW.user_id, 'updated', jsonb_build_object('changes', 'config_updated'));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO tool_usage_logs (tool_id, user_id, action, metadata)
    VALUES (OLD.id, OLD.user_id, 'deleted', jsonb_build_object('tool_type', OLD.type));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers for usage logging
CREATE TRIGGER log_tool_usage_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tools
  FOR EACH ROW EXECUTE FUNCTION log_tool_usage();

-- Views for analytics

-- Tool usage summary view
CREATE OR REPLACE VIEW tool_usage_summary AS
SELECT 
  t.user_id,
  t.type,
  t.industry,
  COUNT(*) as tool_count,
  COUNT(CASE WHEN t.public THEN 1 END) as public_tools,
  MAX(t.created_at) as last_created,
  COUNT(tul.id) as total_usage_events
FROM tools t
LEFT JOIN tool_usage_logs tul ON t.id = tul.tool_id
GROUP BY t.user_id, t.type, t.industry;

-- Popular tools view (for public tools)
CREATE OR REPLACE VIEW popular_tools AS
SELECT 
  t.id,
  t.name,
  t.type,
  t.industry,
  t.description,
  COUNT(tul.id) as usage_count,
  COUNT(DISTINCT tul.user_id) as unique_users
FROM tools t
LEFT JOIN tool_usage_logs tul ON t.id = tul.tool_id
WHERE t.public = true
GROUP BY t.id, t.name, t.type, t.industry, t.description
ORDER BY usage_count DESC, unique_users DESC;

-- Grant permissions for views
GRANT SELECT ON tool_usage_summary TO authenticated;
GRANT SELECT ON popular_tools TO authenticated;

-- RLS for views (inherit from base tables)
ALTER VIEW tool_usage_summary SET (security_invoker = true);
ALTER VIEW popular_tools SET (security_invoker = true); 