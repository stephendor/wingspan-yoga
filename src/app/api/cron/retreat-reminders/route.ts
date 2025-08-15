import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron or authorized source
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[retreat-reminders] Starting reminder job...')

    // Get current date
    const now = new Date()
    
    // Find bookings where:
    // 1. Payment status is DEPOSIT_PAID
    // 2. Balance due date is within the next 7 days
    // 3. Haven't sent a reminder in the last 24 hours (we'll track this in the future)
    const reminderDate = new Date()
    reminderDate.setDate(now.getDate() + 7)

    const bookingsNeedingReminders = await prisma.retreatBooking.findMany({
      where: {
        paymentStatus: 'DEPOSIT_PAID',
        balanceDueDate: {
          lte: reminderDate,
          gte: now, // Only future due dates
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        retreat: {
          select: {
            id: true,
            title: true,
            location: true,
            startDate: true,
            endDate: true,
            totalPrice: true,
            depositPrice: true,
          },
        },
      },
    })

    console.log(`[retreat-reminders] Found ${bookingsNeedingReminders.length} bookings needing reminders`)

    const results = []
    
    for (const booking of bookingsNeedingReminders) {
      try {
        const remainingBalance = booking.totalPrice - booking.amountPaid
        const daysUntilDue = Math.ceil(
          (booking.balanceDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        // TODO: Send email reminder
        // await sendRetreatBalanceReminder({
        //   user: booking.user,
        //   retreat: booking.retreat,
        //   booking: booking,
        //   remainingBalance,
        //   daysUntilDue,
        // })

        console.log(`[retreat-reminders] Would send reminder to ${booking.user.email} for booking ${booking.id}`)
        console.log(`  - Retreat: ${booking.retreat.title}`)
        console.log(`  - Balance: $${remainingBalance / 100}`)
        console.log(`  - Days until due: ${daysUntilDue}`)

        results.push({
          bookingId: booking.id,
          userEmail: booking.user.email,
          retreatTitle: booking.retreat.title,
          remainingBalance,
          daysUntilDue,
          status: 'reminder_scheduled', // Would be 'sent' when email is implemented
        })
      } catch (error) {
        console.error(`[retreat-reminders] Error processing booking ${booking.id}:`, error)
        results.push({
          bookingId: booking.id,
          userEmail: booking.user.email,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    console.log(`[retreat-reminders] Completed reminder job. Processed ${results.length} bookings`)

    return NextResponse.json({
      success: true,
      data: {
        totalBookings: bookingsNeedingReminders.length,
        results,
        timestamp: now.toISOString(),
      },
    })
  } catch (error) {
    console.error('[retreat-reminders] Job failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process retreat reminders',
      },
      { status: 500 }
    )
  }
}