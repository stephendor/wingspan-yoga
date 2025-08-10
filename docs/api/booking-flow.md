# Booking & Payment Flow


### Overview
The booking system implements a two-phase commit pattern using Stripe Payment Intents followed by a transactional booking confirmation. This ensures:
# Booking & Payment Flow

> Architecture and invariants for the class booking & Stripe payment process.

## Overview & Goals

The booking system implements a two-phase commit pattern using Stripe Payment Intents followed by a transactional booking confirmation. This ensures:

- Capacity is never exceeded
- Duplicate bookings (double submission / retries) are idempotently short‑circuited
- Payment metadata integrity (class + user) is enforced
- Payment failure or mismatch never produces a booking

## Sequence

1. Client calls `POST /api/payments/create-intent` with `{ classId, amount, currency }`.
2. Server validates: class existence, status=SCHEDULED, capacity remaining, no existing booking for user, amount matches class price.
3. Stripe PaymentIntent is created with metadata: `classId, className, userId, userEmail, instructorName, startTime, idempotencyKey`.
4. Pending Payment row persisted (`PENDING`). Response returns `clientSecret` + `paymentIntentId` and an `x-idempotency-key` header.
5. Client confirms card via Stripe Elements (3DS if required) → PaymentIntent transitions to `succeeded`.
6. Client calls `POST /api/bookings/confirm` with `{ paymentIntentId, classId }`.
7. Server verifies PaymentIntent status === `succeeded` and metadata alignment (classId + userId).
8. Idempotency pre-check: existing booking (unique userId/classId) returns success immediately.
9. Transaction: re-fetch class with confirmed bookings count → if capacity available create booking + set Payment `SUCCEEDED`, else abort with `capacity_full`.
10. Fire-and-forget email confirmation (stub) executes.

## Data Invariants

| Invariant | Enforcement |
|-----------|-------------|
| A user may have at most one CONFIRMED booking per class | DB unique constraint (`userId_classId`) + pre/txn checks |
| Confirmed bookings count <= class.capacity | Transactional count check before insert |
| Payment amount equals class.price | Validated at intent creation |
| Payment metadata must match booking context | Checked during confirmation |
| Failed or mismatched payment never results in booking | Early return + Payment marked FAILED |

## Idempotency Strategy

Layered approach:

1. Client receives `x-idempotency-key` (currently informational; future: could persist for replay defense).
2. Pre-confirm short-circuit if booking already exists.
3. Unique constraint on `(userId,classId)` inside transactional path prevents duplicates under race.
4. Second confirmation attempt after success returns the originally created booking.

## Error Codes & Meanings

| Code | HTTP | Meaning | User Message (mapped) |
|------|------|---------|-----------------------|
| unauthorized | 401 | Session missing | Please sign in to continue |
| class_not_found | 404 | Class id invalid | Class not found |
| capacity_full | 400 | Capacity exhausted | Class is fully booked |
| duplicate_booking | 400 | Existing booking found (pre-check) | You've already booked this class |
| payment_not_succeeded | 400 | PaymentIntent not succeeded | Payment not completed yet |
| payment_metadata_mismatch | 400 | Metadata tampering / wrong class | Payment verification failed |
| booking_confirm_failed | 500 | Unhandled server error | Something went wrong confirming your booking |

## Testing Matrix

Implemented in `tests/booking/booking-flow.test.ts`:

| Scenario | Expectation |
|----------|-------------|
| Happy path | Intent + confirm → CONFIRMED booking |
| Duplicate booking | Second intent rejected (400) |
| Capacity full | Second user creation rejected |
| Amount mismatch | Intent rejected (400) |
| Payment not succeeded | Confirmation rejected with `payment_not_succeeded` |
| Parallel confirmations | Both succeed; identical booking id (idempotent) |

## Follow-ups

1. Replace temporary `types/stripe-react.d.ts` shim once official React 19 compatible `@stripe/react-stripe-js` types land; remove any vestigial casts.
2. Persist and enforce idempotency key server-side (store + replay detection) for stronger duplicate network retry resilience.
3. Add email provider (Resend/SendGrid) implementation + failure queue.
4. Extend logs to structured logger (pino) with correlation IDs.

## Extension Points

- Subscriptions: unify payment intent creation via abstraction returning strategy (one-time vs subscription).
- Cancellations / Waitlist: add transactional capacity release + waitlist promotion.
- Refunds: store charge ID and expose refund endpoint gated by policy.
