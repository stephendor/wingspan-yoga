import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

// Update media organization fields
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getAuthenticatedUser(request);
    
    // Check if user is admin
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Extract update fields
    const updateData: Record<string, unknown> = {};
    
    if ('tags' in body && Array.isArray(body.tags)) {
      updateData.tags = body.tags;
    }
    
    if ('categoryId' in body) {
      updateData.categoryId = body.categoryId;
    }
    
    if ('accessLevel' in body) {
      // Validate access level
      const validAccessLevels = ['PUBLIC', 'MEMBERS_ONLY', 'PRIVATE', 'RETREATS', 'WORKSHOPS', 'INSTRUCTORS_ONLY'];
      if (validAccessLevels.includes(body.accessLevel)) {
        updateData.accessLevel = body.accessLevel;
      }
    }
    
    if ('directory' in body) {
      updateData.directory = body.directory;
    }

    // Update the media file
    const updatedMedia = await prisma.media.update({
      where: { id },
      data: updateData,
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
          },
        },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              parentId: true,
            },
          },
      },
    });

    return NextResponse.json({
      success: true,
      media: {
        id: updatedMedia.id,
        filename: updatedMedia.filename,
        originalName: updatedMedia.originalName,
        mimeType: updatedMedia.mimeType,
        size: updatedMedia.size,
        width: updatedMedia.width || undefined,
        height: updatedMedia.height || undefined,
        url: updatedMedia.url,
        thumbnailUrl: updatedMedia.thumbnailUrl || undefined,
        createdAt: updatedMedia.createdAt.toISOString(),
        uploader: updatedMedia.uploader ? {
          id: updatedMedia.uploader.id,
          name: updatedMedia.uploader.name,
        } : undefined,
        tags: updatedMedia.tags || [],
        accessLevel: updatedMedia.accessLevel,
        directory: updatedMedia.directory || undefined,
        category: updatedMedia.category ? {
          id: updatedMedia.category.id,
          name: updatedMedia.category.name,
          slug: updatedMedia.category.slug,
          parentId: updatedMedia.category.parentId,
        } : undefined,
      },
    });

  } catch (error) {
    console.error('Error updating media:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update media' },
      { status: 500 }
    );
  }
}

// Delete media file
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getAuthenticatedUser(request);
    
    // Check if user is admin
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete the media record
    await prisma.media.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
