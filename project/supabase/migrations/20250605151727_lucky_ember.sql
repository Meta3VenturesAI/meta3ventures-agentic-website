/*
  # Enhanced Schema for Blog and Analytics

  1. New Tables
    - blog_authors: Store author information
    - blog_categories: Manage blog categories
    - analytics_events: Track detailed user interactions
  
  2. Changes
    - Add foreign key relationships
    - Add additional tracking fields
    - Enhance existing tables
    
  3. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Blog Authors Table
CREATE TABLE IF NOT EXISTS blog_authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  bio text,
  avatar_url text,
  social_links jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_authors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public users can view authors"
  ON blog_authors
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage authors"
  ON blog_authors
  USING (auth.role() = 'authenticated');

-- Blog Categories Table
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public users can view categories"
  ON blog_categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage categories"
  ON blog_categories
  USING (auth.role() = 'authenticated');

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  user_id uuid REFERENCES auth.users(id),
  session_id text NOT NULL,
  page_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert events"
  ON analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view events"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS analytics_events_type_idx ON analytics_events (event_type);
CREATE INDEX IF NOT EXISTS analytics_events_session_idx ON analytics_events (session_id);
CREATE INDEX IF NOT EXISTS analytics_events_created_idx ON analytics_events (created_at);

-- Enhance existing blog_posts table
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS meta_keywords text[],
  ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES blog_authors(id),
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES blog_categories(id);

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to blog_posts
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to blog_authors
CREATE TRIGGER update_blog_authors_updated_at
  BEFORE UPDATE ON blog_authors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enhance page_views table
ALTER TABLE page_views
  ADD COLUMN IF NOT EXISTS user_agent text,
  ADD COLUMN IF NOT EXISTS ip_address text,
  ADD COLUMN IF NOT EXISTS device_type text,
  ADD COLUMN IF NOT EXISTS country_code text;

-- Enhance leads table
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS last_contacted timestamptz,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];