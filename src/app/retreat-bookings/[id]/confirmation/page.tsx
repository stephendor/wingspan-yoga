import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { prisma } from '@/lib/prisma'
import RetreatBookingConfirmation from './RetreatBookingConfirmation'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

async function getRetreatBooking(bookingId: string, userId: string) {
  try {
    const booking = await prisma.retreatBooking.findFirst({
      where: {
        id: bookingId,
        userId,
      },
      include: {
        retreat: true,
        user: true,
        payments: {
          where: {
            status: 'SUCCEEDED',
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    return booking
  } catch (error) {
    console.error('Error fetching retreat booking:', error)
    return null
  }
}

export const metadata: Metadata = {
  title: 'Booking Confirmation | Wingspan Yoga',
  description: 'Your retreat booking confirmation details.',
}

export default async function RetreatBookingConfirmationPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const { id } = await params
  const booking = await getRetreatBooking(id, session.user.id)

  if (!booking) {
    notFound()
  }

  return <RetreatBookingConfirmation booking={booking} />
}