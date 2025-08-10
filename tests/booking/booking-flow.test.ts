/**
 * Booking & Payment Flow Tests (Mocked Integration)
 * -------------------------------------------------
 * Exercises core logic paths of the booking/payment API routes:
 *  - POST /api/payments/create-intent
 *  - POST /api/bookings/confirm
 *
 * Mocks:
 *  - Prisma client (@/lib/prisma)
 *  - Stripe helpers (@/lib/stripe)
 *  - Email sender (@/lib/email/sendBookingConfirmation)
 *  - getServerSession (next-auth)
 *
 * Focus: business invariants (capacity, duplicate, amount integrity, payment status, idempotency / race)
 */
import { NextRequest } from 'next/server'
import { POST as createIntent } from '@/app/api/payments/create-intent/route'
import { POST as confirmBooking } from '@/app/api/bookings/confirm/route'

// NOTE: jest.mock calls are hoisted; we import stripe mock types afterwards for direct access

// ------------------ In‑Memory Stores ------------------
interface ClassRecord {
  id: string
  title: string
  startTime: Date
  capacity: number
  price: number
  status: string
  instructor: { name: string }
}

interface BookingRecord {
  id: string
  userId: string
  classId: string
  status: 'CONFIRMED'
  notes?: string
}

interface PaymentRecord {
  stripePaymentId: string
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED'
  amount: number
  currency: string
  userId: string
  classId: string
}

interface PaymentIntentMock {
  id: string
  client_secret: string
  status: string
  amount: number
  currency: string
  metadata: Record<string, unknown>
}

// Minimal Prisma-like type surfaces used in mocks
interface PrismaClassWhereUniqueInput { id: string }
interface PrismaBookingWhereUniqueInput { id?: string; userId_classId?: { userId: string; classId: string } }
interface CreateBookingArgs { data: { userId: string; classId: string; notes?: string }; include?: { class?: { include?: { instructor?: boolean } } } }
interface CreatePaymentArgs { data: { stripePaymentId: string; status: PaymentRecord['status']; amount: number; currency: string; userId: string; classId: string } }
interface UpdatePaymentArgs { where: { stripePaymentId: string }; data: Partial<PaymentRecord> }
type TxFunction = (tx: unknown) => Promise<unknown>

const db = {
  classes: new Map<string, ClassRecord>(),
  bookings: new Map<string, BookingRecord>(),
  payments: new Map<string, PaymentRecord>(),
}

let idCounter = 1
const genId = () => `id_${idCounter++}`

// Utility to seed a class
const seedClass = (overrides: Partial<ClassRecord> = {}) => {
  const id = overrides.id || genId()
  const rec: ClassRecord = {
    id,
    title: overrides.title || 'Morning Flow',
    startTime: overrides.startTime || new Date(Date.now() + 3600_000),
    capacity: overrides.capacity ?? 5,
    price: overrides.price ?? 2000,
    status: overrides.status || 'SCHEDULED',
    instructor: overrides.instructor || { name: 'Alice' },
  }
  db.classes.set(id, rec)
  return rec
}

// ------------------ Mocks ------------------
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(async () => ({ user: { id: 'user_1', email: 'user@example.com', name: 'Test User' } })),
}))
jest.mock('next-auth/next', () => ({}))
jest.mock('@/lib/auth/nextauth', () => ({ authOptions: {} }))

// Prisma mock
jest.mock('@/lib/prisma', () => {
  type WhereClass = { where: PrismaClassWhereUniqueInput; include?: unknown }
  const prismaMock = {
    class: {
      findUnique: jest.fn(async ({ where, include }: WhereClass) => {
        const rec = db.classes.get(where.id)
        if (!rec) return null
        if (!include) return rec
        const confirmedCount = Array.from(db.bookings.values()).filter(b => b.classId === rec.id && b.status === 'CONFIRMED').length
        return {
          ...rec,
          instructor: rec.instructor,
          _count: { bookings: confirmedCount },
        }
      }),
    },
    booking: {
      findUnique: jest.fn(async ({ where }: { where: PrismaBookingWhereUniqueInput }) => {
        if (where.id) {
          return db.bookings.get(where.id) || null
        }
        if (where.userId_classId) {
          const { userId, classId } = where.userId_classId
          return Array.from(db.bookings.values()).find(b => b.userId === userId && b.classId === classId) || null
        }
        return null
      }),
      create: jest.fn(async ({ data, include }: CreateBookingArgs) => {
        // Idempotency guard inside mock: if a booking already exists for same user/class, return it
        const existing = Array.from(db.bookings.values()).find(b => b.userId === data.userId && b.classId === data.classId)
        if (existing) {
          const klassExisting = db.classes.get(existing.classId)!
          if (include?.class?.include?.instructor) {
            return { ...existing, class: { ...klassExisting, instructor: klassExisting.instructor } }
          }
          return existing
        }
        const rec: BookingRecord = { id: genId(), userId: data.userId, classId: data.classId, status: 'CONFIRMED', notes: data.notes }
        db.bookings.set(rec.id, rec)
        const klass = db.classes.get(rec.classId)!
        if (include?.class?.include?.instructor) {
          return { ...rec, class: { ...klass, instructor: klass.instructor } }
        }
        return rec
      }),
    },
    payment: {
      create: jest.fn(async ({ data }: CreatePaymentArgs) => {
        const rec: PaymentRecord = {
          stripePaymentId: data.stripePaymentId,
          status: data.status,
          amount: data.amount,
          currency: data.currency,
          userId: data.userId,
          classId: data.classId,
        }
        db.payments.set(rec.stripePaymentId, rec)
        return rec
      }),
      update: jest.fn(async ({ where, data }: UpdatePaymentArgs) => {
        const rec = db.payments.get(where.stripePaymentId)
        if (rec) Object.assign(rec, data)
        return rec
      }),
    },
    $transaction: async (fn: TxFunction) => fn(prismaMock),
  }
  return { prisma: prismaMock }
})

// Stripe utilities mock
jest.mock('@/lib/stripe', () => {
  const paymentIntents: Record<string, PaymentIntentMock> = {}
  return {
    getOrCreateCustomer: jest.fn(async () => ({ id: 'cus_123' })),
    createPaymentIntent: jest.fn(async ({ amount, currency, metadata }: { amount: number; currency: string; metadata: Record<string, unknown> }) => {
      const id = `pi_${genId()}`
      const intent: PaymentIntentMock = { id, client_secret: `secret_${id}`, status: 'requires_confirmation', amount, currency, metadata }
      paymentIntents[id] = intent
      return intent
    }),
    retrievePaymentIntent: jest.fn(async (id: string) => paymentIntents[id]),
    __setPaymentIntentStatus: (id: string, status: string) => { if (paymentIntents[id]) paymentIntents[id].status = status },
  }
})

// Import mocked stripe helpers after declaration (type-safe)
// Import as unknown then cast to include test-only helper
import * as stripeModule from '@/lib/stripe'
const stripeMock = stripeModule as typeof stripeModule & { __setPaymentIntentStatus: (id: string, status: string) => void }

// Email mock
jest.mock('@/lib/email/sendBookingConfirmation', () => ({
  sendBookingConfirmationEmail: jest.fn(async () => undefined),
}))

// Helper to construct NextRequest with JSON body
function jsonRequest(url: string, body: unknown) {
  const req = new Request(url, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } })
  return new NextRequest(req)
}

describe('Booking & Payment Flow', () => {
  beforeEach(() => {
    db.classes.clear()
    db.bookings.clear()
    db.payments.clear()
    idCounter = 1
  })

  test('happy path: create intent then confirm booking', async () => {
    const klass = seedClass()
    const createRes = await createIntent(jsonRequest('http://localhost/api/payments/create-intent', { classId: klass.id, amount: klass.price, currency: 'usd' }))
    expect(createRes.status).toBe(200)
    const createJson = await createRes.json()
    expect(createJson.success).toBe(true)
    expect(createJson.clientSecret).toBeTruthy()

    // Simulate Stripe marking payment succeeded
  stripeMock.__setPaymentIntentStatus(createJson.paymentIntentId, 'succeeded')

    const confirmRes = await confirmBooking(jsonRequest('http://localhost/api/bookings/confirm', { paymentIntentId: createJson.paymentIntentId, classId: klass.id }))
    const confirmJson = await confirmRes.json()
    expect(confirmJson.success).toBe(true)
    expect(confirmJson.booking.class.id).toBe(klass.id)
  })

  test('duplicate booking prevented', async () => {
    const klass = seedClass()
    const createRes1 = await createIntent(jsonRequest('http://localhost/api/payments/create-intent', { classId: klass.id, amount: klass.price, currency: 'usd' }))
    const json1 = await createRes1.json()
  stripeMock.__setPaymentIntentStatus(json1.paymentIntentId, 'succeeded')
    await confirmBooking(jsonRequest('http://localhost/api/bookings/confirm', { paymentIntentId: json1.paymentIntentId, classId: klass.id }))

    // Attempt second payment intent for same user/class
    const createRes2 = await createIntent(jsonRequest('http://localhost/api/payments/create-intent', { classId: klass.id, amount: klass.price, currency: 'usd' }))
    expect(createRes2.status).toBe(400)
    const json2 = await createRes2.json()
    expect(json2.message).toMatch(/already booked/i)
  })

  test('capacity full rejection', async () => {
    const klass = seedClass({ capacity: 1 })
    // First booking consumes capacity
    const res1 = await createIntent(jsonRequest('http://localhost/api/payments/create-intent', { classId: klass.id, amount: klass.price, currency: 'usd' }))
    const json1 = await res1.json()
  stripeMock.__setPaymentIntentStatus(json1.paymentIntentId, 'succeeded')
    await confirmBooking(jsonRequest('http://localhost/api/bookings/confirm', { paymentIntentId: json1.paymentIntentId, classId: klass.id }))

    // Second user simulated by changing mocked session user id
  const { getServerSession } = jest.requireMock('next-auth') as { getServerSession: jest.Mock }
  getServerSession.mockResolvedValueOnce({ user: { id: 'user_2', email: 'u2@example.com', name: 'User Two' } })
    const res2 = await createIntent(jsonRequest('http://localhost/api/payments/create-intent', { classId: klass.id, amount: klass.price, currency: 'usd' }))
    expect(res2.status).toBe(400)
    const json2 = await res2.json()
    expect(json2.message).toMatch(/fully booked/i)
  })

  test('amount mismatch rejected', async () => {
    const klass = seedClass({ price: 3000 })
    const res = await createIntent(jsonRequest('http://localhost/api/payments/create-intent', { classId: klass.id, amount: 9999, currency: 'usd' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toMatch(/invalid payment amount/i)
  })

  test('confirm fails when payment not succeeded', async () => {
    const klass = seedClass()
    const res = await createIntent(jsonRequest('http://localhost/api/payments/create-intent', { classId: klass.id, amount: klass.price, currency: 'usd' }))
    const json = await res.json()
    // Intentionally DO NOT set status to succeeded
    const confirmRes = await confirmBooking(jsonRequest('http://localhost/api/bookings/confirm', { paymentIntentId: json.paymentIntentId, classId: klass.id }))
    expect(confirmRes.status).toBe(400)
    const confirmJson = await confirmRes.json()
    expect(confirmJson.code).toBe('payment_not_succeeded')
  })

  test('race condition: two parallel confirmations -> one booking', async () => {
    const klass = seedClass({ capacity: 1 })
    const createRes = await createIntent(jsonRequest('http://localhost/api/payments/create-intent', { classId: klass.id, amount: klass.price, currency: 'usd' }))
    const createJson = await createRes.json()
  stripeMock.__setPaymentIntentStatus(createJson.paymentIntentId, 'succeeded')

    // Simulate two confirmations (same user) – second should return existing booking idempotently
    const [c1, c2] = await Promise.all([
      confirmBooking(jsonRequest('http://localhost/api/bookings/confirm', { paymentIntentId: createJson.paymentIntentId, classId: klass.id })),
      confirmBooking(jsonRequest('http://localhost/api/bookings/confirm', { paymentIntentId: createJson.paymentIntentId, classId: klass.id })),
    ])
    const j1 = await c1.json()
    const j2 = await c2.json()
    expect(j1.success).toBe(true)
    expect(j2.success).toBe(true)
    expect(j1.booking.id).toBe(j2.booking.id) // idempotent outcome
  })
})
