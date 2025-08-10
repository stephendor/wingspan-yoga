import { Suspense } from 'react'
import { Metadata } from 'next/metadata'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { prisma } from '@/lib/prisma'
import { ConfirmationClient } from './ConfirmationClient'

interface ConfirmationPageProps {
  params: { id: string }
}

export const metadata: Metadata = {
  title: 'Booking Confirmation | Wingspan Yoga',
  description: 'Your yoga class booking has been confirmed!',
}

async function getBookingData(bookingId: string, userId: string) {
  try {
    const booking = await prisma.booking.findFirst({
      where: { 
        id: bookingId,
        userId: userId, // Ensure user can only see their own bookings
      },
      include: {
        class: {
          include: {
            instructor: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return booking
  } catch (error) {
    console.error('Error fetching booking data:', error)
    return null
  }
}

function ConfirmationPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    notFound()
  }

  const booking = await getBookingData(params.id, session.user.id)

  if (!booking) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Suspense fallback={<ConfirmationPageSkeleton />}>
            <ConfirmationClient booking={booking} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}