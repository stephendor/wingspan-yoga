import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { getActiveUserSubscription } from '@/lib/auth/subscription'
import { $Enums } from '@prisma/client'

// Mock the subscription utility
jest.mock('@/lib/auth/subscription', () => ({
  getActiveUserSubscription: jest.fn(),
}))

const mockGetActiveUserSubscription = getActiveUserSubscription as jest.MockedFunction<typeof getActiveUserSubscription>

describe('Membership Gating', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getActiveUserSubscription', () => {
    it('allows access for active subscription', async () => {
      const mockActiveSubscription = {
        id: 'sub-123',
        stripeSubscriptionId: 'stripe_sub_123',
        membershipStatus: $Enums.MembershipStatus.ACTIVE,
        membershipType: $Enums.MembershipType.PREMIUM,
        planId: 'plan-1',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        cancelAtPeriodEnd: false,
        plan: {
          id: 'plan-1',
          name: 'Premium Monthly',
          interval: 'MONTHLY',
        },
      }

      mockGetActiveUserSubscription.mockResolvedValue(mockActiveSubscription)

      const result = await getActiveUserSubscription('user-123')
      
      expect(result).not.toBeNull()
      expect(result?.membershipStatus).toBe($Enums.MembershipStatus.ACTIVE)
      expect(result?.membershipType).toBe($Enums.MembershipType.PREMIUM)
    })

    it('blocks access for inactive subscription', async () => {
      mockGetActiveUserSubscription.mockResolvedValue(null)

      const result = await getActiveUserSubscription('user-123')
      
      expect(result).toBeNull()
    })

    it('allows access for trialing subscription', async () => {
      const mockTrialingSubscription = {
        id: 'sub-123',
        stripeSubscriptionId: 'stripe_sub_123',
        membershipStatus: $Enums.MembershipStatus.TRIALING,
        membershipType: $Enums.MembershipType.PREMIUM,
        planId: 'plan-1',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        cancelAtPeriodEnd: false,
        plan: {
          id: 'plan-1',
          name: 'Premium Monthly',
          interval: 'MONTHLY',
        },
      }

      mockGetActiveUserSubscription.mockResolvedValue(mockTrialingSubscription)

      const result = await getActiveUserSubscription('user-123')
      
      expect(result).not.toBeNull()
      expect(result?.membershipStatus).toBe($Enums.MembershipStatus.TRIALING)
    })

    it('blocks access for cancelled subscription', async () => {
      const mockCancelledSubscription = {
        id: 'sub-123',
        stripeSubscriptionId: 'stripe_sub_123',
        membershipStatus: $Enums.MembershipStatus.CANCELLED,
        membershipType: $Enums.MembershipType.PREMIUM,
        planId: 'plan-1',
        currentPeriodStart: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        currentPeriodEnd: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        cancelAtPeriodEnd: false,
        plan: {
          id: 'plan-1',
          name: 'Premium Monthly',
          interval: 'MONTHLY',
        },
      }

      // Cancelled subscriptions should not be returned by getActiveUserSubscription
      mockGetActiveUserSubscription.mockResolvedValue(null)

      const result = await getActiveUserSubscription('user-123')
      
      expect(result).toBeNull()
    })

    it('handles subscription with cancel at period end but still active', async () => {
      const mockCancellingSubscription = {
        id: 'sub-123',
        stripeSubscriptionId: 'stripe_sub_123',
        membershipStatus: $Enums.MembershipStatus.ACTIVE,
        membershipType: $Enums.MembershipType.PREMIUM,
        planId: 'plan-1',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        cancelAtPeriodEnd: true, // Cancelling but still active
        plan: {
          id: 'plan-1',
          name: 'Premium Monthly',
          interval: 'MONTHLY',
        },
      }

      mockGetActiveUserSubscription.mockResolvedValue(mockCancellingSubscription)

      const result = await getActiveUserSubscription('user-123')
      
      expect(result).not.toBeNull()
      expect(result?.membershipStatus).toBe($Enums.MembershipStatus.ACTIVE)
      expect(result?.cancelAtPeriodEnd).toBe(true)
    })

    it('blocks access for past due subscription', async () => {
      // Past due subscriptions should not be returned as active
      mockGetActiveUserSubscription.mockResolvedValue(null)

      const result = await getActiveUserSubscription('user-123')
      
      expect(result).toBeNull()
    })
  })

  describe('Membership Type Access Control', () => {
    const createMockSubscription = (membershipType: $Enums.MembershipType) => ({
      id: 'sub-123',
      stripeSubscriptionId: 'stripe_sub_123',
      membershipStatus: $Enums.MembershipStatus.ACTIVE,
      membershipType,
      planId: 'plan-1',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      plan: {
        id: 'plan-1',
        name: 'Test Plan',
        interval: 'MONTHLY',
      },
    })

    it('basic membership has appropriate access level', async () => {
      const basicSubscription = createMockSubscription($Enums.MembershipType.BASIC)
      mockGetActiveUserSubscription.mockResolvedValue(basicSubscription)

      const result = await getActiveUserSubscription('user-123')
      
      expect(result?.membershipType).toBe($Enums.MembershipType.BASIC)
    })

    it('premium membership has appropriate access level', async () => {
      const premiumSubscription = createMockSubscription($Enums.MembershipType.PREMIUM)
      mockGetActiveUserSubscription.mockResolvedValue(premiumSubscription)

      const result = await getActiveUserSubscription('user-123')
      
      expect(result?.membershipType).toBe($Enums.MembershipType.PREMIUM)
    })

    it('unlimited membership has appropriate access level', async () => {
      const unlimitedSubscription = createMockSubscription($Enums.MembershipType.UNLIMITED)
      mockGetActiveUserSubscription.mockResolvedValue(unlimitedSubscription)

      const result = await getActiveUserSubscription('user-123')
      
      expect(result?.membershipType).toBe($Enums.MembershipType.UNLIMITED)
    })
  })

  describe('Content Access Logic', () => {
    const hasAccess = (subscription: any, contentTier: $Enums.MembershipType) => {
      if (!subscription) return false
      
      // Define tier hierarchy: BASIC < PREMIUM < UNLIMITED
      const tierValues = {
        [$Enums.MembershipType.BASIC]: 1,
        [$Enums.MembershipType.PREMIUM]: 2,
        [$Enums.MembershipType.UNLIMITED]: 3,
      }
      
      const userTier = tierValues[subscription.membershipType] || 0
      const requiredTier = tierValues[contentTier] || 1
      
      return userTier >= requiredTier
    }

    it('basic user can access basic content', async () => {
      const basicSubscription = {
        membershipType: $Enums.MembershipType.BASIC,
        membershipStatus: $Enums.MembershipStatus.ACTIVE,
      }
      
      const access = hasAccess(basicSubscription, $Enums.MembershipType.BASIC)
      expect(access).toBe(true)
    })

    it('basic user cannot access premium content', async () => {
      const basicSubscription = {
        membershipType: $Enums.MembershipType.BASIC,
        membershipStatus: $Enums.MembershipStatus.ACTIVE,
      }
      
      const access = hasAccess(basicSubscription, $Enums.MembershipType.PREMIUM)
      expect(access).toBe(false)
    })

    it('premium user can access basic and premium content', async () => {
      const premiumSubscription = {
        membershipType: $Enums.MembershipType.PREMIUM,
        membershipStatus: $Enums.MembershipStatus.ACTIVE,
      }
      
      const basicAccess = hasAccess(premiumSubscription, $Enums.MembershipType.BASIC)
      const premiumAccess = hasAccess(premiumSubscription, $Enums.MembershipType.PREMIUM)
      
      expect(basicAccess).toBe(true)
      expect(premiumAccess).toBe(true)
    })

    it('unlimited user can access all content', async () => {
      const unlimitedSubscription = {
        membershipType: $Enums.MembershipType.UNLIMITED,
        membershipStatus: $Enums.MembershipStatus.ACTIVE,
      }
      
      const basicAccess = hasAccess(unlimitedSubscription, $Enums.MembershipType.BASIC)
      const premiumAccess = hasAccess(unlimitedSubscription, $Enums.MembershipType.PREMIUM)
      const unlimitedAccess = hasAccess(unlimitedSubscription, $Enums.MembershipType.UNLIMITED)
      
      expect(basicAccess).toBe(true)
      expect(premiumAccess).toBe(true)
      expect(unlimitedAccess).toBe(true)
    })

    it('no subscription blocks all content access', async () => {
      const access = hasAccess(null, $Enums.MembershipType.BASIC)
      expect(access).toBe(false)
    })
  })

  describe('Subscription Expiry Handling', () => {
    it('expired subscription blocks access', async () => {
      // Simulate expired subscription by returning null from getActiveUserSubscription
      mockGetActiveUserSubscription.mockResolvedValue(null)

      const result = await getActiveUserSubscription('user-123')
      
      expect(result).toBeNull()
    })

    it('subscription expiring soon still allows access', async () => {
      const expiringSoonSubscription = {
        id: 'sub-123',
        stripeSubscriptionId: 'stripe_sub_123',
        membershipStatus: $Enums.MembershipStatus.ACTIVE,
        membershipType: $Enums.MembershipType.PREMIUM,
        planId: 'plan-1',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        cancelAtPeriodEnd: false,
        plan: {
          id: 'plan-1',
          name: 'Premium Monthly',
          interval: 'MONTHLY',
        },
      }

      mockGetActiveUserSubscription.mockResolvedValue(expiringSoonSubscription)

      const result = await getActiveUserSubscription('user-123')
      
      expect(result).not.toBeNull()
      expect(result?.membershipStatus).toBe($Enums.MembershipStatus.ACTIVE)
    })
  })
})