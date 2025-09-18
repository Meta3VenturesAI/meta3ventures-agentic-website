import React from 'react';
import { Plus, FileText, Eye, BarChart, Settings } from 'lucide-react';
import { blogTemplates } from '../utils/blogHelpers';
import { BlogPostFormData } from '../types/blog';

interface BlogQuickActionsProps {
  onCreatePost: (_template?: Partial<BlogPostFormData>) => void;
  onViewAnalytics: () => void;
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
}

export const BlogQuickActions: React.FC<BlogQuickActionsProps> = ({
  onCreatePost,
  onViewAnalytics,
  totalPosts,
  publishedPosts,
  draftPosts
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Quick Stats */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-sm">Total Posts</p>
            <p className="text-3xl font-bold">{totalPosts}</p>
          </div>
          <FileText className="w-8 h-8 text-indigo-200" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Published</p>
            <p className="text-3xl font-bold">{publishedPosts}</p>
          </div>
          <Eye className="w-8 h-8 text-green-200" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-100 text-sm">Drafts</p>
            <p className="text-3xl font-bold">{draftPosts}</p>
          </div>
          <Settings className="w-8 h-8 text-yellow-200" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 rounded-xl">
        <button
          onClick={onViewAnalytics}
          className="w-full h-full flex items-center justify-between hover:scale-105 transition-transform"
        >
          <div className="text-left">
            <p className="text-purple-100 text-sm">Analytics</p>
            <p className="text-lg font-semibold">View Insights</p>
          </div>
          <BarChart className="w-8 h-8 text-purple-200" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="md:col-span-2 lg:col-span-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Start</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onCreatePost()}
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
          >
            <Plus className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 mx-auto mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">Blank Post</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Start from scratch</p>
          </button>

          <button
            onClick={() => onCreatePost(blogTemplates.aiInsight)}
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
          >
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">AI</span>
            </div>
            <p className="font-medium text-gray-900 dark:text-white">AI Insight</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">AI trends & analysis</p>
          </button>

          <button
            onClick={() => onCreatePost(blogTemplates.blockchainAnalysis)}
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
          >
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50">
              <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">₿</span>
            </div>
            <p className="font-medium text-gray-900 dark:text-white">Blockchain Analysis</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Web3 & blockchain tech</p>
          </button>
        </div>
      </div>
    </div>
  );
};