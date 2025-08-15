import { NextResponse } from 'next/server'
import { stripe, verifyWebhookSignature } from '../../../../lib/stripe'
import { prisma } from '../../../../lib/prisma'
import type Stripe from 'stripe'
import { getPlanByPriceId } from '../../../../lib/stripe/plans'
import { $Enums } from '@prisma/client'

export const runtime = 'nodejs'

function mapStripeStatus(status: Stripe.Subscription.Status): $Enums.MembershipStatus {
  switch (status) {
    case 'trialing':
      return $Enums.MembershipStatus.TRIALING
    case 'active':
      return $Enums.MembershipStatus.ACTIVE
    case 'past_due':
      return $Enums.MembershipStatus.PAST_DUE
    case 'canceled':
      return $Enums.MembershipStatus.CANCELLED
    case 'incomplete':
      return $Enums.MembershipStatus.INCOMPLETE
    case 'incomplete_expired':
      return $Enums.MembershipStatus.INCOMPLETE_EXPIRED
    case 'unpaid':
      return $Enums.MembershipStatus.UNPAID
    default:
      return $Enums.MembershipStatus.ACTIVE
  }
}

async function recordEventOnce(event: Stripe.Event): Promise<boolean> {
  try {
    await prisma.webhookEvent.create({ data: { id: event.id, type: event.type } })
    return true
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string }
    // Unique constraint => duplicate
    if (err?.code === 'P2002') return false
    // Table missing (migration not yet applied) – skip idempotency but log once
    if (err?.code === 'P2021' || /webhook_events/i.test(err?.message || '')) {
      console.warn('[stripe:webhook] idempotency table missing, skipping until migration applied')
      return true // treat as fresh so we still process
    }
    throw err
  }
}

type StructuredLog = {
  eventId: string
  eventType: string
  subscriptionId?: string
  userId?: string
  phase: string
  message: string
  extra?: Record<string, unknown>
}

function logEvent(payload: StructuredLog) {
  const { message, ...rest } = payload
  // Using console.log intentionally for operational visibility
  console.log('[stripe:webhook]', message, JSON.stringify(rest))
}

async function upsertUserSubscription(params: { subscription: Stripe.Subscription; userId: string }) {
  const { subscription, userId } = params
  const stripeSubId = subscription.id
  const price = subscription.items.data[0]?.price
  const priceId = price?.id
  const status = mapStripeStatus(subscription.status)

  let planRecord = null
  if (priceId) {
    planRecord = await prisma.subscriptionPlan.findUnique({ where: { stripePriceId: priceId } })
  }

  if (!planRecord && priceId) {
    const def = getPlanByPriceId(priceId)
    if (def) {
      planRecord = await prisma.subscriptionPlan.upsert({
        where: { stripePriceId: priceId },
        update: { updatedAt: new Date() },
        create: {
          stripePriceId: def.stripePriceId,
          interval: def.interval,
          amount: def.amount,
          currency: def.currency,
          name: def.name,
          description: def.description,
          active: def.active,
        },
      })
    }
  }

  if (!planRecord) {
    throw new Error(`Subscription plan not found for price ${priceId}`)
  }

  const subUnknown = subscription as unknown as Record<string, unknown>
  const startEpoch = (typeof subUnknown.current_period_start === 'number' ? subUnknown.current_period_start : Math.floor(Date.now() / 1000)) as number
  const endEpoch = (typeof subUnknown.current_period_end === 'number' ? subUnknown.current_period_end : Math.floor(Date.now() / 1000)) as number
  const periodStart = new Date(startEpoch * 1000)
  const periodEnd = new Date(endEpoch * 1000)

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new Error(`User ${userId} missing for subscription mapping`)
  }

  await prisma.userSubscription.updateMany({
    where: {
      user: { id: userId },
      stripeSubscriptionId: { not: stripeSubId },
      status: { in: [$Enums.MembershipStatus.ACTIVE, $Enums.MembershipStatus.TRIALING, $Enums.MembershipStatus.PAST_DUE] },
    },
    data: { status: $Enums.MembershipStatus.CANCELLED },
  })

  const before = await prisma.userSubscription.findUnique({ where: { stripeSubscriptionId: stripeSubId } })
  const sub = await prisma.userSubscription.upsert({
    where: { stripeSubscriptionId: stripeSubId },
    update: {
      planId: planRecord.id,
      status,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
  rawStripeData: JSON.parse(JSON.stringify(subscription)),
    },
    create: {
      stripeSubscriptionId: stripeSubId,
      stripeCustomerId: subscription.customer as string,
      planId: planRecord.id,
      status,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
  rawStripeData: JSON.parse(JSON.stringify(subscription)),
      user: { connect: { id: userId } },
    },
  })

  const activeLike: $Enums.MembershipStatus[] = [
    $Enums.MembershipStatus.ACTIVE,
    $Enums.MembershipStatus.TRIALING,
    $Enums.MembershipStatus.PAST_DUE,
  ]
  if (activeLike.includes(status)) {
    // Derive membershipType from plan name if possible (Basic/Premium/Unlimited) else fallback to interval heuristic
    let derivedType: $Enums.MembershipType = $Enums.MembershipType.BASIC
    const upperName = planRecord.name.toUpperCase()
    if (upperName.includes('UNLIMITED')) derivedType = $Enums.MembershipType.UNLIMITED
    else if (upperName.includes('PREMIUM')) derivedType = $Enums.MembershipType.PREMIUM
    else if (upperName.includes('BASIC')) derivedType = $Enums.MembershipType.BASIC
    else if (planRecord.interval === 'YEARLY') derivedType = $Enums.MembershipType.PREMIUM

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionId: sub.id,
        membershipStatus: status,
        membershipType: derivedType,
      },
    })
  }

  logEvent({
    eventId: 'n/a',
    eventType: 'subscription.upsert',
    subscriptionId: stripeSubId,
    userId,
    phase: 'write',
    message: 'Upserted user subscription',
    extra: { statusBefore: before?.status, statusAfter: status, planId: planRecord.id },
  })
}

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })
  }
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let rawBody: string
  try {
    rawBody = await req.text()
  } catch {
    return NextResponse.json({ error: 'Unable to read body' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = verifyWebhookSignature(rawBody, signature, webhookSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'signature verification failed'
    return NextResponse.json({ error: `Invalid signature: ${message}` }, { status: 400 })
  }

  try {
    const fresh = await recordEventOnce(event)
    if (!fresh) {
      logEvent({ eventId: event.id, eventType: event.type, phase: 'idempotency', message: 'Duplicate event skipped' })
      return NextResponse.json({ received: true, duplicate: true })
    }
  } catch (e) {
    console.error('[stripe:webhook] idempotency record error', e)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription' && session.subscription && session.metadata?.userId) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          await upsertUserSubscription({ subscription, userId: session.metadata.userId })
          logEvent({
            eventId: event.id,
            eventType: event.type,
            subscriptionId: subscription.id,
            userId: session.metadata.userId,
            phase: 'handled',
            message: 'Processed checkout.session.completed',
          })
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription
        let userId = subscription.metadata?.userId
        if (!userId) {
          try {
            const customer = await stripe.customers.retrieve(subscription.customer as string)
            if (customer && !('deleted' in customer)) {
              const meta = (customer as Stripe.Customer).metadata
              userId = meta?.userId
            }
          } catch (e) {
            console.warn('Unable to load customer for userId metadata', e)
          }
        }
        if (userId) {
          await upsertUserSubscription({ subscription, userId })
          logEvent({
            eventId: event.id,
            eventType: event.type,
            subscriptionId: subscription.id,
            userId,
            phase: 'handled',
            message: 'Processed subscription lifecycle event',
          })
        } else {
          console.warn('Subscription event missing userId metadata', subscription.id)
        }
        break
      }
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed': {
  const invoice = event.data.object as Stripe.Invoice
  const invUnknown = invoice as unknown as Record<string, unknown>
  const subscriptionId = (typeof invUnknown.subscription === 'string' ? invUnknown.subscription : undefined)
        let subscription: Stripe.Subscription | undefined
        if (subscriptionId) {
          try {
            subscription = await stripe.subscriptions.retrieve(subscriptionId)
          } catch (err) {
            console.warn('[stripe:webhook] unable to retrieve subscription for invoice', subscriptionId, err)
          }
        }
        let userId: string | undefined
        if (subscription?.metadata?.userId) userId = subscription.metadata.userId
        if (!userId && invoice.customer) {
          try {
            const customer = await stripe.customers.retrieve(invoice.customer as string)
            if (customer && !('deleted' in customer)) {
              userId = (customer as Stripe.Customer).metadata?.userId
            }
          } catch (err) {
            console.warn('[stripe:webhook] unable to load customer for invoice', err)
          }
        }

        // Keep subscription record & user membership status in sync with latest Stripe data
        if (subscription && userId) {
          try {
            await upsertUserSubscription({ subscription, userId })
          } catch (err) {
            console.warn('[stripe:webhook] subscription upsert failed during invoice handling', subscription?.id, err)
          }
        }

        // Look up userSubscription (if already persisted) for relational link on Payment
        let userSubscriptionRecordId: string | undefined
        if (subscriptionId) {
          try {
            const existing = await prisma.userSubscription.findUnique({ where: { stripeSubscriptionId: subscriptionId } })
            if (existing) userSubscriptionRecordId = existing.id
          } catch (err) {
            console.warn('[stripe:webhook] lookup userSubscription failed', subscriptionId, err)
          }
        }

        // Optionally create/update Payment record for recurring charge
        if (invoice.id && invoice.amount_paid != null && invoice.currency && userId) {
          try {
            await prisma.payment.upsert({
              where: { stripePaymentId: invoice.id },
              update: {
                amount: invoice.amount_paid,
                currency: invoice.currency,
                status: event.type === 'invoice.payment_succeeded' ? $Enums.PaymentStatus.SUCCEEDED : $Enums.PaymentStatus.FAILED,
                description: invoice.lines?.data[0]?.description || invoice.description || undefined,
                userSubscriptionId: userSubscriptionRecordId,
              },
              create: {
                stripePaymentId: invoice.id,
                amount: invoice.amount_paid,
                currency: invoice.currency,
                status: event.type === 'invoice.payment_succeeded' ? $Enums.PaymentStatus.SUCCEEDED : $Enums.PaymentStatus.FAILED,
                description: invoice.lines?.data[0]?.description || invoice.description || undefined,
                userId,
                userSubscriptionId: userSubscriptionRecordId,
              },
            })
          } catch (err) {
            console.warn('[stripe:webhook] payment upsert failed for invoice', invoice.id, err)
          }
        }
        logEvent({
          eventId: event.id,
          eventType: event.type,
          subscriptionId: subscriptionId,
          userId,
          phase: 'handled',
          message: 'Processed invoice payment event',
          extra: { invoiceId: invoice.id, paid: (typeof invUnknown.paid === 'boolean' ? invUnknown.paid : undefined) },
        })
        break
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const metadata = paymentIntent.metadata
        
        // Handle retreat payments
        if (metadata?.type === 'retreat_deposit' || metadata?.type === 'retreat_balance') {
          const { retreatBookingId, userId } = metadata
          
          if (retreatBookingId && userId) {
            try {
              await prisma.$transaction(async (tx) => {
                // Get the retreat booking
                const booking = await tx.retreatBooking.findUnique({
                  where: { id: retreatBookingId },
                  include: { retreat: true },
                })
                
                if (!booking) {
                  throw new Error(`Retreat booking ${retreatBookingId} not found`)
                }
                
                // Update payment record
                await tx.payment.updateMany({
                  where: {
                    stripePaymentId: paymentIntent.id,
                    retreatBookingId,
                  },
                  data: {
                    status: $Enums.PaymentStatus.SUCCEEDED,
                  },
                })
                
                // Update booking based on payment type
                if (metadata.type === 'retreat_deposit') {
                  await tx.retreatBooking.update({
                    where: { id: retreatBookingId },
                    data: {
                      paymentStatus: 'DEPOSIT_PAID',
                      amountPaid: booking.retreat.depositPrice,
                      depositPaidAt: new Date(),
                    },
                  })
                } else if (metadata.type === 'retreat_balance') {
                  await tx.retreatBooking.update({
                    where: { id: retreatBookingId },
                    data: {
                      paymentStatus: 'PAID_IN_FULL',
                      amountPaid: booking.totalPrice,
                      finalPaidAt: new Date(),
                    },
                  })
                }
              })
              
              // TODO: Send confirmation email based on payment type
              
              logEvent({
                eventId: event.id,
                eventType: event.type,
                userId,
                phase: 'handled',
                message: `Processed retreat ${metadata.type} payment`,
                extra: { retreatBookingId, paymentIntentId: paymentIntent.id },
              })
            } catch (err) {
              console.error('Error processing retreat payment webhook:', err)
            }
          }
        }
        break
      }
      default:
        break
    }
  } catch (err) {
    console.error('Error processing Stripe webhook', event.type, err)
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
