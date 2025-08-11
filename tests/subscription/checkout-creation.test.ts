import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { PLAN_DEFINITIONS } from '@/lib/stripe/plans'

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth/nextauth', () => ({
  authOptions: {},
}))

jest.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))

// Import after mocks
import { POST } from '@/app/api/subscriptions/create/route'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockStripeCheckout = stripe.checkout.sessions.create as jest.MockedFunction<typeof stripe.checkout.sessions.create>
const mockPrismaUser = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>

describe('/api/subscriptions/create', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  }

  const mockSession = {
    user: mockUser,
  }

  const validPlanKey = PLAN_DEFINITIONS[0]?.key || 'basic_monthly'

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXTAUTH_URL = 'http://localhost:3000'
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
  })

  afterEach(() => {
    delete process.env.NEXTAUTH_URL
    delete process.env.STRIPE_WEBHOOK_SECRET
  })

  describe('authentication', () => {
    it('returns 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/subscriptions/create', {
        method: 'POST',
        body: JSON.stringify({ planKey: validPlanKey }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })

    it('returns 404 when user not found in database', async () => {
      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrismaUser.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/subscriptions/create', {
        method: 'POST',
        body: JSON.stringify({ planKey: validPlanKey }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User not found')
    })
  })

  describe('plan validation', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrismaUser.mockResolvedValue(mockUser)
    })

    it('returns 400 for missing planKey', async () => {
      const request = new NextRequest('http://localhost:3000/api/subscriptions/create', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Plan key is required')
    })

    it('returns 400 for invalid planKey', async () => {
      const request = new NextRequest('http://localhost:3000/api/subscriptions/create', {
        method: 'POST',
        body: JSON.stringify({ planKey: 'invalid_plan' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid plan selected')
    })

    it('returns 400 for inactive plan', async () => {
      const inactivePlan = PLAN_DEFINITIONS.find(plan => !plan.active)
      if (inactivePlan) {
        const request = new NextRequest('http://localhost:3000/api/subscriptions/create', {
          method: 'POST',
          body: JSON.stringify({ planKey: inactivePlan.key }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Plan is not available')
      }
    })
  })

  describe('checkout session creation', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrismaUser.mockResolvedValue(mockUser)
    })

    it('creates checkout session with correct parameters', async () => {
      const mockCheckoutSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      }

      mockStripeCheckout.mockResolvedValue(mockCheckoutSession as any)

      const request = new NextRequest('http://localhost:3000/api/subscriptions/create', {
        method: 'POST',
        body: JSON.stringify({ planKey: validPlanKey }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.sessionId).toBe(mockCheckoutSession.id)
      expect(data.url).toBe(mockCheckoutSession.url)

      // Verify Stripe was called with correct parameters
      expect(mockStripeCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription',
          customer_email: mockUser.email,
          line_items: expect.arrayContaining([
            expect.objectContaining({
              price: expect.any(String),
              quantity: 1,
            }),
          ]),
          success_url: expect.stringContaining('/membership/success'),
          cancel_url: expect.stringContaining('/membership?cancelled=1'),
          metadata: expect.objectContaining({
            userId: mockUser.id,
            planKey: validPlanKey,
          }),
        })
      )
    })

    it('handles Stripe errors gracefully', async () => {
      const stripeError = new Error('Your card was declined.')
      mockStripeCheckout.mockRejectedValue(stripeError)

      const request = new NextRequest('http://localhost:3000/api/subscriptions/create', {
        method: 'POST',
        body: JSON.stringify({ planKey: validPlanKey }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create checkout session')
    })

    it('validates environment configuration', async () => {
      delete process.env.NEXTAUTH_URL

      const request = new NextRequest('http://localhost:3000/api/subscriptions/create', {
        method: 'POST',
        body: JSON.stringify({ planKey: validPlanKey }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Server configuration error')
    })
  })

  describe('request body parsing', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrismaUser.mockResolvedValue(mockUser)
    })

    it('handles invalid JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/subscriptions/create', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid request body')
    })

    it('handles missing body gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/subscriptions/create', {
        method: 'POST',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Plan key is required')
    })
  })
})