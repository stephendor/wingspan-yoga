import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { ClassWithInstructor } from '@/app/api/classes/route'

export interface ClassDetailsResponse {
  success: boolean
  data?: ClassWithInstructor
  message?: string
}

export async function GET(request: Request, context: unknown) {
  try {
  const classId = (context as { params?: { id?: string } })?.params?.id || ''

    if (!classId) {
      return NextResponse.json(
        { success: false, message: 'Class ID is required' },
        { status: 400 }
      )
    }

    // Get class with instructor and booking count
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            specialties: true,
            yearsExp: true,
            certification: true,
          }
        },
        _count: {
          select: {
            bookings: {
              where: {
                status: 'CONFIRMED'
              }
            }
          }
        }
      }
    })

    if (!classData) {
      return NextResponse.json(
        { success: false, message: 'Class not found' },
        { status: 404 }
      )
    }

    // Transform data to match ClassWithInstructor interface
    const response: ClassDetailsResponse = {
      success: true,
      data: {
        id: classData.id,
        title: classData.title,
        description: classData.description,
        startTime: classData.startTime,
        endTime: classData.endTime,
        capacity: classData.capacity,
        price: classData.price,
        difficulty: classData.difficulty,
        category: classData.category,
        location: classData.location,
        status: classData.status,
        meetingUrl: classData.meetingUrl,
        notes: classData.notes,
        instructor: {
          id: classData.instructor.id,
          name: classData.instructor.name,
          avatar: classData.instructor.avatar,
          bio: classData.instructor.bio,
          specialties: classData.instructor.specialties,
          yearsExp: classData.instructor.yearsExp,
          certification: classData.instructor.certification,
        },
        _count: classData._count
      } as ClassWithInstructor
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching class details:', error)
    
    const errorResponse: ClassDetailsResponse = {
      success: false,
      message: 'Failed to fetch class details'
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}