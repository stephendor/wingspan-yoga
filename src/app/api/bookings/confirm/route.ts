import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { prisma } from '@/lib/prisma'
import { retrievePaymentIntent } from '@/lib/stripe'
import { confirmBookingSchema } from '@/lib/validation/booking'

export interface ConfirmBookingResponse {
  success: boolean
  booking?: {
    id: string
    status: string
    class: {
      id: string
      title: string
      startTime: Date
      location: string
      instructor: {
        name: string
      }
    }
  }
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
    const validatedData = confirmBookingSchema.parse(body)

    const { paymentIntentId, classId, notes } = validatedData

    // Retrieve and verify payment intent from Stripe
    const paymentIntent = await retrievePaymentIntent(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { success: false, message: 'Payment was not successful' },
        { status: 400 }
      )
    }

    // Verify the payment intent metadata matches the request
    if (paymentIntent.metadata.classId !== classId || 
        paymentIntent.metadata.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Payment verification failed' },
        { status: 400 }
      )
    }

    // Get class details
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

    // Final capacity check
    const availableSpots = classData.capacity - classData._count.bookings
    if (availableSpots <= 0) {
      return NextResponse.json(
        { success: false, message: 'Class is now fully booked' },
        { status: 400 }
      )
    }

    // Check if booking already exists
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
        { success: false, message: 'Booking already exists' },
        { status: 400 }
      )
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the booking
      const booking = await tx.booking.create({
        data: {
          userId: session.user.id,
          classId: classId,
          status: 'CONFIRMED',
          notes: notes,
        },
        include: {
          class: {
            include: {
              instructor: true
            }
          }
        }
      })

      // Update payment status to succeeded
      await tx.payment.update({
        where: {
          stripePaymentId: paymentIntentId
        },
        data: {
          status: 'SUCCEEDED'
        }
      })

      return booking
    })

    const response: ConfirmBookingResponse = {
      success: true,
      booking: {
        id: result.id,
        status: result.status,
        class: {
          id: result.class.id,
          title: result.class.title,
          startTime: result.class.startTime,
          location: result.class.location,
          instructor: {
            name: result.class.instructor.name
          }
        }
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error confirming booking:', error)

    // Update payment status to failed if possible
    try {
      const body = await request.json()
      if (body.paymentIntentId) {
        await prisma.payment.update({
          where: {
            stripePaymentId: body.paymentIntentId
          },
          data: {
            status: 'FAILED'
          }
        })
      }
    } catch (updateError) {
      console.error('Error updating payment status:', updateError)
    }
    
    const errorResponse: ConfirmBookingResponse = {
      success: false,
      message: 'Failed to confirm booking'
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}