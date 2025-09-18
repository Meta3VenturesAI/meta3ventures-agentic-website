import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { BlogSearch } from '../BlogSearch';
import { blogService } from '../../services/blog-service';

// Mock the blog service
vi.mock('../../services/blog-service', () => ({
  blogService: {
    getPosts: vi.fn(),
    getCategories: vi.fn(),
    getTags: vi.fn(),
    getAuthors: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('BlogSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock responses
    vi.mocked(blogService.getCategories).mockResolvedValue([
      { id: '1', name: 'AI Insights', slug: 'ai-insights', display_order: 1, is_active: true, created_at: '', updated_at: '' },
      { id: '2', name: 'Investment', slug: 'investment', display_order: 2, is_active: true, created_at: '', updated_at: '' },
    ]);
    
    vi.mocked(blogService.getTags).mockResolvedValue([
      { id: '1', name: 'AI', slug: 'ai', usage_count: 10, created_at: '' },
      { id: '2', name: 'Blockchain', slug: 'blockchain', usage_count: 5, created_at: '' },
    ]);
    
    vi.mocked(blogService.getAuthors).mockResolvedValue([
      { 
        id: '1', 
        name: 'John Doe', 
        slug: 'john-doe', 
        expertise: ['AI'], 
        is_active: true, 
        created_at: '', 
        updated_at: '' 
      },
    ]);
  });

  it('renders search input', () => {
    render(
      <BrowserRouter>
        <BlogSearch />
      </BrowserRouter>
    );
    
    const searchInput = screen.getByPlaceholderText(/search articles/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('shows search results when typing', async () => {
    const mockPosts = {
      data: [
        {
          id: '1',
          slug: 'test-post',
          title: 'Test Post',
          excerpt: 'This is a test post',
          content: 'Content',
          author_id: 'author-1',
          status: 'published' as const,
          featured: false,
          allow_comments: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ],
      count: 1,
    };
    
    vi.mocked(blogService.getPosts).mockResolvedValue(mockPosts);
    
    render(
      <BrowserRouter>
        <BlogSearch />
      </BrowserRouter>
    );
    
    const searchInput = screen.getByPlaceholderText(/search articles/i);
    await userEvent.type(searchInput, 'test');
    
    await waitFor(() => {
      expect(blogService.getPosts).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'test',
        })
      );
    });
  });

  it('clears search when clear button is clicked', async () => {
    render(
      <BrowserRouter>
        <BlogSearch />
      </BrowserRouter>
    );
    
    const searchInput = screen.getByPlaceholderText(/search articles/i) as HTMLInputElement;
    await userEvent.type(searchInput, 'test query');
    
    expect(searchInput.value).toBe('test query');
    
    // Clear button appears when there's text
    const clearButton = screen.getByLabelText(/clear search/i);
    await userEvent.click(clearButton);
    
    expect(searchInput.value).toBe('');
  });

  it('toggles filter panel when filter button is clicked', async () => {
    render(
      <BrowserRouter>
        <BlogSearch showFilters={true} />
      </BrowserRouter>
    );
    
    const filterButton = screen.getByLabelText(/toggle filters/i);
    await userEvent.click(filterButton);
    
    // Check if filter options are visible
    await waitFor(() => {
      expect(screen.getByText(/category/i)).toBeInTheDocument();
      expect(screen.getByText(/tags/i)).toBeInTheDocument();
      expect(screen.getByText(/author/i)).toBeInTheDocument();
    });
  });

  it('navigates to blog post when result is clicked', async () => {
    const mockPosts = {
      data: [
        {
          id: '1',
          slug: 'test-post',
          title: 'Test Post',
          excerpt: 'This is a test post',
          content: 'Content',
          author_id: 'author-1',
          status: 'published' as const,
          featured: false,
          allow_comments: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ],
      count: 1,
    };
    
    vi.mocked(blogService.getPosts).mockResolvedValue(mockPosts);
    
    render(
      <BrowserRouter>
        <BlogSearch />
      </BrowserRouter>
    );
    
    const searchInput = screen.getByPlaceholderText(/search articles/i);
    await userEvent.type(searchInput, 'test');
    
    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument();
    });
    
    const resultItem = screen.getByText('Test Post');
    await userEvent.click(resultItem);
    
    expect(mockNavigate).toHaveBeenCalledWith('/blog/test-post');
  });

  it('shows no results message when search returns empty', async () => {
    vi.mocked(blogService.getPosts).mockResolvedValue({ data: [], count: 0 });
    
    render(
      <BrowserRouter>
        <BlogSearch />
      </BrowserRouter>
    );
    
    const searchInput = screen.getByPlaceholderText(/search articles/i);
    await userEvent.type(searchInput, 'nonexistent');
    
    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
  });
});