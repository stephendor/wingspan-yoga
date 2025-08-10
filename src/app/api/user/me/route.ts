import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth/middleware';

interface UserProfileResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    membershipType: string;
    membershipStatus: string;
    bio?: string;
    phone?: string;
    createdAt: string;
  };
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<UserProfileResponse>> {
  try {
    // Get authenticated user from middleware headers
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

    // Fetch full user profile from database
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        membershipType: true,
        membershipStatus: true,
        bio: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        membershipType: user.membershipType,
        membershipStatus: user.membershipStatus,
        bio: user.bio || undefined,
        phone: user.phone || undefined,
        createdAt: user.createdAt.toISOString(),
      },
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve user profile'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse<UserProfileResponse>> {
  try {
    // Get authenticated user from middleware headers
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

    // Parse request body
    const body = await request.json();
    const { name, bio, phone } = body;

    // Validate input
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name must be a non-empty string'
        },
        { status: 400 }
      );
    }

    if (bio !== undefined && typeof bio !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Bio must be a string'
        },
        { status: 400 }
      );
    }

    if (phone !== undefined && typeof phone !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Phone must be a string'
        },
        { status: 400 }
      );
    }

    // Update user profile
    const updateData: { name?: string; bio?: string; phone?: string } = {};
    if (name !== undefined) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio.trim() || null;
    if (phone !== undefined) updateData.phone = phone.trim() || null;

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        membershipType: true,
        membershipStatus: true,
        bio: true,
        phone: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        membershipType: updatedUser.membershipType,
        membershipStatus: updatedUser.membershipStatus,
        bio: updatedUser.bio || undefined,
        phone: updatedUser.phone || undefined,
        createdAt: updatedUser.createdAt.toISOString(),
      },
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user profile'
      },
      { status: 500 }
    );
  }
}
