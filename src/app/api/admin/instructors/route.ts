import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const instructors = await prisma.instructor.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        specialties: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ success: true, instructors });
  } catch (error) {
    console.error('Error fetching instructors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch instructors' },
      { status: 500 }
    );
  }
}
