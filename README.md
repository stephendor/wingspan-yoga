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

## Contributing

Please read our contributing guidelines and code of conduct before submitting pull requests.

## License

This project is private and proprietary.
