import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { prisma } from '@/lib/prisma'
import { createPaymentIntent, getOrCreateCustomer } from '@/lib/stripe'
import { createPaymentIntentSchema } from '@/lib/validation/booking'
import { ClassStatus } from '@prisma/client'

export interface CreatePaymentIntentResponse {
  success: boolean
  clientSecret?: string
  paymentIntentId?: string
  message?: string
}

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createPaymentIntentSchema.parse(body)

    const { classId, amount, currency } = validatedData

    // Get class details and verify availability
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        instructor: true,
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

    if (!classData) {
      return NextResponse.json(
        { success: false, message: 'Class not found' },
        { status: 404 }
      )
    }

    // Check if class is available for booking
    if (classData.status !== ClassStatus.SCHEDULED) {
      return NextResponse.json(
        { success: false, message: 'Class is not available for booking' },
        { status: 400 }
      )
    }

    // Check capacity
    const availableSpots = classData.capacity - classData._count.bookings
    if (availableSpots <= 0) {
      return NextResponse.json(
        { success: false, message: 'Class is fully booked' },
        { status: 400 }
      )
    }

    // Check if user already has a booking for this class
    const existingBooking = await prisma.booking.findUnique({
      where: {
        userId_classId: {
          userId: session.user.id,
          classId: classId
        }
      }
    })

    if (existingBooking) {
      return NextResponse.json(
        { success: false, message: 'You have already booked this class' },
        { status: 400 }
      )
    }

    // Verify the amount matches the class price
    if (amount !== classData.price) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment amount' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    const customer = await getOrCreateCustomer({
      email: session.user.email!,
      name: session.user.name!,
      userId: session.user.id
    })

    // Create payment intent
    const paymentIntent = await createPaymentIntent({
      amount,
      currency,
      description: `Booking for ${classData.title} on ${classData.startTime.toLocaleDateString()}`,
      metadata: {
        classId: classData.id,
        className: classData.title,
        userId: session.user.id,
        userEmail: session.user.email!,
        instructorName: classData.instructor.name,
        startTime: classData.startTime.toISOString(),
      },
      customerId: customer.id
    })

    // Store payment record in database with pending status
    await prisma.payment.create({
      data: {
        stripePaymentId: paymentIntent.id,
        amount,
        currency,
        status: 'PENDING',
        description: `Payment for class: ${classData.title}`,
        paymentMethod: 'card',
        userId: session.user.id,
        classId: classData.id,
      }
    })

    const response: CreatePaymentIntentResponse = {
      success: true,
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating payment intent:', error)
    
    const errorResponse: CreatePaymentIntentResponse = {
      success: false,
      message: 'Failed to create payment intent'
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}