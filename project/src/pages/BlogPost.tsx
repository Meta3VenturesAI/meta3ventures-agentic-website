import React, { Suspense, lazy } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Tag, Share2, BookOpen } from 'lucide-react';
import { SEO } from '../components/SEO';
import { getBlogPost, getRelatedPosts } from '../utils/blog';
import { imageConfig } from '../utils/imageUtils';

// Lazy load ReactMarkdown for better bundle splitting
const ReactMarkdown = lazy(() => import('react-markdown'));

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug) {
    return <Navigate to="/blog" replace />;
  }

  // Try to get post from localStorage first, then fallback to static data
  const getPostFromStorage = (slug: string) => {
    try {
      const savedPosts = localStorage.getItem('blog-posts');
      if (savedPosts) {
        const posts = JSON.parse(savedPosts);
        const post = posts.find((post: unknown) => post.slug === slug);
        if (post) return post;
      }
    } catch (error) {
      console.error('Error loading posts from storage:', error);
    }
    return getBlogPost(slug);
  };

  const post = getPostFromStorage(slug);
  
  if (!post) {
    return <Navigate to="/404" replace />;
  }

  const relatedPosts = getRelatedPosts(post, 3);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
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

  return (
    <>
      <SEO 
        title={`${post.title} - Meta3Ventures Blog`}
        description={post.excerpt}
        image={getImageForPost(post)}
        type="article"
        keywords={post.tags}
        author={post.author.name}
        publishedTime={new Date(post.date).toISOString()}
        section={getCategoryName(post.category)}
        tags={post.tags}
      />
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-4xl mx-auto">
            {/* Back to Blog */}
            <Link 
              to="/blog"
              className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline mb-8 transition-colors"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>

            {/* Article Header */}
            <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="relative h-64 md:h-96">
                <img
                  src={getImageForPost(post)}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = imageConfig.fallbackImages.blog;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <span className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded-full">
                    {getCategoryName(post.category)}
                  </span>
                </div>
                <button
                  onClick={handleShare}
                  className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                  aria-label="Share article"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.author.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Article</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {post.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Article Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <div className="text-xl text-gray-600 dark:text-gray-300 mb-8 font-medium leading-relaxed">
                    {post.excerpt}
                  </div>
                  
                  <Suspense fallback={
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  }>
                    <ReactMarkdown 
                      components={{
                        h1: ({children}) => <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">{children}</h1>,
                        h2: ({children}) => <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">{children}</h2>,
                        h3: ({children}) => <h3 className="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-white">{children}</h3>,
                        p: ({children}) => <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</p>,
                        ul: ({children}) => <ul className="mb-4 space-y-2 list-disc pl-5">{children}</ul>, 
                        ol: ({children}) => <ol className="mb-4 space-y-2 list-decimal pl-5">{children}</ol>,
                        li: ({children}) => <li className="text-gray-700 dark:text-gray-300">{children}</li>,
                        strong: ({children}) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                        em: ({children}) => <em className="italic text-gray-700 dark:text-gray-300">{children}</em>,
                        blockquote: ({children}) => (
                          <blockquote className="border-l-4 border-indigo-500 pl-4 my-6 italic text-gray-600 dark:text-gray-400">
                            {children}
                          </blockquote>
                        ),
                        code: ({children}) => (
                          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">
                            {children}
                          </code>
                        ),
                        pre: ({children}) => (
                          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-6">
                            {children}
                          </pre>
                        )
                      }}
                    >
                      {post.content}
                    </ReactMarkdown>
                  </Suspense>
                </div>

                {/* Author Bio */}
                <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-4">
                    <img
                      src={imageConfig.optimizedUrls.lironLanger}
                      alt={post.author.name}
                      className="w-16 h-16 rounded-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800";
                      }}
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {post.author.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Managing Director at Meta3Ventures
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Expert in AI innovation, venture building, and digital transformation
                      </p>
                    </div>
                  </div>
                </div>

                {/* Share Section */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Share this article:</span>
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">
                  Related Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {relatedPosts.map((relatedPost, index) => (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.slug}`}
                      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      <div className="h-48 overflow-hidden">
                        <img
                          src={getImageForPost(relatedPost)}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = imageConfig.fallbackImages.blog;
                          }}
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded">
                            {getCategoryName(relatedPost.category)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {relatedPost.readTime}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                          {relatedPost.excerpt}
                        </p>
                        <div className="mt-4 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                          Read more →
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Back to Blog CTA */}
            <div className="mt-16 text-center">
              <Link
                to="/blog"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                View All Articles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPost;