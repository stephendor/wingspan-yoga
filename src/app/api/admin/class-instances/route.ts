import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { MembershipType } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { membershipType: true }
    });

    if (user?.membershipType !== MembershipType.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all class instances from today onwards
    const instances = await prisma.classInstance.findMany({
      where: {
        startTime: {
          gte: new Date(),
        },
      },
      include: {
        template: {
          select: {
            id: true,
            title: true,
            category: true,
            difficulty: true,
            location: true,
            isActive: true,
            capacity: true,
            price: true,
            instructor: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      instances
    });

  } catch (error) {
    console.error('Error fetching class instances:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('=== CLASS INSTANCE API ===');
    console.log('Session:', JSON.stringify(session, null, 2));
    console.log('Session user ID:', session?.user?.id);
    console.log('Session user ID type:', typeof session?.user?.id);
    
    if (!session?.user?.id) {
      console.log('No session or user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, membershipType: true }
    });

    console.log('User from database:', JSON.stringify(user, null, 2));
    
    // Debug: List all users to see what IDs exist
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, membershipType: true }
    });
    console.log('All users in database:', JSON.stringify(allUsers, null, 2));
    
    console.log('MembershipType.ADMIN:', MembershipType.ADMIN);
    console.log('user?.membershipType === MembershipType.ADMIN:', user?.membershipType === MembershipType.ADMIN);

    if (user?.membershipType !== MembershipType.ADMIN) {
      console.log('User is not admin, returning 403');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      instructorId,
      date,
      endDate, // Add endDate for multi-day events
      startTime,
      endTime,
      capacity,
      price,
      difficulty,
      category,
      location,
      meetingUrl
    } = body;

    // Map location to valid enum value
    let mappedLocation: 'STUDIO' | 'ONLINE' | 'HYBRID' = 'ONLINE';
    if (location) {
      if (location === 'Studio A' || location === 'Studio B') {
        mappedLocation = 'STUDIO';
      } else if (location === 'Outdoor Deck') {
        mappedLocation = 'HYBRID';
      } else if (location === 'Online') {
        mappedLocation = 'ONLINE';
      }
    }

    // Validate required fields
    if (!title || !instructorId || !date || !startTime || !endTime || !capacity || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify instructor exists
    const instructor = await prisma.instructor.findUnique({
      where: { id: instructorId },
      select: { id: true, name: true }
    });

    if (!instructor) {
      return NextResponse.json(
        { error: 'Invalid instructor' },
        { status: 400 }
      );
    }

    // Parse date and time
    const startDate = new Date(date);
    const endEventDate = endDate ? new Date(endDate) : startDate;
    const [startHour, startMinute] = startTime.split(':');
    const [endHour, endMinute] = endTime.split(':');

    // Validate end date is not before start date
    if (endEventDate < startDate) {
      return NextResponse.json(
        { error: 'End date cannot be before start date' },
        { status: 400 }
      );
    }

    // Generate array of dates for the event
    const eventDates: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endEventDate) {
      eventDates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log('Creating instances for dates:', eventDates.map(d => d.toISOString().split('T')[0]));

    // Check for instructor conflicts on all dates
    for (const eventDate of eventDates) {
      const startDateTime = new Date(eventDate);
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
      
      const endDateTime = new Date(eventDate);
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

      // Validate end time is after start time
      if (endDateTime <= startDateTime) {
        return NextResponse.json(
          { error: 'End time must be after start time' },
          { status: 400 }
        );
      }

      const conflictingClass = await prisma.classInstance.findFirst({
        where: {
          instructorId,
          OR: [
            {
              AND: [
                { startTime: { lte: startDateTime } },
                { endTime: { gt: startDateTime } }
              ]
            },
            {
              AND: [
                { startTime: { lt: endDateTime } },
                { endTime: { gte: endDateTime } }
              ]
            },
            {
              AND: [
                { startTime: { gte: startDateTime } },
                { endTime: { lte: endDateTime } }
              ]
            }
          ]
        }
      });

      if (conflictingClass) {
        return NextResponse.json(
          { error: `Instructor has a conflicting class on ${eventDate.toDateString()} at this time` },
          { status: 409 }
        );
      }
    }

    // Create a temporary template for this single class/event
    // This allows us to use the existing ClassInstance system
    const template = await prisma.classTemplate.create({
      data: {
        title,
        description: endDate ? `Multi-day event: ${title}` : `Single class: ${title}`,
        dayOfWeek: startDate.getDay(),
        startTime: `${startHour}:${startMinute}`,
        endTime: `${endHour}:${endMinute}`,
        capacity: parseInt(capacity),
        price: Math.round(parseFloat(price) * 100), // Convert to pence
        difficulty: difficulty || 'ALL_LEVELS',
        category: category?.toUpperCase() || 'VINYASA',
        location: mappedLocation,
        meetingUrl: mappedLocation === 'ONLINE' ? meetingUrl : null,
        instructorId,
        isActive: false // Mark as inactive since it's just for this single instance/event
      }
    });

    // Create class instances for all dates
    const createdInstances = [];
    
    for (const eventDate of eventDates) {
      const startDateTime = new Date(eventDate);
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
      
      const endDateTime = new Date(eventDate);
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

      const classInstance = await prisma.classInstance.create({
        data: {
          date: eventDate,
          startTime: startDateTime,
          endTime: endDateTime,
          capacity: parseInt(capacity),
          price: Math.round(parseFloat(price) * 100), // Convert to pence
          templateId: template.id,
          instructorId
        },
        include: {
          template: {
            select: {
              title: true,
              category: true,
              difficulty: true,
              location: true
            }
          },
          instructor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      createdInstances.push(classInstance);
    }

    const message = eventDates.length > 1 
      ? `Multi-day event created successfully with ${eventDates.length} instances`
      : 'Single class created successfully';

    return NextResponse.json({
      message,
      classInstances: createdInstances,
      template
    });

  } catch (error) {
    console.error('Error creating class instance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
