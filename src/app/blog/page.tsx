import { Suspense } from 'react';
import { Metadata } from 'next';
import BlogListClient from '@/app/blog/BlogListClient';
import { NewsletterSignup } from '@/components/blog/NewsletterSignup';
import ArchiveSidebar from '@/components/blog/ArchiveSidebar';

export const metadata: Metadata = {
  title: 'Blog | Wingspan Yoga - Yoga Wisdom & Wellness',
  description: 'Discover yoga wisdom, wellness tips, and mindfulness practices to enhance your journey. Expert insights from certified instructors.',
  keywords: 'yoga blog, wellness tips, mindfulness practices, yoga wisdom, meditation, yoga poses, spirituality',
  authors: [{ name: 'Wingspan Yoga' }],
  creator: 'Wingspan Yoga',
  publisher: 'Wingspan Yoga',
  openGraph: {
    title: 'Yoga Wisdom & Wellness Blog | Wingspan Yoga',
    description: 'Discover yoga wisdom, wellness tips, and mindfulness practices to enhance your journey. Expert insights from certified instructors.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://wingspan-yoga.vercel.app'}/blog`,
    siteName: 'Wingspan Yoga',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://wingspan-yoga.vercel.app'}/images/blog-hero.jpg`,
        width: 1200,
        height: 630,
        alt: 'Wingspan Yoga Blog - Yoga Wisdom & Wellness',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yoga Wisdom & Wellness Blog | Wingspan Yoga',
    description: 'Discover yoga wisdom, wellness tips, and mindfulness practices to enhance your journey.',
    images: [`${process.env.NEXT_PUBLIC_BASE_URL || 'https://wingspan-yoga.vercel.app'}/images/blog-hero.jpg`],
    creator: '@wingspanyoga',
    site: '@wingspanyoga',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://wingspan-yoga.vercel.app'}/blog`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Yoga Wisdom & Wellness
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Discover insights, tips, and practices to enhance your yoga journey and overall well-being.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Blog Posts List */}
          <div className="lg:col-span-3">
            <Suspense fallback={<BlogListingSkeleton />}>
              <BlogListClient />
            </Suspense>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-8">
            {/* Archive Navigation */}
            <ArchiveSidebar />

            {/* Newsletter Signup */}
            <NewsletterSignup 
              title="Stay Connected"
              description="Get weekly yoga insights delivered to your inbox."
              source="blog-sidebar"
              compact={true}
            />

            {/* Categories Widget */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Popular Topics</h3>
              <div className="flex flex-wrap gap-2">
                {['Meditation', 'Asanas', 'Breathing', 'Philosophy', 'Wellness'].map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition-colors"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">About Our Blog</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Welcome to our yoga blog where we share ancient wisdom and modern insights 
                to support your practice and well-being journey.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton component
function BlogListingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
