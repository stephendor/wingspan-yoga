// Site Configuration
export const SITE_CONFIG = {
  name: 'Wingspan Yoga',
  description:
    'Transform your practice with our online yoga classes and in-studio sessions.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  author: 'Wingspan Yoga Studio',
  keywords: ['yoga', 'meditation', 'wellness', 'fitness', 'mindfulness'],
} as const;

// Membership Plans
export const MEMBERSHIP_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: '',
    features: [
      'Access to free content',
      'Community support',
      'Basic meditation guides',
    ],
    videoAccess: ['free'],
    classBookingLimit: 0,
  },
  basic: {
    name: 'Basic',
    price: 19.99,
    priceId: process.env.STRIPE_BASIC_PRICE_ID || '',
    features: [
      'Access to basic video library',
      'Monthly live classes',
      'Email support',
      'Mobile app access',
    ],
    videoAccess: ['free', 'basic'],
    classBookingLimit: 4,
  },
  premium: {
    name: 'Premium',
    price: 39.99,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || '',
    features: [
      'Access to premium video library',
      'Weekly live classes',
      'Priority support',
      'Downloadable content',
      'Personalized recommendations',
    ],
    videoAccess: ['free', 'basic', 'premium'],
    classBookingLimit: 12,
  },
  unlimited: {
    name: 'Unlimited',
    price: 69.99,
    priceId: process.env.STRIPE_UNLIMITED_PRICE_ID || '',
    features: [
      'Unlimited access to all content',
      'Unlimited live classes',
      '1-on-1 sessions',
      'Priority support',
      'Exclusive workshops',
      'Advanced analytics',
    ],
    videoAccess: ['free', 'basic', 'premium', 'unlimited'],
    classBookingLimit: -1, // unlimited
  },
} as const;

// Video Categories
export const VIDEO_CATEGORIES = {
  vinyasa: {
    name: 'Vinyasa Flow',
    description: 'Dynamic sequences linking breath and movement',
    color: '#FF6B6B',
  },
  hatha: {
    name: 'Hatha',
    description: 'Slower-paced practice focusing on alignment',
    color: '#4ECDC4',
  },
  yin: {
    name: 'Yin Yoga',
    description: 'Passive poses held for longer periods',
    color: '#45B7D1',
  },
  restorative: {
    name: 'Restorative',
    description: 'Deeply relaxing and healing practice',
    color: '#96CEB4',
  },
  meditation: {
    name: 'Meditation',
    description: 'Mindfulness and breathing practices',
    color: '#FFEAA7',
  },
  breathwork: {
    name: 'Breathwork',
    description: 'Focused breathing techniques and exercises',
    color: '#DDA0DD',
  },
} as const;

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  beginner: {
    name: 'Beginner',
    description: 'Perfect for those new to yoga',
    color: '#A8E6CF',
  },
  intermediate: {
    name: 'Intermediate',
    description: 'For practitioners with some experience',
    color: '#FFD93D',
  },
  advanced: {
    name: 'Advanced',
    description: 'Challenging practice for experienced yogis',
    color: '#FF6B6B',
  },
} as const;

// Navigation
export const MAIN_NAV = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'Classes',
    href: '/classes',
  },
  {
    title: 'Videos',
    href: '/videos',
  },
  {
    title: 'Instructors',
    href: '/instructors',
  },
  {
    title: 'Pricing',
    href: '/pricing',
  },
  {
    title: 'About',
    href: '/about',
  },
  {
    title: 'Contact',
    href: '/contact',
  },
] as const;

// Footer Links
export const FOOTER_LINKS = {
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Instructors', href: '/instructors' },
    { name: 'Contact', href: '/contact' },
    { name: 'Blog', href: '/blog' },
  ],
  practice: [
    { name: 'Class Schedule', href: '/classes' },
    { name: 'Video Library', href: '/videos' },
    { name: 'Membership', href: '/pricing' },
    { name: 'Gift Cards', href: '/gift-cards' },
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Refund Policy', href: '/refund' },
  ],
} as const;

// API Routes
export const API_ROUTES = {
  auth: {
    login: '/api/auth/login',
    signup: '/api/auth/signup',
    logout: '/api/auth/logout',
    verify: '/api/auth/verify',
  },
  user: {
    profile: '/api/user/profile',
    subscription: '/api/user/subscription',
    bookings: '/api/user/bookings',
  },
  videos: {
    list: '/api/videos',
    single: (id: string) => `/api/videos/${id}`,
    stream: (id: string) => `/api/videos/${id}/stream`,
  },
  classes: {
    list: '/api/classes',
    single: (id: string) => `/api/classes/${id}`,
    book: (id: string) => `/api/classes/${id}/book`,
  },
  payments: {
    createSubscription: '/api/payments/subscription',
    cancelSubscription: '/api/payments/subscription/cancel',
    updatePaymentMethod: '/api/payments/payment-method',
  },
} as const;

// Validation Constants
export const VALIDATION = {
  password: {
    minLength: 8,
    maxLength: 128,
  },
  name: {
    minLength: 2,
    maxLength: 50,
  },
  email: {
    maxLength: 254,
  },
  message: {
    minLength: 10,
    maxLength: 1000,
  },
} as const;
