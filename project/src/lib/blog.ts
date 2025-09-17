import { supabase, handleSupabaseError } from './supabase';
import { BlogPost, BlogPostFormData, BlogAuthor, BlogCategory } from '../types/blog';
import { blogPosts } from '../utils/blog';

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    // Try to get posts from localStorage first
    const savedPosts = localStorage.getItem('blog-posts');
    if (savedPosts) {
      return JSON.parse(savedPosts);
    }
    
    // If not in localStorage, use the static data
    localStorage.setItem('blog-posts', JSON.stringify(blogPosts));
    return blogPosts;
  } catch (error) {
    console.warn('Failed to get blog posts:', error);
    return blogPosts;
  }
}

export async function getBlogPost(id: string): Promise<BlogPost | null> {
  try {
    // Try to get posts from localStorage first
    const savedPosts = localStorage.getItem('blog-posts');
    if (savedPosts) {
      const posts = JSON.parse(savedPosts);
      const post = posts.find((post: BlogPost) => post.id === id);
      if (post) return post;
    }
    
    // If not found in localStorage, check static data
    const post = blogPosts.find(post => post.id === id);
    return post || null;
  } catch (error) {
    console.warn('Failed to get blog post:', error);
    return null;
  }
}

export async function createBlogPost(post: BlogPostFormData): Promise<BlogPost | null> {
  try {
    // Get existing posts from localStorage
    const savedPosts = localStorage.getItem('blog-posts');
    let posts = savedPosts ? JSON.parse(savedPosts) : [...blogPosts];
    
    // Create new post
    const newPost: BlogPost = {
      id: `post-${Date.now()}`,
      slug: post.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      image: post.image,
      author_id: post.author_id,
      author: {
        name: 'Liron Langer',
        avatar: '/images/Liron1.jpg'
      },
      category_id: post.category_id,
      category: post.category_id,
      tags: post.tags,
      read_time: post.read_time,
      readTime: post.read_time,
      published: post.published,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add to posts array and save to localStorage
    posts = [newPost, ...posts];
    localStorage.setItem('blog-posts', JSON.stringify(posts));
    
    return newPost;
  } catch (error) {
    console.warn('Failed to create blog post:', error);
    return null;
  }
}

export async function updateBlogPost(id: string, post: Partial<BlogPostFormData>): Promise<BlogPost | null> {
  try {
    // Get existing posts from localStorage
    const savedPosts = localStorage.getItem('blog-posts');
    if (!savedPosts) {
      return null;
    }
    
    const posts = JSON.parse(savedPosts);
    const existingPostIndex = posts.findIndex((p: BlogPost) => p.id === id);
    
    if (existingPostIndex === -1) {
      return null;
    }
    
    // Update the post
    const updatedPost: BlogPost = {
      ...posts[existingPostIndex],
      ...post,
      category: post.category_id || posts[existingPostIndex].category,
      readTime: post.read_time || posts[existingPostIndex].readTime,
      updated_at: new Date().toISOString()
    };
    
    // Update posts array and save to localStorage
    posts[existingPostIndex] = updatedPost;
    localStorage.setItem('blog-posts', JSON.stringify(posts));
    
    return updatedPost;
  } catch (error) {
    console.warn('Failed to update blog post:', error);
    return null;
  }
}

export async function deleteBlogPost(id: string): Promise<void> {
  try {
    // Get existing posts from localStorage
    const savedPosts = localStorage.getItem('blog-posts');
    if (!savedPosts) {
      return;
    }
    
    const posts = JSON.parse(savedPosts);
    const updatedPosts = posts.filter((post: BlogPost) => post.id !== id);
    
    // Save updated posts to localStorage
    localStorage.setItem('blog-posts', JSON.stringify(updatedPosts));
  } catch (error) {
    console.warn('Failed to delete blog post:', error);
    throw error;
  }
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  try {
    // Get posts from localStorage
    const savedPosts = localStorage.getItem('blog-posts');
    if (savedPosts) {
      const posts = JSON.parse(savedPosts);
      return posts.filter((post: BlogPost) => post.published);
    }
    
    // If not in localStorage, use static data
    return blogPosts.filter(post => post.published);
  } catch (error) {
    console.warn('Failed to get published posts:', error);
    return [];
  }
}

export async function getBlogAuthors(): Promise<BlogAuthor[]> {
  try {
    // Return a mock author
    return [
      {
        id: 'default-author',
        name: 'Liron Langer',
        email: 'liron@meta3ventures.com',
        bio: 'Managing Director at Meta3Ventures',
        avatar_url: '/images/Liron1.jpg',
        social_links: {
          linkedin: 'https://linkedin.com/in/lironlanger',
          twitter: 'https://twitter.com/lironlanger'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.warn('Failed to get blog authors:', error);
    return [];
  }
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  try {
    // Return mock categories
    return [
      {
        id: 'ai',
        name: 'AI & Machine Learning',
        slug: 'ai',
        description: 'Articles about artificial intelligence and machine learning',
        created_at: new Date().toISOString()
      },
      {
        id: 'blockchain',
        name: 'Blockchain',
        slug: 'blockchain',
        description: 'Articles about blockchain technology and Web3',
        created_at: new Date().toISOString()
      },
      {
        id: 'innovation',
        name: 'Innovation',
        slug: 'innovation',
        description: 'Articles about innovation and emerging technologies',
        created_at: new Date().toISOString()
      },
      {
        id: 'venture-capital',
        name: 'Venture Capital',
        slug: 'venture-capital',
        description: 'Articles about venture capital and investment',
        created_at: new Date().toISOString()
      },
      {
        id: 'technology',
        name: 'Technology',
        slug: 'technology',
        description: 'Articles about general technology topics',
        created_at: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.warn('Failed to get blog categories:', error);
    return [];
  }
}