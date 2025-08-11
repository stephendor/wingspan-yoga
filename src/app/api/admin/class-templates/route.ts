import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create a class template (recurring class)
    const template = await (prisma as any).classTemplate.create({
      data: {
        title: body.title,
        description: body.description,
        dayOfWeek: parseInt(body.dayOfWeek),
        startTime: body.startTime,
        endTime: body.endTime,
        capacity: parseInt(body.capacity),
        price: parseInt(body.price), // Price in pence
        difficulty: body.difficulty,
        category: body.category,
        location: body.location,
        meetingUrl: body.meetingUrl,
        notes: body.notes,
        instructorId: body.instructorId,
      },
      include: {
        instructor: true,
      },
    });

    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    console.error('Error creating class template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create class template' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get all active class templates with upcoming instances
    const templates = await (prisma as any).classTemplate.findMany({
      where: { isActive: true },
      include: {
        instructor: true,
        instances: {
          where: {
            startTime: {
              gte: new Date(),
            },
          },
          orderBy: {
            startTime: 'asc',
          },
          take: 5, // Next 5 instances per template
          include: {
            instructor: true,
          },
        },
        exceptions: {
          where: {
            date: {
              gte: new Date(),
            },
          },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return NextResponse.json({ success: true, data: templates });
  } catch (error) {
    console.error('Error fetching class templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch class templates' },
      { status: 500 }
    );
  }
}
