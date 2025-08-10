import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { VideoCategory, DifficultyLevel, ClassLocation, ClassStatus } from '@prisma/client'

export interface ClassWithInstructor {
  id: string
  title: string
  description: string | null
  startTime: Date
  endTime: Date
  capacity: number
  price: number
  difficulty: DifficultyLevel
  category: VideoCategory
  location: ClassLocation
  status: ClassStatus
  meetingUrl: string | null
  notes: string | null
  instructor: {
    id: string
    name: string
    avatar: string | null
  }
  _count: {
    bookings: number
  }
}

export interface ClassesResponse {
  success: boolean
  data: ClassWithInstructor[]
  message?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract filter parameters
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const instructorId = searchParams.get('instructorId')
    const location = searchParams.get('location')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause dynamically
    const where: {
      status: ClassStatus
      startTime: {
        gte: Date
        lte?: Date
      }
      category?: VideoCategory
      difficulty?: DifficultyLevel
      instructorId?: string
      location?: ClassLocation
    } = {
      status: ClassStatus.SCHEDULED, // Only show scheduled classes
      startTime: {
        gte: new Date(), // Only future classes
      }
    }

    // Add filters if provided
    if (category && Object.values(VideoCategory).includes(category as VideoCategory)) {
      where.category = category as VideoCategory
    }

    if (difficulty && Object.values(DifficultyLevel).includes(difficulty as DifficultyLevel)) {
      where.difficulty = difficulty as DifficultyLevel
    }

    if (instructorId) {
      where.instructorId = instructorId
    }

    if (location && Object.values(ClassLocation).includes(location as ClassLocation)) {
      where.location = location as ClassLocation
    }

    // Add date range filters
    if (startDate) {
      where.startTime.gte = new Date(startDate)
    }

    if (endDate) {
      where.startTime.lte = new Date(endDate)
    }

    // Fetch classes with instructor details and booking count
    const classes = await prisma.class.findMany({
      where,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
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
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    const response: ClassesResponse = {
      success: true,
      data: classes as ClassWithInstructor[]
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching classes:', error)
    
    const errorResponse: ClassesResponse = {
      success: false,
      data: [],
      message: 'Failed to fetch classes'
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}