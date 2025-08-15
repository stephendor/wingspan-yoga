interface BlogPostStructuredDataProps {
  post: {
    title: string;
    slug: string;
    excerpt?: string;
    metaDescription?: string;
    featuredImage?: string;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
    category?: string;
    author?: {
      name: string;
      avatar?: string;
    };
    authorName?: string;
    authorAvatar?: string;
  };
}

export function BlogPostStructuredData({ post }: BlogPostStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const postUrl = `${baseUrl}/blog/${post.slug}`;
  const imageUrl = post.featuredImage?.startsWith('http') 
    ? post.featuredImage 
    : post.featuredImage 
      ? `${baseUrl}${post.featuredImage}` 
      : `${baseUrl}/images/default-blog-image.jpg`;

  const authorName = post.author?.name || post.authorName || 'Wingspan Yoga';
  const authorImage = post.author?.avatar || post.authorAvatar;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription || post.excerpt || `Discover ${post.title} on the Wingspan Yoga blog.`,
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      width: 1200,
      height: 630,
    },
    url: postUrl,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: authorName,
      image: authorImage ? {
        '@type': 'ImageObject',
        url: authorImage.startsWith('http') ? authorImage : `${baseUrl}${authorImage}`,
      } : undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Wingspan Yoga',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.png`,
        width: 200,
        height: 60,
      },
      url: baseUrl,
    },
    articleSection: post.category || 'Yoga & Wellness',
    keywords: post.tags?.join(', ') || 'yoga, wellness, mindfulness, meditation',
    articleBody: post.metaDescription || post.excerpt || '',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    inLanguage: 'en-US',
  };

  // Add breadcrumb structured data
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${baseUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: postUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />
    </>
  );
}
