import { Suspense } from 'react'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { ScheduleClient } from './ScheduleClient'
import type { ClassWithInstructor } from '@/app/api/classes/route'
import { ClassStatus } from '@prisma/client'

export const metadata: Metadata = {
  title: 'Class Schedule | Wingspan Yoga',
  description: 'Browse and book yoga classes at Wingspan Yoga. Find the perfect class for your level and schedule.',
  keywords: ['yoga classes', 'schedule', 'book classes', 'yoga studio', 'wellness'],
}

export const dynamic = 'force-dynamic' // Ensure fresh data
export const revalidate = 300 // Revalidate every 5 minutes

async function getInitialClasses(): Promise<ClassWithInstructor[]> {
  try {
    const classes = await prisma.class.findMany({
      where: {
        status: ClassStatus.SCHEDULED,
        startTime: {
          gte: new Date(), // Only future classes
        }
      },
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
      },
      take: 50 // Limit initial load for performance
    })

    // Serialize dates for JSON transport
    return classes.map(cls => ({
      ...cls,
      startTime: cls.startTime,
      endTime: cls.endTime,
      createdAt: cls.createdAt,
      updatedAt: cls.updatedAt,
    })) as ClassWithInstructor[]
  } catch (error) {
    console.error('Error fetching initial classes:', error)
    return []
  }
}

function SchedulePageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="text-center space-y-4">
            <div className="h-10 bg-gray-200 rounded-lg w-64 mx-auto animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Skeleton */}
            <div className="lg:col-span-1">
              <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>

            {/* Schedule Skeleton */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex justify-between items-center">
                <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="flex space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function SchedulePage() {
  const initialClasses = await getInitialClasses()

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-sage-800 mb-4">
              Class Schedule
            </h1>
            <p className="text-lg text-sage-600 max-w-2xl mx-auto">
              Discover your perfect yoga practice. Filter by style, level, or instructor 
              to find classes that align with your journey.
            </p>
          </div>

          <Suspense fallback={<SchedulePageSkeleton />}>
            <ScheduleClient initialClasses={initialClasses} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}