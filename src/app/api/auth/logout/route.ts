import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma';

interface LogoutResponse {
  success: boolean;
  message: string;
}

export async function POST(): Promise<NextResponse<LogoutResponse>> {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not authenticated'
        },
        { status: 401 }
      );
    }

    // Clean up any existing sessions in the database for this user
    try {
      await prisma.session.deleteMany({
        where: {
          userId: session.user.id,
        },
      });
    } catch (dbError) {
      console.warn('Failed to clean up database sessions:', dbError);
      // Continue with logout even if DB cleanup fails
    }

    // The actual sign out will be handled by NextAuth
    // This API primarily handles server-side cleanup
    return NextResponse.json({
      success: true,
      message: 'Successfully logged out'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}
