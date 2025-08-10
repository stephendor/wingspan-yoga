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
export interface Subscription {
  id: string;
  userId: string;
  plan: MembershipType;
  status: MembershipStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string;
  priceId: string;
}

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
export interface ApiResponse<T = any> {
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
