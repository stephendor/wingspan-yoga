import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export interface InstructorSummary {
  id: string
  name: string
  avatar: string | null
  specialties: string[]
}

export interface InstructorsResponse {
  success: boolean
  data: InstructorSummary[]
  message?: string
}

export async function GET() {
  try {
    const instructors = await prisma.instructor.findMany({
      where: {
        isActive: true,
        classes: {
          some: {
            status: 'SCHEDULED',
            startTime: {
              gte: new Date()
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        specialties: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    const response: InstructorsResponse = {
      success: true,
      data: instructors
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching instructors:', error)
    
    const errorResponse: InstructorsResponse = {
      success: false,
      data: [],
      message: 'Failed to fetch instructors'
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}