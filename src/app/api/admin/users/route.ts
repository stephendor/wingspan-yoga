import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, isAdmin } from '@/lib/auth/middleware';
import { MembershipType, MembershipStatus } from '@prisma/client';

interface UserListResponse {
  success: boolean;
  users?: Array<{
    id: string;
    email: string;
    name: string;
    membershipType: string;
    membershipStatus: string;
    createdAt: string;
  }>;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<UserListResponse>> {
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

    // Check if user has admin role
    if (!isAdmin(request)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required'
        },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '10')));
    const search = searchParams.get('search') || '';
    const membershipType = searchParams.get('membershipType') || '';
    const membershipStatus = searchParams.get('membershipStatus') || '';

    // Build where clause
    const where: {
      OR?: Array<{
        email?: { contains: string; mode: 'insensitive' };
        name?: { contains: string; mode: 'insensitive' };
      }>;
      membershipType?: MembershipType;
      membershipStatus?: MembershipStatus;
    } = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (membershipType) {
      where.membershipType = membershipType as MembershipType;
    }
    
    if (membershipStatus) {
      where.membershipStatus = membershipStatus as MembershipStatus;
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        membershipType: true,
        membershipStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        membershipType: user.membershipType,
        membershipStatus: user.membershipStatus,
        createdAt: user.createdAt.toISOString(),
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });

  } catch (error) {
    console.error('Get users list error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve users list'
      },
      { status: 500 }
    );
  }
}
