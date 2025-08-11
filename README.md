# Wingspan Yoga Website

A modern, subscription-based yoga website built with Next.js 14+, featuring video streaming, class bookings, and member management.

## Features

- 🧘‍♀️ Video library with streaming capabilities
- 📅 Class booking system
- 💳 Subscription management with Stripe
- 🔐 Secure user authentication
- 📱 Fully responsive design
- ♿ WCAG 2.1 AA accessibility compliant
- 🎨 Beautiful animations with Framer Motion

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js/Clerk
- **Payments**: Stripe
- **Video**: Vimeo/Mux integration
- **Deployment**: Vercel/Netlify

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```text
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── layout/         # Layout components
│   ├── forms/          # Form components
│   ├── video/          # Video-related components
│   ├── auth/           # Authentication components
│   ├── booking/        # Booking system components
│   └── subscription/   # Subscription components
├── lib/                # Utility libraries
│   ├── auth/           # Authentication utilities
│   ├── database/       # Database utilities
│   ├── stripe/         # Stripe integration
│   ├── video/          # Video streaming utilities
│   └── validation/     # Form validation schemas
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # General utilities
└── constants/          # Application constants
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run plans:verify` - Verify configured Stripe Price IDs exist & are active
- `npm run plans:sync` - Upsert plan definitions into the database

### Stripe Webhook Idempotency

Incoming Stripe events are processed via `app/api/webhooks/stripe/route.ts` with a two-layer idempotency strategy:

1. Application guard: `recordEventOnce(event.id)` attempts to insert a row in `WebhookEvent`.
2. Database constraint: Prisma model `WebhookEvent { id String @id ... }` enforces uniqueness. A duplicate triggers a Prisma `P2002` which is caught and treated as a no-op.

Testing:
`tests/webhooks/webhookIdempotency.test.ts` asserts the first event stores and the second (same ID) is ignored while only one DB row exists.

Rationale:
Stripe may retry events; this ensures side effects (e.g., subscription upsert) run exactly once per event ID even under concurrency.


### Subscription Plan Configuration

Define the following environment variables (one per environment) pointing to the Stripe Price IDs you created for recurring products:

```env
STRIPE_PRICE_BASIC_MONTHLY=price_...
STRIPE_PRICE_BASIC_YEARLY=price_...
STRIPE_PRICE_PREMIUM_MONTHLY=price_...
STRIPE_PRICE_PREMIUM_YEARLY=price_...
```

Validation:

1. Run `npm run plans:verify` after setting env vars to confirm the Price objects exist and are active.
2. Run `npm run plans:sync` to populate / update the `subscription_plans` table with internal plan metadata.

Notes:

- Amounts & intervals are source-of-truth in code; Stripe prices must match to avoid user confusion.
- Additional tiers can be added by editing `src/lib/stripe/plans.ts` and re-running the two scripts above.

## Contributing

Please read our contributing guidelines and code of conduct before submitting pull requests.

## License

This project is private and proprietary.
