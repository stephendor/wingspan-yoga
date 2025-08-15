'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ArrowLeft, Clock, Share2 } from 'lucide-react';
import BlogContent from '@/components/blog/BlogContent';
import { BlogPostStructuredData } from '@/components/seo/BlogPostStructuredData';

// Utility function for date formatting
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface ContentBlock {
  type: 'paragraph' | 'heading' | 'image' | 'quote' | 'list';
  content: string;
  level?: number; // for headings
  items?: string[]; // for lists
  alt?: string; // for images
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string; // Tiptap JSON content
  contentBlocks?: ContentBlock[]; // Legacy format
  metaDescription?: string;
  featuredImage?: string;
  tags: string[];
  category: string;
  accessLevel:
    | 'PUBLIC'
    | 'MEMBERS_ONLY'
    | 'PREMIUM_ONLY'
    | 'RETREAT_ATTENDEES_ONLY'
    | 'MAILCHIMP_SUBSCRIBERS_ONLY';
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    name: string;
    email: string;
    avatar?: string;
  };
  authorName?: string;
  authorAvatar?: string;
}

interface ApiResponse {
  success: boolean;
  post?: BlogPost;
  error?: string;
}

interface BlogPostClientProps {
  slug: string;
}

export default function BlogPostClient({ slug }: BlogPostClientProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function renderHeadingBlock(block: ContentBlock, index: number) {
    const level = block.level || 2;
    let headingClass = 'font-semibold text-gray-900 mb-4 ';
    if (level === 1) headingClass += 'text-3xl';
    else if (level === 2) headingClass += 'text-2xl';
    else if (level === 3) headingClass += 'text-xl';
    else headingClass += 'text-lg';
    switch (level) {
      case 1:
        return <h1 key={index} className={headingClass}>{block.content}</h1>;
      case 2:
        return <h2 key={index} className={headingClass}>{block.content}</h2>;
      case 3:
        return <h3 key={index} className={headingClass}>{block.content}</h3>;
      case 4:
        return <h4 key={index} className={headingClass}>{block.content}</h4>;
      case 5:
        return <h5 key={index} className={headingClass}>{block.content}</h5>;
      default:
        return <h6 key={index} className={headingClass}>{block.content}</h6>;
    }
  }

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        const response = await fetch(`/api/blog-posts/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Blog post not found');
          } else if (response.status === 403) {
            setError('Access denied');
          } else {
            setError('Failed to load blog post');
          }
          return;
        }

        const data: ApiResponse = await response.json();
        if (!data.success || !data.post) {
          setError(data.error || 'Failed to load blog post');
          return;
        }

        setPost(data.post);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    }

    fetchPost().catch(() => {
      // Error already handled inside fetchPost
    });
  }, [slug]);

  const renderContentBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p key={index} className="text-gray-700 leading-relaxed mb-6">
            {block.content}
          </p>
        );
      
      case 'heading':
        return renderHeadingBlock(block, index);
      
      case 'image':
        return (
          <div key={index} className="my-8">
            <Image
              src={block.content}
              alt={block.alt || 'Blog post image'}
              width={800}
              height={400}
              className="w-full h-auto rounded-lg shadow-md"
            />
            {block.alt && (
              <p className="text-sm text-gray-500 text-center mt-2 italic">
                {block.alt}
              </p>
            )}
          </div>
        );
      
      case 'quote':
        return (
          <blockquote key={index} className="border-l-4 border-blue-600 pl-6 my-8 italic text-gray-700">
            <p className="text-lg leading-relaxed">&ldquo;{block.content}&rdquo;</p>
          </blockquote>
        );
      
      case 'list':
        return (
          <ul key={index} className="list-disc list-inside space-y-2 mb-6 text-gray-700">
            {block.items?.map((item, itemIndex) => (
              <li key={itemIndex} className="leading-relaxed">{item}</li>
            ))}
          </ul>
        );
      
      default:
        return null;
    }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = post?.title || 'Check out this blog post';
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      default:
        // Copy to clipboard
        try {
          await navigator.clipboard.writeText(url);
          alert('Link copied to clipboard!');
        } catch (err) {
          console.error('Failed to copy link:', err);
        }
        return;
    }
    
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const share = (platform: 'twitter' | 'facebook' | 'linkedin' | 'copy') => {
    void handleShare(platform);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-6 w-1/2"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-red-900 mb-4">Error</h1>
          <p className="text-red-700 mb-6">{error}</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <>
      <BlogPostStructuredData post={post} />
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>

      {/* Header */}
      <header className="mb-12">
        <div className="mb-6">
          <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
            {post.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            {post.title}
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            {post.excerpt}
          </p>
        </div>

        {/* Meta information */}
        <div className="flex flex-wrap items-center gap-6 text-gray-600 border-b border-gray-200 pb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.createdAt)}</span>
          </div>
          {post.author && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>5 min read</span>
          </div>
        </div>

        {/* Share buttons */}
        <div className="flex items-center gap-4 mt-6">
          <span className="text-gray-600 font-medium">Share:</span>
          <div className="flex gap-2">
            <button
              onClick={() => share('twitter')}
              aria-label="Share on Twitter"
              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </button>
            <button
              onClick={() => share('facebook')}
              aria-label="Share on Facebook"
              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
              </svg>
            </button>
            <button
              onClick={() => share('linkedin')}
              aria-label="Share on LinkedIn"
              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
            </button>
            <button
              onClick={() => share('copy')}
              aria-label="Copy link"
              className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        {post.content ? (
          // Use Tiptap content renderer for rich content
          <BlogContent content={post.content} />
        ) : post.contentBlocks ? (
          // Fallback to legacy content blocks
          post.contentBlocks.map((block, index) => renderContentBlock(block, index))
        ) : (
          // Fallback to excerpt if no content
          <p className="text-gray-700 leading-relaxed">{post.excerpt}</p>
        )}
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Navigation to related posts */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            More Blog Posts
          </Link>
          <Link
            href="/blog"
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            View All Posts →
          </Link>
        </div>
      </div>
    </article>
    </>
  );
}
