import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { createPlaybackToken } from '@/lib/video/mux';
import { MembershipType } from '@prisma/client';

interface PlaybackInfoResponse {
  success: boolean;
  playbackInfo?: {
    playbackUrl: string;
    token: string;
    expiresAt: number;
  };
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
): Promise<NextResponse<PlaybackInfoResponse>> {
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

    // Get the video from database
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        title: true,
        streamingUrl: true, // This should contain the Mux playback ID
        membershipRequired: true,
        isPublic: true,
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

    // Check if video requires membership
    if (!video.isPublic) {
      // Check membership requirements
      const hasRequiredMembership = checkMembershipAccess(
        authUser.membershipType as MembershipType,
        video.membershipRequired
      );

      if (!hasRequiredMembership) {
        return NextResponse.json(
          {
            success: false,
            error: 'Membership required to access this video'
          },
          { status: 403 }
        );
      }
    }

    // Ensure we have a streaming URL (Mux playback ID)
    if (!video.streamingUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Video streaming not available'
        },
        { status: 500 }
      );
    }

    // Create signed playback token
    const configuredTtl = Number(process.env.MUX_TOKEN_TTL_SECONDS);
    const expiresIn = Number.isFinite(configuredTtl) && configuredTtl > 0
      ? Math.floor(configuredTtl)
      : 8 * 60 * 60; // default: 8 hours
    const token = await createPlaybackToken(video.streamingUrl, {
      expiresIn,
      viewerId: authUser.id,
    });

  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

  // Construct the playback URL with signed token (Mux expects token via query or Authorization header)
  const playbackUrl = `https://stream.mux.com/${video.streamingUrl}.m3u8?token=${token}`;

    return NextResponse.json({
      success: true,
      playbackInfo: {
        playbackUrl,
        token,
        expiresAt,
      },
    });

  } catch (error) {
    console.error('Get video playback info error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate playback information'
      },
      { status: 500 }
    );
  }
}

/**
 * Checks if user's membership level meets the video's requirements
 */
function checkMembershipAccess(
  userMembership: MembershipType,
  requiredMembership: MembershipType
): boolean {
  // Define membership hierarchy (higher number = higher access)
  const membershipLevels = {
    FREE: 0,
    BASIC: 1,
    PREMIUM: 2,
    UNLIMITED: 3,
    ADMIN: 999, // Admin always has access
  };

  const userLevel = membershipLevels[userMembership] || 0;
  const requiredLevel = membershipLevels[requiredMembership] || 0;

  return userLevel >= requiredLevel;
}