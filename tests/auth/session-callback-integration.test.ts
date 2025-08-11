import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest'
import { prisma } from '../../src/lib/prisma'
import { getActiveUserSubscription } from '../../src/lib/auth/subscription'
import { authOptions } from '../../src/lib/auth/nextauth'
import { MembershipStatus, BillingInterval } from '@prisma/client'

// Mock the subscription helper
vi.mock('../../src/lib/auth/subscription', () => ({
  getActiveUserSubscription: vi.fn(),
}))

const mockGetActiveUserSubscription = getActiveUserSubscription as MockedFunction<typeof getActiveUserSubscription>

describe('NextAuth Session Callback Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('session callback enrichment', () => {
    it('should enrich session with membership data when active subscription exists', async () => {
      // Mock active subscription data
      const mockSubscriptionData = {
        membershipStatus: MembershipStatus.ACTIVE,
        membershipType: 'PREMIUM' as const,
        subscriptionPeriodEnd: new Date('2025-12-31T23:59:59.000Z'),
      }

      mockGetActiveUserSubscription.mockResolvedValue(mockSubscriptionData)

      // Mock session and token
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
        expires: '2025-01-01T00:00:00.000Z',
      }

      const mockToken = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      }

      // Get the session callback from authOptions
      const sessionCallback = authOptions.callbacks?.session

      if (!sessionCallback) {
        throw new Error('Session callback not found in authOptions')
      }

      // Call the session callback
      const enrichedSession = await sessionCallback({
        session: mockSession,
        token: mockToken,
      })

      // Verify the session was enriched with membership data
      expect(enrichedSession.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        membershipStatus: 'ACTIVE',
        subscriptionPeriodEnd: '2025-12-31T23:59:59.000Z',
      })

      // Verify the helper was called with correct user ID
      expect(mockGetActiveUserSubscription).toHaveBeenCalledWith('user-123')
    })

    it('should handle session when no active subscription exists', async () => {
      // Mock no subscription
      mockGetActiveUserSubscription.mockResolvedValue(null)

      const mockSession = {
        user: {
          id: 'user-456',
          email: 'basic@example.com',
          name: 'Basic User',
        },
        expires: '2025-01-01T00:00:00.000Z',
      }

      const mockToken = {
        sub: 'user-456',
        email: 'basic@example.com',
        name: 'Basic User',
      }

      const sessionCallback = authOptions.callbacks?.session!
      const enrichedSession = await sessionCallback({
        session: mockSession,
        token: mockToken,
      })

      // Verify session remains unchanged when no subscription
      expect(enrichedSession.user).toEqual({
        id: 'user-456',
        email: 'basic@example.com',
        name: 'Basic User',
      })

      expect(mockGetActiveUserSubscription).toHaveBeenCalledWith('user-456')
    })

    it('should handle different subscription statuses', async () => {
      const testCases = [
        {
          status: MembershipStatus.TRIALING,
          membershipType: 'PREMIUM' as const,
          expected: 'TRIALING',
        },
        {
          status: MembershipStatus.PAST_DUE,
          membershipType: 'PREMIUM' as const,
          expected: 'PAST_DUE',
        },
      ]

      for (const testCase of testCases) {
        // Reset mock for each test case
        mockGetActiveUserSubscription.mockResolvedValue({
          membershipStatus: testCase.status,
          membershipType: testCase.membershipType,
          subscriptionPeriodEnd: new Date('2025-12-31T23:59:59.000Z'),
        })

        const mockSession = {
          user: {
            id: 'user-test',
            email: 'test@example.com',
            name: 'Test User',
          },
          expires: '2025-01-01T00:00:00.000Z',
        }

        const mockToken = {
          sub: 'user-test',
          email: 'test@example.com',
          name: 'Test User',
        }

        const sessionCallback = authOptions.callbacks?.session!
        const enrichedSession = await sessionCallback({
          session: mockSession,
          token: mockToken,
        })

        expect(enrichedSession.user.membershipStatus).toBe(testCase.expected)
      }
    })

    it('should handle subscription helper errors gracefully', async () => {
      // Mock subscription helper throwing an error
      mockGetActiveUserSubscription.mockRejectedValue(new Error('Database error'))

      const mockSession = {
        user: {
          id: 'user-error',
          email: 'error@example.com',
          name: 'Error User',
        },
        expires: '2025-01-01T00:00:00.000Z',
      }

      const mockToken = {
        sub: 'user-error',
        email: 'error@example.com',
        name: 'Error User',
      }

      const sessionCallback = authOptions.callbacks?.session!

      // Should not throw and should return session without membership data
      await expect(
        sessionCallback({
          session: mockSession,
          token: mockToken,
        })
      ).resolves.toEqual({
        user: {
          id: 'user-error',
          email: 'error@example.com',
          name: 'Error User',
        },
        expires: '2025-01-01T00:00:00.000Z',
      })

      expect(mockGetActiveUserSubscription).toHaveBeenCalledWith('user-error')
    })
  })

  describe('subscription status transitions', () => {
    it('should reflect status change from ACTIVE to PAST_DUE in session', async () => {
      // Simulate initial active status
      mockGetActiveUserSubscription.mockResolvedValueOnce({
        membershipStatus: MembershipStatus.ACTIVE,
        membershipType: 'PREMIUM' as const,
        subscriptionPeriodEnd: new Date('2025-12-31T23:59:59.000Z'),
      })

      const mockSession = {
        user: {
          id: 'user-transition',
          email: 'transition@example.com',
          name: 'Transition User',
        },
        expires: '2025-01-01T00:00:00.000Z',
      }

      const mockToken = {
        sub: 'user-transition',
        email: 'transition@example.com',
        name: 'Transition User',
      }

      const sessionCallback = authOptions.callbacks?.session!

      // First call - ACTIVE status
      const activeSession = await sessionCallback({
        session: mockSession,
        token: mockToken,
      })

      expect(activeSession.user.membershipStatus).toBe('ACTIVE')

      // Simulate status change to PAST_DUE
      mockGetActiveUserSubscription.mockResolvedValueOnce({
        membershipStatus: MembershipStatus.PAST_DUE,
        membershipType: 'PREMIUM' as const,
        subscriptionPeriodEnd: new Date('2025-12-31T23:59:59.000Z'),
      })

      // Second call - PAST_DUE status
      const pastDueSession = await sessionCallback({
        session: mockSession,
        token: mockToken,
      })

      expect(pastDueSession.user.membershipStatus).toBe('PAST_DUE')
    })
  })
})