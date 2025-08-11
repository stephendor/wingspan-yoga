import { mapStripeStatus } from '@/app/api/webhooks/stripe/route'
import { $Enums } from '@prisma/client'

describe('mapStripeStatus', () => {
  const table: Array<[string, $Enums.MembershipStatus]> = [
    ['trialing', $Enums.MembershipStatus.TRIALING],
    ['active', $Enums.MembershipStatus.ACTIVE],
    ['past_due', $Enums.MembershipStatus.PAST_DUE],
    ['canceled', $Enums.MembershipStatus.CANCELLED],
    ['incomplete', $Enums.MembershipStatus.INCOMPLETE],
    ['incomplete_expired', $Enums.MembershipStatus.INCOMPLETE_EXPIRED],
    ['unpaid', $Enums.MembershipStatus.UNPAID],
    ['some_future_value', $Enums.MembershipStatus.ACTIVE], // default fallback
  ]

  test.each(table)('maps %s', (input, expected) => {
    const val = input as unknown as Parameters<typeof mapStripeStatus>[0]
    expect(mapStripeStatus(val)).toBe(expected)
  })
})
