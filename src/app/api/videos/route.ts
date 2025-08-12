import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { MembershipType, VideoCategory, DifficultyLevel } from '@prisma/client';

interface VideosListResponse {
  success: boolean;
  videos?: Array<{
    id: string;
    title: string;
    description: string | null;
    duration: number;
    thumbnailUrl: string | null;
    category: VideoCategory;
    difficulty: DifficultyLevel;
    tags: string[];
    membershipRequired: MembershipType;
    isPublic: boolean;
    hasAccess: boolean;
    instructor: {
      id: string;
      name: string;
      avatar: string | null;
    };
  }>;
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<VideosListResponse>> {
  try {
    // Get authenticated user
    const authUser = getAuthenticatedUser(request);
    
    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      );
    }

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as VideoCategory | null;
    const difficulty = searchParams.get('difficulty') as DifficultyLevel | null;
    const search = searchParams.get('search');

    // Build where clause for filtering
    const whereClause: Record<string, unknown> = {};

    // Only show videos the user can access or public videos
    const userMembership = authUser.membershipType as MembershipType;
    const membershipLevels = {
      FREE: 0,
      BASIC: 1,
      PREMIUM: 2,
      UNLIMITED: 3,
      ADMIN: 999,
    };
    const userLevel = membershipLevels[userMembership] || 0;

    // Include public videos and videos within user's membership level
    whereClause.OR = [
      { isPublic: true },
      {
        isPublic: false,
        membershipRequired: {
          in: Object.entries(membershipLevels)
            .filter(([, level]) => level <= userLevel)
            .map(([type]) => type as MembershipType)
        }
      }
    ];

    // Add category filter
    if (category && Object.values(VideoCategory).includes(category)) {
      whereClause.category = category;
    }

    // Add difficulty filter
    if (difficulty && Object.values(DifficultyLevel).includes(difficulty)) {
      whereClause.difficulty = difficulty;
    }

    // Add search filter
    if (search) {
      const searchConditions = [
        {
          title: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          tags: {
            hasSome: [search.toLowerCase()],
          },
        },
      ];
      
      // If we already have OR conditions, we need to combine them with search
      if (whereClause.OR && Array.isArray(whereClause.OR)) {
        whereClause.AND = [
          { OR: whereClause.OR },
          { OR: searchConditions }
        ];
        delete whereClause.OR;
      } else {
        whereClause.OR = searchConditions;
      }
    }

    // Fetch videos from database
    const videos = await prisma.video.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        thumbnailUrl: true,
        category: true,
        difficulty: true,
        tags: true,
        membershipRequired: true,
        isPublic: true,
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' }, // Most recent first
      ],
    });

    // Add hasAccess flag for each video
    const videosWithAccess = videos.map(video => {
      const hasAccess = video.isPublic || 
        (membershipLevels[userMembership] || 0) >= (membershipLevels[video.membershipRequired] || 0);
      
      return {
        ...video,
        hasAccess,
      };
    });

    return NextResponse.json({
      success: true,
      videos: videosWithAccess,
    });

  } catch (error) {
    console.error('Get videos list error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve videos'
      },
      { status: 500 }
    );
  }
}