'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Calendar, User, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  category?: string;
  published: boolean;
  publishedAt?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  hasAccess: boolean;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface BlogListResponse {
  success: boolean;
  posts?: BlogPost[];
  pagination?: PaginationInfo;
  error?: string;
}

// Utility function for date formatting
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function BlogListClient() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Get year and month from URL search parameters
  const urlYear = searchParams?.get('year');
  const urlMonth = searchParams?.get('month');

  const fetchPosts = useCallback(async (page = 1, search = '', category = '', tag = '') => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        published: 'true', // Only fetch published posts for public view
      });

      if (search.trim()) {
        params.append('search', search.trim());
      }
      if (category) {
        params.append('category', category);
      }
      if (tag) {
        params.append('tag', tag);
      }
      
      // Add year and month from URL parameters if present
      if (urlYear) {
        params.append('year', urlYear);
      }
      if (urlMonth) {
        params.append('month', urlMonth);
      }

      const response = await fetch(`/api/blog-posts?${params.toString()}`);
      const data: BlogListResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch blog posts');
      }

      if (data.success && data.posts) {
        setPosts(data.posts);
        setPagination(data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load blog posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [urlYear, urlMonth]);

  const fetchMetadata = useCallback(async () => {
    try {
      const response = await fetch('/api/blog-posts/metadata');
      const data = await response.json();

      if (response.ok && data.success) {
        setAvailableCategories(data.categories || []);
        setAvailableTags(data.tags || []);
      }
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPosts();
    fetchMetadata();
  }, [fetchPosts, fetchMetadata]);

  // Handle search and filter changes
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchPosts(1, searchTerm, selectedCategory, selectedTag);
    }, 300); // Debounce search

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, selectedCategory, selectedTag, fetchPosts]);

  const handlePageChange = (newPage: number) => {
    fetchPosts(newPage, searchTerm, selectedCategory, selectedTag);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedTag('');
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button 
          onClick={() => fetchPosts()} 
          variant="outline"
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            {availableCategories.length > 0 && (
              <select
                aria-label="Filter by category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            )}

            {/* Tag Filter */}
            {availableTags.length > 0 && (
              <select
                aria-label="Filter by tag"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Tags</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            )}

            {/* Clear Filters */}
            {(searchTerm || selectedCategory || selectedTag) && (
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
                className="text-gray-600"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Results Info */}
          <div className="text-sm text-gray-600">
            {loading ? (
              'Loading...'
            ) : (
              `Found ${pagination.total} post${pagination.total !== 1 ? 's' : ''}`
            )}
          </div>
        </div>
      </div>

      {/* Blog Posts List */}
      {loading ? (
        <BlogPostsSkeleton />
      ) : posts.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
          <p className="text-gray-500 text-lg mb-4">No blog posts found</p>
          {(searchTerm || selectedCategory || selectedTag) && (
            <Button onClick={clearFilters} variant="outline">
              Clear filters to see all posts
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4">
          <Button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = i + 1;
              const isCurrentPage = page === pagination.page;

              return (
                <Button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  variant={isCurrentPage ? "primary" : "outline"}
                  size="sm"
                  className={isCurrentPage ? "bg-blue-600" : ""}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            variant="outline"
            size="sm"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex gap-6 p-6">
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="flex-shrink-0 w-32 h-32 relative overflow-hidden rounded-lg">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="space-y-3">
            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">
              <Link 
                href={`/blog/${post.slug}`}
                className="hover:text-blue-600 transition-colors"
              >
                {post.title}
              </Link>
            </h2>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-gray-600 line-clamp-3 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {/* Published Date */}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
              </div>

              {/* Author */}
              {post.author && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{post.author.name}</span>
                </div>
              )}

              {/* Category */}
              {post.category && (
                <div className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {post.category}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs hover:bg-blue-100 cursor-pointer transition-colors"
                    onClick={() => {
                      // Could implement tag filtering here
                    }}
                  >
                    #{tag}
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    +{post.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function BlogPostsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
          <div className="flex gap-6">
            <div className="w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="flex gap-4">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
