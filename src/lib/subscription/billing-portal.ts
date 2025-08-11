/**
 * Billing Portal Utilities
 * 
 * Provides functions for creating Stripe billing portal sessions
 * and handling billing-related operations.
 */

export interface BillingPortalSessionResponse {
  url: string
}

export interface BillingPortalError {
  error: string
}

/**
 * Redirects user to Stripe billing portal for subscription management
 * @param returnUrl - URL to return to after billing portal session
 * @returns Promise that resolves when redirect is initiated
 */
export async function redirectToBillingPortal(returnUrl?: string): Promise<void> {
  try {
    const response = await fetch('/api/subscriptions/portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        returnUrl: returnUrl || window.location.href
      }),
    })

    const data: BillingPortalSessionResponse | BillingPortalError = await response.json()

    if (!response.ok) {
      throw new Error('error' in data ? data.error : 'Failed to create billing portal session')
    }

    if ('url' in data) {
      // Redirect to billing portal
      window.location.href = data.url
    } else {
      throw new Error('Invalid response from billing portal API')
    }
  } catch (error) {
    console.error('Billing portal error:', error)
    throw error instanceof Error ? error : new Error('Failed to access billing portal')
  }
}

/**
 * Creates a billing portal session URL without redirecting
 * @param returnUrl - URL to return to after billing portal session
 * @returns Promise resolving to billing portal URL
 */
export async function createBillingPortalSession(returnUrl?: string): Promise<string> {
  try {
    const response = await fetch('/api/subscriptions/portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        returnUrl: returnUrl || window.location.href
      }),
    })

    const data: BillingPortalSessionResponse | BillingPortalError = await response.json()

    if (!response.ok) {
      throw new Error('error' in data ? data.error : 'Failed to create billing portal session')
    }

    if ('url' in data) {
      return data.url
    } else {
      throw new Error('Invalid response from billing portal API')
    }
  } catch (error) {
    console.error('Billing portal error:', error)
    throw error instanceof Error ? error : new Error('Failed to create billing portal session')
  }
}