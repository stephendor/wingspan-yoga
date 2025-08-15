/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://wingspan-yoga.vercel.app',
  generateRobotsTxt: false, // We created a custom robots.txt
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: [
    '/admin/*',
    '/api/*',
    '/auth/*',
    '/login',
    '/register',
    '/dashboard/*',
    '/instructor/*',
    '/studio/*',
    '/404',
    '/500'
  ],
  additionalPaths: async () => {
    const result = [];
    
    try {
      // Add blog posts to sitemap
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wingspan-yoga.vercel.app';
      const response = await fetch(`${baseUrl}/api/blog-posts?status=PUBLISHED&limit=1000`);
      
      if (response.ok) {
        const data = await response.json();
        const posts = data.posts || [];
        
        posts.forEach((post) => {
          result.push({
            loc: `/blog/${post.slug}`,
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: post.updatedAt || post.publishedAt || post.createdAt,
          });
        });
      }
    } catch (error) {
      console.error('Error fetching blog posts for sitemap:', error);
    }
    
    // Add static pages with custom priorities
    const staticPages = [
      { loc: '/', changefreq: 'daily', priority: 1.0 },
      { loc: '/about', changefreq: 'monthly', priority: 0.8 },
      { loc: '/blog', changefreq: 'daily', priority: 0.9 },
      { loc: '/classes', changefreq: 'weekly', priority: 0.9 },
      { loc: '/retreats', changefreq: 'weekly', priority: 0.8 },
      { loc: '/instructors', changefreq: 'monthly', priority: 0.7 },
      { loc: '/contact', changefreq: 'monthly', priority: 0.6 },
      { loc: '/pricing', changefreq: 'monthly', priority: 0.7 }
    ];
    
    return [
      ...result,
      ...staticPages
    ];
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/auth/', '/login', '/register']
      }
    ],
    additionalSitemaps: [
      'https://wingspan-yoga.vercel.app/sitemap.xml'
    ]
  }
};
