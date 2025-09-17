import { BlogPost, BlogPostFormData } from '../types/blog';

// Blog content templates for quick start
export const blogTemplates = {
  aiInsight: {
    title: "The Future of AI: [Your Topic Here]",
    excerpt: "Explore how artificial intelligence is transforming [industry/area] and what it means for the future of innovation.",
    content: `# The Future of AI: [Your Topic Here]

Artificial intelligence continues to evolve at an unprecedented pace, reshaping industries and creating new possibilities for innovation. In this article, we'll explore [specific topic/trend] and its implications for the future.

## Key Insights

### 1. Current State
[Describe the current landscape]

### 2. Emerging Trends
[Discuss new developments]

### 3. Future Implications
[Analyze what this means going forward]

## Conclusion

[Summarize key takeaways and future outlook]`,
    image: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800",
    category_id: "ai",
    tags: ["Artificial Intelligence", "Innovation", "Future Tech"]
  },
  
  blockchainAnalysis: {
    title: "Blockchain Innovation: [Your Focus Area]",
    excerpt: "A deep dive into the latest blockchain developments and their impact on [specific industry or use case].",
    content: `# Blockchain Innovation: [Your Focus Area]

Blockchain technology continues to mature, offering new solutions for [specific problem/industry]. Let's examine the latest developments and their potential impact.

## Technical Overview

### Architecture
[Describe the technical approach]

### Implementation
[Discuss how it's being implemented]

### Benefits
[Outline the key advantages]

## Real-World Applications

[Provide concrete examples and use cases]

## Looking Ahead

[Discuss future potential and challenges]`,
    image: "https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=800",
    category_id: "blockchain",
    tags: ["Blockchain", "Web3", "Innovation"]
  },
  
  ventureInsight: {
    title: "Venture Capital Trends: [Market/Sector Focus]",
    excerpt: "Analysis of current venture capital trends and investment opportunities in [specific sector or market].",
    content: `# Venture Capital Trends: [Market/Sector Focus]

The venture capital landscape is constantly evolving. Here's our analysis of current trends and opportunities in [specific area].

## Market Overview

### Current State
[Describe market conditions]

### Investment Patterns
[Analyze recent investment trends]

### Key Players
[Identify important market participants]

## Investment Opportunities

[Discuss promising areas for investment]

## Strategic Considerations

[Provide insights for founders and investors]

## Conclusion

[Summarize key insights and recommendations]`,
    image: "https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=800",
    category_id: "venture-capital",
    tags: ["Venture Capital", "Investment", "Market Analysis"]
  }
};

// SEO optimization helpers
export const generateSEOTitle = (title: string): string => {
  // Optimize title for SEO (max 60 characters)
  if (title.length <= 60) return title;
  return title.substring(0, 57) + '...';
};

export const generateSEODescription = (excerpt: string): string => {
  // Optimize description for SEO (max 160 characters)
  if (excerpt.length <= 160) return excerpt;
  return excerpt.substring(0, 157) + '...';
};

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .substring(0, 50); // Limit length
};

// Content validation
export const validateBlogPost = (post: BlogPostFormData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Title validation
  if (!post.title.trim()) {
    errors.push('Title is required');
  } else if (post.title.length < 10) {
    errors.push('Title should be at least 10 characters');
  } else if (post.title.length > 100) {
    errors.push('Title should be less than 100 characters');
  }

  // Excerpt validation
  if (!post.excerpt.trim()) {
    errors.push('Excerpt is required');
  } else if (post.excerpt.length < 50) {
    errors.push('Excerpt should be at least 50 characters');
  } else if (post.excerpt.length > 200) {
    errors.push('Excerpt should be less than 200 characters');
  }

  // Content validation
  if (!post.content.trim()) {
    errors.push('Content is required');
  } else if (post.content.length < 100) {
    errors.push('Content should be at least 100 characters');
  }

  // Image validation
  if (!post.image.trim()) {
    errors.push('Featured image URL is required');
  } else {
    try {
      new URL(post.image);
    } catch {
      errors.push('Please enter a valid image URL');
    }
  }

  // Tags validation
  if (post.tags.length === 0) {
    errors.push('At least one tag is required');
  } else if (post.tags.length > 10) {
    errors.push('Maximum 10 tags allowed');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Content analysis
export const analyzeContent = (content: string) => {
  const words = content.split(/\s+/).filter(word => word.length > 0);
  const readingTime = Math.ceil(words.length / 200); // Average reading speed
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  
  return {
    wordCount: words.length,
    readingTime: `${readingTime} min read`,
    paragraphCount: paragraphs.length,
    characterCount: content.length,
    estimatedReadability: words.length > 100 ? 'Good' : 'Too short'
  };
};

// Auto-save functionality
export const saveDraft = (postId: string | undefined, data: BlogPostFormData): void => {
  const draftKey = `blog-draft-${postId || 'new'}`;
  try {
    localStorage.setItem(draftKey, JSON.stringify({
      ...data,
      lastSaved: new Date().toISOString()
    }));
  } catch (error) {
    console.warn('Failed to save draft:', error);
  }
};

export const loadDraft = (postId: string | undefined): BlogPostFormData | null => {
  const draftKey = `blog-draft-${postId || 'new'}`;
  try {
    const draft = localStorage.getItem(draftKey);
    return draft ? JSON.parse(draft) : null;
  } catch (error) {
    console.warn('Failed to load draft:', error);
    return null;
  }
};

export const clearDraft = (postId: string | undefined): void => {
  const draftKey = `blog-draft-${postId || 'new'}`;
  try {
    localStorage.removeItem(draftKey);
  } catch (error) {
    console.warn('Failed to clear draft:', error);
  }
};

// Content formatting helpers
export const formatMarkdown = (text: string, format: string): string => {
  switch (format) {
    case 'bold':
      return `**${text}**`;
    case 'italic':
      return `*${text}*`;
    case 'link':
      return `[${text}](url)`;
    case 'heading1':
      return `# ${text}`;
    case 'heading2':
      return `## ${text}`;
    case 'heading3':
      return `### ${text}`;
    case 'quote':
      return `> ${text}`;
    case 'code':
      return `\`${text}\``;
    case 'codeblock':
      return `\`\`\`\n${text}\n\`\`\``;
    case 'list':
      return `- ${text}`;
    case 'numberedlist':
      return `1. ${text}`;
    default:
      return text;
  }
};

// Image optimization suggestions
export const getOptimizedImageUrl = (originalUrl: string, width: number = 800): string => {
  // For Pexels images, add optimization parameters
  if (originalUrl.includes('pexels.com')) {
    const url = new URL(originalUrl);
    url.searchParams.set('auto', 'compress');
    url.searchParams.set('cs', 'tinysrgb');
    url.searchParams.set('w', width.toString());
    return url.toString();
  }
  
  // For other images, return as-is (in a real app, you might use a service like Cloudinary)
  return originalUrl;
};

// Publishing checklist
export const getPublishingChecklist = (post: BlogPostFormData) => {
  const checklist = [
    {
      item: 'Title is compelling and SEO-friendly',
      completed: post.title.length >= 10 && post.title.length <= 60,
      required: true
    },
    {
      item: 'Excerpt summarizes the content well',
      completed: post.excerpt.length >= 50 && post.excerpt.length <= 160,
      required: true
    },
    {
      item: 'Content is substantial and valuable',
      completed: post.content.length >= 500,
      required: true
    },
    {
      item: 'Featured image is high quality',
      completed: !!post.image,
      required: true
    },
    {
      item: 'Tags are relevant and specific',
      completed: post.tags.length >= 3 && post.tags.length <= 8,
      required: false
    },
    {
      item: 'Category is appropriate',
      completed: !!post.category_id,
      required: true
    },
    {
      item: 'Read time is calculated',
      completed: !!post.read_time,
      required: false
    }
  ];

  const completedRequired = checklist.filter(item => item.required && item.completed).length;
  const totalRequired = checklist.filter(item => item.required).length;
  const readyToPublish = completedRequired === totalRequired;

  return {
    checklist,
    completedRequired,
    totalRequired,
    readyToPublish,
    completionPercentage: Math.round((completedRequired / totalRequired) * 100)
  };
};