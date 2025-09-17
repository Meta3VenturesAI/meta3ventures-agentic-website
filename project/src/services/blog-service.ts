// Enhanced blog service for Supabase integration
import { supabase } from '../lib/supabase';
import type {
  BlogPost,
  BlogPostFormData,
  BlogFilters,
  Category,
  Tag,
  Author,
  BlogComment,
  BlogStats,
  NewsletterSubscriber,
  BlogAnalyticsEvent,
  BlogPostAnalytics
} from '../types/blog-enhanced';

export class BlogService {
  // ============= POSTS =============
  
  async getPosts(filters: BlogFilters = {}): Promise<{ data: BlogPost[], count: number }> {
    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        author:authors(*),
        category:categories(*),
        tags:blog_post_tags(tag:tags(*))
      `, { count: 'exact' });

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }
    
    if (filters.category) {
      query = query.eq('category_id', filters.category);
    }
    
    if (filters.author) {
      query = query.eq('author_id', filters.author);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    } else {
      // Default to published posts for public
      query = query.eq('status', 'published');
    }
    
    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured);
    }
    
    if (filters.date_from) {
      query = query.gte('published_at', filters.date_from);
    }
    
    if (filters.date_to) {
      query = query.lte('published_at', filters.date_to);
    }
    
    // Sorting
    const sortColumn = {
      date: 'published_at',
      views: 'view_count',
      likes: 'like_count',
      comments: 'comment_count'
    }[filters.sort_by || 'date'];
    
    query = query.order(sortColumn, { ascending: filters.sort_order === 'asc' });
    
    // Pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Transform the data to match our type
    const posts = data?.map((post: unknown) => ({
      ...post,
      tags: post.tags?.map((t: unknown) => t.tag) || []
    })) || [];
    
    return { data: posts, count: count || 0 };
  }
  
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        author:authors(*),
        category:categories(*),
        tags:blog_post_tags(tag:tags(*))
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();
    
    if (error) {
      console.error('Error fetching post:', error);
      return null;
    }
    
    // Transform tags
    const post = {
      ...data,
      tags: data.tags?.map((t: unknown) => t.tag) || []
    };
    
    // Track view
    await this.trackView(data.id);
    
    return post;
  }
  
  async createPost(postData: BlogPostFormData): Promise<BlogPost> {
    const { tag_ids, ...postFields } = postData;
    
    // Generate slug if not provided
    const slug = this.generateSlug(postData.title);
    
    // Calculate reading time
    const reading_time = this.calculateReadingTime(postData.content);
    const word_count = postData.content.split(/\s+/).length;
    
    // Insert the post
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .insert({
        ...postFields,
        slug,
        reading_time,
        word_count,
        toc: this.generateTableOfContents(postData.content)
      })
      .select()
      .single();
    
    if (postError) throw postError;
    
    // Add tags if provided
    if (tag_ids && tag_ids.length > 0) {
      const tagRelations = tag_ids.map(tag_id => ({
        blog_post_id: post.id,
        tag_id
      }));
      
      const { error: tagError } = await supabase
        .from('blog_post_tags')
        .insert(tagRelations);
      
      if (tagError) throw tagError;
    }
    
    return post;
  }
  
  async updatePost(id: string, postData: Partial<BlogPostFormData>): Promise<BlogPost> {
    const { tag_ids, ...postFields } = postData;
    
    // Update reading time if content changed
    if (postData.content) {
      (postFields as unknown).reading_time = this.calculateReadingTime(postData.content);
      (postFields as unknown).word_count = postData.content.split(/\s+/).length;
      (postFields as unknown).toc = this.generateTableOfContents(postData.content);
    }
    
    // Update the post
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .update(postFields)
      .eq('id', id)
      .select()
      .single();
    
    if (postError) throw postError;
    
    // Update tags if provided
    if (tag_ids !== undefined) {
      // Remove existing tags
      await supabase
        .from('blog_post_tags')
        .delete()
        .eq('blog_post_id', id);
      
      // Add new tags
      if (tag_ids.length > 0) {
        const tagRelations = tag_ids.map(tag_id => ({
          blog_post_id: id,
          tag_id
        }));
        
        const { error: tagError } = await supabase
          .from('blog_post_tags')
          .insert(tagRelations);
        
        if (tagError) throw tagError;
      }
    }
    
    return post;
  }
  
  async deletePost(id: string): Promise<void> {
    // Soft delete by setting deleted_at
    const { error } = await supabase
      .from('blog_posts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  }
  
  // ============= CATEGORIES =============
  
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    
    if (error) throw error;
    
    return data || [];
  }
  
  async createCategory(category: Partial<Category>): Promise<Category> {
    const slug = category.slug || this.generateSlug(category.name!);
    
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...category, slug })
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  }
  
  // ============= TAGS =============
  
  async getTags(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('usage_count', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  }
  
  async createTag(name: string): Promise<Tag> {
    const slug = this.generateSlug(name);
    
    const { data, error } = await supabase
      .from('tags')
      .insert({ name, slug })
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  }
  
  async getPopularTags(limit: number = 10): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  }
  
  // ============= AUTHORS =============
  
  async getAuthors(): Promise<Author[]> {
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;
    
    return data || [];
  }
  
  async getAuthorBySlug(slug: string): Promise<Author | null> {
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) return null;
    
    return data;
  }
  
  // ============= COMMENTS =============
  
  async getComments(postId: string): Promise<BlogComment[]> {
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('blog_post_id', postId)
      .eq('is_approved', true)
      .eq('is_spam', false)
      .order('created_at');
    
    if (error) throw error;
    
    // Organize comments into threads
    return this.organizeCommentThreads(data || []);
  }
  
  async createComment(comment: Partial<BlogComment>): Promise<BlogComment> {
    const { data, error } = await supabase
      .from('blog_comments')
      .insert(comment)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  }
  
  // ============= ANALYTICS =============
  
  async trackView(postId: string): Promise<void> {
    // Increment view count
    await supabase.rpc('increment_view_count', { post_id: postId });
    
    // Track analytics event
    await this.trackEvent(postId, 'view');
  }
  
  async trackEvent(
    postId: string, 
    eventType: BlogAnalyticsEvent['event_type'],
    eventData?: unknown
  ): Promise<void> {
    const { error } = await supabase
      .from('blog_analytics')
      .insert({
        blog_post_id: postId,
        event_type: eventType,
        event_data: eventData,
        visitor_id: this.getVisitorId(),
        session_id: this.getSessionId()
      });
    
    if (error) console.error('Error tracking event:', error);
  }
  
  async getPostStats(postId: string): Promise<BlogPostAnalytics> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('view_count, unique_visitors, avg_read_time, share_count, like_count')
      .eq('id', postId)
      .single();
    
    if (error) throw error;
    
    return data;
  }
  
  async getBlogStats(): Promise<BlogStats> {
    // Get overall stats
    const { data: stats } = await supabase
      .from('blog_posts')
      .select('view_count, like_count, share_count')
      .eq('status', 'published');
    
    const totalViews = stats?.reduce((sum: number, post: unknown) => sum + (post.view_count || 0), 0) || 0;
    const totalLikes = stats?.reduce((sum: number, post: unknown) => sum + (post.like_count || 0), 0) || 0;
    const totalShares = stats?.reduce((sum: number, post: unknown) => sum + (post.share_count || 0), 0) || 0;
    
    // Get top posts
    const { data: topPosts } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('view_count', { ascending: false })
      .limit(5);
    
    // Get popular tags
    const { data: popularTags } = await supabase
      .from('tags')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(10);
    
    return {
      total_posts: stats?.length || 0,
      total_views: totalViews,
      total_comments: 0, // Would need to query comments table
      total_shares: totalShares,
      total_likes: totalLikes,
      avg_read_time: 0, // Would need to calculate from analytics
      top_posts: topPosts || [],
      recent_comments: [],
      popular_tags: popularTags || [],
      author_stats: []
    };
  }
  
  // ============= NEWSLETTER =============
  
  async subscribeToNewsletter(email: string, name?: string): Promise<void> {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        name,
        verification_token: this.generateToken(),
        source: 'blog'
      });
    
    if (error) {
      if (error.code === '23505') {
        throw new Error('Email already subscribed');
      }
      throw error;
    }
  }
  
  async unsubscribeFromNewsletter(email: string): Promise<void> {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      })
      .eq('email', email);
    
    if (error) throw error;
  }
  
  // ============= HELPERS =============
  
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }
  
  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }
  
  private generateTableOfContents(content: string): unknown {
    // Simple TOC generation from markdown headers
    const headers = content.match(/^#{1,6}\s+.+$/gm) || [];
    
    return headers.map((header, index) => {
      const level = header.match(/^#+/)?.[0].length || 1;
      const title = header.replace(/^#+\s+/, '');
      const id = `heading-${index}`;
      
      return { id, title, level };
    });
  }
  
  private organizeCommentThreads(comments: BlogComment[]): BlogComment[] {
    const commentMap = new Map<string, BlogComment>();
    const rootComments: BlogComment[] = [];
    
    // First pass: create map
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });
    
    // Second pass: organize into threads
    comments.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentMap.get(comment.id)!);
        }
      } else {
        rootComments.push(commentMap.get(comment.id)!);
      }
    });
    
    return rootComments;
  }
  
  private getVisitorId(): string {
    // Get or create visitor ID from localStorage
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = this.generateToken();
      localStorage.setItem('visitor_id', visitorId);
    }
    return visitorId;
  }
  
  private getSessionId(): string {
    // Get or create session ID from sessionStorage
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = this.generateToken();
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }
  
  private generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

// Export singleton instance
export const blogService = new BlogService();