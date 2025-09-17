-- Create tables for form submissions and analytics
-- This migration adds tables needed for the data storage service

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Form submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('contact', 'apply', 'newsletter', 'chat')),
  data JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  user_id UUID,
  session_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat conversations table (for virtual assistant)
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  user_message TEXT,
  assistant_message TEXT,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_form_submissions_type ON form_submissions(type);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created ON form_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session ON chat_conversations(session_id);

-- Enable Row Level Security
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Allow authenticated users to insert form submissions
CREATE POLICY "Users can insert form submissions" ON form_submissions
  FOR INSERT 
  WITH CHECK (true);

-- Allow authenticated users to view their own submissions
CREATE POLICY "Users can view form submissions" ON form_submissions
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert analytics events
CREATE POLICY "Users can insert analytics events" ON analytics_events
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to view analytics events
CREATE POLICY "Users can view analytics events" ON analytics_events
  FOR SELECT
  USING (true);

-- Allow users to insert chat conversations
CREATE POLICY "Users can insert chat conversations" ON chat_conversations
  FOR INSERT
  WITH CHECK (true);

-- Allow users to view chat conversations
CREATE POLICY "Users can view chat conversations" ON chat_conversations
  FOR SELECT
  USING (true);

-- Create a function to get submission statistics
CREATE OR REPLACE FUNCTION get_submission_stats()
RETURNS TABLE (
  submission_type VARCHAR(50),
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    type as submission_type,
    COUNT(*) as count
  FROM form_submissions
  GROUP BY type;
END;
$$ LANGUAGE plpgsql;

-- Create a function to clean old data (data retention)
CREATE OR REPLACE FUNCTION clean_old_submissions(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM form_submissions 
  WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  DELETE FROM analytics_events 
  WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON form_submissions TO authenticated;
GRANT ALL ON analytics_events TO authenticated;
GRANT ALL ON chat_conversations TO authenticated;
GRANT SELECT ON form_submissions TO anon;
GRANT SELECT ON analytics_events TO anon;

-- Insert sample data for testing (optional)
/*
INSERT INTO form_submissions (type, data, metadata) VALUES
  ('contact', '{"name": "Test User", "email": "test@example.com", "message": "Test message"}'::jsonb, '{"source": "test"}'::jsonb),
  ('newsletter', '{"email": "subscriber@example.com"}'::jsonb, '{"source": "footer"}'::jsonb),
  ('apply', '{"companyName": "Test Company", "founderName": "John Doe", "email": "john@testcompany.com"}'::jsonb, '{"source": "apply_page"}'::jsonb);
*/