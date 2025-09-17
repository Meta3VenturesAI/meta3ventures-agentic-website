/*
  # Blog System Schema

  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `excerpt` (text)
      - `content` (text)
      - `image` (text)
      - `author_id` (uuid, references auth.users)
      - `category` (text)
      - `tags` (text[])
      - `read_time` (text)
      - `published` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `blog_posts` table
    - Add policies for authenticated users to manage posts
*/

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  image text NOT NULL,
  author_id uuid REFERENCES auth.users NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  read_time text NOT NULL,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all posts
CREATE POLICY "Anyone can read published posts"
  ON blog_posts
  FOR SELECT
  USING (published = true OR auth.uid() = author_id);

-- Allow authenticated users to create posts
CREATE POLICY "Authenticated users can create posts"
  ON blog_posts
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Allow users to update their own posts
CREATE POLICY "Users can update own posts"
  ON blog_posts
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Allow users to delete their own posts
CREATE POLICY "Users can delete own posts"
  ON blog_posts
  FOR DELETE
  USING (auth.uid() = author_id);