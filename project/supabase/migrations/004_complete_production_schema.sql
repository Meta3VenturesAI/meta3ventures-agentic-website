-- Complete Production Schema for Meta3Ventures
-- This migration creates all required tables for production deployment

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Page Views Table (for analytics)
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  page TEXT NOT NULL,
  session_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  referrer TEXT,
  duration_ms INTEGER,
  user_agent TEXT,
  device_type TEXT,
  country_code TEXT,
  ip_address TEXT
);

-- Leads Table (for lead management)
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  interest TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'website',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  notes TEXT,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  last_contacted TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts Table (for content management)
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author TEXT DEFAULT 'Meta3Ventures Team',
  category TEXT DEFAULT 'insights',
  tags TEXT[] DEFAULT '{}'::TEXT[],
  featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  meta_description TEXT,
  meta_keywords TEXT[],
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Form Submissions Table (enhanced version)
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('contact', 'apply', 'newsletter', 'chat', 'partnership', 'media', 'investor')),
  data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'processing', 'responded', 'archived')),
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Events Table (enhanced version)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::JSONB,
  user_id UUID,
  session_id TEXT NOT NULL,
  page_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Conversations Table (for AI assistant)
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_message TEXT,
  assistant_message TEXT,
  agent_id TEXT,
  context JSONB DEFAULT '{}'::JSONB,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Application Submissions Table (for funding applications)
CREATE TABLE IF NOT EXISTS application_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_name TEXT NOT NULL,
  founder_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  stage TEXT NOT NULL,
  industry TEXT NOT NULL,
  funding_amount DECIMAL,
  pitch_deck_url TEXT,
  business_plan_url TEXT,
  form_data JSONB NOT NULL,
  attached_files JSONB DEFAULT '{}'::JSONB,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'review', 'interview', 'due_diligence', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Sessions Table (for tracking)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  country_code TEXT,
  device_type TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  page_views_count INTEGER DEFAULT 0,
  duration_ms INTEGER DEFAULT 0
);

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page ON page_views(page);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

CREATE INDEX IF NOT EXISTS idx_form_submissions_type ON form_submissions(type);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created ON form_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_session ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created ON chat_conversations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_application_submissions_status ON application_submissions(status);
CREATE INDEX IF NOT EXISTS idx_application_submissions_created ON application_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started ON user_sessions(started_at DESC);

-- Enable Row Level Security on all tables
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access to necessary data
-- Page views - allow anonymous tracking
CREATE POLICY "Allow anonymous page view tracking" ON page_views
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view page views" ON page_views
  FOR SELECT TO authenticated USING (true);

-- Leads - allow anonymous form submissions
CREATE POLICY "Allow anonymous lead submissions" ON leads
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage leads" ON leads
  FOR ALL TO authenticated USING (true);

-- Blog posts - public read access
CREATE POLICY "Allow public blog post reading" ON blog_posts
  FOR SELECT TO public USING (status = 'published');

CREATE POLICY "Allow authenticated users to manage blog posts" ON blog_posts
  FOR ALL TO authenticated USING (true);

-- Form submissions - allow anonymous submissions
CREATE POLICY "Allow anonymous form submissions" ON form_submissions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage form submissions" ON form_submissions
  FOR ALL TO authenticated USING (true);

-- Analytics events - allow anonymous tracking
CREATE POLICY "Allow anonymous analytics tracking" ON analytics_events
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view analytics" ON analytics_events
  FOR SELECT TO authenticated USING (true);

-- Chat conversations - allow anonymous chat
CREATE POLICY "Allow anonymous chat conversations" ON chat_conversations
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view conversations" ON chat_conversations
  FOR SELECT TO authenticated USING (true);

-- Application submissions - allow anonymous applications
CREATE POLICY "Allow anonymous application submissions" ON application_submissions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage applications" ON application_submissions
  FOR ALL TO authenticated USING (true);

-- User sessions - allow anonymous session tracking
CREATE POLICY "Allow anonymous session tracking" ON user_sessions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view sessions" ON user_sessions
  FOR SELECT TO authenticated USING (true);

-- Create functions for common operations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_submissions_updated_at
  BEFORE UPDATE ON form_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_application_submissions_updated_at
  BEFORE UPDATE ON application_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create analytics helper functions
CREATE OR REPLACE FUNCTION get_analytics_summary(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalPageViews', (SELECT COUNT(*) FROM page_views WHERE timestamp BETWEEN start_date AND end_date),
    'uniqueVisitors', (SELECT COUNT(DISTINCT session_id) FROM page_views WHERE timestamp BETWEEN start_date AND end_date),
    'totalLeads', (SELECT COUNT(*) FROM leads WHERE created_at BETWEEN start_date AND end_date),
    'totalApplications', (SELECT COUNT(*) FROM application_submissions WHERE created_at BETWEEN start_date AND end_date),
    'conversionRate', CASE 
      WHEN (SELECT COUNT(*) FROM page_views WHERE timestamp BETWEEN start_date AND end_date) > 0 
      THEN ROUND((SELECT COUNT(*) FROM leads WHERE created_at BETWEEN start_date AND end_date)::DECIMAL / 
                 (SELECT COUNT(*) FROM page_views WHERE timestamp BETWEEN start_date AND end_date) * 100, 2)
      ELSE 0 
    END
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get submission statistics
CREATE OR REPLACE FUNCTION get_submission_stats()
RETURNS TABLE (
  submission_type TEXT,
  count BIGINT,
  last_submission TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    type as submission_type,
    COUNT(*) as count,
    MAX(created_at) as last_submission
  FROM form_submissions
  GROUP BY type
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample blog posts for demo
INSERT INTO blog_posts (title, slug, excerpt, content, category, tags, featured) VALUES
(
  'The Future of AI in Venture Capital',
  'ai-future-venture-capital',
  'How artificial intelligence is transforming the venture capital landscape and investment decision-making.',
  '# The Future of AI in Venture Capital

Artificial intelligence is revolutionizing every industry, and venture capital is no exception. From deal sourcing to due diligence, AI is transforming how we identify and evaluate investment opportunities.

## Key Trends

1. **Automated Deal Sourcing**: AI algorithms scan thousands of startups to identify promising opportunities
2. **Enhanced Due Diligence**: Machine learning models analyze financial data, market trends, and team performance
3. **Portfolio Management**: AI tools help monitor portfolio company performance and predict outcomes

The future belongs to firms that can effectively leverage AI while maintaining the human insight that drives great investments.',
  'insights',
  ARRAY['AI', 'VentureCapital', 'Technology'],
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO blog_posts (title, slug, excerpt, content, category, tags) VALUES
(
  'Building Successful SaaS Startups in 2024',
  'successful-saas-startups-2024',
  'Essential strategies for building and scaling SaaS companies in today''s competitive market.',
  '# Building Successful SaaS Startups in 2024

The SaaS market continues to evolve rapidly. Here are the key factors that separate successful SaaS startups from the rest.

## Core Success Factors

- **Product-Market Fit**: Understanding your customers deeply
- **Unit Economics**: Strong LTV/CAC ratios
- **Scalable Architecture**: Building for growth from day one
- **Team Excellence**: Hiring and retaining top talent

Success in SaaS requires discipline, focus, and relentless execution.',
  'startup-guide',
  ARRAY['SaaS', 'Startups', 'Growth']
) ON CONFLICT (slug) DO NOTHING;

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON blog_posts TO anon;
GRANT INSERT ON page_views TO anon;
GRANT INSERT ON leads TO anon;
GRANT INSERT ON form_submissions TO anon;
GRANT INSERT ON analytics_events TO anon;
GRANT INSERT ON chat_conversations TO anon;
GRANT INSERT ON application_submissions TO anon;
GRANT INSERT ON user_sessions TO anon;

-- Create admin user function for initial setup
CREATE OR REPLACE FUNCTION setup_admin_user(admin_email TEXT)
RETURNS TEXT AS $$
BEGIN
  -- This is a placeholder for admin user setup
  -- In production, admin users should be created through Supabase Auth
  RETURN 'Admin user setup completed for: ' || admin_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;