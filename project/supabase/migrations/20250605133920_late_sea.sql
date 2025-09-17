/*
  # Analytics Tables Setup

  1. New Tables
    - `page_views`: Tracks page visits and user sessions
      - `id` (uuid, primary key)
      - `page` (text)
      - `timestamp` (timestamptz)
      - `session_id` (text)
      - `referrer` (text, nullable)
      - `utm_source` (text, nullable)
      - `utm_medium` (text, nullable)
      - `utm_campaign` (text, nullable)
      - `duration_ms` (integer, nullable)
    
    - `leads`: Stores lead information
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `company` (text, nullable)
      - `interest` (text)
      - `source` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read and insert data

  3. Performance
    - Add indexes for commonly queried columns
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can read page views" ON page_views;
  DROP POLICY IF EXISTS "Authenticated users can insert page views" ON page_views;
  DROP POLICY IF EXISTS "Authenticated users can read leads" ON leads;
  DROP POLICY IF EXISTS "Authenticated users can insert leads" ON leads;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Page Views Table
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  session_id text NOT NULL,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  duration_ms integer
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert page views"
  ON page_views
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read page views"
  ON page_views
  FOR SELECT
  TO authenticated
  USING (true);

-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  interest text NOT NULL,
  source text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert leads"
  ON leads
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (true);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS page_views_timestamp_idx ON page_views (timestamp);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at);
CREATE INDEX IF NOT EXISTS page_views_session_id_idx ON page_views (session_id);