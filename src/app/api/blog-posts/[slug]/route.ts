import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { BlogPostAccessLevel } from '@prisma/client';
import { AuthUser } from '@/lib/auth/types';

interface ContentBlock {
  type: 'paragraph' | 'heading' | 'image' | 'quote' | 'list';
  content: string;
  level?: number; // for headings
  items?: string[]; // for lists
  alt?: string; // for images
}

interface BlogPostResponse {
  success: boolean;
  post?: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content?: string; // Legacy field
    contentBlocks?: unknown; // Use unknown for Prisma Json type
    metaDescription?: string;
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
      avatar?: string | null;
    };
    authorName?: string;
    authorAvatar?: string;
    hasAccess: boolean;
  };
  error?: string;
}

interface UpdateBlogPostRequest {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string; // Legacy field
  contentBlocks?: ContentBlock[];
  metaDescription?: string;
  featuredImage?: string;
  category?: string;
  published?: boolean;
  accessLevel?: BlogPostAccessLevel;
  tags?: string[];
}

// Utility function to check blog post access (same as in main route)
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
      return user ? ['BASIC', 'PREMIUM', 'UNLIMITED', 'ADMIN'].includes(user.membershipType) : false;
      
    case 'PREMIUM_ONLY':
      return user ? ['PREMIUM', 'UNLIMITED', 'ADMIN'].includes(user.membershipType) : false;
      
    case 'RETREAT_ATTENDEES_ONLY':
      return user ? (hasRetreatBookings || user.membershipType === 'ADMIN') : false;
      
    case 'MAILCHIMP_SUBSCRIBERS_ONLY':
      // TODO: Implement Mailchimp integration
      return user ? user.membershipType === 'ADMIN' : false; // Admin only for now
      
    default:
      return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<BlogPostResponse>> {
  try {
    const authUser = getAuthenticatedUser(request);
    const { slug } = await params;

    // Find the blog post
    const post = await prisma.blogPost.findUnique({
      where: { slug },
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

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog post not found'
        },
        { status: 404 }
      );
    }

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

    // Check access
    const hasAccess = hasAccessToPost(post, authUser, hasRetreatBookings);

    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied. You do not have permission to view this post.'
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || undefined,
        content: post.content || undefined,
        contentBlocks: post.contentBlocks,
        metaDescription: post.metaDescription || undefined,
        featuredImage: post.featuredImage || undefined,
        category: post.category || undefined,
        published: post.published,
        publishedAt: post.publishedAt?.toISOString(),
        accessLevel: post.accessLevel,
        tags: post.tags,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        author: post.author || undefined,
        hasAccess: true,
      },
    });

  } catch (error) {
    console.error('Get blog post error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve blog post'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<{ success: boolean; post?: BlogPostResponse['post']; error?: string }>> {
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

    const { slug } = await params;
    const data: UpdateBlogPostRequest = await request.json();

    // Find existing post
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!existingPost) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog post not found'
        },
        { status: 404 }
      );
    }

    // Check if user can edit (admin or author)
    if (authUser.role !== 'ADMIN' && existingPost.authorId !== authUser.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Permission denied. You can only edit your own posts.'
        },
        { status: 403 }
      );
    }

    // Handle slug change
    const newSlug = data.slug || existingPost.slug;
    if (data.slug && data.slug !== existingPost.slug) {
      // Check if new slug is unique
      const slugExists = await prisma.blogPost.findUnique({
        where: { slug: data.slug },
      });
      
      if (slugExists) {
        return NextResponse.json(
          {
            success: false,
            error: 'Slug already exists'
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = newSlug;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.contentBlocks !== undefined) updateData.contentBlocks = data.contentBlocks;
    if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;
    if (data.featuredImage !== undefined) updateData.featuredImage = data.featuredImage;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.accessLevel !== undefined) updateData.accessLevel = data.accessLevel;

    // Handle publish status change
    if (data.published !== undefined) {
      updateData.published = data.published;
      if (data.published && !existingPost.publishedAt) {
        updateData.publishedAt = new Date();
      } else if (!data.published) {
        updateData.publishedAt = null;
      }
    }

    // Update blog post
    const updatedPost = await prisma.blogPost.update({
      where: { slug },
      data: updateData,
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
        id: updatedPost.id,
        title: updatedPost.title,
        slug: updatedPost.slug,
        excerpt: updatedPost.excerpt || undefined,
        content: updatedPost.content || undefined,
        contentBlocks: updatedPost.contentBlocks,
        metaDescription: updatedPost.metaDescription || undefined,
        featuredImage: updatedPost.featuredImage || undefined,
        category: updatedPost.category || undefined,
        published: updatedPost.published,
        publishedAt: updatedPost.publishedAt?.toISOString(),
        accessLevel: updatedPost.accessLevel,
        tags: updatedPost.tags,
        createdAt: updatedPost.createdAt.toISOString(),
        updatedAt: updatedPost.updatedAt.toISOString(),
        author: updatedPost.author ? {
          id: updatedPost.author.id,
          name: updatedPost.author.name,
          avatar: updatedPost.author.avatar || undefined,
        } : undefined,
        authorName: updatedPost.authorName || undefined,
        authorAvatar: updatedPost.authorAvatar || undefined,
        hasAccess: true, // User has access if they can update
      },
    });

  } catch (error) {
    console.error('Update blog post error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update blog post'
      },
      { status: 500 }
    );
  }
}

// Alias PATCH as PUT for compatibility
export const PUT = PATCH;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<{ success: boolean; error?: string }>> {
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

    const { slug } = await params;

    // Find existing post
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!existingPost) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog post not found'
        },
        { status: 404 }
      );
    }

    // Check if user can delete (admin or author)
    if (authUser.role !== 'ADMIN' && existingPost.authorId !== authUser.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Permission denied. You can only delete your own posts.'
        },
        { status: 403 }
      );
    }

    // Delete blog post
    await prisma.blogPost.delete({
      where: { slug },
    });

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error('Delete blog post error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete blog post'
      },
      { status: 500 }
    );
  }
}