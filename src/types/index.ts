// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  membershipType: MembershipType;
  membershipStatus: MembershipStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type MembershipType = 'free' | 'basic' | 'premium' | 'unlimited';
export type MembershipStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';

// Video and Content Types
export interface Video {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  thumbnailUrl: string;
  videoUrl: string;
  category: VideoCategory;
  instructor: Instructor;
  difficulty: DifficultyLevel;
  tags: string[];
  membershipRequired: MembershipType;
  createdAt: Date;
  updatedAt: Date;
}

export interface Instructor {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  specialties: string[];
}

export type VideoCategory =
  | 'vinyasa'
  | 'hatha'
  | 'yin'
  | 'restorative'
  | 'meditation'
  | 'breathwork';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// Class and Booking Types
export interface Class {
  id: string;
  title: string;
  description: string;
  instructor: Instructor;
  startTime: Date;
  endTime: Date;
  capacity: number;
  enrolled: number;
  price: number;
  difficulty: DifficultyLevel;
  category: VideoCategory;
  location: 'studio' | 'online';
  status: ClassStatus;
}

export type ClassStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  classId: string;
  status: BookingStatus;
  bookedAt: Date;
  cancelledAt?: Date;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed' | 'no_show';

// Subscription and Payment Types
export interface SubscriptionPlan {
  id: string;
  stripePriceId: string;
  interval: BillingInterval;
  amount: number; // in smallest currency unit
  currency: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: MembershipStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  rawStripeData?: unknown; // JSON blob
  createdAt: Date;
  updatedAt: Date;
  plan?: SubscriptionPlan;
}

export type BillingInterval = 'monthly' | 'yearly';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface BookingForm {
  classId: string;
  paymentMethodId?: string;
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Retreat Types
export interface Retreat {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number; // in cents
  depositPrice: number; // in cents
  capacity: number;
  images: string[];
  availableSpots: number;
  isFull: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RetreatBooking {
  id: string;
  userId: string;
  retreatId: string;
  totalPrice: number; // in cents
  amountPaid: number; // in cents
  paymentStatus: RetreatPaymentStatus;
  depositPaidAt?: Date;
  balanceDueDate: Date;
  finalPaidAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  retreat?: Retreat;
}

export type RetreatPaymentStatus = 
  | 'PENDING'
  | 'DEPOSIT_PAID'
  | 'PAID_IN_FULL'
  | 'CANCELLED'
  | 'REFUNDED';

export interface RetreatBookingForm {
  retreatId: string;
  notes?: string;
}
