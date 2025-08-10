import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

// Client-side Stripe promise
let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Stripe configuration and utility functions
export const STRIPE_CONFIG = {
  currency: 'usd',
  paymentMethodTypes: ['card'],
  captureMethod: 'automatic',
} as const

// Convert amount from dollars to cents for Stripe
export const dollarsToCents = (dollars: number): number => {
  return Math.round(dollars * 100)
}

// Convert amount from cents to dollars for display
export const centsToDollars = (cents: number): number => {
  return cents / 100
}

// Format currency for display
export const formatCurrency = (cents: number, locale = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
  }).format(centsToDollars(cents))
}

// Stripe webhook signature verification
export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string,
  endpointSecret: string
): Stripe.Event => {
  return stripe.webhooks.constructEvent(payload, signature, endpointSecret)
}

// Create payment intent for class booking
export const createPaymentIntent = async (params: {
  amount: number // in cents
  currency?: string
  description: string
  metadata: Record<string, string>
  customerId?: string
}): Promise<Stripe.PaymentIntent> => {
  const { amount, currency = 'usd', description, metadata, customerId } = params

  return await stripe.paymentIntents.create({
    amount,
    currency,
    description,
    metadata,
    customer: customerId,
    automatic_payment_methods: {
      enabled: true,
    },
  })
}

// Get or create Stripe customer
export const getOrCreateCustomer = async (params: {
  email: string
  name: string
  userId: string
}): Promise<Stripe.Customer> => {
  const { email, name, userId } = params

  // First, try to find existing customer by email
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0]
  }

  // Create new customer if none exists
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  })
}

// Confirm payment intent
export const confirmPaymentIntent = async (
  paymentIntentId: string,
  paymentMethodId: string
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentMethodId,
  })
}

// Retrieve payment intent
export const retrievePaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.retrieve(paymentIntentId)
}

// Cancel payment intent
export const cancelPaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.cancel(paymentIntentId)
}