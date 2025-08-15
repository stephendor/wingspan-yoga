import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { prisma } from '@/lib/prisma'
import { retrievePaymentIntent } from '@/lib/stripe'
import { z } from 'zod'

const confirmBookingSchema = z.object({
  paymentIntentId: z.string(),
  bookingId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { paymentIntentId, bookingId } = confirmBookingSchema.parse(body)

    // Retrieve payment intent from Stripe to verify it succeeded
    const paymentIntent = await retrievePaymentIntent(paymentIntentId)
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { success: false, error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Verify the booking belongs to the current user
    const booking = await prisma.retreatBooking.findFirst({
      where: {
        id: bookingId,
        userId: session.user.id,
      },
      include: {
        retreat: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if booking is already confirmed
    if (booking.paymentStatus !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Booking already processed' },
        { status: 400 }
      )
    }

    // Verify payment amount matches deposit
    if (paymentIntent.amount !== booking.retreat.depositPrice) {
      return NextResponse.json(
        { success: false, error: 'Payment amount mismatch' },
        { status: 400 }
      )
    }

    // Re-check capacity in a transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Count confirmed bookings for this retreat
      const confirmedBookings = await tx.retreatBooking.count({
        where: {
          retreatId: booking.retreatId,
          paymentStatus: {
            in: ['DEPOSIT_PAID', 'PAID_IN_FULL'],
          },
        },
      })

      if (confirmedBookings >= booking.retreat.capacity) {
        throw new Error('Retreat is now fully booked')
      }

      // Update booking status
      const updatedBooking = await tx.retreatBooking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'DEPOSIT_PAID',
          amountPaid: booking.retreat.depositPrice,
          depositPaidAt: new Date(),
        },
        include: {
          retreat: true,
          user: true,
        },
      })

      // Update payment status
      await tx.payment.updateMany({
        where: {
          stripePaymentId: paymentIntentId,
          retreatBookingId: bookingId,
        },
        data: {
          status: 'SUCCEEDED',
        },
      })

      return updatedBooking
    })

    // TODO: Send deposit confirmation email
    // await sendRetreatDepositConfirmation({
    //   user: result.user,
    //   retreat: result.retreat,
    //   booking: result,
    // })

    return NextResponse.json({
      success: true,
      data: {
        bookingId: result.id,
        status: result.paymentStatus,
        message: 'Deposit payment confirmed successfully',
      },
    })
  } catch (error) {
    console.error('Error confirming retreat booking:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Retreat is now fully booked') {
      return NextResponse.json(
        { success: false, error: 'Retreat is now fully booked' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to confirm booking' },
      { status: 500 }
    )
  }
}