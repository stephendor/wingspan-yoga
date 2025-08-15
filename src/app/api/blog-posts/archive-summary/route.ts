import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth/middleware';

interface ArchiveSummaryResponse {
  success: boolean;
  archiveData?: Array<{
    year: number;
    months: Array<{
      month: number;
      monthName: string;
      postCount: number;
    }>;
    totalPosts: number;
  }>;
  error?: string;
}

interface PostWithAccess {
  id: string;
  publishedAt: Date | null;
  accessLevel: string;
  author: {
    id: string;
  } | null;
}

export async function GET(request: NextRequest): Promise<NextResponse<ArchiveSummaryResponse>> {
  try {
    const authUser = getAuthenticatedUser(request);
    
    // Build where clause - only show published posts to non-admin users
    const whereClause: {
      publishedAt: { not: null };
      published?: boolean;
    } = {
      publishedAt: {
        not: null, // Only include posts with a publish date
      },
    };

    // Only show published posts to non-admin users
    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'INSTRUCTOR')) {
      whereClause.published = true;
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

    // Fetch all published posts with their publication dates
    const posts = await prisma.blogPost.findMany({
      where: whereClause,
      select: {
        id: true,
        publishedAt: true,
        accessLevel: true,
        author: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    // Helper function to check post access (simplified version)
    const hasAccessToPost = (post: PostWithAccess) => {
      if (!authUser) {
        return post.accessLevel === 'PUBLIC';
      }

      switch (post.accessLevel) {
        case 'PUBLIC':
          return true;
        case 'MEMBERS_ONLY':
          return authUser.role === 'ADMIN' || authUser.role === 'INSTRUCTOR' || authUser.role === 'MEMBER';
        case 'RETREAT_ATTENDEES_ONLY':
          return authUser.role === 'ADMIN' || authUser.role === 'INSTRUCTOR' || hasRetreatBookings;
        case 'INSTRUCTORS_ONLY':
          return authUser.role === 'ADMIN' || authUser.role === 'INSTRUCTOR';
        case 'ADMIN_ONLY':
          return authUser.role === 'ADMIN';
        default:
          return false;
      }
    };

    // Filter posts by access control
    const accessiblePosts = posts.filter(post => hasAccessToPost(post));

    // Group posts by year and month
    const archiveMap = new Map<number, Map<number, number>>();

    accessiblePosts.forEach(post => {
      if (post.publishedAt) {
        const date = new Date(post.publishedAt);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // JavaScript months are 0-indexed

        if (!archiveMap.has(year)) {
          archiveMap.set(year, new Map());
        }

        const yearMap = archiveMap.get(year)!;
        yearMap.set(month, (yearMap.get(month) || 0) + 1);
      }
    });

    // Convert to response format
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const archiveData = Array.from(archiveMap.entries())
      .map(([year, monthMap]) => {
        const months = Array.from(monthMap.entries())
          .map(([month, postCount]) => ({
            month,
            monthName: monthNames[month - 1],
            postCount,
          }))
          .sort((a, b) => b.month - a.month); // Sort months descending

        const totalPosts = months.reduce((sum, m) => sum + m.postCount, 0);

        return {
          year,
          months,
          totalPosts,
        };
      })
      .sort((a, b) => b.year - a.year); // Sort years descending

    return NextResponse.json({
      success: true,
      archiveData,
    });

  } catch (error) {
    console.error('Archive summary error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve archive summary'
      },
      { status: 500 }
    );
  }
}
