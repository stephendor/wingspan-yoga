import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Find the user in our database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          where: {
            status: {
              in: ['active', 'past_due', 'unpaid', 'cancelled']
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has an active subscription
    const activeSubscription = user.subscriptions[0]
    if (!activeSubscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Parse return URL from request body
    const body = await request.json().catch(() => ({}))
    const returnUrl = body.returnUrl || `${process.env.NEXTAUTH_URL}/membership`

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: activeSubscription.stripeCustomerId,
      return_url: returnUrl,
    })

    return NextResponse.json({
      url: portalSession.url
    })

  } catch (error) {
    console.error('Billing portal error:', error)
    
    if (error instanceof Error) {
      // Handle specific Stripe errors
      if (error.message.includes('No such customer')) {
        return NextResponse.json(
          { error: 'Customer not found in billing system' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    )
  }
}