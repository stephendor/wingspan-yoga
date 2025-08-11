import { prisma } from '@/lib/prisma'
import { $Enums } from '@prisma/client'

export interface ActiveUserSubscription {
  id: string
  stripeSubscriptionId: string
  planId: string
  membershipType: $Enums.MembershipType
  membershipStatus: $Enums.MembershipStatus
  currentPeriodEnd: Date
  currentPeriodStart: Date
  cancelAtPeriodEnd: boolean
}

// Statuses considered active enough for access until period end
const ACTIVE_LIKE: $Enums.MembershipStatus[] = [
  $Enums.MembershipStatus.ACTIVE,
  $Enums.MembershipStatus.TRIALING,
  $Enums.MembershipStatus.PAST_DUE,
]

function deriveMembershipType(planName: string, interval: string): $Enums.MembershipType {
  const upper = planName.toUpperCase()
  if (upper.includes('UNLIMITED')) return $Enums.MembershipType.UNLIMITED
  if (upper.includes('PREMIUM')) return $Enums.MembershipType.PREMIUM
  if (upper.includes('BASIC')) return $Enums.MembershipType.BASIC
  if (interval === 'YEARLY') return $Enums.MembershipType.PREMIUM
  return $Enums.MembershipType.BASIC
}

/**
 * Return the current active (or trial/past_due) subscription for the user if one exists.
 */
export async function getActiveUserSubscription(userId: string): Promise<ActiveUserSubscription | null> {
  try {
    const now = new Date()
    const sub = await prisma.userSubscription.findFirst({
      where: {
        user: { id: userId },
        status: { in: ACTIVE_LIKE },
        currentPeriodEnd: { gt: now },
      },
      include: { plan: true },
      orderBy: { currentPeriodEnd: 'desc' },
    })
    if (!sub) return null
    const membershipType = deriveMembershipType(sub.plan.name, sub.plan.interval)
    return {
      id: sub.id,
      stripeSubscriptionId: sub.stripeSubscriptionId,
      planId: sub.planId,
      membershipType,
      membershipStatus: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd,
      currentPeriodStart: sub.currentPeriodStart,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    }
  } catch (err) {
    console.warn('[auth] getActiveUserSubscription failed', err)
    return null
  }
}
