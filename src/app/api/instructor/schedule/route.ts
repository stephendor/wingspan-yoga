import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { hasPermission, Role } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/instructor/schedule
 * 
 * Retrieves schedule data for the authenticated instructor including:
 * - All classes assigned to this instructor
 * - Student bookings for each class
 * - Class details (title, date, time, location, etc.)
 * 
 * Security: Requires INSTRUCTOR role and 'access:instructor_portal' permission
 */
export async function GET() {
  try {
    // Authenticate and authorize the request
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has instructor permissions
    if (!hasPermission(session.user.role as Role, 'access:instructor_portal')) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Instructor role required.' },
        { status: 403 }
      );
    }

    // Get instructor record by matching email (with null safety)
    const userEmail = session.user.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found in session' },
        { status: 400 }
      );
    }

    const instructorUser = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!instructorUser) {
      return NextResponse.json(
        { error: 'Instructor user not found' },
        { status: 404 }
      );
    }

    // Find the instructor record that matches this user
    const instructor = await prisma.instructor.findFirst({
      where: { email: instructorUser.email }
    });

    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor profile not found' },
        { status: 404 }
      );
    }

    // Fetch all classes for this instructor with bookings and student details
    const classes = await prisma.class.findMany({
      where: {
        instructorId: instructor.id
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                // Only include safe, non-sensitive student data
              }
            }
          }
        }
      },
      orderBy: [
        { startTime: 'asc' }
      ]
    });

    // Transform the data to include computed fields and ensure data safety
    const scheduleData = classes.map(classItem => ({
      id: classItem.id,
      title: classItem.title,
      description: classItem.description,
      startTime: classItem.startTime,
      endTime: classItem.endTime,
      location: classItem.location,
      capacity: classItem.capacity,
      difficulty: classItem.difficulty,
      category: classItem.category,
      price: classItem.price,
      status: classItem.status,
      meetingUrl: classItem.meetingUrl,
      notes: classItem.notes,
      instructor: {
        id: classItem.instructor.id,
        name: classItem.instructor.name,
        email: classItem.instructor.email
      },
      bookings: {
        total: classItem.bookings.length,
        capacity: classItem.capacity,
        availableSpots: classItem.capacity - classItem.bookings.length,
        students: classItem.bookings.map(booking => ({
          bookingId: booking.id,
          student: {
            id: booking.user.id,
            name: booking.user.name,
            email: booking.user.email
          },
          bookingDate: booking.bookedAt,
          status: booking.status
        }))
      }
    }));

    // Calculate summary statistics
    const summary = {
      totalClasses: scheduleData.length,
      totalBookings: scheduleData.reduce((sum, cls) => sum + cls.bookings.total, 0),
      totalCapacity: scheduleData.reduce((sum, cls) => sum + cls.capacity, 0),
      averageBookingRate: scheduleData.length > 0 
        ? Math.round((scheduleData.reduce((sum, cls) => sum + (cls.bookings.total / cls.capacity), 0) / scheduleData.length) * 100)
        : 0,
      upcomingClasses: scheduleData.filter(cls => {
        const classDate = new Date(cls.startTime);
        return classDate >= new Date();
      }).length
    };

    return NextResponse.json({
      success: true,
      data: {
        instructor: {
          id: instructor.id,
          name: instructor.name,
          email: instructor.email,
          user: {
            id: instructorUser.id,
            // role: instructorUser.role // Temporarily commented out due to type issue
          }
        },
        summary,
        classes: scheduleData
      }
    });

  } catch (error) {
    console.error('Error fetching instructor schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
