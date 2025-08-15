import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { prisma } from '@/lib/prisma'
import RetreatBalancePaymentClient from './RetreatBalancePaymentClient'

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
      },
    })

    return booking
  } catch (error) {
    console.error('Error fetching retreat booking:', error)
    return null
  }
}

export const metadata: Metadata = {
  title: 'Pay Balance | Wingspan Yoga',
  description: 'Complete your retreat payment.',
}

export default async function RetreatBalancePaymentPage({ params }: PageProps) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=' + encodeURIComponent(`/retreat-bookings/${id}/pay-balance`))
  }

  const booking = await getRetreatBooking(id, session.user.id)

  if (!booking) {
    notFound()
  }

  // Check if booking is eligible for balance payment
  if (booking.paymentStatus !== 'DEPOSIT_PAID') {
    redirect(`/retreat-bookings/${id}/confirmation?error=not-eligible`)
  }

  // Check if retreat has already started
  const now = new Date()
  if (booking.retreat.startDate <= now) {
    redirect(`/retreat-bookings/${id}/confirmation?error=retreat-started`)
  }

  const remainingBalance = booking.totalPrice - booking.amountPaid
  if (remainingBalance <= 0) {
    redirect(`/retreat-bookings/${id}/confirmation?error=no-balance`)
  }

  return <RetreatBalancePaymentClient booking={booking} />
}