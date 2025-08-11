import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import type Stripe from 'stripe'
import { $Enums } from '@prisma/client'

// Mock dependencies
jest.mock('@/lib/stripe/plans', () => ({
  getPlanByPriceId: jest.fn(() => ({
    key: 'premium_monthly',
    name: 'Premium Monthly',
    interval: 'MONTHLY',
    amount: 1900,
    currency: 'usd',
    stripePriceId: 'price_premium_monthly',
    active: true,
    features: ['Feature 1', 'Feature 2'],
    description: 'Premium monthly plan',
  })),
}))

jest.mock('@/lib/stripe', () => ({
  stripe: {
    subscriptions: {
      retrieve: jest.fn(),
    },
    customers: {
      retrieve: jest.fn(),
    },
  },
  verifyWebhookSignature: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    webhookEvent: {
      create: jest.fn(),
      count: jest.fn(),
    },
    subscriptionPlan: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userSubscription: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      upsert: jest.fn(),
    },
    payment: {
      upsert: jest.fn(),
    },
  },
}))

// Import after mocks
import { POST, recordEventOnce, mapStripeStatus } from '@/app/api/webhooks/stripe/route'
import { stripe, verifyWebhookSignature } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getPlanByPriceId } from '@/lib/stripe/plans'

const mockVerifyWebhookSignature = verifyWebhookSignature as jest.MockedFunction<typeof verifyWebhookSignature>
const mockStripeSubscriptions = stripe.subscriptions.retrieve as jest.MockedFunction<typeof stripe.subscriptions.retrieve>
const mockStripeCustomers = stripe.customers.retrieve as jest.MockedFunction<typeof stripe.customers.retrieve>
const mockGetPlanByPriceId = getPlanByPriceId as jest.MockedFunction<typeof getPlanByPriceId>

// Mock Prisma methods
const mockPrismaWebhookEventCreate = prisma.webhookEvent.create as jest.MockedFunction<typeof prisma.webhookEvent.create>
const mockPrismaSubscriptionPlanFindUnique = prisma.subscriptionPlan.findUnique as jest.MockedFunction<typeof prisma.subscriptionPlan.findUnique>
const mockPrismaSubscriptionPlanUpsert = prisma.subscriptionPlan.upsert as jest.MockedFunction<typeof prisma.subscriptionPlan.upsert>
const mockPrismaUserFindUnique = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>
const mockPrismaUserUpdate = prisma.user.update as jest.MockedFunction<typeof prisma.user.update>
const mockPrismaUserSubscriptionUpdateMany = prisma.userSubscription.updateMany as jest.MockedFunction<typeof prisma.userSubscription.updateMany>
const mockPrismaUserSubscriptionUpsert = prisma.userSubscription.upsert as jest.MockedFunction<typeof prisma.userSubscription.upsert>

describe('Webhook Event Processing', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret'
  })

  afterEach(() => {
    delete process.env.STRIPE_WEBHOOK_SECRET
  })

  describe('mapStripeStatus', () => {
    it('correctly maps all Stripe status values', () => {
      expect(mapStripeStatus('trialing')).toBe($Enums.MembershipStatus.TRIALING)
      expect(mapStripeStatus('active')).toBe($Enums.MembershipStatus.ACTIVE)
      expect(mapStripeStatus('past_due')).toBe($Enums.MembershipStatus.PAST_DUE)
      expect(mapStripeStatus('canceled')).toBe($Enums.MembershipStatus.CANCELLED)
      expect(mapStripeStatus('incomplete')).toBe($Enums.MembershipStatus.INCOMPLETE)
      expect(mapStripeStatus('incomplete_expired')).toBe($Enums.MembershipStatus.INCOMPLETE_EXPIRED)
      expect(mapStripeStatus('unpaid')).toBe($Enums.MembershipStatus.UNPAID)
    })

    it('defaults to ACTIVE for unknown status', () => {
      expect(mapStripeStatus('unknown_status' as Stripe.Subscription.Status)).toBe($Enums.MembershipStatus.ACTIVE)
    })
  })

  describe('recordEventOnce', () => {
    const mockEvent: Stripe.Event = {
      id: 'evt_test_123',
      type: 'customer.subscription.updated',
    } as Stripe.Event

    it('records first occurrence of event', async () => {
      mockPrismaWebhookEventCreate.mockResolvedValue({ id: 'evt_test_123', type: 'customer.subscription.updated' })

      const result = await recordEventOnce(mockEvent)
      
      expect(result).toBe(true)
      expect(mockPrismaWebhookEventCreate).toHaveBeenCalledWith({
        data: { id: 'evt_test_123', type: 'customer.subscription.updated' }
      })
    })

    it('skips duplicate events', async () => {
      // Simulate unique constraint error (P2002)
      const duplicateError = new Error('Unique constraint violation')
      ;(duplicateError as any).code = 'P2002'
      
      mockPrismaWebhookEventCreate.mockRejectedValue(duplicateError)

      const result = await recordEventOnce(mockEvent)
      
      expect(result).toBe(false)
    })

    it('handles missing webhook_events table gracefully', async () => {
      // Simulate table missing error (P2021)
      const tableError = new Error('Table webhook_events does not exist')
      ;(tableError as any).code = 'P2021'
      
      mockPrismaWebhookEventCreate.mockRejectedValue(tableError)

      const result = await recordEventOnce(mockEvent)
      
      expect(result).toBe(true) // Should proceed despite missing table
    })

    it('throws other database errors', async () => {
      const unknownError = new Error('Unknown database error')
      mockPrismaWebhookEventCreate.mockRejectedValue(unknownError)

      await expect(recordEventOnce(mockEvent)).rejects.toThrow('Unknown database error')
    })
  })

  describe('webhook signature verification', () => {
    it('returns 400 for missing signature', async () => {
      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing Stripe signature')
    })

    it('returns 500 for missing webhook secret', async () => {
      delete process.env.STRIPE_WEBHOOK_SECRET

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'stripe-signature': 'test_signature',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Webhook secret not configured')
    })

    it('returns 400 for invalid signature', async () => {
      const signatureError = new Error('Invalid signature')
      mockVerifyWebhookSignature.mockImplementation(() => {
        throw signatureError
      })

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'stripe-signature': 'invalid_signature',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid signature')
    })

    it('returns 400 for unreadable body', async () => {
      // Create a request that will fail to read body
      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': 'test_signature',
        },
      })

      // Mock text() to throw an error
      jest.spyOn(request, 'text').mockRejectedValue(new Error('Cannot read body'))

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Unable to read body')
    })
  })

  describe('subscription events processing', () => {
    const mockSubscription: Stripe.Subscription = {
      id: 'sub_test_123',
      object: 'subscription',
      cancel_at_period_end: false,
      created: Math.floor(Date.now() / 1000),
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
      customer: 'cus_test_123',
      items: {
        object: 'list',
        data: [{
          id: 'si_test_123',
          object: 'subscription_item',
          price: {
            id: 'price_premium_monthly',
            object: 'price',
            currency: 'usd',
            unit_amount: 1900,
          },
        }],
      } as Stripe.ApiList<Stripe.SubscriptionItem>,
      metadata: {
        userId: 'user-123',
      },
      status: 'active',
    } as Stripe.Subscription

    beforeEach(() => {
      // Setup default mocks
      mockPrismaWebhookEventCreate.mockResolvedValue({ id: 'evt_test', type: 'test' })
      mockPrismaSubscriptionPlanFindUnique.mockResolvedValue({
        id: 'plan-123',
        stripePriceId: 'price_premium_monthly',
        name: 'Premium Monthly',
        interval: 'MONTHLY',
        amount: 1900,
        currency: 'usd',
        active: true,
        description: 'Premium monthly plan',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      mockPrismaUserFindUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      })
      mockPrismaUserSubscriptionUpdateMany.mockResolvedValue({ count: 0 })
      mockPrismaUserSubscriptionUpsert.mockResolvedValue({
        id: 'user-sub-123',
        stripeSubscriptionId: 'sub_test_123',
        userId: 'user-123',
        planId: 'plan-123',
        status: $Enums.MembershipStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        stripeCustomerId: 'cus_test_123',
        rawStripeData: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      mockPrismaUserUpdate.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      })
    })

    it('processes customer.subscription.updated event', async () => {
      const event: Stripe.Event = {
        id: 'evt_test_123',
        type: 'customer.subscription.updated',
        data: {
          object: mockSubscription,
        },
      } as Stripe.Event

      mockVerifyWebhookSignature.mockReturnValue(event)

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(event),
        headers: {
          'stripe-signature': 'test_signature',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)

      // Verify subscription was upserted
      expect(mockPrismaUserSubscriptionUpsert).toHaveBeenCalled()
    })

    it('handles subscription without userId metadata by fetching customer', async () => {
      const subscriptionWithoutUserId = {
        ...mockSubscription,
        metadata: {}, // No userId in subscription metadata
      }

      const mockCustomer: Stripe.Customer = {
        id: 'cus_test_123',
        object: 'customer',
        metadata: {
          userId: 'user-123',
        },
      } as Stripe.Customer

      mockStripeCustomers.mockResolvedValue(mockCustomer)

      const event: Stripe.Event = {
        id: 'evt_test_123',
        type: 'customer.subscription.updated',
        data: {
          object: subscriptionWithoutUserId,
        },
      } as Stripe.Event

      mockVerifyWebhookSignature.mockReturnValue(event)

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(event),
        headers: {
          'stripe-signature': 'test_signature',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockStripeCustomers.retrieve).toHaveBeenCalledWith('cus_test_123')
    })

    it('handles subscription cancelled event', async () => {
      const cancelledSubscription = {
        ...mockSubscription,
        status: 'canceled' as Stripe.Subscription.Status,
      }

      const event: Stripe.Event = {
        id: 'evt_test_123',
        type: 'customer.subscription.deleted',
        data: {
          object: cancelledSubscription,
        },
      } as Stripe.Event

      mockVerifyWebhookSignature.mockReturnValue(event)

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(event),
        headers: {
          'stripe-signature': 'test_signature',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      
      // Verify that the status was mapped correctly
      expect(mockPrismaUserSubscriptionUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            status: $Enums.MembershipStatus.CANCELLED,
          }),
          create: expect.objectContaining({
            status: $Enums.MembershipStatus.CANCELLED,
          }),
        })
      )
    })

    it('handles subscription with cancel_at_period_end = true', async () => {
      const subscriptionCancellingAtPeriodEnd = {
        ...mockSubscription,
        cancel_at_period_end: true,
      }

      const event: Stripe.Event = {
        id: 'evt_test_123',
        type: 'customer.subscription.updated',
        data: {
          object: subscriptionCancellingAtPeriodEnd,
        },
      } as Stripe.Event

      mockVerifyWebhookSignature.mockReturnValue(event)

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(event),
        headers: {
          'stripe-signature': 'test_signature',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      
      // Verify that cancelAtPeriodEnd was set correctly
      expect(mockPrismaUserSubscriptionUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            cancelAtPeriodEnd: true,
          }),
          create: expect.objectContaining({
            cancelAtPeriodEnd: true,
          }),
        })
      )
    })

    it('creates new subscription plan when not found in database', async () => {
      mockPrismaSubscriptionPlanFindUnique.mockResolvedValue(null)

      const event: Stripe.Event = {
        id: 'evt_test_123',
        type: 'customer.subscription.updated',
        data: {
          object: mockSubscription,
        },
      } as Stripe.Event

      mockVerifyWebhookSignature.mockReturnValue(event)

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(event),
        headers: {
          'stripe-signature': 'test_signature',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockPrismaSubscriptionPlanUpsert).toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('returns 500 when webhook processing fails', async () => {
      const event: Stripe.Event = {
        id: 'evt_test_123',
        type: 'customer.subscription.updated',
        data: {
          object: {} as Stripe.Subscription,
        },
      } as Stripe.Event

      mockVerifyWebhookSignature.mockReturnValue(event)
      mockPrismaWebhookEventCreate.mockResolvedValue({ id: 'evt_test', type: 'test' })
      
      // Force an error during processing
      mockPrismaUserFindUnique.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(event),
        headers: {
          'stripe-signature': 'test_signature',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Webhook processing error')
    })

    it('handles idempotency record errors gracefully', async () => {
      const event: Stripe.Event = {
        id: 'evt_test_123',
        type: 'test.event',
        data: {
          object: {},
        },
      } as Stripe.Event

      mockVerifyWebhookSignature.mockReturnValue(event)
      mockPrismaWebhookEventCreate.mockRejectedValue(new Error('Idempotency error'))

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(event),
        headers: {
          'stripe-signature': 'test_signature',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      // Should still return success despite idempotency error
      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
    })
  })
})