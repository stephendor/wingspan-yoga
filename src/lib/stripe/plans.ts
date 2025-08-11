import { stripe } from './index'
// Import BillingInterval enum via Prisma $Enums for both type and value usage
import { $Enums } from '@prisma/client'
type BillingInterval = $Enums.BillingInterval

/**
 * Internal plan key identifiers used across the app.
 * These are stable identifiers NOT shown to end users.
 */
export const PLAN_KEYS = {
  BASIC_MONTHLY: 'basic_monthly',
  BASIC_YEARLY: 'basic_yearly',
  PREMIUM_MONTHLY: 'premium_monthly',
  PREMIUM_YEARLY: 'premium_yearly',
} as const

export type PlanKey = typeof PLAN_KEYS[keyof typeof PLAN_KEYS]

export interface PlanDefinition {
  key: PlanKey
  name: string
  description?: string
  interval: BillingInterval
  amount: number // cents
  currency: string
  stripePriceId: string // pulled from env for safety
  active: boolean
  features: string[]
}

// Load price IDs from env so they can vary per environment without code changes
const env = process.env

function reqEnv(key: string): string {
  const val = env[key]
  if (!val) {
    throw new Error(`Missing required env var ${key} for subscription plans`)
  }
  return val
}

export const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    key: PLAN_KEYS.BASIC_MONTHLY,
    name: 'Basic',
    description: 'Access to standard class library and 5 live classes / month',
  interval: $Enums.BillingInterval.MONTHLY,
    amount: 1999,
    currency: 'usd',
    stripePriceId: reqEnv('STRIPE_PRICE_BASIC_MONTHLY'),
    active: true,
    features: ['Standard video library', '5 live classes / month'],
  },
  {
    key: PLAN_KEYS.BASIC_YEARLY,
    name: 'Basic (Annual)',
    description: 'Basic plan billed annually (2 months free)',
  interval: $Enums.BillingInterval.YEARLY,
    amount: 1999 * 10, // 2 months free
    currency: 'usd',
    stripePriceId: reqEnv('STRIPE_PRICE_BASIC_YEARLY'),
    active: true,
    features: ['Standard video library', '5 live classes / month'],
  },
  {
    key: PLAN_KEYS.PREMIUM_MONTHLY,
    name: 'Premium',
    description: 'Unlimited live classes and premium workshops',
  interval: $Enums.BillingInterval.MONTHLY,
    amount: 3999,
    currency: 'usd',
    stripePriceId: reqEnv('STRIPE_PRICE_PREMIUM_MONTHLY'),
    active: true,
    features: ['Everything in Basic', 'Unlimited live classes', 'Premium workshops'],
  },
  {
    key: PLAN_KEYS.PREMIUM_YEARLY,
    name: 'Premium (Annual)',
    description: 'Premium plan billed annually (2 months free)',
  interval: $Enums.BillingInterval.YEARLY,
    amount: 3999 * 10,
    currency: 'usd',
    stripePriceId: reqEnv('STRIPE_PRICE_PREMIUM_YEARLY'),
    active: true,
    features: ['Everything in Basic', 'Unlimited live classes', 'Premium workshops'],
  },
]

export function getPlanByKey(key: PlanKey): PlanDefinition | undefined {
  return PLAN_DEFINITIONS.find(p => p.key === key)
}

export function getPlanByPriceId(priceId: string): PlanDefinition | undefined {
  return PLAN_DEFINITIONS.find(p => p.stripePriceId === priceId)
}

/**
 * Ensures a given plan price exists & is active in Stripe. Throws if mismatch.
 */
export async function assertStripePricesExist() {
  const missing: string[] = []
  for (const plan of PLAN_DEFINITIONS) {
    try {
      const price = await stripe.prices.retrieve(plan.stripePriceId)
      if (!price.active) {
        missing.push(`${plan.key} (price inactive)`) 
      }
  } catch {
      missing.push(`${plan.key} (price ${plan.stripePriceId} not found)`) 
    }
  }
  if (missing.length > 0) {
    throw new Error(`Stripe price validation failed: ${missing.join(', ')}`)
  }
}
