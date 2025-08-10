# Database Schema Documentation

This document outlines the database schema for the Wingspan Yoga website, designed to support comprehensive yoga studio management including user authentication, class bookings, video library, payments, and content management.

## Overview

The database is built using **Prisma ORM** with **PostgreSQL** as the database provider. The schema supports:

- 🔐 **User Management & Authentication** (NextAuth.js compatible)
- 💳 **Subscription & Payment Processing** (Stripe integration)
- 🧘 **Instructor Management**
- 📹 **Video Library with Progress Tracking**
- 📅 **Class Scheduling & Booking System**
- ⭐ **Reviews & Ratings**
- 📝 **Content Management (Blog)**
- ⚙️ **Site Configuration**

## Core Models

### User Management

#### User
Primary user entity for authentication and profile management.

**Key Features:**
- Email/password authentication
- Membership tiers (FREE, BASIC, PREMIUM, UNLIMITED)
- Profile information and emergency contacts
- Subscription linking

#### Account, Session, VerificationToken
NextAuth.js compatible authentication models supporting:
- OAuth providers (Google, Facebook, etc.)
- Email verification
- Session management

### Subscription & Payments

#### Subscription
Manages recurring billing through Stripe integration.

**Features:**
- Stripe subscription tracking
- Multiple membership tiers
- Trial periods and cancellation management

#### Payment
Transaction records for both subscriptions and one-time purchases.

**Supports:**
- Class booking payments
- Subscription billing
- Refund tracking

### Content & Instruction

#### Instructor
Yoga instructor profiles and credentials.

**Includes:**
- Bio and specialties
- Years of experience and certifications
- Social media links
- Active status management

#### Video
On-demand yoga video library.

**Features:**
- Multiple difficulty levels and categories
- Progress tracking per user
- Membership access control
- Streaming service integration (Mux/Vimeo)

#### VideoProgress
Tracks individual user progress through videos.

**Tracks:**
- Completion percentage
- Last watched timestamp
- Completion status

### Class Management

#### Class
Live and scheduled yoga classes.

**Supports:**
- Studio and online classes
- Capacity management
- Pricing and difficulty levels
- Meeting URLs for virtual classes

#### Booking
User reservations for classes.

**Features:**
- Booking status tracking
- Cancellation management
- Waitlist support
- Special notes/requests

### Reviews & Content

#### Review
User feedback for videos and classes.

**Includes:**
- 5-star rating system
- Written reviews
- Public/private visibility

#### BlogPost
Content management for blog articles.

**Features:**
- SEO-friendly slugs
- Featured post management
- Rich content support
- Author attribution

#### SiteSettings
Configurable site-wide settings.

**Examples:**
- Studio address and contact info
- Operating hours
- Feature toggles
- Pricing configurations

## Enums

### MembershipType
- `FREE` - Basic access to free content
- `BASIC` - Limited access to premium content
- `PREMIUM` - Full access to most content
- `UNLIMITED` - Complete access including live classes

### MembershipStatus
- `ACTIVE` - Currently active subscription
- `CANCELLED` - Cancelled but active until period end
- `PAST_DUE` - Payment failed, grace period
- `TRIALING` - In trial period
- `INCOMPLETE` / `INCOMPLETE_EXPIRED` - Payment setup issues
- `UNPAID` - Suspended due to non-payment

### VideoCategory / Class Types
- `VINYASA` - Dynamic flowing sequences
- `HATHA` - Traditional slower-paced yoga
- `YIN` - Passive, long-held poses
- `RESTORATIVE` - Gentle, relaxing practice
- `MEDITATION` - Mindfulness and meditation
- `BREATHWORK` - Pranayama focused sessions
- `POWER` - Intense, strength-building classes
- `GENTLE` - Accessible for all abilities

### DifficultyLevel
- `BEGINNER` - New to yoga
- `INTERMEDIATE` - Some experience
- `ADVANCED` - Experienced practitioners
- `ALL_LEVELS` - Suitable for everyone

## Database Setup

### Prerequisites

1. **PostgreSQL Database**
   - Local installation OR
   - Cloud provider (Supabase, Neon, Railway, etc.)

2. **Environment Variables**
   Copy `.env.database.example` to `.env` and configure:
   ```bash
   DATABASE_URL="postgresql://username:password@localhost:5432/wingspan_yoga"
   ```

### Development Setup

1. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```

2. **Push Schema to Database**
   ```bash
   npm run db:push
   ```
   *Use for development. Creates tables without migration files.*

3. **Seed Database with Sample Data**
   ```bash
   npm run db:seed
   ```

4. **Open Prisma Studio** (Optional)
   ```bash
   npm run db:studio
   ```
   *Visual database browser at http://localhost:5555*

### Production Setup

1. **Create Migration**
   ```bash
   npm run db:migrate
   ```
   *Creates migration files for version control*

2. **Deploy to Production**
   ```bash
   npm run db:deploy
   ```
   *Applies migrations to production database*

## Sample Data

The seed script creates:

- **2 Instructors**: Sarah Johnson (Vinyasa specialist) and Michael Chen (Restorative specialist)
- **2 Users**: Demo accounts with different membership levels
- **2 Videos**: Morning Vinyasa Flow and Gentle Yin Yoga
- **2 Classes**: Power Vinyasa (studio) and Restorative (online)
- **Sample bookings, progress tracking, and reviews**
- **Blog post**: Getting Started with Yoga guide
- **Site settings**: Studio address and contact information

## Key Relationships

```
User ←→ Subscription (1:1)
User ←→ Bookings (1:many)
User ←→ VideoProgress (1:many)
User ←→ Reviews (1:many)

Instructor ←→ Classes (1:many)
Instructor ←→ Videos (1:many)

Class ←→ Bookings (1:many)
Video ←→ VideoProgress (1:many)
Video ←→ Reviews (1:many)

Subscription ←→ Payments (1:many)
```

## Security Considerations

- Passwords are hashed using bcryptjs (12 rounds)
- JWT tokens for session management
- Email verification for account activation
- Role-based access control through membership tiers
- Soft deletion patterns for data retention

## Performance Optimizations

- Indexed foreign keys for fast lookups
- Composite unique constraints to prevent duplicates
- Efficient pagination support
- Connection pooling via Prisma
- Read replicas support (when configured)

## Future Enhancements

Potential schema extensions:

- Workshop and retreat management
- Loyalty points system
- Referral tracking
- Advanced analytics tables
- Multi-location support
- Equipment rental tracking
- Waitlist automation
- Advanced scheduling (recurring classes)

---

For implementation details and API integration, see the main project documentation.
