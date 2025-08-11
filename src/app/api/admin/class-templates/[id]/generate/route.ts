import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { weeks = 12 } = body;
    const templateId = params.id;

    // Get the template
    const template = await prisma.classTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    const instances = [];
    const today = new Date();
    const endDate = new Date(today.getTime() + (weeks * 7 * 24 * 60 * 60 * 1000));

    // Find the first occurrence of the template's day of week
    const currentDate = new Date(today);
    while (currentDate.getDay() !== template.dayOfWeek) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Generate instances for each week
    while (currentDate <= endDate) {
      // Check if this date has an exception
      const hasException = await prisma.classException.findUnique({
        where: {
          templateId_date: {
            templateId: templateId,
            date: currentDate,
          },
        },
      });

      // Check if instance already exists
      const existingInstance = await prisma.classInstance.findUnique({
        where: {
          templateId_date: {
            templateId: templateId,
            date: new Date(currentDate),
          },
        },
      });

      if (!hasException && !existingInstance) {
        const [startHour, startMinute] = template.startTime.split(':').map(Number);
        const [endHour, endMinute] = template.endTime.split(':').map(Number);

        const startTime = new Date(currentDate);
        startTime.setHours(startHour, startMinute, 0, 0);

        const endTime = new Date(currentDate);
        endTime.setHours(endHour, endMinute, 0, 0);

        instances.push({
          templateId: templateId,
          date: new Date(currentDate),
          startTime: startTime,
          endTime: endTime,
          capacity: template.capacity,
          price: template.price,
          instructorId: template.instructorId,
        });
      }

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }

    if (instances.length > 0) {
      await prisma.classInstance.createMany({
        data: instances,
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Generated ${instances.length} class instances`,
      count: instances.length 
    });
  } catch (error) {
    console.error('Error generating instances:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate instances' },
      { status: 500 }
    );
  }
}
