# Wingspan Yoga Subscription System Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Data Models](#data-models)
3. [API Endpoints](#api-endpoints)
4. [Webhook Event Processing](#webhook-event-processing)
5. [Status Mappings](#status-mappings)
6. [Sequence Diagrams](#sequence-diagrams)
7. [Test Strategy](#test-strategy)
8. [Failure Modes & Recovery](#failure-modes--recovery)
9. [Operational Runbook](#operational-runbook)
10. [Extension Points](#extension-points)

## Architecture Overview

The Wingspan Yoga subscription system is built on top of Stripe for payment processing and subscription management. It provides a complete subscription lifecycle management system including:

- **Plan Management**: Multiple subscription tiers (Basic, Premium, Unlimited)
- **Checkout Flow**: Stripe Checkout integration for seamless payments
- **Webhook Processing**: Real-time subscription status updates
- **Billing Portal**: Self-service subscription management
- **Membership Gating**: Content access control based on subscription status
- **Idempotency**: Duplicate webhook event protection

### Key Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  • Membership Plans UI     • Billing Management            │
│  • Checkout Flow          • Success/Cancel Pages           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 API Routes (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  • /api/subscriptions/create   • /api/subscriptions/portal │
│  • /api/webhooks/stripe        • Authentication Middleware │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Business Logic Layer                       │
├─────────────────────────────────────────────────────────────┤
│  • Subscription Management    • Plan Validation            │
│  • Status Mapping            • Membership Gating           │
│  • Event Processing           • Error Handling             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Data Layer (Prisma)                        │
├─────────────────────────────────────────────────────────────┤
│  • User Management           • Subscription Records        │
│  • Payment History           • Webhook Events              │
│  • Plan Definitions          • Audit Logs                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 External Services                          │
├─────────────────────────────────────────────────────────────┤
│  • Stripe API               • Stripe Webhooks              │
│  • Stripe Checkout          • Stripe Billing Portal       │
└─────────────────────────────────────────────────────────────┘
```

## Data Models

### Core Database Tables

#### UserSubscription
Primary subscription record linking users to their Stripe subscriptions.

```sql
CREATE TABLE UserSubscription (
  id                    String        @id @default(cuid())
  stripeSubscriptionId  String        @unique
  stripeCustomerId      String
  userId               String
  planId               String
  status               MembershipStatus
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  cancelAtPeriodEnd    Boolean       @default(false)
  rawStripeData        Json          @default("{}")
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt
)
```

#### SubscriptionPlan
Plan definitions synchronized with Stripe prices.

```sql
CREATE TABLE SubscriptionPlan (
  id            String   @id @default(cuid())
  stripePriceId String   @unique
  interval      String   -- "MONTHLY" | "YEARLY"
  amount        Int      -- Amount in cents
  currency      String   @default("usd")
  name          String
  description   String?
  active        Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
)
```

#### Payment
Payment transaction records for audit and reporting.

```sql
CREATE TABLE Payment (
  id                   String         @id @default(cuid())
  stripePaymentId      String         @unique
  userId              String
  userSubscriptionId   String?
  amount              Int
  currency            String
  status              PaymentStatus
  description         String?
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt
)
```

#### WebhookEvent
Idempotency tracking for webhook events.

```sql
CREATE TABLE WebhookEvent (
  id   String @id -- Stripe event ID
  type String     -- Event type for debugging
)
```

### Enums

```typescript
enum MembershipStatus {
  ACTIVE
  CANCELLED
  INCOMPLETE
  INCOMPLETE_EXPIRED
  PAST_DUE
  TRIALING
  UNPAID
}

enum MembershipType {
  BASIC
  PREMIUM
  UNLIMITED
}

enum PaymentStatus {
  SUCCEEDED
  FAILED
  PENDING
  CANCELLED
  REFUNDED
}
```

## API Endpoints

### POST /api/subscriptions/create
Creates a Stripe Checkout session for subscription signup.

**Request:**
```json
{
  "planKey": "premium_monthly"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

**Error Responses:**
- `401`: Authentication required
- `400`: Invalid plan or request data
- `404`: User not found
- `500`: Server configuration or Stripe error

### POST /api/subscriptions/portal
Creates a Stripe Billing Portal session for subscription management.

**Request:**
```json
{
  "returnUrl": "/membership"
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/p/session/bps_..."
}
```

**Error Responses:**
- `401`: Authentication required
- `404`: User or subscription not found
- `500`: Server or Stripe error

### POST /api/webhooks/stripe
Processes Stripe webhook events for subscription lifecycle management.

**Supported Events:**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.trial_will_end`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Webhook Event Processing

### Event Flow

```
Stripe Event → Signature Verification → Idempotency Check → Event Processing → Database Update
```

### Processing Logic

1. **Signature Verification**: Validates webhook authenticity using `STRIPE_WEBHOOK_SECRET`
2. **Idempotency Check**: Records event ID to prevent duplicate processing
3. **Event Processing**: Routes to specific handler based on event type
4. **Database Update**: Updates subscription and user records
5. **Error Handling**: Logs failures and returns appropriate HTTP status

### Key Functions

#### `recordEventOnce(event: Stripe.Event): Promise<boolean>`
Implements idempotency by recording processed event IDs.

```typescript
try {
  await prisma.webhookEvent.create({ 
    data: { id: event.id, type: event.type } 
  })
  return true // First time processing
} catch (e) {
  if (e?.code === 'P2002') return false // Duplicate
  throw e // Other errors
}
```

#### `mapStripeStatus(status: Stripe.Subscription.Status): MembershipStatus`
Maps Stripe subscription statuses to internal enum values.

#### `upsertUserSubscription(params: { subscription: Stripe.Subscription; userId: string })`
Updates or creates user subscription record with latest Stripe data.

## Status Mappings

### Stripe to Internal Status Mapping

| Stripe Status | Internal Status | Description | Access Allowed |
|---------------|-----------------|-------------|----------------|
| `active` | `ACTIVE` | Subscription is current and paid | ✅ Yes |
| `trialing` | `TRIALING` | In trial period | ✅ Yes |
| `past_due` | `PAST_DUE` | Payment failed, retrying | ❌ No |
| `canceled` | `CANCELLED` | Subscription terminated | ❌ No |
| `incomplete` | `INCOMPLETE` | Initial payment failed | ❌ No |
| `incomplete_expired` | `INCOMPLETE_EXPIRED` | Initial payment expired | ❌ No |
| `unpaid` | `UNPAID` | Payment failed after retries | ❌ No |

### Membership Types and Access Levels

| Type | Access Level | Features |
|------|-------------|----------|
| `BASIC` | 1 | Limited class access, basic features |
| `PREMIUM` | 2 | Full class access, premium features |
| `UNLIMITED` | 3 | All access, unlimited features |

**Access Logic:** Users can access content at their tier level and below.

## Sequence Diagrams

### Subscription Creation Flow

```
User          Frontend       API            Stripe         Webhook
 │                │           │              │              │
 │── Select Plan ─►           │              │              │
 │                │── POST ──►│              │              │
 │                │   create  │              │              │
 │                │           │── Create ───►│              │
 │                │           │   Checkout   │              │
 │                │           │◄── Session ──│              │
 │                │◄── URL ───│              │              │
 │                │           │              │              │
 │── Redirect ────►───────────►──────────────►              │
 │                │           │              │              │
 │◄── Payment ────────────────────────────────              │
 │                │           │              │              │
 │                │           │              │── Event ────►│
 │                │           │              │   (session   │
 │                │           │              │   completed) │
 │                │           │◄─────────────┼── Process ──│
 │                │           │              │   Event     │
 │                │           │              │              │
 │◄── Success ────│           │              │              │
```

### Billing Portal Access Flow

```
User          Frontend       API            Stripe
 │                │           │              │
 │── Manage ─────►│           │              │
 │   Billing      │           │              │
 │                │── POST ──►│              │
 │                │   portal  │              │
 │                │           │── Create ───►│
 │                │           │   Portal     │
 │                │           │◄── URL ─────│
 │                │◄── URL ───│              │
 │                │           │              │
 │── Redirect ────►───────────►──────────────►
 │                │           │              │
 │◄── Manage ─────────────────────────────────
 │   Subscription │           │              │
```

### Webhook Processing Flow

```
Stripe        Webhook API    Database      User Record
  │              │             │              │
  │── Event ────►│             │              │
  │              │── Verify ──►│              │
  │              │   Signature │              │
  │              │             │              │
  │              │── Check ───►│              │
  │              │   Duplicate │              │
  │              │◄── Fresh ───│              │
  │              │             │              │
  │              │── Process ─►│              │
  │              │   Event     │              │
  │              │             │── Update ───►│
  │              │             │   Status     │
  │              │◄── Success ─│              │
  │◄── 200 ─────│             │              │
```

## Test Strategy

### Test Categories

1. **Unit Tests**
   - Plan validation and lookup functions
   - Status mapping logic
   - Subscription utility functions
   - Business logic components

2. **Integration Tests**
   - API endpoint behavior
   - Database operations
   - Webhook event processing
   - Authentication flows

3. **End-to-End Tests**
   - Complete subscription flows
   - Payment processing
   - User experience paths
   - Error scenarios

### Key Test Files

- `tests/subscription/plan-validation.test.ts` - Plan definition validation
- `tests/subscription/checkout-creation.test.ts` - Checkout API tests
- `tests/subscription/billing-portal.test.ts` - Billing portal API tests
- `tests/subscription/membership-gating.test.ts` - Access control tests
- `tests/subscription/webhook-event-processing.test.ts` - Webhook processing
- `tests/subscription/webhookIdempotency.test.ts` - Idempotency validation

### Mock Strategy

- **Stripe SDK**: Mock all Stripe API calls for predictable testing
- **Database**: Mock Prisma operations for unit tests
- **Authentication**: Mock NextAuth sessions
- **External Services**: Mock all third-party dependencies

## Failure Modes & Recovery

### Common Failure Scenarios

#### 1. Webhook Delivery Failures
**Symptoms**: Subscription status out of sync with Stripe
**Detection**: Monitor webhook endpoint error rates
**Recovery**:
```bash
# Manual sync from Stripe
npm run subscription:sync --user-id=<user_id>
```

#### 2. Payment Failures
**Symptoms**: User reports billing issues, `PAST_DUE` status
**Detection**: Stripe dashboard alerts, webhook events
**Recovery**: 
- Automatic retries by Stripe
- Manual payment method update via billing portal
- Customer service intervention if needed

#### 3. Database Constraints
**Symptoms**: Webhook processing errors, constraint violations
**Detection**: Application logs, error monitoring
**Recovery**:
```sql
-- Check for orphaned records
SELECT * FROM UserSubscription 
WHERE userId NOT IN (SELECT id FROM User);

-- Clean up if necessary
DELETE FROM UserSubscription WHERE userId = '<orphaned_user_id>';
```

#### 4. Stripe API Outages
**Symptoms**: Cannot create checkout sessions or access billing portal
**Detection**: Stripe status page, API error rates
**Recovery**:
- Implement exponential backoff retries
- Display maintenance message to users
- Queue operations for later processing

### Recovery Procedures

#### Subscription Status Repair
```typescript
async function repairSubscriptionStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscriptions: true }
  })
  
  if (!user) throw new Error('User not found')
  
  const activeSubscription = user.subscriptions.find(s => 
    ['ACTIVE', 'TRIALING', 'PAST_DUE'].includes(s.status)
  )
  
  if (activeSubscription) {
    // Fetch latest from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      activeSubscription.stripeSubscriptionId
    )
    
    // Update with current Stripe data
    await upsertUserSubscription({
      subscription: stripeSubscription,
      userId
    })
  }
}
```

## Operational Runbook

### Daily Operations

#### 1. Monitor Webhook Health
```bash
# Check webhook endpoint status
curl -f https://yourdomain.com/api/webhooks/stripe/health || echo "Webhook endpoint down"

# Check recent webhook events
tail -f /var/log/application.log | grep "stripe:webhook"
```

#### 2. Review Payment Failures
```sql
-- Check for recent payment failures
SELECT u.email, p.amount, p.createdAt, p.description
FROM Payment p
JOIN User u ON u.id = p.userId
WHERE p.status = 'FAILED' 
  AND p.createdAt > NOW() - INTERVAL 24 HOUR
ORDER BY p.createdAt DESC;
```

#### 3. Subscription Status Audit
```sql
-- Check for status discrepancies
SELECT 
  us.stripeSubscriptionId,
  us.status as internal_status,
  u.email,
  us.updatedAt
FROM UserSubscription us
JOIN User u ON u.id = us.userId
WHERE us.status IN ('PAST_DUE', 'INCOMPLETE', 'UNPAID')
  AND us.updatedAt > NOW() - INTERVAL 1 DAY;
```

### Weekly Operations

#### 1. Key Rotation
```bash
# Rotate Stripe webhook secret
# 1. Generate new secret in Stripe dashboard
# 2. Update environment variable
export STRIPE_WEBHOOK_SECRET="whsec_new_secret"

# 3. Restart application
pm2 restart wingspan-yoga

# 4. Verify webhook processing
curl -X POST https://yourdomain.com/api/webhooks/stripe \
  -H "Stripe-Signature: test" \
  -d '{"id":"test","type":"test"}'
```

#### 2. Plan Synchronization
```bash
# Sync plan definitions with Stripe
npm run plans:sync

# Verify plan prices
npm run plans:verify
```

### Monthly Operations

#### 1. Subscription Analytics
```sql
-- Monthly subscription metrics
SELECT 
  DATE_TRUNC('month', createdAt) as month,
  status,
  COUNT(*) as subscriptions,
  SUM(sp.amount) as revenue_cents
FROM UserSubscription us
JOIN SubscriptionPlan sp ON sp.id = us.planId
WHERE createdAt > NOW() - INTERVAL 3 MONTH
GROUP BY month, status
ORDER BY month DESC, status;
```

#### 2. Failed Payment Analysis
```sql
-- Analyze payment failure patterns
SELECT 
  DATE_TRUNC('week', createdAt) as week,
  COUNT(*) as failed_payments,
  AVG(amount) as avg_amount,
  COUNT(DISTINCT userId) as unique_users
FROM Payment 
WHERE status = 'FAILED' 
  AND createdAt > NOW() - INTERVAL 1 MONTH
GROUP BY week
ORDER BY week DESC;
```

### Emergency Procedures

#### 1. Disable Webhook Processing
```bash
# Temporarily disable webhook processing during maintenance
export STRIPE_WEBHOOK_DISABLED=true
pm2 restart wingspan-yoga
```

#### 2. Manual Subscription Creation
```typescript
// Emergency subscription creation bypass
async function emergencySubscriptionCreation(userId: string, planKey: string) {
  const plan = getPlanByKey(planKey)
  if (!plan) throw new Error('Plan not found')
  
  const subscription = await stripe.subscriptions.create({
    customer: user.stripeCustomerId,
    items: [{ price: plan.stripePriceId }],
    metadata: { userId, emergency: 'true' }
  })
  
  await upsertUserSubscription({ subscription, userId })
}
```

### Monitoring & Alerts

#### Key Metrics to Monitor
- Webhook processing success rate (>99%)
- Payment success rate (>95%)
- API endpoint response times (<500ms)
- Database query performance
- Stripe API error rates

#### Alert Thresholds
- **Critical**: Webhook endpoint down for >5 minutes
- **High**: Payment failure rate >10% over 1 hour
- **Medium**: API response time >1 second
- **Low**: Unusual subscription cancellation patterns

## Extension Points

### 1. Multi-Currency Support
**Location**: `src/lib/stripe/plans.ts`
**Implementation**:
```typescript
interface CurrencyPlan extends Plan {
  currencies: {
    usd: number
    eur: number
    gbp: number
  }
}
```

### 2. Trial Period Customization
**Location**: `src/app/api/subscriptions/create/route.ts`
**Implementation**:
```typescript
// Add trial_period_days to checkout session
const session = await stripe.checkout.sessions.create({
  // ... existing parameters
  subscription_data: {
    trial_period_days: plan.trialDays || 0
  }
})
```

### 3. Usage-Based Billing
**Location**: `src/lib/stripe/usage.ts`
**Implementation**:
```typescript
async function recordUsage(subscriptionId: string, usage: number) {
  await stripe.subscriptionItems.createUsageRecord(
    subscriptionItem.id,
    {
      quantity: usage,
      timestamp: Math.floor(Date.now() / 1000)
    }
  )
}
```

### 4. Subscription Addons
**Location**: Database schema extension
**Implementation**:
```sql
CREATE TABLE SubscriptionAddon (
  id                    String @id @default(cuid())
  userSubscriptionId    String
  stripePriceId        String
  quantity             Int @default(1)
  active               Boolean @default(true)
  createdAt            DateTime @default(now())
)
```

### 5. Custom Webhook Events
**Location**: `src/app/api/webhooks/stripe/route.ts`
**Implementation**:
```typescript
// Add to webhook event switch statement
case 'custom.subscription.milestone':
  await handleSubscriptionMilestone(event.data.object)
  break
```

### 6. Advanced Pricing Rules
**Location**: `src/lib/pricing/rules.ts`
**Implementation**:
```typescript
interface PricingRule {
  id: string
  condition: (user: User, plan: Plan) => boolean
  discount: number | ((basePrice: number) => number)
  validUntil?: Date
}
```

---

## Conclusion

This subscription system provides a robust foundation for recurring billing with Stripe integration. The architecture is designed for scalability and maintainability, with comprehensive error handling, testing, and operational procedures.

For additional support or questions, refer to the codebase comments and test files for implementation details.