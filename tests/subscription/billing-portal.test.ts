import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth/nextauth', () => ({
  authOptions: {},
}))

jest.mock('@/lib/stripe', () => ({
  stripe: {
    billingPortal: {
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
import { POST } from '@/app/api/subscriptions/portal/route'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { $Enums } from '@prisma/client'

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockStripePortal = stripe.billingPortal.sessions.create as jest.MockedFunction<typeof stripe.billingPortal.sessions.create>
const mockPrismaUser = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>

describe('/api/subscriptions/portal', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    subscriptions: [
      {
        id: 'sub-123',
        stripeCustomerId: 'cus_test123',
        status: $Enums.MembershipStatus.ACTIVE,
        createdAt: new Date(),
      },
    ],
  }

  const mockSession = {
    user: mockUser,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXTAUTH_URL = 'http://localhost:3000'
  })

  afterEach(() => {
    delete process.env.NEXTAUTH_URL
  })

  describe('authentication', () => {
    it('returns 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/subscriptions/portal', {
        method: 'POST',
        body: JSON.stringify({ returnUrl: '/membership' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })

    it('returns 404 when user not found in database', async () => {
      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrismaUser.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/subscriptions/portal', {
        method: 'POST',
        body: JSON.stringify({ returnUrl: '/membership' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User not found')
    })
  })

  describe('subscription validation', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession)
    })

    it('returns 404 when user has no subscriptions', async () => {
      const userWithoutSubscriptions = {
        ...mockUser,
        subscriptions: [],
      }
      mockPrismaUser.mockResolvedValue(userWithoutSubscriptions)

      const request = new NextRequest('http://localhost:3000/api/subscriptions/portal', {
        method: 'POST',
        body: JSON.stringify({ returnUrl: '/membership' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('No active subscription found')
    })

    it('returns 404 when subscription has no Stripe customer ID', async () => {
      const userWithInvalidSubscription = {
        ...mockUser,
        subscriptions: [
          {
            id: 'sub-123',
            stripeCustomerId: null,
            status: $Enums.MembershipStatus.ACTIVE,
            createdAt: new Date(),
          },
        ],
      }
      mockPrismaUser.mockResolvedValue(userWithInvalidSubscription)

      const request = new NextRequest('http://localhost:3000/api/subscriptions/portal', {
        method: 'POST',
        body: JSON.stringify({ returnUrl: '/membership' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('No active subscription found')
    })
  })

  describe('billing portal creation', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrismaUser.mockResolvedValue(mockUser)
    })

    it('creates billing portal session with correct parameters', async () => {
      const mockPortalSession = {
        id: 'bps_test_123',
        url: 'https://billing.stripe.com/p/session/bps_test_123',
      }

      mockStripePortal.mockResolvedValue(mockPortalSession as any)

      const request = new NextRequest('http://localhost:3000/api/subscriptions/portal', {
        method: 'POST',
        body: JSON.stringify({ returnUrl: '/membership' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.url).toBe(mockPortalSession.url)

      // Verify Stripe was called with correct parameters
      expect(mockStripePortal).toHaveBeenCalledWith({
        customer: 'cus_test123',
        return_url: '/membership',
      })
    })

    it('uses default return URL when not provided', async () => {
      const mockPortalSession = {
        id: 'bps_test_123',
        url: 'https://billing.stripe.com/p/session/bps_test_123',
      }

      mockStripePortal.mockResolvedValue(mockPortalSession as any)

      const request = new NextRequest('http://localhost:3000/api/subscriptions/portal', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockStripePortal).toHaveBeenCalledWith({
        customer: 'cus_test123',
        return_url: 'http://localhost:3000/membership',
      })
    })

    it('handles invalid JSON in request body', async () => {
      const mockPortalSession = {
        id: 'bps_test_123',
        url: 'https://billing.stripe.com/p/session/bps_test_123',
      }

      mockStripePortal.mockResolvedValue(mockPortalSession as any)

      const request = new NextRequest('http://localhost:3000/api/subscriptions/portal', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockStripePortal).toHaveBeenCalledWith({
        customer: 'cus_test123',
        return_url: 'http://localhost:3000/membership',
      })
    })
  })

  describe('error handling', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrismaUser.mockResolvedValue(mockUser)
    })

    it('handles Stripe customer not found error', async () => {
      const customerNotFoundError = new Error('No such customer: cus_test123')
      mockStripePortal.mockRejectedValue(customerNotFoundError)

      const request = new NextRequest('http://localhost:3000/api/subscriptions/portal', {
        method: 'POST',
        body: JSON.stringify({ returnUrl: '/membership' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Customer not found in billing system')
    })

    it('handles generic Stripe errors', async () => {
      const genericError = new Error('Something went wrong')
      mockStripePortal.mockRejectedValue(genericError)

      const request = new NextRequest('http://localhost:3000/api/subscriptions/portal', {
        method: 'POST',
        body: JSON.stringify({ returnUrl: '/membership' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create billing portal session')
    })

    it('handles non-Error exceptions', async () => {
      mockStripePortal.mockRejectedValue('string error')

      const request = new NextRequest('http://localhost:3000/api/subscriptions/portal', {
        method: 'POST',
        body: JSON.stringify({ returnUrl: '/membership' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create billing portal session')
    })
  })

  describe('subscription filtering', () => {
    it('uses most recent active subscription', async () => {
      const userWithMultipleSubscriptions = {
        ...mockUser,
        subscriptions: [
          {
            id: 'sub-newest',
            stripeCustomerId: 'cus_newest',
            status: $Enums.MembershipStatus.ACTIVE,
            createdAt: new Date('2024-02-01'),
          },
          {
            id: 'sub-older',
            stripeCustomerId: 'cus_older',
            status: $Enums.MembershipStatus.CANCELLED,
            createdAt: new Date('2024-01-01'),
          },
        ],
      }

      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrismaUser.mockResolvedValue(userWithMultipleSubscriptions)

      const mockPortalSession = {
        id: 'bps_test_123',
        url: 'https://billing.stripe.com/p/session/bps_test_123',
      }
      mockStripePortal.mockResolvedValue(mockPortalSession as any)

      const request = new NextRequest('http://localhost:3000/api/subscriptions/portal', {
        method: 'POST',
        body: JSON.stringify({ returnUrl: '/membership' }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockStripePortal).toHaveBeenCalledWith({
        customer: 'cus_newest',
        return_url: '/membership',
      })
    })
  })
})