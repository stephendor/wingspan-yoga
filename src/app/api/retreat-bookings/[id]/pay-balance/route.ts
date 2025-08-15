import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { prisma } from '@/lib/prisma'
import { createPaymentIntent, getOrCreateCustomer } from '@/lib/stripe'

interface Params {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: bookingId } = params

    // Get the retreat booking
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

    // Verify booking is in correct state for balance payment
    if (booking.paymentStatus !== 'DEPOSIT_PAID') {
      return NextResponse.json(
        { success: false, error: 'Booking is not eligible for balance payment' },
        { status: 400 }
      )
    }

    // Calculate remaining balance
    const remainingBalance = booking.totalPrice - booking.amountPaid

    if (remainingBalance <= 0) {
      return NextResponse.json(
        { success: false, error: 'No balance remaining' },
        { status: 400 }
      )
    }

    // Check if retreat start date hasn't passed
    const now = new Date()
    if (booking.retreat.startDate <= now) {
      return NextResponse.json(
        { success: false, error: 'Cannot pay balance for past retreats' },
        { status: 400 }
      )
    }

    // Check for existing pending balance payment
    const existingPayment = await prisma.payment.findFirst({
      where: {
        retreatBookingId: bookingId,
        status: 'PENDING',
        description: {
          contains: 'balance',
        },
      },
    })

    if (existingPayment) {
      return NextResponse.json(
        { success: false, error: 'Balance payment already in progress' },
        { status: 400 }
      )
    }

    // Create or get Stripe customer
    const customer = await getOrCreateCustomer({
      email: session.user.email!,
      name: session.user.name!,
      userId: session.user.id,
    })

    // Create Stripe payment intent for balance
    const paymentIntent = await createPaymentIntent({
      amount: remainingBalance,
      currency: 'usd',
      description: `Balance payment for ${booking.retreat.title}`,
      metadata: {
        type: 'retreat_balance',
        retreatBookingId: booking.id,
        retreatId: booking.retreat.id,
        userId: session.user.id,
      },
      customerId: customer.id,
    })

    // Create payment record
    await prisma.payment.create({
      data: {
        stripePaymentId: paymentIntent.id,
        amount: remainingBalance,
        currency: 'usd',
        status: 'PENDING',
        description: `Balance payment for ${booking.retreat.title}`,
        paymentMethod: 'card',
        userId: session.user.id,
        retreatBookingId: booking.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: remainingBalance,
        currency: 'usd',
        bookingId: booking.id,
      },
    })
  } catch (error) {
    console.error('Error creating balance payment intent:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create balance payment intent' },
      { status: 500 }
    )
  }
}