import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { MembershipType } from '@prisma/client';

interface VideoDetailsResponse {
  success: boolean;
  video?: {
    id: string;
    title: string;
    description: string | null;
    duration: number;
    thumbnailUrl: string | null;
    category: string;
    difficulty: string;
    tags: string[];
    membershipRequired: MembershipType;
    isPublic: boolean;
    hasAccess: boolean;
    viewCount: number;
    instructor: {
      id: string;
      name: string;
      avatar: string | null;
      bio: string | null;
    };
    progress?: {
      progress: number;
      completed: boolean;
      lastWatched: string;
    };
  };
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
): Promise<NextResponse<VideoDetailsResponse>> {
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

    // Await params (Next.js 15 requirement)
    const { videoId } = await params;

    // Get video details from database
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
        progress: {
          where: { userId: authUser.id },
          select: {
            progress: true,
            completed: true,
            lastWatched: true,
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json(
        {
          success: false,
          error: 'Video not found'
        },
        { status: 404 }
      );
    }

    // Check membership access
    const membershipLevels = {
      FREE: 0,
      BASIC: 1,
      PREMIUM: 2,
      UNLIMITED: 3,
      ADMIN: 999,
    };

    const userLevel = membershipLevels[authUser.membershipType as MembershipType] || 0;
    const requiredLevel = membershipLevels[video.membershipRequired] || 0;
    const hasAccess = video.isPublic || userLevel >= requiredLevel;

    // Get user's progress for this video (if any)
    const userProgress = video.progress.length > 0 ? video.progress[0] : null;

    return NextResponse.json({
      success: true,
      video: {
        id: video.id,
        title: video.title,
        description: video.description,
        duration: video.duration,
        thumbnailUrl: video.thumbnailUrl,
        category: video.category,
        difficulty: video.difficulty,
        tags: video.tags,
        membershipRequired: video.membershipRequired,
        isPublic: video.isPublic,
        hasAccess,
        viewCount: video.viewCount,
        instructor: video.instructor,
        progress: userProgress ? {
          progress: userProgress.progress,
          completed: userProgress.completed,
          lastWatched: userProgress.lastWatched.toISOString(),
        } : undefined,
      },
    });

  } catch (error) {
    console.error('Get video details error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve video details'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
): Promise<NextResponse> {
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

    // Await params (Next.js 15 requirement)
    const { videoId } = await params;

    // Parse request body for progress update
    const body = await request.json();
    const { progress, completed } = body;

    // Validate input
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Progress must be a number between 0 and 100'
        },
        { status: 400 }
      );
    }

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true },
    });

    if (!video) {
      return NextResponse.json(
        {
          success: false,
          error: 'Video not found'
        },
        { status: 404 }
      );
    }

    // Update or create progress record
    const updatedProgress = await prisma.videoProgress.upsert({
      where: {
        userId_videoId: {
          userId: authUser.id,
          videoId,
        },
      },
      update: {
        progress,
        completed: completed !== undefined ? completed : progress >= 90,
        lastWatched: new Date(),
      },
      create: {
        userId: authUser.id,
        videoId,
        progress,
        completed: completed !== undefined ? completed : progress >= 90,
        lastWatched: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      progress: {
        progress: updatedProgress.progress,
        completed: updatedProgress.completed,
        lastWatched: updatedProgress.lastWatched.toISOString(),
      },
    });

  } catch (error) {
    console.error('Update video progress error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update video progress'
      },
      { status: 500 }
    );
  }
}