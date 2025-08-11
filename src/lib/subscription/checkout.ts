import { PlanKey } from '@/lib/stripe/plans'

export interface CreateCheckoutSessionRequest {
  planKey: PlanKey
  successUrl?: string
  cancelUrl?: string
}

export interface CreateCheckoutSessionResponse {
  success: true
  url: string
  sessionId: string
}

export interface CheckoutError {
  success: false
  error: string
}

export type CheckoutResponse = CreateCheckoutSessionResponse | CheckoutError

/**
 * Creates a Stripe Checkout session for the specified plan
 */
export async function createCheckoutSession(
  request: CreateCheckoutSessionRequest
): Promise<CheckoutResponse> {
  try {
    const response = await fetch('/api/subscriptions/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const data = await response.json()
    return {
      success: true,
      url: data.url,
      sessionId: data.sessionId,
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create checkout session',
    }
  }
}

/**
 * Redirects to Stripe Checkout for the specified plan
 */
export async function redirectToCheckout(planKey: PlanKey): Promise<void> {
  const result = await createCheckoutSession({
    planKey,
    successUrl: `${window.location.origin}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${window.location.origin}/membership?cancelled=1`,
  })

  if (result.success) {
    // Redirect to Stripe Checkout
    window.location.href = result.url
  } else {
    throw new Error(result.error)
  }
}