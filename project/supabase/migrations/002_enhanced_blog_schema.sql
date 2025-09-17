-- Enhanced Blog Schema for Meta3Ventures
-- This migration creates a comprehensive blog system with all necessary tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm" FOR SCHEMA public;

-- Authors table
CREATE TABLE IF NOT EXISTS authors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    email VARCHAR(255),
    twitter_handle VARCHAR(100),
    linkedin_url TEXT,
    github_url TEXT,
    website_url TEXT,
    expertise TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    color VARCHAR(7), -- Hex color for UI
    icon VARCHAR(50), -- Icon name for UI
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog posts table (enhanced)
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    featured_image TEXT,
    featured_image_alt VARCHAR(255),
    thumbnail_image TEXT,
    author_id UUID NOT NULL REFERENCES authors(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    -- SEO fields
    meta_title VARCHAR(100),
    meta_description VARCHAR(160),
    meta_keywords TEXT[],
    canonical_url TEXT,
    og_image TEXT,
    og_title VARCHAR(100),
    og_description VARCHAR(200),
    
    -- Publishing fields
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
    published_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ,
    featured BOOLEAN DEFAULT false,
    featured_order INTEGER,
    allow_comments BOOLEAN DEFAULT true,
    
    -- Analytics fields
    view_count INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    avg_read_time INTEGER, -- in seconds
    share_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    
    -- Content fields
    reading_time INTEGER, -- estimated minutes
    word_count INTEGER,
    toc JSONB, -- Table of contents structure
    related_posts UUID[],
    
    -- Additional metadata
    custom_css TEXT,
    custom_js TEXT,
    schema_markup JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft delete
);

-- Blog post tags (many-to-many)
CREATE TABLE IF NOT EXISTS blog_post_tags (
    blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (blog_post_id, tag_id)
);

-- Blog post revisions (version control)
CREATE TABLE IF NOT EXISTS blog_post_revisions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    title VARCHAR(500),
    content TEXT,
    excerpt TEXT,
    revision_number INTEGER NOT NULL,
    revision_notes TEXT,
    revised_by UUID REFERENCES authors(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS blog_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    author_website TEXT,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    is_spam BOOLEAN DEFAULT false,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog analytics events
CREATE TABLE IF NOT EXISTS blog_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'view', 'like', 'share', 'comment', 'read_complete'
    event_data JSONB,
    visitor_id VARCHAR(255),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    country_code VARCHAR(2),
    device_type VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    preferences JSONB DEFAULT '{"frequency": "weekly", "categories": []}'::jsonb,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced', 'pending')),
    verification_token VARCHAR(255),
    verified_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    source VARCHAR(50), -- 'blog', 'homepage', 'popup', etc.
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    template VARCHAR(50),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    recipient_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX idx_blog_posts_featured ON blog_posts(featured) WHERE featured = true;
CREATE INDEX idx_blog_posts_search ON blog_posts USING gin(to_tsvector('english', title || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, '')));

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_authors_slug ON authors(slug);
CREATE INDEX idx_blog_analytics_post ON blog_analytics(blog_post_id);
CREATE INDEX idx_blog_analytics_created ON blog_analytics(created_at DESC);
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_status ON newsletter_subscribers(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON authors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_comments_updated_at BEFORE UPDATE ON blog_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_subscribers_updated_at BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE blog_posts 
    SET view_count = view_count + 1 
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate reading time
CREATE OR REPLACE FUNCTION calculate_reading_time(content TEXT)
RETURNS INTEGER AS $$
DECLARE
    word_count INTEGER;
    reading_speed INTEGER := 200; -- Average words per minute
BEGIN
    word_count := array_length(string_to_array(content, ' '), 1);
    RETURN CEIL(word_count::DECIMAL / reading_speed);
END;
$$ LANGUAGE plpgsql;

-- Function to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tag_count_on_insert
AFTER INSERT ON blog_post_tags
FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

CREATE TRIGGER update_tag_count_on_delete
AFTER DELETE ON blog_post_tags
FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- Row Level Security (RLS) Policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public read access for published posts
CREATE POLICY "Public can view published posts" ON blog_posts
    FOR SELECT USING (status = 'published' AND deleted_at IS NULL);

-- Authors can manage their own posts
CREATE POLICY "Authors can manage own posts" ON blog_posts
    FOR ALL USING (auth.uid() IN (SELECT user_id FROM authors WHERE id = author_id));

-- Public can view active categories and tags
CREATE POLICY "Public can view active categories" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view tags" ON tags
    FOR SELECT USING (true);

-- Public can view active authors
CREATE POLICY "Public can view active authors" ON authors
    FOR SELECT USING (is_active = true);

-- Public can view approved comments
CREATE POLICY "Public can view approved comments" ON blog_comments
    FOR SELECT USING (is_approved = true AND is_spam = false);

-- Insert sample data
INSERT INTO authors (name, slug, bio, email, expertise) VALUES
    ('Liron Langer', 'liron-langer', 'CEO & Founder of Meta3Ventures. AI enthusiast and venture capitalist.', 'liron@meta3ventures.com', ARRAY['AI', 'Venture Capital', 'Blockchain']),
    ('Meta3 Team', 'meta3-team', 'The collective voice of Meta3Ventures team.', 'team@meta3ventures.com', ARRAY['AI', 'Technology', 'Innovation']);

INSERT INTO categories (name, slug, description, color, display_order) VALUES
    ('AI Insights', 'ai-insights', 'Deep dives into artificial intelligence trends and technologies', '#4F46E5', 1),
    ('Investment Perspectives', 'investment-perspectives', 'Analysis and insights on venture capital and startup investments', '#10B981', 2),
    ('Portfolio Updates', 'portfolio-updates', 'News and updates from our portfolio companies', '#F59E0B', 3),
    ('Industry Analysis', 'industry-analysis', 'Market trends and industry deep dives', '#EF4444', 4),
    ('Thought Leadership', 'thought-leadership', 'Strategic insights and forward-thinking perspectives', '#8B5CF6', 5);

INSERT INTO tags (name, slug) VALUES
    ('Artificial Intelligence', 'artificial-intelligence'),
    ('Machine Learning', 'machine-learning'),
    ('Venture Capital', 'venture-capital'),
    ('Startups', 'startups'),
    ('Innovation', 'innovation'),
    ('Blockchain', 'blockchain'),
    ('Digital Transformation', 'digital-transformation'),
    ('Deep Tech', 'deep-tech'),
    ('SaaS', 'saas'),
    ('Fintech', 'fintech');

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;