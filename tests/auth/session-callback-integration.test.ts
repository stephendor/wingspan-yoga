import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { getActiveUserSubscription } from '@/lib/auth/subscription'
import { authOptions } from '@/lib/auth/nextauth'
import { MembershipStatus } from '@prisma/client'

// Mock the subscription helper
jest.mock('@/lib/auth/subscription', () => ({
  getActiveUserSubscription: jest.fn(),
}))

const mockGetActiveUserSubscription = getActiveUserSubscription as jest.MockedFunction<typeof getActiveUserSubscription>

describe('NextAuth Session Callback Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

      // Mock session and token with proper structure
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          membershipType: 'STANDARD',
        },
        expires: '2025-01-01T00:00:00.000Z',
      } as any

      const mockToken = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        membershipType: 'STANDARD',
      } as any

      // Mock params for the callback
      const mockParams = {
        session: mockSession,
        token: mockToken,
        user: {} as any,
      }

      // Get the session callback from authOptions
      const sessionCallback = authOptions.callbacks?.session

      if (!sessionCallback) {
        throw new Error('Session callback not found in authOptions')
      }

      // Call the session callback
      const enrichedSession = await sessionCallback(mockParams)

      // Verify the session was enriched with membership data
      expect(enrichedSession.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        membershipType: 'STANDARD',
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
          membershipType: 'STANDARD',
        },
        expires: '2025-01-01T00:00:00.000Z',
      } as any

      const mockToken = {
        sub: 'user-456',
        email: 'basic@example.com',
        name: 'Basic User',
        membershipType: 'STANDARD',
      } as any

      const mockParams = {
        session: mockSession,
        token: mockToken,
        user: {} as any,
      }

      const sessionCallback = authOptions.callbacks?.session!
      const enrichedSession = await sessionCallback(mockParams)

      // Verify session remains unchanged when no subscription
      expect(enrichedSession.user).toEqual({
        id: 'user-456',
        email: 'basic@example.com',
        name: 'Basic User',
        membershipType: 'STANDARD',
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
            membershipType: 'STANDARD',
          },
          expires: '2025-01-01T00:00:00.000Z',
        } as any

        const mockToken = {
          sub: 'user-test',
          email: 'test@example.com',
          name: 'Test User',
          membershipType: 'STANDARD',
        } as any

        const mockParams = {
          session: mockSession,
          token: mockToken,
          user: {} as any,
        }

        const sessionCallback = authOptions.callbacks?.session!
        const enrichedSession = await sessionCallback(mockParams)

        expect((enrichedSession.user as any)?.membershipStatus).toBe(testCase.expected)
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
          membershipType: 'STANDARD',
        },
        expires: '2025-01-01T00:00:00.000Z',
      } as any

      const mockToken = {
        sub: 'user-error',
        email: 'error@example.com',
        name: 'Error User',
        membershipType: 'STANDARD',
      } as any

      const mockParams = {
        session: mockSession,
        token: mockToken,
        user: {} as any,
      }

      const sessionCallback = authOptions.callbacks?.session!

      // Should not throw and should return session without membership data
      const result = await sessionCallback(mockParams)
      
      expect(result).toEqual({
        user: {
          id: 'user-error',
          email: 'error@example.com',
          name: 'Error User',
          membershipType: 'STANDARD',
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
          membershipType: 'STANDARD',
        },
        expires: '2025-01-01T00:00:00.000Z',
      } as any

      const mockToken = {
        sub: 'user-transition',
        email: 'transition@example.com',
        name: 'Transition User',
        membershipType: 'STANDARD',
      } as any

      const mockParams = {
        session: mockSession,
        token: mockToken,
        user: {} as any,
      }

      const sessionCallback = authOptions.callbacks?.session!

      // First call - ACTIVE status
      const activeSession = await sessionCallback(mockParams)
      expect((activeSession.user as any)?.membershipStatus).toBe('ACTIVE')

      // Simulate status change to PAST_DUE
      mockGetActiveUserSubscription.mockResolvedValueOnce({
        membershipStatus: MembershipStatus.PAST_DUE,
        membershipType: 'PREMIUM' as const,
        subscriptionPeriodEnd: new Date('2025-12-31T23:59:59.000Z'),
      })

      // Second call - PAST_DUE status
      const pastDueSession = await sessionCallback(mockParams)
      expect((pastDueSession.user as any)?.membershipStatus).toBe('PAST_DUE')
    })
  })
})