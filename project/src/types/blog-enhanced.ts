// Enhanced blog types for the new Supabase schema

export interface Author {
  id: string;
  user_id?: string;
  name: string;
  slug: string;
  bio?: string;
  avatar_url?: string;
  email?: string;
  twitter_handle?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  expertise: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  color?: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent?: Category;
  children?: Category[];
  post_count?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  usage_count: number;
  created_at: string;
}

export interface BlogPostSEO {
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  canonical_url?: string;
  og_image?: string;
  og_title?: string;
  og_description?: string;
}

export interface BlogPostAnalytics {
  view_count: number;
  unique_visitors: number;
  avg_read_time: number;
  share_count: number;
  like_count: number;
}

export interface TableOfContents {
  id: string;
  title: string;
  level: number;
  children?: TableOfContents[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  featured_image_alt?: string;
  thumbnail_image?: string;
  author_id: string;
  author?: Author;
  category_id?: string;
  category?: Category;
  tags?: Tag[];
  
  // SEO
  seo?: BlogPostSEO;
  
  // Publishing
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  published_at?: string;
  scheduled_for?: string;
  featured: boolean;
  featured_order?: number;
  allow_comments: boolean;
  
  // Analytics
  analytics?: BlogPostAnalytics;
  
  // Content
  reading_time?: number;
  word_count?: number;
  toc?: TableOfContents[];
  related_posts?: string[];
  
  // Metadata
  custom_css?: string;
  custom_js?: string;
  schema_markup?: unknown;
  
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface BlogComment {
  id: string;
  blog_post_id: string;
  parent_id?: string;
  author_name: string;
  author_email: string;
  author_website?: string;
  content: string;
  is_approved: boolean;
  is_spam: boolean;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
  replies?: BlogComment[];
}

export interface BlogRevision {
  id: string;
  blog_post_id: string;
  title?: string;
  content?: string;
  excerpt?: string;
  revision_number: number;
  revision_notes?: string;
  revised_by?: string;
  created_at: string;
}

export interface BlogAnalyticsEvent {
  id: string;
  blog_post_id: string;
  event_type: 'view' | 'like' | 'share' | 'comment' | 'read_complete';
  event_data?: unknown;
  visitor_id?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  country_code?: string;
  device_type?: string;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  preferences: {
    frequency: 'daily' | 'weekly' | 'monthly';
    categories: string[];
  };
  status: 'active' | 'unsubscribed' | 'bounced' | 'pending';
  verification_token?: string;
  verified_at?: string;
  unsubscribed_at?: string;
  source?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  template?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  scheduled_for?: string;
  sent_at?: string;
  recipient_count: number;
  open_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
}

// Form data types for creating/updating
export interface BlogPostFormData {
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  featured_image_alt?: string;
  author_id: string;
  category_id?: string;
  tag_ids?: string[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  published_at?: string;
  scheduled_for?: string;
  featured?: boolean;
  allow_comments?: boolean;
}

export interface BlogFilters {
  search?: string;
  category?: string;
  tags?: string[];
  author?: string;
  status?: 'draft' | 'published' | 'scheduled' | 'archived';
  featured?: boolean;
  date_from?: string;
  date_to?: string;
  sort_by?: 'date' | 'views' | 'likes' | 'comments';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface BlogStats {
  total_posts: number;
  total_views: number;
  total_comments: number;
  total_shares: number;
  total_likes: number;
  avg_read_time: number;
  top_posts: BlogPost[];
  recent_comments: BlogComment[];
  popular_tags: Tag[];
  author_stats: {
    author: Author;
    post_count: number;
    total_views: number;
  }[];
}