import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { BlogPostAccessLevel, Prisma } from '@prisma/client';
import { AuthUser } from '@/lib/auth/types';

interface BlogPostsListResponse {
  success: boolean;
  posts?: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    featuredImage?: string;
    category?: string;
    published: boolean;
    publishedAt?: string;
    accessLevel: BlogPostAccessLevel;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    author?: {
      id: string;
      name: string;
      avatar: string | null;
    };
    hasAccess: boolean;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

interface CreateBlogPostRequest {
  title: string;
  slug?: string;
  excerpt?: string;
  contentBlocks?: Prisma.InputJsonValue;
  metaDescription?: string;
  featuredImage?: string;
  category?: string;
  published?: boolean;
  accessLevel?: BlogPostAccessLevel;
  tags?: string[];
}

interface BlogPostResponse {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  contentBlocks: Prisma.JsonValue;
  metaDescription: string | null;
  featuredImage: string | null;
  category: string | null;
  published: boolean;
  publishedAt: string | null;
  accessLevel: BlogPostAccessLevel;
  tags: string[];
  authorId: string | null;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
}

interface CreateBlogPostApiResponse {
  success: boolean;
  post?: BlogPostResponse;
  error?: string;
}

// Utility function to check blog post access
function hasAccessToPost(
  post: { accessLevel: BlogPostAccessLevel; published: boolean },
  user: AuthUser | null,
  hasRetreatBookings: boolean = false
): boolean {
  // Unpublished posts are only visible to admins/instructors
  if (!post.published && (!user || (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR'))) {
    return false;
  }

  // Check access level
  switch (post.accessLevel) {
    case 'PUBLIC':
      return true;
      
    case 'MEMBERS_ONLY':
      return user !== null && ['BASIC', 'PREMIUM', 'UNLIMITED', 'ADMIN'].includes(user.membershipType);
      
    case 'PREMIUM_ONLY':
      return user !== null && ['PREMIUM', 'UNLIMITED', 'ADMIN'].includes(user.membershipType);
      
    case 'RETREAT_ATTENDEES_ONLY':
      return user !== null && (hasRetreatBookings || user.membershipType === 'ADMIN');
      
    case 'MAILCHIMP_SUBSCRIBERS_ONLY':
      // TODO: Implement Mailchimp integration
      return user !== null && user.membershipType === 'ADMIN'; // Admin only for now
      
    default:
      return false;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<BlogPostsListResponse>> {
  try {
    const authUser = getAuthenticatedUser(request);
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const accessLevel = searchParams.get('accessLevel') as BlogPostAccessLevel;
    const published = searchParams.get('published');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // Build where clause
    const whereClause: Prisma.BlogPostWhereInput = {};

    // Only show published posts to non-admin users
    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'INSTRUCTOR')) {
      whereClause.published = true;
    } else if (published !== null) {
      whereClause.published = published === 'true';
    }

    // Add search functionality
    if (search) {
      whereClause.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          excerpt: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          tags: {
            hasSome: [search.toLowerCase()],
          },
        },
      ];
    }

    // Filter by category
    if (category) {
      whereClause.category = category;
    }

    // Filter by tag
    if (tag) {
      whereClause.tags = {
        has: tag,
      };
    }

    // Filter by access level (admin only)
    if (accessLevel && authUser && (authUser.role === 'ADMIN' || authUser.role === 'INSTRUCTOR')) {
      whereClause.accessLevel = accessLevel;
    }

    // Filter by year and month
    if (year) {
      const yearInt = parseInt(year);
      if (!isNaN(yearInt)) {
        const startDate = new Date(yearInt, month ? parseInt(month) - 1 : 0, 1);
        const endDate = month 
          ? new Date(yearInt, parseInt(month), 0) // Last day of the month
          : new Date(yearInt + 1, 0, 0); // Last day of the year
        
        whereClause.publishedAt = {
          gte: startDate,
          lte: endDate,
        };
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Check if user has retreat bookings (for RETREAT_ATTENDEES_ONLY access)
    let hasRetreatBookings = false;
    if (authUser) {
      const retreatBookingsCount = await prisma.retreatBooking.count({
        where: {
          userId: authUser.id,
          paymentStatus: {
            in: ['DEPOSIT_PAID', 'PAID_IN_FULL'],
          },
        },
      });
      hasRetreatBookings = retreatBookingsCount > 0;
    }

    // Fetch blog posts
    const posts = await prisma.blogPost.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
    });

    // Filter posts based on access control and format response
    const accessiblePosts = posts
      .filter(post => hasAccessToPost(post, authUser, hasRetreatBookings))
      .map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || undefined,
        featuredImage: post.featuredImage || undefined,
        category: post.category || undefined,
        published: post.published,
        publishedAt: post.publishedAt?.toISOString(),
        accessLevel: post.accessLevel,
        tags: post.tags,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        author: post.author || undefined,
        hasAccess: true, // All returned posts have access
      }));

    return NextResponse.json({
      success: true,
      posts: accessiblePosts,
      pagination: {
        page,
        limit,
        total: accessiblePosts.length, // Use filtered count
        totalPages: Math.ceil(accessiblePosts.length / limit),
      },
    });

  } catch (error) {
    console.error('Blog posts list error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve blog posts'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<CreateBlogPostApiResponse>> {
  try {
    const authUser = getAuthenticatedUser(request);
    
    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'INSTRUCTOR')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized. Admin or Instructor access required.'
        },
        { status: 401 }
      );
    }

    const data: CreateBlogPostRequest = await request.json();

    // Generate slug if not provided
    let slug = data.slug;
    if (!slug) {
      slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Ensure slug is unique
      const existingPost = await prisma.blogPost.findUnique({
        where: { slug },
      });
      
      if (existingPost) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Create blog post
    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        contentBlocks: data.contentBlocks,
        metaDescription: data.metaDescription,
        featuredImage: data.featuredImage,
        category: data.category,
        published: data.published || false,
        publishedAt: data.published ? new Date() : null,
        accessLevel: data.accessLevel || 'PUBLIC',
        tags: data.tags || [],
        authorId: authUser.id,
        authorName: authUser.name, // Legacy field
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        contentBlocks: post.contentBlocks,
        metaDescription: post.metaDescription,
        featuredImage: post.featuredImage,
        category: post.category,
        published: post.published,
        publishedAt: post.publishedAt?.toISOString() || null,
        accessLevel: post.accessLevel,
        tags: post.tags,
        authorId: post.authorId,
        authorName: post.authorName,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        author: post.author,
      },
    });

  } catch (error) {
    console.error('Create blog post error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create blog post'
      },
      { status: 500 }
    );
  }
}