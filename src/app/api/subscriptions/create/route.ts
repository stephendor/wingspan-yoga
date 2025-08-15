import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { getOrCreateCustomer, stripe } from '@/lib/stripe'
import { getPlanByKey, PLAN_KEYS, type PlanKey } from '@/lib/stripe/plans'
import { z } from 'zod'
import { applyRateLimit, paymentRateLimit } from '@/lib/ratelimit'

// Derive plan key values for zod enum without using `any`
const PLAN_KEY_VALUES = Object.values(PLAN_KEYS) as [PlanKey, ...PlanKey[]]

// Schema validation
const createSubscriptionSchema = z.object({
  planKey: z.enum(PLAN_KEY_VALUES, { errorMap: () => ({ message: 'Invalid plan key' }) }),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
})

interface CreateSubscriptionResponse {
  success: boolean
  url?: string
  sessionId?: string
  message?: string
  code?: string
}

// POST /api/subscriptions/create
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(request, paymentRateLimit);
    if (!rateLimitResult.success) {
      return NextResponse.json<CreateSubscriptionResponse>(
        { success: false, message: rateLimitResult.error, code: 'rate_limit_exceeded' },
        { status: 429 }
      );
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json<CreateSubscriptionResponse>(
        { success: false, message: 'Authentication required', code: 'auth_required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parseResult = createSubscriptionSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json<CreateSubscriptionResponse>(
        { success: false, message: 'Invalid request', code: 'invalid_request' },
        { status: 400 }
      )
    }

    const { planKey, successUrl, cancelUrl } = parseResult.data

    const plan = getPlanByKey(planKey)
    if (!plan || !plan.active) {
      return NextResponse.json<CreateSubscriptionResponse>(
        { success: false, message: 'Plan not found or inactive', code: 'plan_not_found' },
        { status: 400 }
      )
    }

    // TODO: Optionally gate duplicate active subscription once membership propagation (9.5) implemented

    // Ensure Stripe customer
    const customer = await getOrCreateCustomer({
      email: session.user.email,
      name: session.user.name || '',
      userId: session.user.id,
    })

    // Derive origin for fallback URLs
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || ''
    if (!origin) {
      console.warn('Origin not resolvable; provide NEXT_PUBLIC_APP_URL for stable redirect URLs')
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.id,
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/membership/plans?cancelled=1`,
      metadata: {
        userId: session.user.id,
        planKey: plan.key,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          planKey: plan.key,
        },
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json<CreateSubscriptionResponse>({
      success: true,
      url: checkoutSession.url || undefined,
      sessionId: checkoutSession.id,
    })
  } catch (err) {
    // Narrow common Stripe error shape
    const error = err as { message?: string }
    console.error('Error creating subscription checkout session:', error)

    const message = error?.message || 'Failed to create subscription checkout session'

    return NextResponse.json<CreateSubscriptionResponse>(
      { success: false, message, code: 'stripe_error' },
      { status: 500 }
    )
  }
}

// Notes:
// - UserSubscription creation deferred to Stripe webhook handler (Subtask 9.4)
// - Consider caching plan price validation results (Subtask 9.2 extension)
// - Add duplicate subscription prevention (Subtask 9.5)
