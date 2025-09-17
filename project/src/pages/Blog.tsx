import React, { useState } from 'react';
import { SEO } from '../components/SEO';
import { Search, Calendar, Clock, User, Tag, ArrowRight, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useForm } from '@formspree/react';
import { filterPosts, getAllCategories } from '../utils/blog';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { imageConfig } from '../utils/imageUtils';

const BlogPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [state, handleSubmit] = useForm(
    import.meta.env.VITE_FORMSPREE_NEWSLETTER_KEY || "xdkgwaaa"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'all', name: 'All Posts' },
    { id: 'ai', name: 'AI & Machine Learning' },
    { id: 'blockchain', name: 'Blockchain' },
    { id: 'innovation', name: 'Innovation' },
    { id: 'venture-capital', name: 'Venture Capital' },
    { id: 'technology', name: 'Technology' }
  ];

  const filteredPosts = filterPosts(searchQuery, selectedCategory);

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || categoryId;
  };

  // Get appropriate image based on category
  const getImageForPost = (post: unknown) => {
    if (post.image) return post.image;
    
    if (post.category === 'ai') {
      return imageConfig.optimizedUrls.aiFuture;
    } else if (post.category === 'blockchain') {
      return imageConfig.optimizedUrls.blockchain;
    } else {
      return imageConfig.optimizedUrls.ventureCapital;
    }
  };

  const onNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await handleSubmit(e);
      if (state.succeeded) {
        toast.success('Thank you for subscribing! You\'ll receive our next newsletter soon.');
        // Reset form
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
      console.error('Newsletter subscription error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigation = () => {
    // Scroll to top when navigating to a new page
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      <SEO 
        title="Blog - Meta3Ventures"
        description="Insights and perspectives on AI, blockchain, and emerging technologies from the Meta3Ventures team."
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900 text-white py-24">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Insights & Perspectives
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text mt-2">
                  Stay Ahead of the Curve
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Expert analysis and thought leadership on AI, blockchain, and the future of technology.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-full text-sm transition-all transform hover:scale-105 ${
                        selectedCategory === category.id
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <article
                  key={post.id}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={getImageForPost(post)}
                      alt={post.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = imageConfig.fallbackImages.blog;
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full">
                        {getCategoryName(post.category)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">{post.readTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">{post.author.name}</span>
                      </div>
                    </div>

                    <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      <Link to={`/blog/${post.slug}`} onClick={handleNavigation}>{post.title}</Link>
                    </h2>

                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {post.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        >
                          <Tag size={12} className="mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img
                            src={imageConfig.optimizedUrls.lironLanger}
                            alt={post.author.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800";
                            }}
                          />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {post.author.name}
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {post.date}
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline transform hover:translate-x-1 transition-transform"
                        onClick={handleNavigation}
                      >
                        Read More
                        <ArrowRight size={16} className="ml-1" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  No articles found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search terms or browse all categories.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Newsletter Section */}
            <div className="mt-20 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-12 text-white">
              <div className="max-w-3xl mx-auto text-center">
                <Mail className="w-12 h-12 mx-auto mb-6 text-indigo-400" />
                <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
                <p className="text-xl text-gray-300 mb-8">
                  Subscribe to our newsletter for the latest insights on AI, blockchain, and emerging technologies.
                </p>
                <form onSubmit={onNewsletterSubmit} className="max-w-md mx-auto">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="email"
                      name="email"
                      required
                      disabled={isSubmitting}
                      placeholder="Enter your email"
                      className="flex-grow px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || state.submitting}
                      className="px-8 py-3 bg-white text-indigo-900 rounded-lg font-medium hover:bg-gray-100 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                    >
                      {isSubmitting || state.submitting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-900"></div>
                      ) : (
                        'Subscribe'
                      )}
                    </button>
                  </div>
                </form>
                
                {state.succeeded && (
                  <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 animate-fadeIn flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Thank you for subscribing! You'll receive our next newsletter soon.
                  </div>
                )}

                {state.errors && Object.keys(state.errors).length > 0 && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 animate-fadeIn flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Failed to subscribe. Please try again.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPage;