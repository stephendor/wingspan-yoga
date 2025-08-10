# Wingspan Yoga Website Rebranding – Product Requirements Document

## 1. introduction

This Product Requirements Document (PRD) defines the detailed functional, technical, and design specifications for the rebranding of the Wingspan Yoga website. The primary objective is to modernize the existing site, introduce a subscription-based members-only area with video courses, and enhance the booking and event registration process. This document will serve as the single source of truth for stakeholders, designers, developers, and QA teams to ensure a consistent and successful implementation.

## 2. product overview

Wingspan Yoga is a yoga studio offering classes, workshops, and retreats. The current website requires a complete rebrand to reflect modern wellness trends, improve user experience, and expand digital offerings. The new platform will:

- Embrace a nature-inspired, vibrant visual identity
- Integrate class scheduling, booking, and payment systems
- Introduce a secure, tiered membership model with exclusive video content
- Provide a scalable foundation for future expansion

## 3. goals and objectives

### 3.1 business goals

- Create a professional, modern online presence
- Launch a subscription-based revenue stream
- Increase student engagement and retention
- Streamline booking processes for classes, workshops, and retreats
- Improve SEO visibility and conversion rates

### 3.2 measurable objectives

- Achieve >20% increase in online bookings within 6 months
- Acquire 200+ paying members in the first year
- Maintain Lighthouse performance scores >90
- Reduce bounce rate by 15% from current baseline

## 4. target audience

### 4.1 primary audience

- Current yoga students
- Prospective students seeking online and in-person classes

### 4.2 secondary audience

- Retreat attendees (local and international)
- Wellness enthusiasts seeking at-home yoga resources
- Returning members seeking new digital services

### 4.3 user characteristics

- Ages 25–55
- Health-conscious, interested in mindfulness and personal growth
- Mobile-first browsing habits
- Willingness to pay for quality, trustworthy wellness services

## 5. features and requirements

### 5.1 core website

- Homepage with hero imagery/video, featured offerings, testimonials, newsletter signup
- Class schedule with interactive filters and online booking
- Workshops/events module with payment, early bird pricing, and capacity management
- Retreat showcase with itineraries, galleries, and booking
- About/philosophy page

### 5.2 membership

- Secure login and personalized dashboard
- Tiered subscription plans with Stripe integration
- Video library with search, filters, progress tracking, and download options
- Member discounts on workshops and retreats

### 5.3 content management

- Blog/resources section with tagging, comments, SEO tools
- Email marketing integration (Mailchimp/ConvertKit)
- Instructor bios and teaching philosophy

### 5.4 integrations

- Google Calendar sync
- Zoom for online classes
- Social media embedding (Instagram feed)
- WhatsApp business contact
- Payment processing via Stripe

### 5.5 security and compliance

- SSL/TLS everywhere
- GDPR compliance
- PCI compliance for payments
- Signed URLs for video protection

## 6. user stories and acceptance criteria – full traceability matrix

| ID     | User Story                                                                    | Acceptance Criteria                                                                            | Functional Requirements                                                  | Technical Requirements                                                                                               | Design Requirements                                                                 |
| ------ | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| ST-101 | As a visitor, I want to view upcoming classes so I can choose a session       | Calendar loads in ≤2s; filters by type, level, and instructor; displays real-time availability | Class schedule with filter and availability display; booking integration | Next.js dynamic rendering; PostgreSQL class table with availability; Prisma queries; API routes with filtering logic | Responsive interactive calendar; clear filter controls; accessible table/list view  |
| ST-102 | As a student, I want to book a class online so I can reserve my spot          | Booking process ≤3 clicks; secure payment via Stripe; confirmation email sent within 2 min     | Booking form with validation; payment processing; confirmation email     | React Hook Form + Zod; Stripe API integration; SendGrid email API                                                    | Simple, minimal form; clear payment CTA; confirmation message visible and styled    |
| ST-103 | As a member, I want to log in securely to access exclusive content            | Authentication with NextAuth.js/Clerk; password hashing; optional 2FA; session expiry 24h      | Secure login form; session management; 2FA option                        | NextAuth.js with JWT; bcrypt or argon2 hashing; Clerk 2FA module                                                     | Clear login UI; error messaging; password visibility toggle; accessible form labels |
| ST-104 | As a member, I want to watch video courses so I can practice at home          | Video loads ≥720p with adaptive streaming; progress tracking; download option for offline      | Video library; progress tracking table; download button                  | Vimeo/Mux API with signed URLs; PostgreSQL video progress table; IndexedDB for offline storage                       | Clean grid layout; category filters; responsive video player; progress bar display  |
| ST-105 | As an admin, I want to manage classes via a dashboard                         | CRUD operations for class schedule; validation; instant calendar update                        | Admin dashboard with schedule manager                                    | Next.js admin route protection; Prisma CRUD mutations; optimistic UI updates                                         | Sidebar navigation; form validation messages; consistent admin styling              |
| ST-106 | As an instructor, I want to view my personal schedule                         | Personal schedule filtered by instructor ID; student list per class                            | Instructor portal; schedule view                                         | Authenticated instructor role; query filtering by user ID                                                            | Simple dashboard; compact list view; printable/exportable option                    |
| ST-107 | As a visitor, I want to register for a retreat with a deposit                 | Deposit payment accepted; remaining balance reminders emailed 30 days and 7 days before        | Retreat booking form; partial payment option; automated reminder system  | Stripe partial payment setup; scheduled jobs via cron or serverless scheduler; SendGrid API                          | Immersive retreat pages; clear payment breakdown; countdown to retreat date         |
| ST-108 | As a marketing manager, I want to send newsletters                            | Newsletter templates; segmentation; automated send schedules                                   | Newsletter creation tool; contact segmentation                           | Mailchimp/ConvertKit API; Next.js admin panel integration                                                            | Branded templates; responsive email design; clear unsubscribe link                  |
| ST-109 | As a user, I want to cancel my subscription                                   | Cancellation in ≤3 clicks; immediate payment stop; confirmation email                          | Subscription management dashboard                                        | Stripe subscription API; webhook listener to update membership table                                                 | Simple cancel/confirm modal; clear messaging about benefits lost                    |
| ST-110 | As a developer, I want to model the database for classes, members, and videos | ERD documented; schema migrations tested; relationships validated                              | Database schema design; migration scripts                                | PostgreSQL with Prisma schema; ER diagram in documentation                                                           | N/A (backend only)                                                                  |

## 7. technical requirements / stack

### 7.1 frontend

- Next.js 14+, Tailwind CSS, React Context API or Zustand, Framer Motion
- Responsive, mobile-first layouts
- React Hook Form with Zod validation

### 7.2 backend

- Next.js API routes
- PostgreSQL + Prisma ORM (Supabase/Neon)
- Authentication: NextAuth.js or Clerk
- Payment: Stripe
- Email: SendGrid or Resend
- Video hosting: Vimeo or Mux (signed URLs)

### 7.3 infrastructure

- GitHub version control
- Deployment: Netlify with Edge functions
- Image optimization via Next.js Image + Netlify CDN
- Analytics: GA4 + Netlify Analytics

### 7.4 performance/security

- FCP <1.5s, TTI <3.5s, CLS <0.1
- Weekly backups
- Rate limiting on APIs
- WCAG 2.1 AA compliance

## 8. design and user interface

### 8.1 visual identity

- Primary palette: sage green, soft blues, warm neutrals
- Accents: terracotta, blush, charcoal
- Typography: Montserrat/Raleway (headers), Open Sans/Lato (body), optional handwritten font for accents
- Organic shapes and natural imagery

### 8.2 layout principles

- Minimalist with generous white space
- Micro-animations for hover and scroll
- Clear hierarchy and CTAs
- Optimized for mobile gestures and quick navigation

### 8.3 accessibility

- High color contrast (≥4.5:1)
- Screen reader labels
- Skip navigation links
- Captions/transcripts for all video

---

## 9. sprint backlog with story points, dependencies, and milestones

| Story ID | Sprint | Story Points | Dependencies   | Milestone / Deliverable                   |
| -------- | ------ | ------------ | -------------- | ----------------------------------------- |
| ST-110   | 1      | 3            | None           | Database schema complete and documented   |
| ST-101   | 1      | 5            | ST-110         | Class schedule UI with filtering          |
| ST-102   | 2      | 8            | ST-101, ST-110 | Fully functional booking flow with Stripe |
| ST-103   | 2      | 5            | ST-110         | Secure authentication live                |
| ST-105   | 2      | 5            | ST-103, ST-101 | Admin dashboard basic CRUD for classes    |
| ST-104   | 3      | 8            | ST-103, ST-110 | Video library with progress tracking      |
| ST-106   | 3      | 3            | ST-105         | Instructor portal with schedule view      |
| ST-107   | 3      | 5            | ST-102, ST-103 | Retreat booking with partial payment      |
| ST-108   | 4      | 5            | ST-103         | Newsletter system with templates          |
| ST-109   | 4      | 3            | ST-103         | Subscription cancel/modify flow           |

**Sprint durations**: 2 weeks each  
**Velocity target**: ~20 points per sprint

---

## 10. milestone timeline (12 weeks total)

- **Sprint 1 (Weeks 1–2)**: Database schema (ST-110), class schedule display (ST-101)
- **Sprint 2 (Weeks 3–4)**: Booking flow with Stripe (ST-102), authentication (ST-103), admin dashboard (ST-105)
- **Sprint 3 (Weeks 5–6)**: Video library (ST-104), instructor portal (ST-106), retreat booking (ST-107)
- **Sprint 4 (Weeks 7–8)**: Newsletter system (ST-108), subscription management (ST-109)
- **Weeks 9–10**: QA testing, performance optimization, bug fixes
- **Weeks 11–12**: Soft launch, feedback iteration, full launch

---
