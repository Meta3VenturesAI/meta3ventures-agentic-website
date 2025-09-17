import React, { useState, useEffect } from 'react';
import { SEO } from '../components/SEO';
import { Plus, Save, Trash2, Edit2, LogOut, BarChart, Search, Filter, Eye, Calendar, User, Tag } from 'lucide-react';
import { BlogPost, BlogPostFormData } from '../types/blog';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';
import { BlogEditor } from '../components/BlogEditor';
import { Analytics } from '../components/Analytics';
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '../lib/blog';
import { ErrorFallback } from '../components/ErrorFallback';
import { ErrorBoundary } from 'react-error-boundary';
import { blogPosts } from '../utils/blog';
import { BlogQuickActions } from '../components/BlogQuickActions';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { imageConfig } from '../utils/imageUtils';

const BlogManagement: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    if (isAuthenticated) {
      loadPosts();
    }
  }, [isAuthenticated]);

  const loadPosts = async () => {
    try {
      // Load from localStorage first, then fallback to static data
      const savedPosts = localStorage.getItem('blog-posts');
      if (savedPosts) {
        const parsedPosts = JSON.parse(savedPosts);
        setPosts(parsedPosts);
      } else {
        setPosts([...blogPosts]);
        // Save initial posts to localStorage
        localStorage.setItem('blog-posts', JSON.stringify(blogPosts));
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([...blogPosts]);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const savePosts = (updatedPosts: BlogPost[]) => {
    try {
      localStorage.setItem('blog-posts', JSON.stringify(updatedPosts));
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error saving posts:', error);
      toast.error('Failed to save posts');
    }
  };

  const handleCreatePost = (template?: Partial<BlogPostFormData>) => {
    const newPost: BlogPost = {
      id: 'new-' + Date.now(),
      slug: '',
      title: template?.title || '',
      excerpt: template?.excerpt || '',
      content: template?.content || '',
      image: template?.image || 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      author_id: template?.author_id || 'default-author',
      author: {
        name: 'Liron Langer',
        avatar: '/images/Liron1.jpg'
      },
      category_id: template?.category_id || 'ai',
      category: template?.category_id || 'ai',
      tags: template?.tags || [],
      read_time: template?.read_time || '5 min read',
      readTime: template?.read_time || '5 min read',
      published: template?.published || false,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setSelectedPost(newPost);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;
    
    try {
      await deleteBlogPost(id);
      const updatedPosts = posts.filter(post => post.id !== id);
      savePosts(updatedPosts);
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleDuplicate = (post: BlogPost) => {
    const duplicatedPost: BlogPost = {
      ...post,
      id: 'new-' + Date.now(),
      title: `${post.title} (Copy)`,
      slug: '',
      published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setSelectedPost(duplicatedPost);
    setIsEditing(true);
  };

  const handleSavePost = async (postData: BlogPostFormData) => {
    try {
      if (selectedPost) {
        const isNew = selectedPost.id.startsWith('new-');
        
        if (isNew) {
          // Create new post
          const newPost = await createBlogPost(postData);
          if (newPost) {
            const updatedPosts = [newPost, ...posts];
            savePosts(updatedPosts);
            toast.success('Post created successfully!');
          }
        } else {
          // Update existing post
          const updatedPost = await updateBlogPost(selectedPost.id, postData);
          if (updatedPost) {
            const updatedPosts = posts.map(post => 
              post.id === selectedPost.id ? updatedPost : post
            );
            savePosts(updatedPosts);
            toast.success('Post updated successfully!');
          }
        }
      }
      
      setIsEditing(false);
      setSelectedPost(null);
      
      // Clear any drafts
      const draftKey = `blog-draft-${selectedPost?.id || 'new'}`;
      localStorage.removeItem(draftKey);
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save post');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'published' && post.published) ||
      (filterStatus === 'draft' && !post.published);
    
    const matchesCategory = 
      filterCategory === 'all' || post.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (published: boolean | undefined): string => {
    return published 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
  };

  const getCategoryName = (categoryId: string): string => {
    const categoryMap: Record<string, string> = {
      'ai': 'AI & Machine Learning',
      'blockchain': 'Blockchain',
      'innovation': 'Innovation',
      'venture-capital': 'Venture Capital',
      'technology': 'Technology'
    };
    return categoryMap[categoryId] || categoryId;
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  if (showAnalytics) {
    return (
      <>
        <SEO 
          title="Analytics - Meta3Ventures"
          description="Analytics dashboard for Meta3Ventures website performance and lead tracking."
        />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                    Analytics & Insights
                  </h1>
                  <button
                    onClick={() => setShowAnalytics(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Back to Blog Management
                  </button>
                </div>
                
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <Analytics />
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Blog Management - Meta3Ventures"
        description="Manage blog posts and content for Meta3Ventures website."
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                    Blog Management
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Create, edit, and manage your blog content
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowAnalytics(true)}
                    className="inline-flex items-center px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <BarChart className="w-5 h-5 mr-2" />
                    Analytics
                  </button>
                  <button
                    onClick={logout}
                    className="inline-flex items-center px-4 py-2 text-red-600 hover:text-red-700 font-medium"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                  </button>
                </div>
              </div>

              {isEditing ? (
                <BlogEditor
                  initialData={selectedPost || undefined}
                  onSave={handleSavePost}
                  onCancel={() => {
                    setIsEditing(false);
                    setSelectedPost(null);
                  }}
                />
              ) : (
                <>
                  {/* Quick Actions */}
                  <BlogQuickActions 
                    onCreatePost={handleCreatePost}
                    onViewAnalytics={() => setShowAnalytics(true)}
                    totalPosts={posts.length}
                    publishedPosts={posts.filter(p => p.published).length}
                    draftPosts={posts.filter(p => !p.published).length}
                  />

                  {/* Action Bar */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <button
                      onClick={() => handleCreatePost()}
                      className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      New Post
                    </button>

                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search posts..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                        />
                      </div>
                      
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as 'all' | 'published' | 'draft')}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                      
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="all">All Categories</option>
                        <option value="ai">AI & Machine Learning</option>
                        <option value="blockchain">Blockchain</option>
                        <option value="innovation">Innovation</option>
                        <option value="venture-capital">Venture Capital</option>
                        <option value="technology">Technology</option>
                      </select>
                    </div>
                  </div>

                  {/* Posts List */}
                  <div className="space-y-6">
                    {filteredPosts.length > 0 ? (
                      filteredPosts.map(post => (
                        <div
                          key={post.id}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* Post Image */}
                            <div className="lg:w-48 h-32 flex-shrink-0">
                              <img
                                src={post.image}
                                alt={post.title}
                                className="w-full h-full object-cover rounded-lg"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (post.category === 'ai') {
                                    target.src = imageConfig.optimizedUrls.aiFuture;
                                  } else if (post.category === 'blockchain') {
                                    target.src = imageConfig.optimizedUrls.blockchain;
                                  } else {
                                    target.src = imageConfig.optimizedUrls.ventureCapital;
                                  }
                                }}
                              />
                            </div>
                            
                            {/* Post Content */}
                            <div className="flex-grow">
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(post.published)}`}>
                                  {post.published ? 'Published' : 'Draft'}
                                </span>
                                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded">
                                  {getCategoryName(post.category)}
                                </span>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {post.date}
                                </div>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  <User className="w-3 h-3 mr-1" />
                                  {post.author.name}
                                </div>
                              </div>
                              
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                {post.title}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                                {post.excerpt}
                              </p>
                              
                              <div className="flex flex-wrap gap-1 mb-4">
                                {post.tags.slice(0, 3).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                                  >
                                    <Tag className="w-3 h-3 mr-1" />
                                    {tag}
                                  </span>
                                ))}
                                {post.tags.length > 3 && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    +{post.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex lg:flex-col gap-2 lg:w-auto">
                              <Link
                                to={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                title="View Post"
                              >
                                <Eye className="w-5 h-5" />
                              </Link>
                              <button
                                onClick={() => {
                                  setSelectedPost(post);
                                  setIsEditing(true);
                                }}
                                className="p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                title="Edit Post"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDuplicate(post)}
                                className="p-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                title="Duplicate Post"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(post.id)}
                                className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                title="Delete Post"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                          <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                          {searchQuery || filterStatus !== 'all' || filterCategory !== 'all' 
                            ? 'No posts match your filters' 
                            : 'No blog posts found'
                          }
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          {searchQuery || filterStatus !== 'all' || filterCategory !== 'all'
                            ? 'Try adjusting your search terms or filters.'
                            : 'Create your first post to get started.'
                          }
                        </p>
                        <button
                          onClick={() => {
                            if (searchQuery || filterStatus !== 'all' || filterCategory !== 'all') {
                              setSearchQuery('');
                              setFilterStatus('all');
                              setFilterCategory('all');
                            } else {
                              handleCreatePost();
                            }
                          }}
                          className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          {searchQuery || filterStatus !== 'all' || filterCategory !== 'all' 
                            ? 'Clear Filters' 
                            : 'Create First Post'
                          }
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogManagement;