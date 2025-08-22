-- Additional database tables for AI Content Team workflows

-- Content Topics and Planning
CREATE TABLE content_topics (
  id SERIAL PRIMARY KEY,
  request_id VARCHAR(255) UNIQUE,
  topics_data JSONB,
  categorized_topics JSONB,
  recommendations JSONB,
  analysis_summary JSONB,
  status VARCHAR(50) DEFAULT 'generated',
  submission_type VARCHAR(50) DEFAULT 'automatic',
  submitted_by VARCHAR(255),
  fast_track BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Research and Knowledge Management
CREATE TABLE content_research (
  id SERIAL PRIMARY KEY,
  research_id VARCHAR(255) UNIQUE,
  topic_batch_id INTEGER REFERENCES content_topics(id),
  topic_title VARCHAR(500),
  research_findings JSONB,
  content_brief TEXT,
  research_depth VARCHAR(50) DEFAULT 'comprehensive',
  confidence_score DECIMAL(3,1) DEFAULT 8.0,
  validation_report TEXT,
  validation_date TIMESTAMP,
  validation_status VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Content Drafts and Writing
CREATE TABLE content_drafts (
  id SERIAL PRIMARY KEY,
  content_id VARCHAR(255) UNIQUE,
  research_id VARCHAR(255),
  title VARCHAR(500),
  content_html TEXT,
  content_markdown TEXT,
  metadata JSONB,
  seo_elements JSONB,
  quality_report TEXT,
  revision_count INTEGER DEFAULT 0,
  revision_notes TEXT,
  last_revised TIMESTAMP,
  status VARCHAR(50) DEFAULT 'draft',
  word_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Publishing and Distribution
CREATE TABLE content_publications (
  id SERIAL PRIMARY KEY,
  content_id VARCHAR(255),
  blog_url TEXT,
  social_post_ids JSONB,
  email_campaign_id VARCHAR(255),
  publication_date TIMESTAMP,
  distribution_channels JSONB,
  analytics_setup JSONB,
  status VARCHAR(50) DEFAULT 'published',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Performance Analytics
CREATE TABLE content_performance (
  id SERIAL PRIMARY KEY,
  content_id VARCHAR(255),
  metrics_data JSONB,
  performance_score INTEGER,
  analysis_insights TEXT,
  recommendations JSONB,
  analysis_date TIMESTAMP DEFAULT NOW()
);

-- Content Calendar and Scheduling
CREATE TABLE content_calendar (
  id SERIAL PRIMARY KEY,
  content_id VARCHAR(255),
  topic_title VARCHAR(500),
  scheduled_date DATE,
  content_type VARCHAR(100),
  priority VARCHAR(50),
  status VARCHAR(50) DEFAULT 'scheduled',
  assigned_to VARCHAR(255),
  content_pillar VARCHAR(200),
  target_audience VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Team Performance and Analytics
CREATE TABLE team_analytics (
  id SERIAL PRIMARY KEY,
  date DATE,
  agent_type VARCHAR(100), -- topic_generation, research, writing, publishing
  metrics JSONB,
  performance_score INTEGER,
  content_produced INTEGER DEFAULT 0,
  average_quality_score DECIMAL(3,1),
  processing_time_minutes INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bulk Operations Tracking
CREATE TABLE bulk_operations (
  id SERIAL PRIMARY KEY,
  batch_id VARCHAR(255) UNIQUE,
  operation_type VARCHAR(100), -- bulk_topics, bulk_research, bulk_writing, bulk_publishing
  total_items INTEGER,
  completed_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'processing',
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  configuration JSONB,
  results JSONB
);

-- Content Templates and Reusable Assets
CREATE TABLE content_templates (
  id SERIAL PRIMARY KEY,
  template_name VARCHAR(255),
  template_type VARCHAR(100), -- topic_template, research_template, writing_template
  template_data JSONB,
  usage_count INTEGER DEFAULT 0,
  performance_rating DECIMAL(3,1),
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge Base Enhancements
CREATE TABLE knowledge_sources (
  id SERIAL PRIMARY KEY,
  source_id VARCHAR(255) UNIQUE,
  source_type VARCHAR(100), -- research_findings, expert_interview, industry_report, case_study
  source_url TEXT,
  content_summary TEXT,
  metadata JSONB,
  reliability_score DECIMAL(3,1),
  last_updated TIMESTAMP,
  expiration_date TIMESTAMP,
  tags JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Content Workflows and Automation
CREATE TABLE content_workflows (
  id SERIAL PRIMARY KEY,
  workflow_name VARCHAR(255),
  workflow_type VARCHAR(100), -- topic_to_publish, research_only, writing_only
  configuration JSONB,
  success_rate DECIMAL(5,2),
  average_completion_time INTEGER, -- minutes
  last_executed TIMESTAMP,
  execution_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_content_topics_status ON content_topics(status);
CREATE INDEX idx_content_topics_fast_track ON content_topics(fast_track);
CREATE INDEX idx_content_research_status ON content_research(status);
CREATE INDEX idx_content_research_topic_batch ON content_research(topic_batch_id);
CREATE INDEX idx_content_drafts_status ON content_drafts(status);
CREATE INDEX idx_content_drafts_research_id ON content_drafts(research_id);
CREATE INDEX idx_content_publications_publication_date ON content_publications(publication_date);
CREATE INDEX idx_content_performance_content_id ON content_performance(content_id);
CREATE INDEX idx_content_calendar_scheduled_date ON content_calendar(scheduled_date);
CREATE INDEX idx_content_calendar_status ON content_calendar(status);
CREATE INDEX idx_team_analytics_date ON team_analytics(date);
CREATE INDEX idx_team_analytics_agent_type ON team_analytics(agent_type);
CREATE INDEX idx_bulk_operations_status ON bulk_operations(status);
CREATE INDEX idx_knowledge_sources_source_type ON knowledge_sources(source_type);
CREATE INDEX idx_knowledge_sources_tags ON knowledge_sources USING GIN(tags);

-- Sample data for testing
INSERT INTO content_templates (template_name, template_type, template_data, created_by) VALUES
('AI Automation Blog Post', 'writing_template', '{"structure": {"introduction": "Hook + Context + Value Prop", "main_sections": ["Problem Overview", "Solution Deep-dive", "Implementation Guide", "Results & Benefits"], "conclusion": "Summary + CTA"}, "tone": "professional, approachable", "target_length": 1500}', 'system'),
('Tech Industry Research', 'research_template', '{"sources": ["industry_reports", "expert_interviews", "case_studies"], "validation_criteria": ["credibility", "recency", "relevance"], "depth": "comprehensive"}', 'system'),
('Lead Generation Topic', 'topic_template', '{"content_angle": "problem_solution", "target_audience": "business_decision_makers", "content_goals": ["lead_generation", "thought_leadership"], "cta_type": "consultation"}', 'system');

-- Sample content calendar entries
INSERT INTO content_calendar (content_id, topic_title, scheduled_date, content_type, priority, content_pillar, target_audience) VALUES
('demo_content_1', 'How AI Automation Transforms Business Operations', CURRENT_DATE + INTERVAL '1 day', 'blog_post', 'high', 'AI automation', 'business_owners'),
('demo_content_2', '10 Signs Your Business Needs Process Automation', CURRENT_DATE + INTERVAL '3 days', 'blog_post', 'medium', 'business_efficiency', 'entrepreneurs'),
('demo_content_3', 'Case Study: 300% ROI with Custom AI Workflows', CURRENT_DATE + INTERVAL '5 days', 'case_study', 'high', 'success_stories', 'potential_customers');
