// Mocks first to avoid env requirements
jest.mock('../../src/lib/stripe/plans', () => ({
  getPlanByPriceId: () => ({
    key: 'basic_monthly',
    name: 'Basic',
    interval: 'MONTHLY',
    amount: 1999,
    currency: 'usd',
    stripePriceId: 'price_basic_monthly',
    active: true,
    features: [],
    description: 'Mock plan',
  }),
}))

jest.mock('../../src/lib/stripe', () => ({
  stripe: { subscriptions: { retrieve: async () => ({ id: 'sub_mock', metadata: { userId: 'user_mock' } }) }, customers: { retrieve: async () => ({ metadata: { userId: 'user_mock' } }) }, prices: { retrieve: async () => ({ active: true }) } },
  verifyWebhookSignature: jest.fn(() => ({ id: 'evt_mock', type: 'mock', data: { object: {} } })),
}))

import { prisma } from '../../src/lib/prisma'
import { recordEventOnce } from '../../src/app/api/webhooks/stripe/route'
import type Stripe from 'stripe'

function makeMockEvent(id: string, type: string): Stripe.Event {
  const minimalObject: Record<string, unknown> = {}
  return {
    id,
    type,
    api_version: '2024-01-01',
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    object: 'event',
    pending_webhooks: 0,
    request: { id: 'req_mock', idempotency_key: null },
    data: { object: minimalObject },
  } as unknown as Stripe.Event
}

describe('Stripe Webhook Idempotency', () => {
  const eventId = 'evt_test_idempotency_jest'
  const event = makeMockEvent(eventId, 'test.event')

  beforeAll(async () => {
    // @ts-expect-error delegate may not be generated in some contexts
    await prisma.webhookEvent?.deleteMany?.({ where: { id: eventId } })
  })

  afterAll(async () => {
    // @ts-expect-error delegate may not be generated in some contexts
    await prisma.webhookEvent?.deleteMany?.({ where: { id: eventId } })
    await prisma.$disconnect()
  })

  test('records first occurrence and skips duplicate', async () => {
    const first = await recordEventOnce(event)
    expect(first).toBe(true)

    const second = await recordEventOnce(event)
    expect(second).toBe(false)

    // @ts-expect-error delegate may not be generated in some contexts
    const count = await prisma.webhookEvent?.count?.({ where: { id: eventId } })
    expect(count).toBe(1)
  })
})
