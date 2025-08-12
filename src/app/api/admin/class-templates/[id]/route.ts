import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function PUT(request: Request, context: unknown) {
  try {
    const body = await request.json();
    const templateId = (context as { params?: { id?: string } })?.params?.id || '';
    if (!templateId) {
      return NextResponse.json({ success: false, error: 'Missing template id' }, { status: 400 });
    }

    // Extract the data from the request
    const {
      title,
      description,
      category,
      location,
      dayOfWeek,
      startTime,
      endTime,
      capacity,
      price, // This comes in pence from the form
      difficulty,
      instructorId,
      meetingUrl,
      notes,
    } = body;

    // Update the template
    const updatedTemplate = await prisma.classTemplate.update({
      where: { id: templateId },
      data: {
        title,
        description,
        category,
        location,
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        capacity: parseInt(capacity),
        price: parseInt(price), // Already in pence
        difficulty,
        instructorId,
        meetingUrl: meetingUrl || null,
        notes: notes || null,
        updatedAt: new Date(),
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTemplate,
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update template' },
      { status: 500 }
    );
  }
}
