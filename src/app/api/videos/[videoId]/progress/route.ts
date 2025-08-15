import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    // Await and destructure params
    const { videoId } = await params;
    
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the video to check if it exists and get its duration
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true, duration: true },
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { currentTime } = body;

    if (typeof currentTime !== 'number' || currentTime < 0) {
      return NextResponse.json(
        { error: 'Invalid currentTime value' },
        { status: 400 }
      );
    }

    // Calculate completion percentage and determine if video is completed
    const completionThreshold = 0.95; // 95% threshold for completion
    const isCompleted = currentTime >= video.duration * completionThreshold;

    // Upsert the video progress record
    const videoProgress = await prisma.videoProgress.upsert({
      where: {
        userId_videoId: {
          userId: user.id,
          videoId: videoId,
        },
      },
      update: {
        progress: currentTime,
        completed: isCompleted,
        lastWatched: new Date(),
      },
      create: {
        userId: user.id,
        videoId: videoId,
        progress: currentTime,
        completed: isCompleted,
        lastWatched: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        progress: videoProgress.progress,
        completed: videoProgress.completed,
        lastWatched: videoProgress.lastWatched,
      },
    });
  } catch (error) {
    console.error('Error updating video progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    // Await and destructure params
    const { videoId } = await params;
    
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the video progress for this user and video
    const videoProgress = await prisma.videoProgress.findUnique({
      where: {
        userId_videoId: {
          userId: user.id,
          videoId: videoId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: videoProgress || null,
    });
  } catch (error) {
    console.error('Error fetching video progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

