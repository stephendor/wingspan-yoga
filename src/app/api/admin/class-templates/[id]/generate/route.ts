import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';

export async function POST(request: Request, context: unknown) {
  try {
    const body = await request.json();
    const { weeks = 12 } = body as { weeks?: number };
    const params = await (context as { params?: Promise<{ id?: string }> })?.params;
    const templateId = params?.id || '';
    
    console.log(`=== Generate Instances Request ===`);
    console.log(`Template ID: ${templateId}`);
    console.log(`Weeks requested: ${weeks}`);
    
    if (!templateId) {
      return NextResponse.json({ success: false, error: 'Missing template id' }, { status: 400 });
    }

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

    console.log(`Template found: ${template.title}, Day of week: ${template.dayOfWeek}`);

    const instances = [];
    const today = new Date();
    console.log(`Today: ${today.toISOString().split('T')[0]}`);

    // Find the first occurrence of the template's day of week (starting from today or later)
    const currentDate = new Date(today);
    while (currentDate.getDay() !== template.dayOfWeek) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log(`First class date: ${currentDate.toISOString().split('T')[0]}`);

    // Generate instances for the specified number of weeks
    let weeksGenerated = 0;
    let skippedCount = 0;
    let createdCount = 0;
    
    while (weeksGenerated < weeks) {
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

      console.log(`Week ${weeksGenerated + 1}: ${currentDate.toISOString().split('T')[0]} - Exception: ${!!hasException}, Existing: ${!!existingInstance}`);

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
        createdCount++;
      } else {
        skippedCount++;
      }

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
      weeksGenerated++;
    }

    if (instances.length > 0) {
      console.log(`Attempting to create ${instances.length} instances in database...`);
      console.log('Sample instance data:', JSON.stringify(instances[0], null, 2));
      
      try {
        const result = await prisma.classInstance.createMany({
          data: instances,
        });
        console.log(`Database createMany result:`, result);
        
        // Verify the instances were actually created
        const count = await prisma.classInstance.count({
          where: { templateId: templateId }
        });
        console.log(`Total instances now in database for this template: ${count}`);
        
        // Show the most recent instances for this template
        const recentInstances = await prisma.classInstance.findMany({
          where: { templateId: templateId },
          orderBy: { date: 'desc' },
          take: 5,
          select: { id: true, date: true, startTime: true, endTime: true }
        });
        console.log('Most recent 5 instances for this template:', recentInstances);
        
      } catch (error) {
        console.error('Database error during createMany:', error);
        return NextResponse.json({ 
          success: false, 
          error: 'Database error during instance creation',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    } else {
      console.log('No instances to create - all were skipped');
    }

    return NextResponse.json({ 
      success: true, 
      message: `Generated ${instances.length} class instances (${createdCount} created, ${skippedCount} skipped, ${weeksGenerated} weeks processed)`,
      count: instances.length,
      debug: {
        weeksRequested: weeks,
        weeksProcessed: weeksGenerated,
        created: createdCount,
        skipped: skippedCount
      }
    });
  } catch (error) {
    console.error('Error generating instances:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate instances' },
      { status: 500 }
    );
  }
}
