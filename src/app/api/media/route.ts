import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface MediaListResponse {
  success: boolean;
  media?: Array<{
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    url: string;
    thumbnailUrl?: string;
    createdAt: string;
    uploader?: {
      id: string;
      name: string;
    };
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<MediaListResponse>> {
  try {
    // Check authentication
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Max 100 per page
    const search = searchParams.get('search');
    const mimeType = searchParams.get('mimeType'); // 'image' or 'video'

    // Build where clause
    const whereClause: Prisma.MediaWhereInput = {};

    if (search) {
      whereClause.OR = [
        {
          originalName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          filename: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (mimeType === 'image') {
      whereClause.mimeType = {
        startsWith: 'image/',
      };
    } else if (mimeType === 'video') {
      whereClause.mimeType = {
        startsWith: 'video/',
      };
    }

    // Get total count for pagination
    const total = await prisma.media.count({ where: whereClause });
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Fetch media files
    const mediaFiles = await prisma.media.findMany({
      where: whereClause,
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const formattedMedia = mediaFiles.map(media => ({
      id: media.id,
      filename: media.filename,
      originalName: media.originalName,
      mimeType: media.mimeType,
      size: media.size,
      width: media.width || undefined,
      height: media.height || undefined,
      url: media.url,
      thumbnailUrl: media.thumbnailUrl || undefined,
      createdAt: media.createdAt.toISOString(),
      uploader: media.uploader || undefined,
    }));

    return NextResponse.json({
      success: true,
      media: formattedMedia,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });

  } catch (error) {
    console.error('Media list error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve media files'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse<{ success: boolean; error?: string }>> {
  try {
    // Check authentication
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

    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('id');

    if (!mediaId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Media ID is required'
        },
        { status: 400 }
      );
    }

    // Find the media file
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      return NextResponse.json(
        {
          success: false,
          error: 'Media file not found'
        },
        { status: 404 }
      );
    }

    // Check if user can delete (admin or owner)
    if (authUser.role !== 'ADMIN' && media.uploadedBy !== authUser.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Permission denied. You can only delete your own uploads.'
        },
        { status: 403 }
      );
    }

    // Delete from database
    await prisma.media.delete({
      where: { id: mediaId },
    });

    // TODO: Delete physical files from storage
    // For now, we'll just delete from database
    // In production, you'd want to delete from cloud storage or local filesystem

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error('Media delete error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete media file'
      },
      { status: 500 }
    );
  }
}