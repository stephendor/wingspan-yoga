import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { getActiveUserSubscription } from '@/lib/auth/subscription'

jest.mock('@/lib/prisma', () => ({ prisma: { userSubscription: { findFirst: jest.fn() } } }))
import { prisma } from '@/lib/prisma'
import { $Enums } from '@prisma/client'

describe('getActiveUserSubscription', () => {
  const mockFindFirst = prisma.userSubscription.findFirst as unknown as jest.Mock

  beforeEach(() => {
    mockFindFirst.mockClear()
  })

  it('returns null when no active subscription exists', async () => {
    mockFindFirst.mockResolvedValue(null)
    const result = await getActiveUserSubscription('user-1')
    expect(result).toBeNull()
  })

  it('maps active subscription with derived membershipType', async () => {
    const now = new Date()
    const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    mockFindFirst.mockResolvedValue({
      id: 'sub-1',
      stripeSubscriptionId: 'stripe_sub_123',
      planId: 'plan-1',
      status: $Enums.MembershipStatus.ACTIVE,
      currentPeriodStart: now,
      currentPeriodEnd: future,
      cancelAtPeriodEnd: false,
      plan: { id: 'plan-1', name: 'Premium Unlimited', interval: 'MONTHLY' },
    })
    const result = await getActiveUserSubscription('user-1')
    expect(result?.membershipType).toBe($Enums.MembershipType.UNLIMITED)
    expect(result?.membershipStatus).toBe($Enums.MembershipStatus.ACTIVE)
  })
})
