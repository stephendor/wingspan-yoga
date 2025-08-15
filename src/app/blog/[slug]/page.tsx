import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import BlogPostClient from './BlogPostClient';
import { NewsletterSignup } from '@/components/blog/NewsletterSignup';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/blog-posts/${slug}`, {
      cache: 'no-store', // Always fetch fresh data for metadata
    });

    if (!response.ok) {
      return {
        title: 'Blog Post Not Found | Wingspan Yoga',
        description: 'The requested blog post could not be found.',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const data = await response.json();
    const post = data.post;

    if (!post) {
      return {
        title: 'Blog Post Not Found | Wingspan Yoga',
        description: 'The requested blog post could not be found.',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const siteUrl = baseUrl;
    const postUrl = `${siteUrl}/blog/${post.slug}`;
    const imageUrl = post.featuredImage?.startsWith('http') 
      ? post.featuredImage 
      : post.featuredImage 
        ? `${siteUrl}${post.featuredImage}` 
        : `${siteUrl}/images/default-blog-image.jpg`;

    const publishedTime = post.publishedAt || post.createdAt;
    const modifiedTime = post.updatedAt;

    return {
      title: `${post.title} | Wingspan Yoga Blog`,
      description: post.metaDescription || post.excerpt || `Discover ${post.title} on the Wingspan Yoga blog. Explore yoga wisdom, wellness tips, and mindfulness practices.`,
      keywords: post.tags?.join(', ') || 'yoga, wellness, mindfulness, meditation',
      authors: [{ name: post.author?.name || post.authorName || 'Wingspan Yoga' }],
      creator: post.author?.name || post.authorName || 'Wingspan Yoga',
      publisher: 'Wingspan Yoga',
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      robots: {
        index: post.published && post.accessLevel === 'PUBLIC',
        follow: true,
        nocache: false,
        googleBot: {
          index: post.published && post.accessLevel === 'PUBLIC',
          follow: true,
          noimageindex: false,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      alternates: {
        canonical: postUrl,
      },
      openGraph: {
        title: post.title,
        description: post.metaDescription || post.excerpt || `Discover ${post.title} on the Wingspan Yoga blog.`,
        url: postUrl,
        siteName: 'Wingspan Yoga',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          }
        ],
        locale: 'en_US',
        type: 'article',
        publishedTime,
        modifiedTime,
        authors: post.author?.name ? [post.author.name] : undefined,
        tags: post.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.metaDescription || post.excerpt || `Discover ${post.title} on the Wingspan Yoga blog.`,
        images: [imageUrl],
        creator: '@wingspanyoga',
        site: '@wingspanyoga',
      },
      other: {
        'article:author': post.author?.name || post.authorName || 'Wingspan Yoga',
        'article:published_time': publishedTime,
        'article:modified_time': modifiedTime,
        'article:section': post.category || 'Yoga & Wellness',
        'article:tag': post.tags?.join(', ') || 'yoga, wellness',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Blog Post | Wingspan Yoga',
      description: 'Read our latest yoga and wellness insights.',
      robots: {
        index: false,
        follow: true,
      },
    };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <main className="lg:col-span-3">
            <Suspense fallback={<BlogPostSkeleton />}>
              <BlogPostClient slug={slug} />
            </Suspense>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-8">
            {/* Newsletter Signup */}
            <NewsletterSignup 
              title="Stay Connected"
              description="Get weekly yoga insights delivered to your inbox."
              source="blog-post"
              compact={true}
            />

            {/* Back to Blog */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Explore More</h3>
              <div className="space-y-3">
                <Link
                  href="/blog"
                  className="block text-blue-600 hover:text-blue-800 transition-colors"
                >
                  ← Back to Blog
                </Link>
                <p className="text-gray-600 text-sm">
                  Discover more yoga wisdom, wellness tips, and mindfulness practices.
                </p>
              </div>
            </div>

            {/* Share */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Share This Post</h3>
              <div className="flex gap-3">
                <button 
                  aria-label="Share on Twitter"
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </button>
                <button 
                  aria-label="Share on Facebook"
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </button>
                <button 
                  aria-label="Share on LinkedIn"
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function BlogPostSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-8 animate-pulse">
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
}
