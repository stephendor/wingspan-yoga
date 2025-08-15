import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/nextauth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.membershipType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const categories = await prisma.mediaCategory.findMany({
      include: {
        children: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            media: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('Error fetching media categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.membershipType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, parentId, sortOrder } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingCategory = await prisma.mediaCategory.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.mediaCategory.create({
      data: {
        name,
        slug,
        description,
        parentId: parentId || null,
        sortOrder: sortOrder || 0,
      },
      include: {
        children: true,
        _count: {
          select: {
            media: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error('Error creating media category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.membershipType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, description, parentId, sortOrder, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (name) {
      updateData.name = name;
      // Update slug if name changes
      updateData.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    if (description !== undefined) updateData.description = description;
    if (parentId !== undefined) updateData.parentId = parentId;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    const category = await prisma.mediaCategory.update({
      where: { id },
      data: updateData,
      include: {
        children: true,
        _count: {
          select: {
            media: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error('Error updating media category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.membershipType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if category has media files
    const mediaCount = await prisma.media.count({
      where: { categoryId: id },
    });

    if (mediaCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with media files' },
        { status: 400 }
      );
    }

    // Check if category has children
    const childrenCount = await prisma.mediaCategory.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with subcategories' },
        { status: 400 }
      );
    }

    await prisma.mediaCategory.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting media category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
