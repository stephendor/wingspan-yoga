import { Suspense } from 'react'
import { Metadata } from 'next/metadata'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { prisma } from '@/lib/prisma'
import { BookingClient } from './BookingClient'
import { ClassStatus } from '@prisma/client'

interface BookingPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: BookingPageProps): Promise<Metadata> {
  const classData = await getClassData(params.id)
  
  if (!classData) {
    return {
      title: 'Class Not Found | Wingspan Yoga',
    }
  }

  return {
    title: `Book ${classData.title} | Wingspan Yoga`,
    description: `Book your spot in ${classData.title} with ${classData.instructor.name}. ${classData.description}`,
  }
}

async function getClassData(classId: string) {
  try {
    const classData = await prisma.class.findUnique({
      where: { 
        id: classId,
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

    return classData
  } catch (error) {
    console.error('Error fetching class data:', error)
    return null
  }
}

function BookingPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto animate-pulse mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Class Details Skeleton */}
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>

            {/* Booking Form Skeleton */}
            <div className="space-y-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function BookingPage({ params }: BookingPageProps) {
  // Check if user is authenticated
  const session = await getServerSession(authOptions)
  
  // Get class data
  const classData = await getClassData(params.id)

  if (!classData) {
    notFound()
  }

  // Check if class is available
  const availableSpots = classData.capacity - classData._count.bookings
  if (availableSpots <= 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-sage-800 mb-4">Class Fully Booked</h1>
            <p className="text-lg text-sage-600 mb-8">
              Unfortunately, {classData.title} is fully booked. 
              Check our schedule for other available classes.
            </p>
            <div className="space-x-4">
              <a
                href="/schedule"
                className="inline-flex items-center px-6 py-3 bg-sage-600 text-white font-medium rounded-lg hover:bg-sage-700 transition-colors"
              >
                View Schedule
              </a>
              <a
                href={`/schedule?instructorId=${classData.instructor.id}`}
                className="inline-flex items-center px-6 py-3 border border-sage-600 text-sage-600 font-medium rounded-lg hover:bg-sage-50 transition-colors"
              >
                More classes with {classData.instructor.name}
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-sage-800 mb-2">
              Book Your Class
            </h1>
            <p className="text-lg text-sage-600">
              Reserve your spot in {classData.title}
            </p>
          </div>

          <Suspense fallback={<BookingPageSkeleton />}>
            <BookingClient 
              classData={classData}
              session={session}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}