import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { prisma } from '@/lib/prisma'
import { createPaymentIntent, getOrCreateCustomer } from '@/lib/stripe'
import { z } from 'zod'

interface Params {
  params: {
    id: string
  }
}

const retreatBookingSchema = z.object({
  notes: z.string().optional(),
})

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: retreatId } = params
    const body = await request.json()
    const { notes } = retreatBookingSchema.parse(body)

    // Check if retreat exists and is available
    const retreat = await prisma.retreat.findFirst({
      where: {
        OR: [
          { id: retreatId },
          { slug: retreatId },
        ],
        isActive: true,
      },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                paymentStatus: {
                  in: ['DEPOSIT_PAID', 'PAID_IN_FULL'],
                },
              },
            },
          },
        },
      },
    })

    if (!retreat) {
      return NextResponse.json(
        { success: false, error: 'Retreat not found' },
        { status: 404 }
      )
    }

    // Check capacity
    const confirmedBookings = retreat._count.bookings
    if (confirmedBookings >= retreat.capacity) {
      return NextResponse.json(
        { success: false, error: 'Retreat is fully booked' },
        { status: 400 }
      )
    }

    // Check if user already has a booking for this retreat
    const existingBooking = await prisma.retreatBooking.findFirst({
      where: {
        userId: session.user.id,
        retreatId: retreat.id,
      },
    })

    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: 'You already have a booking for this retreat' },
        { status: 400 }
      )
    }

    // Calculate balance due date (30 days before retreat)
    const balanceDueDate = new Date(retreat.startDate)
    balanceDueDate.setDate(balanceDueDate.getDate() - 30)

    // Create or get Stripe customer
    const customer = await getOrCreateCustomer({
      email: session.user.email!,
      name: session.user.name!,
      userId: session.user.id,
    })

    // Create retreat booking record
    const booking = await prisma.retreatBooking.create({
      data: {
        userId: session.user.id,
        retreatId: retreat.id,
        totalPrice: retreat.totalPrice,
        amountPaid: 0,
        paymentStatus: 'PENDING',
        balanceDueDate,
        notes,
      },
    })

    // Create Stripe payment intent for deposit
    const paymentIntent = await createPaymentIntent({
      amount: retreat.depositPrice,
      currency: 'usd',
      description: `Deposit for ${retreat.title}`,
      metadata: {
        type: 'retreat_deposit',
        retreatBookingId: booking.id,
        retreatId: retreat.id,
        userId: session.user.id,
      },
      customerId: customer.id,
    })

    // Create payment record
    await prisma.payment.create({
      data: {
        stripePaymentId: paymentIntent.id,
        amount: retreat.depositPrice,
        currency: 'usd',
        status: 'PENDING',
        description: `Deposit for ${retreat.title}`,
        paymentMethod: 'card',
        userId: session.user.id,
        retreatBookingId: booking.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        bookingId: booking.id,
        clientSecret: paymentIntent.client_secret,
        amount: retreat.depositPrice,
        currency: 'usd',
      },
    })
  } catch (error) {
    console.error('Error creating retreat booking:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}