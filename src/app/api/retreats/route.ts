import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const retreats = await prisma.retreat.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        startDate: 'asc',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        location: true,
        startDate: true,
        endDate: true,
        totalPrice: true,
        depositPrice: true,
        capacity: true,
        images: true,
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

    // Add availableSpots to each retreat
    const retreatsWithAvailability = retreats.map((retreat) => ({
      ...retreat,
      availableSpots: retreat.capacity - retreat._count.bookings,
      isFull: retreat._count.bookings >= retreat.capacity,
    }))

    return NextResponse.json({
      data: retreatsWithAvailability,
      success: true,
    })
  } catch (error) {
    console.error('Error fetching retreats:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch retreats',
      },
      { status: 500 }
    )
  }
}