import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { MembershipType } from '@prisma/client';

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
      startTime,
      endTime,
      capacity,
      price,
      difficulty,
      category,
      location,
      meetingUrl
    } = body;

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
    const classDate = new Date(date);
    const [startHour, startMinute] = startTime.split(':');
    const [endHour, endMinute] = endTime.split(':');
    
    const startDateTime = new Date(classDate);
    startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
    
    const endDateTime = new Date(classDate);
    endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

    // Validate end time is after start time
    if (endDateTime <= startDateTime) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    // Check for instructor conflicts
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
        { error: 'Instructor has a conflicting class at this time' },
        { status: 409 }
      );
    }

    // Create a temporary template for this single class
    // This allows us to use the existing ClassInstance system
    const template = await prisma.classTemplate.create({
      data: {
        title,
        description: `Single class: ${title}`,
        dayOfWeek: classDate.getDay(),
        startTime: `${startHour}:${startMinute}`,
        endTime: `${endHour}:${endMinute}`,
        capacity: parseInt(capacity),
        price: Math.round(parseFloat(price) * 100), // Convert to pence
        difficulty: difficulty || 'ALL_LEVELS',
        category: category?.toUpperCase() || 'VINYASA',
        location: location?.toUpperCase() || 'ONLINE',
        meetingUrl: location === 'online' ? meetingUrl : null,
        instructorId,
        isActive: false // Mark as inactive since it's just for this single instance
      }
    });

    // Create the class instance
    const classInstance = await prisma.classInstance.create({
      data: {
        date: classDate,
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

    return NextResponse.json({
      message: 'Class instance created successfully',
      classInstance
    });

  } catch (error) {
    console.error('Error creating class instance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
