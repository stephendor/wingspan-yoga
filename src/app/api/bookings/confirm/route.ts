import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { prisma } from '@/lib/prisma'
import { retrievePaymentIntent } from '@/lib/stripe'
import { sendBookingConfirmationEmail } from '@/lib/email/sendBookingConfirmation'
import { confirmBookingSchema } from '@/lib/validation/booking'
import type { BookingStatus } from '@prisma/client'

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

interface BookingWithClass {
  id: string
  status: BookingStatus
  classId: string
  notes: string | null
  class: {
    id: string
    title: string
    startTime: Date
    location: string | null
    instructor: { name: string }
  }
}

interface ConfirmBody { paymentIntentId: string; classId: string; notes?: string }

export async function POST(request: Request) {
  let parsedBody: ConfirmBody | undefined
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, code: 'unauthorized', message: 'Authentication required' }, { status: 401 })
    }

  const raw = await request.json()
  parsedBody = confirmBookingSchema.parse(raw)
  const { paymentIntentId, classId, notes } = parsedBody

    // Retrieve payment intent
    const paymentIntent = await retrievePaymentIntent(paymentIntentId)
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ success: false, code: 'payment_not_succeeded', message: 'Payment was not successful' }, { status: 400 })
    }

    if (paymentIntent.metadata.classId !== classId || paymentIntent.metadata.userId !== session.user.id) {
      return NextResponse.json({ success: false, code: 'payment_metadata_mismatch', message: 'Payment verification failed' }, { status: 400 })
    }

    // Idempotency: if booking already exists (e.g., retry after network), short-circuit success
    const preExisting = await prisma.booking.findUnique({
      where: { userId_classId: { userId: session.user.id, classId } },
      include: { class: { include: { instructor: true } } }
    })
    if (preExisting) {
      if (!preExisting.class) {
        return NextResponse.json({ success: true, message: 'Booking already exists' })
      }
      return NextResponse.json({
        success: true,
        booking: {
          id: preExisting.id,
          status: preExisting.status,
          class: {
            id: preExisting.class.id,
            title: preExisting.class.title,
            startTime: preExisting.class.startTime,
            location: preExisting.class.location,
            instructor: { name: preExisting.class.instructor.name }
          }
        }
      })
    }

    // Run entire booking creation + capacity validation within a transaction to mitigate race conditions
  const result: BookingWithClass = await prisma.$transaction(async (tx) => {
  const classData = await tx.class.findUnique({
        where: { id: classId },
        include: {
          instructor: true,
          _count: { select: { bookings: { where: { status: 'CONFIRMED' } } } }
        }
      })

      if (!classData) {
        throw Object.assign(new Error('Class not found'), { code: 'class_not_found', httpStatus: 404 })
      }

      const currentConfirmed = classData._count.bookings
      if (currentConfirmed >= classData.capacity) {
        throw Object.assign(new Error('Class is now fully booked'), { code: 'capacity_full', httpStatus: 400 })
      }

      // Duplicate booking check (idempotency)
      const existing = await tx.booking.findUnique({
        where: { userId_classId: { userId: session.user.id, classId } }
      })
      if (existing) {
        // Another concurrent transaction inserted the booking between preExisting check and now.
        return await tx.booking.findUnique({
          where: { id: existing.id },
          include: { class: { include: { instructor: true } } }
        }) as BookingWithClass
      }
      const booking = await tx.booking.create({
        data: { userId: session.user.id, classId, status: 'CONFIRMED', notes },
        include: { class: { include: { instructor: true } } }
      }) as BookingWithClass

      await tx.payment.update({
        where: { stripePaymentId: paymentIntentId },
        data: { status: 'SUCCEEDED' }
      })

      return booking
    })

    // Fire-and-forget email (non-blocking)
  sendBookingConfirmationEmail({
      user: { id: session.user.id, name: session.user.name || '', email: session.user.email || '' },
      booking: {
        id: result.id,
    classId: result.class.id,
    classTitle: result.class.title,
    startTime: result.class.startTime,
    location: result.class.location,
    instructorName: result.class.instructor.name
      }
  }).catch((err) => { console.error('Email send failed (non-blocking):', err); })

    return NextResponse.json({
      success: true,
      booking: {
        id: result.id,
        status: result.status,
        class: {
        id: result.class.id,
        title: result.class.title,
        startTime: result.class.startTime,
        location: result.class.location,
        instructor: { name: result.class.instructor.name }
        }
      }
    })
  } catch (error) {
    const errObj = error as { code?: string; httpStatus?: number; message?: string }
    console.error('Error confirming booking:', errObj)
    const code = errObj.code || 'booking_confirm_failed'
    const httpStatus = errObj.httpStatus || 500
    const message = errObj.message || 'Failed to confirm booking'

    // Attempt to mark payment failed only for non-idempotent cases
    try {
    if (parsedBody?.paymentIntentId && code !== 'duplicate_booking') {
        await prisma.payment.update({
      where: { stripePaymentId: parsedBody.paymentIntentId },
          data: { status: 'FAILED' }
        })
      }
    } catch (updateErr) {
      console.error('Failed to update payment to FAILED:', updateErr)
    }

    return NextResponse.json({ success: false, code, message }, { status: httpStatus })
  }
}