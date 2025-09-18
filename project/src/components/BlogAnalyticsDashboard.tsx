import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';

// Lazy load charts component for better bundle splitting
const BlogCharts = lazy(() => import('./charts/BlogCharts'));
import { 
  TrendingUp, Eye, Heart, 
  Users, FileText, Tag, Clock, Award
} from 'lucide-react';
import { blogService } from '../services/blog-service';
import { formatNumber, formatRelativeTime } from '../utils/helpers';
import type { BlogStats, Tag as _TagType } from '../types/blog-enhanced';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {typeof value === 'number' ? formatNumber(value) : value}
        </p>
        {change !== undefined && (
          <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

export const BlogAnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [viewsData, setViewsData] = useState<Array<{ date: string; views: number }>>([]);
  const [engagementData, setEngagementData] = useState<Array<{ post: string; likes: number; comments: number }>>([]);
  const [categoryData, setCategoryData] = useState<Array<{ category: string; count: number }>>([]);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, loadAnalytics]);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const blogStats = await blogService.getBlogStats();
      setStats(blogStats);
      
      // Generate mock time-series data
      setViewsData(generateTimeSeriesData());
      setEngagementData(generateEngagementData());
      setCategoryData(generateCategoryData());
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [generateTimeSeriesData, generateEngagementData, generateCategoryData]);

  const generateTimeSeriesData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    return Array.from({ length: Math.min(days, 30) }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: Math.floor(Math.random() * 1000) + 500,
        visitors: Math.floor(Math.random() * 500) + 200,
      };
    }).reverse();
  };

  const generateEngagementData = () => [
    { name: 'Likes', value: 2345, color: '#EF4444' },
    { name: 'Shares', value: 1234, color: '#3B82F6' },
    { name: 'Comments', value: 567, color: '#10B981' },
    { name: 'Saves', value: 890, color: '#F59E0B' },
  ];

  const generateCategoryData = () => [
    { category: 'AI Insights', posts: 45, views: 12500 },
    { category: 'Investment', posts: 32, views: 8900 },
    { category: 'Portfolio', posts: 28, views: 7600 },
    { category: 'Industry', posts: 21, views: 5400 },
    { category: 'Thought Leadership', posts: 18, views: 4200 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Analytics</h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Views"
          value={stats?.total_views || 0}
          change={12.5}
          icon={Eye}
          color="bg-blue-600"
        />
        <MetricCard
          title="Total Posts"
          value={stats?.total_posts || 0}
          change={5.2}
          icon={FileText}
          color="bg-green-600"
        />
        <MetricCard
          title="Engagement"
          value={stats?.total_likes || 0}
          change={18.7}
          icon={Heart}
          color="bg-red-600"
        />
        <MetricCard
          title="Avg Read Time"
          value={`${Math.round(stats?.avg_read_time || 5)}m`}
          change={-2.3}
          icon={Clock}
          color="bg-purple-600"
        />
      </div>

      {/* Charts - Lazy Loaded */}
      <Suspense fallback={
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      }>
        <BlogCharts
          pageViewsData={viewsData.map(item => ({ name: item.date, value: item.views, visitors: item.visitors }))}
          engagementData={engagementData.map(item => ({ name: item.name, value: item.value, likes: item.value, comments: item.value * 0.3, shares: item.value * 0.1 }))}
          tagData={engagementData}
          performanceData={categoryData.map(item => ({ name: item.category, value: item.posts * item.views, performance: item.posts * item.views }))}
        />
      </Suspense>

      {/* Top Posts & Tags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Posts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Performing Posts
          </h3>
          <div className="space-y-3">
            {stats?.top_posts.slice(0, 5).map((post, index) => (
              <div key={post.id} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                    {post.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatNumber(post.analytics?.view_count || 0)} views • {formatRelativeTime(post.published_at || post.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Tags */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Popular Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats?.popular_tags.map(tag => (
              <span
                key={tag.id}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                {tag.name}
                <span className="ml-1 text-xs text-gray-500">({tag.usage_count})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Author Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Author Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2 text-sm font-medium text-gray-700 dark:text-gray-300">Author</th>
                <th className="text-center py-2 text-sm font-medium text-gray-700 dark:text-gray-300">Posts</th>
                <th className="text-center py-2 text-sm font-medium text-gray-700 dark:text-gray-300">Total Views</th>
                <th className="text-center py-2 text-sm font-medium text-gray-700 dark:text-gray-300">Avg Views</th>
                <th className="text-center py-2 text-sm font-medium text-gray-700 dark:text-gray-300">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {stats?.author_stats.slice(0, 5).map(authorStat => (
                <tr key={authorStat.author.id} className="border-b dark:border-gray-700">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {authorStat.author.avatar_url && (
                        <img 
                          src={authorStat.author.avatar_url} 
                          alt={authorStat.author.name}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {authorStat.author.name}
                      </span>
                    </div>
                  </td>
                  <td className="text-center text-sm text-gray-600 dark:text-gray-400">
                    {authorStat.post_count}
                  </td>
                  <td className="text-center text-sm text-gray-600 dark:text-gray-400">
                    {formatNumber(authorStat.total_views)}
                  </td>
                  <td className="text-center text-sm text-gray-600 dark:text-gray-400">
                    {formatNumber(Math.round(authorStat.total_views / authorStat.post_count))}
                  </td>
                  <td className="text-center">
                    <Award className="w-4 h-4 text-yellow-500 mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BlogAnalyticsDashboard;