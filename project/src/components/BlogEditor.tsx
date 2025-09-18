import React, { useState, useEffect } from 'react';
import { BlogPostFormData } from '../types/blog';
import { Save, X, Eye, Link as LinkIcon, Bold, Italic, List, Quote } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

interface BlogEditorProps {
  initialData?: Partial<BlogPostFormData & { id: string }>;
  onSave: (_data: BlogPostFormData) => void;
  onCancel: () => void;
}

export const BlogEditor: React.FC<BlogEditorProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<BlogPostFormData>({
    title: initialData?.title || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    image: initialData?.image || '',
    author_id: initialData?.author_id || 'default-author',
    category_id: initialData?.category_id || 'ai',
    tags: initialData?.tags || [],
    read_time: initialData?.read_time || '',
    published: initialData?.published || false
  });

  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save draft functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (formData.title || formData.content) {
        const draftKey = `blog-draft-${initialData?.id || 'new'}`;
        localStorage.setItem(draftKey, JSON.stringify(formData));
        console.log('Auto-saved draft');
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [formData, initialData?.id]);

  // Load draft on component mount
  useEffect(() => {
    if (!initialData?.id) {
      const draftKey = 'blog-draft-new';
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          if (draft.title || draft.content) {
            const shouldLoadDraft = window.confirm('A draft was found. Would you like to continue editing it?');
            if (shouldLoadDraft) {
              setFormData(draft);
            }
          }
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    }
  }, [initialData?.id]);

  // Auto-generate read time based on content
  useEffect(() => {
    if (formData.content) {
      const wordCount = formData.content.split(/\s+/).length;
      const readTimeMinutes = Math.ceil(wordCount / 200); // Average reading speed
      setFormData(prev => ({
        ...prev,
        read_time: `${readTimeMinutes} min read`
      }));
    }
  }, [formData.content]);

  // Auto-generate excerpt if not provided
  useEffect(() => {
    if (formData.content && !formData.excerpt) {
      const firstParagraph = formData.content.split('\n\n')[0];
      const excerpt = firstParagraph.substring(0, 160).replace(/[#*]/g, '').trim();
      if (excerpt.length > 50) {
        setFormData(prev => ({
          ...prev,
          excerpt: excerpt + (excerpt.length === 160 ? '...' : '')
        }));
      }
    }
  }, [formData.content, formData.excerpt]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title should be at least 10 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title should be less than 100 characters';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    } else if (formData.excerpt.length < 50) {
      newErrors.excerpt = 'Excerpt should be at least 50 characters';
    } else if (formData.excerpt.length > 200) {
      newErrors.excerpt = 'Excerpt should be less than 200 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 100) {
      newErrors.content = 'Content should be at least 100 characters';
    }

    if (!formData.image.trim()) {
      newErrors.image = 'Featured image URL is required';
    } else {
      try {
        new URL(formData.image);
      } catch {
        newErrors.image = 'Please enter a valid image URL';
      }
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    } else if (formData.tags.length > 10) {
      newErrors.tags = 'Maximum 10 tags allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setIsSaving(true);
    
    try {
      // Pass the form data to the parent component
      onSave(formData);
      
      // Clear draft after successful save
      const draftKey = `blog-draft-${initialData?.id || 'new'}`;
      localStorage.removeItem(draftKey);
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save post. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      
      if (!formData.tags.includes(newTag)) {
        if (formData.tags.length < 10) {
          setFormData(prev => ({
            ...prev,
            tags: [...prev.tags, newTag]
          }));
          setTagInput('');
        } else {
          toast.error('Maximum 10 tags allowed');
        }
      } else {
        toast.error('Tag already exists');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const insertMarkdown = (syntax: string, placeholder: string = '') => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const replacement = selectedText || placeholder;
    
    let newText = '';
    switch (syntax) {
      case 'bold':
        newText = `**${replacement}**`;
        break;
      case 'italic':
        newText = `*${replacement}*`;
        break;
      case 'link':
        newText = `[${replacement || 'link text'}](url)`;
        break;
      case 'list':
        newText = `\n- ${replacement || 'list item'}`;
        break;
      case 'quote':
        newText = `\n> ${replacement || 'quote text'}`;
        break;
      default:
        newText = replacement;
    }

    const newContent = 
      textarea.value.substring(0, start) + 
      newText + 
      textarea.value.substring(end);

    setFormData(prev => ({ ...prev, content: newContent }));
    
    // Focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + newText.length, start + newText.length);
    }, 0);
  };

  const suggestedImages = [
    'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/7567460/pexels-photo-7567460.jpeg?auto=compress&cs=tinysrgb&w=800'
  ];

  if (isPreview) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Preview</h2>
          <button
            onClick={() => setIsPreview(false)}
            className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Back to Editor
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
          <div className="relative h-64">
            <img
              src={formData.image}
              alt={formData.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800";
              }}
            />
            <div className="absolute bottom-4 left-4">
              <span className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded-full">
                {formData.category_id}
              </span>
            </div>
          </div>
          
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              {formData.title}
            </h1>
            
            <div className="flex items-center gap-4 mb-6 text-gray-600 dark:text-gray-300">
              <span>{formData.read_time}</span>
              <span>•</span>
              <span>Liron Langer</span>
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                {formData.excerpt}
              </p>
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
                {formData.content}
              </ReactMarkdown>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-6">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {initialData?.id ? 'Edit Post' : 'Create New Post'}
        </h2>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className="flex items-center px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </button>
          <span className="text-sm text-gray-500">Auto-saved</span>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="form-label">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className={`form-input ${errors.title ? 'border-red-500' : ''}`}
          placeholder="Enter an engaging title..."
          required
        />
        {errors.title && <p className="form-error">{errors.title}</p>}
        <p className="text-sm text-gray-500 mt-1">{formData.title.length}/100 characters</p>
      </div>

      {/* Excerpt */}
      <div>
        <label className="form-label">
          Excerpt *
        </label>
        <textarea
          value={formData.excerpt}
          onChange={e => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
          rows={3}
          className={`form-input ${errors.excerpt ? 'border-red-500' : ''}`}
          placeholder="Brief description that will appear in blog listings..."
          required
        />
        {errors.excerpt && <p className="form-error">{errors.excerpt}</p>}
        <p className="text-sm text-gray-500 mt-1">{formData.excerpt.length}/200 characters</p>
      </div>

      {/* Content Editor */}
      <div>
        <label className="form-label">
          Content * (Markdown supported)
        </label>
        
        {/* Markdown Toolbar */}
        <div className="flex items-center space-x-2 mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-t-lg border border-b-0 border-gray-300 dark:border-gray-600">
          <button
            type="button"
            onClick={() => insertMarkdown('bold', 'bold text')}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown('italic', 'italic text')}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown('link')}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            title="Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown('list', 'list item')}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            title="List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown('quote', 'quote text')}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>
        
        <textarea
          id="content"
          value={formData.content}
          onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
          rows={20}
          className={`form-input rounded-t-none ${errors.content ? 'border-red-500' : ''}`}
          placeholder="Write your content here... You can use Markdown formatting."
          required
        />
        {errors.content && <p className="form-error">{errors.content}</p>}
        <p className="text-sm text-gray-500 mt-1">
          {formData.content.split(/\s+/).length} words • Supports Markdown formatting
        </p>
      </div>

      {/* Featured Image */}
      <div>
        <label className="form-label">
          Featured Image URL *
        </label>
        <input
          type="url"
          value={formData.image}
          onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
          className={`form-input ${errors.image ? 'border-red-500' : ''}`}
          placeholder="https://example.com/image.jpg"
          required
        />
        {errors.image && <p className="form-error">{errors.image}</p>}
        
        {/* Image Preview */}
        {formData.image && (
          <div className="mt-2">
            <img
              src={formData.image}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        
        {/* Suggested Images */}
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suggested Images:</p>
          <div className="grid grid-cols-5 gap-2">
            {suggestedImages.map((imageUrl, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, image: imageUrl }))}
                className="relative h-20 rounded-lg overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all"
              >
                <img
                  src={imageUrl}
                  alt={`Suggested ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category and Read Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="form-label">
            Category
          </label>
          <select
            value={formData.category_id}
            onChange={e => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
            className="form-input"
          >
            <option value="ai">AI & Machine Learning</option>
            <option value="blockchain">Blockchain</option>
            <option value="innovation">Innovation</option>
            <option value="venture-capital">Venture Capital</option>
            <option value="technology">Technology</option>
          </select>
        </div>

        <div>
          <label className="form-label">
            Read Time
          </label>
          <input
            type="text"
            value={formData.read_time}
            onChange={e => setFormData(prev => ({ ...prev, read_time: e.target.value }))}
            placeholder="e.g., 5 min read"
            className="form-input"
          />
          <p className="text-sm text-gray-500 mt-1">Auto-calculated based on content length</p>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="form-label">
          Tags *
        </label>
        <input
          type="text"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Type a tag and press Enter"
          className={`form-input ${errors.tags ? 'border-red-500' : ''}`}
        />
        {errors.tags && <p className="form-error">{errors.tags}</p>}
        
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-1">{formData.tags.length}/10 tags</p>
      </div>

      {/* Publish Settings */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="published" className="text-sm font-medium text-gray-900 dark:text-white">
              Publish Status
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formData.published ? 'This post will be visible to all visitors' : 'This post will be saved as a draft'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={e => setFormData(prev => ({ ...prev, published: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
              {formData.published ? 'Published' : 'Draft'}
            </span>
          </label>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
        >
          <X className="w-5 h-5 mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center disabled:opacity-50"
        >
          <Save className="w-5 h-5 mr-2" />
          {isSaving ? 'Saving...' : (formData.published ? 'Publish Post' : 'Save Draft')}
        </button>
      </div>
    </form>
  );
};