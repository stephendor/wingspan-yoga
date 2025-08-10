import { z } from 'zod'

// Booking form validation schema
export const bookingFormSchema = z.object({
  classId: z.string().min(1, 'Class ID is required'),
  notes: z.string().optional(),
  
  // Contact information (for non-authenticated users)
  email: z.string().email('Please enter a valid email address').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  
  // Emergency contact (optional)
  emergencyContact: z.string().optional(),
  
  // Terms and conditions
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  
  // Marketing consent (optional)
  marketingConsent: z.boolean().optional(),
})

export type BookingFormData = z.infer<typeof bookingFormSchema>

// Payment intent creation schema
export const createPaymentIntentSchema = z.object({
  classId: z.string().min(1, 'Class ID is required'),
  amount: z.number().int().positive('Amount must be positive'),
  currency: z.string().min(3).max(3).default('usd'),
})

export type CreatePaymentIntentData = z.infer<typeof createPaymentIntentSchema>

// Booking confirmation schema
export const confirmBookingSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
  classId: z.string().min(1, 'Class ID is required'),
  notes: z.string().optional(),
})

export type ConfirmBookingData = z.infer<typeof confirmBookingSchema>

// Booking cancellation schema
export const cancelBookingSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  reason: z.string().optional(),
})

export type CancelBookingData = z.infer<typeof cancelBookingSchema>

// Booking query schema for API endpoints
export const bookingQuerySchema = z.object({
  userId: z.string().optional(),
  classId: z.string().optional(),
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW', 'WAITLIST']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.string().transform(val => parseInt(val)).default('50'),
  offset: z.string().transform(val => parseInt(val)).default('0'),
})

export type BookingQueryData = z.infer<typeof bookingQuerySchema>

// Class availability check
export const availabilityCheckSchema = z.object({
  classId: z.string().min(1, 'Class ID is required'),
})

export type AvailabilityCheckData = z.infer<typeof availabilityCheckSchema>

// Booking notification preferences
export const notificationPreferencesSchema = z.object({
  emailReminders: z.boolean().default(true),
  smsReminders: z.boolean().default(false),
  reminderTime: z.enum(['24h', '4h', '1h', '30m']).default('24h'),
})

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>

// Full booking with user and class data schema (for API responses)
export const bookingWithDetailsSchema = z.object({
  id: z.string(),
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW', 'WAITLIST']),
  bookedAt: z.date(),
  cancelledAt: z.date().nullable(),
  notes: z.string().nullable(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  class: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    startTime: z.date(),
    endTime: z.date(),
    price: z.number(),
    location: z.enum(['STUDIO', 'ONLINE', 'HYBRID']),
    instructor: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    }),
  }),
})

export type BookingWithDetails = z.infer<typeof bookingWithDetailsSchema>