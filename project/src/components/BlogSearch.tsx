import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Filter, Calendar, User, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { blogService } from '../services/blog-service';
import type { BlogPost, Category, Tag as TagType, Author } from '../types/blog-enhanced';
import { debounce } from '../utils/helpers';

interface BlogSearchProps {
  onSearch?: (_query: string) => void;
  showFilters?: boolean;
  className?: string;
}

export const BlogSearch: React.FC<BlogSearchProps> = ({
  onSearch,
  showFilters = true,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  // Filter options
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [categoriesData, tagsData, authorsData] = await Promise.all([
          blogService.getCategories(),
          blogService.getTags(),
          blogService.getAuthors()
        ]);
        setCategories(categoriesData);
        setTags(tagsData);
        setAuthors(authorsData);
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    };
    
    if (showFilters) {
      loadFilterOptions();
    }
  }, [showFilters]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim() && !selectedCategory && selectedTags.length === 0 && !selectedAuthor) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const { data } = await blogService.getPosts({
          search: searchQuery,
          category: selectedCategory,
          tags: selectedTags,
          author: selectedAuthor,
          date_from: dateRange.from,
          date_to: dateRange.to,
          limit: 10
        });
        
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [selectedCategory, selectedTags, selectedAuthor, dateRange]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (onSearch) {
      onSearch(value);
    } else {
      performSearch(value);
    }
  };

  // Handle result click
  const handleResultClick = (post: BlogPost) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/blog/${post.slug}`);
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedCategory('');
    setSelectedTags([]);
    setSelectedAuthor('');
    setDateRange({ from: '', to: '' });
    inputRef.current?.focus();
  };

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Apply filters
  const applyFilters = () => {
    performSearch(query);
    setShowAdvanced(false);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedTags([]);
    setSelectedAuthor('');
    setDateRange({ from: '', to: '' });
    performSearch(query);
  };

  const hasActiveFilters = selectedCategory || selectedTags.length > 0 || selectedAuthor || dateRange.from || dateRange.to;

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleSearchChange}
          onFocus={() => query && setIsOpen(true)}
          placeholder="Search articles, topics, authors..."
          className="w-full pl-10 pr-20 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {showFilters && (
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`p-1.5 rounded-md transition-colors ${
                hasActiveFilters 
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
              }`}
              aria-label="Toggle filters"
            >
              <Filter className="w-4 h-4" />
            </button>
          )}
          
          {(query || hasActiveFilters) && (
            <button
              onClick={handleClear}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-500"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
          <div className="space-y-4">
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 10).map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    aria-label={`${selectedTags.includes(tag.id) ? 'Remove' : 'Add'} ${tag.name} filter`}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag.id)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Author
              </label>
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Authors</option>
                {authors.map(author => (
                  <option key={author.id} value={author.id}>{author.name}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Reset Filters
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map(post => (
                <button
                  key={post.id}
                  onClick={() => handleResultClick(post)}
                  className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {post.thumbnail_image && (
                      <img
                        src={post.thumbnail_image}
                        alt={`${post.title} thumbnail`}
                        className="w-16 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {post.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        {post.author && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {post.author.name}
                          </span>
                        )}
                        {post.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.published_at).toLocaleDateString()}
                          </span>
                        )}
                        {post.analytics?.view_count && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {post.analytics.view_count} views
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No results found for "{query}"
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default BlogSearch;