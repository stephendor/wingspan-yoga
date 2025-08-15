import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Try to find retreat by ID first, then by slug
    const retreat = await prisma.retreat.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id },
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
        {
          success: false,
          error: 'Retreat not found',
        },
        { status: 404 }
      )
    }

    // Add availability information
    const retreatWithAvailability = {
      ...retreat,
      availableSpots: retreat.capacity - retreat._count.bookings,
      isFull: retreat._count.bookings >= retreat.capacity,
    }

    return NextResponse.json({
      data: retreatWithAvailability,
      success: true,
    })
  } catch (error) {
    console.error('Error fetching retreat:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch retreat',
      },
      { status: 500 }
    )
  }
}